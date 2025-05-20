import React, { useState } from 'react';
import { login } from '../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await login({ email, password });
      const username = response.data.username;

      localStorage.setItem('username', username);
      
      alert('Giriş başarılı! Hoş geldiniz ' + username);

      window.location.href = '/';
    } catch (err) {
      alert('Giriş hatası: ' + err.response.data.error);
    }
  };

  return (
    <div className="container mt-3">
      <h2>Giriş Yap</h2>
      <form onSubmit={handleLogin}>
        <input type="email" className="form-control mb-2" id="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" className="form-control mb-2" id="password" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" className="btn btn-primary mt-2">Giriş Yap</button>
      </form>
    </div>
  );
};

export default Login;