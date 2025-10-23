import React, { useState, useEffect } from 'react';
import { login } from '../api';
import io from 'socket.io-client';

// Socket bağlantısını component dışında kurarsan sayfa yenilense bile aynı bağlantı kullanılır
const socket = io(process.env.REACT_APP_SOCKET_URL || '/');

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault(); // Formun sayfayı yenilemesini engeller
    try {
      const response = await login({ email, password });
      if (response.data && response.data.token && response.data.username) {
        const { token, username } = response.data;
        // Kullanıcı adını ve token'ı localStorage'a kaydet
        localStorage.setItem('username', username);
        localStorage.setItem('token', token);
        // 🔌 Kullanıcı adını sunucuya gönder
        socket.emit('register', username);
        alert('Giriş başarılı! Hoş geldiniz ' + username);
        window.location.href = '/';
      } else if (response.data && response.data.error) {
        alert('Giriş hatası: ' + response.data.error);
      } else {
        alert('Bilinmeyen hata oluştu.');
      }
    } catch (err) {
      alert('Giriş hatası: ' + (err.response?.data?.error || 'Sunucuya bağlanılamadı.'));
    }
  };

  return (
    <div className="container mt-3">
      <h2>Giriş Yap</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          className="form-control mb-2"
          id="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="form-control mb-2"
          id="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary mt-2">Giriş Yap</button>
      </form>
    </div>
  );
};

export default Login;
