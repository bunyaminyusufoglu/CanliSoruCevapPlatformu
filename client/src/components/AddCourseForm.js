import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { createCourse, adminListUsers } from '../api';
import { io } from 'socket.io-client';

const AddCourseForm = ({ onCourseAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoFile: null,
    pdfFile: null
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

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      if (formData.videoFile) {
        formDataToSend.append('video', formData.videoFile);
      }
      if (formData.pdfFile) {
        formDataToSend.append('pdf', formData.pdfFile);
      }

      const response = await createCourse(formDataToSend);

      if (response.data.success) {
        setSuccess('Ders başarıyla eklendi!');

        // Bildirimleri tetikle: tüm admin olmayan kullanıcılara "Yeni Ders" bildirimi gönder
        try {
          const usersRes = await adminListUsers();
          const users = usersRes?.data?.users || [];
          const recipients = users.filter(u => !u.isAdmin).map(u => u._id);
          if (recipients.length > 0) {
            const socket = io(process.env.REACT_APP_SOCKET_URL || '/');
            socket.emit('newCourse', {
              course: response.data.course,
              recipients
            });
            // kısa süre sonra bağlantıyı kapat
            setTimeout(() => {
              socket.disconnect();
            }, 500);
          }
        } catch (notifyErr) {
          // Bildirim hatası uygulamayı bozmasın, sadece logla
          console.error('Ders bildirimi gönderilemedi:', notifyErr);
        }

        setFormData({
          title: '',
          description: '',
          videoFile: null,
          pdfFile: null
        });
        onCourseAdded && onCourseAdded();
      }
    } catch (error) {
      const data = error.response?.data;
      const serverMsg = typeof data === 'string' 
        ? data 
        : (data?.message || data?.error);
      setError(serverMsg || error.message || 'Ders eklenirken bir hata oluştu');
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
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Video Dosyası (İsteğe Bağlı)</Form.Label>
        <Form.Control
          type="file"
          name="videoFile"
          onChange={handleFileChange}
          accept="video/*"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>PDF Dosyası (İsteğe Bağlı)</Form.Label>
        <Form.Control
          type="file"
          name="pdfFile"
          onChange={handleFileChange}
          accept=".pdf"
        />
      </Form.Group>

      <Button variant="primary" type="submit" disabled={loading}>
        {loading ? 'Ders Ekleniyor...' : 'Ders Ekle'}
      </Button>
    </Form>
  );
};

export default AddCourseForm; 