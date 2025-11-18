import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Container, Row, Col, Card, ListGroup, Form, Button, Badge, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { getUser } from '../api';
import { io } from 'socket.io-client';

const LiveChatPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const peerId = searchParams.get('sender') || '';

  const [peerUser, setPeerUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const messageEndRef = useRef(null);

  const roomId = useMemo(() => {
    if (!user?._id || !peerId) return '';
    const a = String(user._id);
    const b = String(peerId);
    const [p1, p2] = a < b ? [a, b] : [b, a];
    return `dm_${p1}_${p2}`;
  }, [user, peerId]);

  useEffect(() => {
    const fetchPeer = async () => {
      if (!peerId) {
        setError('Sohbet için bir kullanıcı seçilmedi.');
        setLoading(false);
        return;
      }
      try {
        const res = await getUser(peerId);
        setPeerUser(res.data || null);
      } catch (e) {
        setError('Kullanıcı bilgisi getirilemedi.');
      }
    };
    fetchPeer();
  }, [peerId]);

  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      return;
    }

    socketRef.current = io(process.env.REACT_APP_SOCKET_URL || '/');

    socketRef.current.on('roomUsers', ({ roomId: _roomId, users }) => {
      if (_roomId === roomId) setOnlineUsers(users || []);
    });

    socketRef.current.on('chatMessage', (msgObj) => {
      setMessages((prev) => [...prev, msgObj]);
    });

    // Odaya katıl ve geçmişi al
    socketRef.current.emit('joinRoom', { roomId, username: user?.username || 'Misafir' });
    fetch(`/api/room-messages/${roomId}`)
      .then((r) => r.json())
      .then((data) => setMessages(data?.messages || []))
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId, user]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !roomId) return;
    socketRef.current?.emit('chatMessage', { roomId, message: text });
    setInput('');
  };

  return (
    <Container className="py-4">
      <Row className="g-3">
        <Col md={8} lg={9}>
          <Card className="shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <strong>{peerUser?.username || 'Sohbet'}</strong>
                {peerUser && <Badge bg="secondary" className="ms-2">@{peerUser.username}</Badge>}
              </div>
              <div className="small text-muted">{roomId}</div>
            </Card.Header>
            <Card.Body style={{ height: 420, overflowY: 'auto' }}>
              {loading ? (
                <div className="text-center text-muted">Yükleniyor...</div>
              ) : error ? (
                <Alert variant="danger" className="mb-0">{error}</Alert>
              ) : messages.length === 0 ? (
                <div className="text-center text-muted">Mesaj yok, ilk mesajı yazın.</div>
              ) : (
                <ListGroup variant="flush">
                  {messages.map((m, idx) => (
                    <ListGroup.Item key={idx} className="border-0 px-0">
                      <div className="small text-muted">
                        <strong>{m.username || 'Kullanıcı'}</strong>
                        <span className="ms-2">{new Date(m.time).toLocaleTimeString('tr-TR')}</span>
                      </div>
                      <div>{m.message}</div>
                    </ListGroup.Item>
                  ))}
                  <div ref={messageEndRef} />
                </ListGroup>
              )}
            </Card.Body>
            <Card.Footer>
              <Form onSubmit={handleSend} className="d-flex gap-2">
                <Form.Control
                  placeholder="Mesaj yazın..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <Button type="submit" variant="primary" disabled={!input.trim()}>
                  Gönder
                </Button>
              </Form>
            </Card.Footer>
          </Card>
        </Col>
        <Col md={4} lg={3}>
          <Card className="shadow-sm">
            <Card.Header>Odadaki Kullanıcılar</Card.Header>
            <ListGroup variant="flush">
              {onlineUsers.length === 0 ? (
                <ListGroup.Item className="text-muted">Kimse yok</ListGroup.Item>
              ) : (
                onlineUsers.map((name, i) => (
                  <ListGroup.Item key={i}>{name}</ListGroup.Item>
                ))
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LiveChatPage;


