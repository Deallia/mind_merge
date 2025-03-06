import React from 'react';
import '../css_templates/style.css';
function LandingPage() {
    return (
        <div className="landing">
            <section>
              <h3 id="logo" className="animate-charcter"> MindMerge</h3>
                    {/* <div className="navigation">
                        <a href="Home">Home</a>
                        <a href="Quizzes">Quizzes</a>
                        <a href="Flashcards">Flashcards</a>
                        <a href="Recommendation">Recommendation</a>
                        
                    </div> */}
               
                <div className="content">
                    <div className="info">
                        <h2> Unlock Your True Potential <br/><span>Studying Made Easier!</span></h2>
                        <p>Mind Merge represents a transformative approach to collaborative learning, empowering students with cutting-edge tools and dynamic features designed to enhance their educational journey. 
                        At the heart of Mind Merge lies a commitment to fostering collaboration and critical thinking, transcending traditional learning paradigms. Through an innovative fusion of artificial intelligence and intuitive design, Mind Merge offers an array of powerful functionalities, including AI-generated flashcards, interactive quizzes, a sophisticated recommendation engine, and a customizable Pomodoro timer. With Mind Merge, students embark on a personalized learning experience tailored to their unique needs and preferences, enabling them to unlock their full academic potential.
                        Join us as we revolutionize the landscape of education and embark on a journey of discovery with Mind Merge.</p>
                        <p><h5> Already Have an account?</h5>
                        <a href="/login"> Sign In </a>
                       <h5>New User?  Dont Worry!</h5>
                       <a href="/signup"> Get Started by Creating an Account Today</a>
                       <br/>
                       
                       </p>
                       
                        <p className="info-btn">Explore Today!</p>
                    </div>
                </div>
                <div className="media-icons">
                    <p><a href="#"><i className="fa fa-facebook-official"> </i></a> 
                    <a href="#"><i className="fa fa-instagram"> </i></a>
                    <a href="#"><i className="fa fa-twitter"> </i></a></p>
                </div>
            </section>
        </div>
    );
}

export default LandingPage;
