import React, { useContext, useState } from 'react';
import { AuthContext } from '../auth/AuthContext';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import './EditProfile.css';

export default function EditProfile() {
  const { user, token, updateUser } = useContext(AuthContext);
  const [username, setName] = useState(user?.username || '');
  const [profilePic, setProfilePic] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'profile_upload'); // Cloudinary
    const res = await axios.post('https://api.cloudinary.com/v1_1/dibkhklvv/image/upload', formData);
    return res.data.secure_url;
  };

  const handleSave = async () => {
    try {
      let uploadedUrl = user.profilePic;
      if (profilePic) {
        uploadedUrl = await handleImageUpload(profilePic);
      }

      const payload = {
        username,
        profilePic: uploadedUrl,
        ...(newPassword && { currentPassword, newPassword })
      };

      const res = await axios.put(`${BACKEND_URL}/auth/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      updateUser(res.data);
      alert('Profile updated!');
      navigate('/profile');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating profile');
    }
  };

  return (
    <div className="edit-profile-page">
      <h2>Edit Profile</h2>
      <label>Name:</label>
      
      <input type='text' value={username} onChange={(e) => setName(e.target.value)} />

      <label>Profile Picture:</label>
<label className="custom-file-upload">
  <input type="file" onChange={(e) => setProfilePic(e.target.files[0])} />
  Upload Image
</label>


      <hr />
      <h3>Change Password (Optional)</h3>
      <input
        type="password"
        placeholder="Current Password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <button onClick={handleSave}>Save Changes</button>
    </div>
  );
}
