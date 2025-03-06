import React, { useState, useEffect } from 'react';
import axios from "axios";
import '../css_templates/FlashcardSetForm.css';
import { useHistory } from 'react-router-dom';

function FlashcardSetForm() {
  const history = useHistory();
  const [isSubmitted, setSubmitted] = useState(false);
  const token = localStorage.getItem("token")
  const [csrf_token, setCsrfToken] = useState('');
  const [formData, setFormData] = useState({
  title: '',
  description: '',
  subject_area: '', 
  other_subject: '', 
  visibility: 'public',
  num_questions: 0, 
  text: '', 
});
const maxWords = 1200;
const [wordCount, setWordCount] = useState(0);
const [value, setValue] = useState('');
const [remainingWords, setRemainingWords] = useState(maxWords);
const [errors, setErrors]= useState([])

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData({ ...formData, [name]: value });
  
};

  

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
    console.log(formData);
    console.log(csrf_token);
    setSubmitted(true);
  
    fetch('/create/flashcard_set', {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: {
        'X-CSRFToken': csrf_token, 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
        
      },
      
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message ){
          history.push(`/display-flashcard_set/${data.user}/${data.flashcard}`)
          console.log(data);
          window.location.reload();
        }
        else{
          setErrors(data.errors)
          setSubmitted(false)
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  const limitTextInput = (event) => {
    const inputText = event.target.value;
    const words = inputText.trim().split(/\s+/);
    setWordCount(words.length);
    console.log(inputText, words, wordCount, maxWords);

    if (event.target.value.length <= maxWords) {
      setValue(inputText);
      setRemainingWords(maxWords - wordCount);
    } else {
      const limit = words.slice(0, maxWords).join(' ');
      setValue(limit);
      setRemainingWords(0);
      
    }
      
    
  };

  return (
    <div id="flashcard-form-container">
      {!isSubmitted ? (
      <div className="flashcard-form-container">
        {errors && (
        <div className="text-danger">
          {Object.values(errors).map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </div>
      )}
      <div className="left-panel">
        <h2>Upload PDF File or Paste Text</h2>
        <div>
          <label htmlFor="pdf-upload">Upload PDF File:</label>
          <input type="file" id="pdf-upload" />
        </div>
        <div>
          <label htmlFor="text">Paste Text:</label>
          <textarea
            id="text"
            rows="6"
            name="text"
            value={value}
            onChange={(e) => {
              handleChange(e);
              limitTextInput(e);
            }}
          ></textarea>
          <p>Remaining characters: {remainingWords}</p>
        </div>
      </div>
      <div className="right-panel">
        <h2>Flashcard Details</h2>
        <div>
          <label htmlFor="title">Title::(give your flashcard set a title)</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="description">Description:(mention concepts or topics discussed in the text)</label>
          <textarea
            id="description"
            rows="4"
            name="description"
            value={formData.description}
            onChange={handleChange}
          ></textarea>
        </div>
        <div>
          <label htmlFor="subject-area">Subject Area:</label>
          <select
            id="subject-area"
            name="subject_area"
            value={formData.subject_area}
            onChange={handleChange}
          >
            <option value="">Select Subject Area</option>
            <option value="Biology">Biology</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Geography">Geography</option>
            <option value="Physics">Physics</option>
            <option value="Other">Other</option>
          </select>
          {formData.subjectArea === 'other' && (
            <input
              type="text"
              name="other_subject"
              value={formData.other_subject}
              onChange={handleChange}
              placeholder="Enter Other Subject"
            />
          )}
        </div>
        <div>
          <label htmlFor="visibility">Visibility:</label>
          <select
            id="visibility"
            name="visibility"
            value={formData.visibility}
            onChange={handleChange}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
        <div className="px-3 py-3">
          <label htmlFor="num-questions">Number of Questions:</label>
          <input
            type="number"
            id="num-questions"
            name="num_questions"
            value={parseInt(formData.num_questions)}
            onChange={handleChange}
            min="1"
            max="30"
          />
        </div>
        <button className={'btn'} type="submit" onClick={handleSubmit} disabled={isSubmitted}>
          Submit
        </button>
      </div>
      </div>
      ):  (
        <div id='form-loading'>Generating your flashcard set. This may take a while...</div>
      )}
    </div>
  );
}

export default FlashcardSetForm;
