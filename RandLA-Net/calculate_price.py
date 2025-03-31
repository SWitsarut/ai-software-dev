import laspy
import numpy as np
import os

def calculate_point_cloud_price(file_path, price_per_1000_points=0.05):
    """
    Load a LAS/LAZ point cloud file and calculate the price based on number of points.
    
    Parameters:
    -----------
    file_path : str
        Path to the LAS/LAZ file
    price_per_1000_points : float, optional
        Price per 1000 points in the point cloud (default: $0.05 per 1000 points)
        
    Returns:
    --------
    dict
        Dictionary containing point count, file size, and calculated price
    """
    # Check if file exists
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    # Calculate file size in MB
    file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
    
    # Open the LAS file
    try:
        with laspy.open(file_path) as f:
            las = f.read()
            point_count = len(las.points)
            
            # Get the dimensions/attributes of the points if needed
            # dimensions = las.point_format.dimension_names
            
            # Calculate price
            price = (point_count / 1000) * price_per_1000_points
            
            # Get bounding box (optional)
            min_bounds = las.header.min
            max_bounds = las.header.max
            
            return {
                "file_name": os.path.basename(file_path),
                "file_size_mb": round(file_size_mb, 2),
                "point_count": point_count,
                "price": round(price, 2),
                "bounds": {
                    "min": (min_bounds[0], min_bounds[1], min_bounds[2]),
                    "max": (max_bounds[0], max_bounds[1], max_bounds[2])
                }
            }
            
    except Exception as e:
        raise Exception(f"Error processing point cloud: {str(e)}")

# Example usage
if __name__ == "__main__":
    # Example file path - replace with your actual LAS/LAZ file
    las_file = "example.las"
    
    try:
        result = calculate_point_cloud_price(las_file)
        print(f"File: {result['file_name']}")
        print(f"Size: {result['file_size_mb']} MB")
        print(f"Points: {result['point_count']:,}")
        print(f"Price: ${result['price']}")
        print(f"Bounds: {result['bounds']}")
    except Exception as e:
        print(f"Error: {e}")

# To use this with Flask
"""
from flask import Flask, request, jsonify
import os

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/calculate-price', methods=['POST'])
def api_calculate_price():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
        
    # Get price rate from request if provided
    price_rate = request.form.get('price_rate', 0.05)
    try:
        price_rate = float(price_rate)
    except ValueError:
        return jsonify({"error": "Invalid price rate"}), 400
    
    # Save the uploaded file
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)
    
    try:
        result = calculate_point_cloud_price(file_path, price_rate)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        # Optionally clean up the file after processing
        # os.remove(file_path)
        pass

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
"""