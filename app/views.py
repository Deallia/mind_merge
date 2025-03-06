from . import app
from flask import render_template, request, jsonify, send_file, send_from_directory
import os
from .db_models import *
from werkzeug.utils import secure_filename
from flask_wtf.csrf import generate_csrf
from app import db
from .forms import *
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from functools import wraps
from ml_app.mcq_generation import MCQGenerator
from ml_app.recommendation_sys import RecommendationGenerator
from sqlalchemy import or_, and_ , distinct
from sqlalchemy.orm import joinedload
from io import StringIO
import docx
from PIL import Image
import pandas as pd
import fitz  
from moviepy.editor import VideoFileClip
from PIL import Image

# ----------------------------------------------------------Security section---------------------------------------------------------------------------------

# ------------ authorization function--------------------- #
def authorize(f):
    @wraps(f)
    def decorated_function(*args, **kws):
            if not 'Authorization' in request.headers:
                return jsonify({
                    "error": "token missing! Unable to access webpage"
                }), 401
            currentuser = None
            token = request.headers["Authorization"].split(" ")[1]
            try:
                currentuser = jwt.decode(token, app.config['SECRET_KEY'], algorithms="HS256")
            except:
                return jsonify({
                    "error": "token missing! Unable to access webpage"
                }), 401 
            return f(*args, **kws)    
    return decorated_function


# ------------ register route--------------------- #
@app.route("/register", methods=["POST"])
def register():
    form = RegisterForm()
    if request.method == "POST" and form.validate_on_submit():
        username = form.data['username']
        users = Users.query.filter_by(username=username.lower()).first()
        if not users:
            password = form.data['password']
            email = form.data['email']
            biography = form.data['biography']
            # f = form.profile.data
            # filename = secure_filename(f.filename)
            # img_url = os.path.join(app.config['UPLOAD_FOLDER'],filename)
            # f.save(img_url)

            user = Users(
                username=username.lower(),
                password=generate_password_hash(password, method='pbkdf2:sha256'),
                email=email.lower(),
                biography=biography,
                profile_picture = ''
            )

            db.session.add(user)
            db.session.commit()
            joined = user.joined_on

            data = {}
            data['id'] = user.id
            data['username'] = user.username
            token = jwt.encode(data,app.config["SECRET_KEY"], algorithm="HS256")

            return jsonify({
                "message": "Your new MindMerge account was successfully created",
                "token": token,
                "username": str(username),
                "password": str(user.password),
                "email": str(user.email),
                "biography": str(user.biography),
                "joined on": str(joined),

            })
        else:
            return jsonify({"error":"That username already exist! Try adding special characters to make it unique."})
    else: 
        return jsonify({
            "errors": form_errors(form)
        })



# # ------------ user prefences --------------------- #

@app.route('/register/attribute/<userID>', methods=['POST'])
@authorize
def handle_attribute_form(userID):
    form = AttributeForm()
    if form.validate_on_submit():
        subjects = form.data['subjects']
        formats = form.data['formats']
        subjects_lst = ','.join(subjects)
        formats_lst = ','.join(formats)
        education_level = form.data['education_level']
        
        user_preferences = User_Preferences (user_id=userID,
                                            media_formats=formats_lst,
                                            subjects=subjects_lst,
                                            education_level=education_level)
        print(user_preferences.subjects)
        db.session.add(user_preferences)
        db.session.commit()
        return jsonify ({"message":"success"
                        #  "user": user_preferences.user_id
                         })
    else:
        errors = form_errors(form)
        return jsonify({"errors": errors}), 400 
    
    
# # ------------ for generating csrf token --------------------- #
@app.route('/csrf-token', methods=['GET'])
def get_csrf():
    return jsonify({'csrf_token': generate_csrf()})

@app.route('/ai')
def ai_model():
    MCQ_Generator = MCQGenerator(True)

    context = '''The koala or, inaccurately, koala bear[a] (Phascolarctos cinereus), is an arboreal herbivorous marsupial native to Australia. It is the only extant representative of the family Phascolarctidae and its closest living relatives are the wombats, which are members of the family Vombatidae. The koala is found in coastal areas of the mainland's eastern and southern regions, inhabiting Queensland, New South Wales, Victoria, and South Australia. It is easily recognisable by its stout, tailless body and large head with round, fluffy ears and large, spoon-shaped nose. The koala has a body length of 60–85 cm (24–33 in) and weighs 4–15 kg (9–33 lb). Fur colour ranges from silver grey to chocolate brown. Koalas from the northern populations are typically smaller and lighter in colour than their counterparts further south. These populations possibly are separate subspecies, but this is disputed.'''

    context_oxygen = '''In mathematics, a permutation, factorial, combination, infinity, derivative of a set can mean one of two different things...'''

    result = MCQ_Generator.generate_mcq_questions(context_oxygen, 10) 
    return jsonify ({"result":result,
                    "length": len(result)})
    

