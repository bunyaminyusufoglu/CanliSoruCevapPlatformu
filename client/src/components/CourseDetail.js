import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Badge, Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollError, setEnrollError] = useState('');

  useEffect(() => {
    fetchCourse();
    fetchComments();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/courses/${id}`);
      setCourse(response.data);
      setError('');
    } catch (err) {
      setError('Ders bilgileri yüklenirken bir hata oluştu.');
      console.error('Course fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/api/courses/${id}/comments`);
      setComments(response.data);
    } catch (err) {
      console.error('Comments fetch error:', err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const response = await axios.post(`/api/courses/${id}/comments`, {
        content: comment
      });
      setComments([...comments, response.data]);
      setComment('');
    } catch (err) {
      console.error('Comment submit error:', err);
    }
  };

  const handleEnroll = async () => {
    try {
      setEnrollLoading(true);
      setEnrollError('');
      await axios.post(`/api/courses/${id}/enroll`);
      setShowEnrollModal(false);
      navigate(`/courses/${id}/learn`);
    } catch (err) {
      setEnrollError('Derse kaydolurken bir hata oluştu.');
      console.error('Enroll error:', err);
    } finally {
      setEnrollLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 py-5" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
        <Container>
          <div className="text-center">
            <Spinner animation="border" variant="primary" className="shadow-sm" />
            <p className="text-muted mt-3">Ders bilgileri yükleniyor...</p>
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
    <div className="min-vh-100 py-4 py-md-5" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
      <Container>
        <Row className="g-4">
          {/* Sol Kolon - Ders Detayları */}
          <Col lg={8}>
            <Card className="border-0 shadow-lg rounded-4 mb-4 animate__animated animate__fadeIn">
              <Card.Body className="p-4">
                <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3 mb-4">
                  <div className={`bg-${course.color || 'primary'} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center`}
                       style={{width: 64, height: 64, minWidth: 64}}>
                    <i className={`bi bi-book text-${course.color || 'primary'} fs-2`}></i>
                  </div>
                  <div className="flex-grow-1">
                    <h1 className="h2 h1-md fw-bold mb-2">{course.title}</h1>
                    <div className="d-flex flex-wrap gap-2">
                      <Badge bg="primary" bg-opacity="10" text="primary" className="rounded-pill px-3 py-2">
                        <i className="bi bi-tag me-1"></i>
                        {course.category}
                      </Badge>
                      <Badge bg="light" text="dark" className="rounded-pill px-3 py-2">
                        <i className="bi bi-person me-1"></i>
                        {course.instructor}
                      </Badge>
                      <Badge bg="light" text="dark" className="rounded-pill px-3 py-2">
                        <i className="bi bi-clock me-1"></i>
                        {course.duration} saat
                      </Badge>
                      <Badge bg="light" text="dark" className="rounded-pill px-3 py-2">
                        <i className="bi bi-star me-1"></i>
                        {course.rating || 'Yeni'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold mb-3">Ders Açıklaması</h5>
                  <p className="text-muted mb-0">{course.description}</p>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold mb-3">Ders İçeriği</h5>
                  <div className="list-group list-group-flush">
                    {course.lessons?.map((lesson, index) => (
                      <div key={index} className="list-group-item border-0 bg-light bg-opacity-50 rounded-3 mb-2 p-3">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                               style={{width: 32, height: 32, minWidth: 32}}>
                            <i className="bi bi-play-fill text-primary"></i>
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="mb-1">{lesson.title}</h6>
                            <small className="text-muted">{lesson.duration} dakika</small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  variant="primary" 
                  size="lg"
                  className="w-100 rounded-pill hover-lift"
                  onClick={() => setShowEnrollModal(true)}
                >
                  <i className="bi bi-bookmark-plus me-2"></i>
                  Derse Kaydol
                </Button>
              </Card.Body>
            </Card>

            {/* Yorumlar */}
            <Card className="border-0 shadow-lg rounded-4 animate__animated animate__fadeIn">
              <Card.Header className="bg-light bg-opacity-50 border-0 py-3">
                <h5 className="fw-bold mb-0">
                  <i className="bi bi-chat-dots me-2"></i>
                  Yorumlar
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Form onSubmit={handleCommentSubmit} className="mb-4">
                  <Form.Group>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Yorumunuzu yazın..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="bg-light border-0 rounded-3"
                    />
                  </Form.Group>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="mt-3 rounded-pill hover-lift"
                    disabled={!comment.trim()}
                  >
                    <i className="bi bi-send me-2"></i>
                    Yorum Yap
                  </Button>
                </Form>

                <div className="comments-list">
                  {comments.length === 0 ? (
                    <div className="text-center py-4">
                      <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                           style={{width: 64, height: 64}}>
                        <i className="bi bi-chat-square-text fs-1 text-muted"></i>
                      </div>
                      <p className="text-muted mb-0">Henüz yorum yapılmamış.</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment._id} className="comment-item mb-4">
                        <div className="d-flex gap-3">
                          <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                               style={{width: 40, height: 40, minWidth: 40}}>
                            <i className="bi bi-person text-primary"></i>
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-2">
                              <h6 className="fw-bold mb-0 me-2">{comment.user.name}</h6>
                              <small className="text-muted">
                                {new Date(comment.createdAt).toLocaleDateString('tr-TR')}
                              </small>
                            </div>
                            <p className="text-muted mb-0">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Sağ Kolon - Yan Bilgiler */}
          <Col lg={4}>
            <Card className="border-0 shadow-lg rounded-4 mb-4 animate__animated animate__fadeIn">
              <Card.Header className="bg-primary bg-gradient text-white py-3">
                <h5 className="fw-bold mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Ders Bilgileri
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3"
                         style={{width: 40, height: 40, minWidth: 40}}>
                      <i className="bi bi-people text-primary"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">Kayıtlı Öğrenci</small>
                      <span className="fw-bold">{course.enrolledStudents || 0}</span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3"
                         style={{width: 40, height: 40, minWidth: 40}}>
                      <i className="bi bi-calendar-check text-primary"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">Son Güncelleme</small>
                      <span className="fw-bold">
                        {new Date(course.updatedAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3"
                         style={{width: 40, height: 40, minWidth: 40}}>
                      <i className="bi bi-translate text-primary"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">Dil</small>
                      <span className="fw-bold">{course.language || 'Türkçe'}</span>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-lg rounded-4 animate__animated animate__fadeIn">
              <Card.Header className="bg-primary bg-gradient text-white py-3">
                <h5 className="fw-bold mb-0">
                  <i className="bi bi-shield-check me-2"></i>
                  Ders Garantisi
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex align-items-start">
                    <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                    <span>30 gün içinde iade garantisi</span>
                  </div>
                  <div className="d-flex align-items-start">
                    <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                    <span>Ömür boyu erişim</span>
                  </div>
                  <div className="d-flex align-items-start">
                    <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                    <span>Sertifika garantisi</span>
                  </div>
                  <div className="d-flex align-items-start">
                    <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                    <span>7/24 destek</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Kayıt Modalı */}
        <Modal 
          show={showEnrollModal} 
          onHide={() => setShowEnrollModal(false)}
          centered
          className="animate__animated animate__fadeIn"
        >
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="fw-bold">
              <i className="bi bi-bookmark-plus me-2"></i>
              Derse Kaydol
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {enrollError && (
              <Alert variant="danger" className="rounded-3">
                <i className="bi bi-exclamation-circle me-2"></i>
                {enrollError}
              </Alert>
            )}
            <p className="mb-0">
              <strong>{course.title}</strong> dersine kaydolmak istediğinizden emin misiniz?
            </p>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button 
              variant="light" 
              onClick={() => setShowEnrollModal(false)}
              className="rounded-pill"
            >
              İptal
            </Button>
            <Button 
              variant="primary" 
              onClick={handleEnroll}
              disabled={enrollLoading}
              className="rounded-pill"
            >
              {enrollLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-2"></i>
                  Kaydol
                </>
              )}
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
      </Container>
    </div>
  );
};

export default CourseDetail; 