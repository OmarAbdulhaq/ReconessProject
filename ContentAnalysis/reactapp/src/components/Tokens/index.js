import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css'
import Sidebar from '../Sidebar/index.js'

function GenerateTokenPage() {
    const { user, logout, login } = useContext(AuthContext);
    const [tokenInfo, setTokenInfo] = useState(null);
    const [isTokenValid, setIsTokenValid] = useState(false);
    const [daysLeft, setDaysLeft] = useState(0);
    const navigate = useNavigate();
    
    useEffect(() => {
        if (tokenInfo && tokenInfo.API_access_token_expire) {
            const expireDate = new Date(tokenInfo.API_access_token_expire);
            const currentDate = new Date();
            const validity = expireDate > currentDate;
            setIsTokenValid(validity);
            if (validity) {
                const diffTime = Math.abs(expireDate - currentDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                setDaysLeft(diffDays);
            }
        }
    }, [tokenInfo]);

    const handleGenerateToken = async () => {
        if (!user) {
            alert('Please log in to generate a token.');
            navigate('/login');
            return;
        }
    
        try {
            const response = await fetch('http://localhost:5000/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.accessToken}`,
                },
                body: JSON.stringify({ username: user.username }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to generate token: ${errorData.msg}`);
            }
    
            const data = await response.json();
            setTokenInfo(data);
            alert('Token generated successfully.');
        } catch (error) {
            console.error('Error generating token:', error);
            alert(error.message);
        }
    };

    return (
        <div className="d-flex" style={{ height: '100vh' }}>
            <Sidebar />
            <div className="contentAreaStyle">
                <div className="centeredContentStyle">
                    <h1><b>Generate Your API Token</b></h1>
                    <hr></hr>
                    <p>Each token is valid for one month and can be used to authenticate API requests.</p>
                    <button className="btn btn-primary" onClick={handleGenerateToken} style={{ marginTop: '20px', fontSize: '1.2rem', padding: '10px 20px' }}>
                        Generate Token
                    </button>
                    {isTokenValid && (
                        <p style={{color: 'red', marginTop: '20px'}}>
                            You already have a valid token. There's no need to generate a new one.
                        </p>
                    )}
                    {tokenInfo && (
                        <div className="mt-3">
                            <p><b>Your API Token:</b> {tokenInfo.API_access_token}</p>
                            <p><b>Expires:</b> {tokenInfo.API_access_token_expire}</p>
                            <p>You have {daysLeft} day(s) left before this token expires.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default GenerateTokenPage;
