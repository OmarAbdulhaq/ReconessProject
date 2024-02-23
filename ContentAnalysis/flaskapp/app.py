from flask import Flask, request, jsonify, session, redirect
from flask_cors import CORS, cross_origin
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from database import db 
from moviepy.editor import VideoFileClip
from jwt import encode, decode
from datetime import datetime, timedelta 
from functools import wraps
from secrets import token_urlsafe
from bson import ObjectId
from nltk.sentiment import SentimentIntensityAnalyzer

import numpy as np
import json
import os

from AnalysisAPIs.SA import SAPipeline
from AnalysisAPIs.SER import SERPipeline
from AnalysisAPIs.VFER import VFERPipeline

app = Flask(__name__)
SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'GwWt4TaQQbZ5Wp')
app.config['SECRET_KEY'] = SECRET_KEY
CORS(app)

MAX_FILE_SIZE = 50 * 1024 * 1024 
SA_PIPELINE_PATH = 'sa_pipeline.joblib'
SER_PIPELINE_PATH = 'ser_pipeline.joblib'
VFER_PIPELINE_PATH = 'vfer_pipeline.joblib'

SA_PIPELINE = SAPipeline.serialize(SA_PIPELINE_PATH) if os.path.exists(SA_PIPELINE_PATH) else SAPipeline()
SER_PIPELINE = SERPipeline.serialize(SER_PIPELINE_PATH) if os.path.exists(SER_PIPELINE_PATH) else SERPipeline()
VFER_PIPELINE = VFERPipeline.serialize(VFER_PIPELINE_PATH) if os.path.exists(VFER_PIPELINE_PATH) else VFERPipeline()
sia = SentimentIntensityAnalyzer()

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return json.JSONEncoder.default(self, obj)

app.json_encoder = CustomJSONEncoder

def convert_video_to_mp4(input_path, output_path):
    clip = VideoFileClip(input_path)
    clip.write_videofile(output_path, codec='libx264', audio_codec='aac')

def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        if not token:
            return jsonify({'message': 'Token is missing!'}), 403
        try:
            data = decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = db.UserInfo.find_one({"username": data['identity']})
            if not current_user:
                return jsonify({'message': 'User not found. Invalid token.'}), 404
        except Exception as e:
            return jsonify({'message': 'Token is invalid!'}), 403
        return f(current_user, *args, **kwargs)
    return decorated_function

def create_access_token(identity, expires_delta):
    payload = {
        'identity': identity,
        'exp': datetime.utcnow() + expires_delta
    }
    return encode(payload, SECRET_KEY, algorithm='HS256')


@app.route('/signup', methods=['POST']) 
def signup():
    users = db.UserInfo
    data = request.get_json()

    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if users.find_one({"username": username}):
        return jsonify({"message": "Username already exists"}), 400

    if users.find_one({"email": email}):
        return jsonify({"message": "Email already exists"}), 400

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
    if not app.config['SECRET_KEY']:
        app.logger.error("Secret Key is not set.")
        return jsonify({"msg": "Internal server error due to missing configuration."}), 500

    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        user = db.UserInfo.find_one({"username": username})
        if user and check_password_hash(user['password_hash'], password):
            expires_delta = timedelta(days=1)
            access_token = create_access_token(identity=username, expires_delta=expires_delta)
            return jsonify({'access_token': access_token, 'username': username}), 200
        else:
            return jsonify({"msg": "Invalid username or password"}), 401
    except KeyError as e:
        return jsonify({"msg": f"Missing field: {str(e)}"}), 400
    except Exception as e:
        app.logger.error(f"Error in login route: {str(e)}")
        return jsonify({"msg": "Internal server error"}), 500


@app.route('/logout', methods=['POST'])
def logout():
    data = request.get_json()
    username = data.get('username')

    user_session_key = f'user_{username}'
    session.pop(user_session_key, None)
    session.clear()

    return jsonify({"msg": "Logout successful", "redirect": "/login"}), 200

@app.route('/generate-backup-codes', methods=['POST'])
def generate_backup_codes():
    data = request.get_json()
    
    email = data.get('email')
    if not email:
        return jsonify({"message": "Email is required."}), 400

    user = db.UserInfo.find_one({"email": email})
    if not user:
        return jsonify({"message": "User not found."}), 404

    if user.get('backup_codes'):
        return jsonify({"message": "Backup codes have already been generated for this user."}), 200

    codes = [token_urlsafe(8) for _ in range(5)]
    db.UserInfo.update_one(
        {"email": email},
        {"$set": {"backup_codes": codes}}
    )

    return jsonify({"backup_codes": codes}), 200


