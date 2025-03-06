import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Redirect, Route } from 'react-router-dom';
import { AuthService } from './auth.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './webpages/header.jsx';
import Footer from './webpages/footer.jsx';
import Homepage from './webpages/Homepage.jsx';
import AttributeForm from './webpages/AttributeForm.jsx';
import LoginForm from './webpages/LoginForm.jsx';
import RegisterForm from './webpages/RegisterForm.jsx';
import QuizForm from './webpages/QuizForm.jsx';
import FlashcardSetForm from './webpages/FlashcardSetForm.jsx';
import PostForm from './webpages/PostForm.jsx';
import EditProfile from './webpages/EditProfile.js';
import PasswordPage from './webpages/PasswordPage.js';
import UserProfile from './webpages/UserProfile.js';
import DisplayQuiz from './webpages/DisplayQuiz.jsx';
import DisplayFlashcardSet from './webpages/DisplayFlashcardSet.jsx';
import LandingPage from './webpages/LandingPage.jsx';
import PomodoroTimer from './webpages/Pomodoro.js';
import ViewUser from './webpages/viewUser.jsx';
const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      AuthService.isAuthenticated() ? (
        <PrivateLayout>
        <Component {...props} />
      </PrivateLayout>
      ) : (
        <Redirect to="/" />
      )
    }
  />
);

const PublicRoute = ({ component: Component, restricted, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      AuthService.isAuthenticated() && restricted ? (
        <Redirect to="/explore" />
      ) : (
        <PublicLayout>
        <Component {...props} />
      </PublicLayout>
      )
    }
  />
);

const PublicLayout = ({ children }) => (
  <div>
    <Header isPrivate={false}/>
    {children}
    <Footer />
   
    
  </div>
);

const PrivateLayout = ({ children }) => (
  <div>
    
<Header isPrivate={true} />
{children}
<Footer />
    
  </div>
);

function App() {
  useEffect(() => {
    // AuthService.removeToken();
    console.log('Is Authenticated:', AuthService.isAuthenticated());
    console.log('token:', AuthService.getToken());
  }, []);

  return (
    <Router>
      <Switch>
        <PublicRoute restricted={false} component={LandingPage} path="/" exact />
        <PublicRoute restricted={false} component={LoginForm} path="/login" exact />
        <PublicRoute restricted={false} component={RegisterForm} path="/signup" exact />
        <PublicRoute restricted={false} component={AttributeForm} path="/new_user_attribute" exact />
        <PrivateRoute  component={DisplayFlashcardSet} path="/display-flashcard_set/:user/:flashcard" exact />
        <PrivateRoute component={DisplayQuiz} path="/display-quiz/:user/:quiz" exact />
        <PrivateRoute component={Homepage} path="/explore" exact />
        <PrivateRoute component={QuizForm} path="/create-quiz" exact />
        <PrivateRoute component={FlashcardSetForm} path="/create-flashcard_set" exact />
        <PrivateRoute component={PostForm} path="/create-post" exact />
        <PublicRoute component={EditProfile} path="/EditProfile" exact />
        <PublicRoute component={PasswordPage } path="/PasswordPage" exact />
        <PrivateRoute component={UserProfile  } path="/profile" exact />
        <PrivateRoute component={PomodoroTimer} path="/pomodoro" exact />
        <PrivateRoute component={ViewUser  } path="/profile/:userId" exact />
      </Switch>
    </Router>
  );
}

export default App;
