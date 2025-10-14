from flask import Flask, request, jsonify, make_response, redirect, url_for
from flask_login import current_user, login_user, logout_user, login_required
from application.models import User, Team, RiderPosition
import jwt
import datetime
import json
from application import app, SECRET_KEY, db
from application.helper_functions import start_list, save_team_to_db, get_rider_position_from_api, mutate_name
from functools import wraps
from dotenv import load_dotenv
import os

load_dotenv()

@app.before_request
def log_request_info():
    print("Headers:", request.headers)
    print("Method:", request.method)
    print("Path:", request.path)
    print("Body:", request.data)

@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    try:
        print("POST request received")

        data = request.get_json()

        print(data)
      
        user =  User.query.filter_by(username=data['username']).first()
        if not user:
            response = jsonify({'error': 'User not found'})
            response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            return response, 401

        logged_in = login_user(user)

        if logged_in:
            token = jwt.encode({
            'username': data['username'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=168)
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


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # JWT can be sent in the Authorization header as "Bearer <token>"
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        # Or you can accept it as a cookie or query param if you wish

        if not token:
            print(jsonify({'error': 'Token is missing!'}), 401)
            return jsonify({'error': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            current_user = User.query.filter_by(username=data['username']).first()
            if not current_user:
                return jsonify({'error': 'User not found!'}), 401
        except jwt.ExpiredSignatureError:
            print(jsonify({'error': 'Token has expired!'}), 401)
            return jsonify({'error': 'Token has expired!'}), 401
        except Exception as e:
            print(jsonify({'error': 'Token is invalid!', 'details': str(e)}), 401)
            return jsonify({'error': 'Token is invalid!', 'details': str(e)}), 401
        return f( current_user, *args, **kwargs)
    return decorated

@app.route('/api/check_token', methods = ['GET'])
@token_required
def check_token(current_user):
    return jsonify({
        'valid': True,
        'username': current_user.username
    }), 200 
        

@app.route('/api/register', methods=['POST', 'OPTIONS'])
def register():
    try:
        data = request.get_json()
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
@token_required
def riders(current_uer):
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

@app.route('/api/save_team', methods=['POST', 'OPTIONS'])
@token_required
def save_team(current_user):
    try:
        data = request.get_json()
        user = data.get('user')
        race = data.get('race')
        team = data.get('team')

        userID = User.query.filter_by(username=user).first().id
        print(f"recieved user: {user}, race: {race}, team:{team}")
        if not team:
            return jsonify({"error": "no team supplied"}, 404)
        save_team_to_db(userID, race, team)
        return jsonify({"message": "Team saved successfully"}), 200
    except Exception as e:
        print('error: ', str(e))
        return jsonify({"error": "Server error", "details": str(e)})

@app.route('/api/get_team', methods=['GET', 'OPTIONS'])
@token_required
def get_team(current_user):
    user = request.args.get('user')
    race = request.args.get('race')
    print(f"recieved user: {user}, race: {race}, userID {current_user.id}")
    team = Team.query.filter_by(user_id=current_user.id, race=race).first()
    if not team:
        return jsonify({"team": []})
    return jsonify({"team": team.team})

@app.route('/api/get_races', methods=['GET', 'OPTIONS'])
@token_required
def get_races(current_user):
    races_env = os.getenv('races')
    races = json.loads(races_env)
    return jsonify(races)

@app.route('/api/calculate_score', methods=['GET', 'OPTIONS'])
@token_required
def calculate_score(current_user,):
    race_name = request.args.get('race_name')
    riders_positions = {}
    try:
        list_of_teams = Team.query.filter_by(race=race_name).all()
        all_riders = [
            rider
            for team in list_of_teams
            if isinstance(team.team, list)
            for rider in team.team
        ]
        unique_riders = list(set(all_riders))
        for rider in unique_riders:
            rider = mutate_name(rider)
            position = get_rider_position_from_api(race_name, rider)
            print(f"Position for {rider}: {position}")
            if position is not None:
                riders_positions[rider] = position
                existing = RiderPosition.query.filter_by(race=race_name, rider=rider).first()
                if existing:
                    existing.position = position
                else:
                    db.session.add(RiderPosition(race=race_name, rider=rider, position=position))

        db.session.commit()
        return jsonify({"message": "Scores calculated successfully", "riders_positions": riders_positions}), 200
    except Exception as e:
        db.session.rollback()
        print("Error calculating scores:", str(e))
        return jsonify({"error": "Server error", "details": str(e)}), 500




# @app.route('/api/results', methods=['GET', 'OPTIONS'])
# def results(race_name):
#     # race_name is in format race/year/stage_number i.e. tour-de-france/2022/stage-18
#     try:
#         stage = Stage('race_name')
