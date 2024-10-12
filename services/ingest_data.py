import os
from elasticsearch import Elasticsearch
from vgg16_encoder import FeatureExtractor
from PIL import Image
import logging
import base64


logging.basicConfig(level=logging.INFO)


# Function to connect to Elasticsearch and create an index
def create_elastic_index(client, index_name):
    if client.indices.exists(index=index_name):
        logging.info(f"Index {index_name} already exists. Skipping creation.")
    else:
        client.indices.create(index=index_name, body={
            "mappings": {
                "properties": {
                    "image_data": {"type": "text"},
                    "feature_vector": {"type": "dense_vector", "dims": 4096}
                }
            }
        })
        logging.info(f"Index {index_name} created.")
        

# Function to index image data into Elasticsearch
def index_image_data(client, index_name, image_data, feature_vector):
    doc = {
        "image_data": image_data,
        "feature_vector": feature_vector.tolist()  
    }
    client.index(index=index_name, body=doc)
    logging.info("Indexed image data succesfully.")
    
# Function to encode image  to base64 data
def imgageToBase64(img_path):
    with open(img_path , "rb") as image_file:
        image_data=image_file.read()
        base64_encoded=base64.b64encode(image_data).decode('utf-8')
    return base64_encoded


if __name__ == "__main__":
    
    #elasticsearch connection
    es = Elasticsearch([{'host': 'localhost', 'port': 9200, 'scheme': 'http'}])
    # Create Elasticsearch index
    index="image_features"
    create_elastic_index(es,index)
    #extrat features 
    extractor=FeatureExtractor()
    for i in range(0,9):
        folder_path = os.path.join(os.path.dirname(__file__), '..', 'images', f'{i}')
        #loop through images and extract features
        for img_file in os.listdir(folder_path):
            img_path = os.path.join(folder_path, img_file)
            try:
                # Load image using PIL
                img = Image.open(img_path)
                # Extract feature vector
                feature_vector = extractor.extract(img)
                #encode image to base64
                imgb64=imgageToBase64(img_path)
                # Index image path and feature vector into Elasticsearch
                index_image_data(es, index, imgb64, feature_vector)
            except Exception as e:
                logging.error(f"Error processing image {img_path}: {e}")
