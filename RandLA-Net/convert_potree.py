import argparse
import os
import subprocess
import numpy as np
import laspy
from tqdm import tqdm
from os.path import join
from read_las import read_las
from sklearn.cluster import DBSCAN
import requests


laszip_dir = os.path.abspath("./PotreeConverter_linux_x64")
os.environ['LD_LIBRARY_PATH'] = f"{laszip_dir}:{os.environ.get('LD_LIBRARY_PATH', '')}"


def load_labels(label_path):
    return np.fromfile(label_path, dtype=np.uint32)



label_mapping = {
    0: 0,    # Unlabeled
    # 1: 1,    # Outlier - unused
    10: 2,   # Car
    11: 3,   # Bicycle
    # 13: 4,   # Bus - unused
    15: 5,   # Motorcycle
    # 16: 6,   # On-rails - unused
    18: 7,   # Truck
    20: 8,   # Other vehicle
    30: 9,   # Person
    31: 10,  # Bicyclist
    32: 11,  # Motorcyclist
    40: 12,  # Road
    44: 13,  # Parking
    48: 14,  # Sidewalk
    49: 15,  # Other ground
    50: 16,  # Building
    51: 17,  # Fence
    # 52: 18,  # Other structure - unused
    # 60: 19,  # Lane marking - unused
    70: 20,  # Vegetation
    71: 21,  # Trunk
    72: 22,  # Terrain
    80: 23,  # Pole
    81: 24,  # Traffic sign
    # 99: 25,  # Other object - unused
    # 252: 26, # Moving car - unused
    # 253: 27, # Moving bicyclist - unused
    # 254: 28, # Moving person - unused
    # 255: 29, # Moving motorcyclist - unused
    # 256: 30, # Moving on-rails - unused
    # 257: 31, # Moving bus - unused
    # 258: 32, # Moving truck - unused
    # 259: 33  # Moving other vehicle - unused
}

def convert_Potree(id,las_dir):
    base_path = join("/app/public",id)
    label_path = join(base_path,'processed','prediction')
    las_output_path = join(base_path,'las')
    potree_out_path = join(base_path,'potree')
    print('id',id,'las_dir',las_dir)
    print(os.listdir(las_dir))
    for file in os.listdir(las_dir):
        os.makedirs(las_output_path, exist_ok=True)
        las_input_path = join(las_dir,file)
        label_file = join(label_path,file.replace('.las','.label'))
        labels = load_labels(label_file)
        xyz,intensity = read_las(las_input_path)
        assert xyz.shape[0] == labels.shape[0], f"Mismatch between points and labels for file {file}"
        classification = np.vectorize(lambda x: label_mapping.get(x, 0))(labels)
        header = laspy.LasHeader(point_format=1, version="1.4")
        las = laspy.LasData(header)
        # Assign values
        las.x = xyz[:, 0]
        las.y = xyz[:, 1]
        las.z = xyz[:, 2]
        las.intensity = intensity.astype(np.uint16)  # LAS stores intensity as uint16
        las.classification = classification.astype(np.uint8)  # Classification is uint8

        las_file_path = os.path.join(las_output_path, file.replace('.bin', '.las'))
        las.write(las_file_path)  # Save to LAS file
    las_files = os.listdir(las_output_path)
    for i in range(len(las_files)):
        subprocess.run([
            "./PotreeConverter_linux_x64/PotreeConverter",
            "-i", os.path.join(las_output_path, las_files[i]),
            "-o", os.path.join(potree_out_path, str(i))  # Convert i to a string
        ])


# def store_bounding_boxes_and_centroids(points, clusters, class_value, class_name, id):
#     if points is None or clusters is None:
#         print(f"No points/clusters found for class {class_name}")
#         return
    
#     unique_clusters = sorted(list(set(clusters)))
#     if -1 in unique_clusters:
#         unique_clusters.remove(-1)
    
#     print("\n" + "="*80)
#     print(f"BOUNDING BOXES AND CENTROIDS FOR CLASS {class_name}")
#     print("="*80)
    
#     for cluster_id in unique_clusters:
#         mask = clusters == cluster_id
#         cluster_points = points[mask]
        
#         min_coords = np.min(cluster_points, axis=0)
#         max_coords = np.max(cluster_points, axis=0)
        
#         centroid = np.mean(cluster_points, axis=0)
        
#         # Convert NumPy arrays to Python lists for JSON serialization
#         centroid_list = centroid.tolist()  # Convert ndarray to list

#         url = "http://express-server:8080/objects/new"
#         corners = [
#             {'x': float(min_coords[0]), 'y': float(min_coords[1]), 'z': float(min_coords[2])},  # Bottom-left
#             {'x': float(max_coords[0]), 'y': float(min_coords[1]), 'z': float(min_coords[2])},  # Bottom-right
#             {'x': float(max_coords[0]), 'y': float(max_coords[1]), 'z': float(min_coords[2])},  # Top-right
#             {'x': float(min_coords[0]), 'y': float(max_coords[1]), 'z': float(min_coords[2])},  # Top-left
#         ]

#         data = {
#             "dataId": id,
#             "centroid": centroid_list,  # Now it's a Python list
#             "objectId": class_value,
#             "cornors": corners,  # Note the typo: "cornors" instead of "corners"
#         }

