import React, { useMemo } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
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

  const userInitials = useMemo(() => {
    if (!user?.username) return 'U';
    const parts = String(user.username).split(' ');
    const first = parts[0]?.[0] || '';
    const last = parts[1]?.[0] || '';
    return (first + last).toUpperCase() || first.toUpperCase();
  }, [user]);

  return (
    <Navbar bg="white" expand="lg" sticky="top" className="mb-4 border-bottom shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-semibold text-primary">
          <i className="fas fa-graduation-cap me-2"></i>
          CSC Platformu
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-lg-center">
            {user ? (
              <>
                <Nav.Link as={NavLink} to="/courses" className={({ isActive }) => isActive ? 'fw-semibold text-primary' : undefined}>
                  <i className="fas fa-book"></i> Dersler
                </Nav.Link>
                <Nav.Link as={NavLink} to="/qa" className={({ isActive }) => isActive ? 'fw-semibold text-primary' : undefined}>
                  <i className="fas fa-question-circle"></i> Soru & Cevap
                </Nav.Link>
                <Nav.Link as={NavLink} to="/canli-yayin" className={({ isActive }) => isActive ? 'fw-semibold text-primary' : undefined}>
                  <i className="fas fa-video"></i> Canlı Yayın
                </Nav.Link>
                <div className="ms-lg-2 me-lg-2">
                  <NotificationDropdown />
                </div>
                <NavDropdown
                  align={{ lg: 'end' }}
                  title={
                    <span className="d-inline-flex align-items-center">
                      <span className="rounded-circle bg-primary text-white d-inline-flex justify-content-center align-items-center me-2" style={{ width: 32, height: 32, fontSize: 14 }}>
                        {userInitials}
                      </span>
                      <span className="d-none d-lg-inline">{user.username}</span>
                    </span>
                  }
                  id="user-menu"
                >
                  <NavDropdown.Item as={NavLink} to="/profile">
                    <i className="fas fa-user me-2"></i>Profil
                  </NavDropdown.Item>
                  {user.isAdmin && (
                    <NavDropdown.Item as={NavLink} to="/admin">
                      <i className="fas fa-cog me-2"></i>Admin Panel
                    </NavDropdown.Item>
                  )}
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-2"></i>Çıkış
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={NavLink} to="/login" className={({ isActive }) => isActive ? 'fw-semibold text-primary' : undefined}>
                  <i className="fas fa-sign-in-alt"></i> Giriş
                </Nav.Link>
                <Nav.Link as={NavLink} to="/register" className={({ isActive }) => isActive ? 'fw-semibold text-primary' : undefined}>
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