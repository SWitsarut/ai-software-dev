import laspy
import numpy as np

def read_las(file_path):
    las = laspy.read(file_path)
    points = np.vstack((las.x, las.y, las.z)).T
    
    # Get intensity if it exists in the LAS file, otherwise create an array of 1s
    if hasattr(las, 'intensity'):
        intensity = np.array(las.intensity, dtype=np.float32)
    else:
        # Create an array of 1s with the same length as points
        intensity = np.ones(len(points), dtype=np.float32)
    
    return np.array(points, dtype=np.float32), intensity