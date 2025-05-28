import React, { useState, useEffect } from 'react';
import { Card, Button, Form, InputGroup, Badge, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import AddQuestionForm from './AddQuestionForm';

const QuestionList = () => {
  const { currentUser } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [sortBy]);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/questions?sort=${sortBy}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(response.data.questions);
      setLoading(false);
    } catch (err) {
      setError('Sorular yüklenirken bir hata oluştu.');
      setLoading(false);
    }
  };

  const handleQuestionAdded = () => {
    setShowAddForm(false);
    fetchQuestions();
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || question.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Başlık ve Filtreler */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Sorular</h4>
        {currentUser && (
          <Button 
            variant="primary" 
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <i className="fas fa-plus me-1"></i>
            {showAddForm ? 'İptal' : 'Yeni Soru'}
          </Button>
        )}
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Soru Ekleme Formu */}
      {showAddForm && (
        <AddQuestionForm onQuestionAdded={handleQuestionAdded} />
      )}

      {/* Filtreler */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-3">
          <div className="row g-3">
            <div className="col-md-6">
              <InputGroup>
                <InputGroup.Text>
                  <i className="fas fa-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Sorularda ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </div>
            <div className="col-md-3">
              <Form.Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Tüm Kategoriler</option>
                <option value="matematik">Matematik</option>
                <option value="fizik">Fizik</option>
                <option value="kimya">Kimya</option>
                <option value="biyoloji">Biyoloji</option>
                <option value="turkce">Türkçe</option>
                <option value="ingilizce">İngilizce</option>
                <option value="tarih">Tarih</option>
                <option value="cografya">Coğrafya</option>
                <option value="diger">Diğer</option>
              </Form.Select>
            </div>
            <div className="col-md-3">
              <Form.Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">En Yeni</option>
                <option value="oldest">En Eski</option>
                <option value="mostAnswers">En Çok Cevaplanan</option>
                <option value="mostHelpful">En Faydalı</option>
              </Form.Select>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Soru Listesi */}
      {filteredQuestions.length === 0 ? (
        <Alert variant="info" className="text-center">
          <i className="fas fa-info-circle me-2"></i>
          {searchTerm || selectedCategory ? 'Arama kriterlerinize uygun soru bulunamadı.' : 'Henüz soru bulunmuyor.'}
        </Alert>
      ) : (
        filteredQuestions.map(question => (
          <Card key={question._id} className="border-0 shadow-sm mb-3">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <Link 
                    to={`/questions/${question._id}`}
                    className="text-decoration-none text-dark"
                  >
                    <h5 className="mb-2">{question.title}</h5>
                  </Link>
                  <div className="d-flex gap-2 mb-3">
                    <Badge bg="primary">{question.category}</Badge>
                    <Badge bg="secondary">
                      <i className="fas fa-clock me-1"></i>
                      {new Date(question.createdAt).toLocaleDateString('tr-TR')}
                    </Badge>
                    <Badge bg="info">
                      <i className="fas fa-comments me-1"></i>
                      {question.answers?.length || 0} cevap
                    </Badge>
                  </div>
                  <p className="text-muted mb-0">
                    {question.content.length > 200 
                      ? question.content.substring(0, 200) + '...' 
                      : question.content}
                  </p>
                </div>
                <div className="text-end ms-3">
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
            </Card.Body>
          </Card>
        ))
      )}
    </div>
  );
};

export default QuestionList; 