import React from 'react';

const Header = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <a className="navbar-brand" href="/">Canlı Soru & Cevap</a>
        <div className="navbar-nav">
          <a className="nav-link" href="/livechat">Canlı Sohbet</a>
          <a className="nav-link" href="/login">Giriş Yap</a>
          <a className="nav-link" href="/register">Kayıt Ol</a>
        </div>
      </div>
    </nav>
  );
};

export default Header;