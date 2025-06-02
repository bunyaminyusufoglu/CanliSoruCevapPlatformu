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
      setCourses(response.data.courses);
      setError('');
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

  const handleCourseAdded = async () => {
    await fetchCourses();
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
          <Spinner animation="border" role="status" variant="primary" style={{ width: '4rem', height: '4rem' }}>
            <span className="visually-hidden">Yükleniyor...</span>
          </Spinner>
          <p className="mt-4 text-muted fs-5">Dersler yükleniyor...</p>
        </div>
      </Container>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      {/* Header Section */}
      <div 
        className="py-5 text-center text-white position-relative"
        style={{
          background: 'linear-gradient(135deg, #4a90e2 0%, #2c3e50 100%)',
          marginBottom: '4rem'
        }}
      >
        <Container className="py-5">
          <div className="display-3 fw-bold mb-4 animate__animated animate__fadeIn">
            Eğitim İçerikleri
          </div>
          <div className="bg-white mx-auto mb-4" style={{ width: '100px', height: '4px' }}></div>
          <p className="lead text-white opacity-90 fs-4 animate__animated animate__fadeIn animate__delay-1s">
            Kapsamlı eğitim içeriklerimizle kendinizi geliştirin
          </p>
        </Container>
        <div 
          className="position-absolute bottom-0 start-0 w-100 bg-light"
          style={{
            height: '120px',
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 0)'
          }}
        />
      </div>

      <Container className="pb-5">
        {error && (
          <Alert variant="danger" className="mb-4 shadow-sm animate__animated animate__fadeIn">
            <i className="bi bi-exclamation-circle me-2"></i>
            {error}
          </Alert>
        )}

        {user?.isAdmin || user?.userType === 'teacher' ? (
          <Row className="mb-5">
            <Col lg={8} className="mx-auto">
              <div className="bg-white p-5 rounded-4 shadow-lg border-0 animate__animated animate__fadeIn">
                <h2 className="h3 mb-4 text-primary d-flex align-items-center">
                  <i className="bi bi-plus-circle me-2"></i>
                  Yeni Ders Ekle
                </h2>
                <AddCourseForm onCourseAdded={handleCourseAdded} />
              </div>
            </Col>
          </Row>
        ) : null}

        <Row className="g-4">
          {courses.length === 0 ? (
            <Col>
              <div className="text-center py-5 animate__animated animate__fadeIn">
                <i className="bi bi-book fs-1 text-muted mb-4 d-block"></i>
                <Alert variant="info" className="d-inline-block shadow-sm">
                  Henüz ders bulunmuyor.
                </Alert>
              </div>
            </Col>
          ) : (
            courses.map((course, index) => (
              <Col key={course._id} xs={12} md={6} lg={4}>
                <div className="h-100 animate__animated animate__fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
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

      <style jsx>{`
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
      `}</style>
    </div>
  );
};

export default CoursesPage; 