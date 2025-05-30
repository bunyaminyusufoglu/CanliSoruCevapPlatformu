import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner, Container } from 'react-bootstrap';
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
    <div className="min-vh-100 position-relative overflow-hidden">
      {/* Arka plan gradient */}
      <div 
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          background: 'linear-gradient(135deg, #4a90e2 0%, #2c3e50 100%)',
          opacity: 0.9
        }}
      />

      {/* Dekoratif elementler */}
      <div 
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }}
      />

      <Container className="position-relative min-vh-100 d-flex align-items-center justify-content-center py-5">
        <div 
          className="bg-white rounded-4 shadow-lg p-4 p-md-5 animate__animated animate__fadeIn"
          style={{
            minWidth: 450,
            maxWidth: 500,
            width: '90%',
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)'
          }}
        >
          <div className="text-center mb-5">
            <div 
              className="bg-primary bg-gradient rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4 shadow-sm"
              style={{width: 80, height: 80}}
            >
              <i className="bi bi-person-fill fs-1 text-white"></i>
            </div>
            <h2 className="h3 fw-bold mb-2 text-primary">Hoş Geldiniz</h2>
            <p className="text-muted mb-0">Hesabınıza giriş yapın</p>
          </div>

          {error && (
            <Alert 
              variant="danger" 
              className="rounded-3 shadow-sm mb-4 animate__animated animate__fadeIn"
            >
              <i className="bi bi-exclamation-circle me-2"></i>
              {error}
            </Alert>
          )}

          <Form onSubmit={handleLogin} className="mb-4">
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold text-muted mb-2">
                <i className="bi bi-envelope me-2"></i>
                Email Adresi
              </Form.Label>
              <Form.Control
                type="email"
                placeholder="ornek@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-3 shadow-sm py-2 px-3"
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold text-muted mb-2">
                <i className="bi bi-lock me-2"></i>
                Şifre
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-3 shadow-sm py-2 px-3"
                disabled={loading}
              />
            </Form.Group>

            <div className="d-grid mb-4">
              <Button 
                type="submit" 
                variant="primary" 
                className="rounded-pill py-3 shadow-sm hover-lift"
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
                  <>
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Giriş Yap
                  </>
                )}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-muted mb-0">
                Hesabınız yok mu?{' '}
                <Link 
                  to="/register" 
                  className="text-primary text-decoration-none fw-bold hover-lift"
                >
                  Hemen Kayıt Ol
                </Link>
              </p>
            </div>
          </Form>
        </div>
      </Container>

      <style jsx>{`
        .hover-lift {
          transition: transform 0.2s ease-in-out;
        }
        .hover-lift:hover {
          transform: translateY(-2px);
        }
        .animate__animated {
          animation-duration: 0.6s;
        }
        .animate__fadeIn {
          animation-name: fadeIn;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
