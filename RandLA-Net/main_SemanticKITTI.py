from helper_tool import DataProcessing as DP
from helper_tool import ConfigSemanticKITTI as cfg
from helper_tool import Plot
from os.path import join
from RandLANet import Network
from tester_SemanticKITTI import ModelTester
import tensorflow as tf
import numpy as np
import os, argparse, pickle



class SemanticKITTI:
    def __init__(self,data_path):
        self.name = 'SemanticKITTI'
        # self.dataset_path = './data/semantic_kitti/dataset/sequences_0.06/11'
        self.dataset_path = data_path
        self.outname = data_path
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
                               19: 'traffic-sign'
                               }
        self.num_classes = len(self.label_to_names)
        self.label_values = np.sort([k for k, v in self.label_to_names.items()])
        self.label_to_idx = {l: i for i, l in enumerate(self.label_values)}
        self.ignored_labels = np.sort([0])
        
        self.val_split = '08'

        self.seq_list = np.sort(os.listdir(self.dataset_path))
        self.test_scan_number = '14'
        # self.train_list, self.val_list, self.test_list = DP.get_file_list(self.dataset_path,
        #                                                                   self.test_scan_number)
        pc_path = os.path.join(self.dataset_path, "velodyne")
        test_list = []
        test_list.extend([os.path.join(pc_path, f) for f in np.sort(os.listdir(pc_path))])
        self.test_list = test_list
        print(self.test_list)


        self.possibility = []
        self.min_possibility = []
        self.init_input_pipeline()


    # Generate the input data flow
    def get_batch_gen(self, split):
        if split == 'test':
            num_per_epoch = int(len(self.test_list) / cfg.val_batch_size) * cfg.val_batch_size * 4
            path_list = self.test_list
            for test_file_name in path_list:
                points = np.load(test_file_name)
                self.possibility += [np.random.rand(points.shape[0]) * 1e-3]
                self.min_possibility += [float(np.min(self.possibility[-1]))]

        def spatially_regular_gen():
            # Generator loop
            for i in range(num_per_epoch):
                if split != 'test':
                    cloud_ind = i
                    pc_path = path_list[cloud_ind]
                    pc, tree, labels = self.get_data(pc_path)
                    # crop a small point cloud
                    pick_idx = np.random.choice(len(pc), 1)
                    selected_pc, selected_labels, selected_idx = self.crop_pc(pc, labels, tree, pick_idx)
                else:
                    cloud_ind = int(np.argmin(self.min_possibility))
                    pick_idx = np.argmin(self.possibility[cloud_ind])
                    pc_path = path_list[cloud_ind]
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

    def get_data(self, file_path):
        seq_id = file_path.split('/')[-3]
        frame_id = file_path.split('/')[-1][:-4]
        kd_tree_path = join(self.dataset_path, 'KDTree', frame_id + '.pkl')
        # Read pkl with search tree
        with open(kd_tree_path, 'rb') as f:
            search_tree = pickle.load(f)
        points = np.array(search_tree.data, copy=False)
        # Load labels
        # if int(seq_id) >= 11:
        labels = np.zeros(np.shape(points)[0], dtype=np.uint8)
        # else:
        #     label_path = join(self.dataset_path, 'labels', frame_id + '.npy')
        #     labels = np.squeeze(np.load(label_path))
        return points, search_tree, labels

    @staticmethod
    def crop_pc(points, labels, search_tree, pick_idx):
        center_point = points[pick_idx, :].reshape(1, -1)
        select_idx = search_tree.query(center_point, k=cfg.num_points)[1][0]
        select_idx = DP.shuffle_idx(select_idx)
        select_points = points[select_idx]
        select_labels = labels[select_idx]
        return select_points, select_labels, select_idx

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

    def init_input_pipeline(self):
        print('Initiating input pipelines')
        cfg.ignored_label_inds = [self.label_to_idx[ign_label] for ign_label in self.ignored_labels]
        gen_function_val, _, _ = self.get_batch_gen('validation')
        gen_function_test, gen_types, gen_shapes = self.get_batch_gen('test')
        
        print('Initiating input pipelines 1')
        self.test_data = tf.data.Dataset.from_generator(gen_function_test, gen_types, gen_shapes)

        print('Initiating input pipelines 2')
        self.batch_test_data = self.test_data.batch(cfg.val_batch_size)
        
        print('Initiating input pipelines 3')
        map_func = self.get_tf_mapping2()
        print('Initiating input pipelines 4')
        self.batch_test_data = self.batch_test_data.map(map_func=map_func)
        print('Initiating input pipelines 5')
        self.batch_test_data = self.batch_test_data.prefetch(cfg.val_batch_size)
        print('Initiating input pipelines 6')
        iter = tf.data.Iterator.from_structure(self.batch_test_data.output_types, self.batch_test_data.output_shapes)

        self.flat_inputs = iter.get_next()
        self.test_init_op = iter.make_initializer(self.batch_test_data)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    FLAGS = parser.parse_args()

    os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"
    os.environ['CUDA_VISIBLE_DEVICES'] = str(FLAGS.gpu)
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
    
    dataset = SemanticKITTI("./data/semantic_kitti/dataset/sequences_0.06/08","08_dataset_as_params")
    print('init_input_pipeline done!')

    cfg.saving = False
    model = Network(dataset, cfg)
    chosen_snap = './model/snap-277357'
    tester = ModelTester(model, dataset, restore_snap=chosen_snap)
    tester.test(model, dataset)
