from flask import Flask, request, jsonify, make_response, redirect, url_for
from flask_login import current_user, login_user, logout_user, login_required
from application.models import User
import jwt
import datetime
from application import app, SECRET_KEY, db



@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    try:
        if request.method == 'OPTIONS':
            print("OPTIONS request received")
            response = make_response('', 200)
            response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
            response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            return response

        print("POST request received")

        data = request.get_json()

        print(data)
      
        user =  User.query.filter_by(username=data['username']).first()
        # email = data.get('email')
        # password = data.get('password')
        logged_in = login_user(user)

        # if USERS.get(email) == password:
        #     token = jwt.encode({
        #         'email': email,
        #         'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        #     }, SECRET_KEY, algorithm='HS256')
        if logged_in:
            token = jwt.encode({
            'username': data['username'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
            }, SECRET_KEY, algorithm='HS256')
            response = jsonify({'token': token})
            response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            return response

        response = jsonify({'error': 'Invalid credentials'})
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response, 401

    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/register', methods=['POST', 'OPTIONS'])
def register():
    try:
        data = request.get_json()
        print(data)
        email = data['email']
        username = data['username']
        password = data['password']

        existing_user = User.query.filter((User.email == email) | (User.username == username)).first()
        if existing_user:
            return jsonify({'error': 'Username or email already exists'}), 409  # Conflict

        new_user = User(username, email, password)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User registered successfully'}), 200
    except Exception as e:
        print("ERROR:",str(e))
        return jsonify({'error':'server error'}), 500


