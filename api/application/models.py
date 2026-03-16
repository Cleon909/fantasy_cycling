from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    password_hash = db.Column(db.String(128))
    teams = db.relationship('Team', backref='user', lazy=True)

    def __init__(self, username, email, password):
        self.username = username
        self.email = email
        self.set_password(password)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Team(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    race = db.Column(db.String(64), index=True)
    year = db.Column(db.Integer, default=2026)
    team = db.Column(db.JSON)

    def __init__(self, user_id, race, team, year=2026):
        self.user_id = user_id
        self.race = race
        self.year = year
        self.team = team

class RiderPosition(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    race = db.Column(db.String(64), index=True, nullable=False)
    year = db.Column(db.Integer, default=2026)
    rider = db.Column(db.String(128), nullable=False)
    position = db.Column(db.Integer, nullable=False)
    points = db.Column(db.Integer, nullable=True)

    def __init__(self, race, rider, position, points, year=2026):
        self.race = race
        self.year = year
        self.rider = rider
        self.position = position
        self.points = points

class RaceLeague(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    race = db.Column(db.String(64), index=True)
    year = db.Column(db.Integer, default=2026, index=True)
    league = db.Column(db.JSON)

    __table_args__ = (
        db.UniqueConstraint('race', 'year', name='uq_race_league_race_year'),
    )

    def __init__(self, race, league, year=2026):
        self.race = race
        self.year = year
        self.league = league

class RiderUrl(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    rider_name = db.Column(db.String(64), index=True)
    rider_url = db.Column(db.String(64))

    def __init__(self, rider_name, rider_url):
        self.rider_name = rider_name
        self.rider_url = rider_url