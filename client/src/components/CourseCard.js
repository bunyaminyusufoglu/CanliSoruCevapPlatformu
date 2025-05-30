import React, { useState } from 'react';
import { Card, Button, Form, ListGroup, Modal, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const CourseCard = ({ course, onCourseUpdated, onCourseDeleted }) => {
  const [newComment, setNewComment] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: course.title,
    description: course.description,
    videoFile: null,
    pdfFile: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await axios.post('/api/courses/comment', {
        courseId: course._id,
        content: newComment,
        userId: user._id
      });

      if (response.data.success) {
        setNewComment('');
        onCourseUpdated && onCourseUpdated();
      }
    } catch (error) {
      console.error('Yorum eklenirken hata oluştu:', error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', editForm.title);
      formData.append('description', editForm.description);
      if (editForm.videoFile) {
        formData.append('video', editForm.videoFile);
      }
      if (editForm.pdfFile) {
        formData.append('pdf', editForm.pdfFile);
      }

      const response = await axios.put(`/api/courses/${course._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setSuccess('Ders başarıyla güncellendi!');
        setShowEditModal(false);
        onCourseUpdated && onCourseUpdated();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Ders güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`/api/courses/${course._id}`);
      if (response.data.success) {
        onCourseDeleted && onCourseDeleted(course._id);
      }
    } catch (error) {
      setError('Ders silinirken bir hata oluştu');
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    
    // Dosya boyutu kontrolü (100MB)
    if (file && file.size > 100 * 1024 * 1024) {
      setError('Dosya boyutu 100MB\'dan küçük olmalıdır');
      return;
    }

    // Dosya türü kontrolü
    if (name === 'videoFile' && !file.type.startsWith('video/')) {
      setError('Lütfen geçerli bir video dosyası seçin');
      return;
    }
    if (name === 'pdfFile' && file.type !== 'application/pdf') {
      setError('Lütfen geçerli bir PDF dosyası seçin');
      return;
    }

    setEditForm(prev => ({
      ...prev,
      [name]: file
    }));
    setError('');
  };

  return (
    <>
      <Card className="h-100 border-0 shadow-lg hover-lift transition-all">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <Card.Title className="h4 fw-bold mb-3 text-primary">{course.title}</Card.Title>
              <Card.Text className="text-muted fs-5">{course.description}</Card.Text>
            </div>
            {user?.isAdmin && (
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  className="rounded-pill px-3"
                  onClick={() => setShowEditModal(true)}
                >
                  <i className="bi bi-pencil me-1"></i>
                  Düzenle
                </Button>
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  className="rounded-pill px-3"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <i className="bi bi-trash me-1"></i>
                  Sil
                </Button>
              </div>
            )}
          </div>
          
          {course.videoUrl && (
            <div className="mb-4 rounded-3 overflow-hidden">
              <video controls className="w-100 shadow-sm">
                <source src={course.videoUrl} type="video/mp4" />
                Tarayıcınız video etiketini desteklemiyor.
              </video>
            </div>
          )}
          
          {course.pdfUrl && (
            <Button 
              variant="primary" 
              href={course.pdfUrl} 
              target="_blank"
              className="mb-4 rounded-pill px-4 py-2 shadow-sm"
            >
              <i className="bi bi-file-pdf me-2"></i>
              PDF'i Görüntüle
            </Button>
          )}

          <Card.Subtitle className="mb-3 text-muted d-flex align-items-center">
            <i className="bi bi-chat-dots me-2"></i>
            Yorumlar ({course.comments?.length || 0})
          </Card.Subtitle>

          <ListGroup className="mb-4 rounded-3 shadow-sm">
            {course.comments?.map((comment) => (
              <ListGroup.Item key={comment._id} className="border-0 py-3">
                <div className="d-flex align-items-start">
                  <div className="flex-shrink-0">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                      <i className="bi bi-person text-primary"></i>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <div className="fw-bold mb-1">{comment.user?.username || 'Anonim'}</div>
                    <div className="text-muted">{comment.content}</div>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>

          {user && (
            <Form onSubmit={handleCommentSubmit} className="bg-light p-3 rounded-3">
              <Form.Group className="mb-3">
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Yorum ekle..."
                  className="border-0 shadow-sm"
                />
              </Form.Group>
              <Button 
                variant="primary" 
                type="submit"
                className="rounded-pill px-4 py-2 shadow-sm"
              >
                <i className="bi bi-send me-2"></i>
                Yorum Ekle
              </Button>
            </Form>
          )}
        </Card.Body>
      </Card>

      {/* Düzenleme Modalı */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="h4 fw-bold text-primary">
            <i className="bi bi-pencil-square me-2"></i>
            Dersi Düzenle
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {error && (
            <Alert variant="danger" className="rounded-3 shadow-sm">
              <i className="bi bi-exclamation-circle me-2"></i>
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" className="rounded-3 shadow-sm">
              <i className="bi bi-check-circle me-2"></i>
              {success}
            </Alert>
          )}
          
          <Form onSubmit={handleEditSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Ders Başlığı</Form.Label>
              <Form.Control
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                required
                className="rounded-3 shadow-sm"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Açıklama</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                required
                className="rounded-3 shadow-sm"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold d-flex align-items-center">
                <i className="bi bi-camera-video me-2"></i>
                Video Dosyası (İsteğe Bağlı)
              </Form.Label>
              <Form.Control
                type="file"
                name="videoFile"
                onChange={handleFileChange}
                accept="video/*"
                className="rounded-3 shadow-sm"
              />
              <Form.Text className="text-muted mt-2">
                <i className="bi bi-info-circle me-1"></i>
                Maksimum dosya boyutu: 100MB
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold d-flex align-items-center">
                <i className="bi bi-file-pdf me-2"></i>
                PDF Dosyası (İsteğe Bağlı)
              </Form.Label>
              <Form.Control
                type="file"
                name="pdfFile"
                onChange={handleFileChange}
                accept=".pdf"
                className="rounded-3 shadow-sm"
              />
              <Form.Text className="text-muted mt-2">
                <i className="bi bi-info-circle me-1"></i>
                Maksimum dosya boyutu: 100MB
              </Form.Text>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button 
                variant="outline-secondary" 
                onClick={() => setShowEditModal(false)}
                className="rounded-pill px-4"
              >
                İptal
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading}
                className="rounded-pill px-4"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-2"></i>
                    Kaydet
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Silme Modalı */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="h4 fw-bold text-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Dersi Sil
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <p className="mb-4">Bu dersi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
          <div className="d-flex justify-content-end gap-2">
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowDeleteModal(false)}
              className="rounded-pill px-4"
            >
              İptal
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDelete}
              className="rounded-pill px-4"
            >
              <i className="bi bi-trash me-2"></i>
              Sil
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <style jsx>{`
        .hover-lift {
          transition: transform 0.2s ease-in-out;
        }
        .hover-lift:hover {
          transform: translateY(-5px);
        }
        .transition-all {
          transition: all 0.3s ease-in-out;
        }
      `}</style>
    </>
  );
};

export default CourseCard; 