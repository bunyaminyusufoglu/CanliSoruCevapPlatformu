import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: 'linear-gradient(135deg, #b993d6 0%, #8ca6db 100%)',
      }}
    >
      <div className="bg-white rounded-4 shadow p-5 text-center" style={{ maxWidth: 500 }}>
        <div className="mb-4">
          <div
            className="bg-primary bg-gradient rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
            style={{ width: 80, height: 80 }}
          >
            <i className="fas fa-comments fa-2x text-white"></i>
          </div>
          <h1 className="fw-bold mb-2" style={{ fontSize: '2.2rem' }}>
            Canlı Soru-Cevap ve Eğitim Platformu
          </h1>
          <p className="text-muted mb-4">
            Gerçek zamanlı sohbet, eğitim içerikleri ve topluluk desteğiyle öğrenmeyi daha keyifli hale getir!
          </p>
        </div>
        <div className="d-flex justify-content-center gap-3">
          <Link to="/login" className="btn btn-primary rounded-pill px-4">
            Giriş Yap
          </Link>
          <Link to="/register" className="btn btn-outline-primary rounded-pill px-4">
            Kayıt Ol
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;