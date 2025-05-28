import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import CourseCard from '../components/CourseCard';
import AddCourseForm from '../components/AddCourseForm';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
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
      <Container className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <Spinner animation="border" role="status" variant="primary" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Yükleniyor...</span>
          </Spinner>
          <p className="mt-3 text-muted">Dersler yükleniyor...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="bg-light min-vh-100 py-5">
      <Container>
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-primary mb-3">Eğitim İçerikleri</h1>
          <div className="bg-primary mx-auto" style={{ width: '100px', height: '4px' }}></div>
          <p className="lead text-muted mt-3">Kapsamlı eğitim içeriklerimizle kendinizi geliştirin</p>
        </div>
        
        {error && (
          <Alert variant="danger" className="mb-4 shadow-sm">
            <i className="bi bi-exclamation-circle me-2"></i>
            {error}
          </Alert>
        )}

        {user?.isAdmin && (
          <Row className="mb-5">
            <Col lg={8} className="mx-auto">
              <div className="bg-white p-4 rounded-3 shadow-sm border">
                <h2 className="h4 mb-4 text-primary">
                  <i className="bi bi-plus-circle me-2"></i>
                  Yeni Ders Ekle
                </h2>
                <AddCourseForm onCourseAdded={handleCourseAdded} />
              </div>
            </Col>
          </Row>
        )}

        <Row className="g-4">
          {courses.length === 0 ? (
            <Col>
              <div className="text-center py-5">
                <i className="bi bi-book fs-1 text-muted mb-3 d-block"></i>
                <Alert variant="info" className="d-inline-block">
                  Henüz ders bulunmuyor.
                </Alert>
              </div>
            </Col>
          ) : (
            courses.map(course => (
              <Col key={course._id} xs={12} md={6} lg={4}>
                <div className="h-100">
                  <CourseCard 
                    course={course} 
                    onCourseUpdated={handleCourseUpdated}
                    onCourseDeleted={handleCourseDeleted}
                  />
                </div>
              </Col>
            ))
          )}
        </Row>
      </Container>
    </Container>
  );
};

export default CoursesPage; 