# # ------------ login --------------------- #
@app.route('/auth/login', methods=["POST"])
def login():
    form = LoginForm()
    if request.method == "POST" and form.validate_on_submit():
        username = form.data['username']
        password = form.data['password']
        user = Users.query.filter(or_(Users.email == username.lower(), Users.username == username)).first()
        if(not user):
            return jsonify({
                "error": "Invalid username or password!"
            })
        if(not(check_password_hash(user.password, password))):
            return jsonify({
                "error": "Invalid username or password!"
            })
        data = {}
        data['id'] = user.id
        data['username'] = user.username
        token = jwt.encode(data,app.config["SECRET_KEY"], algorithm="HS256")
        return jsonify({
            "message": "Login was successful",
            "token": token
    })

# ------------ fetch user profile --------------------- #
def getProfile():
    pass

    # ------------ logout route --------------------- #        
        
@app.route("/api/v1/auth/logout", methods=["POST"])
def logout():
    return jsonify({
        "message": "User logged out"
    })



# ----------------------------------------------------------Security section---------------------------------------------------------------------------------






# ------------ for fetching a single user --------------------- #

@app.route("/users/<userID>", methods=["GET"])
def get_user(userID):
    if (userID == "currentuser"):
        token = request.headers["Authorization"].split(" ")[1]
        user = jwt.decode(token, app.config['SECRET_KEY'], algorithms="HS256")
        print(user)
        userID = user['id']
    user = Users.query.filter_by(id=userID).first()
    attr = User_Preferences.query.filter_by(user_id=userID).first()
    print(attr)
    if (not user):
        return jsonify({
            "error": "user not found"
        }), 404
    if attr:
        return jsonify({ "id": user.id,
            "username": user.username,
            "email": user.email,
            "biography": user.biography,
            "joined_on": user.joined_on,
            "subjects": attr.subjects,
            "media_formats": attr.media_formats,
            "education":attr.education_level
            })
    
    return jsonify({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "biography": user.biography,
            "joined_on": user.joined_on
        }), 200
    




# ------------ creating a post --------------------- #

@app.route("/post", methods=["POST"])
@authorize
def create_post():
    form = PostForm()
    try:
        token = request.headers["Authorization"].split(" ")[1]
        decoded_data = jwt.decode(token, app.config['SECRET_KEY'], algorithms="HS256")
    except:
        return jsonify({
            "error": "token not present!"
        }), 404
    id = decoded_data['id']
    user = Users.query.filter_by(id=id).first()
    if(not user):
        return jsonify({
            "message": "user does not exist"
        })
    
    if request.method == "POST" and form.validate_on_submit():
        title = form.data['title']
        caption = form.data['caption']
        subject = form.data['subject']
        file = form.file.data
        visibility= "public"
        print(file)
        if file is not None:
            filename = secure_filename(file.filename)
            file_url = os.path.join(app.config['UPLOAD_FOLDER'],filename)
            file.save(file_url)
            content_type = file.content_type
            file_format=''
            if content_type == 'application/pdf':
                file_format="pdf_eBook"
            elif content_type == 'image/jpeg':
                file_format='image'
            elif content_type == 'image/jpg':
                file_format='image'
            elif content_type == 'video/mp4':
                file_format = 'video'
            elif content_type == 'application/msword':
                file_format="pdf_eBook"
            elif content_type == 'image/png':
                file_format = 'image'
            post = Content(posted_by=user.id,
                           title=title,
                           description=caption,
                           content_url= filename,
                           content_type=file_format,
                           subject_area = subject,
                           visibility=visibility)
            db.session.add(post)
            db.session.commit()
        else:
            link = form.data['link']
            content_type = form.data['content_type']
            post = Content(posted_by=user.id,
                           title=title,
                           description=caption,
                           content_url= link,
                           content_type=content_type,
                           subject_area = subject,
                           visibility=visibility)
            db.session.add(post)
            db.session.commit()


        return jsonify({
            "message": "post created",
            "subject" : subject,
            "caption" : caption,
            "content type": content_type
        })
    else:
        return "server error"




