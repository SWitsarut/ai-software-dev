import os
from flask import Flask, request, jsonify
import laspy

app = Flask(__name__)

@app.route('/', methods=['GET'])
def hello_world():
    return 'Hello, World!'

@app.route('/process', methods=['POST'])
def handle_process():
    data = request.get_json()
    file_path =data.get('path')
    
    
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
