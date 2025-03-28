import os
import numpy as np
import tensorflow as tf
import pickle
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename

# Import necessary helper modules (assuming they are in the same directory)
from helper_tool import DataProcessing as DP
from helper_tool import ConfigSemanticKITTI as cfg
from RandLANet import Network
from tester_SemanticKITTI import ModelTester

class SemanticKITTIPredictor:
    def __init__(self, dataset_path='/data/semantic_kitti/dataset/sequences_0.06', test_id='08'):
        # Initialize dataset configuration similar to original code
        self.dataset_path = dataset_path
        self.label_to_names = {
            0: 'unlabeled', 1: 'car', 2: 'bicycle', 3: 'motorcycle', 4: 'truck',
            5: 'other-vehicle', 6: 'person', 7: 'bicyclist', 8: 'motorcyclist',
            9: 'road', 10: 'parking', 11: 'sidewalk', 12: 'other-ground',
            13: 'building', 14: 'fence', 15: 'vegetation', 16: 'trunk',
            17: 'terrain', 18: 'pole', 19: 'traffic-sign'
        }
        self.num_classes = len(self.label_to_names)
        self.label_values = np.sort(list(self.label_to_names.keys()))
        self.label_to_idx = {l: i for i, l in enumerate(self.label_values)}
        self.ignored_labels = np.sort([0])

        # Prepare dataset
        self.test_scan_number = str(test_id)
        
        # Placeholder for model and dataset
        self.dataset = None
        self.model = None
        self.tester = None

    def prepare_model(self, model_path=None):
        """
        Prepare the model for prediction
        :param model_path: Path to saved model snapshot, if None, will use the latest
        """
        # Reinitialize dataset and input pipeline
        self.dataset = self._create_dataset()
        self.dataset.init_input_pipeline()

        # Initialize network
        self.model = Network(self.dataset, cfg)

        # Restore model 
        if model_path is None:
            # Find the latest snapshot if no path provided
            logs = np.sort([os.path.join('results', f) for f in os.listdir('results') if f.startswith('Log')])
            chosen_folder = logs[-1]
            snap_path = os.path.join(chosen_folder, 'snapshots')
            snap_steps = [int(f[:-5].split('-')[-1]) for f in os.listdir(snap_path) if f[-5:] == '.meta']
            chosen_step = np.sort(snap_steps)[-1]
            model_path = os.path.join(snap_path, 'snap-{:d}'.format(chosen_step))

        # Initialize tester and restore model
        self.tester = ModelTester(self.model, self.dataset, restore_snap=model_path)

    def _create_dataset(self):
        """
        Create dataset instance
        """
        from paste import SemanticKITTI  # Import from the original file
        return SemanticKITTI(self.test_scan_number)

    def predict(self, point_cloud_data):
        """
        Predict semantic labels for input point cloud
        :param point_cloud_data: numpy array of point cloud data
        :return: predicted labels and probabilities
        """
        if self.model is None or self.tester is None:
            self.prepare_model()

        # Prepare prediction
        self.tester.sess.run(self.dataset.test_init_op)
        
        # Run prediction
        ops = (self.tester.prob_logits, 
               self.model.labels, 
               self.model.inputs['input_inds'], 
               self.model.inputs['cloud_inds'])
        
        stacked_probs, labels, point_inds, cloud_inds = self.tester.sess.run(
            ops, {self.model.is_training: False}
        )

        # Process predictions
        stacked_probs = np.reshape(stacked_probs, [
            cfg.val_batch_size, 
            cfg.num_points, 
            cfg.num_classes
        ])
        
        predictions = []
        for j in range(stacked_probs.shape[0]):
            probs = stacked_probs[j, :, :]
            pred_labels = np.argmax(probs, axis=1)
            pred_probs = np.max(probs, axis=1)
            predictions.append({
                'labels': [self.label_to_names[label] for label in pred_labels],
                'label_indices': pred_labels.tolist(),
                'probabilities': pred_probs.tolist()
            })

        return predictions

# Flask API setup
app = Flask(__name__)
predictor = SemanticKITTIPredictor()

@app.route('/predict', methods=['POST'])
def predict_point_cloud():
    try:
        # Check if point cloud data is in request
        if 'point_cloud' not in request.files:
            return jsonify({'error': 'No point cloud file uploaded'}), 400

        # Save uploaded file
        file = request.files['point_cloud']
        filename = secure_filename(file.filename)
        file_path = os.path.join('/tmp', filename)
        file.save(file_path)

        # Load point cloud data
        point_cloud_data = np.load(file_path)

        # Optional: get additional parameters
        model_path = request.form.get('model_path', None)
        
        # Set model path if provided
        if model_path:
            predictor.prepare_model(model_path)

        # Predict
        predictions = predictor.predict(point_cloud_data)

        # Clean up temporary file
        os.remove(file_path)

        return jsonify({
            'predictions': predictions
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/classes', methods=['GET'])
def get_classes():
    """
    Endpoint to return available classes
    """
    return jsonify({
        'classes': predictor.label_to_names,
        'num_classes': predictor.num_classes
    })

if __name__ == '__main__':
    # Ensure GPU memory growth
    gpus = tf.config.experimental.list_physical_devices('GPU')
    if gpus:
        try:
            for gpu in gpus:
                tf.config.experimental.set_memory_growth(gpu, True)
        except RuntimeError as e:
            print(e)
    
    # Run Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)