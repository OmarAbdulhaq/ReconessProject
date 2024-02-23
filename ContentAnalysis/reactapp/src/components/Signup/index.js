import React, { useState, useEffect } from 'react';
import logo from '../../images/logo.png';
import { useNavigate } from 'react-router-dom';
import background from '../../images/login.gif';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css'; 

function SignUpForm() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        passwordConfirmation: ''
    });
    const navigate = useNavigate();

    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        const { username, email, password, passwordConfirmation } = formData;
        
        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return false;
        }

        const hasNumbers = /\d/.test(password);
        const hasLetters = /[a-zA-Z]/.test(password);
        if (!hasNumbers || !hasLetters) {
            setError('Password must contain both letters and numbers.');
            return false;
        }

        if (!/^[a-zA-Z0-9]+$/.test(username)) {
            setError('Username must not contain special characters.');
            return false;
        }

        if (password !== passwordConfirmation) {
            setError('Passwords do not match.');
            return false;
        }

        setError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const response = await fetch('http://localhost:5000/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            if (!response.ok) {
                console.error('Fetch error:', response.status);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            alert('Now Try and login with your information!')
            navigate('/login'); 
            
        } catch (error) {
            setError('Failed to submit form');
            console.error('There has been a problem with your fetch operation:', error);
        }
    };

    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).background;
        document.body.style.background = `url(${background}) no-repeat center center fixed`;
        document.body.style.backgroundSize = 'cover';
        return () => {
            document.body.style.background = originalStyle;
        };
    }, []);
    
    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-4">
                    <div className="card formStyle">
                        <div className="card-header text-center bg-primary text-white">
                        <img src={logo} alt="Logo" className="logo" style={{width: "80px"}} />  
                            <h3>Sign Up</h3>
                        </div>
                        <div className="card-body">
                            {error && <div className="alert alert-danger">{error}</div>}
                            <form onSubmit={handleSubmit}>
                                <div className="form-group mb-4 inputWrapper"> 
                                    <label htmlFor="username">Username</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group mb-4 inputWrapper"> 
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group mb-4 inputWrapper"> 
                                    <label htmlFor="password">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group mb-4 inputWrapper"> 
                                    <label htmlFor="passwordConfirmation">Confirm Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="passwordConfirmation"
                                        name="passwordConfirmation"
                                        value={formData.passwordConfirmation}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="text-center">
                                    <button type="submit" className="btn btn-primary btn-lg">Sign Up</button>
                                </div>
                                <br></br>
                                <div className="card-footer">
                                    You have an account? <a href="/login">Sign in</a>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUpForm;