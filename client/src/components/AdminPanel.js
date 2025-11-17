// src/components/AdminPanel.js
import React, { useEffect, useMemo, useState } from 'react';
import { Tab, Nav, Card, Table, Button, Form, InputGroup, Modal, Badge } from 'react-bootstrap';
import { adminListUsers, adminToggleUserAdmin, adminDeleteUser, adminListCourses, adminUpdateCourse, adminDeleteCourse, adminListQuestions, adminDeleteQuestion } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { io } from 'socket.io-client';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [usersFilter, setUsersFilter] = useState('');
  const [courses, setCourses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [editCourse, setEditCourse] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageTarget, setMessageTarget] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const { user: currentUser } = useAuth();

  const adminCount = useMemo(() => users.filter(u => u.isAdmin).length, [users]);
  const openQuestionsCount = useMemo(() => questions.filter(q => !q.isResolved).length, [questions]);

  const filteredUsers = useMemo(() => {
    const q = usersFilter.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u =>
      (u.username || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.ad || '').toLowerCase().includes(q) ||
      (u.soyad || '').toLowerCase().includes(q)
    );
  }, [users, usersFilter]);

  const refreshAll = async () => {
    await Promise.all([loadUsers(), loadCourses(), loadQuestions()]);
    setSuccess('Veriler yenilendi');
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    setError('');
    try {
      const res = await adminListUsers();
      if (res.data?.success) setUsers(res.data.users || []);
    } catch (e) {
      setError(e.response?.data?.error || 'Kullanıcılar yüklenemedi');
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadCourses = async () => {
    setLoadingCourses(true);
    setError('');
    try {
      const res = await adminListCourses();
      if (res.data?.success) setCourses(res.data.courses || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Dersler yüklenemedi');
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadQuestions = async () => {
    setLoadingQuestions(true);
    setError('');
    try {
      const res = await adminListQuestions();
      if (res.data?.success) setQuestions(res.data.questions || []);
    } catch (e) {
      setError(e.response?.data?.error || 'Sorular yüklenemedi');
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadCourses();
    loadQuestions();
  }, []);

  const handleToggleAdmin = async (userId) => {
    setError(''); setSuccess('');
    try {
      const res = await adminToggleUserAdmin(userId);
      if (res.data?.success) {
        setUsers(prev => prev.map(u => u._id === userId ? res.data.user : u));
        setSuccess('Kullanıcı yetkisi güncellendi');
      }
    } catch (e) {
      setError(e.response?.data?.error || 'Yetki güncellenemedi');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Kullanıcı silinsin mi?')) return;
    setError(''); setSuccess('');
    try {
      const res = await adminDeleteUser(userId);
      if (res.data?.success) {
        setUsers(prev => prev.filter(u => u._id !== userId));
        setSuccess('Kullanıcı silindi');
      }
    } catch (e) {
      setError(e.response?.data?.error || 'Kullanıcı silinemedi');
    }
  };

  const handleSaveCourse = async () => {
    if (!editCourse) return;
    setError(''); setSuccess('');
    try {
      const res = await adminUpdateCourse(editCourse._id, { title: editCourse.title, description: editCourse.description });
      if (res.data?.success) {
        setCourses(prev => prev.map(c => c._id === editCourse._id ? res.data.course : c));
        setEditCourse(null);
        setSuccess('Ders güncellendi');
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Ders güncellenemedi');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Ders silinsin mi?')) return;
    setError(''); setSuccess('');
    try {
      const res = await adminDeleteCourse(courseId);
      if (res.data?.success) {
        setCourses(prev => prev.filter(c => c._id !== courseId));
        setSuccess('Ders silindi');
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Ders silinemedi');
    }
  };

  const openMessageModal = (targetUser) => {
    setMessageTarget(targetUser);
    setMessageText('');
    setShowMessageModal(true);
  };

  const handleSendMessage = async () => {
    if (!messageTarget?._id || !messageText.trim()) return;
    setSendingMessage(true);
    setError(''); setSuccess('');
    try {
      const socket = io(process.env.REACT_APP_SOCKET_URL || '/');
      socket.emit('newMessage', {
        recipientId: messageTarget._id,
        senderId: currentUser?._id,
        senderName: currentUser?.username || 'Admin',
        message: messageText.trim()
      });
      setSuccess('Mesaj gönderildi');
      setShowMessageModal(false);
      setMessageText('');
      setMessageTarget(null);
      setTimeout(() => socket.disconnect(), 500);
    } catch (e) {
      setError('Mesaj gönderilemedi');
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="container mt-4 admin-panel">
      <div className="admin-hero card border-0 shadow-sm mb-4">
        <div className="card-body d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between">
          <div className="mb-3 mb-md-0">
            <h2 className="mb-1 text-white">Yönetim Paneli</h2>
            <p className="mb-0 text-white-50">Sisteminizi yönetin, kullanıcıları ve içerikleri kolayca kontrol edin.</p>
          </div>
          <div className="d-flex gap-2">
            <Button size="sm" variant="light" onClick={refreshAll}>
              <i className="fas fa-rotate me-2"></i>Tümünü Yenile
            </Button>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card stat-card card-hover">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small">Toplam Kullanıcı</div>
                <div className="h4 mb-0">{users.length}</div>
              </div>
              <div className="icon-badge bg-primary-subtle text-primary">
                <i className="fas fa-users"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card stat-card card-hover">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small">Admin</div>
                <div className="h4 mb-0">{adminCount}</div>
              </div>
              <div className="icon-badge bg-warning-subtle text-warning">
                <i className="fas fa-user-shield"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card stat-card card-hover">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small">Dersler</div>
                <div className="h4 mb-0">{courses.length}</div>
              </div>
              <div className="icon-badge bg-success-subtle text-success">
                <i className="fas fa-book"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card stat-card card-hover">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small">Açık Sorular</div>
                <div className="h4 mb-0">{openQuestionsCount}</div>
              </div>
              <div className="icon-badge bg-danger-subtle text-danger">
                <i className="fas fa-question-circle"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}
      {success && (
        <div className="alert alert-success">{success}</div>
      )}

      <Tab.Container defaultActiveKey="users">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="users"><i className="fas fa-users me-2"></i>Kullanıcılar</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="courses"><i className="fas fa-book me-2"></i>Dersler</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="questions"><i className="fas fa-question-circle me-2"></i>Sorular</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="users">
            <Card className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <div>
                  <i className="fas fa-users me-2"></i>
                  Kullanıcılar
                  <Badge bg="secondary" className="ms-2">{users.length}</Badge>
                </div>
                <Button size="sm" variant="outline-primary" onClick={loadUsers} disabled={loadingUsers}>
                  Yenile
                </Button>
              </Card.Header>
              <Card.Body>
                <InputGroup className="mb-3">
                  <InputGroup.Text><i className="fas fa-search"></i></InputGroup.Text>
                  <Form.Control placeholder="Ara (ad, soyad, kullanıcı adı, email)" value={usersFilter} onChange={e => setUsersFilter(e.target.value)} />
                </InputGroup>

                <Table hover responsive className="align-middle">
                  <thead>
                    <tr>
                      <th>Ad Soyad</th>
                      <th>Kullanıcı Adı</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u._id}>
                        <td>{u.ad} {u.soyad}</td>
                        <td>{u.username}</td>
                        <td>{u.email}</td>
                        <td>
                          {u.isAdmin ? <Badge bg="warning" text="dark">Admin</Badge> : <Badge bg="secondary">Kullanıcı</Badge>}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button size="sm" variant="outline-warning" onClick={() => handleToggleAdmin(u._id)}>
                              {u.isAdmin ? 'Adminliği Al' : 'Admin Yap'}
                            </Button>
                            <Button size="sm" variant="outline-primary" onClick={() => openMessageModal(u)}>
                              Mesaj Gönder
                            </Button>
                            <Button size="sm" variant="outline-danger" onClick={() => handleDeleteUser(u._id)}>
                              Sil
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan={5} className="text-center text-muted">Kayıt bulunamadı</td></tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab.Pane>

          <Tab.Pane eventKey="courses">
            <Card className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <div>
                  <i className="fas fa-book me-2"></i>
                  Dersler
                  <Badge bg="secondary" className="ms-2">{courses.length}</Badge>
                </div>
                <Button size="sm" variant="outline-primary" onClick={loadCourses} disabled={loadingCourses}>
                  Yenile
                </Button>
              </Card.Header>
              <Card.Body>
                <Table hover responsive className="align-middle">
                  <thead>
                    <tr>
                      <th>Başlık</th>
                      <th>Açıklama</th>
                      <th>Video</th>
                      <th>PDF</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map(c => (
                      <tr key={c._id}>
                        <td>{c.title}</td>
                        <td className="text-truncate" style={{maxWidth: 300}}>{c.description}</td>
                        <td>{c.videoUrl ? <a href={c.videoUrl} target="_blank" rel="noreferrer">İzle</a> : '-'}</td>
                        <td>{c.pdfUrl ? <a href={c.pdfUrl} target="_blank" rel="noreferrer">Görüntüle</a> : '-'}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button size="sm" variant="outline-secondary" onClick={() => setEditCourse(c)}>Düzenle</Button>
                            <Button size="sm" variant="outline-danger" onClick={() => handleDeleteCourse(c._id)}>Sil</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {courses.length === 0 && (
                      <tr><td colSpan={5} className="text-center text-muted">Ders bulunamadı</td></tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            <Modal show={!!editCourse} onHide={() => setEditCourse(null)} centered>
              <Modal.Header closeButton>
                <Modal.Title>Dersi Düzenle</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Başlık</Form.Label>
                    <Form.Control value={editCourse?.title || ''} onChange={e => setEditCourse(prev => ({ ...prev, title: e.target.value }))} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Açıklama</Form.Label>
                    <Form.Control as="textarea" rows={3} value={editCourse?.description || ''} onChange={e => setEditCourse(prev => ({ ...prev, description: e.target.value }))} />
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setEditCourse(null)}>İptal</Button>
                <Button variant="primary" onClick={handleSaveCourse}>Kaydet</Button>
              </Modal.Footer>
            </Modal>
          </Tab.Pane>
        </Tab.Content>
        <Tab.Content>
          <Tab.Pane eventKey="questions">
            <Card className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <div>
                  <i className="fas fa-question-circle me-2"></i>
                  Sorular
                  <Badge bg="secondary" className="ms-2">{questions.length}</Badge>
                </div>
                <Button size="sm" variant="outline-primary" onClick={loadQuestions} disabled={loadingQuestions}>
                  Yenile
                </Button>
              </Card.Header>
              <Card.Body>
                <Table hover responsive className="align-middle">
                  <thead>
                    <tr>
                      <th>Başlık</th>
                      <th>Yazar</th>
                      <th>Durum</th>
                      <th>Cevap</th>
                      <th>Tarih</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map(q => (
                      <tr key={q._id}>
                        <td className="text-truncate" style={{maxWidth: 300}}>{q.title}</td>
                        <td>{q.author?.username || '-'}</td>
                        <td>{q.isResolved ? <Badge bg="success">Çözüldü</Badge> : <Badge bg="warning" text="dark">Açık</Badge>}</td>
                        <td>{q.answers?.length || 0}</td>
                        <td>{new Date(q.createdAt).toLocaleString('tr-TR')}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button size="sm" variant="outline-secondary" as="a" href={`/questions/${q._id}`} target="_blank" rel="noreferrer">Görüntüle</Button>
                            <Button size="sm" variant="outline-danger" onClick={async () => {
                              if (!window.confirm('Soru silinsin mi?')) return;
                              setError(''); setSuccess('');
                              try {
                                const res = await adminDeleteQuestion(q._id);
                                if (res.data?.success) {
                                  setQuestions(prev => prev.filter(x => x._id !== q._id));
                                  setSuccess('Soru silindi');
                                }
                              } catch (e) {
                                setError(e.response?.data?.error || 'Soru silinemedi');
                              }
                            }}>Sil</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {questions.length === 0 && (
                      <tr><td colSpan={6} className="text-center text-muted">Soru bulunamadı</td></tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      <Modal show={showMessageModal} onHide={() => setShowMessageModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Mesaj Gönder {messageTarget ? `- ${messageTarget.username}` : ''}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Mesaj</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Göndermek istediğiniz mesajı yazın"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMessageModal(false)} disabled={sendingMessage}>İptal</Button>
          <Button variant="primary" onClick={handleSendMessage} disabled={sendingMessage || !messageText.trim()}>
            {sendingMessage ? 'Gönderiliyor...' : 'Gönder'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminPanel;