@app.route('/reset-password-with-code', methods=['POST'])
def reset_password_with_code():
    data = request.get_json()
    email = data.get('email')
    backup_code = data.get('backup_code')
    new_password = data.get('new_password')
    
    if not all([email, backup_code, new_password]):
        return jsonify({"message": "Missing data"}), 400
    
    user = db.UserInfo.find_one({"email": email})
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    if backup_code not in user.get('backup_codes', []):
        return jsonify({"message": "Invalid backup code"}), 401
    
    new_password_hash = generate_password_hash(new_password)
    db.UserInfo.update_one(
        {"email": email},
        {
            "$set": {"password_hash": new_password_hash},
            "$pull": {"backup_codes": backup_code} 
        }
    )
    
    return jsonify({"message": "Password has been reset successfully"}), 200


@app.route('/change_password', methods=['PUT'])
def change_password():
    data = request.get_json()
    username = data.get('username')
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    user = db.UserInfo.find_one({"username": username})

    if not user or not check_password_hash(user['password_hash'], old_password):
        return jsonify({"message": "Invalid username or incorrect old password"}), 401

    new_password_hash = generate_password_hash(new_password)
    db.UserInfo.update_one(
        {"username": username},
        {"$set": {"password_hash": new_password_hash}}
    )

    return jsonify({"message": "Password changed successfully"}), 200

@app.route('/change_username', methods=['PUT'])
def change_username():
    data = request.get_json()
    original_username = data.get('original_username')
    new_username = data.get('new_username')
    user = db.UserInfo.find_one({"username": original_username})

    if not user:
        return jsonify({"message": "User not found"}), 404
    if db.UserInfo.find_one({"username": new_username}):
        return jsonify({"message": "This username is already taken"}), 400
    
    db.UserInfo.update_one(
        {"username": original_username},
        {"$set": {"username": new_username}}
    )
    return jsonify({"message": "Username changed successfully"}), 200


@app.route('/delete_account', methods=['DELETE'])
def delete_account():
    data = request.get_json()
    user_identifier = data.get('user_identifier')

    user = db.UserInfo.find_one({"username": user_identifier})
    if not user:
        return jsonify({"message": "User not found"}), 404

    db.UserInfo.delete_one({"username": user_identifier})
    db.AnalysisInfo.delete_many({"username": user_identifier})

    return jsonify({"message": "Account deleted successfully"}), 200


