const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const helmet = require('helmet');
const dotenv = require('dotenv');
const fs = require('fs');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const coursesRoutes = require('./routes/courses');
const streamsRoutes = require('./routes/streams');
const notificationsRoutes = require('./routes/notifications');
const questionsRoutes = require('./routes/questions');
const Notification = require('./models/Notification');

// Load env from server/.env if exists, otherwise from project root .env
const serverEnvPath = path.join(__dirname, '.env');
const rootEnvPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
} else if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config();
}
connectDB();

const app = express();
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL ? [process.env.CLIENT_URL] : true,
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotalar
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/streams', streamsRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/notifications', notificationsRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || true,
    methods: ["GET", "POST"]
  }
});

// 🔥 Bağlı kullanıcıları username ile tutmak için Map kullanıyoruz
const connectedUsers = new Map();

// Kategori listesi
const categories = [
  { id: 'frontend', name: 'Frontend' },
  { id: 'backend', name: 'Backend' },
  { id: 'database', name: 'Veritabanı' },
  { id: 'devops', name: 'DevOps' },
  { id: 'mobile', name: 'Mobil Geliştirme' }
];

// Oda bazlı kullanıcılar ve mesajlar
const roomUsers = {};
const roomMessages = {};

// Kategori listesini döndüren endpoint
app.get('/api/categories', (req, res) => {
  res.json(categories);
});

// Oda bazlı aktif kullanıcıları döndüren endpoint
app.get('/api/room-users/:roomId', (req, res) => {
  const { roomId } = req.params;
  res.json({ users: roomUsers[roomId] || [] });
});

// Oda bazlı mesaj geçmişini döndüren endpoint
app.get('/api/room-messages/:roomId', (req, res) => {
  const { roomId } = req.params;
  res.json({ messages: roomMessages[roomId] || [] });
});

