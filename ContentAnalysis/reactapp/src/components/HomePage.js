import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../images/logo.png';
import userImg from '../images/user.png';
import 'bootstrap/dist/css/bootstrap.min.css';

function HomePage() {
    const navigate = useNavigate();

    const handleUploadVideo = () => {
        navigate('/upload-video');
    };

    return (
        <div className="d-flex" style={{ height: '100vh' }}>
            <div className="d-flex flex-column justify-content-between flex-shrink-0 p-3 bg-light" style={{ width: '280px' }}>
                <Link to="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-black text-decoration-none">
                    <img src={logo} alt="Logo" style={{ height: '40px' }} />
                    <span className="fs-4">SAVV.io</span>
                </Link>
                <hr></hr>
                <ul className="nav nav-pills flex-column mb-auto">
                    <li className="nav-item">
                        <Link to="/home" className="nav-link text-black fs-5">
                            Home
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
                            <strong>User</strong>
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
            <div className="flex-grow-1 p-3">
                <h2>Welcome to the HomePage</h2>
                <div className="mt-4">
                    <button onClick={handleUploadVideo} className="btn btn-primary">
                        Upload Video
                    </button>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
