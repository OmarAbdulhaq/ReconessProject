from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash, secure_filename
from database import db 
import os
import jwt
from datetime import datetime, timedelta 
import secrets
import mimetypes
from AnalysisAPIs.IFER import IFERPipeline
from AnalysisAPIs.SA import SAPipeline
from AnalysisAPIs.SER import SERPipeline
from AnalysisAPIs.VFER import VFERPipeline

app = Flask(__name__)
CORS(app)

SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'fallback_secret_key_here')

@app.route('/')
def home():
    return 'Welcome to my Flask app!'

def create_access_token(identity, expires_delta):
    exp = datetime.utcnow() + expires_delta
    token = jwt.encode({'identity': identity, 'exp': exp}, SECRET_KEY, algorithm='HS256')
    return token.decode('UTF-8') if isinstance(token, bytes) else token

@app.route('/signup', methods=['POST']) 
def signup():
    users = db.UserInfo
    data = request.get_json()

    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if users.find_one({"email": email}):
        return jsonify({"message": "User with that email already exists"}), 400

    hashed_password = generate_password_hash(password)

    users.insert_one({
        "username": username,
        "email": email,
        "password_hash": hashed_password,
        "created_at": datetime.utcnow(),
        "last_login": datetime.utcnow(),
        "API_access_token": None,
        "API_access_token_expire": None
    })

    return jsonify({"message": "User created successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = db.UserInfo.find_one({"username": username})
    if user and check_password_hash(user['password_hash'], password):
        try:
            expires_delta = timedelta(days=1)
            access_token = create_access_token(identity=username, expires_delta=expires_delta)
            return jsonify({
                'access_token': access_token,
                'username': username
            }), 200
        except Exception as e:
            return jsonify({"msg": f"Error generating access token: {str(e)}"}), 500
    else:
        return jsonify({"msg": "Invalid username or password"}), 401

app.route("/token", methods = ["POST"])
def generateToken():
    data = request.get_json()
    username = data.get('username')
    user = db.UserInfo.find_one({"username": username})

    now = datetime.utcnow()
    if user.get("API_access_token") is None or user.get("API_access_token_expire", now) <= now:
        new_token = secrets.token_urlsafe(20)
        new_expire = now + timedelta(days=30)
        db.UserInfo.update_one(
            {"username": username},
            {"$set": {
                "API_access_token": new_token,
                "API_access_token_expire": new_expire
            }}
        )
        return jsonify({
            "API_access_token": new_token,
            "API_access_token_expire": new_expire.isoformat()
        }), 200
    else:
        return jsonify({"msg": "Existing API token is still valid", "API_access_token": user["API_access_token"], "API_access_token_expire": user["API_access_token_expire"].isoformat()}), 200

@app.route('/medialysis', methods=['POST'])
def medialysis():
    token = request.headers.get('Authorization', '').split(' ')[-1]
    if not token:
        return jsonify({"msg": "Token is missing"}), 403
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return jsonify({"msg": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"msg": "Invalid token"}), 401

    username = payload.get('identity')
    user = db.UserInfo.find_one({"username": username})
    if not user:
        return jsonify({"msg": "User not found"}), 404

    if 'API_access_token' not in user or user['API_access_token_expire'] < datetime.utcnow():
        return redirect('/token', code=302)

    file = request.files.get('file')
    if not file or file.filename == '':
        return jsonify({"msg": "No file provided"}), 400

    filename = secure_filename(file.filename)
    file_type = mimetypes.guess_type(filename)[0]
    user_data_dir = os.path.join("UserData", username)
    os.makedirs(user_data_dir, exist_ok=True)
    file_path = os.path.join(user_data_dir, filename)
    file.save(file_path)

    try:
        if file_type.startswith('video/'):
            video_results = VFERPipeline.process(file_path) + \
                            SERPipeline.process(file_path) + \
                            SAPipeline.process(file_path, is_video=True)
        elif file_type.startswith('audio/'):
            audio_results = SERPipeline.process(file_path) + \
                            SAPipeline.process(file_path, is_audio=True)
        elif file_type.startswith('image/'):
            image_results = IFERPipeline.process(file_path)
        else:
            os.remove(file_path)  
            return jsonify({"msg": "Unsupported file type"}), 400
        
        results = video_results or audio_results or image_results
        db.UserInfo.update_one(
            {"username": username}, 
            {"$push": {"results": {"filename": filename, "results": results}}}
        )
        return jsonify(results), 200
    except Exception as e:
        os.remove(file_path) 
        return jsonify({"msg": f"Error processing file: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)