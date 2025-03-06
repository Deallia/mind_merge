import React, { useState, useEffect } from 'react';import 'bootstrap/dist/css/bootstrap.min.css';
import { useHistory } from 'react-router-dom';
import '../css_templates/RegisterForm.css';
const RegisterForm = () => {
  const history = useHistory();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmpassword: '',
    email: '',
    biography: '',
    profile: null,
  });
  const [errors, setErrors]= useState([])

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, profile: file });
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission, e.g., send data to backend
    console.log(formData);
    fetch("/register", {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: {
        'X-CSRFToken': csrf_token, 
        'Content-Type': 'application/json',
      },
      
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (!!data.token){
          localStorage.setItem("token", data.token);
          history.push("/new_user_attribute");
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
    <div className="register-container">
      {errors && (
        <div className="text-danger">
          {Object.values(errors).map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </div>
      )}
      <div className="row justify-content-center">
        <div className="col-md-6">
        <p> Already Have an account?
                        <a href="/login"> Sign In </a></p>
          <h2 className="text-center">Register</h2>
          <form onSubmit={handleSubmit}>
          <div className="mb-3">
              <label htmlFor="profile" className="form-label">Profile Picture</label>
              <input type="file" className="form-control" id="profile" name="profile" onChange={handleFileChange} />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleChange} placeholder='user@example.com' />
            </div>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username :(name will automatically be saved in lowercase)</label> <p>this name will be displayed on your profile</p>
              <input type="text" className="form-control" id="username" name="username" value={formData.username} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="mb-3" id='p-requirements'>
                  must contain:
                  <ul>
                    <li>At least one uppercase letter</li>
                    <li>At least one lowercase letter</li>
                    <li>At least one number</li>
                    <li>At least one special character</li>
                  </ul>
                </div>
              <input type="password" className="form-control" id="password" name="password" value={formData.password} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input type="password" className="form-control" id="confirmPassword" name="confirmpassword" value={formData.confirmpassword} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label htmlFor="biography" className="form-label">Biography</label>
              <textarea className="form-control" id="biography" name="biography" value={formData.biography} onChange={handleChange}></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Register</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
