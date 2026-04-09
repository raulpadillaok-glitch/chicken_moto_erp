import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorStatus, setErrorStatus] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorStatus('');
    try {
      const response = await axios.post('http://localhost:8000/api/v1/auth/login/', {
        username: username,
        password: password
      });
      const token = response.data.access;
      localStorage.setItem('access_token', token);
      localStorage.setItem('user_role', response.data.role);
      navigate('/dashboard'); // Redirect a Dashboard
    } catch (error) {
      setErrorStatus('Credenciales inválidas. Verifica tu usuario y contraseña.');
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card" style={{ width: '400px', maxWidth: '90%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--primary-color)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            🏍️
          </h1>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Moto ERP</h2>
          <p style={{ color: 'var(--text-muted)' }}>Panel de Control Total</p>
        </div>

        <form onSubmit={handleLogin}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-muted)' }}>
              Usuario
            </label>
            <input 
              type="text" 
              placeholder="tu@correo.com" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-muted)' }}>
              Contraseña
            </label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
            Ingresar al Sistema
          </button>
          
          {errorStatus && (
            <div style={{ marginTop: '1rem', color: '#ef4444', textAlign: 'center', fontWeight: '600', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
              {errorStatus}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
