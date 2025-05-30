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
        className="py-5 text-center text-white position-relative"
        style={{
          background: 'linear-gradient(135deg, #4a90e2 0%, #2c3e50 100%)',
          marginBottom: '6rem'
        }}
      >
        <Container className="py-5">
          <div className="display-3 fw-bold mb-4 animate__animated animate__fadeIn">
            Canlı Soru-Cevap ve Eğitim Platformu
          </div>
          <p className="lead mb-5 opacity-90 fs-4 animate__animated animate__fadeIn animate__delay-1s">
            Gerçek zamanlı sohbet, eğitim içerikleri ve topluluk desteğiyle öğrenmeyi daha keyifli hale getir!
          </p>
          <div className="d-flex justify-content-center gap-4 animate__animated animate__fadeIn animate__delay-2s">
            <Link to="/login" className="btn btn-light btn-lg px-5 py-3 rounded-pill shadow-lg hover-lift">
              Giriş Yap
            </Link>
            <Link to="/register" className="btn btn-outline-light btn-lg px-5 py-3 rounded-pill hover-lift">
              Ücretsiz Kayıt Ol
            </Link>
          </div>
        </Container>
        <div 
          className="position-absolute bottom-0 start-0 w-100 bg-light"
          style={{
            height: '120px',
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 0)'
          }}
        />
      </div>

      {/* Features Section */}
      <Container className="mb-5">
        <Row className="g-4">
          {features.map((feature, index) => (
            <Col key={index} md={6} lg={3}>
              <Card className="h-100 border-0 shadow-lg hover-lift transition-all">
                <Card.Body className="text-center p-5">
                  <div className={`display-4 text-${feature.color} mb-4`}>
                    <i className={feature.icon}></i>
                  </div>
                  <h3 className="h4 fw-bold mb-3">{feature.title}</h3>
                  <p className="text-muted mb-0 fs-5">{feature.description}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Stats Section */}
      <div className="bg-white py-5 position-relative overflow-hidden">
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-light opacity-10" 
             style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 85%)' }}></div>
        <Container className="position-relative">
          <Row className="text-center g-4">
            <Col md={4}>
              <div className="display-3 fw-bold text-primary mb-3">100+</div>
              <p className="text-muted fs-5 mb-0">Aktif Öğrenci</p>
            </Col>
            <Col md={4}>
              <div className="display-3 fw-bold text-success mb-3">50+</div>
              <p className="text-muted fs-5 mb-0">Eğitim İçeriği</p>
            </Col>
            <Col md={4}>
              <div className="display-3 fw-bold text-danger mb-3">24/7</div>
              <p className="text-muted fs-5 mb-0">Canlı Destek</p>
            </Col>
          </Row>
        </Container>
      </div>

      {/* CTA Section */}
      <Container className="py-5 text-center position-relative">
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-primary opacity-5" 
             style={{ clipPath: 'polygon(0 15%, 100% 0, 100% 100%, 0 100%)' }}></div>
        <div className="position-relative">
          <h2 className="display-4 fw-bold mb-4">Hemen Başlayın</h2>
          <p className="lead text-muted mb-5 fs-4">
            Öğrenme yolculuğunuza bugün başlayın ve topluluğumuza katılın!
          </p>
          <Link to="/register" className="btn btn-primary btn-lg px-5 py-3 rounded-pill shadow-lg hover-lift">
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
      `}</style>
    </div>
  );
};

export default Home;