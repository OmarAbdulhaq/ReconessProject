from pymongo import MongoClient
from flask_pymongo import PyMongo

client = MongoClient('mongodb://localhost:27017/')
db = client.ContentAnalysis
mongoConfig = PyMongo()