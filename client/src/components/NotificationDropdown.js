import React, { useState, useEffect } from 'react';
import { Dropdown, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const NotificationDropdown = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      setNotifications(response.data);
    } catch (err) {
      setError('Bildirimler yüklenirken bir hata oluştu');
      console.error('Bildirim yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Her 30 saniyede bir güncelle
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      setNotifications(notifications.map(notification =>
        notification._id === notificationId
          ? { ...notification, read: true }
          : notification
      ));
    } catch (err) {
      console.error('Bildirim güncelleme hatası:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'question':
        return 'bi-question-circle';
      case 'answer':
        return 'bi-chat-square-text';
      case 'mention':
        return 'bi-at';
      case 'system':
        return 'bi-bell';
      default:
        return 'bi-bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'question':
        return 'primary';
      case 'answer':
        return 'success';
      case 'mention':
        return 'warning';
      case 'system':
        return 'info';
      default:
        return 'secondary';
    }
  };

  return (
    <Dropdown align="end" className="mx-2">
      <Dropdown.Toggle 
        variant="light" 
        id="dropdown-notifications" 
        className="position-relative border-0 bg-transparent text-dark fw-medium hover-lift"
      >
        <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" 
             style={{width: 32, height: 32}}>
          <i className="bi bi-bell text-primary"></i>
        </div>
        {unreadCount > 0 && (
          <Badge 
            bg="danger" 
            pill 
            className="position-absolute top-0 start-100 translate-middle"
            style={{ fontSize: '0.7rem', padding: '0.25rem 0.4rem' }}
          >
            {unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu 
        className="shadow-sm border-0 rounded-3 p-0" 
        style={{ width: '320px', maxHeight: '400px' }}
      >
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h6 className="mb-0 fw-bold">Bildirimler</h6>
          {unreadCount > 0 && (
            <Badge bg="primary" pill className="ms-2">
              {unreadCount} yeni
            </Badge>
          )}
        </div>

        <div className="notification-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {loading ? (
            <div className="text-center p-4">
              <Spinner animation="border" size="sm" className="text-primary" />
              <span className="ms-2 text-muted">Yükleniyor...</span>
            </div>
          ) : error ? (
            <div className="text-center p-4 text-danger">
              <i className="bi bi-exclamation-circle me-2"></i>
              {error}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center p-4 text-muted">
              <i className="bi bi-bell-slash fs-4 d-block mb-2"></i>
              Henüz bildiriminiz yok
            </div>
          ) : (
            notifications.map(notification => (
              <Dropdown.Item
                key={notification._id}
                className={`p-3 border-bottom hover-lift ${!notification.read ? 'bg-light' : ''}`}
                onClick={() => !notification.read && handleMarkAsRead(notification._id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex align-items-start">
                  <div className={`bg-${getNotificationColor(notification.type)} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3`}
                       style={{width: 36, height: 36, minWidth: 36}}>
                    <i className={`bi ${getNotificationIcon(notification.type)} text-${getNotificationColor(notification.type)}`}></i>
                  </div>
                  <div className="flex-grow-1">
                    <p className="mb-1" style={{ fontSize: '0.9rem' }}>
                      {notification.message}
                    </p>
                    <small className="text-muted d-flex align-items-center">
                      <i className="bi bi-clock me-1"></i>
                      {new Date(notification.createdAt).toLocaleString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </small>
                  </div>
                  {!notification.read && (
                    <div className="ms-2">
                      <div className="bg-primary rounded-circle" style={{width: 8, height: 8}}></div>
                    </div>
                  )}
                </div>
              </Dropdown.Item>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-2 border-top text-center">
            <button 
              className="btn btn-link text-decoration-none text-primary p-2 hover-lift"
              onClick={() => window.location.reload()}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Yenile
            </button>
          </div>
        )}
      </Dropdown.Menu>

      <style jsx>{`
        .hover-lift {
          transition: transform 0.2s ease-in-out;
        }
        .hover-lift:hover {
          transform: translateY(-2px);
        }
        .notification-list::-webkit-scrollbar {
          width: 6px;
        }
        .notification-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .notification-list::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        .notification-list::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        @media (max-width: 576px) {
          .dropdown-menu {
            position: fixed !important;
            top: 60px !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            border-radius: 0 !important;
            border-top: 1px solid #dee2e6 !important;
          }
        }
      `}</style>
    </Dropdown>
  );
};

export default NotificationDropdown; 