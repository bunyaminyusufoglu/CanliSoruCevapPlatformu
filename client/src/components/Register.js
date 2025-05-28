import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [ad, setAd] = useState('');
  const [soyad, setSoyad] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await register({ ad, soyad, username, email, password });
    setLoading(false);
    if (result.success) {
      navigate('/'); // Kayıt sonrası ana sayfaya yönlendir
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{background: 'linear-gradient(135deg, #b993d6 0%, #8ca6db 100%)'}}>
      <div className="bg-white rounded-4 shadow p-4 p-md-5" style={{minWidth: 450, maxWidth: 500}}>
        <div className="d-flex flex-column align-items-center mb-4">
          <div className="bg-primary bg-gradient rounded-circle d-flex align-items-center justify-content-center mb-3" style={{width: 70, height: 70}}>
            <i className="fas fa-user-plus fa-2x text-white"></i>
          </div>
          <h4 className="fw-bold mb-1">Kayıt Ol</h4>
          <p className="text-muted mb-0">Yeni bir hesap oluşturun</p>
        </div>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <Form onSubmit={handleRegister}>
          <Form.Group className="mb-3">
            <div className="input-group">
              <span className="input-group-text bg-light"><i className="fas fa-user"></i></span>
              <Form.Control
                type="text"
                placeholder="Ad"
                value={ad}
                onChange={(e) => setAd(e.target.value)}
                required
                className="bg-light border-0"
                style={{borderRadius: '0 0.5rem 0.5rem 0'}} />
            </div>
          </Form.Group>
          <Form.Group className="mb-3">
            <div className="input-group">
              <span className="input-group-text bg-light"><i className="fas fa-user"></i></span>
              <Form.Control
                type="text"
                placeholder="Soyad"
                value={soyad}
                onChange={(e) => setSoyad(e.target.value)}
                required
                className="bg-light border-0"
                style={{borderRadius: '0 0.5rem 0.5rem 0'}} />
            </div>
          </Form.Group>
          <Form.Group className="mb-3">
            <div className="input-group">
              <span className="input-group-text bg-light"><i className="fas fa-user-tag"></i></span>
              <Form.Control
                type="text"
                placeholder="Kullanıcı Adı"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-light border-0"
                style={{borderRadius: '0 0.5rem 0.5rem 0'}} />
            </div>
          </Form.Group>
          <Form.Group className="mb-3">
            <div className="input-group">
              <span className="input-group-text bg-light"><i className="fas fa-envelope"></i></span>
              <Form.Control
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-light border-0"
                style={{borderRadius: '0 0.5rem 0.5rem 0'}} />
            </div>
          </Form.Group>
          <Form.Group className="mb-4">
            <div className="input-group">
              <span className="input-group-text bg-light"><i className="fas fa-lock"></i></span>
              <Form.Control
                type="password"
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-light border-0"
                style={{borderRadius: '0 0.5rem 0.5rem 0'}} />
            </div>
          </Form.Group>
          <div className="d-grid mb-2">
            <Button type="submit" variant="primary" className="rounded-pill py-2" disabled={loading}>
              {loading ? 'Kayıt Olunuyor...' : 'KAYIT OL'}
            </Button>
          </div>
        </Form>
        <div className="text-center mt-3">
          <span className="small text-muted">Zaten hesabınız var mı? </span>
          <Link to="/login" className="small text-primary text-decoration-none">Giriş Yap</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;