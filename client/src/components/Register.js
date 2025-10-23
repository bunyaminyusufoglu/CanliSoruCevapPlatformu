import React, { useState } from 'react';
import { register } from '../api';

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
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="form-container">
            <div className="text-center mb-4">
              <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: 80, height: 80}}>
                <i className="fas fa-user-plus fa-2x"></i>
              </div>
              <h2 className="fw-bold text-success">Kayıt Ol</h2>
              <p className="text-muted">Yeni hesap oluşturun</p>
            </div>
            
            <form onSubmit={handleRegister}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="ad" className="form-label">
                    <i className="fas fa-user me-2"></i>Ad
                  </label>
                  <input 
                    className="form-control form-control-lg" 
                    id="ad"
                    placeholder="Adınızı girin" 
                    value={ad} 
                    onChange={(e) => setAd(e.target.value)} 
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="soyad" className="form-label">
                    <i className="fas fa-user me-2"></i>Soyad
                  </label>
                  <input 
                    className="form-control form-control-lg" 
                    id="soyad"
                    placeholder="Soyadınızı girin" 
                    value={soyad} 
                    onChange={(e) => setSoyad(e.target.value)} 
                    required
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="username" className="form-label">
                  <i className="fas fa-at me-2"></i>Kullanıcı Adı
                </label>
                <input 
                  className="form-control form-control-lg" 
                  id="username"
                  placeholder="Kullanıcı adınızı girin" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  <i className="fas fa-envelope me-2"></i>Email
                </label>
                <input 
                  className="form-control form-control-lg" 
                  id="email"
                  type="email"
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
                  className="form-control form-control-lg" 
                  id="password"
                  type="password" 
                  placeholder="Şifrenizi girin" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required
                />
              </div>
              
              <button type="submit" className="btn btn-success btn-lg w-100 btn-custom">
                <i className="fas fa-user-plus me-2"></i>Kayıt Ol
              </button>
            </form>
            
            <div className="text-center mt-4">
              <p className="text-muted">
                Zaten hesabınız var mı? 
                <a href="/login" className="text-success text-decoration-none ms-1">
                  <i className="fas fa-sign-in-alt me-1"></i>Giriş Yap
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;