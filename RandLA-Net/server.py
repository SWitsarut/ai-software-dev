import os
from flask import Flask, request, jsonify
import laspy
import requests
from data_prepare import data_prepare
from main_SemanticKITTI import SemanticKITTI
from RandLANet import Network
from tester_SemanticKITTI import ModelTester
from helper_tool import ConfigSemanticKITTI as cfg
from convert_potree import convert_Potree
from convert_potree import clustering

app = Flask(__name__)

@app.route('/', methods=['GET'])
def hello_world():
    url = "http://express-server:8080/"
    response = requests.get(url)
    return response.text  # this ensures you're returning a string (valid response)


# In your Flask route
@app.route('/process', methods=['POST'])
def handle_process():
    data = request.get_json()
    file_path = data.get('path')
    data_id = data.get('data_id')

    prepared = data_prepare(file_path, data_id)
    # start predict
    # convert_Potree(data_id,file_path)
    return jsonify({'status': 200,'dataPath':prepared})

@app.route('/predict',methods=['POST'])
def handle_predict():
    data = request.get_json()
    file_path = data.get('path')
    # /app/public/${id}/processed
    dataset = SemanticKITTI(file_path)
    cfg.saving =False
    model = Network(dataset, cfg)
    chosen_snap = './model/snap-277357'
    tester = ModelTester(model, dataset, restore_snap=chosen_snap)
    tester.test(model, dataset)
    return jsonify({'status':200})



@app.route('/potree', methods=['POST'])
def potree():
    data = request.get_json()
    dataId = data.get("id")
    las_dir =data.get("las_dir")
    convert_Potree(dataId,las_dir)
    return "ended"

@app.route('/clustering',methods=['POST'])
def handle_clustering():
    data = request.get_json()
    files_path = data.get('dataId')
    las_dir = f"/app/public/{files_path}/las"
    print('las_dir',las_dir)
    clustering(las_dir,files_path)
    return "ended"


@app.route('/calculate_price',methods=['POST'])
def calculate_price():
    data = request.get_json()
    file_path = data.get("path")
    price = 50
    for file in os.listdir(file_path):
        print()
        with laspy.open(os.path.join(file_path,file)) as f:
            las = f.read()  
            points = len(las.points)
            price += points / 1000.0 *0.05
    return jsonify({'price': price})




if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
