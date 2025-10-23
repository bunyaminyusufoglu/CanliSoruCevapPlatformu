import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CategorySelect = ({ onSelect }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get((process.env.REACT_APP_API_URL || '/api') + '/categories');
        setCategories(res.data);
      } catch (err) {
        setError('Kategoriler yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="spinner-border spinner-border-custom text-primary" role="status">
              <span className="visually-hidden">Yükleniyor...</span>
            </div>
            <p className="mt-3 text-muted">Kategoriler yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="alert alert-danger" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="text-center mb-4">
            <h2 className="display-6 fw-bold text-primary">
              <i className="fas fa-layer-group me-2"></i>
              Kategori Seçin
            </h2>
            <p className="text-muted">Sohbet etmek istediğiniz konuyu seçin</p>
          </div>
          
          <div className="category-grid">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="card category-card h-100"
                onClick={() => onSelect(cat)}
              >
                <div className="card-body text-center d-flex flex-column justify-content-center">
                  <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 mx-auto" style={{width: 60, height: 60}}>
                    <i className="fas fa-comments fa-lg"></i>
                  </div>
                  <h5 className="card-title fw-semibold">{cat.name}</h5>
                  <p className="card-text text-muted small">
                    {cat.description || 'Bu kategoride sohbet edin'}
                  </p>
                  <button className="btn btn-outline-primary btn-sm mt-auto">
                    <i className="fas fa-arrow-right me-1"></i>Katıl
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySelect; 