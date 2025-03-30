import laspy
import numpy as np

def read_las(file_path):
    las = laspy.read(file_path)
    points = np.vstack((las.x,las.y,las.z)).T
    return points