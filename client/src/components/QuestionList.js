import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup, Pagination } from 'react-bootstrap';
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

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: currentPage,
          limit: 10,
          sortBy,
          sortOrder
        });

        if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
        if (selectedCategory) params.append('category', selectedCategory);
        if (selectedUsername) params.append('username', selectedUsername);

        const response = await axios.get(`http://localhost:5000/api/questions?${params}`);
        setQuestions(response.data.questions);
        setTotalPages(response.data.totalPages);
        setError('');
      } catch (err) {
        setError('Sorular yüklenirken bir hata oluştu');
        console.error('Sorular yüklenirken hata:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [currentPage, sortBy, sortOrder, debouncedSearchTerm, selectedCategory, selectedUsername]);

  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const categories = [
    'matematik', 'fizik', 'kimya', 'biyoloji', 
    'türkçe', 'tarih', 'coğrafya', 'diğer'
  ];

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-4">Sorular</h2>
          
          {/* Arama ve Filtreleme */}
          <Card className="mb-4">
            <Card.Body>
              <Row>
                <Col md={4} className="mb-3">
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="fas fa-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Soru ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={3} className="mb-3">
                  <Form.Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">Tüm Kategoriler</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={3} className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Kullanıcı adı ile filtrele"
                    value={selectedUsername}
                    onChange={(e) => setSelectedUsername(e.target.value)}
                  />
                </Col>
                <Col md={2} className="mb-3">
                  <Button
                    variant="primary"
                    className="w-100"
                    onClick={() => setShowAddForm(true)}
                  >
                    <i className="fas fa-plus me-2"></i>
                    Soru Sor
                  </Button>
                </Col>
              </Row>

              {/* Sıralama Seçenekleri */}
              <Row className="mt-3">
                <Col>
                  <div className="d-flex gap-2">
                    <Button
                      variant={sortBy === 'createdAt' ? 'primary' : 'outline-primary'}
                      size="sm"
                      onClick={() => handleSortChange('createdAt')}
                    >
                      En Yeni {sortBy === 'createdAt' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </Button>
                    <Button
                      variant={sortBy === 'viewCount' ? 'primary' : 'outline-primary'}
                      size="sm"
                      onClick={() => handleSortChange('viewCount')}
                    >
                      En Çok Görüntülenen {sortBy === 'viewCount' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </Button>
                    <Button
                      variant={sortBy === 'answerCount' ? 'primary' : 'outline-primary'}
                      size="sm"
                      onClick={() => handleSortChange('answerCount')}
                    >
                      En Çok Cevaplanan {sortBy === 'answerCount' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Soru Ekleme Formu */}
          {showAddForm && (
            <Card className="mb-4">
              <Card.Body>
                <AddQuestionForm
                  onSuccess={() => {
                    setShowAddForm(false);
                    // Soruları yeniden yükle
                    setCurrentPage(1);
                  }}
                  onCancel={() => setShowAddForm(false)}
                />
              </Card.Body>
            </Card>
          )}

          {/* Hata Mesajı */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Soru Listesi */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Yükleniyor...</span>
              </div>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">Henüz soru bulunmuyor.</p>
            </div>
          ) : (
            <>
              {questions.map(question => (
                <Card key={question._id} className="mb-3">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <Link 
                          to={`/questions/${question._id}`}
                          className="text-decoration-none"
                        >
                          <h5 className="mb-2">{question.title}</h5>
                        </Link>
                        <div className="d-flex gap-3 mb-2">
                          <span className="badge bg-primary">
                            {question.category}
                          </span>
                          <small className="text-muted">
                            <i className="fas fa-user me-1"></i>
                            {question.user.username}
                          </small>
                          <small className="text-muted">
                            <i className="fas fa-eye me-1"></i>
                            {question.viewCount} görüntülenme
                          </small>
                          <small className="text-muted">
                            <i className="fas fa-comments me-1"></i>
                            {question.answers.length} cevap
                          </small>
                        </div>
                        <p className="text-muted mb-0">
                          {question.content.substring(0, 200)}
                          {question.content.length > 200 ? '...' : ''}
                        </p>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}

              {/* Sayfalama */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.First
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    />
                    
                    {[...Array(totalPages)].map((_, index) => (
                      <Pagination.Item
                        key={index + 1}
                        active={currentPage === index + 1}
                        onClick={() => setCurrentPage(index + 1)}
                      >
                        {index + 1}
                      </Pagination.Item>
                    ))}

                    <Pagination.Next
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    />
                    <Pagination.Last
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default QuestionList; 