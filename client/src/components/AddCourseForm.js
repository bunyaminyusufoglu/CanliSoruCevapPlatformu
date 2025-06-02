import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const AddCourseForm = ({ onCourseAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    duration: '',
    videoFile: null,
    pdfFile: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'matematik', label: 'Matematik' },
    { value: 'fizik', label: 'Fizik' },
    { value: 'kimya', label: 'Kimya' },
    { value: 'biyoloji', label: 'Biyoloji' },
    { value: 'turkce', label: 'Türkçe' },
    { value: 'ingilizce', label: 'İngilizce' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('duration', formData.duration);
      if (formData.videoFile) {
        formDataToSend.append('video', formData.videoFile);
      }
      if (formData.pdfFile) {
        formDataToSend.append('pdf', formData.pdfFile);
      }

      const response = await axios.post('/api/courses', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data) {
        setSuccess('Ders başarıyla eklendi!');
        setFormData({
          title: '',
          description: '',
          category: '',
          duration: '',
          videoFile: null,
          pdfFile: null
        });
        e.target.reset();
        if (onCourseAdded) {
          await onCourseAdded();
        }
      }
    } catch (error) {
      console.error('Ders ekleme hatası:', error);
      setError(error.response?.data?.error || 'Ders eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="mb-4">
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form.Group className="mb-3">
        <Form.Label>Ders Başlığı</Form.Label>
        <Form.Control
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
          className="rounded-3 shadow-sm"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Kategori</Form.Label>
        <Form.Select
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          required
          className="rounded-3 shadow-sm"
        >
          <option value="">Kategori Seçin</option>
          {categories.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Süre (Örn: 2 saat, 45 dakika)</Form.Label>
        <Form.Control
          type="text"
          name="duration"
          value={formData.duration}
          onChange={handleInputChange}
          required
          placeholder="Örn: 2 saat"
          className="rounded-3 shadow-sm"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Açıklama</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
          className="rounded-3 shadow-sm"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Video Dosyası (İsteğe Bağlı)</Form.Label>
        <Form.Control
          type="file"
          name="videoFile"
          onChange={handleFileChange}
          accept="video/*"
          className="rounded-3 shadow-sm"
        />
        <Form.Text className="text-muted">
          Maksimum dosya boyutu: 100MB
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>PDF Dosyası (İsteğe Bağlı)</Form.Label>
        <Form.Control
          type="file"
          name="pdfFile"
          onChange={handleFileChange}
          accept=".pdf"
          className="rounded-3 shadow-sm"
        />
        <Form.Text className="text-muted">
          Maksimum dosya boyutu: 100MB
        </Form.Text>
      </Form.Group>

      <Button 
        variant="primary" 
        type="submit" 
        disabled={loading}
        className="rounded-pill px-4 py-2 shadow-sm"
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Ders Ekleniyor...
          </>
        ) : (
          <>
            <i className="bi bi-plus-circle me-2"></i>
            Ders Ekle
          </>
        )}
      </Button>
    </Form>
  );
};

export default AddCourseForm; 