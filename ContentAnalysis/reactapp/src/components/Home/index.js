import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthContext } from '../../AuthContext';
import LoadingGif from '../../images/loading.gif'
import Sidebar from '../Sidebar/index.js'

function HomePage() {
    const [files, setFiles] = useState([]);
    const [preview, setPreview] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (files.length > 0) {
            const file = files[0];
            const url = URL.createObjectURL(file);
            setPreview(url);

            return () => URL.revokeObjectURL(url);
        }
    }, [files]);

    const handleUpload = async () => {
        if (!user || !user.accessToken) {
            alert('You must be logged in to upload files.');
            navigate('/login');
            return;
        }
    
        if (files.length > 0) {
            setIsLoading(true); 
            const file = files[0];
            const formData = new FormData();
            formData.append("file", file);
    
            try {
                const response = await fetch("http://localhost:5000/medialysis", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${user.accessToken}`,
                    },
                    body: formData,
                });
    
                setIsLoading(false);
                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                    alert('Media uploaded successfully!');
                    navigate('/dashboard');
                } else {
                    const errorData = await response.json();
                    alert(`Error uploading file: ${errorData.message || response.statusText}`);
                }
            } catch (error) {
                setIsLoading(false);
                console.error('Error uploading file:', error);
                alert(`Error uploading file: ${error.message}`);
            }
        } else {
            alert('No files selected');
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => {
            setFiles(acceptedFiles);
        },
        multiple: false,
        accept: {
            'video/mp4': ['.mp4'],
            'video/mpeg': ['.mpeg'],
            'video/ogg': ['.ogg'],
            'video/webm': ['.webm'],
        },
    });

    const mainContentStyle = {
        position: 'relative',
        flex: 1,
        minHeight: '100vh',
        backgroundImage: `url(${require('../../images/homepage.jpg')})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
    };

    const overlayContainerStyle = {
        textAlign: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        width: '80%',
        maxWidth: '600px',
        zIndex: 1,
    };

    const loadingContainerStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%', 
        height: '100%', 
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    };

    return (
        <div className="d-flex" style={{ height: '100vh' }}>
            <Sidebar />
            <div style={mainContentStyle}>
                {isLoading ? (
                    <div style={loadingContainerStyle}>
                        <img src={LoadingGif} alt="Loading..." style={{ width: '100px', height: '100px', marginBottom: '20px' }} />
                        <h3><b>Loading...</b></h3>
                        <p className="mt-3">Analyzing media, please wait...</p>
                        <p className="mt-3" style={{color: "red"}}>Warning: This might take a little while, please stay in this page. The app is still under development</p>
                        <p className="mt-3" style={{color: "red"}}>The app is still under development</p>
                    </div>
                ) : (
                    <div style={overlayContainerStyle}>
                    <h1><b>UPLOAD MEDIA & WE'LL ANALYZE!</b></h1>
                    <hr></hr>
                    <div {...getRootProps()} style={{ border: '4px dashed #6c757d', borderRadius: '10px', backgroundColor: isDragActive ? '#e2e6ea' : '#f8f9fa', padding: '40px', textAlign: 'center', fontSize: '1.2rem', color: '#495057', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: 'auto', maxWidth: '400px', minHeight: '200px'}}>
                        <input {...getInputProps()} />
                        {isDragActive ? <p>Drop the video files here ...</p> : <p>Drag and Drop or Select video files here</p>}
                        {preview && (
                            <img src={preview} alt="Preview" style={{ marginTop: '20px', maxHeight: '200px' }} />
                        )}
                    </div>
                    <button className="btn btn-primary" style={{ marginTop: '20px', fontSize: '1.2rem', padding: '10px 20px' }} onClick={handleUpload}>Upload and Analyze</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default HomePage;