import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Header = () => {
    const [username, setUsername] = useState(localStorage.getItem('username') || '');
    const [showMenu, setShowMenu] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Socket.io üzerinden kullanıcı adı güncellemelerini dinle
        if (window.socket) {
            window.socket.on('usernameUpdated', (newUsername) => {
                setUsername(newUsername);
                localStorage.setItem('username', newUsername);
            });
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        if (window.socket) {
            window.socket.disconnect();
        }
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
            <div className="container">
                <Link className="navbar-brand" to="/">Canlı Soru Cevap</Link>
                
                <button 
                    className="navbar-toggler" 
                    type="button" 
                    onClick={() => setShowMenu(!showMenu)}
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className={`collapse navbar-collapse ${showMenu ? 'show' : ''}`}>
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">Ana Sayfa</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/livechat">Canlı Sohbet</Link>
                        </li>
                    </ul>

                    {username ? (
                        <div className="navbar-nav">
                            <div className="nav-item dropdown">
                                <button 
                                    className="btn btn-link nav-link dropdown-toggle"
                                    onClick={() => setShowMenu(!showMenu)}
                                >
                                    {username}
                                </button>
                                <div className={`dropdown-menu ${showMenu ? 'show' : ''}`}>
                                    <Link className="dropdown-item" to="/profile">Profil</Link>
                                    <button 
                                        className="dropdown-item" 
                                        onClick={handleLogout}
                                    >
                                        Çıkış Yap
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="navbar-nav">
                            <Link className="nav-link" to="/login">Giriş Yap</Link>
                            <Link className="nav-link" to="/register">Kayıt Ol</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Header;