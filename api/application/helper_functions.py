from __future__ import annotations

import datetime
from functools import lru_cache

from procyclingstats import Race, RaceStartlist, Rider
from application.models import Team, RiderUrl
from application import db
from flask import jsonify

_PCS_PATCHED = False


def _patch_procyclingstats_to_use_curl_cffi() -> None:
    """Monkeypatch procyclingstats to fetch pages with curl_cffi instead of requests.

    procyclingstats centralizes HTTP in `procyclingstats.scraper.Scraper.update_html`.
    We swap that implementation to use curl_cffi (Chrome impersonation) to reduce
    Cloudflare blocks, while still parsing with procyclingstats' own scrapers.
    """

    global _PCS_PATCHED
    if _PCS_PATCHED:
        return

    try:
        from curl_cffi import requests as curl_requests  # type: ignore
    except Exception:
        # If curl_cffi isn't installed, keep default behaviour.
        print(
            "curl_cffi not installed; procyclingstats will fall back to requests. "
            "Install curl_cffi to reduce Cloudflare blocks."
        )
        return

    from procyclingstats import scraper as pcs_scraper

    default_headers = {
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/122.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-GB,en;q=0.9",
        "Referer": pcs_scraper.Scraper.BASE_URL,
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
    }

    def _update_html_with_curl(self) -> None:  # noqa: ANN001
        try:
            resp = curl_requests.get(
                self._url,  # pylint: disable=protected-access
                headers=default_headers,
                timeout=60,
                impersonate="chrome",
            )
        except TypeError:
            # Older curl_cffi versions may not support `impersonate=`.
            resp = curl_requests.get(
                self._url,  # pylint: disable=protected-access
                headers=default_headers,
                timeout=60,
            )

        if hasattr(resp, "raise_for_status"):
            resp.raise_for_status()
        elif getattr(resp, "status_code", 200) >= 400:
            raise Exception(f"HTTP {getattr(resp, 'status_code', '???')} from {self._url}")
        html_str = resp.text
        self._html = pcs_scraper.HTMLParser(html_str)  # pylint: disable=protected-access

    pcs_scraper.Scraper.update_html = _update_html_with_curl
    _PCS_PATCHED = True


_patch_procyclingstats_to_use_curl_cffi()


def _utc_today() -> datetime.date:
    return datetime.datetime.now(datetime.timezone.utc).date()


@lru_cache(maxsize=256)
def get_race_start_date(race: str, year: int) -> datetime.date | None:
    """Return the race start date (UTC date) for a PCS race slug/year.

    `race` should be the PCS slug used elsewhere in this app (e.g. "milano-sanremo").
    """

    try:
        startdate_str = Race(f"race/{race}/{year}").startdate()
        # procyclingstats returns YYYY-MM-DD
        return datetime.date.fromisoformat(startdate_str)
    except Exception as e:
        print(f"Failed to fetch startdate for race={race} year={year}: {e}")
        return None


def race_team_is_locked(race: str, year: int, today: datetime.date | None = None) -> bool:
    """True if users should be prevented from selecting/updating teams."""

    if today is None:
        today = _utc_today()
    start_date = get_race_start_date(race, year)
    if start_date is None:
        # If we can't determine the start date, default to *not* locking to
        # avoid blocking the app due to transient scrape failures.
        return False
    return today >= start_date


def start_list(race, year):
    url_string = f"race/{race}/{year}/startlist"

    parsed_startlist = RaceStartlist(url_string).parse()["startlist"]

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

def save_team_to_db(user_id, race, team, year=2026):
    try:
        # 1️⃣ Check if a team already exists for this user & race & year
        existing_team = Team.query.filter_by(user_id=user_id, race=race, year=year).first()

        if existing_team:
            # 2️⃣ Update existing record
            existing_team.team = team
            print(f"Updated existing team for {user_id} / {race} / {year}")
        else:
            # 3️⃣ Create a new one if none exists
            new_team = Team(user_id=user_id, race=race, team=team, year=year)
            db.session.add(new_team)
            print(f"Created new team for {user_id} / {race} / {year}")

        # 4️⃣ Commit changes
        db.session.commit()
        return jsonify({'message': 'Team saved successfully'})

    except Exception as e:
        db.session.rollback()  # important to avoid broken sessions
        print("ERROR in save_team_to_db:", str(e))
        return jsonify({'error': 'Server error', 'details': str(e)}), 500

def get_rider_position_from_api(race, rider_url, year=None):
    try:
        response = Rider(rider_url)
        # If year is specified, try to get year-specific results
        if year:
            try:
                # Try to get results for the specific year
                year_results = response.season_results(str(year))
                results_to_check = year_results
            except:
                # Fall back to all season results if year-specific fails
                results_to_check = response.season_results()
        else:
            results_to_check = response.season_results()
            
        for item in results_to_check:
            if 'stage_url' in item and race in item['stage_url']:
                # Additional check: if we have date info, make sure it's from the right year
                if year and 'date' in item:
                    item_year = str(item['date'])[:4] if item['date'] else None
                    if item_year and item_year != str(year):
                        continue
                if item['result'] is None:
                    return 9999
                return item['result']
        return None  # No result found for this race/year
    except Exception as e:
        print(f"Error getting rider position for {rider_url}: {e}")
        return None

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