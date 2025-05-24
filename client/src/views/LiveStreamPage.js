import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
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
      <Container className="mt-4">
        <Alert variant="info">Yayınlar yükleniyor...</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Canlı Yayınlar</h1>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {user?.isAdmin && (
        <Card className="mb-4">
          <Card.Body>
            <h2>Yeni Yayın Başlat</h2>
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
              <Button variant="primary" type="submit">
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
              <h2>{activeStream.title}</h2>
              <div ref={jitsiContainerRef} className="mb-3" />
            </div>
          ) : (
            <Alert variant="info">
              Katılmak istediğiniz yayını seçin
            </Alert>
          )}
        </Col>
        <Col md={4}>
          <Card>
            <Card.Header>
              <h3 className="mb-0">Aktif Yayınlar</h3>
            </Card.Header>
            <Card.Body>
              {streams.length === 0 ? (
                <p>Şu anda aktif yayın bulunmuyor</p>
              ) : (
                <div className="list-group">
                  {streams.map(stream => (
                    <button
                      key={stream._id}
                      className={`list-group-item list-group-item-action ${
                        activeStream?._id === stream._id ? 'active' : ''
                      }`}
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
            <Card className="mt-3">
              <Card.Header>
                <h3 className="mb-0">Yorumlar</h3>
              </Card.Header>
              <Card.Body>
                <div className="comments-container mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {comments.map((comment, index) => (
                    <div key={index} className="mb-2">
                      <strong>{comment.username}:</strong> {comment.content}
                    </div>
                  ))}
                </div>
                <Form onSubmit={handleCommentSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Yorum yaz..."
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit">
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