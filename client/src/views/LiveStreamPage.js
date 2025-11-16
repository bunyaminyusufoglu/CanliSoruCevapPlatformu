import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { getStreams, createStream as apiCreateStream, addStreamComment as apiAddStreamComment, endStream as apiEndStream } from '../api';
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
    socketRef.current = io(process.env.REACT_APP_SOCKET_URL || '/');

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
        height: 420,
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
        const response = await getStreams();
        if (response.data.success) {
          setStreams(response.data.streams);
        }
      } catch (error) {
        setError(error.response?.data?.error || 'Yayınlar yüklenirken bir hata oluştu');
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
      const response = await apiCreateStream({
        title: newStreamTitle,
        userId: user._id
      });

      if (response.data.success) {
        setStreams(prev => [...prev, response.data.stream]);
        setActiveStream(response.data.stream); // Creator joins immediately
        setNewStreamTitle('');
        setSuccess('Yayın başarıyla oluşturuldu');
      }
    } catch (error) {
      const msg = error.response?.data?.error || error.response?.data?.message || error.message;
      setError(msg || 'Yayın oluşturulurken bir hata oluştu');
    }
  };

  // Yayını sonlandır (sadece admin/oluşturan)
  const handleEndStream = async () => {
    if (!activeStream) return;
    try {
      const response = await apiEndStream(activeStream._id);
      if (response.data.success) {
        setStreams(prev => prev.filter(s => s._id !== activeStream._id));
        setActiveStream(null);
        setSuccess('Yayın sonlandırıldı');
      }
    } catch (error) {
      const msg = error.response?.data?.error || error.response?.data?.message || error.message;
      setError(msg || 'Yayın sonlandırılırken bir hata oluştu');
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
      const response = await apiAddStreamComment(comment);
      if (response.data.success) {
        socketRef.current.emit('streamComment', comment);
        setNewComment('');
      }
    } catch (error) {
      const msg = error.response?.data?.error || error.response?.data?.message || error.message;
      setError(msg || 'Yorum gönderilirken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <Container className="mt-3 live-compact">
        <Alert variant="info">Yayınlar yükleniyor...</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-3 live-compact">
      <h4 className="mb-3">Canlı Yayınlar</h4>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {user?.isAdmin && (
        <Card className="mb-3 card-hover">
          <Card.Body>
            <h6 className="mb-3"><i className="fas fa-broadcast-tower me-2 text-primary"></i>Yeni Yayın Başlat</h6>
            <Form onSubmit={handleCreateStream}>
              <Form.Group className="mb-3">
                <Form.Label>Yayın Başlığı</Form.Label>
                <Form.Control
                  type="text"
                  value={newStreamTitle}
                  onChange={(e) => setNewStreamTitle(e.target.value)}
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit" size="sm" className="btn-custom">
                Yayın Başlat
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}

      <Row>
        <Col md={8}>
          {activeStream ? (
            <div>
              <h6 className="mb-2">{activeStream.title}</h6>
              <div ref={jitsiContainerRef} className="mb-2" />
              {user?.isAdmin && activeStream?.userId && String(activeStream.userId?._id || activeStream.userId) === String(user?._id) && (
                <Button variant="danger" onClick={handleEndStream} className="mb-3" size="sm">
                  Yayını Sonlandır
                </Button>
              )}
            </div>
          ) : (
            <Alert variant="info">
              Katılmak istediğiniz yayını seçin
            </Alert>
          )}
        </Col>
        <Col md={4}>
          <Card className="card-hover">
            <Card.Header className="py-2">
              <h6 className="mb-0">Aktif Yayınlar</h6>
            </Card.Header>
            <Card.Body className="py-2">
              {streams.length === 0 ? (
                <p className="text-muted small mb-0">Şu anda aktif yayın bulunmuyor</p>
              ) : (
                <div className="list-group">
                  {streams.map(stream => (
                    <button
                      key={stream._id}
                      className={`list-group-item list-group-item-action ${
                        activeStream?._id === stream._id ? 'active' : ''
                      } small`}
                      onClick={() => setActiveStream(stream)}
                    >
                      {stream.title}
                      <small className="d-block text-muted">
                        Yayıncı: {stream.user?.username || 'Anonim'}
                      </small>
                    </button>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>

          {activeStream && (
            <Card className="mt-3 card-hover">
              <Card.Header className="py-2">
                <h6 className="mb-0">Yorumlar</h6>
              </Card.Header>
              <Card.Body className="py-2">
                <div className="comments-container mb-2" style={{ maxHeight: '260px', overflowY: 'auto' }}>
                  {comments.map((comment, index) => (
                    <div key={index} className="mb-1 small">
                      <strong>{comment.username}:</strong> <span className="text-muted">{comment.content}</span>
                    </div>
                  ))}
                </div>
                <Form onSubmit={handleCommentSubmit}>
                  <Form.Group className="mb-2">
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Yorum yaz..."
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" size="sm" className="btn-custom">
                    Gönder
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default LiveStreamPage; 