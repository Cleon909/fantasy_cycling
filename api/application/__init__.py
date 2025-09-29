from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_cors import CORS

app = Flask(__name__)
login = LoginManager(app)
login.login_view = 'login'

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../db/data.db'
# app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:recipe@db/appdb'
app.config['SECRET_KEY'] = 'sdfgoikh'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
SECRET_KEY = 'sdfgoikh'

db = SQLAlchemy(app)
CORS(app, supports_credentials=True) 

from application import routes