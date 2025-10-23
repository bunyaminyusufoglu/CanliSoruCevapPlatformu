import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Alert, Modal } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const QAPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAskModal, setShowAskModal] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '', category: 'genel', tags: '' });
  const [newAnswer, setNewAnswer] = useState('');
  const { user } = useAuth();

  const categories = [
    { value: 'all', label: 'Tümü' },
    { value: 'frontend', label: 'Frontend' },
    { value: 'backend', label: 'Backend' },
    { value: 'database', label: 'Veritabanı' },
    { value: 'devops', label: 'DevOps' },
    { value: 'mobile', label: 'Mobil Geliştirme' },
    { value: 'genel', label: 'Genel' }
  ];

  useEffect(() => {
    fetchQuestions();
  }, [searchTerm, selectedCategory]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      
      const response = await axios.get(`/api/questions?${params}`);
      if (response.data.success) {
        setQuestions(response.data.questions);
      }
    } catch (error) {
      setError('Sorular yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    try {
      const tags = newQuestion.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      const response = await axios.post('/api/questions', {
        ...newQuestion,
        tags
      });
      
      if (response.data.success) {
        setShowAskModal(false);
        setNewQuestion({ title: '', content: '', category: 'genel', tags: '' });
        fetchQuestions();
      }
    } catch (error) {
      setError('Soru gönderilirken bir hata oluştu');
    }
  };

  const handleAnswerQuestion = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/api/questions/${selectedQuestion._id}/answers`, {
        content: newAnswer
      });
      
      if (response.data.success) {
        setShowAnswerModal(false);
        setNewAnswer('');
        setSelectedQuestion(null);
        fetchQuestions();
      }
    } catch (error) {
      setError('Cevap gönderilirken bir hata oluştu');
    }
  };

  const handleAcceptAnswer = async (questionId, answerId) => {
    try {
      const response = await axios.put(`/api/questions/${questionId}/answers/${answerId}/accept`);
      if (response.data.success) {
        fetchQuestions();
      }
    } catch (error) {
      setError('Cevap kabul edilirken bir hata oluştu');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      frontend: 'primary',
      backend: 'success',
      database: 'warning',
      devops: 'info',
      mobile: 'secondary',
      genel: 'dark'
    };
    return colors[category] || 'dark';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="display-6 fw-bold text-primary">
            <i className="fas fa-question-circle me-2"></i>
            Soru & Cevap
          </h1>
          <p className="text-muted">Sorularınızı sorun, cevaplarınızı paylaşın</p>
        </div>
        {user && (
          <Button 
            variant="primary" 
            size="lg"
            onClick={() => setShowAskModal(true)}
            className="btn-custom"
          >
            <i className="fas fa-plus me-2"></i>Soru Sor
          </Button>
        )}
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Filtreler */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  <i className="fas fa-search me-2"></i>Ara
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Soru ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  <i className="fas fa-filter me-2"></i>Kategori
                </Form.Label>
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Sorular Listesi */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border spinner-border-custom text-primary" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </div>
          <p className="mt-3 text-muted">Sorular yükleniyor...</p>
        </div>
      ) : questions.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <i className="fas fa-question-circle fa-3x text-muted mb-3"></i>
            <h4 className="text-muted">Henüz soru yok</h4>
            <p className="text-muted">İlk soruyu siz sorun!</p>
            {user && (
              <Button 
                variant="primary" 
                onClick={() => setShowAskModal(true)}
                className="btn-custom"
              >
                <i className="fas fa-plus me-2"></i>Soru Sor
              </Button>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {questions.map(question => (
            <Col key={question._id} lg={12} className="mb-4">
              <Card className="card-hover">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="flex-grow-1">
                      <h5 className="card-title mb-2">
                        <a 
                          href={`/questions/${question._id}`} 
                          className="text-decoration-none text-dark"
                        >
                          {question.title}
                        </a>
                      </h5>
                      <div className="d-flex gap-2 mb-2">
                        <Badge bg={getCategoryColor(question.category)}>
                          {categories.find(c => c.value === question.category)?.label}
                        </Badge>
                        {question.tags.map((tag, index) => (
                          <Badge key={index} bg="outline-secondary" className="text-dark">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="text-muted small">
                        <i className="fas fa-eye me-1"></i>{question.views}
                      </div>
                      <div className="text-muted small">
                        <i className="fas fa-comments me-1"></i>{question.answers.length}
                      </div>
                    </div>
                  </div>
                  
                  <p className="card-text text-muted mb-3">
                    {question.content.length > 200 
                      ? `${question.content.substring(0, 200)}...` 
                      : question.content
                    }
                  </p>
                  
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="text-muted small">
                      <i className="fas fa-user me-1"></i>
                      {question.author?.username} • {formatDate(question.createdAt)}
                    </div>
                    <div className="d-flex gap-2">
                      {question.isResolved && (
                        <Badge bg="success">
                          <i className="fas fa-check me-1"></i>Çözüldü
                        </Badge>
                      )}
                      {user && (
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => {
                            setSelectedQuestion(question);
                            setShowAnswerModal(true);
                          }}
                        >
                          <i className="fas fa-reply me-1"></i>Cevap Ver
                        </Button>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Soru Sorma Modal */}
      <Modal show={showAskModal} onHide={() => setShowAskModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-question-circle me-2"></i>Yeni Soru Sor
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAskQuestion}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Soru Başlığı</Form.Label>
              <Form.Control
                type="text"
                placeholder="Sorunuzun başlığını yazın..."
                value={newQuestion.title}
                onChange={(e) => setNewQuestion({...newQuestion, title: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Kategori</Form.Label>
              <Form.Select
                value={newQuestion.category}
                onChange={(e) => setNewQuestion({...newQuestion, category: e.target.value})}
              >
                {categories.slice(1).map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Soru Detayı</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Sorunuzu detaylı bir şekilde açıklayın..."
                value={newQuestion.content}
                onChange={(e) => setNewQuestion({...newQuestion, content: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Etiketler (virgülle ayırın)</Form.Label>
              <Form.Control
                type="text"
                placeholder="javascript, react, nodejs"
                value={newQuestion.tags}
                onChange={(e) => setNewQuestion({...newQuestion, tags: e.target.value})}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAskModal(false)}>
              İptal
            </Button>
            <Button variant="primary" type="submit" className="btn-custom">
              <i className="fas fa-paper-plane me-2"></i>Soru Gönder
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Cevap Verme Modal */}
      <Modal show={showAnswerModal} onHide={() => setShowAnswerModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-reply me-2"></i>Cevap Ver
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAnswerQuestion}>
          <Modal.Body>
            {selectedQuestion && (
              <div className="mb-3">
                <h6>{selectedQuestion.title}</h6>
                <p className="text-muted">{selectedQuestion.content}</p>
              </div>
            )}
            
            <Form.Group className="mb-3">
              <Form.Label>Cevabınız</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Cevabınızı yazın..."
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAnswerModal(false)}>
              İptal
            </Button>
            <Button variant="primary" type="submit" className="btn-custom">
              <i className="fas fa-paper-plane me-2"></i>Cevap Gönder
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default QAPage;
