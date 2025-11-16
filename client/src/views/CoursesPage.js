import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Alert, Card, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import CourseCard from '../components/CourseCard';
import AddCourseForm from '../components/AddCourseForm';


const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/courses');
      if (response.data.success) {
        setCourses(response.data.courses);
      }
    } catch (error) {
      setError('Dersler yüklenirken bir hata oluştu');
      console.error('Dersler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    if (!searchTerm.trim()) return courses;
    const q = searchTerm.toLowerCase();
    return courses.filter(c =>
      c.title?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
    );
  }, [courses, searchTerm]);

  const handleCourseAdded = () => {
    fetchCourses();
  };

  const handleCourseUpdated = () => {
    fetchCourses();
  };

  const handleCourseDeleted = (courseId) => {
    setCourses(prevCourses => prevCourses.filter(course => course._id !== courseId));
  };

  if (loading) {
    return (
      <Container className="mt-3 courses-compact">
        <Alert variant="info">Dersler yükleniyor...</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-3 courses-compact">
      {/* Hero / Başlık */}
      <Card className="mb-4 course-hero card-hover">
        <Card.Body>
          <Row className="g-3 align-items-center">
            <Col lg={8}>
              <h4 className="mb-1">Eğitim İçerikleri</h4>
              <p className="text-muted small mb-0">Toplam {courses.length} ders · Gösterilen {filteredCourses.length}</p>
            </Col>
            <Col lg={4}>
              <Form>
                <Form.Group className="mb-0">
                  <Form.Label className="text-muted small"><i className="fas fa-search me-2"></i>Arama</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Başlık veya açıklama ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Form.Group>
              </Form>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}

      {user?.isAdmin && (
        <Row className="mb-4">
          <Col>
            <Card className="card-hover">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h4 className="mb-0"><i className="fas fa-plus me-2 text-primary"></i>Yeni Ders Ekle</h4>
                </div>
                <AddCourseForm onCourseAdded={handleCourseAdded} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row className="gy-4">
        {courses.length === 0 ? (
          <Col>
            <Card className="text-center">
              <Card.Body className="py-5">
                <i className="fas fa-book-open fa-2x text-muted mb-2"></i>
                <h6 className="text-muted">Henüz ders bulunmuyor</h6>
                <p className="text-muted mb-0">Yeni dersler eklendiğinde burada göreceksiniz.</p>
              </Card.Body>
            </Card>
          </Col>
        ) : filteredCourses.length === 0 ? (
          <Col>
            <Alert variant="warning">Aramanıza uygun ders bulunamadı.</Alert>
          </Col>
        ) : (
          filteredCourses.map(course => (
            <Col key={course._id} xs={12} md={6} lg={4}>
              <CourseCard 
                course={course} 
                onCourseUpdated={handleCourseUpdated}
                onCourseDeleted={handleCourseDeleted}
              />
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default CoursesPage; 