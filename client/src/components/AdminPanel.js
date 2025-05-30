// src/components/AdminPanel.js
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Table, Spinner, Badge } from 'react-bootstrap';
import axios from 'axios';

const AdminPanel = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kategori listesini çek
    axios.get('http://localhost:5000/api/categories')
      .then(res => {
        setCategories(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Kategoriler yüklenirken hata:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;
    // Oda kullanıcılarını çek
    axios.get(`http://localhost:5000/api/room-users/${selectedCategory.id}`)
      .then(res => setUsers(res.data.users));
    // Oda mesaj geçmişini çek
    axios.get(`http://localhost:5000/api/room-messages/${selectedCategory.id}`)
      .then(res => setMessages(res.data.messages));
    // Periyodik güncelleme (canlılık için)
    const interval = setInterval(() => {
      axios.get(`http://localhost:5000/api/room-users/${selectedCategory.id}`)
        .then(res => setUsers(res.data.users));
      axios.get(`http://localhost:5000/api/room-messages/${selectedCategory.id}`)
        .then(res => setMessages(res.data.messages));
    }, 2000);
    return () => clearInterval(interval);
  }, [selectedCategory]);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" 
           style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
        <Spinner animation="border" variant="primary" className="shadow-sm" />
      </div>
    );
  }

  return (
    <div className="min-vh-100 py-5" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-primary mb-0">
            <i className="bi bi-shield-lock me-2"></i>
            Admin Paneli
          </h2>
          <Badge bg="primary" className="px-3 py-2 rounded-pill shadow-sm">
            <i className="bi bi-gear me-2"></i>
            Yönetici Modu
          </Badge>
        </div>

        <Row className="g-4">
          <Col lg={4}>
            <Card className="border-0 shadow-lg rounded-4 animate__animated animate__fadeIn">
              <Card.Header className="bg-primary bg-gradient text-white py-3">
                <h5 className="fw-bold mb-0">
                  <i className="bi bi-grid me-2"></i>
                  Kategori Seçimi
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Form.Group>
                  <Form.Label className="fw-bold text-muted mb-2">
                    <i className="bi bi-tag me-2"></i>
                    Kategori
                  </Form.Label>
                  <Form.Select
                    value={selectedCategory ? selectedCategory.id : ''}
                    onChange={e => {
                      const cat = categories.find(c => c.id === e.target.value);
                      setSelectedCategory(cat);
                    }}
                    className="rounded-3 shadow-sm py-2 px-3"
                  >
                    <option value="">Kategori Seçiniz</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={8}>
            {selectedCategory ? (
              <div className="d-flex flex-column gap-4">
                {/* Aktif Kullanıcılar Kartı */}
                <Card className="border-0 shadow-lg rounded-4 animate__animated animate__fadeIn">
                  <Card.Header className="bg-primary bg-gradient text-white py-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="fw-bold mb-0">
                        <i className="bi bi-people me-2"></i>
                        Aktif Kullanıcılar
                      </h5>
                      <Badge bg="light" text="dark" className="px-3 py-2 rounded-pill shadow-sm">
                        {users.length} Online
                      </Badge>
                    </div>
                  </Card.Header>
                  <Card.Body className="p-0">
                    {users.length === 0 ? (
                      <div className="text-center text-muted py-4">
                        <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                             style={{width: 60, height: 60}}>
                          <i className="bi bi-people fs-4"></i>
                        </div>
                        <p className="mb-0">Odada aktif kullanıcı bulunmuyor</p>
                      </div>
                    ) : (
                      <div className="list-group list-group-flush">
                        {users.map((user, index) => (
                          <div 
                            key={index} 
                            className="list-group-item d-flex align-items-center py-3 px-4 hover-lift"
                          >
                            <div className="bg-success rounded-circle me-3" style={{width: 10, height: 10}} />
                            <span className="fw-medium">{user}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>

                {/* Mesajlar Kartı */}
                <Card className="border-0 shadow-lg rounded-4 animate__animated animate__fadeIn">
                  <Card.Header className="bg-primary bg-gradient text-white py-3">
                    <h5 className="fw-bold mb-0">
                      <i className="bi bi-chat-dots me-2"></i>
                      Mesaj Geçmişi
                    </h5>
                  </Card.Header>
                  <Card.Body className="p-0">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted py-4">
                        <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                             style={{width: 60, height: 60}}>
                          <i className="bi bi-chat fs-4"></i>
                        </div>
                        <p className="mb-0">Bu odada henüz mesaj bulunmuyor</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <Table hover className="mb-0">
                          <thead className="bg-light">
                            <tr>
                              <th className="border-0 py-3 px-4">Tarih/Saat</th>
                              <th className="border-0 py-3 px-4">Kullanıcı</th>
                              <th className="border-0 py-3 px-4">Mesaj</th>
                            </tr>
                          </thead>
                          <tbody>
                            {messages.map((msg, index) => (
                              <tr key={index} className="hover-lift">
                                <td className="py-3 px-4">
                                  <small className="text-muted">
                                    {msg.time ? new Date(msg.time).toLocaleString() : '-'}
                                  </small>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="d-flex align-items-center">
                                    <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2" 
                                         style={{width: 32, height: 32}}>
                                      <i className="bi bi-person text-primary"></i>
                                    </div>
                                    <span className="fw-medium">{msg.username}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="bg-light rounded-3 p-2">
                                    {msg.message}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </div>
            ) : (
              <Card className="border-0 shadow-lg rounded-4 animate__animated animate__fadeIn">
                <Card.Body className="p-5 text-center">
                  <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-4" 
                       style={{width: 80, height: 80}}>
                    <i className="bi bi-grid fs-1 text-primary"></i>
                  </div>
                  <h4 className="fw-bold mb-3">Kategori Seçilmedi</h4>
                  <p className="text-muted mb-0">İzlemek istediğiniz kategoriyi sol menüden seçin</p>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>

      <style jsx>{`
        .hover-lift {
          transition: transform 0.2s ease-in-out;
        }
        .hover-lift:hover {
          transform: translateY(-2px);
        }
        .animate__animated {
          animation-duration: 0.6s;
        }
        .animate__fadeIn {
          animation-name: fadeIn;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .table-responsive::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .table-responsive::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .table-responsive::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        .table-responsive::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;
