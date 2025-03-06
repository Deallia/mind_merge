from flask_wtf import FlaskForm
from wtforms import IntegerField, StringField, TextAreaField, SelectMultipleField, SelectField, PasswordField
from flask_wtf.file import FileField, FileRequired, FileAllowed
from wtforms.validators import InputRequired, NumberRange, EqualTo, Email, Length, Regexp, DataRequired, ValidationError


class RegisterForm(FlaskForm):
    username = StringField('Username', validators=[InputRequired()])
    password = PasswordField("Password", validators=[
        InputRequired(),
        Length(min=8, message="Password must be at least 8 characters long"),
        Regexp(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$', 
               message="Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")])
    confirmpassword = PasswordField("Confirm Password", validators=[
        InputRequired(),
        EqualTo('password', message='Passwords must match') ])
    email = StringField("Email", validators=[InputRequired()])
    biography = TextAreaField("Biography", validators=[InputRequired()])
    # profile = FileField("Profile", validators=[FileAllowed(['jpg', 'png'], 'Images only!')])

class LoginForm(FlaskForm):
    username = StringField('Username', validators=[InputRequired()])
    password = StringField("Password", validators=[InputRequired()])

class PostForm(FlaskForm):
    file = FileField("File", validators=[FileAllowed(['jpg','jpeg', 'png', 'pdf', 'doc', 'docx', 'mp4'], 'PDF, Word documents, videos, or images only!')])
    caption = TextAreaField("Caption", validators=[InputRequired()])
    link = StringField("Link")
    content_type = StringField("Content Type")
    subject = SelectField("Subject Category", choices=[('', 'Select...'), ('Biology', 'Biology'), ('Chemistry', 'Chemistry'), ('Geography', 'Geography'), ('Physics', 'Physics'), ('Other', 'Other')])
    title = StringField("Title", validators=[InputRequired()])

    # def validate(self):
    #     if not super().validate():
    #         return False

    #     if self.link.data and not self.content_type.data:
    #         self.content_type.errors.append("Content type is required when using a link.")
    #         return False

    #     return True

class AttributeForm(FlaskForm):
    subjects = SelectMultipleField('Subjects of Interest', choices=[
        ('Biology', 'Biology'),
        ('Chemistry', 'Chemistry'),
        ('Geography', 'Geography'),
        ('Physics', 'Physics')
    ], validators=[InputRequired()])

    formats = SelectMultipleField('Preferred Formats', choices=[
        ('flashcards', 'Flashcards'),
        ('quizzes', 'Quizzes'),
        ('pdf_eBook', 'PDF/eBooks'),
        ('image', 'Image'),
        ('video', 'Videos')
    ], validators=[InputRequired()])

    education_level = SelectField('Level of Education', choices=[
        ('undergraduate', 'Undergraduate'),
        ('graduate', 'Graduate'),
        ('highschool', 'High School')
    ], validators=[InputRequired()])



class QuizForm(FlaskForm):
    title = StringField('Title', validators=[InputRequired()])
    description = TextAreaField('Description')
    subject_area = SelectField('Subject Area', choices=[('Biology', 'Biology'), 
                                                       ('Chemistry', 'Chemistry'), 
                                                       ('Geography', 'Geography'),
                                                       ("Physics", "Physics"),
                                                       ('Other', 'Other')], validators=[InputRequired()])
    other_subject = StringField('Other Subject')
    visibility = SelectField('Visibility', choices=[('public', 'Public'), ('private', 'Private')], validators=[InputRequired()])
    file = FileField('Upload PDF File')
    text = TextAreaField('Paste Text', validators=[InputRequired()])
    num_questions = IntegerField('Number of Questions', validators=[NumberRange(min=1, max=15)])
    
 