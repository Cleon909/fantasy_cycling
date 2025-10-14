from procyclingstats import RaceStartlist, Rider
from application.models import Team
from application import db
from flask import jsonify
from unidecode import unidecode

def start_list(race, year):
    url_string = f"race/{race}/{year}/startlist"
    race_startlist = RaceStartlist(url_string)
    rider_team_list = [
    [rider['rider_name'], rider['team_name']]
    for rider in race_startlist.parse()['startlist']
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

def get_rider_position_from_api(race, rider):
    url = f"rider/{rider}"
    print(url)
    response = Rider(url)
    for item in response.season_results():
        print(response.season_results())
        if 'stage_url' in item and race in item['stage_url']:
            if item['result'] == None:
                return 9999
            return item['result']
        

def mutate_name(name):
    name = unidecode(name)
    parts = name.split(' ')
    new_name = "-".join([parts[-1]] + parts[:-1]).lower()
    return new_name
