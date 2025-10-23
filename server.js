const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/streams', require('./routes/streams'));
app.use('/api/notifications', require('./routes/notifications'));

// Socket.io bağlantı yönetimi
io.on('connection', (socket) => {
  console.log('Yeni kullanıcı bağlandı');

  // Kullanıcı kimliğini sakla
  let userId = null;

  // Kullanıcı girişi
  socket.on('userLogin', (id) => {
    userId = id;
    socket.join(`user_${id}`);
  });

  // Yayın olayları
  socket.on('joinStream', (data) => {
    socket.join(`stream_${data.streamId}`);
    console.log(`${data.username} yayına katıldı: ${data.streamId}`);
  });

  socket.on('streamComment', (comment) => {
    io.to(`stream_${comment.streamId}`).emit('streamComment', comment);
  });

  // Yeni mesaj bildirimi
  socket.on('newMessage', async (data) => {
    try {
      const { recipientId, senderName, message } = data;
      
      // Bildirim oluştur
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

      // Alıcıya bildirim gönder
      io.to(`user_${recipientId}`).emit('notification', notification);
    } catch (error) {
      console.error('Mesaj bildirimi oluşturulurken hata:', error);
    }
  });

  // Yeni ders bildirimi
  socket.on('newCourse', async (data) => {
    try {
      const { course, recipients } = data;
      
      // Tüm kullanıcılara bildirim gönder
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

      // Her kullanıcıya bildirim gönder
      notifications.forEach(notification => {
        io.to(`user_${notification.userId}`).emit('notification', notification);
      });
    } catch (error) {
      console.error('Ders bildirimi oluşturulurken hata:', error);
    }
  });

  // Yeni yayın bildirimi
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

// server.listen yerine http server'ı dinle
server.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
}); 