import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
    const [profile, setProfile] = useState({
        ad: '',
        soyad: '',
        username: '',
        email: '',
        bio: '',
        unvan: '',
        avatar: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/auth/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(response.data);
        } catch (err) {
            setError('Profil bilgileri yüklenemedi.');
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

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{background: 'linear-gradient(135deg, #b993d6 0%, #8ca6db 100%)'}}>
            <div className="bg-white rounded-4 shadow p-4 p-md-5" style={{minWidth: 340, maxWidth: 430}}>
                <div className="d-flex flex-column align-items-center mb-4">
                    <div className="bg-primary bg-gradient rounded-circle d-flex align-items-center justify-content-center mb-3" style={{width: 70, height: 70}}>
                        <i className="fas fa-user fa-2x text-white"></i>
                    </div>
                    <h4 className="fw-bold mb-1">Profil Bilgileri</h4>
                    <p className="text-muted mb-0">Kişisel bilgilerinizi görüntüleyin ve düzenleyin</p>
                </div>
                <div className="d-flex justify-content-end mb-3">
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
                        <div className="d-grid mb-2">
                            <button type="submit" className="btn btn-success rounded-pill py-2">
                                <i className="fas fa-save me-2"></i>Kaydet
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="px-1">
                        <div className="mb-2"><strong>Ad Soyad:</strong> {profile.ad} {profile.soyad}</div>
                        <div className="mb-2"><strong>Kullanıcı Adı:</strong> {profile.username}</div>
                        <div className="mb-2"><strong>E-posta:</strong> {profile.email}</div>
                        <div className="mb-2"><strong>Unvan:</strong> {profile.unvan || 'Belirtilmemiş'}</div>
                        <div className="mb-2"><strong>Hakkımda:</strong> {profile.bio || 'Belirtilmemiş'}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;