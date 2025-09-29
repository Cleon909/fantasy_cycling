from flask import Flask, request, jsonify, make_response, redirect, url_for
from flask_login import current_user, login_user, logout_user, login_required
from application.models import User
import jwt
import datetime
from procyclingstats import Stage
from application import app, SECRET_KEY, db
from application.helper_functions import start_list



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
        password = data['password1']

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

@app.route('/api/riders', methods=['GET', 'OPTIONS'])
def riders():
    try:
        race = request.args.get('race')
        year = request.args.get('year')
        print(f"Received request: race={race}, year={year}")
        if not race or not year:
            return jsonify({"error": "Missing race or year parameter"}), 400
        data = start_list(race, year)
        if not data:
            return jsonify({"error": "No rider data found"}), 404
        return jsonify({"startList": data}), 200
    except Exception as e:
        print(f"There was a problem {race}, {year}")
        print("ERROR:",str(e))
        return jsonify({"error": "Server error", "details": str(e)}), 500


# @app.route('/api/results', methods=['GET', 'OPTIONS'])
# def results(race_name):
#     # race_name is in format race/year/stage_number i.e. tour-de-france/2022/stage-18
#     try:
#         stage = Stage('race_name')
