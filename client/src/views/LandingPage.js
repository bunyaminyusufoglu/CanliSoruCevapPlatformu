import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <>
      {/* Hero Section */}
      <div className="hero-section">
        <Container>
          <div className="text-center fade-in">
            <h1 className="display-3 fw-bold mb-4">
              <i className="fas fa-graduation-cap me-3"></i>
              Canlı Soru‑Cevap Platformu
            </h1>
            <p className="lead mb-4">
              Eğitim içeriklerini keşfedin, canlı yayınlara katılın, sorularınızı sorun ve öğrenmeye devam edin!
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Button as={Link} to="/register" variant="light" size="lg" className="btn-custom">
                <i className="fas fa-user-plus me-2"></i>Hemen Başla
              </Button>
              <Button as={Link} to="/login" variant="outline-light" size="lg" className="btn-custom">
                <i className="fas fa-sign-in-alt me-2"></i>Giriş Yap
              </Button>
            </div>
          </div>
        </Container>
      </div>

      {/* Özellikler */}
      <Container className="py-5">
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold text-primary mb-3">
            <i className="fas fa-star me-2"></i>
            Platform Özellikleri
          </h2>
          <p className="lead text-muted">Öğrenme deneyiminizi geliştiren güçlü araçlar</p>
        </div>

        <Row className="g-4">
          <Col md={4}>
            <Card className="h-100 card-hover text-center">
              <Card.Body className="d-flex flex-column">
                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 mx-auto" style={{width: 80, height: 80}}>
                  <i className="fas fa-question-circle fa-2x"></i>
                </div>
                <h4 className="card-title">Soru & Cevap</h4>
                <p className="card-text flex-grow-1">
                  Teknik sorularınızı sorun, uzmanlardan cevaplar alın ve toplulukla bilgi paylaşın.
                </p>
                <div className="mt-auto">
                  <Button as={Link} to="/register" variant="outline-primary" className="btn-custom">
                    <i className="fas fa-arrow-right me-1"></i>Katıl
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 card-hover text-center">
              <Card.Body className="d-flex flex-column">
                <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 mx-auto" style={{width: 80, height: 80}}>
                  <i className="fas fa-book fa-2x"></i>
                </div>
                <h4 className="card-title">Eğitim İçerikleri</h4>
                <p className="card-text flex-grow-1">
                  Video dersler, PDF materyaller ve interaktif içeriklerle kendinizi geliştirin.
                </p>
                <div className="mt-auto">
                  <Button as={Link} to="/register" variant="outline-success" className="btn-custom">
                    <i className="fas fa-arrow-right me-1"></i>Keşfet
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 card-hover text-center">
              <Card.Body className="d-flex flex-column">
                <div className="bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 mx-auto" style={{width: 80, height: 80}}>
                  <i className="fas fa-video fa-2x"></i>
                </div>
                <h4 className="card-title">Canlı Yayınlar</h4>
                <p className="card-text flex-grow-1">
                  Uzmanlarla canlı etkileşim kurun, sorularınızı anında sorun ve öğrenin.
                </p>
                <div className="mt-auto">
                  <Button as={Link} to="/register" variant="outline-warning" className="btn-custom">
                    <i className="fas fa-arrow-right me-1"></i>Katıl
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* İstatistikler */}
      <div className="py-5" style={{background: 'linear-gradient(45deg, #667eea, #764ba2)', color: 'white'}}>
        <Container>
          <Row className="text-center">
            <Col md={3}>
              <div className="mb-3">
                <i className="fas fa-users fa-3x mb-3"></i>
                <h3 className="mb-1">1000+</h3>
                <p className="mb-0">Aktif Kullanıcı</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="mb-3">
                <i className="fas fa-book fa-3x mb-3"></i>
                <h3 className="mb-1">500+</h3>
                <p className="mb-0">Eğitim İçeriği</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="mb-3">
                <i className="fas fa-question-circle fa-3x mb-3"></i>
                <h3 className="mb-1">2000+</h3>
                <p className="mb-0">Çözülen Soru</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="mb-3">
                <i className="fas fa-video fa-3x mb-3"></i>
                <h3 className="mb-1">100+</h3>
                <p className="mb-0">Canlı Yayın</p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Nasıl Çalışır */}
      <Container className="py-5">
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold text-primary mb-3">
            <i className="fas fa-cogs me-2"></i>
            Nasıl Çalışır?
          </h2>
          <p className="lead text-muted">Sadece 3 adımda başlayın</p>
        </div>

        <Row className="g-4">
          <Col md={4}>
            <div className="text-center">
              <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: 60, height: 60, fontSize: 24, fontWeight: 'bold'}}>
                1
              </div>
              <h4>Kayıt Ol</h4>
              <p className="text-muted">
                Hızlı ve kolay kayıt işlemi ile hesabınızı oluşturun. 
                Admin olarak kayıt olmak için özel anahtar kullanabilirsiniz.
              </p>
            </div>
          </Col>

          <Col md={4}>
            <div className="text-center">
              <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: 60, height: 60, fontSize: 24, fontWeight: 'bold'}}>
                2
              </div>
              <h4>Keşfet</h4>
              <p className="text-muted">
                Eğitim içeriklerini inceleyin, sorularınızı sorun ve 
                canlı yayınlara katılarak öğrenmeye başlayın.
              </p>
            </div>
          </Col>

          <Col md={4}>
            <div className="text-center">
              <div className="bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: 60, height: 60, fontSize: 24, fontWeight: 'bold'}}>
                3
              </div>
              <h4>Öğren</h4>
              <p className="text-muted">
                Toplulukla etkileşim kurun, uzmanlardan öğrenin ve 
                kendi bilginizi paylaşarak gelişin.
              </p>
            </div>
          </Col>
        </Row>
      </Container>

      {/* CTA Section */}
      <div className="py-5 bg-light">
        <Container>
          <div className="text-center">
            <h2 className="display-5 fw-bold text-primary mb-3">
              <i className="fas fa-rocket me-2"></i>
              Hemen Başlayın!
            </h2>
            <p className="lead text-muted mb-4">
              Öğrenme yolculuğunuza bugün başlayın ve binlerce kullanıcıyla birlikte gelişin.
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Button as={Link} to="/register" variant="primary" size="lg" className="btn-custom">
                <i className="fas fa-user-plus me-2"></i>Ücretsiz Kayıt Ol
              </Button>
              <Button as={Link} to="/login" variant="outline-primary" size="lg" className="btn-custom">
                <i className="fas fa-sign-in-alt me-2"></i>Giriş Yap
              </Button>
            </div>
          </div>
        </Container>
      </div>

      {/* Footer */}
      <footer className="py-4 bg-dark text-white">
        <Container>
          <Row>
            <Col md={6}>
              <h5>
                <i className="fas fa-graduation-cap me-2"></i>
                Canlı Soru-Cevap Platformu
              </h5>
              <p className="text-muted">
                Eğitim ve öğrenme için tasarlanmış modern platform.
              </p>
            </Col>
            <Col md={6} className="text-md-end">
              <div className="d-flex gap-3 justify-content-md-end justify-content-center">
                <Button as={Link} to="/register" variant="outline-light" size="sm">
                  <i className="fas fa-user-plus me-1"></i>Kayıt Ol
                </Button>
                <Button as={Link} to="/login" variant="outline-light" size="sm">
                  <i className="fas fa-sign-in-alt me-1"></i>Giriş Yap
                </Button>
              </div>
            </Col>
          </Row>
          <hr className="my-3" />
          <div className="text-center text-muted">
            <small>&copy; 2024 Canlı Soru-Cevap Platformu. Tüm hakları saklıdır.</small>
          </div>
        </Container>
      </footer>
    </>
  );
};

export default LandingPage;
