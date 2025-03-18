import argparse
from CustomRanlanet import Network
from Custom_SemanticKitti import SemanticKITTI
import os,sys
from os.path import dirname,abspath
from custom_config import ConfigSemanticKITTI as cfg
from custom_tester_SemanticKITTI import ModelTester
import numpy as np
from os.path import join
BASE_DIR = dirname(abspath(__file__))
ROOT_DIR = dirname(BASE_DIR)
sys.path.append(BASE_DIR)
sys.path.append(ROOT_DIR)


parser = argparse.ArgumentParser()
parser.add_argument('--data', type=str, default=cfg.data_dir, help='the number of GPUs to use [default: 0]')
parser.add_argument('--outname', type=str, default=cfg.out_name, help='options: train, test, vis')
FLAGS = parser.parse_args()

cfg.saving = False

os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"
os.environ['CUDA_VISIBLE_DEVICES'] = str(0)
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'


cfg.data_dir = FLAGS.data
cfg.out_name = FLAGS.outname
test_files_list = []
pc_path = os.path.join(FLAGS.data, "velodyne")

test_files_list.extend([os.path.join(pc_path, f) for f in np.sort(os.listdir(pc_path))])

print(test_files_list[:3])

dataset = SemanticKITTI(test_files_list)
dataset.init_input_pipeline()
model = Network(dataset,cfg)

tester = ModelTester(model, dataset, restore_snap=join('model/snap-277357'))
# # print('done')
tester.test(model, dataset)
# # pred = tester.inference(dataset, False)