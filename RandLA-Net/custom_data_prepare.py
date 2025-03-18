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
# np.set_printoptions(threshold=np.inf, suppress=True)


# for scan_id in tqdm(scan_list, desc="Processing scans", ncols=80):
#     # print('preparing',scan_id)
#     points = DP.load_pc_kitti(join(dataset_path, scan_id))
#     # print('\n\n\n\point',points)
#     sub_points =points
#     sub_points = DP.grid_sub_sampling(points, grid_size=0.06)
#     # print('sub_points',sub_points.shape)
#     # sub_points = sub_points[np.isfinite(sub_points).all(axis=1)]
#     max_float32 = np.finfo(np.float32).max
#     min_float32 = np.finfo(np.float32).min

#     # Replace inf with the largest float32 value and -inf with the smallest float32 value
#     sub_points[np.isinf(sub_points)] = np.where(sub_points > 0, max_float32, min_float32)
#     print('sub_points',sub_points)
#     # print('sub_points',sub_points.shape)

#     search_tree = KDTree(sub_points)
#     # print('search_tree',search_tree.data)

#     proj_inds = np.squeeze(search_tree.query(points, return_distance=False))
#     proj_inds = proj_inds.astype(np.int32)
#     KDTree_save = join(KDTree_path_out, str(scan_id[:-4]) + '.pkl')
#     proj_save = join(proj_path, str(scan_id[:-4]) + '_proj.pkl')
#     np.save(join(pc_path, scan_id)[:-4], sub_points)
#     with open(KDTree_save, 'wb') as f:
#         pickle.dump(search_tree, f)
#     with open(proj_save, 'wb') as f:
#         pickle.dump([proj_inds], f)
for scan_id in tqdm(scan_list, desc="Processing scans", ncols=80):
# Load the point cloud
    points = DP.load_pc_kitti(join(dataset_path, scan_id))

    # Perform grid subsampling
    sub_points = DP.grid_sub_sampling(points, grid_size=0.06)

    # Replace inf and -inf with the largest and smallest float32 values
    max_float32 = np.finfo(np.float32).max
    min_float32 = np.finfo(np.float32).min
    inf_mask = np.isinf(sub_points)  # Create a mask for inf values

    sub_points[inf_mask] = np.where(sub_points[inf_mask] > 0, max_float32, min_float32)

    # Print the shape or check values to ensure the process is correct
    # print(f"Processed {scan_id}, sub_points shape: {sub_points.shape}")

    # Build the KDTree with the subsampled points
    search_tree = KDTree(sub_points)

    # Query the original points (if that's the intended behavior)
    proj_inds = np.squeeze(search_tree.query(points, return_distance=False))

    # Ensure indices are integers
    proj_inds = proj_inds.astype(np.int32)

    # Save the KDTree and projection indices
    KDTree_save = join(KDTree_path_out, f"{scan_id[:-4]}.pkl")
    proj_save = join(proj_path, f"{scan_id[:-4]}_proj.pkl")

    # Save the subsampled points to a .npy file
    np.save(join(pc_path, scan_id[:-4]), sub_points)

    # Save the KDTree and projection indices to pickle files
    with open(KDTree_save, 'wb') as f:
        pickle.dump(search_tree, f)

    with open(proj_save, 'wb') as f:
        pickle.dump([proj_inds], f)

    # print(f"Finished processing {scan_id}")
