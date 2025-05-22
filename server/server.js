const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Rotalar
app.use('/api/auth', authRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Sunucu çalışıyor: ${PORT}`));
