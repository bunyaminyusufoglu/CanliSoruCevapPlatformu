import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import io from 'socket.io-client';

// Socket bağlantısını component dışında kurarsan sayfa yenilense bile aynı bağlantı kullanılır
const socket = io('http://localhost:5000');

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      socket.emit('register', email); // veya username, eğer login fonksiyonu user objesi döndürüyorsa onu kullanabilirsin
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{background: 'linear-gradient(135deg, #b993d6 0%, #8ca6db 100%)'}}>
      <div className="bg-white rounded-4 shadow p-4 p-md-5" style={{minWidth: 450, maxWidth: 500}}>
        <div className="d-flex flex-column align-items-center mb-4">
          <div className="bg-primary bg-gradient rounded-circle d-flex align-items-center justify-content-center mb-3" style={{width: 70, height: 70}}>
            <i className="fas fa-user fa-2x text-white"></i>
          </div>
          <h4 className="fw-bold mb-1">Giriş Yap</h4>
          <p className="text-muted mb-0">Hesabınıza giriş yapın</p>
        </div>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <div className="input-group">
              <span className="input-group-text bg-light"><i className="fas fa-user"></i></span>
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
          <Form.Group className="mb-3">
            <div className="input-group">
              <span className="input-group-text bg-light"><i className="fas fa-lock"></i></span>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-light border-0"
                style={{borderRadius: '0 0.5rem 0.5rem 0'}} />
            </div>
          </Form.Group>
          <div className="d-grid mb-2">
            <Button type="submit" variant="primary" className="rounded-pill py-2" disabled={loading}>
              {loading ? 'Giriş Yapılıyor...' : 'LOGIN'}
            </Button>
          </div>
        </Form>
        <div className="text-center mt-3">
          <span className="small text-muted">Hesabınız yok mu? </span>
          <Link to="/register" className="small text-primary text-decoration-none">Kayıt Ol</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
