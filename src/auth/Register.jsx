import React, { useState } from 'react';
import { BACKEND_URL } from '../config';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/;

    if (!emailRegex.test(form.email)) {
      return setError('Please enter a valid email address');
    }

    if (!strongPasswordRegex.test(form.password)) {
      return setError(
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
      );
    }

    try {
      const res = await fetch(`${BACKEND_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        return setError(data.message || 'Registration failed');
      }

      setSuccess('Registration successful! Redirecting to Sign In...');
      setTimeout(() => navigate('/signin'), 2000);
    } catch (err) {
      setError('Server error');
    }
  };

  return (
    <div style={styles.background}>
      <div style={styles.glass}>
        <h2 style={styles.title}>Register</h2>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        {success && <p style={{ color: 'lightgreen', textAlign: 'center' }}>{success}</p>}
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <button type="submit" onClick={handleSubmit} style={styles.button}>
          Register
        </button>
        <p style={styles.text}>
          Already have an account?{' '}
          <span onClick={() => navigate('/signin')} style={styles.link}>
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  background: {
    minHeight: '100vh',
    background: '#1E1E1E',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glass: {
    width: '360px',
    padding: '2rem',
    borderRadius: '20px',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(15px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  title: {
    color: 'white',
    textAlign: 'center',
    fontSize: '26px',
    letterSpacing: '1px',
    fontWeight: 'bold',
  },
  input: {
    padding: '0.75rem',
    borderRadius: '10px',
    border: 'none',
    outline: 'none',
    fontSize: '16px',
  },
  button: {
    padding: '0.9rem',
    borderRadius: '10px',
    backgroundColor: '#6b8efb',
    border: 'none',
    fontWeight: 'bold',
    color: '#000010',
    cursor: 'pointer',
    transition: '0.3s ease',
  },
  text: {
    color: 'white',
    textAlign: 'center',
    fontSize: '18px',
    fontFamily: 'Times New Roman, Times, serif',
  },
  link: {
    color: '#6b8efb',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};
