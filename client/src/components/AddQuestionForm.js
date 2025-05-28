import React, { useState } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const AddQuestionForm = ({ onQuestionAdded }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/questions', formData, {
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setSuccess('Soru başarıyla eklendi!');
        setFormData({
          title: '',
          content: '',
          category: ''
        });
        
        // Kullanıcının soru sayısını artır
        await axios.post(`http://localhost:5000/api/users/increment-question/${currentUser._id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });

        onQuestionAdded && onQuestionAdded();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Soru eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Body className="p-4">
        <h5 className="mb-4">Yeni Soru Sor</h5>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Soru Başlığı</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Soru başlığını girin"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Kategori</Form.Label>
            <Form.Select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Kategori seçin</option>
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
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Soru İçeriği</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Sorunuzu detaylı bir şekilde açıklayın"
              required
            />
          </Form.Group>

          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              <i className="fas fa-info-circle me-1"></i>
              Soru sorduğunuzda 5 puan kazanırsınız
            </small>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Soru Ekleniyor...' : 'Soru Sor'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default AddQuestionForm; 