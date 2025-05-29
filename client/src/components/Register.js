import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
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
    <div className="min-vh-100 d-flex align-items-center justify-content-center" 
         style={{background: 'linear-gradient(135deg, #b993d6 0%, #8ca6db 100%)'}}>
      <div className="bg-white rounded-4 shadow p-4 p-md-5" 
           style={{minWidth: 450, maxWidth: 500, width: '90%'}}>
        <div className="d-flex flex-column align-items-center mb-4">
          <div className="bg-primary bg-gradient rounded-circle d-flex align-items-center justify-content-center mb-3" 
               style={{width: 70, height: 70}}>
            <i className="fas fa-user-plus fa-2x text-white"></i>
          </div>
          <h4 className="fw-bold mb-1">Kayıt Ol</h4>
          <p className="text-muted mb-0">Yeni bir hesap oluşturun</p>
        </div>

        {errors.submit && (
          <Alert variant="danger" className="py-2 mb-3">
            {errors.submit}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <div className="input-group">
              <span className="input-group-text bg-light">
                <i className="fas fa-user"></i>
              </span>
              <Form.Control
                type="text"
                name="ad"
                placeholder="Ad"
                value={formData.ad}
                onChange={handleChange}
                isInvalid={!!errors.ad}
                className="bg-light border-0"
                style={{borderRadius: '0 0.5rem 0.5rem 0'}}
                disabled={loading}
              />
              <Form.Control.Feedback type="invalid">
                {errors.ad}
              </Form.Control.Feedback>
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <div className="input-group">
              <span className="input-group-text bg-light">
                <i className="fas fa-user"></i>
              </span>
              <Form.Control
                type="text"
                name="soyad"
                placeholder="Soyad"
                value={formData.soyad}
                onChange={handleChange}
                isInvalid={!!errors.soyad}
                className="bg-light border-0"
                style={{borderRadius: '0 0.5rem 0.5rem 0'}}
                disabled={loading}
              />
              <Form.Control.Feedback type="invalid">
                {errors.soyad}
              </Form.Control.Feedback>
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <div className="input-group">
              <span className="input-group-text bg-light">
                <i className="fas fa-user-tag"></i>
              </span>
              <Form.Control
                type="text"
                name="username"
                placeholder="Kullanıcı Adı"
                value={formData.username}
                onChange={handleChange}
                isInvalid={!!errors.username}
                className="bg-light border-0"
                style={{borderRadius: '0 0.5rem 0.5rem 0'}}
                disabled={loading}
              />
              <Form.Control.Feedback type="invalid">
                {errors.username}
              </Form.Control.Feedback>
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <div className="input-group">
              <span className="input-group-text bg-light">
                <i className="fas fa-envelope"></i>
              </span>
              <Form.Control
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                isInvalid={!!errors.email}
                className="bg-light border-0"
                style={{borderRadius: '0 0.5rem 0.5rem 0'}}
                disabled={loading}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <div className="input-group">
              <span className="input-group-text bg-light">
                <i className="fas fa-lock"></i>
              </span>
              <Form.Control
                type="password"
                name="password"
                placeholder="Şifre"
                value={formData.password}
                onChange={handleChange}
                isInvalid={!!errors.password}
                className="bg-light border-0"
                style={{borderRadius: '0 0.5rem 0.5rem 0'}}
                disabled={loading}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <div className="input-group">
              <span className="input-group-text bg-light">
                <i className="fas fa-lock"></i>
              </span>
              <Form.Control
                type="password"
                name="confirmPassword"
                placeholder="Şifre Tekrar"
                value={formData.confirmPassword}
                onChange={handleChange}
                isInvalid={!!errors.confirmPassword}
                className="bg-light border-0"
                style={{borderRadius: '0 0.5rem 0.5rem 0'}}
                disabled={loading}
              />
              <Form.Control.Feedback type="invalid">
                {errors.confirmPassword}
              </Form.Control.Feedback>
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="student">Öğrenci</option>
              <option value="teacher">Öğretmen</option>
            </Form.Select>
          </Form.Group>

          <div className="d-grid mb-3">
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
                  Kayıt Yapılıyor...
                </>
              ) : (
                'KAYIT OL'
              )}
            </Button>
          </div>

          <div className="text-center">
            <p className="mb-0">
              Zaten hesabınız var mı?{' '}
              <Link to="/login" className="text-primary text-decoration-none">
                Giriş Yap
              </Link>
            </p>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Register;