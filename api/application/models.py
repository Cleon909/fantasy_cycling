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
    team = db.Column(db.JSON)

    def __init__(self, user_id, race, team):
        self.user_id = user_id
        self.race = race
        self.team = team

class RiderPosition(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    race = db.Column(db.String(64), index=True, nullable=False)
    rider = db.Column(db.String(128), nullable=False)
    position = db.Column(db.Integer, nullable=False)
    points = db.Column(db.Integer, nullable=True)

    def __init__(self, race, rider, position, points):
        self.race = race
        self.rider = rider
        self.position = position
        self.polints = points