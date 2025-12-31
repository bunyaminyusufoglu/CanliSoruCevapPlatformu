import React, { useState } from 'react';
import { register } from '../api';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [ad, setAd] = useState('');
  const [soyad, setSoyad] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const response = await register({ ad, soyad, username, email, password });
      setSuccess(response?.data?.message || 'Kayıt başarılı! Yönlendiriliyorsunuz...');
      // Başarılı kayıt sonrası 1.5 saniye bekleyip login sayfasına yönlendir
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Bilinmeyen hata oluştu.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError('');
  };

  return (
    <div className="container-fluid login-page">
      <div className="row min-vh-100">
        {/* Left: Form */}
        <div className="col-12 col-lg-7 d-flex align-items-center justify-content-center p-4 p-lg-5">
          <div className="login-card w-100" style={{maxWidth: 520}}>
            {/* Header */}
            <div className="text-center mb-4">
              <h2 className="fw-bold mb-2 text-dark">Hesap Oluşturun</h2>
              <p className="text-muted">Hemen kayıt olun ve eğitime başlayın</p>
            </div>

            {/* Tabs */}
            <div className="d-flex mb-4 align-items-center gap-4">
              <Link to="/login" className="form-tab text-decoration-none">Giriş Yap</Link>
              <span className="form-tab active">Kayıt Ol</span>
            </div>

            {/* Success Message */}
            {success && (
              <div className="alert alert-success d-flex align-items-center" role="alert">
                <i className="fas fa-check-circle me-2"></i>
                <span>{success}</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="alert alert-danger d-flex align-items-center" role="alert">
                <i className="fas fa-exclamation-circle me-2"></i>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegister}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="ad" className="form-label fw-semibold small">
                    Ad
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <i className="fas fa-user text-muted"></i>
                    </span>
                    <input
                      id="ad"
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Adınız"
                      value={ad}
                      onChange={(e) => {
                        setAd(e.target.value);
                        clearError();
                      }}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <label htmlFor="soyad" className="form-label fw-semibold small">
                    Soyad
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <i className="fas fa-user text-muted"></i>
                    </span>
                    <input
                      id="soyad"
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Soyadınız"
                      value={soyad}
                      onChange={(e) => {
                        setSoyad(e.target.value);
                        clearError();
                      }}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <label htmlFor="username" className="form-label fw-semibold small">
                  Kullanıcı Adı
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="fas fa-at text-muted"></i>
                  </span>
                  <input
                    id="username"
                    type="text"
                    className="form-control border-start-0"
                    placeholder="kullaniciadi"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      clearError();
                    }}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mt-3">
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
                      clearError();
                    }}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mt-3">
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
                    placeholder="Güçlü bir şifre oluşturun"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearError();
                    }}
                    required
                    minLength={6}
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
                <small className="text-muted">
                  Şifreniz en az 6 karakter olmalıdır
                </small>
              </div>

              <button 
                type="submit" 
                className="btn btn-teal w-100 mt-4"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Kayıt yapılıyor...
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus me-2"></i>
                    Kayıt Ol
                  </>
                )}
              </button>

              <div className="text-center mt-4">
                <span className="text-muted small">Zaten hesabınız var mı? </span>
                <Link to="/login" className="text-decoration-none fw-semibold text-primary">
                  Giriş yapın
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Illustration */}
        <div className="col-12 col-lg-5 login-hero d-none d-lg-flex align-items-center justify-content-center bg-primary">
          <div className="text-center px-4">
            <div className="hero-graphic mb-4">
              <i className="fas fa-user-plus fa-4x text-white"></i>
            </div>
            <h3 className="text-white mb-3 fw-semibold">Dakikalar içinde kayıt olun</h3>
            <p className="text-white-50">Öğrenmeye hemen başlayın ve kendinizi geliştirin</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;