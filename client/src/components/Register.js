import React, { useState } from 'react';
import { register } from '../api';
import { Link } from 'react-router-dom';

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

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const response = await register({ ad, soyad, username, email, password });
      setSuccess(response?.data?.message || 'Kayıt başarılı! Yönlendiriliyorsunuz...');
      setTimeout(() => {
        window.location.href = '/login';
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
    <div className="min-vh-100 d-flex align-items-center pt-5 pb-4" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow-lg border-0">
              <div className="card-body p-3 p-md-4">
                {/* Header */}
                <div className="text-center mb-2">
                  <div className="mb-1">
                    <div className="bg-success bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center" style={{width: '48px', height: '48px'}}>
                      <i className="fas fa-user-plus text-white" style={{fontSize: '0.9rem'}}></i>
                    </div>
                  </div>
                  <h4 className="fw-bold text-dark mb-1">Hesap Oluşturun</h4>
                  <p className="text-muted small mb-0">Hemen kayıt olun</p>
                </div>

                {/* Navigation Tabs */}
                <div className="d-flex gap-3 mb-2 pb-2 border-bottom">
                  <Link to="/login" className="text-decoration-none text-muted fw-semibold small">Giriş Yap</Link>
                  <span className="fw-semibold text-success border-bottom border-success border-2 pb-2 small" style={{paddingBottom: '4px'}}>Kayıt Ol</span>
                </div>

                {/* Success Message */}
                {success && (
                  <div className="alert alert-success d-flex align-items-center py-2 mb-2" role="alert" style={{fontSize: '0.8rem'}}>
                    <i className="fas fa-check-circle me-2"></i>
                    <span>{success}</span>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="alert alert-danger d-flex align-items-center py-2 mb-2" role="alert" style={{fontSize: '0.8rem'}}>
                    <i className="fas fa-exclamation-circle me-2"></i>
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleRegister}>
                  {/* Name Fields */}
                  <div className="row g-2 mb-2">
                    <div className="col-md-6">
                      <label htmlFor="ad" className="form-label fw-semibold text-dark small mb-1">
                        Ad
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0" style={{padding: '0.375rem 0.75rem'}}>
                          <i className="fas fa-user text-primary"></i>
                        </span>
                        <input
                          id="ad"
                          type="text"
                          className="form-control border-start-0 ps-0"
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
                      <label htmlFor="soyad" className="form-label fw-semibold text-dark small mb-1">
                        Soyad
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0" style={{padding: '0.375rem 0.75rem'}}>
                          <i className="fas fa-user text-primary"></i>
                        </span>
                        <input
                          id="soyad"
                          type="text"
                          className="form-control border-start-0 ps-0"
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

                  {/* Username */}
                  <div className="mb-2">
                    <label htmlFor="username" className="form-label fw-semibold text-dark small mb-1">
                      Kullanıcı Adı
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0" style={{padding: '0.375rem 0.75rem'}}>
                        <i className="fas fa-at text-primary"></i>
                      </span>
                      <input
                        id="username"
                        type="text"
                        className="form-control border-start-0 ps-0"
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

                  {/* Email */}
                  <div className="mb-2">
                    <label htmlFor="email" className="form-label fw-semibold text-dark small mb-1">
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
                          clearError();
                        }}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="mb-2">
                    <label htmlFor="password" className="form-label fw-semibold text-dark small mb-1">
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
                        style={{padding: '0.375rem 0.75rem'}}
                      >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    <small className="text-muted" style={{fontSize: '0.7rem'}}>
                      En az 6 karakter
                    </small>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    className="btn btn-success w-100 mb-2 fw-semibold"
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

                  {/* Login Link */}
                  <div className="text-center" style={{fontSize: '0.875rem'}}>
                    <span className="text-muted">Zaten hesabınız var mı? </span>
                    <Link to="/login" className="text-decoration-none fw-semibold text-primary">
                      Giriş yapın
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

export default Register;
