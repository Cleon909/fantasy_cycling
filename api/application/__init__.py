from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_cors import CORS

app = Flask(__name__)
login = LoginManager(app)
login.login_view = 'login'

# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db/data.db'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////Users/michaelcorcoran/Documents/fantasy_cycling/api/db/data.db'
# app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:recipe@db/appdb'
app.config['SECRET_KEY'] = 'sdfgoikh'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
SECRET_KEY = 'sdfgoikh'
app.url_map.strict_slashes = False


db = SQLAlchemy(app)
CORS(app, supports_credentials=True, origins = ["https://www.cloudofsuspicion.uk", "http://localhost:5173"]) 

from application import routes