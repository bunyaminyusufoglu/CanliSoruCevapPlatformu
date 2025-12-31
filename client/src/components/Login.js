import React, { useState } from 'react';
import { login } from '../api';
import io from 'socket.io-client';
import { Link, useNavigate } from 'react-router-dom';

// Socket bağlantısını component dışında kurarsan sayfa yenilense bile aynı bağlantı kullanılır
const socket = io(process.env.REACT_APP_SOCKET_URL || '/');

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await login({ email, password });
      if (response.data && response.data.token && response.data.username) {
        const { token, username } = response.data;
        // Kullanıcı adını ve token'ı localStorage'a kaydet
        localStorage.setItem('username', username);
        localStorage.setItem('token', token);
        // 🔌 Kullanıcı adını sunucuya gönder
        socket.emit('register', username);
        // Başarılı giriş sonrası ana sayfaya yönlendir
        navigate('/');
        // Sayfa yenileme yerine navigate kullanıldığı için burada yenileme gerekmiyor
      } else if (response.data && response.data.error) {
        setError(response.data.error);
      } else {
        setError('Bilinmeyen hata oluştu.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid login-page">
      <div className="row min-vh-100">
        {/* Left: Form */}
        <div className="col-12 col-lg-7 d-flex align-items-center justify-content-center p-4 p-lg-5">
          <div className="login-card w-100" style={{maxWidth: 420}}>
            {/* Header */}
            <div className="text-center mb-4">
              <h2 className="fw-bold mb-2 text-dark">Hoş Geldiniz</h2>
              <p className="text-muted">Hesabınıza giriş yapın</p>
            </div>

            {/* Tabs */}
            <div className="d-flex mb-4 align-items-center gap-4">
              <span className="form-tab active">Giriş Yap</span>
              <Link to="/register" className="form-tab text-decoration-none">Kayıt Ol</Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="alert alert-danger d-flex align-items-center" role="alert">
                <i className="fas fa-exclamation-circle me-2"></i>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-semibold small">
                  E-posta Adresi
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="fas fa-envelope text-muted"></i>
                  </span>
                  <input
                    id="email"
                    type="email"
                    className="form-control border-start-0"
                    placeholder="ornek@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label fw-semibold small">
                  Şifre
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="fas fa-lock text-muted"></i>
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-control border-start-0 border-end-0"
                    placeholder="Şifrenizi girin"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary border-start-0"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="d-flex justify-content-end align-items-center mb-4">
                <Link to="/login" className="small text-decoration-none text-primary">
                  Şifrenizi mi unuttunuz?
                </Link>
              </div>

              <button 
                type="submit" 
                className="btn btn-teal w-100"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Giriş yapılıyor...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Giriş Yap
                  </>
                )}
              </button>

              <div className="text-center mt-4">
                <span className="text-muted small">Hesabınız yok mu? </span>
                <Link to="/register" className="text-decoration-none fw-semibold text-primary">
                  Hemen kayıt olun
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Illustration */}
        <div className="col-12 col-lg-5 login-hero d-none d-lg-flex align-items-center justify-content-center bg-primary">
          <div className="text-center px-4">
            <div className="hero-graphic mb-4">
              <i className="fas fa-laptop fa-4x text-white"></i>
            </div>
            <h3 className="text-white mb-3 fw-semibold">Modern, güvenli ve hızlı giriş deneyimi</h3>
            <p className="text-white-50">Eğitim yolculuğunuza devam edin</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
