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
      <div className="min-vh-100 py-5" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
        <Container>
          <Card className="border-0 shadow-lg rounded-4 animate__animated animate__fadeIn">
            <Card.Header className="bg-primary bg-gradient text-white py-4">
              <h3 className="fw-bold mb-0">
                <i className="bi bi-chat-dots me-2"></i>
                Canlı Sohbet
              </h3>
            </Card.Header>
            <Card.Body className="p-4 p-md-5">
              <CategorySelect onSelect={setSelectedCategory} />
            </Card.Body>
          </Card>
        </Container>

        <style jsx>{`
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
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-vh-100 py-4" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
      <Container fluid>
        <Row className="g-4">
          <Col md={9}>
            <Card className="border-0 shadow-lg rounded-4 h-100 animate__animated animate__fadeIn">
              <Card.Header className="bg-primary bg-gradient text-white py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <Button 
                      variant="link" 
                      className="text-white p-0 me-3 hover-lift" 
                      onClick={() => setSelectedCategory(null)}
                    >
                      <FaArrowLeft size={20} />
                    </Button>
                    <h4 className="fw-bold mb-0">{selectedCategory.name}</h4>
                  </div>
                  <Badge bg="light" text="dark" className="d-flex align-items-center px-3 py-2 rounded-pill shadow-sm">
                    <FaUsers className="me-2" />
                    {onlineUsers.length} Online
                  </Badge>
                </div>
              </Card.Header>
              <Card.Body className="d-flex flex-column p-0" style={{ height: 'calc(100vh - 250px)' }}>
                <div className="chat-messages flex-grow-1 overflow-auto p-4">
                  {chat.map((msg, index) => (
                    <div 
                      key={index} 
                      className={`chat-message mb-4 ${msg.username === username ? 'text-end' : ''}`}
                    >
                      <div className={`d-inline-block p-3 rounded-4 shadow-sm ${
                        msg.username === username 
                          ? 'bg-primary text-white' 
                          : 'bg-white'
                      }`} style={{ maxWidth: '75%' }}>
                        <div className="message-header small mb-2 d-flex align-items-center">
                          <strong className={msg.username === username ? 'text-white' : 'text-primary'}>
                            {msg.username}
                          </strong>
                          <span className={`ms-2 ${msg.username === username ? 'text-white-50' : 'text-muted'}`}>
                            {msg.timestamp}
                          </span>
                        </div>
                        <div className="message-content">
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="border-top p-3 bg-light">
                  <Form onSubmit={sendMessage}>
                    <div className="input-group">
                      <Form.Control
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Mesajınızı yazın..."
                        className="border-0 rounded-start-4 py-3 px-4 shadow-sm"
                      />
                      <Button 
                        type="submit" 
                        variant="primary" 
                        className="rounded-end-4 px-4 shadow-sm hover-lift"
                        disabled={!message.trim()}
                      >
                        <FaPaperPlane />
                      </Button>
                    </div>
                  </Form>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-lg rounded-4 animate__animated animate__fadeIn">
              <Card.Header className="bg-primary bg-gradient text-white py-3">
                <h5 className="fw-bold mb-0">
                  <i className="bi bi-people me-2"></i>
                  Online Kullanıcılar
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="list-group list-group-flush">
                  {onlineUsers.map((user, index) => (
                    <div 
                      key={index} 
                      className="list-group-item d-flex align-items-center py-3 px-4 hover-lift"
                    >
                      <div className="bg-success rounded-circle me-3" style={{ width: 10, height: 10 }} />
                      <span className="fw-medium">{user.username}</span>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

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
        .chat-messages::-webkit-scrollbar {
          width: 6px;
        }
        .chat-messages::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .chat-messages::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        .chat-messages::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
};

export default LiveChat;
