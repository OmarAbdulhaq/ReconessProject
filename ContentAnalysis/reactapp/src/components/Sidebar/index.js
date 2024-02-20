import React, { useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../../images/logo.png';
import userImg from '../../images/user.png';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthContext } from '../../AuthContext';
import './style.css';

function Sidebar(){
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const isActive = (path) => location.pathname === path;

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:5000/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: user }),
            });
    
            if (response.ok) {
                logout();
                const responseData = await response.json();
                if (responseData.redirect) {
                    navigate('/login')
                }
            } else {
                console.error('Logout failed:', response.statusText);
            }
        } catch (error) {
            console.error('Error logging out:', error.message);
        }
    };

    return(
        <div className="sidebarStyle">
            <Link to="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-black text-decoration-none">
                <img src={logo} alt="Logo" style={{ height: '40px' }} />
                <span className="fs-4"><b> Medialysis</b></span>
            </Link>
            <hr />
            <ul className="nav nav-pills flex-column mb-auto">
                <li className="nav-item">
                    <Link to="/" className={`nav-link text-black fs-5 ${isActive('/') ? 'active text-white' : ''}`}>
                        Home
                    </Link>
                </li>
                <li>
                    <Link to="/token" className={`nav-link text-black fs-5 ${isActive('/token') ? 'active text-white' : ''}`}>
                        Generate a Token
                    </Link>
                </li>
                <li>
                    <Link to="/dashboard" className={`nav-link text-black fs-5 ${isActive('/dashboard') ? 'active text-white' : ''}`}>
                        Dashboard
                    </Link>
                </li>
                <li>
                    <Link to="/aboutus" className={`nav-link text-black fs-5 ${isActive('/aboutus') ? 'active text-white' : ''}`}>
                        About Us
                    </Link>
                </li>
            </ul>
            <div className="dropdown mt-auto">
                <Link to="#" className="d-flex align-items-center text-black text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
                    <img src={userImg} alt="User" width="32" height="32" className="rounded-circle me-2" />
                    <strong>{user ? user.username : 'User'}</strong>
                </Link>
                <ul className="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1">
                    <li><Link className="dropdown-item text-white fs-5" to="/profile">Profile</Link></li>
                    <li><Link to="/settings" className={`nav-link text-white fs-5`}>Settings</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><Link to="/login" className="nav-link fs-5 text-white" onClick={handleLogout}>Sign out</Link></li>
                </ul>
            </div>
        </div>
    );
}

export default Sidebar;