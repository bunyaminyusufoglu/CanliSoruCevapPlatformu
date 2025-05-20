import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const LiveChat = () => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket.on('chatMessage', (data) => {
      setChat((prevChat) => [...prevChat, data]);
    });
    return () => socket.off('chatMessage');
  }, []);

  const sendMessage = () => {
    const username = localStorage.getItem('username');
    if (message.trim()) {
      socket.emit('chatMessage', { message, username });
      setMessage('');
    }
  };

  return (
    <div className="container mt-3">
      <h3>Canlı Sohbet</h3>
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
      />
      <button onClick={sendMessage} className="btn btn-primary mt-2">Gönder</button>
    </div>
  );
};

export default LiveChat;