io.on("connection", (socket) => {
  console.log("🟢 Kullanıcı bağlandı:", socket.id);
  // Kullanıcı login olduğunda kişisel odaya alın (bildirimler için)
  socket.on('userLogin', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
    }
  });

  // Canlı yayın odasına katıl
  socket.on('joinStream', ({ streamId, username }) => {
    if (streamId) {
      socket.join(`stream_${streamId}`);
      console.log(`${username || socket.id} yayına katıldı: ${streamId}`);
    }
  });

  // Canlı yayın yorumunu odaya yayınla
  socket.on('streamComment', (comment) => {
    if (comment?.streamId) {
      io.to(`stream_${comment.streamId}`).emit('streamComment', comment);
    }
  });

  // Mesaj bildirimi oluştur ve gönder
  socket.on('newMessage', async (data) => {
    try {
      const { recipientId, senderName, message, senderId, messageId } = data || {};
      if (!recipientId || !message) return;
      const notification = new Notification({
        userId: recipientId,
        type: 'message',
        title: 'Yeni Mesaj',
        content: `${senderName || 'Bir kullanıcı'} size mesaj gönderdi: ${String(message).substring(0, 50)}${String(message).length > 50 ? '...' : ''}`,
        link: `/livechat?sender=${senderId || ''}`,
        metadata: { messageId, senderId }
      });
      await notification.save();
      io.to(`user_${recipientId}`).emit('notification', notification);
    } catch (error) {
      console.error('Mesaj bildirimi hatası:', error);
    }
  });

  // Yeni ders bildirimi
  socket.on('newCourse', async (data) => {
    try {
      const { course, recipients = [] } = data || {};
      if (!course || !recipients.length) return;
      const notifications = recipients.map((userId) => ({
        userId,
        type: 'course',
        title: 'Yeni Ders Eklendi',
        content: `${course.title} dersi eklendi`,
        link: `/courses/${course._id}`,
        metadata: { courseId: course._id }
      }));
      const saved = await Notification.insertMany(notifications);
      saved.forEach((n) => io.to(`user_${n.userId}`).emit('notification', n));
    } catch (error) {
      console.error('Ders bildirimi hatası:', error);
    }
  });

  // Yeni yayın bildirimi
  socket.on('newStream', async (data) => {
    try {
      const { stream, recipients = [] } = data || {};
      if (!stream || !recipients.length) return;
      const notifications = recipients.map((userId) => ({
        userId,
        type: 'stream',
        title: 'Yeni Canlı Yayın',
        content: `${stream.title} yayını başladı`,
        link: `/canli-yayin`,
        metadata: { streamId: stream._id }
      }));
      const saved = await Notification.insertMany(notifications);
      saved.forEach((n) => io.to(`user_${n.userId}`).emit('notification', n));
    } catch (error) {
      console.error('Yayın bildirimi hatası:', error);
    }
  });

  // Kullanıcı bir odaya katılmak istediğinde
  socket.on("joinRoom", ({ roomId, username }) => {
    socket.join(roomId);
    connectedUsers.set(socket.id, username);
    // Oda kullanıcılarını güncelle
    if (!roomUsers[roomId]) roomUsers[roomId] = [];
    if (!roomUsers[roomId].includes(username)) roomUsers[roomId].push(username);
    // Odaya katılanlara bilgi gönder
    io.to(roomId).emit("roomUsers", {
      roomId,
      users: roomUsers[roomId]
    });
    // Oda mesaj geçmişini gönder
    if (roomMessages[roomId]) {
      socket.emit("roomHistory", roomMessages[roomId]);
    }
  });

  // Kullanıcı adını kaydet
  socket.on("register", (username) => {
    connectedUsers.set(socket.id, username);
    console.log("✅ Kullanıcı eklendi:", username);
    
    // Güncel kullanıcı listesi gönder
    io.emit("onlineUsers", Array.from(connectedUsers.values()));
  });

  // Kullanıcı adı güncelleme
  socket.on("updateUsername", (newUsername) => {
    const oldUsername = connectedUsers.get(socket.id);
    if (oldUsername) {
      connectedUsers.set(socket.id, newUsername);
      console.log("🔄 Kullanıcı adı güncellendi:", oldUsername, "->", newUsername);
      
      // Tüm kullanıcılara yeni kullanıcı adını bildir
      io.emit("usernameUpdated", {
        oldUsername,
        newUsername,
        socketId: socket.id
      });
      
      // Güncel kullanıcı listesini gönder
      io.emit("onlineUsers", Array.from(connectedUsers.values()));
    }
  });

  // Odaya mesaj gönder
  socket.on("chatMessage", ({ roomId, message }) => {
    const username = connectedUsers.get(socket.id);
    const msgObj = {
      message,
      username,
      socketId: socket.id,
      time: new Date().toISOString()
    };
    // Mesajı oda geçmişine ekle
    if (!roomMessages[roomId]) roomMessages[roomId] = [];
    roomMessages[roomId].push(msgObj);
    io.to(roomId).emit("chatMessage", msgObj);
    console.log(`💬 [${roomId}] ${username}:`, message);
  });

  // Kullanıcı bağlantısı kesildiğinde
  socket.on("disconnect", () => {
    const username = connectedUsers.get(socket.id);
    connectedUsers.delete(socket.id);
    // Oda kullanıcılarından çıkar
    for (const roomId in roomUsers) {
      roomUsers[roomId] = roomUsers[roomId].filter(u => u !== username);
      // Odaya güncel kullanıcı listesini gönder
      io.to(roomId).emit("roomUsers", {
        roomId,
        users: roomUsers[roomId]
      });
    }
    console.log("🔴 Kullanıcı ayrıldı:", username || socket.id);
  });
});

// 🌐 Bağlı kullanıcı adlarını döndüren API endpoint
app.get('/api/online-users', (req, res) => {
  res.json({ users: Array.from(connectedUsers.values()) });
});

// Production: Serve React build
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '..', 'client', 'build');
  app.use(express.static(clientBuildPath));
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Sunucu çalışıyor: ${PORT}`));
