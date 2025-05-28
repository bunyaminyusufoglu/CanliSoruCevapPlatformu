import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Home = () => {
  const features = [
    {
      icon: 'bi bi-book',
      title: 'Eğitim İçerikleri',
      description: 'Kapsamlı ders içerikleri ve kaynaklarla kendinizi geliştirin'
    },
    {
      icon: 'bi bi-chat-dots',
      title: 'Canlı Sohbet',
      description: 'Diğer öğrencilerle gerçek zamanlı iletişim kurun'
    },
    {
      icon: 'bi bi-camera-video',
      title: 'Canlı Yayınlar',
      description: 'Eğitmenlerle canlı derslere katılın ve sorularınızı sorun'
    },
    {
      icon: 'bi bi-people',
      title: 'Topluluk Desteği',
      description: 'Öğrenme yolculuğunuzda size destek olacak bir topluluk'
    }
  ];

  return (
    <div className="bg-light min-vh-100">
      {/* Hero Section */}
      <div 
        className="py-5 text-center text-white position-relative bg-primary bg-gradient"
        style={{
          marginBottom: '4rem'
        }}
      >
        <Container className="py-5">
          <div className="display-4 fw-bold mb-3">
            Canlı Soru-Cevap ve Eğitim Platformu
          </div>
          <p className="lead mb-4 opacity-90">
            Gerçek zamanlı sohbet, eğitim içerikleri ve topluluk desteğiyle öğrenmeyi daha keyifli hale getir!
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/login" className="btn btn-light btn-lg px-4 rounded-pill">
              Giriş Yap
            </Link>
          </div>
        </Container>
        <div 
          className="position-absolute bottom-0 start-0 w-100 bg-light"
          style={{
            height: '100px',
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 0)'
          }}
        />
      </div>

      {/* Features Section */}
      <Container className="mb-5">
        <Row className="g-4">
          {features.map((feature, index) => (
            <Col key={index} md={6} lg={3}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="display-4 text-primary mb-3">
                    <i className={feature.icon}></i>
                  </div>
                  <h3 className="h5 fw-bold mb-3">{feature.title}</h3>
                  <p className="text-muted mb-0">{feature.description}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Stats Section */}
      <div className="bg-white py-5">
        <Container>
          <Row className="text-center g-4">
            <Col md={4}>
              <div className="display-4 fw-bold text-primary mb-2">100+</div>
              <p className="text-muted mb-0">Aktif Öğrenci</p>
            </Col>
            <Col md={4}>
              <div className="display-4 fw-bold text-primary mb-2">50+</div>
              <p className="text-muted mb-0">Eğitim İçeriği</p>
            </Col>
            <Col md={4}>
              <div className="display-4 fw-bold text-primary mb-2">24/7</div>
              <p className="text-muted mb-0">Canlı Destek</p>
            </Col>
          </Row>
        </Container>
      </div>

      {/* CTA Section */}
      <Container className="py-5 text-center">
        <h2 className="display-6 fw-bold mb-4">Hemen Başlayın</h2>
        <p className="lead text-muted mb-4">
          Öğrenme yolculuğunuza bugün başlayın ve topluluğumuza katılın!
        </p>
        <Link to="/register" className="btn btn-primary btn-lg px-5 rounded-pill">
          Ücretsiz Kayıt Ol
        </Link>
      </Container>
    </div>
  );
};

export default Home;