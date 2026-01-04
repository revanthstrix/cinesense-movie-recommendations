import React from 'react';
import ReactDOM from 'react-dom/client'; // ✅ note this change
import App from './App';
import {AuthProvider} from './auth/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
