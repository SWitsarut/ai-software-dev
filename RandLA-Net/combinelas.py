import numpy as np
import os

def combine_and_split_bin_files(input_folder, output_folder, num_files=3):
    # List all .bin files in the input folder
    bin_files = [f for f in os.listdir(input_folder) if f.endswith('.bin')]
    
    # Sort the files if needed (e.g., by scan_id)
    bin_files.sort()

    # Initialize an empty list to store point cloud data
    combined_data = []

    # Iterate over each .bin file
    for bin_file in bin_files:
        # Load the .bin file (the file contains a numpy array of points)
        file_path = os.path.join(input_folder, bin_file)
        data = np.fromfile(file_path, dtype=np.float32).reshape(-1, 4)  # Assuming 4 columns (x, y, z, intensity)

        # Append the data to the list
        combined_data.append(data)

    # Concatenate all the data into a single numpy array
    combined_data = np.concatenate(combined_data, axis=0)

    # Calculate the chunk size for splitting
    chunk_size = len(combined_data) // num_files
    remainder = len(combined_data) % num_files

    # Split the combined data into chunks
    start_idx = 0
    for i in range(num_files):
        # Calculate end index for the chunk (adding remainder to the last chunk)
        end_idx = start_idx + chunk_size + (1 if i < remainder else 0)
        chunk = combined_data[start_idx:end_idx]

        # Save the chunk to a .bin file
        output_file = os.path.join(output_folder, f"combined_part_{i+1}.bin")
        chunk.tofile(output_file)
        print(f"Saved {output_file}, size: {chunk.shape[0]} points")

        # Update the start index for the next chunk
        start_idx = end_idx

# Example usage:
input_folder = './test_data'  # Folder containing .bin files
output_folder = './test_data_combined/'  # Output file for combined data

# Split into 3 or 4 files (adjust the num_files parameter)
combine_and_split_bin_files(input_folder, output_folder, num_files=8)
