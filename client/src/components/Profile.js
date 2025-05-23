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
            // Socket.io üzerinden kullanıcı adı güncellemesini bildir
            if (window.socket) {
                window.socket.emit('updateUsername', profile.username);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Profil güncellenemedi.');
        }
    };

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-md-8 offset-md-2">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h3>Profil Bilgileri</h3>
                            <button 
                                className="btn btn-primary"
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                {isEditing ? 'İptal' : 'Düzenle'}
                            </button>
                        </div>
                        <div className="card-body">
                            {message && <div className="alert alert-success">{message}</div>}
                            {error && <div className="alert alert-danger">{error}</div>}
                            
                            {isEditing ? (
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">Ad</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="ad"
                                            value={profile.ad}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Soyad</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="soyad"
                                            value={profile.soyad}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Kullanıcı Adı</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="username"
                                            value={profile.username}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">E-posta</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={profile.email}
                                            disabled
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Unvan</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="unvan"
                                            value={profile.unvan}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Hakkımda</label>
                                        <textarea
                                            className="form-control"
                                            name="bio"
                                            value={profile.bio}
                                            onChange={handleChange}
                                            rows="3"
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-success">
                                        Kaydet
                                    </button>
                                </form>
                            ) : (
                                <div>
                                    <p><strong>Ad Soyad:</strong> {profile.ad} {profile.soyad}</p>
                                    <p><strong>Kullanıcı Adı:</strong> {profile.username}</p>
                                    <p><strong>E-posta:</strong> {profile.email}</p>
                                    <p><strong>Unvan:</strong> {profile.unvan || 'Belirtilmemiş'}</p>
                                    <p><strong>Hakkımda:</strong> {profile.bio || 'Belirtilmemiş'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;