# application/set_up_db.py

from flask import Flask
import os
import sys

# Ensure the parent folder is in sys.path so 'application' package can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from application import app, db
from application.models import User, Team, RiderPosition, RaceLeague, RiderUrl

def setup_database(drop_existing=False):
    with app.app_context():
        if drop_existing:
            print("Dropping all tables...")
            db.drop_all()
        print("Creating tables...")
        db.create_all()
        print("Database setup complete!")

if __name__ == "__main__":
    setup_database()
