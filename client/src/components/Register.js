import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API_ENDPOINTS from '../config/api';

const Register = () => {
  const [formData, setFormData] = useState({
    ad: '',
    soyad: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'student'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, isAuthenticated, currentUser } = useAuth();

  // Eğer kullanıcı zaten giriş yapmışsa ana sayfaya yönlendir
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      navigate('/');
    }
  }, [isAuthenticated, currentUser, navigate]);

  const validateForm = () => {
    const newErrors = {};
    
    // Ad kontrolü
    if (!formData.ad.trim()) {
      newErrors.ad = 'Ad alanı zorunludur';
    } else if (formData.ad.length < 2) {
      newErrors.ad = 'Ad en az 2 karakter olmalıdır';
    }

    // Soyad kontrolü
    if (!formData.soyad.trim()) {
      newErrors.soyad = 'Soyad alanı zorunludur';
    } else if (formData.soyad.length < 2) {
      newErrors.soyad = 'Soyad en az 2 karakter olmalıdır';
    }

    // Kullanıcı adı kontrolü
    if (!formData.username.trim()) {
      newErrors.username = 'Kullanıcı adı zorunludur';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Kullanıcı adı en az 3 karakter olmalıdır';
    }

    // Email kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email alanı zorunludur';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Geçerli bir email adresi giriniz';
    }

    // Şifre kontrolü
    if (!formData.password) {
      newErrors.password = 'Şifre alanı zorunludur';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    }

    // Şifre tekrar kontrolü
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Hata mesajını temizle
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      const result = await register(registerData);
      
      if (result.success) {
        navigate('/');
      } else {
        setErrors(prev => ({
          ...prev,
          submit: result.error || 'Kayıt işlemi başarısız oldu'
        }));
      }
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        submit: 'Kayıt işlemi sırasında bir hata oluştu'
      }));
    } finally {
      setLoading(false);
    }
  };

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
              <i className="bi bi-person-plus-fill fs-1 text-white"></i>
            </div>
            <h2 className="h3 fw-bold mb-2 text-primary">Kayıt Ol</h2>
            <p className="text-muted mb-0">Yeni bir hesap oluşturun</p>
          </div>

          {errors.submit && (
            <Alert 
              variant="danger" 
              className="rounded-3 shadow-sm mb-4 animate__animated animate__fadeIn"
            >
              <i className="bi bi-exclamation-circle me-2"></i>
              {errors.submit}
            </Alert>
          )}

          <Form onSubmit={handleSubmit} className="mb-4">
            <div className="row g-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="fw-bold text-muted mb-2">
                    <i className="bi bi-person me-2"></i>
                    Ad
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="ad"
                    placeholder="Adınız"
                    value={formData.ad}
                    onChange={handleChange}
                    isInvalid={!!errors.ad}
                    className="rounded-3 shadow-sm py-2 px-3"
                    disabled={loading}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.ad}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="fw-bold text-muted mb-2">
                    <i className="bi bi-person me-2"></i>
                    Soyad
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="soyad"
                    placeholder="Soyadınız"
                    value={formData.soyad}
                    onChange={handleChange}
                    isInvalid={!!errors.soyad}
                    className="rounded-3 shadow-sm py-2 px-3"
                    disabled={loading}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.soyad}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mt-3">
              <Form.Label className="fw-bold text-muted mb-2">
                <i className="bi bi-person-badge me-2"></i>
                Kullanıcı Adı
              </Form.Label>
              <Form.Control
                type="text"
                name="username"
                placeholder="Kullanıcı adınız"
                value={formData.username}
                onChange={handleChange}
                isInvalid={!!errors.username}
                className="rounded-3 shadow-sm py-2 px-3"
                disabled={loading}
              />
              <Form.Control.Feedback type="invalid">
                {errors.username}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label className="fw-bold text-muted mb-2">
                <i className="bi bi-envelope me-2"></i>
                Email Adresi
              </Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="ornek@email.com"
                value={formData.email}
                onChange={handleChange}
                isInvalid={!!errors.email}
                className="rounded-3 shadow-sm py-2 px-3"
                disabled={loading}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label className="fw-bold text-muted mb-2">
                <i className="bi bi-lock me-2"></i>
                Şifre
              </Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                isInvalid={!!errors.password}
                className="rounded-3 shadow-sm py-2 px-3"
                disabled={loading}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label className="fw-bold text-muted mb-2">
                <i className="bi bi-lock-fill me-2"></i>
                Şifre Tekrar
              </Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                isInvalid={!!errors.confirmPassword}
                className="rounded-3 shadow-sm py-2 px-3"
                disabled={loading}
              />
              <Form.Control.Feedback type="invalid">
                {errors.confirmPassword}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label className="fw-bold text-muted mb-2">
                <i className="bi bi-person-workspace me-2"></i>
                Hesap Türü
              </Form.Label>
              <div className="d-flex gap-3">
                <Form.Check
                  type="radio"
                  id="student"
                  name="userType"
                  value="student"
                  label="Öğrenci"
                  checked={formData.userType === 'student'}
                  onChange={handleChange}
                  className="flex-grow-1"
                />
                <Form.Check
                  type="radio"
                  id="teacher"
                  name="userType"
                  value="teacher"
                  label="Eğitmen"
                  checked={formData.userType === 'teacher'}
                  onChange={handleChange}
                  className="flex-grow-1"
                />
              </div>
            </Form.Group>

            <div className="d-grid mt-4">
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
                    Kayıt Yapılıyor...
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-plus me-2"></i>
                    Kayıt Ol
                  </>
                )}
              </Button>
            </div>

            <div className="text-center mt-4">
              <p className="text-muted mb-0">
                Zaten hesabınız var mı?{' '}
                <Link 
                  to="/login" 
                  className="text-primary text-decoration-none fw-bold hover-lift"
                >
                  Giriş Yap
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

export default Register;