@app.route("/")
def index():
    return jsonify({"WELCOME":"This is the API"})


# ------------ creating a quiz--------------------- #
@app.route('/create/quiz', methods=['POST'])
@authorize
def handle_quiz_form():
    form = QuizForm()
    print(form.data)

    try:
        token = request.headers["Authorization"].split(" ")[1]
        decoded_data = jwt.decode(token, app.config['SECRET_KEY'], algorithms="HS256")
    except:
        return jsonify({
            "error": "token not present!"
        }), 404
    id = decoded_data['id']
    user = Users.query.filter_by(id=id).first()
    if(not user):
        return jsonify({
            "message": "user does not exist"
        })
    if form.validate_on_submit():
        userID = user.id
        title = form.data['title']
        description = form.data['description']
        subject_area = form.data['subject_area']
        visibility = form.data['visibility']
        text = form.data['text']
        num_questions = int(form.data['num_questions'])
        thumbnail = ""
        if subject_area =="Biology":
            thumbnail = "biology_quiz_thumbnail.jpg"
        elif subject_area == "Chemistry":
            thumbnail = "chemistry_quiz_thumbnail.jpg"
        elif subject_area == "Geography":
            thumbnail = "geography_quiz_thumbnail.jpg"
        elif subject_area == "Physics":
            thumbnail ="physics_quiz_thumbnail.jpg"
        else:
            thumbnail = "subject.png"

        if text =="":
            file = form.data['file']
            # convert the pdf to text
            # text = converted(file)

        # Process the form data further (e.g., save to database)
        mcq_generator = MCQGenerator(True)
        generated_questions = mcq_generator.generate_mcq_questions(text, num_questions)
        result = '_'.join(str(d) for d in generated_questions) 
        quiz_content = Content(title = title,
                                posted_by = userID,
                                description = description,
                                subject_area = subject_area,
                                visibility = visibility,
                                content_url = thumbnail,
                                content_type = "quizzes")
        db.session.add(quiz_content)
        db.session.commit()
        quiz = Quizzes(content_id = quiz_content.id,
                                question_answer = result)
        db.session.add(quiz)
        db.session.commit()
        return jsonify({
        "message": "success",
        "user": quiz_content.posted_by,
        "quiz": quiz_content.id

        
    })
    else:
        # Form data is invalid
        errors = form_errors(form)
        return jsonify({"errors": errors}), 400 


# ------------ creating a flaschcard set --------------------- #
@app.route('/create/flashcard_set', methods=['POST'])
@authorize
def handle_flashcardSet_form():
    form = QuizForm()
    print(form.data)

    try:
        token = request.headers["Authorization"].split(" ")[1]
        decoded_data = jwt.decode(token, app.config['SECRET_KEY'], algorithms="HS256")
    except:
        return jsonify({
            "error": "token not present!"
        }), 404
    id = decoded_data['id']
    user = Users.query.filter_by(id=id).first()
    if(not user):
        return jsonify({
            "message": "user does not exist"
        })
    if form.validate_on_submit():
        userID = user.id
        title = form.data['title']
        description = form.data['description']
        subject_area = form.data['subject_area']
        visibility = form.data['visibility']
        text = form.data['text']
        num_questions = int(form.data['num_questions'])
        thumbnail=""
        if subject_area =="Biology":
            thumbnail = "biology_quiz_thumbnail.jpg"
        elif subject_area == "Chemistry":
            thumbnail = "chemistry_quiz_thumbnail.jpg"
        elif subject_area == "Geography":
            thumbnail = "geography_quiz_thumbnail.jpg"
        elif subject_area == "Physics":
            thumbnail ="physics_quiz_thumbnail.jpg"
        else:
            thumbnail = "subject.png"
        if text =="":
            file = form.data['file']
            # convert the pdf to text
            # text = converted(file)
       

        # Process the form data further (e.g., save to database)
        mcq_generator = MCQGenerator(True)
        generated_questions = mcq_generator.generate_flashcard_pairs(text, num_questions)
        result = '_'.join([str(d) for d in generated_questions]) 
        flashcard_set = Content(title = title,
                                posted_by = userID,
                                description = description,
                                subject_area = subject_area,
                                visibility = visibility,
                                content_url = thumbnail,
                                content_type = "flashcards")
        db.session.add(flashcard_set)
        db.session.commit()
        flashcards = Flashcards(content_id = flashcard_set.id,
                                question_answer = result)
        db.session.add(flashcards)
        db.session.commit()
        return jsonify({
        "message": "success",
        "user": flashcard_set.posted_by,
        "flashcard": flashcard_set.id
    })
    else:
        # Form data is invalid
        errors = form_errors(form)
        return jsonify({"errors": errors}), 400 
    


