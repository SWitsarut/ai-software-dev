import argparse
import pickle, yaml, os, sys
import numpy as np
from os.path import join, exists, dirname, abspath
from sklearn.neighbors import KDTree
from tqdm import tqdm 

BASE_DIR = dirname(abspath(__file__))
ROOT_DIR = dirname(BASE_DIR)
sys.path.append(BASE_DIR)
sys.path.append(ROOT_DIR)
from helper_tool import DataProcessing as DP

parser = argparse.ArgumentParser()
parser.add_argument('--data', type=str, help='input file')
parser.add_argument('--grid_size', type=float,default=0.06,help='grid size')
parser.add_argument('--output', type=str,help='output path')
# parser.add_argument('--data', type=str, default=cfg.data_dir, help='the number of GPUs to use [default: 0]')
# parser.add_argument('--output', type=str, help='options: train, test, vis')


FLAGS = parser.parse_args()

indata = FLAGS.data
grid_size = FLAGS.grid_size
# data_out = FLAGS.data_output



data_config = os.path.join(BASE_DIR,'utils/semantic-kitti.yaml')
print('data_config',data_config)
DATA = yaml.safe_load(open(data_config, 'r'))
remap_dict = DATA["learning_map"]
max_key = max(remap_dict.keys())
remap_lut = np.zeros((max_key + 100), dtype=np.int32)
remap_lut[list(remap_dict.keys())] = list(remap_dict.values())

grid_size = FLAGS.grid_size
dataset_path = FLAGS.data
output_path = (
    dataset_path+'_prepared_'+str(grid_size) if FLAGS.output is None else FLAGS.output
)

os.makedirs(output_path) if not exists(output_path) else None


scan_list = np.sort(os.listdir(dataset_path))
KDTree_path_out =  join(output_path,'KDTree')
os.makedirs(KDTree_path_out) if not exists(KDTree_path_out) else None
proj_path =join(output_path,'proj')
os.makedirs(proj_path) if not exists(proj_path) else None
pc_path = join(output_path,'velodyne')
os.makedirs(pc_path) if not exists(pc_path) else None

print('start preparing data ')
print('output dir:',output_path)
print('KDTree_path_out dir:',KDTree_path_out)
print('proj_path dir:',proj_path)
print('velodyne dir:',pc_path)
print('\n\n')


for scan_id in tqdm(scan_list, desc="Processing scans", ncols=80):
    points = DP.load_pc_kitti(join(dataset_path, scan_id))
    sub_points = DP.grid_sub_sampling(points, grid_size=0.06)
    search_tree = KDTree(sub_points)
    proj_inds = np.squeeze(search_tree.query(points, return_distance=False))
    proj_inds = proj_inds.astype(np.int32)
    KDTree_save = join(KDTree_path_out, f"{scan_id[:-4]}.pkl")
    proj_save = join(proj_path, f"{scan_id[:-4]}_proj.pkl")
    np.save(join(pc_path, scan_id[:-4]), sub_points)
    with open(KDTree_save, 'wb') as f:
        pickle.dump(search_tree, f)

    with open(proj_save, 'wb') as f:
        pickle.dump([proj_inds], f)