@app.route('/token', methods=['POST'])
@cross_origin()
def token():
    users = db.UserInfo
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        user = users.find_one({"username": username})

        if not user:
            return jsonify({"msg": "User not found"}), 404

        now = datetime.utcnow()
        if user.get("API_access_token") is None or user.get("API_access_token_expire", now) <= now:
            new_token = token_urlsafe(20)
            new_expire = now + timedelta(days=30)
            users.update_one(
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
            return jsonify({
                "msg": "Existing API token is still valid", 
                "API_access_token": user["API_access_token"], 
                "API_access_token_expire": user["API_access_token_expire"].isoformat()
            }), 200
    else:
        return jsonify({"msg": "Method not allowed"}), 405
    

@app.route('/medialysis', methods=['POST'])
@token_required
def medialysis(current_user):
    if 'file' not in request.files:
        return jsonify({"message": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400

    file.seek(0, os.SEEK_END)
    file_length = file.tell()
    file.seek(0) 
    if file_length > MAX_FILE_SIZE:
        return jsonify({"message": "File is larger than 50MB"}), 400

    filename = secure_filename(file.filename)
    user_data_dir = os.path.join("UserData", current_user["username"])
    os.makedirs(user_data_dir, exist_ok=True)

    base, ext = os.path.splitext(filename)
    counter = 1
    new_filename = filename
    while os.path.exists(os.path.join(user_data_dir, new_filename)):
        new_filename = f"{base}({counter}){ext}"
        counter += 1

    file_path = os.path.join(user_data_dir, new_filename)
    file.save(file_path)

    try:
        analysis_result = process_video_file(file_path)
        file_entry = {
            "filename": new_filename,
            "status": "completed",
            "analysis_result": analysis_result,
            "timestamp": datetime.utcnow(),
            "file_path": file_path
        }

        existing_doc = db.AnalysisInfo.find_one({"user_email": current_user['email']})

        if existing_doc:
            result = db.AnalysisInfo.update_one(
                {"user_email": current_user['email']},
                {"$push": {"files": file_entry}}
            )
            analysis_document_id = existing_doc['_id']
        else:
            analysis_document = {
                "user_email": current_user['email'],
                "files": [file_entry]
            }
            result = db.AnalysisInfo.insert_one(analysis_document)
            analysis_document_id = result.inserted_id

        return jsonify({"message": "File uploaded and analyzed successfully", "analysis_id": str(analysis_document_id)}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to process the video file {file_path}. Error: {str(e)}"}), 500

    
def convert_numpy_to_python(value):
    if isinstance(value, np.ndarray):
        return value.tolist()
    elif isinstance(value, (np.float32, np.float64, np.int32, np.int64)):
        return value.item() 
    else:
        return value
    
def process_video_file(file_path):
    try:
        face_results, voice_results, text_results = {}, {}, {}
        
        try:
            face_results = VFER_PIPELINE.process(file_path)
            face_results = {k: convert_numpy_to_python(v) for k, v in face_results.items()}
        except Exception as e:
            print(f"Error in VFER pipeline: {e}")
        
        try:
            voice_results = SER_PIPELINE.process(file_path)
            voice_results = {k: convert_numpy_to_python(v) for k, v in voice_results.items()}
        except Exception as e:
            print(f"Error in SER pipeline: {e}")
        
        try:
            text_results = SA_PIPELINE.process(file_path)
            text_results = {k: convert_numpy_to_python(v) for k, v in text_results.items()}
        except Exception as e:
            print(f"Error in SA pipeline: {e}")
        
        combined_results = {
            "visual": face_results,
            "audio": voice_results,
            "text": text_results
        }

        return combined_results
    except Exception as e:
        return {"error": f"Failed to process the video file {file_path}. Error: {str(e)}"}
    

@app.route('/dashboard', methods=['GET'])
@token_required
def get_latest_dashboard_results(current_user):
    if current_user is None:
        return jsonify({"message": "Authentication required"}), 401

    user_email = current_user['email']
    try:
        user_doc = db.AnalysisInfo.find_one({"user_email": user_email}, {'files': 1, '_id': 0})
        if user_doc and "files" in user_doc and len(user_doc["files"]) > 0:
            latest_file_analysis = user_doc["files"][-1]
            return jsonify(latest_file_analysis), 200
        else:
            return jsonify({"message": "No analysis records found for this user"}), 404
    except Exception as e:
        return jsonify({"error": "Failed to retrieve analysis results"}), 500

@app.route('/dashboard/<username>/<videoname>', methods=['GET'])
@token_required
def get_specific_dashboard_results(current_user, username, videoname):
    if current_user["username"] != username:
        return jsonify({"message": "Unauthorized access"}), 403

    user_email = current_user["email"]
    try:
        user_doc = db.AnalysisInfo.find_one(
            {"user_email": user_email, "files.filename": videoname},
            {'files.$': 1, '_id': 0}
        )
        if user_doc and "files" in user_doc and len(user_doc["files"]) > 0:
            specific_file_analysis = user_doc["files"][0]
            return jsonify(specific_file_analysis), 200
        else:
            return jsonify({"message": f"No analysis record found for video {videoname}"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve analysis results: {str(e)}"}), 500




@app.route('/submit_comment', methods=["POST"])
@token_required
def submit_comment(current_user):
    data = request.get_json(force=True)
    comment = data.get('comment')
    filename = data.get('analysis_id')  

    if not comment or not filename:
        return jsonify({"message": "Comment or filename missing"}), 400

    sentiment_scores = sia.polarity_scores(comment)
    compound_score = sentiment_scores['compound']
    
    if compound_score >= 0.05:
        sentiment = "Positive"
    elif compound_score <= -0.05:
        sentiment = "Negative"
    else:
        sentiment = "Neutral"

    result = db.AnalysisInfo.update_one(
        {"user_email": current_user['email'], "files.filename": filename},
        {"$push": {"files.$.comments": {
            "comment": comment,
            "sentiment": sentiment,
            "comment_timestamp": datetime.utcnow()
        }}}
    )

    if result.modified_count == 0:
        return jsonify({"message": "No matching analysis record found or update failed"}), 404

    return jsonify({"message": "Comment submitted successfully", "sentiment": sentiment}), 200


@app.route('/user_analysis', methods=['GET'])
@token_required
def user_analysis(current_user):
    try:
        now = datetime.utcnow()
        token_expiration = current_user.get('API_access_token_expire', now)
        token_valid = token_expiration > now
        days_until_expiration = (token_expiration - now).days if token_valid else 0

        analysisCursor = db.AnalysisInfo.find({"user_email": current_user['email']})
        analysis_list = []
        for analysis in analysisCursor:
            analysis_id = str(analysis['_id'])
            for file in analysis.get('files', []):
                timestamp_str = file['timestamp'].strftime('%Y-%m-%d %H:%M:%S') if file.get('timestamp') else None
                analysis_list.append({
                    "analysis_id": analysis_id,
                    "filename": file['filename'],
                    "timestamp": timestamp_str,
                    "status": file.get('status', 'Unknown')
                })
        
        response_data = {
            "analysis": analysis_list,
            "token_valid": token_valid,
            "days_until_token_expiration": days_until_expiration,
            "user_email": current_user['email']
        }
        return jsonify(response_data), 200
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred"}), 500



if __name__ == '__main__':
    app.run(debug=True)