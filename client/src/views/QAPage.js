import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Alert, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getQuestions, createQuestion, addAnswer, addReplyToAnswer, acceptAnswer } from '../api';
import ImageUpload from '../components/ImageUpload';

const QAPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAskModal, setShowAskModal] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '', category: 'genel', tags: '', images: [] });
  const [newAnswer, setNewAnswer] = useState('');
  const [answerImages, setAnswerImages] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [replyImages, setReplyImages] = useState([]);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory !== 'all') params.category = selectedCategory;
      
      const response = await getQuestions(params);
      if (response.data.success) {
        setQuestions(response.data.questions);
      }
    } catch (error) {
      setError('Sorular yüklenirken bir hata oluştu');
      console.error('Sorular yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    try {
      const tags = newQuestion.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      const response = await createQuestion({
        ...newQuestion,
        tags
      });
      
      if (response.data.success) {
        setShowAskModal(false);
        setNewQuestion({ title: '', content: '', category: 'genel', tags: '', images: [] });
        fetchQuestions();
      }
    } catch (error) {
      setError('Soru gönderilirken bir hata oluştu');
      console.error('Soru gönderilirken hata:', error);
    }
  };

  const handleQuestionImageUpload = (uploadData) => {
    setNewQuestion({
      ...newQuestion,
      images: [...newQuestion.images, uploadData.url]
    });
  };

  const removeQuestionImage = (index) => {
    setNewQuestion({
      ...newQuestion,
      images: newQuestion.images.filter((_, i) => i !== index)
    });
  };

  const handleAnswerQuestion = async (e) => {
    e.preventDefault();
    try {
      const response = await addAnswer(selectedQuestion._id, {
        content: newAnswer,
        images: answerImages
      });
      
      if (response.data.success) {
        setShowAnswerModal(false);
        setNewAnswer('');
        setAnswerImages([]);
        setSelectedQuestion(null);
        fetchQuestions();
      }
    } catch (error) {
      setError('Cevap gönderilirken bir hata oluştu');
      console.error('Cevap gönderilirken hata:', error);
    }
  };

  const handleAnswerImageUpload = (uploadData) => {
    setAnswerImages([...answerImages, uploadData.url]);
  };

  const removeAnswerImage = (index) => {
    setAnswerImages(answerImages.filter((_, i) => i !== index));
  };

  const handleReplyToAnswer = async (e) => {
    e.preventDefault();
    try {
      const response = await addReplyToAnswer(selectedQuestion._id, selectedAnswer._id, {
        content: newReply,
        images: replyImages
      });
      
      if (response.data.success) {
        setShowReplyModal(false);
        setNewReply('');
        setReplyImages([]);
        setSelectedAnswer(null);
        setSelectedQuestion(null);
        fetchQuestions();
      }
    } catch (error) {
      setError('Yanıt gönderilirken bir hata oluştu');
      console.error('Yanıt gönderilirken hata:', error);
    }
  };

  const handleReplyImageUpload = (uploadData) => {
    setReplyImages([...replyImages, uploadData.url]);
  };

  const removeReplyImage = (index) => {
    setReplyImages(replyImages.filter((_, i) => i !== index));
  };

  const handleAcceptAnswer = async (questionId, answerId) => {
    try {
      const response = await acceptAnswer(questionId, answerId);
      if (response.data.success) {
        fetchQuestions();
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
                        <Link 
                          to={`/questions/${question._id}`} 
                          className="text-decoration-none text-dark"
                        >
                          {question.title}
                        </Link>
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
                  
                  {/* Soruda resim varsa göster */}
                  {question.images && question.images.length > 0 && (
                    <div className="d-flex gap-2 mb-3 flex-wrap">
                      {question.images.slice(0, 3).map((img, idx) => (
                        <img 
                          key={idx}
                          src={img} 
                          alt={`Question attachment ${idx + 1}`}
                          style={{
                            width: '100px',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid #dee2e6'
                          }}
                        />
                      ))}
                      {question.images.length > 3 && (
                        <div 
                          style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '8px',
                            border: '1px solid #dee2e6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#f8f9fa'
                          }}
                        >
                          <span className="text-muted">+{question.images.length - 3}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="d-flex justify-content-between align-items-center mb-3">
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
                      {user && user._id !== question.author._id && (
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

                  {/* Cevaplar */}
                  {question.answers && question.answers.length > 0 && (
                    <div className="border-top pt-3">
                      <h6 className="mb-3">
                        <i className="fas fa-comments me-2"></i>
                        Cevaplar ({question.answers.length})
                      </h6>
                      {question.answers.map((answer, answerIndex) => (
                        <div key={answerIndex} className="mb-3 p-3 bg-light rounded">
                          <div className="d-flex justify-content-between align-items-start mb-2">
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
                              <p className="mb-2">{answer.content}</p>
                              
                              {/* Cevapda resim varsa göster */}
                              {answer.images && answer.images.length > 0 && (
                                <div className="d-flex gap-2 mb-2 flex-wrap">
                                  {answer.images.map((img, imgIdx) => (
                                    <img 
                                      key={imgIdx}
                                      src={img} 
                                      alt={`Answer attachment ${imgIdx + 1}`}
                                      style={{
                                        maxWidth: '200px',
                                        maxHeight: '150px',
                                        objectFit: 'cover',
                                        borderRadius: '8px',
                                        border: '1px solid #dee2e6',
                                        cursor: 'pointer'
                                      }}
                                      onClick={() => window.open(img, '_blank')}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                            {user && user._id === question.author._id && !answer.isAccepted && (
                              <Button 
                                variant="outline-success" 
                                size="sm"
                                onClick={() => handleAcceptAnswer(question._id, answer._id)}
                              >
                                <i className="fas fa-check me-1"></i>Kabul Et
                              </Button>
                            )}
                          </div>
                          
                          {/* Yanıtlar */}
                          {answer.replies && answer.replies.length > 0 && (
                            <div className="ms-3 mt-2">
                              {answer.replies.map((reply, replyIndex) => (
                                <div key={replyIndex} className="mb-2 p-2 bg-white rounded border-start border-3 border-info">
                                  <div className="d-flex align-items-center mb-1">
                                    <strong className="me-2 text-info">{reply.author?.username}</strong>
                                    <small className="text-muted">{formatDate(reply.createdAt)}</small>
                                  </div>
                                  <p className="mb-0">{reply.content}</p>
                                  
                                  {/* Yanıtta resim varsa göster */}
                                  {reply.images && reply.images.length > 0 && (
                                    <div className="d-flex gap-2 mt-2 flex-wrap">
                                      {reply.images.map((img, rImgIdx) => (
                                        <img 
                                          key={rImgIdx}
                                          src={img} 
                                          alt={`Reply attachment ${rImgIdx + 1}`}
                                          style={{
                                            maxWidth: '150px',
                                            maxHeight: '100px',
                                            objectFit: 'cover',
                                            borderRadius: '8px',
                                            border: '1px solid #dee2e6',
                                            cursor: 'pointer'
                                          }}
                                          onClick={() => window.open(img, '_blank')}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Yanıt Verme Butonu */}
                          {user && user._id === question.author._id && (
                            <Button 
                              variant="outline-info" 
                              size="sm"
                              className="mt-2"
                              onClick={() => {
                                setSelectedQuestion(question);
                                setSelectedAnswer(answer);
                                setShowReplyModal(true);
                              }}
                            >
                              <i className="fas fa-reply me-1"></i>Yanıt Ver
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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

            <Form.Group className="mb-3">
              <Form.Label>
                <i className="fas fa-image me-2"></i>Resimler (opsiyonel)
              </Form.Label>
              <ImageUpload
                endpoint="/api/images/question"
                onUploadSuccess={handleQuestionImageUpload}
                buttonText="Resim Ekle"
                buttonVariant="outline-secondary"
                showPreview={false}
                buttonSize="sm"
              />
              
              {/* Yüklenen resimleri göster */}
              {newQuestion.images.length > 0 && (
                <div className="mt-3">
                  <small className="text-muted d-block mb-2">Yüklenen Resimler:</small>
                  <div className="d-flex gap-2 flex-wrap">
                    {newQuestion.images.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        <img 
                          src={img} 
                          alt={`Upload ${idx + 1}`}
                          style={{
                            width: '100px',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid #dee2e6'
                          }}
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            padding: '2px 6px',
                            fontSize: '10px'
                          }}
                          onClick={() => removeQuestionImage(idx)}
                        >
                          <i className="fas fa-times"></i>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

            <Form.Group className="mb-3">
              <Form.Label>
                <i className="fas fa-image me-2"></i>Resimler (opsiyonel)
              </Form.Label>
              <ImageUpload
                endpoint="/api/images/question"
                onUploadSuccess={handleAnswerImageUpload}
                buttonText="Resim Ekle"
                buttonVariant="outline-secondary"
                showPreview={false}
                buttonSize="sm"
              />
              
              {answerImages.length > 0 && (
                <div className="mt-3">
                  <small className="text-muted d-block mb-2">Yüklenen Resimler:</small>
                  <div className="d-flex gap-2 flex-wrap">
                    {answerImages.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        <img 
                          src={img} 
                          alt={`Upload ${idx + 1}`}
                          style={{
                            width: '100px',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid #dee2e6'
                          }}
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            padding: '2px 6px',
                            fontSize: '10px'
                          }}
                          onClick={() => removeAnswerImage(idx)}
                        >
                          <i className="fas fa-times"></i>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

            <Form.Group className="mb-3">
              <Form.Label>
                <i className="fas fa-image me-2"></i>Resimler (opsiyonel)
              </Form.Label>
              <ImageUpload
                endpoint="/api/images/question"
                onUploadSuccess={handleReplyImageUpload}
                buttonText="Resim Ekle"
                buttonVariant="outline-secondary"
                showPreview={false}
                buttonSize="sm"
              />
              
              {replyImages.length > 0 && (
                <div className="mt-3">
                  <small className="text-muted d-block mb-2">Yüklenen Resimler:</small>
                  <div className="d-flex gap-2 flex-wrap">
                    {replyImages.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        <img 
                          src={img} 
                          alt={`Upload ${idx + 1}`}
                          style={{
                            width: '100px',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid #dee2e6'
                          }}
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            padding: '2px 6px',
                            fontSize: '10px'
                          }}
                          onClick={() => removeReplyImage(idx)}
                        >
                          <i className="fas fa-times"></i>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

export default QAPage;
