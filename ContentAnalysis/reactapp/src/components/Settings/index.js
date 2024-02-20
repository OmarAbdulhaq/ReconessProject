import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import Sidebar from '../Sidebar/index.js';
import './style.css';

function SettingsPage() {
    const [newUsername, setNewUsername] = useState('');
    const { user, logout, updateUsername } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChangeUsername = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('You must be logged in to change the username.');
            navigate('/login');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/change_username', {
                method: 'PUT', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    original_username: user.username,
                    new_username: newUsername 
                }),
            });

            if (response.ok) {
                alert('Username successfully changed.');
                updateUsername(newUsername);
            } else {
                alert('Failed to change username. Please try again.');
            }
        } catch (error) {
            console.error('Error changing username:', error);
            alert('An error occurred. Please try again.');
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to delete your account?')) {
            try {
                const response = await fetch('http://localhost:5000/delete_account', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_identifier: user.username,
                    }),
                });

                if (response.ok) {
                    logout();
                    navigate('/login');
                    alert('Account successfully deleted.');
                } else {
                    alert('Failed to delete account. Please try again.');
                }
            } catch (error) {
                console.error('Error deleting account:', error);
                alert('An error occurred. Please try again.');
            }
        }
    };

    return (
        <div className="d-flex" style={{ height: '100vh' }}>
            <Sidebar />
            <div className="settings-container">
                <div className="form-container">
                    <h1>Settings</h1>
                    <form onSubmit={handleChangeUsername}>
                        <div className="mb-3">
                            <label htmlFor="newUsername" className="form-label">New Username</label>
                            <input type="text" className="form-control" id="newUsername" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                        </div>
                        <button type="submit" className="btn btn-primary">Change Username</button>
                    </form>
                    <hr />
                    <button className="btn btn-danger mt-3" onClick={handleDeleteAccount}>Delete Account</button>
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;