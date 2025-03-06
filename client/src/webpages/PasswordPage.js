import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function PasswordPage() {
  let Email, password, newPassword;
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
          <Link to="/EditProfile"><button style={{ margin: '10px 0', width: '100%', padding: '10px', borderRadius: '5px', border: '0px', cursor: 'pointer' }}>Edit Profile</button></Link>
        </p>
        <p>
          <Link to="/PasswordPage"><button style={{ margin: '10px 0', width: '100%', padding: '10px', borderRadius: '5px', border: '0px', cursor: 'pointer' }}>Edit Password</button></Link>
        </p> 
        <p>
          <Link to="/SignOutPage"><button style={{ margin: '10px 0', width: '100%', padding: '10px', borderRadius: '5px', border: '0px', cursor: 'pointer' }}>Sign out</button></Link>
        </p>
      </div>

      <div id="mainedit" style={{ padding: '20px', width: 'calc(100% - 220px)', border: '2px solid #ccc', marginLeft: '20px', backgroundColor: '#f9f9f9' }}>
        <h1>Change Password</h1>
        

        <div>
          <input
            type="text"
            placeholder="Enter your email/Username..."
            value={Email}
            onChange={(e) => Email = e.target.value}
            style={{ width: '60%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginBottom:'35px',marginTop:'25px'}}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Old password..."
            value={password}
            onChange={(e) => password = e.target.value}
            style={{ width: '60%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc',marginBottom:'35px' }}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="New password..."
            value={newPassword}
            onChange={(e) => newPassword = e.target.value}
            style={{ width: '60%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc',marginBottom:'35px' }}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Confirm password..."
            value={newPassword}
            onChange={(e) => newPassword = e.target.value}
            style={{ width: '60%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc',marginBottom:'35px' }}
          />
        </div>
        <div>
          <button style={{ backgroundColor: '#007bff', color: 'white', width: '130px', marginTop: '30px' }}>Next</button>
        </div>
      </div>
    </div>
  );
}

export default PasswordPage;
