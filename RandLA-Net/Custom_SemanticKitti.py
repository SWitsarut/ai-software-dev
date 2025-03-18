from helper_tool import DataProcessing as DP
from custom_config import ConfigSemanticKITTI as cfg
from RandLANet import Network
from tester_SemanticKITTI import ModelTester
import tensorflow as tf
import numpy as np
import os, argparse, pickle
from os.path import join
from sklearn.neighbors import KDTree




class SemanticKITTI:
    def __init__(self, test_list):
        self.label_to_names = {0: 'unlabeled',
                               1: 'car',
                               2: 'bicycle',
                               3: 'motorcycle',
                               4: 'truck',
                               5: 'other-vehicle',
                               6: 'person',
                               7: 'bicyclist',
                               8: 'motorcyclist',
                               9: 'road',
                               10: 'parking',
                               11: 'sidewalk',
                               12: 'other-ground',
                               13: 'building',
                               14: 'fence',
                               15: 'vegetation',
                               16: 'trunk',
                               17: 'terrain',
                               18: 'pole',
                               19: 'traffic-sign'}
        # self.label_to_names = {
        #                 18: 'pole',
        #                 19: 'traffic-sign'
        #                 }

        self.num_classes = len(self.label_to_names)
        self.label_values = np.sort([k for k, v in self.label_to_names.items()])
        self.label_to_idx = {l: i for i, l in enumerate(self.label_values)}


        self.name = "SemanticKITTI"
        self.dataset_path = cfg.data_dir
        self.test_list = test_list
        print('\n\n\n\ntest_list',self.test_list)
        # self.test_scan_number = str(test_id)
        self.test_scan_number = "hello"
        # _, _, self.test_list = DP.get_file_list(self.dataset_path, self.test_scan_number)
        self.possibility = []
        self.min_possibility = []
        self.ignored_labels = np.sort([0])

    def get_batch_gen(self):
    
        # num_per_epoch = int(len(self.test_list) / cfg.val_batch_size) * cfg.val_batch_size * 4
        # path_list = self.test_list
        # for test_file_name in path_list:
        #     points = np.load(cfg.data_dir+"/"+test_file_name)
        #     self.possibility += [np.random.rand(points.shape[0]) * 1e-3]
        #     self.min_possibility += [float(np.min(self.possibility[-1]))]
        num_per_epoch = int(len(self.test_list) / cfg.val_batch_size) * cfg.val_batch_size * 4
        path_list = self.test_list
        for test_file_name in path_list:
            # print('try loading ',test_file_name)
            points = np.load(test_file_name)
            self.possibility += [np.random.rand(points.shape[0]) * 1e-3]
            self.min_possibility += [float(np.min(self.possibility[-1]))]

        def spatially_regular_gen():
            # Generator loop
            for i in range(num_per_epoch):
                cloud_ind = int(np.argmin(self.min_possibility))
                pick_idx = np.argmin(self.possibility[cloud_ind])
                pc_path = path_list[cloud_ind]
                # print('\n\n\n\n\npc_path',pc_path,'path_list',path_list)
                pc, tree, labels = self.get_data(pc_path)
                selected_pc, selected_labels, selected_idx = self.crop_pc(pc, labels, tree, pick_idx)

                # update the possibility of the selected pc
                dists = np.sum(np.square((selected_pc - pc[pick_idx]).astype(np.float32)), axis=1)
                delta = np.square(1 - dists / np.max(dists))
                self.possibility[cloud_ind][selected_idx] += delta
                self.min_possibility[cloud_ind] = np.min(self.possibility[cloud_ind])

                if True:
                    yield (selected_pc.astype(np.float32),
                           selected_labels.astype(np.int32),
                           selected_idx.astype(np.int32),
                           np.array([cloud_ind], dtype=np.int32))

        gen_func = spatially_regular_gen
        gen_types = (tf.float32, tf.int32, tf.int32, tf.int32)
        gen_shapes = ([None, 3], [None], [None], [None])

        return gen_func, gen_types, gen_shapes

    @staticmethod
    def get_tf_mapping2():

        def tf_map(batch_pc, batch_label, batch_pc_idx, batch_cloud_idx):
            features = batch_pc
            input_points = []
            input_neighbors = []
            input_pools = []
            input_up_samples = []

            for i in range(cfg.num_layers):
                neighbour_idx = tf.py_func(DP.knn_search, [batch_pc, batch_pc, cfg.k_n], tf.int32)
                sub_points = batch_pc[:, :tf.shape(batch_pc)[1] // cfg.sub_sampling_ratio[i], :]
                pool_i = neighbour_idx[:, :tf.shape(batch_pc)[1] // cfg.sub_sampling_ratio[i], :]
                up_i = tf.py_func(DP.knn_search, [sub_points, batch_pc, 1], tf.int32)
                input_points.append(batch_pc)
                input_neighbors.append(neighbour_idx)
                input_pools.append(pool_i)
                input_up_samples.append(up_i)
                batch_pc = sub_points

            input_list = input_points + input_neighbors + input_pools + input_up_samples
            input_list += [features, batch_label, batch_pc_idx, batch_cloud_idx]

            return input_list

        return tf_map

    # def get_data(self, file_path):
    #     points = np.from_file(file_path)
    #     points = points.reshape(-1,4)
    #     points[:,3] = 0
    #     points = np.array(points)
    #     labels = np.zeros(np.shape(points)[0], dtype=np.uint8)
    #     return points, labels
    # def get_data(self, file_path):
    #     frame_id = file_path.split('/')[-1][:-4]
    #     # print('frame_id',frame_id,'file_path',file_path,'self.dataset_path',self.dataset_path)
    #     kd_tree_path = join(self.dataset_path, 'KDTree', frame_id + '.pkl')
    #     # Read pkl with search tree
    #     with open(kd_tree_path, 'rb') as f:
    #         search_tree = pickle.load(f)
    #     points = np.array(search_tree.data, copy=False)
    #     # no labels
    #     labels = np.zeros(np.shape(points)[0], dtype=np.uint8)
        
    #     return points, search_tree, labels
    def get_data(self, file_path):
        frame_id = file_path.split('/')[-1][:-4]
        kd_tree_path = join(self.dataset_path, 'KDTree', frame_id + '.pkl')
        
        # Read pkl with search tree
        with open(kd_tree_path, 'rb') as f:
            # print('trying to load',f)
            search_tree = pickle.load(f)
        
        # Extract points from the search tree
        points = np.array(search_tree.data, copy=False)
        
        # Filter out points that are inf or -inf
        valid_points_mask = np.isfinite(points).all(axis=1)  # Mask for rows that are not inf or -inf
        points = points[valid_points_mask]  # Keep only valid points
        
        # Recreate the KDTree with the filtered points
        search_tree = KDTree(points)
        
        # No labels, set labels to zero
        labels = np.zeros(np.shape(points)[0], dtype=np.uint8)
        
        return points, search_tree, labels



    @staticmethod
    def crop_pc(points, labels, search_tree, pick_idx):
        # print('enter crop_pc')
        # print('points, labels, search_tree, pick_idx',points, labels, pick_idx)
        # crop a fixed size point cloud for training
        center_point = points[pick_idx, :].reshape(1, -1)
        # print('center_point',center_point)
        select_idx = search_tree.query(center_point, k=cfg.num_points)[1][0]
        # print('select_idx',select_idx)
        select_idx = DP.shuffle_idx(select_idx)
        select_points = points[select_idx]
        select_labels = labels[select_idx]
        # print("select_points,select_labels,select_idx",select_points,select_labels,select_idx)
        return select_points, select_labels, select_idx
    

    def init_input_pipeline(self):
        print('Initiating input pipelines')
        # cfg.ignored_label_inds = [self.label_to_idx[ign_label] for ign_label in self.ignored_labels]
        cfg.ignored_label_inds =  [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]
        gen_function_test, gen_types, gen_shapes = self.get_batch_gen()
        # print('gen_types,gen_shapes',gen_types,gen_shapes)
        self.test_data = tf.data.Dataset.from_generator(gen_function_test, gen_types, gen_shapes)

        self.batch_test_data = self.test_data.batch(cfg.val_batch_size)
        
        map_func = self.get_tf_mapping2()

        self.batch_test_data = self.batch_test_data.map(map_func=map_func)

        # print('\n\n\n\n\n\nself.batch_test_data.output_shapes',self.batch_test_data.output_shapes)

        self.batch_test_data = self.batch_test_data.prefetch(cfg.val_batch_size)
        # print('self.batch_test_data.shape',self.batch_test_data.)
        iter = tf.data.Iterator.from_structure(self.batch_test_data.output_types, self.batch_test_data.output_shapes)

        self.flat_inputs = iter.get_next()
        self.test_init_op = iter.make_initializer(self.batch_test_data)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--gpu', type=int, default=0, help='GPU to use')
    parser.add_argument('--test_area', type=int, default='14', help='Test area')
    parser.add_argument('--model_path', type=str, default='None', help='Pretrained model path')
    FLAGS = parser.parse_args()

    os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"
    os.environ['CUDA_VISIBLE_DEVICES'] = str(FLAGS.gpu)
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

    dataset = SemanticKITTI(FLAGS.test_area)
    dataset.init_test_pipeline()

    model = Network(dataset, cfg)
    tester = ModelTester(model, dataset, restore_snap=FLAGS.model_path)
    # tester.test(model, dataset)
    pred = tester.inference(dataset, False)
