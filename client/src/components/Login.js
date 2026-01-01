import React, { useState } from 'react';
import { login } from '../api';
import io from 'socket.io-client';
import { Link } from 'react-router-dom';

// Socket bağlantısını component dışında kurarsan sayfa yenilense bile aynı bağlantı kullanılır
const socket = io(process.env.REACT_APP_SOCKET_URL || '/');

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await login({ email, password });
      if (response.data && response.data.token && response.data.username) {
        const { token, username } = response.data;
        localStorage.setItem('username', username);
        localStorage.setItem('token', token);
        socket.emit('register', username);
        window.location.href = '/';
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
    <div className="min-vh-100 d-flex align-items-center pt-5" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-lg border-0">
              <div className="card-body p-4">
                {/* Header */}
                <div className="text-center mb-3">
                  <div className="mb-2">
                    <div className="bg-primary bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center" style={{width: '56px', height: '56px'}}>
                      <i className="fas fa-graduation-cap fa-1x text-white"></i>
                    </div>
                  </div>
                  <h3 className="fw-bold text-dark mb-1">Hoş Geldiniz</h3>
                  <p className="text-muted small mb-0">Hesabınıza giriş yapın</p>
                </div>

                {/* Navigation Tabs */}
                <div className="d-flex gap-3 mb-3 pb-2 border-bottom">
                  <span className="fw-semibold text-primary border-bottom border-primary border-2 pb-2" style={{paddingBottom: '6px', fontSize: '0.9rem'}}>Giriş Yap</span>
                  <Link to="/register" className="text-decoration-none text-muted fw-semibold" style={{fontSize: '0.9rem'}}>Kayıt Ol</Link>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="alert alert-danger d-flex align-items-center py-2 mb-3" role="alert" style={{fontSize: '0.875rem'}}>
                    <i className="fas fa-exclamation-circle me-2"></i>
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleLogin}>
                  {/* Email Input */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold text-dark small">
                      E-posta Adresi
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0" style={{padding: '0.375rem 0.75rem'}}>
                        <i className="fas fa-envelope text-primary"></i>
                      </span>
                      <input
                        id="email"
                        type="email"
                        className="form-control border-start-0 ps-0"
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

                  {/* Password Input */}
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-semibold text-dark small">
                      Şifre
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0" style={{padding: '0.375rem 0.75rem'}}>
                        <i className="fas fa-lock text-primary"></i>
                      </span>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        className="form-control border-start-0 border-end-0 ps-0"
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
                        style={{padding: '0.375rem 0.75rem'}}
                      >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  {/* Forgot Password */}
                  <div className="d-flex justify-content-end mb-3">
                    <Link to="/login" className="text-decoration-none text-primary small">
                      Şifrenizi mi unuttunuz?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    className="btn btn-primary w-100 mb-3 fw-semibold"
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

                  {/* Register Link */}
                  <div className="text-center small">
                    <span className="text-muted">Hesabınız yok mu? </span>
                    <Link to="/register" className="text-decoration-none fw-semibold text-primary">
                      Hemen kayıt olun
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
