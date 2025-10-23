import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import CategorySelect from './CategorySelect';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || '/';
const socket = io(SOCKET_URL);

const LiveChat = () => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  useEffect(() => {
    if (!selectedCategory) return;
    // Odaya katıl
    socket.emit('joinRoom', { roomId: selectedCategory.id, username });
    setChat([]); // Oda değişince sohbeti temizle
    // Oda mesajlarını dinle
    socket.on('chatMessage', (data) => {
      setChat((prevChat) => [...prevChat, data]);
    });
    return () => {
      socket.off('chatMessage');
    };
  }, [selectedCategory, username]);

  const sendMessage = () => {
    if (message.trim() && selectedCategory) {
      socket.emit('chatMessage', { roomId: selectedCategory.id, message });
      setMessage('');
    }
  };

  if (!selectedCategory) {
    return <CategorySelect onSelect={setSelectedCategory} />;
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                <i className="fas fa-comments me-2"></i>
                Canlı Sohbet - {selectedCategory.name}
              </h4>
              <button 
                className="btn btn-outline-light btn-sm" 
                onClick={() => setSelectedCategory(null)}
              >
                <i className="fas fa-arrow-left me-1"></i>Kategori Değiştir
              </button>
            </div>
            <div className="card-body p-0">
              <div className="chat-box">
                {chat.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    <i className="fas fa-comment-slash fa-2x mb-3"></i>
                    <p>Henüz mesaj yok. İlk mesajı siz gönderin!</p>
                  </div>
                ) : (
                  chat.map((msg, index) => (
                    <div key={index} className="chat-message">
                      <div className="d-flex align-items-start">
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{width: 32, height: 32, fontSize: 12}}>
                          {msg.username?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-semibold text-primary">{msg.username}</div>
                          <div>{msg.message}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="card-footer">
              <div className="input-group">
                <input 
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Mesajınızı yazın..."
                  className="form-control"
                  disabled={!selectedCategory}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button 
                  onClick={sendMessage} 
                  className="btn btn-primary" 
                  disabled={!selectedCategory || !message.trim()}
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveChat;
