from datetime import datetime, timezone
from . import db



class Users(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True)
    password = db.Column(db.String)
    email = db.Column(db.String, unique=True)
    biography = db.Column(db.String)
    profile_picture = db.Column(db.String)
    joined_on = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    
     ## references from other relations
    posts = db.relationship("Content", backref="user")
    interactions = db.relationship ("Interactions", backref="user")
    user_preferences = db.relationship("User_Preferences", backref = "user", foreign_keys="User_Preferences.user_id")
    

class Interactions(db.Model):
    __tablename__ = "interactions"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    interaction_type = db.Column(db.String)
    timestamp = db.Column(db.DateTime, default=datetime.now(timezone.utc))

    content_id = db.Column(db.Integer, db.ForeignKey("content.id"))
    # content = db.relationship("Content", backref="interaction")

class Content(db.Model):
    __tablename__ = "content"
    id = db.Column(db.Integer, primary_key=True)
    posted_by = db.Column(db.Integer, db.ForeignKey("users.id"))
    subject_area = db.Column(db.String)
    title = db.Column(db.String)
    description = db.Column(db.String)
    content_type = db.Column(db.String)
    content_url = db.Column(db.String)
    visibility = db.Column(db.String) 
    timestamp = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    interactions = db.relationship("Interactions", backref="content")

class User_Preferences(db.Model):
    __tablename__ = "user_preferences"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True)
    subjects = db.Column(db.String)
    media_formats = db.Column(db.String)
    education_level = db.Column(db.String)
    timestamp = db.Column(db.DateTime, default=datetime.now(timezone.utc))

class Content_recommendation(db.Model):
    __tablename__ = "content_recommendation"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    recommended_content_id = db.Column(db.Integer, db.ForeignKey("content.id"))
    recommendation_type = db.Column(db.String)
    timestamp = db.Column(db.DateTime, default=datetime.now(timezone.utc))


class Quiz_Results(db.Model):
    __tablename__ = "quiz_results"
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey("quizzes.id")) 
    score = db.Column(db.Float)
    timestamp = db.Column(db.DateTime, default=datetime.now(timezone.utc))

class Quizzes(db.Model):
    __tablename__ = "quizzes"
    id = db.Column(db.Integer, primary_key=True)
    content_id = db.Column(db.Integer, db.ForeignKey("content.id"))
    question_answer = db.Column(db.String)
    
    results = db.relationship("Quiz_Results", backref="quiz")


class Flashcards(db.Model):
    __tablename__ = "flashcards"
    id = db.Column(db.Integer, primary_key=True)
    content_id = db.Column(db.Integer, db.ForeignKey("content.id"))
    question_answer = db.Column(db.String)
    
# dict_string = ','.join([str(d) for d in list_of_dicts]) 
# dict_result = [dict(eval(d)) for d in dict_string.split(",")]
