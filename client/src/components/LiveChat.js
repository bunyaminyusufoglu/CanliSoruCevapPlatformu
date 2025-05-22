import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import CategorySelect from './CategorySelect';

const socket = io('http://localhost:5000');

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
    <div className="container mt-3">
      <h3>Canlı Sohbet - {selectedCategory.name}</h3>
      <button className="btn btn-secondary mb-2" onClick={() => setSelectedCategory(null)}>
        Kategori Değiştir
      </button>
      <div className="chat-box">
        {chat.map((msg, index) => (
          <div key={index} className="chat-message">
            <strong>{msg.username}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <input 
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Mesajınızı yazın..."
        className="form-control mt-2"
        disabled={!selectedCategory}
      />
      <button onClick={sendMessage} className="btn btn-primary mt-2" disabled={!selectedCategory}>
        Gönder
      </button>
    </div>
  );
};

export default LiveChat;