#         try:
#             response = requests.post(url, json=data)
#             response.raise_for_status()  # Raise an exception for 4XX/5XX responses
#             print(f"Successfully posted cluster {cluster_id} for class {class_name}")
#         except requests.exceptions.RequestException as e:
#             print(f"Error posting cluster {cluster_id} for class {class_name}: {e}")
def store_bounding_boxes_and_centroids(points, clusters, class_value, class_name, id):
    if points is None or clusters is None:
        print(f"No points/clusters found for class {class_name}")
        return
    
    unique_clusters = sorted(list(set(clusters)))
    if -1 in unique_clusters:
        unique_clusters.remove(-1)
    
    print("\n" + "="*80)
    print(f"BOUNDING BOXES AND CENTROIDS FOR CLASS {class_name}")
    print("="*80)
    
    for cluster_id in unique_clusters:
        mask = clusters == cluster_id
        cluster_points = points[mask]
        
        min_coords = np.min(cluster_points, axis=0)
        max_coords = np.max(cluster_points, axis=0)
        
        # Calculate midpoints for more precise boundary definition
        # mid_x = (min_coords[0] + max_coords[0]) / 2
        # mid_y = (min_coords[1] + max_coords[1]) / 2
        # mid_z = min_coords[2]  # Keep z at minimum for flat representation
        
        centroid = np.mean(cluster_points, axis=0)
        
        # Convert NumPy arrays to Python lists for JSON serialization
        centroid_list = centroid.tolist()  # Convert ndarray to list
        
        url = "http://express-server:8080/objects/new"
        
        # Create 8 corners instead of 4 (clockwise order)
        # flat
        # corners = [
        #     {'x': float(min_coords[0]), 'y': float(min_coords[1]), 'z': float(min_coords[2])},  # Bottom-left
        #     {'x': float(mid_x), 'y': float(min_coords[1]), 'z': float(mid_z)},                  # Bottom-middle
        #     {'x': float(max_coords[0]), 'y': float(min_coords[1]), 'z': float(min_coords[2])},  # Bottom-right
        #     {'x': float(max_coords[0]), 'y': float(mid_y), 'z': float(mid_z)},                  # Middle-right
        #     {'x': float(max_coords[0]), 'y': float(max_coords[1]), 'z': float(min_coords[2])},  # Top-right
        #     {'x': float(mid_x), 'y': float(max_coords[1]), 'z': float(mid_z)},                  # Top-middle
        #     {'x': float(min_coords[0]), 'y': float(max_coords[1]), 'z': float(min_coords[2])},  # Top-left
        #     {'x': float(min_coords[0]), 'y': float(mid_y), 'z': float(mid_z)},                  # Middle-left
        # ]
        corners = [
            {'x': float(min_coords[0]), 'y': float(min_coords[1]), 'z': float(min_coords[2])},  # Bottom-left-front
            {'x': float(min_coords[0]), 'y': float(min_coords[1]), 'z': float(max_coords[2])},  # Bottom-left-back
            {'x': float(min_coords[0]), 'y': float(max_coords[1]), 'z': float(min_coords[2])},  # Top-left-front
            {'x': float(min_coords[0]), 'y': float(max_coords[1]), 'z': float(max_coords[2])},  # Top-left-back
            {'x': float(max_coords[0]), 'y': float(min_coords[1]), 'z': float(min_coords[2])},  # Bottom-right-front
            {'x': float(max_coords[0]), 'y': float(min_coords[1]), 'z': float(max_coords[2])},  # Bottom-right-back
            {'x': float(max_coords[0]), 'y': float(max_coords[1]), 'z': float(min_coords[2])},  # Top-right-front
            {'x': float(max_coords[0]), 'y': float(max_coords[1]), 'z': float(max_coords[2])},  # Top-right-back
        ]
        
        data = {
            "dataId": id,
            "centroid": centroid_list,
            "objectId": class_value,
            "corners": corners,  # Keeping the original spelling "cornors"
        }
        
        try:
            response = requests.post(url, json=data)
            response.raise_for_status()  # Raise an exception for 4XX/5XX responses
            print(f"Successfully posted cluster {cluster_id} for class {class_name}")
        except requests.exceptions.RequestException as e:
            print(f"Error posting cluster {cluster_id} for class {class_name}: {e}")



def extract_and_cluster(input_file, class_value, eps=0.5, min_samples=5):
    """
    Extract points of a specific class from a LAS file and perform DBSCAN clustering
    """
    las = laspy.read(input_file)
    print('laspy path:', input_file)
    
    # Create a mask for points with the specified classification
    mask = las.classification == class_value
    filtered_count = np.sum(mask)
    print(f"Found {filtered_count} points with classification {class_value}")
    
    if filtered_count == 0:
        return None, None
    
    # Extract XYZ coordinates for the filtered points
    points = np.vstack((las.x[mask], las.y[mask], las.z[mask])).transpose()
    
    # Apply DBSCAN
    db = DBSCAN(eps=eps, min_samples=min_samples, n_jobs=-1)
    clusters = db.fit_predict(points)
    
    n_clusters = len(set(clusters)) - (1 if -1 in clusters else 0)
    n_noise = list(clusters).count(-1)
    print(f"DBSCAN found {n_clusters} clusters and {n_noise} noise points")
    
    return points, clusters

def clustering(input_files,id):
    # classes_to_process=[16,17,22,23]
    class_mapping = {
        16: "Building",
        17: "Fence",
        23: "Pole",
        24: "Traffic sign"
    }
    for input_file in os.listdir(input_files):
        for class_value, class_name in class_mapping.items():
            print(f"\nProcessing class {class_value} ({class_name})")
            
            # Extract points and run DBSCAN
            points, clusters = extract_and_cluster(
                input_file=join(input_files,input_file),
                class_value=class_value,
                eps=1,  # Adjust based on your point cloud density
                min_samples=10
            )
            
            # Print bounding boxes and centroids
            store_bounding_boxes_and_centroids(points, clusters, class_value,class_name,id)

    