# ------------ fetch user's quiz --------------------- #
@app.route("/quiz_<quizID>", methods=["GET"])
def get_quiz(quizID):
    quiz = Content.query.join(Quizzes, Content.id == Quizzes.content_id) \
                    .add_columns(Content.id, Content.visibility, Content.posted_by,
                                 Content.title, Content.timestamp, Content.description,
                                 Content.subject_area, Quizzes.question_answer) \
                    .filter(Quizzes.content_id == quizID).first()
    
    if quiz.visibility =="private":
        try:
            token = request.headers["Authorization"].split(" ")[1]
            decoded_data = jwt.decode(token, app.config['SECRET_KEY'], algorithms="HS256")
        except:
            return jsonify({
                "error": "token not present!"
            }), 404
        id = decoded_data['id']
        user = Users.query.filter_by(id=id).first()
        if quiz.visibility =="private" and user.id != quiz.posted_by:
             return jsonify({"error":"access to this quiz is restricted"})

    if quiz is not None: 
        user = Users.query.filter_by(id=quiz.posted_by).first()
        quiz_dict_lst = [dict(eval(d)) for d in quiz.question_answer.split("_")]
        quiz_details ={
            'title': quiz.title,
            'description':quiz.description,
            'posted_by': user.username,
            'created_at':quiz.timestamp,
            'question_answer': quiz_dict_lst,
            'subject_area': quiz.subject_area,
            'num_questions':len(quiz_dict_lst)
        }
        return jsonify(quiz_details)
    else:
         return jsonify({"error":"quiz does not exist"}), 400
     

# ------------ fetch user's flashcard set --------------------- #
@app.route("/flashcard_<flashcard_setID>", methods=["GET"])
def get_flashcard_set(flashcard_setID):
    flashcard_set = Content.query.join(Flashcards, Content.id == Flashcards.content_id) \
                    .add_columns(Content.id, Content.visibility, Content.posted_by,
                                 Content.title, Content.timestamp, Content.description,
                                 Content.subject_area, Flashcards.question_answer) \
                    .filter(Flashcards.content_id == flashcard_setID).first()

    if flashcard_set.visibility =="private":
        try:
            token = request.headers["Authorization"].split(" ")[1]
            decoded_data = jwt.decode(token, app.config['SECRET_KEY'], algorithms="HS256")
        except:
            return jsonify({
                "error": "token not present!"
            }), 404
        id = decoded_data['id']
        user = Users.query.filter_by(id=id).first()
        if user.id != flashcard_set.posted_by:
            return jsonify({"error":"access to this flashcard set is restricted"})

    
    if flashcard_set:
        flashcards_dict_lst = [dict(eval(d)) for d in flashcard_set.question_answer.split("_")]
        flashcard_set_details ={
            'title': flashcard_set.title,
            'description':flashcard_set.description,
            'posted_by': flashcard_set.posted_by,
            'created_at':flashcard_set.timestamp,
            'question_answer': flashcards_dict_lst,
            'subject_area': flashcard_set.subject_area,
            'num_questions':len(flashcards_dict_lst)
        }
        return jsonify(flashcard_set_details)
    else:
         return jsonify({"error":"flashcard set does not exist"}), 400

# ------------ fetch user posts --------------------- #
@app.route("/users/<userId>/posts", methods=["GET"])

