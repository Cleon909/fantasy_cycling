from procyclingstats import Rider
import pprint

rider = Rider("rider/tadej-pogacar")

def rider_position(rider, race):
    rider = Rider(f"rider/{rider}")
    for item in rider.season_results():
        if 'stage_url' in item and race in item['stage_url']:
            return item['result']

print(rider_position('tadej-pogacar', 'milano-sanremo'))