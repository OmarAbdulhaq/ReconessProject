import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import logo from '../images/logo.png';
import userImg from '../images/user.png';
import { useDropzone } from 'react-dropzone';
import 'bootstrap/dist/css/bootstrap.min.css';
import backgroundImage from '../images/background.webp';
import { AuthContext } from '../AuthContext';

function HomePage() {
    const [files, setFiles] = useState([]);
    const { user } = useContext(AuthContext);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: async (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                const formData = new FormData();
                formData.append("file", file, file.name);
    
                try {
                    const username = user.username;
                    formData.append("username", username);
    
                    const response = await fetch('http://localhost:5000/medialysis', {
                        method: 'POST',
                        body: formData,
                    });

                    if (response.ok) {
                        const result = await response.json();
                        console.log('Upload successful:', result);
                        alert(`File uploaded successfully.`);
                    } else {
                        throw new Error('Upload failed');
                    }
                } catch (error) {
                    console.error('Error uploading file:', error);
                    alert('Error uploading file');
                }
            } else {
                alert('No files selected');
            }
        },
        multiple: false,
    });
    
    const handleUpload = () => {
        alert(`Analyzing: ${files.map(file => file.name).join(', ')}`);
    };

    const dropzoneStyle = {
        border: '4px dashed #6c757d',
        borderRadius: '10px',
        backgroundColor: isDragActive ? '#e2e6ea' : '#f8f9fa',
        padding: '40px',
        textAlign: 'center',
        fontSize: '1.2rem',
        color: '#495057',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 'auto',
        minWidth: '600px',
        minHeight: '200px'
    };

    const overlayStyle = {
        position: 'absolute',
        top: '50%', 
        left: '80%', 
        transform: 'translate(-50%, -50%)', 
        width: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'black',
        textAlign: 'center',
        zIndex: 2,
        textShadow: '0.5px 0.5px 2px rgba(0, 0, 0, 0.8)',
    };

    const imageContainerStyle = {
        position: 'relative', 
        width: '100%', 
        height: '350px',
        marginBottom: '20px',
    };

    const imageStyle = {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: 1,
    };

    const buttonStyle = {
        marginTop: '20px',
        fontSize: '1.2rem',
        padding: '10px 20px',
    };

    return (
        <div className="d-flex" style={{ height: '100vh' }}>
            <div className="d-flex flex-column justify-content-between flex-shrink-0 p-3 bg-light" style={{ width: '280px' }}>
                <Link to="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-black text-decoration-none">
                    <img src={logo} alt="Logo" style={{ height: '40px' }} />
                    <b><span className="fs-4">Medialysis</span></b>
                </Link>
                <hr></hr>
                <ul className="nav nav-pills flex-column mb-auto">
                    <li className="nav-item">
                        <Link to="/home" className="nav-link text-black fs-5">
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link to="/token" className="nav-link text-black fs-5">
                            Generate a Token
                        </Link>
                    </li>
                    <li>
                        <Link to="/dashboard" className="nav-link text-black fs-5">
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link to="/aboutus" className="nav-link text-black fs-5">
                            About Us
                        </Link>
                    </li>
                </ul>
                <div className="mt-auto">
                    <div className="dropdown">
                        <Link to="#" className="d-flex align-items-center text-black text-decoration-none dropdown-toggle" id="dropdownUser1" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <img src={userImg} alt="User" width="32" height="32" className="rounded-circle me-2 fs-5"  />
                            <strong>{user ? user.username : 'User'}</strong>
                        </Link>
                        <ul className="dropdown-menu text-small shadow" style={{ position: 'absolute' }} aria-labelledby="dropdownUser1">
                            <li><Link className="dropdown-item fs-5" to="/settings">Settings</Link></li>
                            <li><Link className="dropdown-item fs-5" to="/profile">Profile</Link></li>
                            <li><hr className="dropdown-divider" /></li>
                            <li><Link className="dropdown-item fs-5" to="/signout">Sign out</Link></li>
                        </ul>
                    </div>
                </div>
                </div>
                <div className="flex-grow-1 p-3 d-flex flex-column align-items-center justify-content-center">
                <div style={imageContainerStyle}>
                    <div style={imageStyle}></div>
                    <div style={overlayStyle}>
                        <h1><b>UPLOAD MEDIA AND LET US DO THE ANALYSIS!</b></h1>
                        <br></br>
                        <h3>Upload a video, an audio, or a text file and have a great experience with the sentiment analysis model over here. Determining people's feelings and understanding their intentions might be a difficult task, but we're here for you to do that, and more!</h3>
                    </div>
                </div>
                <div {...getRootProps()} style={dropzoneStyle}>
                    <input {...getInputProps({
                        onChange: e => setFiles(e.target.files)
                    })} />
                    {isDragActive ? <p>Drop the files here ...</p> : <p>Drag and Drop or Select files here</p>}
                </div>
                <button style={buttonStyle} className="btn btn-primary" onClick={handleUpload}>Upload and Analyze</button>
            </div>
        </div>
    );
}

export default HomePage;
