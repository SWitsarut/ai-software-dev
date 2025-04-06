import os
import laspy
import subprocess
import numpy as np

# laszip_dir = os.path.abspath("./PotreeConverter_linux_x64")
# os.environ['LD_LIBRARY_PATH'] = f"{laszip_dir}:{os.environ.get('LD_LIBRARY_PATH', '')}"

# las_output_path = "forPotree.las"
# potree_out_path = "forPotree"

# subprocess.run([
#         "./PotreeConverter_linux_x64/PotreeConverter",
#         "-i", las_output_path,
#         "-o", potree_out_path
#     ])

pc = "./data/E4_RGB_Orbit.las"

# Open the file in read mode
with laspy.open(pc) as file:
    header = file.header
    
    # Define chunk size (adjust based on your available memory)
    chunk_size = 100_000  # 1 million points per chunk
    
    # Calculate total number of points
    total_points = header.point_count
    
    print(f"Total points: {total_points}")
    
    # Process the file in chunks
    for i, points in enumerate(file.chunk_iterator(chunk_size)):
        # Now 'points' contains a chunk of the point cloud data
        # You can process each chunk here
        start_idx = i * chunk_size
        end_idx = min((i + 1) * chunk_size, total_points)
        
        print(f"Processing chunk {i+1}: points {start_idx} to {end_idx-1}",end=" ")
        
        # Example: Access x, y, z coordinates
        x = points.x
        y = points.y
        z = points.z
        
        # Do your processing here...
        # For example, calculate mean height of this chunk
        mean_z = np.mean(z)
        print(f"  Mean z value: {mean_z:.2f}")
        
        # If you need to save partial results, do it here