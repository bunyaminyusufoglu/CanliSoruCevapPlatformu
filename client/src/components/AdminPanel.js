// src/components/AdminPanel.js
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const AdminPanel = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on('chatMessage', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off('chatMessage');
    };
  }, []);

  return (
    <div className="container mt-4">
      <h2>Admin Paneli</h2>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Kullanıcı Adı</th>
            <th>Mesaj</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((msg, index) => (
            <tr key={index}>
              <td>{msg.username}</td>
              <td>{msg.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;
