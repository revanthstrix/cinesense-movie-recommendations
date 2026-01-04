import React, { useContext, useEffect, useState } from 'react';
import './Profile.css';
import { AuthContext } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../config';

const Profile = () => {
  const { user, token, logout, updateUser } = useContext(AuthContext);
  const [latestUser, setLatestUser] = useState(user);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserFromDB = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLatestUser(res.data);
        updateUser(res.data); // optional: update AuthContext
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };

    if (user && token) {
      fetchUserFromDB();
    }
  }, [user, token, updateUser]);

  if (!latestUser) {
    return <p className="profile-page">Loading user details...</p>;
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <img
          src={
            latestUser.profilePic ||
            'https://res.cloudinary.com/dibkhklvv/image/upload/v1752053832/vv8p885dbpdgumw2jiwr.jpg'
          }
          alt="Profile"
          className="profile-avatar1"
        />
        <h2 className="profile-name">{latestUser.name || latestUser.username || 'Unknown User'}</h2>
        <p className="profile-email">{latestUser.email || 'Email not available'}</p>

        <div className="profile-actions">
          {latestUser.role === 'admin' && (
            <button onClick={() => navigate('/admin-dashboard')}>
              Go to Dashboard
            </button>
          )}
          <button onClick={() => navigate('/home')}>Go to HomePage</button>
          <button onClick={() => navigate('/edit-profile')}>Edit Profile</button>
          <button className="logout" onClick={logout}>Logout</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
