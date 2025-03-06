import React, { useState, useEffect } from 'react';
import '../css_templates/LoginForm.css'; 
import { useHistory } from 'react-router-dom';

function LoginForm(props) {
  const history = useHistory();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors]= useState([])
  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const [csrf_token, setCsrfToken] = useState('');

  useEffect(() => {
      // Fetch CSRF token
      fetch('/csrf-token')
        .then(res => res.json())
        .then(data => {
          setCsrfToken(data.csrf_token);
        })
        .catch(err => console.error('Error fetching CSRF token:', err));
    }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    // Here you can add logic to handle the form submission, such as sending a request to the server for authentication.
    console.log('Username:', username);
    console.log('Password:', password);
    console.log(JSON.stringify({username, password}))

    fetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({username, password}),
      headers: {
        'X-CSRFToken': csrf_token, 
        'Content-Type': 'application/json',
        
      },
      
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (!!data.token) {
          localStorage.setItem('token', data.token);
          console.log(localStorage.getItem('token'));
          history.push("/explore");
          window.location.reload();
        }
        if (data.errors)
        {
          setErrors(data.errors)
        }
        if (data.error){
          setErrors([data.error])
        }
  
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
 

  
  
  return (
    <div className="login-form-container"> {/* Apply form-container class for styling */}
      <h2>Login</h2>
      {errors && (
        <div className="text-danger">
          {Object.values(errors).map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} id='loginForm'>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Username (email or username)</label>
          <input type="text" className="form-control" id="username" value={username} onChange={handleUsernameChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input type="password" className="form-control" id="password" value={password} onChange={handlePasswordChange} />
        </div>
         <p>New User?  Dont Worry!
          <a href="/signup"> Register here</a> </p>
          <br/>
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
    </div>
  );
}

export default LoginForm;
