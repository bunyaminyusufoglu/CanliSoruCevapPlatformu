import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API_ENDPOINTS from '../config/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, currentUser, isAuthenticated } = useAuth();

  // Eğer kullanıcı zaten giriş yapmışsa yönlendir
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate, location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Lütfen email ve şifrenizi girin');
      setLoading(false);
      return;
    }

    try {
      const result = await login(email, password);

      if (!result.success) {
        setError(result.error || 'Giriş başarısız oldu');
        setLoading(false);
        return;
      }
    } catch (err) {
      setError('Giriş yapılırken bir hata oluştu');
      setLoading(false);
    }
  };

  // Eğer kullanıcı zaten giriş yapmışsa, login sayfasını gösterme
  if (isAuthenticated && currentUser) {
    return null;
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" 
         style={{background: 'linear-gradient(135deg, #b993d6 0%, #8ca6db 100%)'}}>
      <div className="bg-white rounded-4 shadow p-4 p-md-5" 
           style={{minWidth: 450, maxWidth: 500, width: '90%'}}>
        <div className="d-flex flex-column align-items-center mb-4">
          <div className="bg-primary bg-gradient rounded-circle d-flex align-items-center justify-content-center mb-3" 
               style={{width: 70, height: 70}}>
            <i className="fas fa-user fa-2x text-white"></i>
          </div>
          <h4 className="fw-bold mb-1">Giriş Yap</h4>
          <p className="text-muted mb-0">Hesabınıza giriş yapın</p>
        </div>

        {error && (
          <Alert variant="danger" className="py-2 mb-3">
            {error}
          </Alert>
        )}

        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <div className="input-group">
              <span className="input-group-text bg-light">
                <i className="fas fa-envelope"></i>
              </span>
              <Form.Control
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-light border-0"
                style={{borderRadius: '0 0.5rem 0.5rem 0'}}
                disabled={loading}
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <div className="input-group">
              <span className="input-group-text bg-light">
                <i className="fas fa-lock"></i>
              </span>
              <Form.Control
                type="password"
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-light border-0"
                style={{borderRadius: '0 0.5rem 0.5rem 0'}}
                disabled={loading}
              />
            </div>
          </Form.Group>

          <div className="d-grid mb-2">
            <Button 
              type="submit" 
              variant="primary" 
              className="rounded-pill py-2" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Giriş Yapılıyor...
                </>
              ) : (
                'GİRİŞ YAP'
              )}
            </Button>
          </div>

          <div className="text-center">
            <p className="mb-0">
              Hesabınız yok mu?{' '}
              <Link to="/register" className="text-primary text-decoration-none">
                Kayıt Ol
              </Link>
            </p>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Login;
