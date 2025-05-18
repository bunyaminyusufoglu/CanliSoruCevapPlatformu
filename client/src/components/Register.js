import React, { useState } from 'react';
import { register } from '../api';

const Register = () => {
  const [ad, setAd] = useState('');
  const [soyad, setSoyad] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      const response = await register({ ad, soyad, username, email, password });
      alert('Kayıt başarılı! Hoş geldiniz ' + response.data.username);
    } catch (err) {
      alert('Kayıt hatası: ' + err.response.data.error);
    }
  };

  return (
    <div className="container mt-3">
      <h2>Kayıt Ol</h2>
      <input placeholder="Ad" value={ad} onChange={(e) => setAd(e.target.value)} />
      <input placeholder="Soyad" value={soyad} onChange={(e) => setSoyad(e.target.value)} />
      <input placeholder="Kullanıcı Adı" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleRegister} className="btn btn-primary mt-2">Kayıt Ol</button>
    </div>
  );
};

export default Register;