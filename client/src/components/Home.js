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
          <h1 className="display-6 fw-semibold mb-3">Canlı Soru‑Cevap Platformu</h1>
          <p className="text-muted mb-4">Sorunu sor, canlı yayına katıl, eğitim içeriklerini takip et.</p>
          <div className="d-flex gap-2">
            <Button as={Link} to="/livechat" variant="primary">Canlı Sohbet</Button>
            <Button as={Link} to="/canli-yayin" variant="outline-primary">Canlı Yayınlar</Button>
            <Button as={Link} to="/courses" variant="outline-secondary">Eğitimler</Button>
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
              <Card body className="text-muted">Şu anda aktif yayın yok.</Card>
            ) : (
              streams.map((s) => (
                <Card key={s._id} className="mb-3">
                  <Card.Body className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold">{s.title}</div>
                      <div className="text-muted small">Yayıncı: {s.userId?.username || 'Anonim'}</div>
                    </div>
                    <Button as={Link} to="/canli-yayin" size="sm">Katıl</Button>
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
              <Card body className="text-muted">Henüz ders yok.</Card>
            ) : (
              courses.map((c) => (
                <Card key={c._id} className="mb-3">
                  <Card.Body className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold">{c.title}</div>
                      <div className="text-muted small">
                        {(c.description || '').slice(0, 80)}{(c.description || '').length > 80 ? '…' : ''}
                      </div>
                    </div>
                    <Button as={Link} to="/courses" size="sm" variant="outline-secondary">İncele</Button>
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