import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup } from 'react-bootstrap';
import { FaSearch, FaBook, FaUser, FaClock, FaStar } from 'react-icons/fa';
import axios from 'axios';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/courses');
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

  if (loading) {
    return (
      <Container className="py-5">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">Dersler</h2>
      
      {/* Arama ve Filtreleme */}
      <Row className="mb-4">
        <Col md={6} className="mb-3 mb-md-0">
          <InputGroup>
            <InputGroup.Text className="bg-light">
              <FaSearch />
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
        <Col md={6}>
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

      {/* Ders Listesi */}
      <Row>
        {filteredCourses.length === 0 ? (
          <Col>
            <div className="text-center py-5">
              <FaBook className="text-muted mb-3" size={48} />
              <h4>Ders bulunamadı</h4>
              <p className="text-muted">Arama kriterlerinize uygun ders bulunamadı.</p>
            </div>
          </Col>
        ) : (
          filteredCourses.map((course) => (
            <Col key={course._id} md={6} lg={4} className="mb-4">
              <Card className="h-100 shadow-sm hover-shadow">
                <Card.Img
                  variant="top"
                  src={course.image || 'https://via.placeholder.com/300x200'}
                  alt={course.title}
                  style={{ height: 200, objectFit: 'cover' }}
                />
                <Card.Body className="d-flex flex-column">
                  <div className="mb-2">
                    <span className="badge bg-primary">{course.category}</span>
                  </div>
                  <Card.Title className="h5 mb-3">{course.title}</Card.Title>
                  <Card.Text className="text-muted flex-grow-1">
                    {course.description}
                  </Card.Text>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div className="d-flex align-items-center">
                      <FaUser className="text-muted me-2" />
                      <small className="text-muted">{course.instructor}</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <FaClock className="text-muted me-2" />
                      <small className="text-muted">{course.duration}</small>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div className="d-flex align-items-center">
                      <FaStar className="text-warning me-1" />
                      <span className="text-muted">{course.rating || 'Yeni'}</span>
                    </div>
                    <Button variant="primary" size="sm">
                      Derse Katıl
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default Courses; 