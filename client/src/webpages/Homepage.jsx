import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css_templates/Homepage.css'; 
import { useHistory } from 'react-router-dom';
const Homepage = () => {
    const history = useHistory();
    const token = localStorage.getItem('token');
    const [recents, setRecents] = useState([]);
    const [resources, setResources] = useState([]);
    const [csrf_token, setCsrfToken] = useState('');
    const [user, setUser] = useState(0)

    useEffect(() => {
        // Fetch CSRF token
        fetch('/csrf-token')
            .then(res => res.json())
            .then(data => {
                setCsrfToken(data.csrf_token);
            })
            .catch(err => console.error('Error fetching CSRF token:', err));

        // Fetch user data and recents/resources
        async function fetchData() {
            try {
                const user = await fetchUser();
                setUser(user);
                console.log('User:', user);
                await fetchRecents(user.id);
                await fetchResources(user.id);
            } catch (error) {
                console.error('Error:', error);
            }
        }

        fetchData(); // Call fetchData once the component mounts
    }, []);

    const fetchUser = async () => {
        const res = await fetch("/users/currentuser", {
            method: "GET",
            headers: {
                'Authorization': "Bearer " + token
            }
        });
        const data = await res.json();
        return data;
    };
   


    const fetchRecents = async (userID) => {
        try {
            const response = await axios.get(`/${userID}/recents`);
            if (response.data.recents){
                setRecents(response.data.recents); // Update recents state here
                console.log("recents",response.data.recents);
            }
        } catch (error) {
            console.error('Error fetching recent content:', error);
        }
    };

    const fetchResources = async (userID) => {
        try {
            const response = await axios.get(`/recommend/${userID}/resources`);
            if (response.data.resources){
                setResources(response.data.resources);
                console.log(response.data.resources);
            }
        } catch (error) {
            console.error('Error fetching resources:', error);
        }
    };

    const fetchAndOpenFile = async (content_url) => {
        try {
            const response = await axios.get(`/open_file/${content_url}`, { responseType: 'blob' });
        
            // Create a URL representing the Blob
            const fileUrl = URL.createObjectURL(response.data);
            
            // Open the file URL in a new tab
            window.open(fileUrl, '_blank');
        } catch (error) {
          console.error('Error fetching and opening file:', error);
        }
      };

    const bookmarkContent = async (contentId) => {
        try {
            const response = await axios.post(`/posts/${contentId}/bookmark`, {}, {
                headers: {
                    'X-CSRFToken': csrf_token,
                    'Authorization': `Bearer ${token}`
                }
            });
            const updatedResources = resources.map(item => {
                if (item.id === contentId) {
                    return {
                        ...item,
                        bookmarked: !JSON.parse(item.bookmarked),
                       
                    };
                }
                return item;
            });
            setResources(updatedResources);
        } catch (error) {
            console.error(`Error bookmarking ${contentId}:`, error);
        }
    };

    const viewContent = async (contentId) => {
        try {
            const response = await axios.post(`/posts/${contentId}/view`, {}, {
                headers: {
                    'X-CSRFToken': csrf_token,
                    'Authorization': `Bearer ${token}`
                }
            });
            const updatedResources = resources.map(item => {
                if (item.id === contentId) {
                    return {
                        ...item,
                        views:response.data.views
                       
                    };
                }
                return item;
            });
            setResources(updatedResources);
        } catch (error) {
            console.error(`Error viewing ${contentId}:`, error);
        }
    };

    const displayQuiz = (content_id, content_type, user) => {
        console.log(user);
        if (content_type == "quizzes") {
            history.push(`/display-quiz/${user}/${content_id}`);
            window.location.reload();
        }
        if (content_type == "flashcards") {
            history.push(`/display-flashcard_set/${user}/${content_id}`);
            window.location.reload();
        }
        
    };

    const renderContentItems = (contentItems) => (
        <div className="content-items">
            {contentItems.map(item => (
                <div className="content-item" key={item.id}>
                    <h3>{item.title}</h3>
                    <p>{item.caption}</p>
                    <div> Posted by:<a href={`/profile/${item.userId}`}> {item.posted_by}</a></div>
                    {item.content_type=="pdf_eBook"&&
                    (<div style={{textAlign:"right"}}> 
                       <b> Format: PDf/eBook</b>
                    </div>)}
                    {item.content_type=="video"&&
                    (<div style={{textAlign:"right"}}>
                        <b>Format: Video</b>
                    </div>)}
                    {item.content_type=="image" &&
                    (<div style={{textAlign:"right"}}>
                        <b>Format: image</b>
                    </div>)}
                    {item.content_type=="quizzes" &&
                    (<div style={{textAlign:"right"}}>
                        <b>Format: quiz</b>
                    </div>)}
                    {item.content_type=="flashcards" &&
                    (<div style={{textAlign:"right"}}>
                        <b>Format: flashcards</b>
                    </div>)}
                    {item.thumbnail && (
                        <img src={item.thumbnail} alt={item.title} onClick={() => {{ item.content_type === "flashcards" || item.content_type === "quizzes" ? displayQuiz(item.id, item.content_type, item.posted_by) : fetchAndOpenFile(item.content_url)}; viewContent(item.id); fetchRecents(user.id);}} />
                    )}
                    <div className="filename">
                    {item.content_type === "flashcards" || item.content_type === "quizzes" ? (
                        <div>
                            <p  onClick={() => {displayQuiz(item.id, item.content_type, item.posted_by);viewContent(item.id);fetchRecents(user.id)}}>Play Now</p>
                        </div>
                    ) : (
                        <p onClick={() => {fetchAndOpenFile(item.content_url);viewContent(item.id);fetchRecents(user.id)}}>Click to View File</p>
                    )}
                </div>
                    <div style={{textAlign:"right"}}>Posted: {item.created_at}</div>
                    <div id="bookmark" onClick={() => bookmarkContent(item.id)}>
                        {JSON.parse(item.bookmarked) ? <div><i class="fa fa-bookmark"></i> <b>Bookmarked</b></div> : <div><i className="fa fa-bookmark-o"></i> Bookmark </div>}
                    </div>
                    <p id="views">{item.views} views</p>
                   
                </div>
  
            ))}
            
        </div>
    );

    return (
        <div className="dashboard">
              <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search..."
                    // onChange={onChange}
                    className="search-input"
                />
                <button className="search-button">Search</button>
                </div>
            <div className="recents-section">
                <h2>Recents</h2>
                {renderContentItems(recents)}
            </div>
            <div className="resources-section">
                <h2>Suggested For You</h2>
                {renderContentItems(resources)}
            </div>
        </div>
    );
};

export default Homepage;
