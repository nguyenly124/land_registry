require('dotenv').config();

const app = require('./src/app');
const { 
  connectToDatabase , 
  syncModels, 
  sequelize
} = require('./src/config/db');
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT;
// === TẠO HTTP SERVER + SOCKET.IO ===
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// === LƯU IO & ONLINE USERS VÀO APP ===
app.set('io', io);
app.set('onlineUsers', new Map());

// === KẾT NỐI DATABASE VỚI RETRY ===
const startServer = async () => {
  try {
    await connectToDatabase();
    await syncModels();
    console.log('Kết nối database thành công!');

    // === KHỞI ĐỘNG SERVER ===
    server.listen(PORT, () => {
      console.log(`Server đang chạy tại: http://localhost:${PORT}`);
      console.log(`WebSocket sẵn sàng tại: ws://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Không thể kết nối database:', error.message);
    console.log('Thử lại sau 5 giây...');
    setTimeout(startServer, 5000); // Tự động thử lại
  }
};

// === XỬ LÝ DỮ LIỆU SOCKET.IO ===
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Người dùng tham gia room theo account_id
  socket.on('join', (accountId) => {
    if (accountId) {
      socket.join(`user_${accountId}`);
      app.get('onlineUsers').set(socket.id, accountId);
      console.log(`User ${accountId} joined room: user_${accountId}`);
    }
  });

  socket.on('disconnect', () => {
    const accountId = app.get('onlineUsers').get(socket.id);
    app.get('onlineUsers').delete(socket.id);
    if (accountId) {
      console.log(`User ${accountId} disconnected`);
    }
  });
});

// === XỬ LÝ LỖI SERVER ===
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Cổng ${PORT} đã được sử dụng!`);
    process.exit(1);
  } else {
    console.error('Lỗi server:', err);
  }
});

startServer();