import React, { useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage('');
    setSuccess(false);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/auth/reset-password`,
        { email, resetCode, newPassword }
      );
      setMessage(res.data.message || "Password reset successful");
      setSuccess(true);
      setEmail('');
      setResetCode('');
      setNewPassword('');
      setTimeout(() => navigate('/signin'), 1500); // <<< Redirect to sign-in after 1.5s
    } catch (err) {
      setMessage(err.response?.data?.message || 'Reset failed');
      setSuccess(false);
    }
  };

  return (
    <div className="edit-profile-page">
      <h2>Reset Password</h2>
      <form onSubmit={handleReset}>
        <label>Email:</label>
        <input
          type="text"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Reset Code:</label>
        <input
          type="text"
          placeholder="Enter reset code"
          value={resetCode}
          onChange={(e) => setResetCode(e.target.value)}
          required
        />
        <label>New Password:</label>
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
      {message && (
        <p style={{ marginTop: "1rem", color: success ? "green" : "red" }}>{message}</p>
      )}
    </div>
  );
}
