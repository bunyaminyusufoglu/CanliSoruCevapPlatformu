import React, { useState } from 'react';
import { login } from '../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await login({ email, password });
      alert('Giriş başarılı! Hoş geldiniz ' + response.data.username);
    } catch (err) {
      alert('Giriş hatası: ' + err.response.data.error);
    }
  };

  return (
    <div className="container mt-3">
      <h2>Giriş Yap</h2>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin} className="btn btn-primary mt-2">Giriş Yap</button>
    </div>
  );
};

export default Login;