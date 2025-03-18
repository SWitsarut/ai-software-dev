import argparse
import subprocess
from os.path import join

parser = argparse.ArgumentParser()
parser.add_argument('--data', type=str, required=True ,help='data file')
parser.add_argument('--data_prepared', type=str, required=True,help='data_prepared path')
parser.add_argument('--grid_size', type=float,default=0.06,help='grid size')
parser.add_argument('--outname', type=str, required=True,help='output name')
parser.add_argument('--lasout', type=str, required=True,help='las output path')

FLAGS = parser.parse_args()

command1 = [
    'python', './custom_data_prepare.py',
    '--data', FLAGS.data,
    '--output', FLAGS.data_prepared,
]
command2 = [
    'python', './Custom_main.py',
    '--data', FLAGS.data_prepared,
    '--outname', FLAGS.outname
]
command3 = [
    'python', './convert.py',
    '--input', FLAGS.data,
    '--label', FLAGS.outname,
    '--output', FLAGS.lasout
]

# Print all the commands as strings to verify
print("Command 1:", ' '.join(command1))
print("Command 2:", ' '.join(command2))
print("Command 3:", ' '.join(command3))

# Optionally, run them after verification
subprocess.run(command1)
subprocess.run(command2)
subprocess.run(command3)
