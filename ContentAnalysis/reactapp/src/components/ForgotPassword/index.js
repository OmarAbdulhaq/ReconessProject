import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../images/logo.png';
import background from '../../images/login.gif';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

function GenerateBackupCodes() {
    const [backupCodes, setBackupCodes] = useState([]);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).background;
        document.body.style.background = `url(${background}) no-repeat center center fixed`;
        document.body.style.backgroundSize = 'cover';
        return () => {
            document.body.style.background = originalStyle;
        };
    }, []);

    const handleGenerateCodes = async () => {
        setError('');
        if (!email) {
            setError('Please enter an email');
            return;
        }
        try {
            const response = await fetch('http://localhost:5000/generate-backup-codes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.backup_codes) {
                setBackupCodes(data.backup_codes);
            } else {
                if (data.message === "Backup codes have already been generated for this user.") {
                    navigate('/resetpassword');
                }
                setError(data.message || 'Failed to generate backup codes');
            }
        } catch (error) {
            setError('Failed to generate backup codes');
            console.error('There has been a problem with your fetch operation:', error);
        }
    };

    const handleProceed = () => {
        navigate('/resetpassword');
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-4">
                    <div className="card formStyle">
                        <div className="card-header text-center bg-primary text-white">
                            <img src={logo} alt="Logo" className="logo" style={{width: "80px"}} />
                            <h3>Generate Backup Codes</h3>
                        </div>
                        <div className="card-body">
                            {error && <div className="alert alert-danger">{error}</div>}
                            <div className="form-group">
                                <label htmlFor="email">Email:</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                />
                            </div>
                            <button onClick={handleGenerateCodes} className="btn btn-primary btn-lg mt-3">Generate Codes</button>
                            {backupCodes.length > 0 && (
                                <div className="backup-codes mt-3">
                                    <h5>Your Backup Codes:</h5>
                                    <ul>
                                        {backupCodes.map((code, index) => (
                                            <li key={index}>{code}</li>
                                        ))}
                                    </ul>
                                    <p>Store these codes in a safe place. Each code can only be used once.</p>
                                </div>
                            )}
                        </div>
                        <div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GenerateBackupCodes;
