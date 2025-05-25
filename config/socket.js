const socketIO = require('socket.io');
const Notification = require('../models/Notification');

const initializeSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('Yeni kullanıcı bağlandı');
    let userId = null;

    socket.on('userLogin', (id) => {
      userId = id;
      socket.join(`user_${id}`);
    });

    socket.on('joinStream', (data) => {
      socket.join(`stream_${data.streamId}`);
      console.log(`${data.username} yayına katıldı: ${data.streamId}`);
    });

    socket.on('streamComment', (comment) => {
      io.to(`stream_${comment.streamId}`).emit('streamComment', comment);
    });

    socket.on('newMessage', async (data) => {
      try {
        const { recipientId, senderName, message } = data;
        const notification = new Notification({
          userId: recipientId,
          type: 'message',
          title: 'Yeni Mesaj',
          content: `${senderName} size mesaj gönderdi: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
          link: `/livechat?sender=${data.senderId}`,
          metadata: {
            messageId: data.messageId,
            senderId: data.senderId
          }
        });
        await notification.save();
        io.to(`user_${recipientId}`).emit('notification', notification);
      } catch (error) {
        console.error('Mesaj bildirimi oluşturulurken hata:', error);
      }
    });

    socket.on('newCourse', async (data) => {
      try {
        const { course, recipients } = data;
        const notifications = recipients.map(userId => ({
          userId,
          type: 'course',
          title: 'Yeni Ders Eklendi',
          content: `${course.title} dersi eklendi`,
          link: `/courses/${course._id}`,
          metadata: {
            courseId: course._id
          }
        }));

        await Notification.insertMany(notifications);
        notifications.forEach(notification => {
          io.to(`user_${notification.userId}`).emit('notification', notification);
        });
      } catch (error) {
        console.error('Ders bildirimi oluşturulurken hata:', error);
      }
    });

    socket.on('newStream', async (data) => {
      try {
        const { stream, recipients } = data;
        const notifications = recipients.map(userId => ({
          userId,
          type: 'stream',
          title: 'Yeni Canlı Yayın',
          content: `${stream.title} yayını başladı`,
          link: `/canli-yayin`,
          metadata: {
            streamId: stream._id
          }
        }));

        await Notification.insertMany(notifications);
        notifications.forEach(notification => {
          io.to(`user_${notification.userId}`).emit('notification', notification);
        });
      } catch (error) {
        console.error('Yayın bildirimi oluşturulurken hata:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Kullanıcı ayrıldı');
    });
  });

  return io;
};

module.exports = initializeSocket; 