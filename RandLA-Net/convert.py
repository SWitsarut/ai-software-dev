import argparse
import os
import subprocess
import numpy as np
import laspy
from tqdm import tqdm
import requests

parser = argparse.ArgumentParser(description="Convert bin and label to las file")
parser.add_argument('--input', type=str, required=True, help='Folder path containing point clouds')
parser.add_argument('--label', type=str, default=None, help='Folder path for label files')
parser.add_argument('--name', type=str, default=None, help='Output name for processed data')
# parser.add_argument('--name', type=str, default=None, help='Output name for processed data')
parser.add_argument('-s', action='store_true', help="Enable split mode")

FLAGS = parser.parse_args()

# Load KITTI point cloud
def load_pc_kitti(pc_path):
    scan = np.fromfile(pc_path, dtype=np.float32).reshape(-1, 4)  # KITTI has (x, y, z, intensity)
    points = scan[:, :3]  # Get XYZ
    intensity = scan[:, 3]  # Get intensity
    return points, intensity

# Load Labels
def load_labels(label_path):
    return np.fromfile(label_path, dtype=np.uint32)

# Define a mapping for LAS-compatible classification values
label_mapping = {
    0: 0,    # Unlabeled
    1: 1,    # Outlier
    10: 2,   # Car
    11: 3,   # Bicycle
    13: 4,   # Bus
    15: 5,   # Motorcycle
    16: 6,   # On-rails
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
    52: 18,  # Other structure
    60: 19,  # Lane marking
    70: 20,  # Vegetation
    71: 21,  # Trunk
    72: 22,  # Terrain
    80: 23,  # Pole
    81: 24,  # Traffic sign
    99: 25,  # Other object
    252: 26, # Moving car
    253: 27, # Moving bicyclist
    254: 28, # Moving person
    255: 29, # Moving motorcyclist
    256: 30, # Moving on-rails
    257: 31, # Moving bus
    258: 32, # Moving truck
    259: 33  # Moving other vehicle
}


# Paths from command-line arguments
pc_path = FLAGS.input
label_path = FLAGS.label
las_output_path = f"../server/public/point_cloud/{FLAGS.name}/las"
potree_out_path = f"../server/public/point_cloud/{FLAGS.name}"


if os.path.isdir(pc_path):  # If the input path is a directory
    # Create output directory if it doesn't exist
    print(pc_path,'is dir')
    
    os.makedirs(las_output_path, exist_ok=True)
    files_pc =os.listdir(pc_path)
    files_label = os.listdir(label_path)
    files_label = files_label[:1]
    print(len(files_label),files_label)
    files_length = min(len(files_pc), len(files_label))  # Get the minimum length
    print('files_length',files_length)
    for i in tqdm(range(files_length), desc="Processing Files", unit="file"):
        file = files_pc[i] 
        pc_file = os.path.join(pc_path, file)
        if pc_file.endswith('.bin'):  # Only process .bin files
            xyz, intensity = load_pc_kitti(pc_file)

            label_file = os.path.join(label_path, file.replace('.bin', '.label'))
            labels = load_labels(label_file)
            # print('labels',labels)
            # Ensure label size matches point cloud size
            assert xyz.shape[0] == labels.shape[0], f"Mismatch between points and labels for file {file}"

            # Map labels to LAS-compatible classification
            classification = np.vectorize(lambda x: label_mapping.get(x, 0))(labels)

            # Create LAS file
            # header = laspy.LasHeader(point_format=1, version="1.2")  # Point format 1 includes Intensity
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

            # print(f"LAS file saved: {las_file_path}")
else:
    # Process single file if the input path is not a directory
    xyz, intensity = load_pc_kitti(pc_path)
    labels = load_labels(label_path)
    print('labels',labels)

    # Ensure label size matches point cloud size
    assert xyz.shape[0] == labels.shape[0], "Mismatch between points and labels!"

    # Map labels to LAS-compatible classification
    classification = np.vectorize(lambda x: label_mapping.get(x, 0))(labels)

    header = laspy.LasHeader(point_format=1, version="1.4")
    las = laspy.LasData(header)


    # Assign values
    las.x = xyz[:, 0]
    las.y = xyz[:, 1]
    las.z = xyz[:, 2]
    las.intensity = intensity.astype(np.uint16)  # LAS stores intensity as uint16
    las.classification = classification.astype(np.uint8)  # Classification is uint8

    # Save to file
    las.write(las_output_path)

    # print(f"LAS file saved: {las_output_path}")

print("Conversion done!")

if FLAGS.s:
    las_files = os.listdir(las_output_path)
    for i in range(len(las_files)):
        subprocess.run([
            "./PotreeConverter/PotreeConverter.exe",
            "-i", os.path.join(las_output_path, las_files[i]),
            "-o", os.path.join(potree_out_path, str(i))  # Convert i to a string
        ])
else:
    print('here')
    # potree_out_path = os.path.join(las_output_path, "potree_output")  # Define output path
    subprocess.run([
        "./PotreeConverter/PotreeConverter.exe",
        "-i", las_output_path,
        "-o", potree_out_path
    ])
    