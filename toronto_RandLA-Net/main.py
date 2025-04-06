from main_Toronto3D import Toronto3D
import os

# dir = "./data/1m"
dir = "./data/1m"
files = os.listdir(dir)
full_paths = [os.path.join(dir, file) for file in files]
print(full_paths)
# print(os.join('12',files))
Toronto3D(dir)