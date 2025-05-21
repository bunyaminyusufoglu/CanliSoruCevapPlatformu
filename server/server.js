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

// 🔥 Bağlı kullanıcıları tutmak için Set yapısı
const connectedUsers = new Set();

io.on("connection", (socket) => {
  console.log("Kullanıcı bağlandı: ", socket.id);
  connectedUsers.add(socket.id);
  console.log("Şu anki bağlı kullanıcılar:", [...connectedUsers]);

  // Gelen mesajı tüm kullanıcılara yay
  socket.on("chatMessage", (msg) => {
    io.emit("chatMessage", msg);
    console.log("Mesaj: ", msg);
  });

  // Kullanıcı bağlantısı kesildiğinde
  socket.on("disconnect", () => {
    connectedUsers.delete(socket.id);
    console.log("Kullanıcı ayrıldı: ", socket.id);
    console.log("Kalan kullanıcılar:", [...connectedUsers]);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Sunucu çalışıyor: ${PORT}`));