def get_posts(userId):

    user = Users.query.filter_by(id=userId).first()
    posts = Content.query.filter_by(posted_by=userId).all()
    bookmarks = Interactions.query.filter_by(user = user, interaction_type="bookmarked").all()
    arr = []
    arr_b =[]
    for content in posts:
        thumbnail = generate_thumbnail(content.content_url)
        obj = {
           "id": content.id,
            "content_url":content.content_url,
            "content_type": content.content_type,
            "thumbnail": f"/file/{thumbnail}",
            "caption": content.description,
            "title": content.title,
            "created_at": content.timestamp,
            "posted_by":user.username,
            "views": Interactions.query.filter_by(interaction_type="viewed", content_id = content.id).count(),
            "bookmarked": "true" if Interactions.query.filter_by(content_id=content.id, user_id=user.id, interaction_type="bookmarked").first() else "false"
        }
        
        arr.append(obj)
    for post in bookmarks:
        content = Content.query.filter_by(id=post.content_id).first()
        thumbnail = generate_thumbnail(content.content_url)
        obj_b = {
            "id": content.id,
            "content_url":content.content_url,
            "content_type": content.content_type,
            "thumbnail": f"/file/{thumbnail}",
            "caption": content.description,
            "title": content.title,
            "created_at": content.timestamp,
            "posted_by":user.username,
            "views": Interactions.query.filter_by(interaction_type="viewed", content_id = content.id).count(),
            "bookmarked": "true" 
        }
        arr_b.append(obj_b)
    
    return jsonify({
        "posts": arr,
        "bookmarks": arr_b,
    })

# ------------ fetch user posts --------------------- #
@app.route("/users/<userId>/posts/public/<currentuserId>", methods=["GET"])
def view_profile_posts(userId, currentuserId):
    currentuser=Users.query.filter_by(id=currentuserId).first()
    user = Users.query.filter_by(id=userId).first()
    posts = Content.query.filter_by(posted_by=userId, visibility="public").all()
    if currentuser:
        arr = []
        
        for content in posts:
            thumbnail = generate_thumbnail(content.content_url)
            obj = {
            "id": content.id,
                "content_url":content.content_url,
                "content_type": content.content_type,
                "thumbnail": f"/file/{thumbnail}",
                "caption": content.description,
                "title": content.title,
                "created_at": content.timestamp,
                "posted_by":user.username,
                "views": Interactions.query.filter_by(interaction_type="viewed", content_id = content.id).count(),
                "bookmarked": "true" if Interactions.query.filter_by(content_id=content.id, user_id=currentuser.id, interaction_type="bookmarked").first() else "false"
            }
            
            arr.append(obj)

        
        return jsonify({
            "posts": arr
            
        })
    else:
        return jsonify ({"error":"current user does not exist in the system"})
# ------------ creating thumbnails for files --------------------- #

# Function to extract thumbnail from Word document
def extract_docx_thumbnail(filename):
    file_path = os.path.join(os.getcwd(), app.config['UPLOAD_FOLDER'], filename)
    doc = docx.Document(file_path)
    first_page = doc.sections[0].header
    
    thumbnail = Image.new('RGB', (800, 600), 'white')
    
    # Iterate over the elements in the first page and draw them on the image
    for element in first_page.element.body:
        if isinstance(element, docx.image.Image):
            # If the element is an image, draw it on the image
            image = Image.open(element.filename)
            thumbnail.paste(image, (0, 0))
    
    file_url = os.path.join(app.config['UPLOAD_FOLDER'],filename.split('.')[0])
    thumbnail_name = filename.split(".")[0] + "_thumbnail.jpg"
    thumbnail_path = f"{file_url}_thumbnail.jpg"
    thumbnail.save(thumbnail_path, 'JPEG')
    
    return thumbnail_name


# Function to extract thumbnail from PDF
def generate_pdf_thumbnail(filename):
    file_path = os.path.join(os.getcwd(), app.config['UPLOAD_FOLDER'], filename)
    # Open the PDF file
    pdf_document = fitz.open(file_path)
    
    page = pdf_document[0]
    
    image = page.get_pixmap()
    
    # Save the image as a JPEG
    
    file_path = os.path.join(app.config['UPLOAD_FOLDER'],filename.split('.')[0])
    thumbnail_name = filename.split(".")[0] + "_thumbnail.jpg"
    thumbnail_path = f"{file_path}_thumbnail.jpg"
    image.save(thumbnail_path)
    
    pdf_document.close()
    
    return thumbnail_name



