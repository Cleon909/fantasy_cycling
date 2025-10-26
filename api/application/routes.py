from flask import Flask, request, jsonify
from flask_login import current_user, login_user
from application.models import User, Team, RiderPosition, RaceLeague
import jwt
import datetime
import json
from application import app, SECRET_KEY, db
from application.helper_functions import start_list, save_team_to_db, get_rider_position_from_api, mutate_name, calculate_points_per_rider
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
    print(team)
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
    league_table = {}
    try:
        list_of_teams = Team.query.filter_by(race=race_name).all()
        for team in list_of_teams:
            league_table[team.user_id] = 0
        all_riders = [
            rider
            for team in list_of_teams
            if isinstance(team.team, list)
            for rider in team.team
        ]
        unique_riders = list(set(all_riders))
        for rider in unique_riders:
            rider_norm = mutate_name(rider)
            position = get_rider_position_from_api(race_name, rider_norm)
            points = calculate_points_per_rider(position)
            if position is not None:
                if rider_norm not in riders_positions:
                    riders_positions[rider_norm] = {}
                riders_positions[rider_norm]['position'] = position
                riders_positions[rider_norm]['points'] = points
                for team in list_of_teams:
                    if rider in team.team:
                        league_table[team.user_id] += points
                existing = RiderPosition.query.filter_by(race=race_name, rider=rider_norm).first()
                if existing:
                    existing.position = position
                    existing.points = points
                else:
                    db.session.add(RiderPosition(race=race_name, rider=rider, position=position, points=points))
                existing_league = RaceLeague.query.filter_by(race=race_name).first()
                if existing_league:
                    existing_league.league = league_table
                else:
                    db.session.add(RaceLeague(race=race_name, league=league_table))             
                db.session.commit()
        for team in league_table:
            print(f"User ID: {team}, Total Points: {league_table[team]}")
        return jsonify({"message": "Scores calculated successfully", "riders_positions": riders_positions}), 200
    except Exception as e:
        db.session.rollback()
        print("Error calculating scores:", str(e))
        return jsonify({"error": "Server error", "details": str(e)}), 500




@app.route('/api/get_position_and_points', methods=['GET', 'OPTIONS'])
@token_required
def results(current_user):
    try:
        race_name = request.args.get('race')
        print(f"Fetching position for race: {race_name}")
        rider_name = request.args.get('rider')
        normalised_rider_name = mutate_name(rider_name)
        print(f"Fetching position for rider: {normalised_rider_name}")
        rider_data = RiderPosition.query.filter_by(race=race_name, rider=normalised_rider_name).first()
        print(f"Rider data: {rider_data}")
        return jsonify({"position": rider_data.position, "points": rider_data.points}), 200
    except Exception as e:
        print("Error fetching position:", str(e))
        return jsonify({"error": "Server error", "details": str(e)}), 500
       
@app.route('/api/get_league', methods=['GET', 'OPTIONS'])
@token_required
def get_league(current_user):
    try:
        race_name = request.args.get('race')
        league_data = RaceLeague.query.filter_by(race=race_name).first()
        if not league_data:
            return jsonify({"league": {}}), 200
        return jsonify({"league": league_data.league}), 200
    except Exception as e:
        print("Error fetching league:", str(e))
        return jsonify({"error": "Server error", "details": str(e)}), 500

@app.route('/api/get_users', methods=['GET', 'OPTIONS'])
@token_required
def get_users(current_user):
    try:
        users = User.query.all()
        users_list = {}
        for user in users:
            users_list[user.id] = user.username
        return jsonify({"users": users_list}), 200
    except Exception as e:
        print("Error fetching users:", str(e))
        return jsonify({"error": "Server error", "details": str(e)}), 500