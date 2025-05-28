import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Alert, Badge, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  const fetchQuestion = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestion(response.data.question);
      setLoading(false);
    } catch (err) {
      setError('Soru yüklenirken bir hata oluştu.');
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:5000/api/questions/${id}/answers`, {
        content: answer
      }, {
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setAnswer('');
        setSuccess('Cevabınız başarıyla eklendi!');
        
        // Kullanıcının cevap sayısını artır
        await axios.post(`http://localhost:5000/api/users/increment-answer/${currentUser._id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });

        fetchQuestion(); // Soruyu ve cevapları yeniden yükle
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Cevap eklenirken bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkHelpful = async (answerId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:5000/api/questions/${id}/answers/${answerId}/helpful`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Cevap veren kullanıcının faydalı cevap sayısını artır
        await axios.post(`http://localhost:5000/api/users/increment-helpful/${response.data.answer.user}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });

        fetchQuestion(); // Soruyu ve cevapları yeniden yükle
      }
    } catch (err) {
      setError('İşlem sırasında bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!question) {
    return (
      <Alert variant="danger">
        Soru bulunamadı veya erişim izniniz yok.
      </Alert>
    );
  }

  return (
    <div className="container py-4">
      {/* Soru Detayı */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h4 className="mb-2">{question.title}</h4>
              <div className="d-flex gap-2 mb-3">
                <Badge bg="primary">{question.category}</Badge>
                <Badge bg="secondary">
                  <i className="fas fa-clock me-1"></i>
                  {new Date(question.createdAt).toLocaleDateString('tr-TR')}
                </Badge>
              </div>
            </div>
            <div className="text-end">
              <div className="text-muted mb-1">
                <i className="fas fa-user me-1"></i>
                {question.user.username}
              </div>
              <div className="text-muted small">
                <i className="fas fa-star me-1 text-warning"></i>
                {question.user.points} puan
              </div>
            </div>
          </div>

          <Card.Text className="mb-0">{question.content}</Card.Text>
        </Card.Body>
      </Card>

      {/* Cevaplar */}
      <h5 className="mb-4">
        Cevaplar ({question.answers?.length || 0})
      </h5>

      {question.answers?.map((answer) => (
        <Card key={answer._id} className="border-0 shadow-sm mb-3">
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <div className="text-center">
                    <Button
                      variant={answer.isHelpful ? "success" : "outline-success"}
                      size="sm"
                      className="mb-1"
                      onClick={() => handleMarkHelpful(answer._id)}
                      disabled={answer.isHelpful || !currentUser}
                    >
                      <i className="fas fa-thumbs-up"></i>
                    </Button>
                    <div className="small text-muted">
                      {answer.helpfulCount || 0}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="fw-bold mb-1">{answer.user.username}</div>
                  <div className="text-muted small">
                    <i className="fas fa-star me-1 text-warning"></i>
                    {answer.user.points} puan
                  </div>
                </div>
              </div>
              <div className="text-muted small">
                {new Date(answer.createdAt).toLocaleDateString('tr-TR')}
              </div>
            </div>
            <Card.Text>{answer.content}</Card.Text>
            {answer.isHelpful && (
              <Badge bg="success" className="mt-2">
                <i className="fas fa-check-circle me-1"></i>
                Faydalı Cevap
              </Badge>
            )}
          </Card.Body>
        </Card>
      ))}

      {/* Cevap Formu */}
      {currentUser && (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4">
            <h5 className="mb-4">Cevap Yaz</h5>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleAnswerSubmit}>
              <Form.Group className="mb-3">
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Cevabınızı yazın..."
                  required
                />
              </Form.Group>

              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  Cevap verdiğinizde 2 puan kazanırsınız
                </small>
                <Button variant="primary" type="submit" disabled={submitting}>
                  {submitting ? 'Gönderiliyor...' : 'Cevap Gönder'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default QuestionDetail; 