def generate_thumbnail(filename):
    file_path = os.path.join(os.getcwd(), app.config['UPLOAD_FOLDER'], filename)
    file_extension = file_path.split('.')[-1].lower()
    
    if file_extension in ['jpg', 'jpeg', 'png']:
        return filename
    elif file_extension == 'mp4':
        # For videos
        clip = VideoFileClip(file_path)
        file_url = os.path.join(app.config['UPLOAD_FOLDER'],filename.split('.')[0])
        thumbnail_path = f"{file_url}_thumbnail.jpg"
        clip.save_frame(thumbnail_path, t=0) 
        return thumbnail_path
    elif file_extension == 'pdf':
        # For PDFs
        return generate_pdf_thumbnail(filename)
    elif file_extension in ['doc','docx']:
        # For doc file types
        return extract_docx_thumbnail(filename)
    

# ------------ fetching files --------------------- #
@app.route("/file/<filename>", methods=['GET'])
def getfile(filename):

    return send_from_directory(os.path.join(os.getcwd(), app.config['UPLOAD_FOLDER']), filename)

# ------------ fetching files --------------------- #
@app.route("/open_file/<filename>", methods=['GET'])
def openfile(filename):
    file_extension = filename.rsplit('.', 1)[1].lower()
    content_type = {
        'pdf': 'application/pdf',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'doc': 'application/msword',
        'docx': 'application/msword'
    
    }.get(file_extension, 'application/octet-stream') 
    return send_from_directory(os.path.join(os.getcwd(), app.config['UPLOAD_FOLDER']), filename, mimetype=content_type)


# ------------ recommended content --------------------- #
@app.route("/recommend/<userID>/resources", methods={"GET"})
def fetch_recommendations(userID):
    user = Users.query.filter_by(id=userID).first()
    if(not user):
        return jsonify({
        "message": "user does not exist"
    })
    interactions_csv = generate_interactions_csv()
    users_csv = generate_user_preferences_csv()
    content_csv = generate_content_csv()
    
    

    recomend_gen = RecommendationGenerator(interactions_csv, users_csv, content_csv)
    recommendations = recomend_gen.generate_recommendations(userID)
   
   
    for content in recommendations:
        posted_by = Users.query.filter_by(id=content['posted_by']).first()
        if content["visibility"] == "private":
            recommendations.pop(content)
        else:
            thumbnail = generate_thumbnail(content['content_url'])
            views = Interactions.query.filter_by(content_id=content['id'], interaction_type="viewed").count()
            content['views'] = views
            content['created_at'] = content.pop('timestamp')
            content['caption'] = content.pop('description')
            content['posted_by'] = posted_by.username
            content['userId'] = posted_by.id
            content['thumbnail'] = f"/file/{thumbnail}" 
            content["bookmarked"] = "true" if Interactions.query.filter_by(content_id=content['id'], user_id=userID, interaction_type="bookmarked" ).first() else "false"

    return jsonify({"resources":recommendations})





# @app.route("/<userID>/resources", methods=["GET"])
# def recommend_recources(userID):
#     userID=userID
#     user = Users.query.filter_by(id=userID).first()
#     if(not user):
#         return jsonify({
#         "message": "user does not exist"
#     })
#     contents = Content.query.all()
#     arr = []
#     for content in contents:
#         bookmarks = Interactions.query.filter_by(content_id=content.id, interaction_type="bookmarked").count()
#         poster = Users.query.filter_by(id=content.posted_by).first()
        
#         thumbnail = generate_thumbnail(content.content_url)
#         obj = {
#             "id": content.id,
#             "posted_by": poster.username,
#             "file": f"/file/{content.content_url}",
#             "thumbnail": thumbnail,
#             "caption": content.description,
#             "created_at": content.timestamp,
#             "bookmarks": bookmarks,
#             "bookmarked": True
#         }
#         arr.append(obj)
#     return jsonify({
#         "resources": arr
#     })



# ------------ all recent interactions --------------------- #

