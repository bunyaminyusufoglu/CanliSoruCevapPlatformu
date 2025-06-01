import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, ProgressBar, Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CourseLearn = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentLesson, setCurrentLesson] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/courses/${id}/learn`);
      setCourse(response.data);
      if (response.data.lessons?.length > 0) {
        setCurrentLesson(response.data.lessons[0]);
      }
      setProgress(response.data.progress || 0);
      setError('');
    } catch (err) {
      setError('Ders bilgileri yüklenirken bir hata oluştu.');
      console.error('Course fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonComplete = async () => {
    try {
      await axios.post(`/api/courses/${id}/lessons/${currentLesson._id}/complete`);
      const currentIndex = course.lessons.findIndex(lesson => lesson._id === currentLesson._id);
      if (currentIndex < course.lessons.length - 1) {
        setCurrentLesson(course.lessons[currentIndex + 1]);
      }
      setProgress(((currentIndex + 2) / course.lessons.length) * 100);
    } catch (err) {
      console.error('Lesson complete error:', err);
    }
  };

  const handleExit = () => {
    navigate(`/courses/${id}`);
  };

  if (loading) {
    return (
      <div className="min-vh-100 py-5" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
        <Container>
          <div className="text-center">
            <Spinner animation="border" variant="primary" className="shadow-sm" />
            <p className="text-muted mt-3">Ders yükleniyor...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-vh-100 py-5" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
        <Container>
          <Alert 
            variant="danger" 
            className="rounded-3 shadow-sm animate__animated animate__fadeIn"
          >
            <i className="bi bi-exclamation-circle me-2"></i>
            {error || 'Ders bulunamadı.'}
          </Alert>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
      {/* Üst Bar */}
      <div className="bg-white border-bottom shadow-sm py-3">
        <Container>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <Button 
                variant="light" 
                className="rounded-circle hover-lift"
                onClick={() => setShowExitModal(true)}
              >
                <i className="bi bi-arrow-left"></i>
              </Button>
              <div>
                <h5 className="fw-bold mb-1">{course.title}</h5>
                <small className="text-muted">
                  {course.lessons.findIndex(lesson => lesson._id === currentLesson?._id) + 1} / {course.lessons.length} Ders
                </small>
              </div>
            </div>
            <div className="w-100 w-md-auto">
              <ProgressBar 
                now={progress} 
                className="rounded-pill" 
                style={{height: 8}}
                variant="primary"
              />
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-4">
        <Row className="g-4">
          {/* Sol Kolon - Ders İçeriği */}
          <Col lg={8}>
            <Card className="border-0 shadow-lg rounded-4 mb-4 animate__animated animate__fadeIn">
              <Card.Body className="p-4">
                {currentLesson ? (
                  <>
                    <div className="mb-4">
                      <h4 className="fw-bold mb-3">{currentLesson.title}</h4>
                      <div className="ratio ratio-16x9 rounded-4 overflow-hidden mb-4">
                        <iframe
                          src={currentLesson.videoUrl}
                          title={currentLesson.title}
                          allowFullScreen
                          className="border-0"
                        ></iframe>
                      </div>
                      <div className="bg-light rounded-4 p-4">
                        <h5 className="fw-bold mb-3">Ders Açıklaması</h5>
                        <p className="text-muted mb-0">{currentLesson.description}</p>
                      </div>
                    </div>

                    <div className="d-flex flex-column flex-sm-row gap-3">
                      <Button 
                        variant="primary" 
                        size="lg"
                        className="flex-grow-1 rounded-pill hover-lift"
                        onClick={handleLessonComplete}
                      >
                        <i className="bi bi-check-lg me-2"></i>
                        Dersi Tamamla
                      </Button>
                      <Button 
                        variant="light" 
                        size="lg"
                        className="rounded-pill hover-lift"
                        onClick={() => setShowExitModal(true)}
                      >
                        <i className="bi bi-x-lg me-2"></i>
                        Dersten Çık
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-5">
                    <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-4" 
                         style={{width: 80, height: 80}}>
                      <i className="bi bi-check-circle fs-1 text-success"></i>
                    </div>
                    <h4 className="fw-bold mb-3">Tebrikler!</h4>
                    <p className="text-muted mb-4">Tüm dersleri tamamladınız.</p>
                    <Button 
                      variant="primary" 
                      size="lg"
                      className="rounded-pill hover-lift"
                      onClick={handleExit}
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Derse Geri Dön
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Sağ Kolon - Ders Listesi */}
          <Col lg={4}>
            <Card className="border-0 shadow-lg rounded-4 animate__animated animate__fadeIn">
              <Card.Header className="bg-primary bg-gradient text-white py-3">
                <h5 className="fw-bold mb-0">
                  <i className="bi bi-list-check me-2"></i>
                  Ders Listesi
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="list-group list-group-flush">
                  {course.lessons?.map((lesson, index) => (
                    <button
                      key={lesson._id}
                      className={`list-group-item list-group-item-action border-0 p-3 ${
                        lesson._id === currentLesson?._id ? 'bg-primary bg-opacity-10' : ''
                      }`}
                      onClick={() => setCurrentLesson(lesson)}
                    >
                      <div className="d-flex align-items-center">
                        <div className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${
                          lesson.completed ? 'bg-success' : 
                          lesson._id === currentLesson?._id ? 'bg-primary' : 'bg-light'
                        }`}
                             style={{width: 32, height: 32, minWidth: 32}}>
                          {lesson.completed ? (
                            <i className="bi bi-check-lg text-white"></i>
                          ) : (
                            <span className={`${lesson._id === currentLesson?._id ? 'text-white' : 'text-muted'}`}>
                              {index + 1}
                            </span>
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <h6 className={`mb-1 ${lesson._id === currentLesson?._id ? 'text-primary' : ''}`}>
                            {lesson.title}
                          </h6>
                          <small className="text-muted">{lesson.duration} dakika</small>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Çıkış Modalı */}
      <Modal 
        show={showExitModal} 
        onHide={() => setShowExitModal(false)}
        centered
        className="animate__animated animate__fadeIn"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">
            <i className="bi bi-exclamation-triangle me-2 text-warning"></i>
            Dersten Çık
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">
            Dersten çıkmak istediğinizden emin misiniz? İlerlemeniz kaydedilecektir.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button 
            variant="light" 
            onClick={() => setShowExitModal(false)}
            className="rounded-pill"
          >
            İptal
          </Button>
          <Button 
            variant="primary" 
            onClick={handleExit}
            className="rounded-pill"
          >
            <i className="bi bi-check-lg me-2"></i>
            Evet, Çık
          </Button>
        </Modal.Footer>
      </Modal>

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
          .h1-md {
            font-size: 2rem;
          }
          .h2-md {
            font-size: 1.75rem;
          }
        }
        @media (max-width: 576px) {
          .h1-md {
            font-size: 1.75rem;
          }
          .h2-md {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CourseLearn; 