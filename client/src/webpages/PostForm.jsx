import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import '../css_templates/PostForm.css';

function PostForm() {
    const history = useHistory();
    const token = localStorage.getItem('token');
    const fileInputRef = useRef(null);

    const [title, setTitle] = useState('');
    const [caption, setCaption] = useState('');
    const [file, setFile] = useState(null);
    const [link, setLink] = useState('');
    const [contentType, setContentType] = useState('');
    const [showLinkFields, setShowLinkFields] = useState(false);
    const [fileUploadPressed, setFileUploadPressed] = useState(false);
    const [ConfirmButtonPressed, setConfirmButtonPressed] = useState(false);
    const [subjectCategory, setSubjectCategory] = useState('');
    const [otherSubjectCategory, setOtherSubjectCategory] = useState('');

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
    };

    const handleCaptionChange = (e) => {
        setCaption(e.target.value);
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setShowLinkFields(false);
        setLink('');
        setFileUploadPressed(true);
    };

    const handleLinkChange = (e) => {
        setLink(e.target.value);
        setFile(null);
    };

    const handleContentTypeChange = (e) => {
        setContentType(e.target.value);
    };

    const handleAddLinkClick = () => {
        setShowLinkFields(!showLinkFields);
        setFile(null);
    };

    const handleConfirmLink = () => {
        setShowLinkFields(true);
        setFile(null);
        setFileUploadPressed(false);
        setConfirmButtonPressed(true);
    };

    const handleEditLink = () => {
        setConfirmButtonPressed(false);
    };

    const handleDeleteLink = () => {
        setLink('');
        setFileUploadPressed(false);
        setConfirmButtonPressed(false);
    };

    const handleDeleteFile = () => {
        setFile(null);
        setFileUploadPressed(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; 
        }
    };

    const [csrf_token, setCsrfToken] = useState('');
    useEffect(() => {
        fetch('/csrf-token')
            .then(res => res.json())
            .then(data => {
                setCsrfToken(data.csrf_token);
            })
            .catch(err => console.error('Error fetching CSRF token:', err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('caption', caption);
        formData.append('file', file);
        formData.append('link', link);
        formData.append('content_type', contentType);
        formData.append('subject', subjectCategory === 'Other' ? otherSubjectCategory : subjectCategory);

        try {
            const response = await axios.post(`/post`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                    'X-CSRFToken': csrf_token
                },
            });
            if (response.data.message === "post created") {
                history.push("/explore")
                window.location.reload();
                console.log(response.data);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="postForm_container">
            <h2>Create Post</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Give your post a title (for example: Biology notes):</label>
                    <input className="form-control" type="text" value={title} onChange={handleTitleChange} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Caption:</label>
                    <textarea className="form-control" value={caption} onChange={handleCaptionChange} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Upload File:</label>
                    <input className="form-control" type="file" ref={fileInputRef} onChange={handleFileChange} disabled={ConfirmButtonPressed} />
                    {file && (
                        <button className="btn btn-danger mt-2" type="button" onClick={handleDeleteFile}>Delete File</button>
                    )}
                </div>

                <button className="btn btn-primary" type="button" onClick={handleAddLinkClick} disabled={true} style={{backgroundColor:"gray"}}>Share a link</button>
                <p>feature not currently available</p>
                {showLinkFields && (
                    <div>
                        <div className="mb-3">
                            {!ConfirmButtonPressed && (
                                <>
                                    <label className="form-label">Link:</label>
                                    <input className="form-control" type="text" value={link} onChange={handleLinkChange} />
                                </>
                            )}
                            {link && !ConfirmButtonPressed && (
                                <button className="btn btn-success mt-2" type="button" onClick={handleConfirmLink}>Confirm</button>
                            )}
                            {link && ConfirmButtonPressed && (
                                <div>
                                    <span>{link}</span>
                                    <button className="btn btn-secondary mt-2 me-2" type="button" onClick={handleEditLink}>Edit</button>
                                    <button className="btn btn-danger mt-2" type="button" onClick={handleDeleteLink}>Delete</button>
                                </div>
                            )}
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Select Content Type:</label>
                            <select className="form-select" value={contentType} onChange={handleContentTypeChange}>
                                <option value="">Select...</option>
                                <option value="pdf_eBook">PDF</option>
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                                
                            </select>
                        </div>
                    </div>
                )}
                <div className="mb-3">
                    <label className="form-label">Subject Category:</label>
                    <select className="form-select" value={subjectCategory} onChange={(e) => setSubjectCategory(e.target.value)}>
                        <option value="">Select...</option>
                        <option value="Biology">Biology</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Geography">Geography</option>
                        <option value="Physics">Physics</option>
                        <option value="Other">Other</option>
                    </select>
                    {subjectCategory === 'Other' && (
                        <input className="form-control mt-2" type="text" placeholder="Specify other subject category" value={otherSubjectCategory} onChange={(e) => setOtherSubjectCategory(e.target.value)} />
                    )}
                </div>
                <div>
                    <button className="btn btn-primary create-post-btn" type="submit">Create Post</button>
                </div>
            </form>
        </div>
    );
};

export default PostForm;
