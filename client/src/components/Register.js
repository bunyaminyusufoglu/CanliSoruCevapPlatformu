import React, { useState } from 'react';
import { register } from '../api';
import { Link } from 'react-router-dom';

const Register = () => {
  const [ad, setAd] = useState('');
  const [soyad, setSoyad] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await register({ ad, soyad, username, email, password });
      alert(response?.data?.message || 'Kayıt başarılı!');
      // İsteğe bağlı: kayıt sonrası login sayfasına yönlendirme
      window.location.href = '/login';
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Bilinmeyen hata';
      alert('Kayıt hatası: ' + msg);
    }
  };

  return (
    <div className="container-fluid login-page">
      <div className="row min-vh-100">
        {/* Left: Form */}
        <div className="col-12 col-lg-7 d-flex align-items-center justify-content-center p-4 p-lg-5">
          <div className="login-card w-100" style={{maxWidth: 520}}>
            {/* Tabs */}
            <div className="d-flex mb-4 align-items-center gap-4">
              <Link to="/login" className="form-tab">Login</Link>
              <span className="form-tab active">Sign up</span>
            </div>

            <form onSubmit={handleRegister}>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="input-with-icon">
                    <i className="fas fa-user"></i>
                    <input className="form-control" placeholder="Ad" value={ad} onChange={(e) => setAd(e.target.value)} required />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="input-with-icon">
                    <i className="fas fa-user"></i>
                    <input className="form-control" placeholder="Soyad" value={soyad} onChange={(e) => setSoyad(e.target.value)} required />
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <div className="input-with-icon">
                  <i className="fas fa-at"></i>
                  <input className="form-control" placeholder="Kullanıcı Adı" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
              </div>

              <div className="mt-3">
                <div className="input-with-icon">
                  <i className="fas fa-envelope"></i>
                  <input type="email" className="form-control" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>

              <div className="mt-3">
                <div className="input-with-icon">
                  <i className="fas fa-lock"></i>
                  <input type="password" className="form-control" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </div>

              

              <button type="submit" className="btn btn-teal w-100 mt-4">Kayıt Ol</button>
            </form>
          </div>
        </div>

        {/* Right: Illustration */}
        <div className="col-12 col-lg-5 login-hero d-none d-lg-flex align-items-center justify-content-center bg-primary">
          <div className="text-center px-4">
            <div className="hero-graphic mb-4">
              <i className="fas fa-user-plus fa-4x text-white"></i>
            </div>
            <h3 className="text-white-50 fw-normal">Dakikalar içinde kayıt olun, öğrenmeye başlayın</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;