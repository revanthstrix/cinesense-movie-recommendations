import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { BACKEND_URL } from '../config';
import { useNavigate } from 'react-router-dom';

export default function SignIn() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        return setError(data.message || 'Login failed');
      }

      login(data.user, data.token);
      navigate('/home');
    } catch (err) {
      setError('Server error');
    }
  };

  return (
    <div style={styles.background}>
      <div style={styles.glass}>
        <h2 style={styles.title}>Sign In</h2>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" onClick={handleSubmit} style={styles.button}>Login</button>
        </form>
        <p style={styles.text}>
          Don’t have an account?{' '}
          <span onClick={() => navigate('/register')} style={styles.link}>Register</span>
        </p>
        <p style={{ textAlign: 'center' }}>
  <a href="/forgot-password" style={{ color: '#6b8efb' }}>Forgot Password?</a>
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
    gap: '1rem'
  },
  title: {
    color: 'white',
    textAlign: 'center',
    fontSize: '26px',
    letterSpacing: '1px',
    fontWeight: 'bold'
  },
  input: {
    padding: '0.75rem',
    borderRadius: '10px',
    border: 'none',
    outline: 'none',
    fontSize: '16px'
  },
  button: {
    padding: '0.9rem',
    borderRadius: '10px',
    backgroundColor: '#6b8efb',
    border: 'none',
    fontWeight: 'bold',
    color: '#000010',
    cursor: 'pointer',
    transition: '0.3s ease'
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
    fontWeight: 'bold'
  }
};
