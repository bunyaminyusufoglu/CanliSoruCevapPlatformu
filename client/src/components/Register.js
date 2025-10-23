import React, { useState } from 'react';
import { register } from '../api';

const Register = () => {
  const [ad, setAd] = useState('');
  const [soyad, setSoyad] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await register({ ad, soyad, username, email, password });
      alert(response?.data?.message || 'Kayıt başarılı!');
      // İsteğe bağlı: kayıt sonrası login sayfasına yönlendirme
      window.location.href = '/login';
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Bilinmeyen hata';
      alert('Kayıt hatası: ' + msg);
    }
  };

  return (
    <div className="container mt-3">
      <h2>Kayıt Ol</h2> 
      <form onSubmit={handleRegister}>
        <input className="form-control mb-2" placeholder="Ad" value={ad} onChange={(e) => setAd(e.target.value)} />
        <input className="form-control mb-2" placeholder="Soyad" value={soyad} onChange={(e) => setSoyad(e.target.value)} />
        <input className="form-control mb-2" placeholder="Kullanıcı Adı" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="form-control mb-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="form-control mb-2" type="password" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" className="btn btn-primary mt-2">Kayıt Ol</button>
      </form>
    </div>
  );
};

export default Register;