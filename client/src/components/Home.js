import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Home = () => {
  const features = [
    {
      icon: 'bi bi-book',
      title: 'Eğitim İçerikleri',
      description: 'Kapsamlı ders içerikleri ve kaynaklarla kendinizi geliştirin',
      color: 'primary'
    },
    {
      icon: 'bi bi-chat-dots',
      title: 'Canlı Sohbet',
      description: 'Diğer öğrencilerle gerçek zamanlı iletişim kurun',
      color: 'success'
    },
    {
      icon: 'bi bi-camera-video',
      title: 'Canlı Yayınlar',
      description: 'Eğitmenlerle canlı derslere katılın ve sorularınızı sorun',
      color: 'danger'
    },
    {
      icon: 'bi bi-people',
      title: 'Topluluk Desteği',
      description: 'Öğrenme yolculuğunuzda size destek olacak bir topluluk',
      color: 'warning'
    }
  ];

  return (
    <div className="bg-light min-vh-100">
      {/* Hero Section */}
      <div 
        className="py-4 py-md-5 text-center text-white position-relative"
        style={{
          background: 'linear-gradient(135deg, #4a90e2 0%, #2c3e50 100%)',
          marginBottom: '4rem'
        }}
      >
        <Container className="py-4 py-md-5">
          <div className="display-4 display-md-3 fw-bold mb-3 mb-md-4 animate__animated animate__fadeIn">
            Canlı Soru-Cevap ve Eğitim Platformu
          </div>
          <p className="lead mb-4 mb-md-5 fs-5 fs-md-4 opacity-90 animate__animated animate__fadeIn animate__delay-1s">
            Gerçek zamanlı sohbet, eğitim içerikleri ve topluluk desteğiyle öğrenmeyi daha keyifli hale getir!
          </p>
          <div className="d-flex flex-column flex-md-row justify-content-center gap-3 gap-md-4 animate__animated animate__fadeIn animate__delay-2s">
            <Link 
              to="/login" 
              className="btn btn-light btn-lg px-4 px-md-5 py-2 py-md-3 rounded-pill shadow-lg hover-lift w-100 w-md-auto"
            >
              <i className="bi bi-box-arrow-in-right me-2"></i>
              Giriş Yap
            </Link>
            <Link 
              to="/register" 
              className="btn btn-outline-light btn-lg px-4 px-md-5 py-2 py-md-3 rounded-pill hover-lift w-100 w-md-auto"
            >
              <i className="bi bi-person-plus me-2"></i>
              Ücretsiz Kayıt Ol
            </Link>
          </div>
        </Container>
        <div 
          className="position-absolute bottom-0 start-0 w-100 bg-light"
          style={{
            height: '80px',
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 0)'
          }}
        />
      </div>

      {/* Features Section */}
      <Container className="position-relative" style={{ marginTop: '-2rem', marginBottom: '4rem' }}>
        <Row className="g-3 g-md-4">
          {features.map((feature, index) => (
            <Col key={index} xs={12} sm={6} lg={3}>
              <Card className="h-100 border-0 shadow-lg hover-lift transition-all">
                <Card.Body className="text-center p-4 p-md-5">
                  <div className={`display-5 display-md-4 text-${feature.color} mb-3 mb-md-4`}>
                    <i className={feature.icon}></i>
                  </div>
                  <h3 className="h5 h4-md fw-bold mb-2 mb-md-3">{feature.title}</h3>
                  <p className="text-muted mb-0 fs-6 fs-md-5">{feature.description}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Stats Section */}
      <div className="bg-white py-4 py-md-5 position-relative overflow-hidden">
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-light opacity-10" 
             style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 85%)' }}></div>
        <Container className="position-relative">
          <Row className="text-center g-4">
            <Col xs={12} md={4}>
              <div className="display-4 display-md-3 fw-bold text-primary mb-2 mb-md-3">100+</div>
              <p className="text-muted fs-6 fs-md-5 mb-0">Aktif Öğrenci</p>
            </Col>
            <Col xs={12} md={4}>
              <div className="display-4 display-md-3 fw-bold text-success mb-2 mb-md-3">50+</div>
              <p className="text-muted fs-6 fs-md-5 mb-0">Eğitim İçeriği</p>
            </Col>
            <Col xs={12} md={4}>
              <div className="display-4 display-md-3 fw-bold text-danger mb-2 mb-md-3">24/7</div>
              <p className="text-muted fs-6 fs-md-5 mb-0">Canlı Destek</p>
            </Col>
          </Row>
        </Container>
      </div>

      {/* CTA Section */}
      <Container className="py-4 py-md-5 position-relative">
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-primary opacity-5" 
             style={{ clipPath: 'polygon(0 15%, 100% 0, 100% 100%, 0 100%)' }}></div>
        <div className="position-relative text-center">
          <h2 className="display-5 display-md-4 fw-bold mb-3 mb-md-4">Hemen Başlayın</h2>
          <p className="lead text-muted mb-4 mb-md-5 fs-5 fs-md-4">
            Öğrenme yolculuğunuza bugün başlayın ve topluluğumuza katılın!
          </p>
          <Link 
            to="/register" 
            className="btn btn-primary btn-lg px-4 px-md-5 py-2 py-md-3 rounded-pill shadow-lg hover-lift d-inline-flex align-items-center"
          >
            <i className="bi bi-person-plus me-2"></i>
            Ücretsiz Kayıt Ol
          </Link>
        </div>
      </Container>

      <style jsx>{`
        .hover-lift {
          transition: transform 0.2s ease-in-out;
        }
        .hover-lift:hover {
          transform: translateY(-5px);
        }
        .transition-all {
          transition: all 0.3s ease-in-out;
        }
        @media (max-width: 768px) {
          .display-4 {
            font-size: 2.5rem;
          }
          .display-5 {
            font-size: 2rem;
          }
          .fs-5 {
            font-size: 1.1rem !important;
          }
          .fs-6 {
            font-size: 1rem !important;
          }
        }
        @media (max-width: 576px) {
          .display-4 {
            font-size: 2rem;
          }
          .display-5 {
            font-size: 1.75rem;
          }
          .fs-5 {
            font-size: 1rem !important;
          }
          .fs-6 {
            font-size: 0.9rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;