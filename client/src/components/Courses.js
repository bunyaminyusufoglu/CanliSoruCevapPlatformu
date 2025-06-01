import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchCourses();
  }, [debouncedSearchTerm, selectedCategory]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/courses', {
        params: {
          search: debouncedSearchTerm,
          category: selectedCategory !== 'all' ? selectedCategory : undefined
        }
      });
      setCourses(response.data);
      setError('');
    } catch (err) {
      setError('Dersler yüklenirken bir hata oluştu.');
      console.error('Courses fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading && courses.length === 0) {
    return (
      <div className="min-vh-100 py-5" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
        <Container>
          <div className="text-center">
            <Spinner animation="border" variant="primary" className="shadow-sm" />
            <p className="text-muted mt-3">Dersler yükleniyor...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-vh-100 py-4 py-md-5" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
      <Container>
        <Card className="border-0 shadow-lg rounded-4 mb-4 animate__animated animate__fadeIn">
          <Card.Header className="bg-primary bg-gradient text-white py-3 py-md-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
              <h3 className="h4 h3-md fw-bold mb-0">
                <i className="bi bi-book me-2"></i>
                Dersler
              </h3>
              <Button 
                variant="light" 
                className="rounded-pill px-4 hover-lift"
                as={Link}
                to="/courses/new"
              >
                <i className="bi bi-plus-lg me-2"></i>
                Yeni Ders
              </Button>
            </div>
          </Card.Header>
          <Card.Body className="p-3 p-md-4">
            <Row className="g-3">
              <Col xs={12} md={8}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-0">
                    <i className="bi bi-search"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Ders ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-light border-0"
                  />
                </InputGroup>
              </Col>
              <Col xs={12} md={4}>
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-light border-0"
                >
                  <option value="all">Tüm Kategoriler</option>
                  <option value="matematik">Matematik</option>
                  <option value="fizik">Fizik</option>
                  <option value="kimya">Kimya</option>
                  <option value="biyoloji">Biyoloji</option>
                  <option value="turkce">Türkçe</option>
                  <option value="ingilizce">İngilizce</option>
                </Form.Select>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {error && (
          <Alert 
            variant="danger" 
            className="rounded-3 shadow-sm mb-4 animate__animated animate__fadeIn"
          >
            <i className="bi bi-exclamation-circle me-2"></i>
            {error}
          </Alert>
        )}

        <div className="courses-list">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" size="sm" />
              <span className="ms-2 text-muted">Yükleniyor...</span>
            </div>
          ) : filteredCourses.length === 0 ? (
            <Card className="border-0 shadow-lg rounded-4 animate__animated animate__fadeIn">
              <Card.Body className="text-center p-5">
                <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-4" 
                     style={{width: 80, height: 80}}>
                  <i className="bi bi-book fs-1 text-primary"></i>
                </div>
                <h4 className="fw-bold mb-3">Ders Bulunamadı</h4>
                <p className="text-muted mb-4">Arama kriterlerinize uygun ders bulunamadı.</p>
                <Button 
                  variant="primary" 
                  className="rounded-pill px-4 hover-lift"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                >
                  <i className="bi bi-arrow-counterclockwise me-2"></i>
                  Filtreleri Temizle
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <Row className="g-3 g-md-4">
              {filteredCourses.map(course => (
                <Col key={course._id} xs={12} sm={6} lg={4}>
                  <Card className="h-100 border-0 shadow-lg rounded-4 hover-lift animate__animated animate__fadeIn">
                    <Card.Body className="p-4">
                      <div className="d-flex align-items-center mb-3">
                        <div className={`bg-${course.color || 'primary'} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3`}
                             style={{width: 48, height: 48, minWidth: 48}}>
                          <i className={`bi bi-book text-${course.color || 'primary'} fs-4`}></i>
                        </div>
                        <div>
                          <h5 className="h5 h4-md fw-bold mb-1">{course.title}</h5>
                          <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2">
                            <i className="bi bi-tag me-1"></i>
                            {course.category}
                          </span>
                        </div>
                      </div>
                      <p className="text-muted mb-4 fs-6 fs-md-5">
                        {course.description.substring(0, 150)}
                        {course.description.length > 150 ? '...' : ''}
                      </p>
                      <div className="d-flex flex-wrap gap-2 mb-4">
                        <span className="badge bg-light text-dark rounded-pill px-3 py-2">
                          <i className="bi bi-person me-1"></i>
                          {course.instructor}
                        </span>
                        <span className="badge bg-light text-dark rounded-pill px-3 py-2">
                          <i className="bi bi-clock me-1"></i>
                          {course.duration} saat
                        </span>
                        <span className="badge bg-light text-dark rounded-pill px-3 py-2">
                          <i className="bi bi-star me-1"></i>
                          {course.rating || 'Yeni'}
                        </span>
                      </div>
                      <Button 
                        as={Link}
                        to={`/courses/${course._id}`}
                        variant="primary" 
                        className="w-100 rounded-pill hover-lift"
                      >
                        <i className="bi bi-arrow-right me-2"></i>
                        Derse Git
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>

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
          @media (max-width: 768px) {
            .h3-md {
              font-size: 1.5rem;
            }
            .h4-md {
              font-size: 1.25rem;
            }
            .fs-5 {
              font-size: 1.1rem !important;
            }
            .fs-6 {
              font-size: 1rem !important;
            }
          }
          @media (max-width: 576px) {
            .h3-md {
              font-size: 1.25rem;
            }
            .h4-md {
              font-size: 1.1rem;
            }
            .fs-5 {
              font-size: 1rem !important;
            }
            .fs-6 {
              font-size: 0.9rem !important;
            }
          }
        `}</style>
      </Container>
    </div>
  );
};

export default Courses; 