from procyclingstats import RaceStartlist, Rider
from application.models import Team, RiderUrl
from application import db
from flask import jsonify


def start_list(race, year):
    url_string = f"race/{race}/{year}/startlist"
    race_startlist = RaceStartlist(url_string)
    parsed_startlist = race_startlist.parse()['startlist']
    for rider in parsed_startlist:
        existing_rider = RiderUrl.query.filter_by(rider_name=rider['rider_name']).first()
        if existing_rider:
            continue
        new_rider = RiderUrl(rider['rider_name'], rider['rider_url'])
        db.session.add(new_rider)
    db.session.commit()
    rider_team_list = [
    [rider['rider_name'], rider['team_name']]
    for rider in parsed_startlist
    ]
    return rider_team_list

def save_team_to_db(user_id, race, team):
    try:
        # 1️⃣ Check if a team already exists for this user & race
        existing_team = Team.query.filter_by(user_id=user_id, race=race).first()

        if existing_team:
            # 2️⃣ Update existing record
            existing_team.team = team
            print(f"Updated existing team for {user_id} / {race}")
        else:
            # 3️⃣ Create a new one if none exists
            new_team = Team(user_id=user_id, race=race, team=team)
            db.session.add(new_team)
            print(f"Created new team for {user_id} / {race}")

        # 4️⃣ Commit changes
        db.session.commit()
        return jsonify({'message': 'Team saved successfully'})

    except Exception as e:
        db.session.rollback()  # important to avoid broken sessions
        print("ERROR in save_team_to_db:", str(e))
        return jsonify({'error': 'Server error', 'details': str(e)}), 500

def get_rider_position_from_api(race, rider_url):
    response = Rider(rider_url)
    for item in response.season_results():
        if 'stage_url' in item and race in item['stage_url']:
            if item['result'] == None:
                return 9999
            return item['result']

def lookup_rider_url(rider_name):
        try:
            rider_url = RiderUrl.query.filter_by(rider_name=rider_name).first()
            return rider_url.rider_url
        except Exception as e:
            return "failed to find rider url"

def calculate_points_per_rider(position):
    if position == 1: return 20
    if position >= 11: return 0
    else: return 11 - position