import React, { useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/forgot-password`, { email });
      setMessage(res.data.message);

      // Redirect after a short delay (optional: display message for UX)
      setTimeout(() => {
        // You may want to pass the email to the next page as state or via query params
        navigate('/reset-password', { state: { email } });
      }, 1500); // 1.5 seconds to show success message (customize as you like)

    } catch (err) {
      setMessage(err.response?.data?.message || 'Error sending reset email');
    }
  };

  return (
    <div className="edit-profile-page">
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <label>Enter your registered email:</label>
        <input
          type="text"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Send Reset Link</button>
        {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
      </form>
    </div>
  );
}
