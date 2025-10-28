import React, { useState } from 'react';
import { login } from '../api';
import io from 'socket.io-client';
import { Link } from 'react-router-dom';

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
    <div className="container-fluid login-page">
      <div className="row">
        {/* Left: Form */}
        <div className="col-12 col-lg-7 d-flex align-items-center justify-content-center p-4 p-lg-5">
          <div className="login-card w-100" style={{maxWidth: 420}}>
            {/* Tabs */}
            
            <div className="d-flex mb-4 align-items-center gap-4">
              <span className="form-tab active">Login</span>
              <Link to="/register" className="form-tab">Sign up</Link>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <div className="input-with-icon">
                  <i className="fas fa-envelope"></i>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-2">
                <div className="input-with-icon">
                  <i className="fas fa-lock"></i>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <Link to="/login" className="small text-decoration-none text-primary-50">Forgot your password?</Link>
              </div>

              <button type="submit" className="btn btn-teal w-100">
                Login
              </button>
            </form>
          </div>
        </div>

        {/* Right: Illustration */}
        <div className="col-12 col-lg-5 login-hero d-none d-lg-flex align-items-center justify-content-center bg-primary">
          <div className="text-center px-4">
            <div className="hero-graphic mb-4">
              <i className="fas fa-laptop fa-4x text-white"></i>
            </div>
            <h3 className="text-white-50 fw-normal">Modern, güvenli ve hızlı giriş deneyimi</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
