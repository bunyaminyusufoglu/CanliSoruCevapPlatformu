// src/components/AdminPanel.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Kategori listesini çek
    axios.get((process.env.REACT_APP_API_URL || '/api') + '/categories')
      .then(res => setCategories(res.data));
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;
    // Oda kullanıcılarını çek
    axios.get(`${process.env.REACT_APP_API_URL || '/api'}/room-users/${selectedCategory.id}`)
      .then(res => setUsers(res.data.users));
    // Oda mesaj geçmişini çek
    axios.get(`${process.env.REACT_APP_API_URL || '/api'}/room-messages/${selectedCategory.id}`)
      .then(res => setMessages(res.data.messages));
    // Periyodik güncelleme (canlılık için)
    const interval = setInterval(() => {
      axios.get(`${process.env.REACT_APP_API_URL || '/api'}/room-users/${selectedCategory.id}`)
        .then(res => setUsers(res.data.users));
      axios.get(`${process.env.REACT_APP_API_URL || '/api'}/room-messages/${selectedCategory.id}`)
        .then(res => setMessages(res.data.messages));
    }, 2000);
    return () => clearInterval(interval);
  }, [selectedCategory]);

  return (
    <div className="container mt-4">
      <h2>Admin Paneli</h2>
      <div className="mb-3">
        <label><strong>Kategori Seç:</strong></label>
        <select
          className="form-select"
          value={selectedCategory ? selectedCategory.id : ''}
          onChange={e => {
            const cat = categories.find(c => c.id === e.target.value);
            setSelectedCategory(cat);
          }}
        >
          <option value="">Kategori Seçiniz</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      {selectedCategory && (
        <>
          <h4>Aktif Kullanıcılar ({users.length})</h4>
          <ul className="list-group mb-3">
            {users.map((u, i) => <li key={i} className="list-group-item">{u}</li>)}
            {users.length === 0 && <li className="list-group-item">Odadaki kullanıcı yok</li>}
          </ul>
          <h4>Mesajlar</h4>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Tarih/Saat</th>
                <th>Kullanıcı Adı</th>
                <th>Mesaj</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg, index) => (
                <tr key={index}>
                  <td>{msg.time ? new Date(msg.time).toLocaleString() : '-'}</td>
                  <td>{msg.username}</td>
                  <td>{msg.message}</td>
                </tr>
              ))}
              {messages.length === 0 && (
                <tr><td colSpan={3}>Bu odada hiç mesaj yok.</td></tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default AdminPanel;
