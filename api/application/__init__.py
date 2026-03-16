import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_cors import CORS

app = Flask(__name__)
login = LoginManager(app)
login.login_view = 'login'

# --- Ensure the database folder exists ---
db_dir = os.path.join(os.path.abspath(os.path.dirname(__file__)), '..', 'db')
os.makedirs(db_dir, exist_ok=True)

db_path = os.path.join(db_dir, 'data.db')
print(db_path)
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{db_path}"
# ----------------------------------------

app.config['SECRET_KEY'] = 'sdfgoikh'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.url_map.strict_slashes = False

db = SQLAlchemy(app)
CORS(
    app,
    supports_credentials=True,
    origins=[
        "https://www.cloudofsuspicion.uk",
        "https://cloudofsuspicion.uk",
        "http://www.cloudofsuspicion.uk",
        "http://cloudofsuspicion.uk",
        "http://localhost:5173",
    ],
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
)

from application import routes

# from flask import Flask
# from flask_sqlalchemy import SQLAlchemy
# from flask_login import LoginManager
# from flask_cors import CORS
# import os

# app = Flask(__name__)
# login = LoginManager(app)
# login.login_view = 'login'


# basedir = os.path.abspath(os.path.dirname(__file__))
# db_path = os.path.join(basedir, 'db', 'data.db')
# app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{db_path}"

# # app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db/data.db'
# # app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////Users/michaelcorcoran/Documents/fantasy_cycling/api/db/data.db'
# app.config['SECRET_KEY'] = 'sdfgoikh'
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
SECRET_KEY = 'sdfgoikh'
# app.url_map.strict_slashes = False


# db = SQLAlchemy(app)
# CORS(app, supports_credentials=True, origins = ["https://www.cloudofsuspicion.uk", "http://localhost:5173"]) 

# from application import routes