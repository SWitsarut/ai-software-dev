from helper_ply import read_ply
import numpy as np
import laspy



file_path_origin = "./data/Toronto_3D/original_ply/L002.ply"
original_data = read_ply(file_path_origin)
print(original_data.dtype.names)
print(original_data['red'])

predicted_file_path = './test/Log_2025-04-04_10-46-10/predictions/L002.ply'
predicted_data = read_ply(predicted_file_path)

las = laspy.create(file_version="1.4", point_format=7)  # Point Format 7 supports RGB



label_mapping = {
    0: 0,    # Unclassified -> Unlabeled
    1: 12,   # Road -> Road
    2: 12, # Road marking -> No direct match (Unused)
    3: 22,   # Natural -> Vegetation
    4: 16,   # Building -> Building
    5: 12, # Utility line -> No direct match
    6: 23,   # Pole -> Pole
    7: 2,   # Car -> Car
    8: 17    # Fence -> Fence
}


# Add point data
point_count = len(predicted_data)
las.header.point_count = point_count

# Set coordinates using the correct field names
las.x = original_data['x']
las.y = original_data['y']
las.z = original_data['z']

# Set classification from 'preds' field
labels = np.vectorize(lambda x: label_mapping.get(x, 0))(predicted_data['preds'].astype(np.uint8))
las.classification = labels.astype(np.uint8)

# If you also want to include RGB values (optional)
if 'red' in original_data.dtype.names and 'green' in original_data.dtype.names and 'blue' in original_data.dtype.names:
    las.red = original_data['red']
    las.green = original_data['green']
    las.blue = original_data['blue']

# If you want to include intensity (optional)
if 'scalar_Intensity' in original_data.dtype.names:
    las.intensity = original_data['scalar_Intensity']

# If you want to include GPS time (optional)
if 'scalar_GPSTime' in original_data.dtype.names:
    las.gps_time = original_data['scalar_GPSTime']

# If you want to include scan angle (optional)
if 'scalar_ScanAngleRank' in original_data.dtype.names:
    las.scan_angle = original_data['scalar_ScanAngleRank']

# Write the LAS file
output_path = './forPotree.las'
las.write(output_path)
print(f"Successfully saved as {output_path}")
