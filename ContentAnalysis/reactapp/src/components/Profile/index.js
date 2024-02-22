import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown, DropdownButton, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import backgroundImage from '../../images/profile.webp';
import analyticsImage from '../../images/analytics.png';
import { AuthContext } from '../../AuthContext';
import './style.css';
import Sidebar from '../Sidebar/index.js';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [userAnalysis, setUserAnalysis] = useState([]);
  const [userEmail, setUserEmail] = useState([]);
  const [tokenValid, setTokenValid] = useState(false);
  const [daysUntilTokenExpiration, setDaysUntilTokenExpiration] = useState(0);

  useEffect(() => {
    const fetchUserAnalysis = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5000/user_analysis', {
          headers: { 'Authorization': `Bearer ${user.accessToken}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user analysis');
        }

        const data = await response.json();
        setUserAnalysis(data.analysis || []);
        setTokenValid(data.token_valid);
        setDaysUntilTokenExpiration(data.days_until_token_expiration);
        setUserEmail(data.user_email)
      } catch (error) {
        console.error('Error fetching user analysis:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.accessToken) {
      fetchUserAnalysis();
    } else {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSelectAnalysis = async (videoname) => {
    const username = user.username;
    console.log(`http://localhost:5000/dashboard/${encodeURIComponent(username)}/${encodeURIComponent(videoname)}`)
    try {
        const response = await fetch(`http://localhost:5000/dashboard/${encodeURIComponent(username)}/${encodeURIComponent(videoname)}`, {
        headers: { 'Authorization': `Bearer ${user.accessToken}` },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const analysisData = await response.json();
        navigate(`/dashboard/${username}/${encodeURIComponent(videoname)}`, { state: { analysisData } });
      } catch (error) {
        console.error('Error fetching dashboard data:', error.message);
      }
    }

  return (
    <div className="d-flex" style={{ height: '100vh' }}>
      <Sidebar />
      <div className="profile-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
        {isLoading ? (
          <div>Loading user profile...</div>
        ) : (
          <div className="user-profile">
            <div className="user-info">
              <h1>User Profile</h1>
              <hr />
              <h5><strong>Username:</strong> {user.username}</h5>
              <hr />
              <h5><strong>Email:</strong> {userEmail}</h5>
              <hr />
              <h5><strong>Token Validity:</strong> {tokenValid ? 'Valid' : 'Invalid'}</h5>
              <hr />
              <h5><strong>Days Until Token Expiration:</strong> {daysUntilTokenExpiration}</h5>
              <hr />
            </div>
            <div className="dropdown-container">
                <DropdownButton id="dropdown-analysis-list" title="Previous Analysis" className="analysis-dropdown">
                {userAnalysis.map((analysis, index) => (
                <Dropdown.Item key={analysis.analysis_id + index} onClick={() => handleSelectAnalysis(analysis.filename)}>
                    <img src={analyticsImage} alt="Analysis" className="analysis-icon" /> {analysis.filename}
                </Dropdown.Item>
                ))}
                </DropdownButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
