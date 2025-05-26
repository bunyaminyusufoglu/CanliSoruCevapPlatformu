import React, { useState } from 'react';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navigation = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      setExpanded(false);
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error);
    }
  };

  return (
    <Navbar 
      bg="white" 
      expand="lg" 
      className="shadow-sm py-3 border-bottom"
      expanded={expanded}
      onToggle={(expanded) => setExpanded(expanded)}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <i className="fas fa-graduation-cap text-primary me-2 fs-4"></i>
          <span className="fw-bold text-dark">Canlı Soru Cevap</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0">
          <i className="fas fa-bars"></i>
        </Navbar.Toggle>

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            {currentUser ? (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/courses" 
                  className="mx-2 text-dark fw-medium"
                  onClick={() => setExpanded(false)}
                >
                  <i className="fas fa-book me-1"></i> Dersler
                </Nav.Link>
                
                <Nav.Link 
                  as={Link} 
                  to="/livechat" 
                  className="mx-2 text-dark fw-medium"
                  onClick={() => setExpanded(false)}
                >
                  <i className="fas fa-comments me-1"></i> Canlı Sohbet
                </Nav.Link>
                
                <Nav.Link 
                  as={Link} 
                  to="/canli-yayin" 
                  className="mx-2 text-dark fw-medium"
                  onClick={() => setExpanded(false)}
                >
                  <i className="fas fa-video me-1"></i> Canlı Yayın
                </Nav.Link>

                <div className="mx-2">
                  <NotificationDropdown />
                </div>

                {currentUser.isAdmin && (
                  <Nav.Link 
                    as={Link} 
                    to="/admin" 
                    className="mx-2 text-dark fw-medium"
                    onClick={() => setExpanded(false)}
                  >
                    <i className="fas fa-cog me-1"></i> Admin Panel
                  </Nav.Link>
                )}

                <Dropdown align="end" className="mx-2">
                  <Dropdown.Toggle 
                    variant="light" 
                    id="dropdown-user" 
                    className="d-flex align-items-center border-0 bg-transparent text-dark fw-medium"
                  >
                    <i className="fas fa-user-circle me-1"></i>
                    {currentUser.name || currentUser.email}
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="shadow-sm border-0">
                    <Dropdown.Item 
                      as={Link} 
                      to="/profile"
                      onClick={() => setExpanded(false)}
                    >
                      <i className="fas fa-user me-2"></i> Profil
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item 
                      onClick={handleLogout}
                      className="text-danger"
                    >
                      <i className="fas fa-sign-out-alt me-2"></i> Çıkış Yap
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/login" 
                  className="mx-2 text-dark fw-medium"
                  onClick={() => setExpanded(false)}
                >
                  <i className="fas fa-sign-in-alt me-1"></i> Giriş
                </Nav.Link>
                
                <Button 
                  as={Link} 
                  to="/register" 
                  variant="primary" 
                  className="ms-2 px-4"
                  onClick={() => setExpanded(false)}
                >
                  <i className="fas fa-user-plus me-1"></i> Kayıt Ol
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation; 