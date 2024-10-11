import os
from elasticsearch import Elasticsearch
from vgg16_encoder import FeatureExtractor
from PIL import Image


# Function to connect to Elasticsearch and create an index
def create_elastic_index(client, index_name):
    if client.indices.exists(index=index_name):
        print(f"Index {index_name} already exists. Skipping creation.")
    else:
        client.indices.create(index=index_name, body={
            "mappings": {
                "properties": {
                    "path": {"type": "keyword"},
                    "feature_vector": {"type": "dense_vector", "dims": 4096}
                }
            }
        })
        print(f"Index {index_name} created.")
        

# Function to index image data into Elasticsearch
def index_image_data(client, index_name, image_path, feature_vector):
    doc = {
        "path": image_path,
        "feature_vector": feature_vector.tolist()  
    }
    client.index(index=index_name, body=doc)
    print(f"Indexed {image_path}")
    

if __name__ == "__main__":
    
    #elasticsearch connection
    es = Elasticsearch([{'host': 'localhost', 'port': 9200, 'scheme': 'http'}])
    # Create Elasticsearch index
    index="image_features"
    create_elastic_index(es,index)
    #extrat features 
    extractor=FeatureExtractor()
    for i in range(6,9):
        folder_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'images', f'{i}')
        #loop through images and extract features
        for img_file in os.listdir(folder_path):
            img_path = os.path.join(folder_path, img_file)
            # Load image using PIL
            img = Image.open(img_path)
            # Extract feature vector
            feature_vector = extractor.extract(img)
            # Index image path and feature vector into Elasticsearch
            index_image_data(es, index, img_path, feature_vector)
            print("image sent to index")
