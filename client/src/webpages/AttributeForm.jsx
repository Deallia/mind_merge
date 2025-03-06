import React, { useState, useEffect } from 'react';
import '../css_templates/AttributeForm.css';
import { useHistory } from 'react-router-dom';

const AttributeForm = () => {
  const history = useHistory();
  const token = localStorage.getItem("token")
  const [formData, setFormData] = useState({
    subjects: [],
    formats: [],
    education_level: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'education_level') {
      setFormData({ ...formData, [name]: value });
    } else {
      const selectedValues = [...formData[name]]; // Copy the existing array
      if (selectedValues.includes(value)) {
        // Remove the value if already selected
        const index = selectedValues.indexOf(value);
        selectedValues.splice(index, 1);
      } else {
        // Add the value if not selected
        selectedValues.push(value);
      }
      setFormData({ ...formData, [name]: selectedValues });
    }
  };

  const fetchUser = async() => {
    const res = await fetch("/users/currentuser", {
        method: "GET",
        headers: {
            'Authorization': "Bearer " + token
        }
    })
    const data = await res.json()
    return data
}

let user = null;
const getUserData = async () => {
  
  try {
      user = await fetchUser();
      console.log('User:', user);
  } catch (error) {
      console.error('Error:', error);
  }
  return user;
};

// Call the function to fetch user data
getUserData();

  const [csrf_token, setCsrfToken] = useState('');
  useEffect(() => {
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
    console.log(user.id)
    fetch(`/register/attribute/${user.id}`, {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: {
        'X-CSRFToken': csrf_token, 
        'Content-Type': 'application/json', 
        'Authorization': "Bearer " + token
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message=='success'){
          history.push("/explore");
          window.location.reload();
          console.log(data);
        }
        
       
        
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (

    <form onSubmit={handleSubmit}>
      <div className='form-container'>  
      <div>
        <label>Subjects of Interest:</label>
        <div className="button-group">
          <button
            type="button"
            value="Biology"
            className={formData.subjects.includes('Biology') ? 'selected' : ''}
            onClick={() => handleChange({ target: { name: 'subjects', value: 'Biology' } })}
          >
            Biology
          </button>
          <button
            type="button"
            value="Chemistry"
            className={formData.subjects.includes('Chemistry') ? 'selected' : ''}
            onClick={() => handleChange({ target: { name: 'subjects', value: 'Chemistry' } })}
          >
            Chemistry
          </button>
          <button
            type="button"
            value="Geography"
            className={formData.subjects.includes('Geography') ? 'selected' : ''}
            onClick={() => handleChange({ target: { name: 'subjects', value: 'Geography' } })}
          >
            Geography
          </button>
          <button
            type="button"
            value="Physics"
            className={formData.subjects.includes('Physics') ? 'selected' : ''}
            onClick={() => handleChange({ target: { name: 'subjects', value: 'Physics' } })}
          >
            Physics
          </button>
        </div>
      </div>

      <div>
        <label>Preferred Formats:</label>
        <div className="button-group">
          <button
            type="button"
            value="flashcards"
            className={formData.formats.includes('flashcards') ? 'selected' : ''}
            onClick={() => handleChange({ target: { name: 'formats', value: 'flashcards' } })}
          >
            Flashcards
          </button>
          <button
            type="button"
            value="quizzes"
            className={formData.formats.includes('quizzes') ? 'selected' : ''}
            onClick={() => handleChange({ target: { name: 'formats', value: 'quizzes' } })}
          >
            Quizzes
          </button>
          <button
            type="button"
            value="pdf_eBook"
            className={formData.formats.includes('pdf_eBook') ? 'selected' : ''}
            onClick={() => handleChange({ target: { name: 'formats', value: 'pdf_eBook' } })}
          >
            PDF/eBooks
          </button>
          <button
            type="button"
            value="image"
            className={formData.formats.includes('image') ? 'selected' : ''}
            onClick={() => handleChange({ target: { name: 'formats', value: 'image' } })}
          >
            Images
          </button>
          <button
            type="button"
            value="video"
            className={formData.formats.includes('video') ? 'selected' : ''}
            onClick={() => handleChange({ target: { name: 'formats', value: 'video' } })}
          >
            Videos
          </button>
        </div>
      </div>

      <div>
        <label>Level of Education:</label>
        <div className="button-group">
          <label className='px-3'>
            <input
              type="radio"
              name="education_level"
              value="undergraduate"
              checked={formData.education_level === 'undergraduate'}
              onChange={handleChange}
            />
            Undergraduate
          </label>
          <label className='px-3'>
            <input
              type="radio"
              name="education_level"
              value="graduate"
              checked={formData.education_level === 'graduate'}
              onChange={handleChange}
            />
            Graduate
          </label>
          <label className='px-3'>
            <input
              type="radio"
              name="education_level"
              value="highschool"
              checked={formData.education_level === 'highschool'}
              onChange={handleChange}
            />
            High School
          </label>
        </div>
      </div>

      <button className="btn btn-primary" type="submit">Next</button>
      </div> 
    </form>
  );
};

export default AttributeForm;
