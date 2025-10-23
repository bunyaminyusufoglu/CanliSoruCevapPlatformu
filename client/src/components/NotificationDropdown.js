import React, { useState, useEffect, useRef } from 'react';
import { Dropdown, Badge, ListGroup, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { io } from 'socket.io-client';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  // Socket.io bağlantısı
  useEffect(() => {
    if (user) {
      socketRef.current = io(process.env.REACT_APP_SOCKET_URL || '/');
      socketRef.current.emit('userLogin', user._id);

      socketRef.current.on('notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [user]);

  // Bildirimleri getir
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('/api/notifications', {
          params: {
            type: selectedType !== 'all' ? selectedType : undefined,
            page: 1,
            limit: 10
          }
        });

        if (response.data.success) {
          setNotifications(response.data.notifications);
          setUnreadCount(response.data.unreadCount);
        }
      } catch (error) {
        console.error('Bildirimler yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchNotifications();
    }
  }, [user, selectedType]);

  // Bildirimi okundu olarak işaretle
  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await axios.put(`/api/notifications/${notificationId}/read`);
      if (response.data.success) {
        setNotifications(prev =>
          prev.map(n =>
            n._id === notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Bildirim güncellenirken hata:', error);
    }
  };

  // Tüm bildirimleri okundu olarak işaretle
  const handleMarkAllAsRead = async () => {
    try {
      const response = await axios.put('/api/notifications/read-all');
      if (response.data.success) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Bildirimler güncellenirken hata:', error);
    }
  };

  // Bildirime tıklandığında
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
    setShow(false);
  };

  // Bildirim tipine göre ikon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'course':
        return '📚';
      case 'message':
        return '💬';
      case 'stream':
        return '🎥';
      case 'system':
        return '⚙️';
      default:
        return '📢';
    }
  };

  return (
    <Dropdown show={show} onToggle={(isOpen) => setShow(isOpen)}>
      <Dropdown.Toggle variant="link" id="notification-dropdown" className="position-relative">
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <Badge
            bg="danger"
            pill
            className="position-absolute top-0 start-100 translate-middle"
            style={{ fontSize: '0.7rem' }}
          >
            {unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu
        align="end"
        style={{ width: '300px', maxHeight: '400px', overflowY: 'auto' }}
      >
        <div className="px-3 py-2 border-bottom">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Bildirimler</h6>
            {unreadCount > 0 && (
              <Button
                variant="link"
                size="sm"
                className="text-decoration-none p-0"
                onClick={handleMarkAllAsRead}
              >
                Tümünü okundu işaretle
              </Button>
            )}
          </div>
          <div className="btn-group btn-group-sm w-100">
            <Button
              variant={selectedType === 'all' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setSelectedType('all')}
            >
              Tümü
            </Button>
            <Button
              variant={selectedType === 'course' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setSelectedType('course')}
            >
              Dersler
            </Button>
            <Button
              variant={selectedType === 'message' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setSelectedType('message')}
            >
              Mesajlar
            </Button>
            <Button
              variant={selectedType === 'stream' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setSelectedType('stream')}
            >
              Yayınlar
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center p-3">
            <Spinner animation="border" size="sm" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center p-3 text-muted">
            Bildirim bulunmuyor
          </div>
        ) : (
          <ListGroup variant="flush">
            {notifications.map(notification => (
              <ListGroup.Item
                key={notification._id}
                action
                className={`d-flex align-items-start p-2 ${
                  !notification.isRead ? 'bg-light' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="me-2" style={{ fontSize: '1.2rem' }}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <h6 className="mb-1">{notification.title}</h6>
                    <small className="text-muted">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: tr
                      })}
                    </small>
                  </div>
                  <p className="mb-0 small">{notification.content}</p>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationDropdown; 