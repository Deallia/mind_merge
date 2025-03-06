import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthService } from '../auth.jsx';

function EditProfile() {
  let fullname, Email, Major, field;
  const [profilePicture, setProfilePicture] = useState(null);

  const handlePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    
    AuthService.removeToken();
    window.location.reload();
  };

  const handleClickChangePicture = () => {
    const inputElement = document.getElementById("fileInput");
    inputElement.click();
  };

  return (
    <div className="UserProfile" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', margin: '0 auto' }}>
      <div id="sidebar" style={{ backgroundColor: 'white', padding: '20px', width: '200px' }}>
      <p>
          <Link to="/UserProfile"><button style={{ margin: '10px 0', width: '100%', padding: '10px', borderRadius: '5px', border: '0px', cursor: 'pointer' }}>User Profile</button></Link>
        </p>
        <p>
         
          <Link to="/EditProfile">
            <button style={{ margin: '10px 0', width: '100%', padding: '10px', borderRadius: '5px', border: '0px', cursor: 'pointer' }}>Edit Profile</button>
          </Link>
        </p>
        <p>
         
          <Link to="/PasswordPage">
            <button style={{ margin: '10px 0', width: '100%', padding: '10px', borderRadius: '5px', border: '0px', cursor: 'pointer' }}>Edit Password</button>
          </Link>
        </p>
        <p>
          <Link to="/SignOutPage">
            <button style={{ margin: '10px 0', width: '100%', padding: '10px', borderRadius: '5px', border: '0px', cursor: 'pointer' }} onclick={handleLogout}>Sign out</button>
          </Link>
        </p>
      </div>
      <div id="mainedit" style={{ padding: '20px', width: 'calc(100% - 220px)', border: '2px solid #ccc', marginLeft: '20px', backgroundColor: '#f9f9f9' }}>
        <h1>Edit profile</h1>
       
        <div className="formGroup">
          <p>Full Name</p>
          <input
            type="text"
            placeholder="Enter your full Name..."
            value={fullname}
            onChange={(obj) => (fullname = obj.target.value)}
            style={{ width: '60%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </div>
        <div className="formGroup">
          <p>Email</p>
          <input
            type="text"
            placeholder="Enter your email..."
            value={Email}
            onChange={(e) => (Email = e.target.value)}
            style={{ width: '60%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </div>
        <div className="formGroup">
          <p>Address</p>
          <input
            type="text"
            placeholder="Enter your Major/Field..."
            value={Major}
            onChange={(e) => (Major = e.target.value)}
            style={{ width: '60%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </div>
        <div className="formGroup">
          <p>Field of study</p>
          <input
            type="text"
            placeholder="Enter your Major/Field..."
            value={field}
            onChange={(e) => (field = e.target.value)}
            style={{ width: '60%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </div>
        <div className="formGroup">
          <button style={{ backgroundColor: '#ccc', marginRight: '10px', width: '130px', marginTop: '30px' }}>Cancel</button>
          <button
            style={{ backgroundColor: '#007bff', color: 'white', width: '130px' }}
            onClick={() => console.log(fullname, Email, Major, field)}
          >
            Share Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;
