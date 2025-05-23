import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
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
      <Container className="mt-4">
        <Alert variant="info">Dersler yükleniyor...</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Eğitim İçerikleri</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}

      {user?.isAdmin && (
        <Row className="mb-4">
          <Col>
            <div className="bg-light p-4 rounded">
              <h2>Yeni Ders Ekle</h2>
              <AddCourseForm onCourseAdded={handleCourseAdded} />
            </div>
          </Col>
        </Row>
      )}

      <Row>
        {courses.length === 0 ? (
          <Col>
            <Alert variant="info">Henüz ders bulunmuyor.</Alert>
          </Col>
        ) : (
          courses.map(course => (
            <Col key={course._id} xs={12} md={6} lg={4} className="mb-4">
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