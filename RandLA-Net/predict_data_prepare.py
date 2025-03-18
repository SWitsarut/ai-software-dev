import argparse
import pickle, yaml, os, sys
import numpy as np
from os.path import join, exists, dirname, abspath
from sklearn.neighbors import KDTree

BASE_DIR = dirname(abspath(__file__))
ROOT_DIR = dirname(BASE_DIR)
sys.path.append(BASE_DIR)
sys.path.append(ROOT_DIR)
from helper_tool import DataProcessing as DP

# Load dataset configuration
data_config = os.path.join(BASE_DIR, 'semantic-kitti.yaml')

# Parse command-line arguments

parser = argparse.ArgumentParser(description="Prepare SemanticKITTI Data for Prediction")
parser.add_argument('--file', type=str, required=True, help='Folder path containing point clouds')
parser.add_argument('--output', type=str, default=None, help='Output folder for processed data (optional)')
FLAGS = parser.parse_args()

pc_path = FLAGS.file  # Input point cloud directory
output_path = FLAGS.output if FLAGS.output else pc_path + '_processed'  # Default output folder

if not exists(pc_path):
    print("Error: Point cloud folder",pc_path,"does not exist!")
    sys.exit(1)

# Create output directories
os.makedirs(output_path, exist_ok=True)
KDTree_path_out = join(output_path, 'KDTree')
proj_path_out = join(output_path, 'proj')
os.makedirs(KDTree_path_out, exist_ok=True)
os.makedirs(proj_path_out, exist_ok=True)

scan_list = np.sort(os.listdir(pc_path))

for scan_id in scan_list:
    print('Processing',scan_id,'in',pc_path)
    
    # Load point cloud
    print("loading point cloud data")
    points = DP.load_pc_kitti(join(pc_path, scan_id))
    print("Loaded {} - Shape: {}, Max: {}, Min: {}".format(scan_id, points.shape, np.max(points), np.min(points)))
    print('pre grid_sub',len(points))
    print(points)

    points = DP.grid_sub_sampling(points,grid_size=0.06)
    points = points[np.isfinite(points).all(axis=1)]
    print("Loaded {} - Shape: {}, Max: {}, Min: {}".format(scan_id, points.shape, np.max(points), np.min(points)))
    print('post grid_sub',len(points))
    print(points)
    print("KDTree creating")
    # Keep full-resolution data (no subsampling)
    search_tree = KDTree(points)
    print("KDTree created")

    # Save KDTree
    KDTree_save = join(KDTree_path_out, str(scan_id[:-4]) + '.pkl')
    with open(KDTree_save, 'wb') as f:
        pickle.dump(search_tree, f)


    # Compute projection indices (for aligning predictions)
    proj_inds = np.squeeze(search_tree.query(points, return_distance=False)).astype(np.int32)
    proj_save = join(proj_path_out, str(scan_id[:-4]) + '_proj.pkl')
    with open(proj_save, 'wb') as f:
        pickle.dump([proj_inds], f)

    print("Processed",scan_id,": ",len(points)," points stored.")

print("Prediction data preparation complete!")
