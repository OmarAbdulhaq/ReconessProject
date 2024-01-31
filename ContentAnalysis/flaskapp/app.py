from flask import Flask, request, jsonify, redirect, url_for
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from database import *

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return 'Welcome to my Flask app!'

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
    users = db.users
    data = request.json

    username = data.get('username')
    password = data.get('password')

    user = users.find_one({'username': username})

    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({"message": "Invalid username or password"}), 401
    
    return jsonify({"message": "Logged in successfully"}), 200

if __name__ == '__main__':
    app.run(debug=True)
