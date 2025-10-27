// src/components/AdminPanel.js
import React, { useEffect, useMemo, useState } from 'react';
import { Tab, Nav, Card, Table, Button, Form, InputGroup, Modal, Badge } from 'react-bootstrap';
import { adminListUsers, adminToggleUserAdmin, adminDeleteUser, adminListCourses, adminUpdateCourse, adminDeleteCourse } from '../api';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [usersFilter, setUsersFilter] = useState('');
  const [courses, setCourses] = useState([]);
  const [editCourse, setEditCourse] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  useEffect(() => {
    loadUsers();
    loadCourses();
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

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Admin Paneli</h2>

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
      </Tab.Container>
    </div>
  );
};

export default AdminPanel;
