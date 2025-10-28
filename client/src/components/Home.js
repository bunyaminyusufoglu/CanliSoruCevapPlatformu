import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [streams, setStreams] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [streamRes, courseRes] = await Promise.all([
          axios.get('/api/streams'),
          axios.get('/api/courses'),
        ]);
        setStreams((streamRes.data?.streams || []).slice(0, 3));
        setCourses((courseRes.data?.courses || []).slice(0, 3));
      } catch {}
    };
    fetchAll();
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={7} className="text-center text-lg-start">
              <h1 className="mb-3" style={{ animation: 'fadeInUp 0.6s ease' }}>
                Kurumsal Eğitim ve Canlı Etkileşim Platformu
              </h1>
              <p className="mb-4" style={{ animation: 'fadeInUp 0.8s ease' }}>
                Canlı yayınlar, Soru & Cevap ve seçkin eğitim içerikleri ile kurumunuza değer katın.
              </p>
              <div className="d-flex gap-2 justify-content-center justify-content-lg-start flex-wrap" style={{ animation: 'fadeInUp 1s ease' }}>
                <Button as={Link} to="/qa" variant="primary" className="btn-custom">
                  <i className="fas fa-question-circle me-2"></i>Soru & Cevap
                </Button>
                <Button as={Link} to="/canli-yayin" variant="outline-primary" className="btn-custom">
                  <i className="fas fa-video me-2"></i>Canlı Yayınlar
                </Button>
                <Button as={Link} to="/courses" variant="outline-secondary" className="btn-custom">
                  <i className="fas fa-book me-2"></i>Eğitimler
                </Button>
              </div>
            </Col>
            <Col lg={5} className="text-center mt-4 mt-lg-0" style={{ animation: 'fadeInUp 1.2s ease' }}>
              <img src="/logo192.png" alt="Kurumsal" style={{ maxWidth: '260px', filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.15))' }} />
            </Col>
          </Row>
        </Container>
      </section>

      {/* FEATURES */}
      <Container className="py-5">
        <Row className="g-4">
          <Col md={4}>
            <Card className="h-100 card-hover">
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: 48, height: 48}}>
                    <i className="fas fa-bolt"></i>
                  </div>
                  <h5 className="mb-0">Canlı Etkileşim</h5>
                </div>
                <p className="text-muted mb-0">Odaklı canlı yayınlar, anlık yorum ve bildirim sistemi ile etkileşimi artırın.</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 card-hover">
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: 48, height: 48}}>
                    <i className="fas fa-graduation-cap"></i>
                  </div>
                  <h5 className="mb-0">Zengin Eğitim İçerikleri</h5>
                </div>
                <p className="text-muted mb-0">Videolar ve dokümanlarla desteklenmiş, kuruma özel eğitim programları.</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 card-hover">
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: 48, height: 48}}>
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <h5 className="mb-0">Güvenli ve Yetkili</h5>
                </div>
                <p className="text-muted mb-0">Rol bazlı erişim, güvenli dosya yükleme ve kurumsal standartlarda güvenlik.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* STATS */}
      <section className="py-4 bg-light border-top border-bottom">
        <Container>
          <Row className="text-center g-3">
            <Col md={4}>
              <h3 className="fw-bold mb-0">{Math.max(courses.length, 12)}</h3>
              <div className="text-muted">Toplam Eğitim</div>
            </Col>
            <Col md={4}>
              <h3 className="fw-bold mb-0">{Math.max(streams.length, 3)}</h3>
              <div className="text-muted">Aktif Yayın</div>
            </Col>
            <Col md={4}>
              <h3 className="fw-bold mb-0">24/7</h3>
              <div className="text-muted">Destek</div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* HIGHLIGHTS */}
      <Container className="py-5">
        <Row className="g-4">
          <Col md={6}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 mb-0">Aktif Yayınlar</h2>
              <Button as={Link} to="/canli-yayin" size="sm" variant="outline-primary">Tümü</Button>
            </div>
            {streams.length === 0 ? (
              <Card body className="text-muted text-center py-4">
                <i className="fas fa-video fa-2x mb-3 text-muted"></i>
                <p className="mb-0">Şu anda aktif yayın yok.</p>
              </Card>
            ) : (
              streams.map((s) => (
                <Card key={s._id} className="mb-3 card-hover">
                  <Card.Body className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: 40, height: 40}}>
                        <i className="fas fa-play"></i>
                      </div>
                      <div>
                        <div className="fw-semibold">{s.title}</div>
                        <div className="text-muted small">
                          <i className="fas fa-user me-1"></i>
                          {s.userId?.username || 'Anonim'}
                        </div>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <Badge bg="success">Canlı</Badge>
                      <Button as={Link} to="/canli-yayin" size="sm" variant="primary" className="btn-custom">
                        <i className="fas fa-sign-in-alt me-1"></i>Katıl
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              ))
            )}
          </Col>
          <Col md={6}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 mb-0">Son Eğitimler</h2>
              <Button as={Link} to="/courses" size="sm" variant="outline-primary">Tümü</Button>
            </div>
            {courses.length === 0 ? (
              <Card body className="text-muted text-center py-4">
                <i className="fas fa-book fa-2x mb-3 text-muted"></i>
                <p className="mb-0">Henüz ders yok.</p>
              </Card>
            ) : (
              courses.map((c) => (
                <Card key={c._id} className="mb-3 card-hover">
                  <Card.Body className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: 40, height: 40}}>
                        <i className="fas fa-book"></i>
                      </div>
                      <div>
                        <div className="fw-semibold">{c.title}</div>
                        <div className="text-muted small">
                          {(c.description || '').slice(0, 80)}{(c.description || '').length > 80 ? '…' : ''}
                        </div>
                      </div>
                    </div>
                    <Button as={Link} to="/courses" size="sm" variant="outline-success" className="btn-custom">
                      <i className="fas fa-eye me-1"></i>İncele
                    </Button>
                  </Card.Body>
                </Card>
              ))
            )}
          </Col>
        </Row>
      </Container>

      {/* CTA */}
      <section className="py-5 bg-light border-top">
        <Container>
          <Row className="align-items-center">
            <Col lg={8} className="mb-3 mb-lg-0">
              <h3 className="mb-2">Kurumunuz için özel bir çözüm mü arıyorsunuz?</h3>
              <p className="text-muted mb-0">İhtiyaçlarınıza uygun eğitim ve iletişim altyapısını birlikte kuralım.</p>
            </Col>
            <Col lg={4} className="text-lg-end">
              <Button as={Link} to="/qa" variant="primary" className="btn-custom">
                Bizimle İletişime Geçin
              </Button>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default Home;