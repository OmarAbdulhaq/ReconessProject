import React, { useState, useEffect } from 'react';
import logo from '../images/logo.png';
import { useNavigate } from 'react-router-dom';
import background from '../images/200.gif';
import 'bootstrap/dist/css/bootstrap.min.css';

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.passwordConfirmation) {
            setError('Passwords do not match.');
            return;
        }

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
            navigate('/home'); 
            const data = await response.json();
            console.log(data);
        } catch (error) {
            setError('Failed to submit form');
            console.error('There has been a problem with your fetch operation:', error);
        }
    };
    
    const inputWrapperStyle = {
        width: '95%',
        margin: '0 auto'
    };

    const formStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
      };
    
    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).background;
        document.body.style.background = `url(${background}) center/cover no-repeat`;
        return () => {
            document.body.style.background = originalStyle;
        };
    }, []);

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-4">
                    <div className="card" style= {formStyle}>
                        <div className="card-header text-center bg-primary text-white">
                            <img src={logo} alt="Logo" style={{ height: '100px', width: 'auto' }} />
                            <h3>Sign Up</h3>
                        </div>
                        <div className="card-body">
                            {error && <div className="alert alert-danger">{error}</div>}
                            <form onSubmit={handleSubmit}>
                                <div className="form-group mb-4" style={inputWrapperStyle}>
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
                                <div className="form-group mb-4" style={inputWrapperStyle}>
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
                                <div className="form-group mb-4" style={inputWrapperStyle}>
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
                                <div className="form-group mb-4" style={inputWrapperStyle}>
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