from procyclingstats import RaceStartlist
def riders():
    race_startlist = RaceStartlist("race/world-championship/2025/startlist")
    rider_team_list = [
    [rider['rider_name'], rider['team_name']]
    for rider in race_startlist.parse()['startlist']
    ]
    return rider_team_list

