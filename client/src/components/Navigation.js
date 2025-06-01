import React, { useState } from 'react';
import { Navbar, Nav, Container, Button, Dropdown, Offcanvas } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navigation = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      setShowOffcanvas(false);
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error);
    }
  };

  const NavLinks = () => (
    <>
      <Nav.Link 
        as={Link} 
        to="/courses" 
        className="mx-2 text-dark fw-medium hover-lift"
        onClick={() => setShowOffcanvas(false)}
      >
        <i className="bi bi-book me-1"></i> Dersler
      </Nav.Link>
      
      <Nav.Link 
        as={Link} 
        to="/questions" 
        className="mx-2 text-dark fw-medium hover-lift"
        onClick={() => setShowOffcanvas(false)}
      >
        <i className="bi bi-question-circle me-1"></i> Soru-Cevap
      </Nav.Link>
      
      <Nav.Link 
        as={Link} 
        to="/livechat" 
        className="mx-2 text-dark fw-medium hover-lift"
        onClick={() => setShowOffcanvas(false)}
      >
        <i className="bi bi-chat-dots me-1"></i> Canlı Sohbet
      </Nav.Link>
      
      <Nav.Link 
        as={Link} 
        to="/canli-yayin" 
        className="mx-2 text-dark fw-medium hover-lift"
        onClick={() => setShowOffcanvas(false)}
      >
        <i className="bi bi-camera-video me-1"></i> Canlı Yayın
      </Nav.Link>
    </>
  );

  return (
    <>
      <Navbar 
        bg="white" 
        expand="lg" 
        className="shadow-sm py-2 border-bottom sticky-top"
        style={{ zIndex: 1030 }}
      >
        <Container>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <div className="bg-primary bg-gradient rounded-circle d-flex align-items-center justify-content-center me-2" 
                 style={{width: 40, height: 40}}>
              <i className="bi bi-mortarboard-fill text-white fs-5"></i>
            </div>
            <span className="fw-bold text-dark d-none d-sm-inline">Canlı Soru Cevap</span>
            <span className="fw-bold text-dark d-inline d-sm-none">CSC</span>
          </Navbar.Brand>

          {/* Desktop Navigation */}
          <div className="d-none d-lg-flex align-items-center">
            <Nav className="me-auto">
              <NavLinks />
            </Nav>

            {currentUser ? (
              <div className="d-flex align-items-center">
                <NotificationDropdown />
                
                {currentUser.isAdmin && (
                  <Nav.Link 
                    as={Link} 
                    to="/admin" 
                    className="mx-2 text-dark fw-medium hover-lift"
                  >
                    <i className="bi bi-gear me-1"></i> Admin Panel
                  </Nav.Link>
                )}

                <Dropdown align="end">
                  <Dropdown.Toggle 
                    variant="light" 
                    id="dropdown-user" 
                    className="d-flex align-items-center border-0 bg-transparent text-dark fw-medium hover-lift"
                  >
                    <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2" 
                         style={{width: 32, height: 32}}>
                      <i className="bi bi-person text-primary"></i>
                    </div>
                    <span className="d-none d-md-inline">{currentUser.name || currentUser.email}</span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="shadow-sm border-0 rounded-3">
                    <Dropdown.Item 
                      as={Link} 
                      to="/profile"
                      className="hover-lift"
                    >
                      <i className="bi bi-person me-2"></i> Profil
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item 
                      onClick={handleLogout}
                      className="text-danger hover-lift"
                    >
                      <i className="bi bi-box-arrow-right me-2"></i> Çıkış Yap
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Button 
                  as={Link} 
                  to="/login" 
                  variant="outline-primary" 
                  className="rounded-pill px-3 hover-lift"
                >
                  <i className="bi bi-box-arrow-in-right me-1"></i>
                  <span className="d-none d-md-inline">Giriş</span>
                </Button>
                
                <Button 
                  as={Link} 
                  to="/register" 
                  variant="primary" 
                  className="rounded-pill px-3 hover-lift"
                >
                  <i className="bi bi-person-plus me-1"></i>
                  <span className="d-none d-md-inline">Kayıt Ol</span>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Navigation Toggle */}
          <Button
            variant="link"
            className="d-lg-none border-0 p-0 text-dark"
            onClick={() => setShowOffcanvas(true)}
          >
            <i className="bi bi-list fs-4"></i>
          </Button>
        </Container>
      </Navbar>

      {/* Mobile Offcanvas Menu */}
      <Offcanvas 
        show={showOffcanvas} 
        onHide={() => setShowOffcanvas(false)}
        placement="end"
        className="border-0"
      >
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title className="fw-bold">
            <i className="bi bi-grid me-2"></i>
            Menü
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          {currentUser ? (
            <div className="d-flex flex-column h-100">
              <div className="p-3 border-bottom">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" 
                       style={{width: 48, height: 48}}>
                    <i className="bi bi-person text-primary fs-4"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">{currentUser.name || currentUser.email}</h6>
                    <small className="text-muted">{currentUser.userType === 'admin' ? 'Yönetici' : 'Kullanıcı'}</small>
                  </div>
                </div>
                <div className="d-grid gap-2">
                  <Button 
                    as={Link} 
                    to="/profile"
                    variant="outline-primary" 
                    className="rounded-pill hover-lift"
                    onClick={() => setShowOffcanvas(false)}
                  >
                    <i className="bi bi-person me-2"></i>
                    Profil
                  </Button>
                  <Button 
                    variant="danger" 
                    className="rounded-pill hover-lift"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Çıkış Yap
                  </Button>
                </div>
              </div>

              <Nav className="flex-column p-3">
                <NavLinks />
                {currentUser.isAdmin && (
                  <Nav.Link 
                    as={Link} 
                    to="/admin" 
                    className="text-dark fw-medium hover-lift py-2"
                    onClick={() => setShowOffcanvas(false)}
                  >
                    <i className="bi bi-gear me-2"></i> Admin Panel
                  </Nav.Link>
                )}
              </Nav>
            </div>
          ) : (
            <div className="d-flex flex-column h-100">
              <Nav className="flex-column p-3">
                <NavLinks />
              </Nav>
              <div className="mt-auto p-3 border-top">
                <div className="d-grid gap-2">
                  <Button 
                    as={Link} 
                    to="/login"
                    variant="outline-primary" 
                    className="rounded-pill hover-lift"
                    onClick={() => setShowOffcanvas(false)}
                  >
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Giriş Yap
                  </Button>
                  <Button 
                    as={Link} 
                    to="/register"
                    variant="primary" 
                    className="rounded-pill hover-lift"
                    onClick={() => setShowOffcanvas(false)}
                  >
                    <i className="bi bi-person-plus me-2"></i>
                    Kayıt Ol
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      <style jsx>{`
        .hover-lift {
          transition: transform 0.2s ease-in-out;
        }
        .hover-lift:hover {
          transform: translateY(-2px);
        }
        .offcanvas {
          max-width: 300px;
        }
        .offcanvas-body::-webkit-scrollbar {
          width: 6px;
        }
        .offcanvas-body::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .offcanvas-body::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        .offcanvas-body::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </>
  );
};

export default Navigation; 