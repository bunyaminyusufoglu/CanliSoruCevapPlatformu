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

// Socket.io bağlantı yönetimi
io.on('connection', (socket) => {
  console.log('Yeni kullanıcı bağlandı');

  socket.on('joinStream', (data) => {
    socket.join(`stream_${data.streamId}`);
    console.log(`${data.username} yayına katıldı: ${data.streamId}`);
  });

  socket.on('streamComment', (comment) => {
    io.to(`stream_${comment.streamId}`).emit('streamComment', comment);
  });

  socket.on('disconnect', () => {
    console.log('Kullanıcı ayrıldı');
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/streams', require('./routes/streams'));

// server.listen yerine http server'ı dinle
server.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
}); 