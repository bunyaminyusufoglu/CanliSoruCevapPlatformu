import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Alert, Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getQuestion, addAnswer, addReplyToAnswer, acceptAnswer } from '../api';

const QuestionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [newAnswer, setNewAnswer] = useState('');
  const [newReply, setNewReply] = useState('');

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const response = await getQuestion(id);
      if (response.data.success) {
        setQuestion(response.data.question);
      }
    } catch (error) {
      setError('Soru yüklenirken bir hata oluştu');
      console.error('Soru yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerQuestion = async (e) => {
    e.preventDefault();
    try {
      const response = await addAnswer(question._id, {
        content: newAnswer
      });
      
      if (response.data.success) {
        setShowAnswerModal(false);
        setNewAnswer('');
        fetchQuestion();
      }
    } catch (error) {
      setError('Cevap gönderilirken bir hata oluştu');
      console.error('Cevap gönderilirken hata:', error);
    }
  };

  const handleReplyToAnswer = async (e) => {
    e.preventDefault();
    try {
      const response = await addReplyToAnswer(question._id, selectedAnswer._id, {
        content: newReply
      });
      
      if (response.data.success) {
        setShowReplyModal(false);
        setNewReply('');
        setSelectedAnswer(null);
        fetchQuestion();
      }
    } catch (error) {
      setError('Yanıt gönderilirken bir hata oluştu');
      console.error('Yanıt gönderilirken hata:', error);
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    try {
      const response = await acceptAnswer(question._id, answerId);
      if (response.data.success) {
        fetchQuestion();
      }
    } catch (error) {
      setError('Cevap kabul edilirken bir hata oluştu');
      console.error('Cevap kabul edilirken hata:', error);
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

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center py-5">
          <div className="spinner-border spinner-border-custom text-primary" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </div>
          <p className="mt-3 text-muted">Soru yükleniyor...</p>
        </div>
      </Container>
    );
  }

  if (error || !question) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          {error || 'Soru bulunamadı'}
        </Alert>
        <Button variant="primary" onClick={() => navigate('/qa')}>
          <i className="fas fa-arrow-left me-2"></i>Sorulara Dön
        </Button>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      {/* Geri Dön Butonu */}
      <div className="mb-4">
        <Button variant="outline-secondary" onClick={() => navigate('/qa')}>
          <i className="fas fa-arrow-left me-2"></i>Sorulara Dön
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Soru Detayı */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div className="flex-grow-1">
              <h1 className="display-6 fw-bold mb-3">{question.title}</h1>
              <div className="d-flex gap-2 mb-3">
                <Badge bg={getCategoryColor(question.category)}>
                  {question.category}
                </Badge>
                {question.tags.map((tag, index) => (
                  <Badge key={index} bg="outline-secondary" className="text-dark">
                    #{tag}
                  </Badge>
                ))}
                {question.isResolved && (
                  <Badge bg="success">
                    <i className="fas fa-check me-1"></i>Çözüldü
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-end">
              <div className="text-muted small mb-1">
                <i className="fas fa-eye me-1"></i>{question.views} görüntülenme
              </div>
              <div className="text-muted small">
                <i className="fas fa-comments me-1"></i>{question.answers.length} cevap
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="lead">{question.content}</p>
          </div>
          
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted">
              <i className="fas fa-user me-1"></i>
              <strong>{question.author?.username}</strong> • {formatDate(question.createdAt)}
            </div>
            {user && user._id !== question.author._id && (
              <Button 
                variant="primary"
                onClick={() => setShowAnswerModal(true)}
                className="btn-custom"
              >
                <i className="fas fa-reply me-2"></i>Cevap Ver
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Cevaplar */}
      <div className="mb-4">
        <h3 className="mb-3">
          <i className="fas fa-comments me-2"></i>
          Cevaplar ({question.answers.length})
        </h3>
        
        {question.answers.length === 0 ? (
          <Card>
            <Card.Body className="text-center py-5">
              <i className="fas fa-comment-slash fa-3x text-muted mb-3"></i>
              <h4 className="text-muted">Henüz cevap yok</h4>
              <p className="text-muted">İlk cevabı siz verin!</p>
              {user && user._id !== question.author._id && (
                <Button 
                  variant="primary" 
                  onClick={() => setShowAnswerModal(true)}
                  className="btn-custom"
                >
                  <i className="fas fa-reply me-2"></i>Cevap Ver
                </Button>
              )}
            </Card.Body>
          </Card>
        ) : (
          question.answers.map((answer, answerIndex) => (
            <Card key={answerIndex} className="mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-2">
                      <strong className="me-2">{answer.author?.username}</strong>
                      <small className="text-muted">{formatDate(answer.createdAt)}</small>
                      {answer.isAccepted && (
                        <Badge bg="success" className="ms-2">
                          <i className="fas fa-check me-1"></i>Kabul Edildi
                        </Badge>
                      )}
                    </div>
                    <p className="mb-0">{answer.content}</p>
                  </div>
                  {user && user._id === question.author._id && !answer.isAccepted && (
                    <Button 
                      variant="outline-success" 
                      size="sm"
                      onClick={() => handleAcceptAnswer(answer._id)}
                    >
                      <i className="fas fa-check me-1"></i>Kabul Et
                    </Button>
                  )}
                </div>
                
                {/* Yanıtlar */}
                {answer.replies && answer.replies.length > 0 && (
                  <div className="border-top pt-3 mt-3">
                    <h6 className="mb-3 text-info">
                      <i className="fas fa-reply me-2"></i>Yanıtlar ({answer.replies.length})
                    </h6>
                    {answer.replies.map((reply, replyIndex) => (
                      <div key={replyIndex} className="mb-3 p-3 bg-light rounded border-start border-3 border-info">
                        <div className="d-flex align-items-center mb-2">
                          <strong className="me-2 text-info">{reply.author?.username}</strong>
                          <small className="text-muted">{formatDate(reply.createdAt)}</small>
                        </div>
                        <p className="mb-0">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Yanıt Verme Butonu */}
                {user && user._id === question.author._id && (
                  <div className="mt-3">
                    <Button 
                      variant="outline-info" 
                      size="sm"
                      onClick={() => {
                        setSelectedAnswer(answer);
                        setShowReplyModal(true);
                      }}
                    >
                      <i className="fas fa-reply me-1"></i>Yanıt Ver
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          ))
        )}
      </div>

      {/* Cevap Verme Modal */}
      <Modal show={showAnswerModal} onHide={() => setShowAnswerModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-reply me-2"></i>Cevap Ver
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAnswerQuestion}>
          <Modal.Body>
            <div className="mb-3">
              <h6>Soru:</h6>
              <div className="p-3 bg-light rounded">
                <p className="mb-0">{question.title}</p>
              </div>
            </div>
            
            <Form.Group className="mb-3">
              <Form.Label>Cevabınız</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                placeholder="Cevabınızı detaylı bir şekilde yazın..."
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

      {/* Yanıt Verme Modal */}
      <Modal show={showReplyModal} onHide={() => setShowReplyModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-reply me-2"></i>Cevaba Yanıt Ver
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleReplyToAnswer}>
          <Modal.Body>
            {selectedAnswer && (
              <div className="mb-3">
                <h6>Cevap:</h6>
                <div className="p-3 bg-light rounded">
                  <div className="d-flex align-items-center mb-2">
                    <strong className="me-2">{selectedAnswer.author?.username}</strong>
                    <small className="text-muted">{formatDate(selectedAnswer.createdAt)}</small>
                  </div>
                  <p className="mb-0">{selectedAnswer.content}</p>
                </div>
              </div>
            )}
            
            <Form.Group className="mb-3">
              <Form.Label>Yanıtınız</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Yanıtınızı yazın..."
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowReplyModal(false)}>
              İptal
            </Button>
            <Button variant="primary" type="submit" className="btn-custom">
              <i className="fas fa-paper-plane me-2"></i>Yanıt Gönder
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default QuestionDetailPage;
