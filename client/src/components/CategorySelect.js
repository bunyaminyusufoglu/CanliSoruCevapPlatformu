import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CategorySelect = ({ onSelect }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/categories');
        setCategories(res.data);
      } catch (err) {
        setError('Kategoriler yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) return <div>Kategoriler yükleniyor...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="mb-4">
      <h4>Lütfen bir kategori seçin:</h4>
      <div className="list-group">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className="list-group-item list-group-item-action"
            onClick={() => onSelect(cat)}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategorySelect; 