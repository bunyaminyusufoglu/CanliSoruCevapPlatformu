import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
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
      <div className="py-5 bg-light border-bottom">
        <Container>
          <div className="text-center">
            <h1 className="display-6 fw-semibold mb-3">
              <i className="fas fa-home me-2"></i>
              Hoş Geldiniz!
            </h1>
            <p className="text-muted mb-4">Eğitim içeriklerinizi keşfedin ve öğrenmeye devam edin.</p>
            <div className="d-flex gap-2 justify-content-center flex-wrap">
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
          </div>
        </Container>
      </div>

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
                    <Button as={Link} to="/canli-yayin" size="sm" variant="primary" className="btn-custom">
                      <i className="fas fa-sign-in-alt me-1"></i>Katıl
                    </Button>
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
                          {(c.description || '').slice(0, 60)}{(c.description || '').length > 60 ? '…' : ''}
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
    </>
  );
};

export default Home;