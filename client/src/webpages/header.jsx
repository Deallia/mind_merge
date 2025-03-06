import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'; 

import { AuthService } from '../auth.jsx';

function Header({isPrivate}) {
  const handleLogout = () => {
    // Call the removeToken function when the logout link is clicked
    AuthService.removeToken();
    window.location.reload();
  };



  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-white bg-light fixed-top">
        <div className="container">
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <h3 className="animate-charcter"> MindMerge</h3>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link" href="/explore">Home</a>
              </li>
              <button className= "nav-btn ">
              <li className="nav-item">
                <a className="nav-link" href="/create-quiz"><p>Generate Quiz</p></a>
              </li>
              </button>
              <button className='nav-btn  mx-3'>
              <li className="nav-item">
                <a className="nav-link" href="/create-flashcard_set"> <p>Generate Flashcard Set</p></a>
              </li>
              </button>
              <li className="nav-item">
                <a className="nav-link" href="/pomodoro"> Pomodoro Timer</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/profile">Profile</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/create-post">Share a resource</a>
              </li>
              {isPrivate &&(
              <li className="nav-item ">
                <a id="logout" className="nav-link" href="#" onClick={handleLogout}><i className='fa fa-sign-out'></i>Logout</a>
              </li>
               )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
export default Header;

// function App() {
//   return (
//     <Router>
//       <Header />
//       <Routes>
//         <Route path="/" element={<Homepage />} />
//         <Route path="/sign-up" element={<RegisterForm />} />
//         <Route path="/login" element={<LoginForm />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;
