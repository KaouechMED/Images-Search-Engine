from vgg16_encoder import FeatureExtractor
from flask import Flask, request, jsonify
from flask_cors import CORS
import io
import base64
from PIL import Image
from elasticsearch import Elasticsearch

app=Flask(__name__)
CORS(app)
extractor=FeatureExtractor()
#elasticsearch client and index
es = Elasticsearch([{'host': 'elasticsearch', 'port': 9200, 'scheme': 'http'}])
index="image_features"
similarity_threshold = 0.5




@app.route('/',methods=['GET'])
def home():
    return jsonify({'message':'Welcome to Image Search Engine API'})

# search route
@app.route('/api/search',methods=['POST'])
def search():
    image=request.json['image']
    image_bytes = io.BytesIO(base64.b64decode(image))
    img=Image.open(image_bytes)
    embedding=extractor.extract(img).tolist()
    search_query = {
        "size": 10,  
        "min_score": similarity_threshold + 1.0,  
        "_source": ["image_data"],
        "query": {
            "script_score": {
                "query": {"match_all": {}},
                "script": {
                    "source": """
                        cosineSimilarity(params.query_vector, 'feature_vector') + 1.0
                    """,
                    "params": {
                        "query_vector": embedding
                    }
                }
            }
        }
    }    
    search_response = es.search(index=index, body=search_query)
    if search_response['hits']['hits']:
        images_data = [hit["_source"]["image_data"] for hit in search_response['hits']['hits']]
        return jsonify({'images_data': images_data})
    else:
        return jsonify({'message':'no matching images'})   


if __name__ =="__main__":
    app.run(debug=True, host="0.0.0.0")

