import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css_templates/UserProfile.css'
import axios from 'axios';
import { useHistory } from 'react-router-dom';

export default function ProfilePage() {
  const history = useHistory();
  const token = localStorage.getItem("token");
  const [profilePicture, setProfilePicture] = useState(null);
  const [edit, setEdit] = useState(false);
  const [user, setUserData] = useState({});
  const [posts, setPosts] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [isFull, setIsFull] = useState(false);
  const [showPost, setShowPost] = useState(true);
  const [myBookmarks, setMyBookmarks] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!isFull) {
          await fetchUser();
          setIsFull(true);
        }
        if (isFull){
          await loadContent(user.id);
                  // console.log(user.id);
       
          
        }

      } catch (error) {
        console.error('useeffect Error:', error);
      }
    };

    fetchData();
    console.log("bookmarks",bookmarks);
    // Fetch CSRF token
    fetch('/csrf-token')
      .then(res => res.json())
      .then(data => {
        setCsrfToken(data.csrf_token);
      })
      .catch(err => console.error('Error fetching CSRF token:', err));
  }, [isFull, user.id]);

  const handleClickChangePicture = () => {
    const inputElement = document.getElementById("fileInput");
    inputElement.click();
  };

  const editPicture =()=>{
    setEdit(!edit);
  }

  const handleShowPosts = () => {
    setShowPost(true);

    if (myBookmarks){
      setMyBookmarks(false);
    };

  };

  const handleShowBookmarks = () => {
    setMyBookmarks(true);
    if (showPost){
      setShowPost(false);
    };
  };

  const fetchUser = async () => {
    try {
      const res = await fetch("/users/currentuser", {
        method: "GET",
        headers: {
          'Authorization': "Bearer " + token
        }
      });
      const data = await res.json(); // Extract JSON data from the response
      if (!data.error) {
        setUserData(data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchAndOpenFile = async (contentUrl) => {
    try {
      const response = await axios.get(`/open_file/${contentUrl}`, { responseType: 'blob' });
      const fileUrl = URL.createObjectURL(response.data);
      window.open(fileUrl, '_blank');
    } catch (error) {
      console.error('Error fetching and opening file:', error);
    }
  };

  const displayQuiz = (contentId, contentType) => {
    if (contentType === "quizzes") {
      history.push(`/display-quiz/${user.id}/${contentId}`);
      window.location.reload();
    }
    if (contentType == "flashcards") {
      history.push(`/display-flashcard_set/${user}/${contentId}`);
      window.location.reload();
  }
  };

  const bookmarkContent = async (contentId) => {
    try {
      await axios.post(`/posts/${contentId}/bookmark`, {}, {
        headers: {
          'X-CSRFToken': csrfToken,
          'Authorization': `Bearer ${token}`
        }
      });
      const updatedBookmarks = bookmarks.filter(item => item.id !== contentId);
      setBookmarks(updatedBookmarks);
    } catch (error) {
      console.error(`Error bookmarking ${contentId}:`, error);
    }
  };

  const loadContent = async (userId) => {
    console.log(userId);
    try {
      const response = await axios.get(`/users/${userId}/posts`, {
        headers: {
          'X-CSRFToken': csrfToken,
          'Authorization': `Bearer ${token}`
        }
      });
      setBookmarks(response.data.bookmarks);
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const renderContentItems = (contentItems) => (
    <div className="content-items">
      {contentItems.map(item => (
        <div className="content-item" key={item.id}>
          <h3>{item.title}</h3>
          <p>{item.caption}</p>
          <p>Posted by: {item.posted_by}</p>
          {item.thumbnail && (
            <img src={item.thumbnail} alt={item.title} onClick={() => {fetchAndOpenFile(item.content_url)}} />
          )}
          <div className="filename">
            {item.content_type === "flashcards" || item.content_type === "quizzes" ? (
              <div>
                <p onClick={() => {displayQuiz(item.id, item.content_type);}}>Play Now</p>
              </div>
            ) : (
              <p onClick={() => {fetchAndOpenFile(item.content_url)}}>{item.content_url}</p>
            )}
          </div>
          <h6>Posted: {item.created_at}</h6>
          <div id="bookmark" onClick={() => bookmarkContent(item.id)}>
            <i className="fa fa-bookmark"></i><p>Bookmarked</p>
          </div>
          <p id="views">{item.views} views</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className='user-profile'>
      <section >
        <div className="container-fluid py-5">
          <div className="row">
            <div className="col-lg-4">
              <div className="card mb-4">
                <div className="card-body text-center">
                  <img
                    src={profilePicture || 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp'}
                    alt="avatar"
                    className="rounded-circle"
                    style={{ width: '150px' }}
                    onClick={editPicture}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePictureChange}
                    style={{ display: "none" }}
                    id="fileInput"
                  />
                  <div id="words" className="mt-2">
                    {edit && (
                      <button onClick={handleClickChangePicture}>Change Picture</button>
                    )}
                    <p>Joined on May 12,2024</p>
                    <Link to="/EditProfile"><button className="btn btn-primary mt-2">Edit Profile</button></Link>
                  </div>
                </div>
              </div>
              <div className="card mb-4">
                <div className="card-body">
                  <p className="card-text mb-4"><span className="text-primary font-italic me-1">STATS</span></p>
                  <h6 className='text-secondary me-1'># Public Content</h6>
                  <p className="card-text mb-1" style={{ fontSize: '.77rem' }}></p>
                  <div className="progress rounded">
                    <div className="progress-bar" role="progressbar" style={{ width: '80%' }} aria-valuenow="80" aria-valuemin="0" aria-valuemax="100"></div>
                  </div>
                  <hr/>
                  <h6 className='text-secondary me-1'># Private Content</h6>
                  <p className="card-text mt-4 mb-1" style={{ fontSize: '.77rem' }}></p>
                  <div className="progress rounded">
                    <div className="progress-bar" role="progressbar" style={{ width: '10%' }} aria-valuenow="72" aria-valuemin="0" aria-valuemax="100"></div>
                  </div>
                  {/* Add other progress bars here */}
                </div>
              </div>
            </div>
            <div className="col-lg-8">
              <div className="card mb-4">
                <div className="card-body">
                  <div className="container">
                    <div className="row justify-content-end">
                      <div className="col-sm-9">
                        <p className="card-text">Username</p>
                      </div>
                      <div className="col-sm-3">
                        <p className="card-text text-muted">{user.username}</p>
                      </div>
                    </div>
                    <hr />
                    <div className="row justify-content-end">
                      <div className="col-sm-9">
                        <p className="card-text">Email</p>
                      </div>
                      <div className="col-sm-3">
                        <p className="card-text text-muted">{user.email}</p>
                      </div>
                    </div>
                    <hr />
                    <div className="row justify-content-end">
                      <div className="col-sm-9">
                        <p className="card-text">Subject(s) of Interest</p>
                      </div>
                      <div className="col-sm-3">
                        <p className="card-text text-muted">{user.subjects}</p>
                      </div>
                    </div>
                    <hr />
                    <div className="row justify-content-end">
                      <div className="col-sm-9">
                        <p className="card-text">MindMerge ID#</p>
                      </div>
                      <div className="col-sm-3">
                        <p className="card-text text-muted">{user.id}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title">Bio</h5>
                  <p className="card-text">{user.biography}</p>
                </div>
              </div>
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title">Activity</h5>
                  <div className='toggle-post'>
                    <h6 id='my-post' onClick={handleShowPosts}>My Posts</h6>
                    <h6 id='my-bookmark' onClick={handleShowBookmarks}>My Bookmarks</h6>
                  </div>
                  <hr/>
                  {showPost && (
                    <div className="post-section">
                      <p>Showing items you posted</p>
                      {renderContentItems(posts)}
                    </div>
                  )}
                  {myBookmarks && (
                    <div className="bookmarks-section">
                      <p>Showing items you bookmarked</p>
                      {renderContentItems(bookmarks)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> 
    </div>
  );
}