@app.route("/<userID>/recents", methods=["GET"])
def get_recents(userID):
    userID = userID
    user = Users.query.filter_by(id=userID).first()
    if(not user):
        return jsonify({
        "message": "user does not exist"
    })
    recents =  Interactions.query.filter_by(user_id=user.id).order_by(Interactions.timestamp.desc()).limit(5).all() 

   
    arr = []
    for interaction in recents:
        content_id = interaction.content_id
        content= Content.query.filter_by(id=content_id).first()
        posted_by = Users.query.filter_by(id=content.posted_by).first()
        thumbnail = generate_thumbnail(content.content_url)
        obj = {
            "id": interaction.content_id,
            "content_url":content.content_url,
            "content_type": content.content_type,
            "thumbnail": f"/file/{thumbnail}",
            "caption": content.description,
            "title": content.title,
            "created_at": content.timestamp,
            "userId":posted_by.id,
            "posted_by":posted_by.username,
            "views": Interactions.query.filter_by(interaction_type="viewed", content_id = content.id).count(),
            "bookmarked": "true" if Interactions.query.filter_by(content_id=content_id, user_id=user.id, interaction_type="bookmarked").first() else "false"

        }
        arr.append(obj)
    return jsonify({
        "message":"success",
        "recents": arr
    })






# ------------ bookmarking a post --------------------- #
@app.route("/posts/<contentID>/bookmark", methods=["POST"])
def bookmark(contentID):
    try:
        token = request.headers["Authorization"].split(" ")[1]
        decoded_data = jwt.decode(token, app.config['SECRET_KEY'], algorithms="HS256")
    except:
        return jsonify({
            "error": "token not present!"
        }), 404
    userId = decoded_data['id']
    currentuser = Users.query.filter_by(id=userId).first()
    post = Content.query.filter_by(id=contentID).first()
    bookmark = Interactions(content=post, user=currentuser, interaction_type = "bookmarked")
    existing_bookmark = Interactions.query.filter_by(user=currentuser, content_id=contentID, interaction_type="bookmarked").first()
    if not existing_bookmark:
        db.session.add(bookmark)
        db.session.commit()
        return jsonify({
            "message": "You bookmarked the post"})
    else:
        db.session.delete(existing_bookmark)
        db.session.commit()
        return jsonify({"error":"bookmark removed"})
                       


# ------------ viewing a post --------------------- #
@app.route("/posts/<contentID>/view", methods=["POST"])
def viewPost(contentID):
    try:
        token = request.headers["Authorization"].split(" ")[1]
        decoded_data = jwt.decode(token, app.config['SECRET_KEY'], algorithms="HS256")
    except:
        return jsonify({
            "error": "token not present!"
        }), 404
    userId = decoded_data['id']
    currentuser = Users.query.filter_by(id=userId).first()
    post = Content.query.filter_by(id=contentID).first()
    view = Interactions(content=post, user=currentuser, interaction_type = "viewed")
    viewed = Interactions.query.filter_by(user=currentuser, content_id=contentID, interaction_type="viewed").first()

    if not viewed:
        db.session.add(view)
        db.session.commit()

        return jsonify({
            "message": "post viewed",
            "views":  Interactions.query.filter_by(interaction_type="viewed", content_id = contentID).count()
        })
    else:
        return jsonify({"error":"user already viewed this post",
                        "views":  Interactions.query.filter_by(interaction_type="viewed", content_id = contentID).count()})


def generate_interactions_csv():
    interactions = Interactions.query.all()
    df = pd.DataFrame([{
        'id': interaction.id,
        'user_id': interaction.user_id,
        'interaction_type': interaction.interaction_type,
        'timestamp': interaction.timestamp,
        'content_id': interaction.content_id
    } for interaction in interactions])
    p= df.to_csv(index=False)

    return p
    
    

def generate_user_preferences_csv():
    user_preferences = User_Preferences.query.all()
    df = pd.DataFrame([{
        "id": preference.id,
        "user_id": preference.user_id,
        "subjects": preference.subjects.split(","),
        "media_formats": preference.media_formats.split(","),
        "education_level": preference.education_level,
        "timestamp": preference.timestamp
    } for preference in user_preferences])
    p= df.to_csv(index=False)
    return p

def generate_content_csv():
    content = Content.query.filter_by(visibility="public").all()
    df = pd.DataFrame([{
        "id": item.id,
        "posted_by": item.posted_by,
        "title": item.title,
        "subject_area": item.subject_area,
        "description": item.description,
        "content_type": item.content_type,
        "content_url": item.content_url,
        "visibility": item.visibility,
        "timestamp": item.timestamp
    } for item in content])
    p= df.to_csv(index=False)
    return p



def form_errors(form):
    error_messages = []
    """Collects form errors"""
    for field, errors in form.errors.items():
        for error in errors:
            message = u"Error in the %s field - %s" % (
                    getattr(form, field).label.text,
                    error
                )
            error_messages.append(message)

    return error_messages