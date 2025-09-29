from procyclingstats import RaceStartlist

def start_list(race, year):
    url_string = f"race/{race}/{year}/startlist"
    race_startlist = RaceStartlist(url_string)
    rider_team_list = [
    [rider['rider_name'], rider['team_name']]
    for rider in race_startlist.parse()['startlist']
    ]
    return rider_team_list