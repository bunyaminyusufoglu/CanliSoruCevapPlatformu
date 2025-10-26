import React, { useState, useRef } from 'react';
import { Button, Form, Alert, Spinner, Image } from 'react-bootstrap';
import axios from 'axios';

/**
 * ImageUpload Component
 * Resim yükleme ve önizleme için kullanılır
 * 
 * @param {string} endpoint - API endpoint (/api/images/avatar, /api/images/question vb.)
 * @param {function} onUploadSuccess - Yükleme başarılı olduğunda çağrılacak callback
 * @param {string} buttonText - Buton metni
 * @param {string} buttonVariant - Bootstrap buton renk teması
 * @param {string} acceptedFormats - Kabul edilen dosya formatları
 * @param {number} maxSizeMB - Maximum dosya boyutu (MB)
 * @param {boolean} showPreview - Önizleme göster
 * @param {string} previewImage - Mevcut resim URL'i (düzenleme modunda)
 * @param {boolean} circular - Yuvarlak önizleme (avatar için)
 */
const ImageUpload = ({
  endpoint = '/api/images/upload',
  onUploadSuccess,
  buttonText = 'Resim Yükle',
  buttonVariant = 'primary',
  acceptedFormats = 'image/jpeg,image/jpg,image/png,image/gif,image/webp',
  maxSizeMB = 5,
  showPreview = true,
  previewImage = null,
  circular = false,
  buttonSize = 'md'
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(previewImage);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  // Dosya seçildiğinde
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // Dosya boyutu kontrolü
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`Dosya boyutu ${maxSizeMB}MB'dan küçük olmalıdır`);
      return;
    }

    // Dosya tipi kontrolü
    if (!acceptedFormats.includes(file.type)) {
      setError('Geçersiz dosya formatı. Sadece resim dosyaları yüklenebilir.');
      return;
    }

    setSelectedFile(file);
    setError('');
    setSuccess('');

    // Önizleme oluştur
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Resmi yükle
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Lütfen bir dosya seçin');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      
      // Endpoint'e göre field adını belirle
      if (endpoint.includes('avatar')) {
        formData.append('avatar', selectedFile);
      } else {
        formData.append('image', selectedFile);
      }

      const token = localStorage.getItem('token');
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setSuccess('Resim başarıyla yüklendi!');
        setSelectedFile(null);
        
        // Callback çağır
        if (onUploadSuccess) {
          onUploadSuccess(response.data);
        }
      }
    } catch (error) {
      console.error('Resim yükleme hatası:', error);
      setError(error.response?.data?.message || 'Resim yüklenirken bir hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  // Seçimi temizle
  const handleClear = () => {
    setSelectedFile(null);
    setPreview(previewImage);
    setError('');
    setSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-upload-container">
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {showPreview && preview && (
        <div className="mb-3 text-center">
          <Image 
            src={preview} 
            alt="Preview" 
            style={{
              maxWidth: circular ? '150px' : '100%',
              maxHeight: circular ? '150px' : '300px',
              objectFit: 'cover',
              borderRadius: circular ? '50%' : '8px',
              border: '2px solid #dee2e6'
            }}
            fluid={!circular}
            thumbnail
          />
        </div>
      )}

      <div className="d-flex gap-2 flex-wrap">
        <Form.Control
          type="file"
          ref={fileInputRef}
          accept={acceptedFormats}
          onChange={handleFileSelect}
          disabled={uploading}
          style={{ display: 'none' }}
        />
        
        <Button
          variant={buttonVariant}
          size={buttonSize}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <i className="fas fa-image me-2"></i>
          {selectedFile ? 'Farklı Resim Seç' : buttonText}
        </Button>

        {selectedFile && (
          <>
            <Button
              variant="success"
              size={buttonSize}
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Yükleniyor...
                </>
              ) : (
                <>
                  <i className="fas fa-upload me-2"></i>
                  Yükle
                </>
              )}
            </Button>

            <Button
              variant="secondary"
              size={buttonSize}
              onClick={handleClear}
              disabled={uploading}
            >
              <i className="fas fa-times me-2"></i>
              İptal
            </Button>
          </>
        )}
      </div>

      {selectedFile && (
        <div className="mt-2 text-muted small">
          <i className="fas fa-file me-1"></i>
          {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

