import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup, Pagination, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AddQuestionForm from './AddQuestionForm';

const QuestionList = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedUsername, setSelectedUsername] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchQuestions();
  }, [debouncedSearchTerm, selectedCategory, selectedUsername, sortBy, sortOrder, currentPage]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/questions', {
        params: {
          search: debouncedSearchTerm,
          category: selectedCategory,
          username: selectedUsername,
          sortBy,
          sortOrder,
          page: currentPage,
          limit: 10
        }
      });
      setQuestions(response.data.questions);
      setTotalPages(response.data.totalPages);
      setError('');
    } catch (err) {
      setError('Sorular yüklenirken bir hata oluştu.');
      console.error('Questions fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (loading && questions.length === 0) {
    return (
      <div className="min-vh-100 py-5" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
        <Container>
          <div className="text-center">
            <Spinner animation="border" variant="primary" className="shadow-sm" />
            <p className="text-muted mt-3">Sorular yükleniyor...</p>
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
                <i className="bi bi-question-circle me-2"></i>
                Soru-Cevap
              </h3>
              <Button 
                variant="light" 
                className="rounded-pill px-4 hover-lift"
                onClick={() => setShowAddForm(true)}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Yeni Soru
              </Button>
            </div>
          </Card.Header>
          <Card.Body className="p-3 p-md-4">
            <Row className="g-3">
              <Col xs={12} md={6} lg={4}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-0">
                    <i className="bi bi-search"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Soru ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-light border-0"
                  />
                </InputGroup>
              </Col>
              <Col xs={12} sm={6} md={3} lg={2}>
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-light border-0"
                >
                  <option value="">Tüm Kategoriler</option>
                  <option value="matematik">Matematik</option>
                  <option value="fizik">Fizik</option>
                  <option value="kimya">Kimya</option>
                  <option value="biyoloji">Biyoloji</option>
                  <option value="turkce">Türkçe</option>
                  <option value="ingilizce">İngilizce</option>
                </Form.Select>
              </Col>
              <Col xs={12} sm={6} md={3} lg={2}>
                <Form.Select
                  value={selectedUsername}
                  onChange={(e) => setSelectedUsername(e.target.value)}
                  className="bg-light border-0"
                >
                  <option value="">Tüm Kullanıcılar</option>
                  {/* Kullanıcı listesi buraya eklenecek */}
                </Form.Select>
              </Col>
              <Col xs={12} md={12} lg={4}>
                <div className="d-flex gap-2">
                  <Button
                    variant={sortBy === 'createdAt' ? 'primary' : 'light'}
                    className="flex-grow-1 rounded-pill hover-lift"
                    onClick={() => handleSort('createdAt')}
                  >
                    <i className={`bi bi-arrow-${sortOrder === 'asc' ? 'up' : 'down'}-short me-1`}></i>
                    Tarih
                  </Button>
                  <Button
                    variant={sortBy === 'viewCount' ? 'primary' : 'light'}
                    className="flex-grow-1 rounded-pill hover-lift"
                    onClick={() => handleSort('viewCount')}
                  >
                    <i className={`bi bi-arrow-${sortOrder === 'asc' ? 'up' : 'down'}-short me-1`}></i>
                    Görüntülenme
                  </Button>
                  <Button
                    variant={sortBy === 'answerCount' ? 'primary' : 'light'}
                    className="flex-grow-1 rounded-pill hover-lift"
                    onClick={() => handleSort('answerCount')}
                  >
                    <i className={`bi bi-arrow-${sortOrder === 'asc' ? 'up' : 'down'}-short me-1`}></i>
                    Cevaplar
                  </Button>
                </div>
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

        <div className="questions-list">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" size="sm" />
              <span className="ms-2 text-muted">Yükleniyor...</span>
            </div>
          ) : questions.length === 0 ? (
            <Card className="border-0 shadow-lg rounded-4 animate__animated animate__fadeIn">
              <Card.Body className="text-center p-5">
                <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-4" 
                     style={{width: 80, height: 80}}>
                  <i className="bi bi-question-circle fs-1 text-primary"></i>
                </div>
                <h4 className="fw-bold mb-3">Henüz Soru Yok</h4>
                <p className="text-muted mb-4">İlk soruyu siz sorun!</p>
                <Button 
                  variant="primary" 
                  className="rounded-pill px-4 hover-lift"
                  onClick={() => setShowAddForm(true)}
                >
                  <i className="bi bi-plus-lg me-2"></i>
                  Yeni Soru Sor
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <>
              {questions.map(question => (
                <Card 
                  key={question._id} 
                  className="border-0 shadow-sm rounded-4 mb-3 hover-lift animate__animated animate__fadeIn"
                >
                  <Card.Body className="p-3 p-md-4">
                    <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                      <div className="flex-grow-1">
                        <Link 
                          to={`/questions/${question._id}`}
                          className="text-decoration-none"
                        >
                          <h5 className="h5 h4-md fw-bold mb-2 text-dark hover-primary">
                            {question.title}
                          </h5>
                        </Link>
                        <div className="d-flex flex-wrap gap-2 mb-2">
                          <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2">
                            <i className="bi bi-tag me-1"></i>
                            {question.category}
                          </span>
                          <span className="badge bg-light text-dark rounded-pill px-3 py-2">
                            <i className="bi bi-person me-1"></i>
                            {question.user.username}
                          </span>
                          <span className="badge bg-light text-dark rounded-pill px-3 py-2">
                            <i className="bi bi-eye me-1"></i>
                            {question.viewCount} görüntülenme
                          </span>
                          <span className="badge bg-light text-dark rounded-pill px-3 py-2">
                            <i className="bi bi-chat me-1"></i>
                            {question.answers.length} cevap
                          </span>
                        </div>
                        <p className="text-muted mb-0 fs-6 fs-md-5">
                          {question.content.substring(0, 200)}
                          {question.content.length > 200 ? '...' : ''}
                        </p>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}

              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination className="rounded-pill shadow-sm">
                    <Pagination.Prev 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="rounded-pill"
                    />
                    {[...Array(totalPages)].map((_, i) => (
                      <Pagination.Item
                        key={i + 1}
                        active={currentPage === i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className="rounded-pill"
                      >
                        {i + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-pill"
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>

        <AddQuestionForm 
          show={showAddForm} 
          onHide={() => setShowAddForm(false)}
          onQuestionAdded={() => {
            setShowAddForm(false);
            fetchQuestions();
          }}
        />

        <style jsx>{`
          .hover-lift {
            transition: transform 0.2s ease-in-out;
          }
          .hover-lift:hover {
            transform: translateY(-2px);
          }
          .hover-primary:hover {
            color: var(--bs-primary) !important;
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

export default QuestionList; 