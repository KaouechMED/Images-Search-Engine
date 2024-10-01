from vgg16_encoder import FeatureExtractor
from flask import Flask, request, jsonify
from flask_cors import CORS
import io
import base64
from PIL import Image

app=Flask(__name__)
CORS(app)
extractor=FeatureExtractor()

@app.route('/api',methods=['GET'])
def home():
    return jsonify({'message':'Welcome to Image Search Engine API'})

@app.route('/api/search',methods=['POST'])
def search():
    image=request.json['image']
    image_bytes = io.BytesIO(base64.b64decode(image))
    img=Image.open(image_bytes)
    embedding=extractor.extract(img).tolist()
    return jsonify({'image_embeddings':embedding})
    
    

if __name__ =="__main__":
    app.run(debug=True)

