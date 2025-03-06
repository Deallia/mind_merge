from flask import Flask

from .config import Config
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_wtf.csrf import CSRFProtect
from flask_cors import CORS
from sqlalchemy import text

app = Flask(__name__)
csrf = CSRFProtect(app)
CORS(app)
app.config.from_object(Config)

db = SQLAlchemy(app)
migrate = Migrate(app, db)
# with app.app_context():
#     drop_query = text("DROP TABLE IF EXISTS flashcards CASCADE")
#     db.session.execute(drop_query)
#     db.session.commit()
from app import views