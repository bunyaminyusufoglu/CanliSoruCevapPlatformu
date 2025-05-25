import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error);
    }
  };

  return (
    <Navbar bg="light" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <i className="fas fa-graduation-cap"></i> Canlı Soru Cevap Platformu
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {user ? (
              <>
                <Nav.Link as={Link} to="/courses">
                  <i className="fas fa-book"></i> Dersler
                </Nav.Link>
                <Nav.Link as={Link} to="/livechat">
                  <i className="fas fa-comments"></i> Canlı Sohbet
                </Nav.Link>
                <Nav.Link as={Link} to="/canli-yayin">
                  <i className="fas fa-video"></i> Canlı Yayın
                </Nav.Link>
                <NotificationDropdown />
                {user.isAdmin && (
                  <Nav.Link as={Link} to="/admin">
                    <i className="fas fa-cog"></i> Admin Panel
                  </Nav.Link>
                )}
                <Nav.Link as={Link} to="/profile">
                  <i className="fas fa-user"></i> Profil
                </Nav.Link>
                <Nav.Link onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i> Çıkış
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  <i className="fas fa-sign-in-alt"></i> Giriş
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  <i className="fas fa-user-plus"></i> Kayıt Ol
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation; 