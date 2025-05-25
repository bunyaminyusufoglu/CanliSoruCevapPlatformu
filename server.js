require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');

const connectDB = require('./config/database');
const initializeSocket = require('./config/socket');
const errorHandler = require('./middleware/error');

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB bağlantısı
connectDB();

// Middleware'ler
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100 // IP başına limit
});
app.use(limiter);

// Static dosyalar
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/streams', require('./routes/streams'));
app.use('/api/notifications', require('./routes/notifications'));

// Production'da client build'ini servis et
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Error handling middleware
app.use(errorHandler);

const server = http.createServer(app);

// Socket.io başlatma
initializeSocket(server);

server.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
}); 