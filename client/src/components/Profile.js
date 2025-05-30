import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
    const { currentUser } = useAuth();
    const [profile, setProfile] = useState({
        ad: '',
        soyad: '',
        username: '',
        email: '',
        bio: '',
        unvan: '',
        avatar: '',
        points: 0,
        badges: [],
        questionCount: 0,
        answerCount: 0,
        helpfulAnswerCount: 0
    });
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/users/profile/${currentUser._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(response.data.user);
            setLoading(false);
        } catch (err) {
            setError('Profil bilgileri yüklenemedi.');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/auth/profile', profile, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Profil başarıyla güncellendi!');
            setIsEditing(false);
            if (window.socket) {
                window.socket.emit('updateUsername', profile.username);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Profil güncellenemedi.');
        }
    };

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center">
                <Spinner animation="border" variant="primary" className="shadow-sm" />
            </div>
        );
    }

    return (
        <div className="min-vh-100 py-5" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
            <Container>
                <Row className="g-4">
                    {/* Sol Kolon - Profil Bilgileri */}
                    <Col lg={8}>
                        <Card className="border-0 shadow-lg rounded-4 animate__animated animate__fadeIn">
                            <Card.Body className="p-4 p-md-5">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <div>
                                        <h3 className="fw-bold mb-2 text-primary">Profil Bilgileri</h3>
                                        <p className="text-muted mb-0">Kişisel bilgilerinizi görüntüleyin ve düzenleyin</p>
                                    </div>
                                    <Button 
                                        variant={isEditing ? "outline-secondary" : "primary"}
                                        className="rounded-pill px-4 py-2 shadow-sm hover-lift"
                                        onClick={() => setIsEditing(!isEditing)}
                                    >
                                        <i className={`bi bi-${isEditing ? 'x-lg' : 'pencil'} me-2`}></i>
                                        {isEditing ? 'İptal' : 'Düzenle'}
                                    </Button>
                                </div>

                                {message && (
                                    <Alert variant="success" className="rounded-3 shadow-sm mb-4 animate__animated animate__fadeIn">
                                        <i className="bi bi-check-circle me-2"></i>
                                        {message}
                                    </Alert>
                                )}
                                {error && (
                                    <Alert variant="danger" className="rounded-3 shadow-sm mb-4 animate__animated animate__fadeIn">
                                        <i className="bi bi-exclamation-circle me-2"></i>
                                        {error}
                                    </Alert>
                                )}

                                {isEditing ? (
                                    <Form onSubmit={handleSubmit}>
                                        <Row className="g-3">
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label className="fw-bold text-muted mb-2">
                                                        <i className="bi bi-person me-2"></i>
                                                        Ad
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="ad"
                                                        value={profile.ad}
                                                        onChange={handleChange}
                                                        required
                                                        className="rounded-3 shadow-sm py-2 px-3"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label className="fw-bold text-muted mb-2">
                                                        <i className="bi bi-person me-2"></i>
                                                        Soyad
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="soyad"
                                                        value={profile.soyad}
                                                        onChange={handleChange}
                                                        required
                                                        className="rounded-3 shadow-sm py-2 px-3"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Form.Group className="mt-3">
                                            <Form.Label className="fw-bold text-muted mb-2">
                                                <i className="bi bi-person-badge me-2"></i>
                                                Kullanıcı Adı
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="username"
                                                value={profile.username}
                                                onChange={handleChange}
                                                required
                                                className="rounded-3 shadow-sm py-2 px-3"
                                            />
                                        </Form.Group>

                                        <Form.Group className="mt-3">
                                            <Form.Label className="fw-bold text-muted mb-2">
                                                <i className="bi bi-envelope me-2"></i>
                                                E-posta
                                            </Form.Label>
                                            <Form.Control
                                                type="email"
                                                value={profile.email}
                                                disabled
                                                className="rounded-3 shadow-sm py-2 px-3 bg-light"
                                            />
                                        </Form.Group>

                                        <Form.Group className="mt-3">
                                            <Form.Label className="fw-bold text-muted mb-2">
                                                <i className="bi bi-award me-2"></i>
                                                Unvan
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="unvan"
                                                value={profile.unvan}
                                                onChange={handleChange}
                                                className="rounded-3 shadow-sm py-2 px-3"
                                            />
                                        </Form.Group>

                                        <Form.Group className="mt-3">
                                            <Form.Label className="fw-bold text-muted mb-2">
                                                <i className="bi bi-person-lines-fill me-2"></i>
                                                Hakkımda
                                            </Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                name="bio"
                                                value={profile.bio}
                                                onChange={handleChange}
                                                rows="3"
                                                className="rounded-3 shadow-sm py-2 px-3"
                                            />
                                        </Form.Group>

                                        <div className="d-grid mt-4">
                                            <Button 
                                                type="submit" 
                                                variant="primary"
                                                className="rounded-pill py-3 shadow-sm hover-lift"
                                            >
                                                <i className="bi bi-save me-2"></i>
                                                Kaydet
                                            </Button>
                                        </div>
                                    </Form>
                                ) : (
                                    <div className="animate__animated animate__fadeIn">
                                        <Row className="g-4">
                                            <Col md={6}>
                                                <div className="bg-light rounded-4 p-4 shadow-sm">
                                                    <h6 className="fw-bold text-primary mb-3">
                                                        <i className="bi bi-person me-2"></i>
                                                        Kişisel Bilgiler
                                                    </h6>
                                                    <p className="mb-2">
                                                        <span className="text-muted">Ad Soyad:</span><br />
                                                        <strong>{profile.ad} {profile.soyad}</strong>
                                                    </p>
                                                    <p className="mb-2">
                                                        <span className="text-muted">Kullanıcı Adı:</span><br />
                                                        <strong>{profile.username}</strong>
                                                    </p>
                                                    <p className="mb-0">
                                                        <span className="text-muted">E-posta:</span><br />
                                                        <strong>{profile.email}</strong>
                                                    </p>
                                                </div>
                                            </Col>
                                            <Col md={6}>
                                                <div className="bg-light rounded-4 p-4 shadow-sm">
                                                    <h6 className="fw-bold text-primary mb-3">
                                                        <i className="bi bi-info-circle me-2"></i>
                                                        Ek Bilgiler
                                                    </h6>
                                                    <p className="mb-2">
                                                        <span className="text-muted">Unvan:</span><br />
                                                        <strong>{profile.unvan || 'Belirtilmemiş'}</strong>
                                                    </p>
                                                    <p className="mb-0">
                                                        <span className="text-muted">Hakkımda:</span><br />
                                                        <strong>{profile.bio || 'Belirtilmemiş'}</strong>
                                                    </p>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Sağ Kolon - Puanlar ve Rozetler */}
                    <Col lg={4}>
                        {/* Puan Kartı */}
                        <Card className="border-0 shadow-lg rounded-4 mb-4 animate__animated animate__fadeIn">
                            <Card.Body className="p-4">
                                <h4 className="fw-bold text-primary mb-4">
                                    <i className="bi bi-star me-2"></i>
                                    Puanlarım
                                </h4>
                                <div className="bg-primary bg-opacity-10 rounded-4 p-4 mb-4">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-primary rounded-circle p-3 me-3 shadow-sm">
                                            <i className="bi bi-star-fill text-white fs-4"></i>
                                        </div>
                                        <div>
                                            <h2 className="fw-bold mb-0">{profile.points}</h2>
                                            <p className="text-muted mb-0">Toplam Puan</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="row g-3">
                                    <div className="col-6">
                                        <div className="bg-light rounded-4 p-3 text-center shadow-sm hover-lift">
                                            <i className="bi bi-question-circle text-primary fs-4 mb-2"></i>
                                            <h4 className="fw-bold mb-1">{profile.questionCount}</h4>
                                            <small className="text-muted">Soru</small>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="bg-light rounded-4 p-3 text-center shadow-sm hover-lift">
                                            <i className="bi bi-chat-dots text-success fs-4 mb-2"></i>
                                            <h4 className="fw-bold mb-1">{profile.answerCount}</h4>
                                            <small className="text-muted">Cevap</small>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="bg-light rounded-4 p-3 text-center shadow-sm hover-lift">
                                            <i className="bi bi-hand-thumbs-up text-info fs-4 mb-2"></i>
                                            <h4 className="fw-bold mb-1">{profile.helpfulAnswerCount}</h4>
                                            <small className="text-muted">Faydalı Cevap</small>
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Rozetler Kartı */}
                        <Card className="border-0 shadow-lg rounded-4 animate__animated animate__fadeIn">
                            <Card.Body className="p-4">
                                <h4 className="fw-bold text-primary mb-4">
                                    <i className="bi bi-award me-2"></i>
                                    Rozetlerim
                                </h4>
                                {profile.badges.length === 0 ? (
                                    <div className="text-center text-muted py-4">
                                        <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                                             style={{width: 80, height: 80}}>
                                            <i className="bi bi-award fs-1"></i>
                                        </div>
                                        <p className="mb-0">Henüz rozet kazanılmadı</p>
                                    </div>
                                ) : (
                                    <div className="row g-3">
                                        {profile.badges.map((badge, index) => (
                                            <div key={index} className="col-6">
                                                <div className="bg-light rounded-4 p-3 text-center shadow-sm hover-lift">
                                                    <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" 
                                                         style={{width: 50, height: 50}}>
                                                        <i className="bi bi-award-fill text-primary"></i>
                                                    </div>
                                                    <h6 className="fw-bold mb-1">{badge.name}</h6>
                                                    <small className="text-muted">{badge.description}</small>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
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
            `}</style>
        </div>
    );
};

export default Profile;