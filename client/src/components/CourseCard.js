import React, { useState } from 'react';
import { Card, Button, Form, ListGroup, Modal, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { addCourseComment, updateCourseWithFiles, deleteCourse } from '../api';

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
      const response = await addCourseComment({
        courseId: course._id,
        content: newComment
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

      const response = await updateCourseWithFiles(course._id, formData);

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
      const response = await deleteCourse(course._id);
      if (response.data.success) {
        onCourseDeleted && onCourseDeleted(course._id);
      } else if (response.data.message) {
        setError(response.data.message);
      }
    } catch (error) {
      const msg = error?.response?.data?.message || 'Ders silinirken bir hata oluştu';
      setError(msg);
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
      <Card className="mb-4 course-card card-hover">
        {course.thumbnail && (
          <Card.Img variant="top" src={course.thumbnail} alt={course.title} className="course-thumb" />
        )}
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <Card.Title className="mb-1">{course.title}</Card.Title>
              <Card.Text className="text-muted">{course.description}</Card.Text>
            </div>
            {user?.isAdmin && (
              <div>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  className="me-2"
                  onClick={() => setShowEditModal(true)}
                >
                  Düzenle
                </Button>
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Sil
                </Button>
              </div>
            )}
          </div>
          
          {course.videoUrl && (
            <div className="mb-3 course-video">
              <video controls className="w-100" style={{display: 'block'}}>
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
              className="mb-3 btn-custom"
            >
              PDF'i Görüntüle
            </Button>
          )}

          <Card.Subtitle className="mb-2 text-muted">
            Yorumlar ({course.comments?.length || 0})
          </Card.Subtitle>

          <ListGroup className="mb-3">
            {course.comments?.map((comment) => (
              <ListGroup.Item key={comment._id}>
                <strong>{comment.user?.username || 'Anonim'}:</strong> {comment.content}
              </ListGroup.Item>
            ))}
          </ListGroup>

          {user && (
            <Form onSubmit={handleCommentSubmit}>
              <Form.Group className="mb-3">
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Yorum ekle..."
                />
              </Form.Group>
              <Button variant="primary" type="submit">
                Yorum Ekle
              </Button>
            </Form>
          )}
        </Card.Body>
      </Card>

      {/* Düzenleme Modalı */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Dersi Düzenle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form onSubmit={handleEditSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Ders Başlığı</Form.Label>
              <Form.Control
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Açıklama</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
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
              />
              <Form.Text className="text-muted">
                Maksimum dosya boyutu: 100MB
              </Form.Text>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                İptal
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Güncelleniyor...' : 'Güncelle'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Silme Onay Modalı */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Dersi Sil</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bu dersi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
          {error && <Alert variant="danger">{error}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            İptal
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Sil
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CourseCard; 