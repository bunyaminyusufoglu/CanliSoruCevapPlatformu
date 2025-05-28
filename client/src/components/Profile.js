import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner } from 'react-bootstrap';
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
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <Container className="py-5">
            <Row className="g-4">
                {/* Sol Kolon - Profil Bilgileri */}
                <Col lg={8}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="p-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h4 className="mb-1">Profil Bilgileri</h4>
                                    <p className="text-muted mb-0">Kişisel bilgilerinizi görüntüleyin ve düzenleyin</p>
                                </div>
                                <button 
                                    className={`btn btn-${isEditing ? 'secondary' : 'primary'} btn-sm px-3`}
                                    onClick={() => setIsEditing(!isEditing)}
                                >
                                    <i className={`fas fa-${isEditing ? 'times' : 'edit'} me-1`}></i>
                                    {isEditing ? 'İptal' : 'Düzenle'}
                                </button>
                            </div>

                            {message && <div className="alert alert-success py-2">{message}</div>}
                            {error && <div className="alert alert-danger py-2">{error}</div>}

                            {isEditing ? (
                                <form onSubmit={handleSubmit}>
                                    <Row>
                                        <Col md={6}>
                                            <div className="mb-3">
                                                <label className="form-label">Ad</label>
                                                <input
                                                    type="text"
                                                    className="form-control bg-light"
                                                    name="ad"
                                                    value={profile.ad}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="mb-3">
                                                <label className="form-label">Soyad</label>
                                                <input
                                                    type="text"
                                                    className="form-control bg-light"
                                                    name="soyad"
                                                    value={profile.soyad}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </Col>
                                    </Row>
                                    <div className="mb-3">
                                        <label className="form-label">Kullanıcı Adı</label>
                                        <input
                                            type="text"
                                            className="form-control bg-light"
                                            name="username"
                                            value={profile.username}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">E-posta</label>
                                        <input
                                            type="email"
                                            className="form-control bg-light"
                                            value={profile.email}
                                            disabled
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Unvan</label>
                                        <input
                                            type="text"
                                            className="form-control bg-light"
                                            name="unvan"
                                            value={profile.unvan}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Hakkımda</label>
                                        <textarea
                                            className="form-control bg-light"
                                            name="bio"
                                            value={profile.bio}
                                            onChange={handleChange}
                                            rows="3"
                                        />
                                    </div>
                                    <div className="d-grid">
                                        <button type="submit" className="btn btn-primary rounded-pill py-2">
                                            <i className="fas fa-save me-2"></i>Kaydet
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div>
                                    <Row>
                                        <Col md={6}>
                                            <p className="mb-2"><strong>Ad Soyad:</strong> {profile.ad} {profile.soyad}</p>
                                            <p className="mb-2"><strong>Kullanıcı Adı:</strong> {profile.username}</p>
                                            <p className="mb-2"><strong>E-posta:</strong> {profile.email}</p>
                                        </Col>
                                        <Col md={6}>
                                            <p className="mb-2"><strong>Unvan:</strong> {profile.unvan || 'Belirtilmemiş'}</p>
                                            <p className="mb-2"><strong>Hakkımda:</strong> {profile.bio || 'Belirtilmemiş'}</p>
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
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body className="p-4">
                            <h5 className="mb-4">Puanlarım</h5>
                            <div className="d-flex align-items-center mb-3">
                                <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                                    <i className="fas fa-star text-primary"></i>
                                </div>
                                <div>
                                    <h3 className="mb-0">{profile.points}</h3>
                                    <p className="text-muted mb-0">Toplam Puan</p>
                                </div>
                            </div>
                            <hr />
                            <div className="row g-3">
                                <div className="col-6">
                                    <div className="d-flex align-items-center">
                                        <i className="fas fa-question-circle text-primary me-2"></i>
                                        <div>
                                            <h6 className="mb-0">{profile.questionCount}</h6>
                                            <small className="text-muted">Soru</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="d-flex align-items-center">
                                        <i className="fas fa-comment-dots text-success me-2"></i>
                                        <div>
                                            <h6 className="mb-0">{profile.answerCount}</h6>
                                            <small className="text-muted">Cevap</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="d-flex align-items-center">
                                        <i className="fas fa-thumbs-up text-info me-2"></i>
                                        <div>
                                            <h6 className="mb-0">{profile.helpfulAnswerCount}</h6>
                                            <small className="text-muted">Faydalı Cevap</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Rozetler Kartı */}
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="p-4">
                            <h5 className="mb-4">Rozetlerim</h5>
                            {profile.badges.length === 0 ? (
                                <div className="text-center text-muted py-3">
                                    <i className="fas fa-medal fa-2x mb-2"></i>
                                    <p className="mb-0">Henüz rozet kazanılmadı</p>
                                </div>
                            ) : (
                                <div className="row g-3">
                                    {profile.badges.map((badge, index) => (
                                        <div key={index} className="col-6">
                                            <div className="text-center p-3 bg-light rounded">
                                                <i className={`${badge.icon} fa-2x mb-2 text-primary`}></i>
                                                <h6 className="mb-1">{badge.name}</h6>
                                                <small className="text-muted d-block">{badge.description}</small>
                                                <small className="text-muted d-block mt-1">
                                                    {new Date(badge.awardedAt).toLocaleDateString('tr-TR')}
                                                </small>
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
    );
};

export default Profile;