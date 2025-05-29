import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Container, Row, Col, Form, Button, Card, Badge } from 'react-bootstrap';
import { FaPaperPlane, FaArrowLeft, FaUsers } from 'react-icons/fa';
import CategorySelect from './CategorySelect';

const socket = io('http://localhost:5000');

const LiveChat = () => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  useEffect(() => {
    if (!selectedCategory) return;

    // Odaya katıl
    socket.emit('joinRoom', { roomId: selectedCategory.id, username });
    setChat([]); // Oda değişince sohbeti temizle

    // Oda mesajlarını dinle
    socket.on('chatMessage', (data) => {
      setChat((prevChat) => [...prevChat, data]);
    });

    // Online kullanıcıları dinle
    socket.on('roomUsers', ({ users }) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off('chatMessage');
      socket.off('roomUsers');
    };
  }, [selectedCategory, username]);

  const sendMessage = (e) => {
    e?.preventDefault();
    if (message.trim() && selectedCategory) {
      const messageData = {
        roomId: selectedCategory.id,
        message,
        username,
        timestamp: new Date().toLocaleTimeString()
      };
      socket.emit('chatMessage', messageData);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!selectedCategory) {
    return (
      <Container className="py-4">
        <Card className="shadow-sm">
          <Card.Header className="bg-primary text-white">
            <h4 className="mb-0">Canlı Sohbet</h4>
          </Card.Header>
          <Card.Body>
            <CategorySelect onSelect={setSelectedCategory} />
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row>
        <Col md={9}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <div>
                <Button 
                  variant="link" 
                  className="text-white p-0 me-2" 
                  onClick={() => setSelectedCategory(null)}
                >
                  <FaArrowLeft />
                </Button>
                <span className="h5 mb-0">{selectedCategory.name}</span>
              </div>
              <Badge bg="light" text="dark" className="d-flex align-items-center">
                <FaUsers className="me-1" />
                {onlineUsers.length} Online
              </Badge>
            </Card.Header>
            <Card.Body className="d-flex flex-column" style={{ height: 'calc(100vh - 250px)' }}>
              <div className="chat-messages flex-grow-1 overflow-auto mb-3 p-3">
                {chat.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`chat-message mb-3 ${msg.username === username ? 'text-end' : ''}`}
                  >
                    <div className={`d-inline-block p-2 rounded-3 ${
                      msg.username === username 
                        ? 'bg-primary text-white' 
                        : 'bg-light'
                    }`} style={{ maxWidth: '75%' }}>
                      <div className="message-header small mb-1">
                        <strong>{msg.username}</strong>
                        <span className="ms-2 text-muted">{msg.timestamp}</span>
                      </div>
                      <div className="message-content">
                        {msg.message}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <Form onSubmit={sendMessage} className="mt-auto">
                <div className="input-group">
                  <Form.Control
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Mesajınızı yazın..."
                    className="border-end-0"
                  />
                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="d-flex align-items-center"
                    disabled={!message.trim()}
                  >
                    <FaPaperPlane />
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h6 className="mb-0">Online Kullanıcılar</h6>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="list-group list-group-flush">
                {onlineUsers.map((user, index) => (
                  <div 
                    key={index} 
                    className="list-group-item d-flex align-items-center"
                  >
                    <div className="online-indicator bg-success rounded-circle me-2" style={{ width: 8, height: 8 }} />
                    <span>{user.username}</span>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LiveChat;
