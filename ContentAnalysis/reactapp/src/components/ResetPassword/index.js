import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';;
import logo from '../../images/logo.png';
import background from '../../images/login.gif';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

function ResetPasswordWithCode() {
    const [formData, setFormData] = useState({
        email: '',
        backupCode: '',
        newPassword: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    
    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).background;
        document.body.style.background = `url(${background}) no-repeat center center fixed`;
        document.body.style.backgroundSize = 'cover';
        return () => {
            document.body.style.background = originalStyle;
        };
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:5000/reset-password-with-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    backup_code: formData.backupCode,
                    new_password: formData.newPassword,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'An error occurred while resetting your password.');
            }

            setError('');
            navigate('/login');
        } catch (error) {
            setError(error.message);
            console.error('There has been a problem with your fetch operation:', error);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-4">
                    <div className="card formStyle">
                        <div className="card-header text-center bg-primary text-white">
                            <img src={logo} alt="Logo" className="logo" style={{width: "80px"}} />
                            <h3>Reset Password</h3>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group mb-3 inputWrapper">
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
                                <div className="form-group mb-3 inputWrapper">
                                    <label htmlFor="backupCode">Backup Code</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="backupCode"
                                        name="backupCode"
                                        value={formData.backupCode}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group mb-3 inputWrapper">
                                    <label htmlFor="newPassword">New Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="newPassword"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="text-center">
                                    <button type="submit" className="btn btn-primary btn-lg">Reset Password</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResetPasswordWithCode;