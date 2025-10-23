import React, { useState } from 'react';
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
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="form-container">
            <div className="text-center mb-4">
              <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: 80, height: 80}}>
                <i className="fas fa-sign-in-alt fa-2x"></i>
              </div>
              <h2 className="fw-bold text-primary">Giriş Yap</h2>
              <p className="text-muted">Hesabınıza giriş yapın</p>
            </div>
            
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  <i className="fas fa-envelope me-2"></i>Email
                </label>
                <input
                  type="email"
                  className="form-control form-control-lg"
                  id="email"
                  placeholder="Email adresinizi girin"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="password" className="form-label">
                  <i className="fas fa-lock me-2"></i>Şifre
                </label>
                <input
                  type="password"
                  className="form-control form-control-lg"
                  id="password"
                  placeholder="Şifrenizi girin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <button type="submit" className="btn btn-primary btn-lg w-100 btn-custom">
                <i className="fas fa-sign-in-alt me-2"></i>Giriş Yap
              </button>
            </form>
            
            <div className="text-center mt-4">
              <p className="text-muted">
                Hesabınız yok mu? 
                <a href="/register" className="text-primary text-decoration-none ms-1">
                  <i className="fas fa-user-plus me-1"></i>Kayıt Ol
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
