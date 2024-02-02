from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from database import *
import os
import jwt
import datetime

app = Flask(__name__)
secret_key = os.urandom(32)
CORS(app)

SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'fallback_secret_key_here')

@app.route('/')
def home():
    return 'Welcome to my Flask app!'

def create_access_token(identity, expires_delta):
    exp = datetime.datetime.utcnow() + expires_delta
    token = jwt.encode({'identity': identity, 'exp': exp}, SECRET_KEY, algorithm='HS256')
    return token

@app.route('/signup', methods=['POST'])
def signup():
    users = db.UserInfo
    data = request.json

    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if users.find_one({"email": email}):
        return jsonify({"message": "User with that email already exists"}), 400

    hashed_password = generate_password_hash(password)

    users.insert_one({
        "username": username,
        "email": email,
        "password_hash": hashed_password
    })

    return jsonify({"message": "User created successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    users = db.UserInfo
    data = request.json
    username = data.get('username')
    password = data.get('password')
    user = users.find_one({'username': username})

    if user and check_password_hash(user['password_hash'], password):
        access_token = create_access_token(identity=username, expires_delta=datetime.timedelta(days=1))
        return jsonify(access_token=access_token), 200
    else:
        return jsonify({"message": "Invalid username or password"}), 401
    
if __name__ == '__main__':
    app.run(debug=True)
