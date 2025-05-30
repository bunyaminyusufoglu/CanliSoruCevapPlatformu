import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { io } from 'socket.io-client';

const LiveStreamPage = () => {
  const [streams, setStreams] = useState([]);
  const [activeStream, setActiveStream] = useState(null);
  const [newStreamTitle, setNewStreamTitle] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);
  const socketRef = useRef(null);

  // Socket.io bağlantısı
  useEffect(() => {
    socketRef.current = io('http://localhost:5000');

    socketRef.current.on('streamComment', (comment) => {
      setComments(prev => [...prev, comment]);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Jitsi Meet API'sini yükle
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Aktif yayın değiştiğinde Jitsi Meet'i başlat
  useEffect(() => {
    if (activeStream && window.JitsiMeetExternalAPI) {
      const domain = 'meet.jit.si';
      const options = {
        roomName: `CanliSoruCevap_${activeStream._id}`,
        width: '100%',
        height: 500,
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: user?.username || 'Misafir'
        },
        configOverwrite: {
          startWithAudioMuted: true,
          startWithVideoMuted: false
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
            'shortcuts', 'tileview', 'select-background', 'download', 'help',
            'mute-everyone', 'security'
          ],
        }
      };

      jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);

      // Yayın başladığında socket.io ile bildir
      jitsiApiRef.current.addEventListeners({
        videoConferenceJoined: () => {
          socketRef.current.emit('joinStream', {
            streamId: activeStream._id,
            username: user?.username || 'Misafir'
          });
        }
      });

      return () => {
        if (jitsiApiRef.current) {
          jitsiApiRef.current.dispose();
        }
      };
    }
  }, [activeStream, user]);

  // Yayınları getir
  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const response = await axios.get('/api/streams');
        if (response.data.success) {
          setStreams(response.data.streams);
        }
      } catch (error) {
        setError('Yayınlar yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchStreams();
  }, []);

  // Yeni yayın oluştur
  const handleCreateStream = async (e) => {
    e.preventDefault();
    if (!newStreamTitle.trim()) return;

    try {
      const response = await axios.post('/api/streams', {
        title: newStreamTitle,
        userId: user._id
      });

      if (response.data.success) {
        setStreams(prev => [...prev, response.data.stream]);
        setNewStreamTitle('');
        setSuccess('Yayın başarıyla oluşturuldu');
      }
    } catch (error) {
      setError('Yayın oluşturulurken bir hata oluştu');
    }
  };

  // Yorum gönder
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !activeStream) return;

    const comment = {
      streamId: activeStream._id,
      userId: user?._id,
      username: user?.username || 'Misafir',
      content: newComment,
      timestamp: new Date()
    };

    try {
      const response = await axios.post('/api/streams/comment', comment);
      if (response.data.success) {
        socketRef.current.emit('streamComment', comment);
        setNewComment('');
      }
    } catch (error) {
      setError('Yorum gönderilirken bir hata oluştu');
    }
  };

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
            <i className="bi bi-broadcast me-2"></i>
            Canlı Yayınlar
          </h2>
          {user?.isAdmin && (
            <Button 
              variant="primary" 
              className="rounded-pill px-4 py-2 shadow-sm hover-lift"
              onClick={() => document.getElementById('createStreamModal').showModal()}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Yeni Yayın
            </Button>
          )}
        </div>

        {error && (
          <Alert variant="danger" className="rounded-3 shadow-sm mb-4 animate__animated animate__fadeIn">
            <i className="bi bi-exclamation-circle me-2"></i>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" className="rounded-3 shadow-sm mb-4 animate__animated animate__fadeIn">
            <i className="bi bi-check-circle me-2"></i>
            {success}
          </Alert>
        )}

        <Row className="g-4">
          <Col lg={8}>
            {activeStream ? (
              <Card className="border-0 shadow-lg rounded-4 animate__animated animate__fadeIn">
                <Card.Header className="bg-primary bg-gradient text-white py-3">
                  <h4 className="fw-bold mb-0">{activeStream.title}</h4>
                </Card.Header>
                <Card.Body className="p-0">
                  <div ref={jitsiContainerRef} />
                </Card.Body>
              </Card>
            ) : (
              <Card className="border-0 shadow-lg rounded-4 animate__animated animate__fadeIn">
                <Card.Body className="p-5 text-center">
                  <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-4" 
                       style={{width: 80, height: 80}}>
                    <i className="bi bi-broadcast fs-1 text-primary"></i>
                  </div>
                  <h4 className="fw-bold mb-3">Yayın Seçilmedi</h4>
                  <p className="text-muted mb-0">Katılmak istediğiniz yayını sağdaki listeden seçin</p>
                </Card.Body>
              </Card>
            )}
          </Col>

          <Col lg={4}>
            <div className="d-flex flex-column gap-4">
              {/* Aktif Yayınlar Kartı */}
              <Card className="border-0 shadow-lg rounded-4 animate__animated animate__fadeIn">
                <Card.Header className="bg-primary bg-gradient text-white py-3">
                  <h5 className="fw-bold mb-0">
                    <i className="bi bi-broadcast-pin me-2"></i>
                    Aktif Yayınlar
                  </h5>
                </Card.Header>
                <Card.Body className="p-0">
                  {streams.length === 0 ? (
                    <div className="text-center text-muted py-4">
                      <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                           style={{width: 60, height: 60}}>
                        <i className="bi bi-broadcast fs-4"></i>
                      </div>
                      <p className="mb-0">Şu anda aktif yayın bulunmuyor</p>
                    </div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {streams.map(stream => (
                        <button
                          key={stream._id}
                          className={`list-group-item list-group-item-action border-0 py-3 px-4 hover-lift ${
                            activeStream?._id === stream._id ? 'bg-primary bg-opacity-10' : ''
                          }`}
                          onClick={() => setActiveStream(stream)}
                        >
                          <div className="d-flex align-items-center">
                            <div className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${
                              activeStream?._id === stream._id ? 'bg-primary' : 'bg-light'
                            }`} style={{width: 40, height: 40}}>
                              <i className={`bi bi-broadcast ${
                                activeStream?._id === stream._id ? 'text-white' : 'text-primary'
                              }`}></i>
                            </div>
                            <div className="text-start">
                              <h6 className={`fw-bold mb-1 ${
                                activeStream?._id === stream._id ? 'text-primary' : ''
                              }`}>{stream.title}</h6>
                              <small className="text-muted">
                                Yayıncı: {stream.user?.username || 'Anonim'}
                              </small>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>

              {/* Yorumlar Kartı */}
              {activeStream && (
                <Card className="border-0 shadow-lg rounded-4 animate__animated animate__fadeIn">
                  <Card.Header className="bg-primary bg-gradient text-white py-3">
                    <h5 className="fw-bold mb-0">
                      <i className="bi bi-chat-dots me-2"></i>
                      Yorumlar
                    </h5>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <div className="comments-container p-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {comments.map((comment, index) => (
                        <div key={index} className="mb-3">
                          <div className="d-flex align-items-start">
                            <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" 
                                 style={{width: 32, height: 32}}>
                              <i className="bi bi-person text-primary"></i>
                            </div>
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center mb-1">
                                <strong className="text-primary me-2">{comment.username}</strong>
                                <small className="text-muted">
                                  {new Date(comment.timestamp).toLocaleTimeString()}
                                </small>
                              </div>
                              <p className="mb-0 bg-light rounded-3 p-2">{comment.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-top p-3">
                      <Form onSubmit={handleCommentSubmit}>
                        <div className="input-group">
                          <Form.Control
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Yorumunuzu yazın..."
                            className="border-0 rounded-start-4 py-2 px-3 shadow-sm"
                          />
                          <Button 
                            type="submit" 
                            variant="primary" 
                            className="rounded-end-4 px-3 shadow-sm hover-lift"
                            disabled={!newComment.trim()}
                          >
                            <i className="bi bi-send"></i>
                          </Button>
                        </div>
                      </Form>
                    </div>
                  </Card.Body>
                </Card>
              )}
            </div>
          </Col>
        </Row>
      </Container>

      {/* Yeni Yayın Modal */}
      <dialog id="createStreamModal" className="border-0 rounded-4 shadow-lg p-0">
        <div className="p-4 p-md-5">
          <h4 className="fw-bold text-primary mb-4">
            <i className="bi bi-plus-circle me-2"></i>
            Yeni Yayın Başlat
          </h4>
          <Form onSubmit={handleCreateStream}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold text-muted mb-2">
                <i className="bi bi-broadcast me-2"></i>
                Yayın Başlığı
              </Form.Label>
              <Form.Control
                type="text"
                value={newStreamTitle}
                onChange={(e) => setNewStreamTitle(e.target.value)}
                required
                className="rounded-3 shadow-sm py-2 px-3"
                placeholder="Yayın başlığını girin"
              />
            </Form.Group>
            <div className="d-flex gap-2 justify-content-end">
              <Button 
                variant="outline-secondary" 
                className="rounded-pill px-4 py-2 shadow-sm hover-lift"
                onClick={() => document.getElementById('createStreamModal').close()}
              >
                İptal
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                className="rounded-pill px-4 py-2 shadow-sm hover-lift"
              >
                <i className="bi bi-broadcast me-2"></i>
                Yayın Başlat
              </Button>
            </div>
          </Form>
        </div>
      </dialog>

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
        .comments-container::-webkit-scrollbar {
          width: 6px;
        }
        .comments-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .comments-container::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        .comments-container::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        dialog {
          max-width: 500px;
          width: 90%;
        }
        dialog::backdrop {
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }
      `}</style>
    </div>
  );
};

export default LiveStreamPage; 