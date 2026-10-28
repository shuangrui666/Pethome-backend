import express, { Application } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';

// 导入路由
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import petRoutes from './routes/pet.routes';
import adoptionRoutes from './routes/adoption.routes';
import lostPetRoutes from './routes/lostPet.routes';
import postRoutes from './routes/post.routes';
import serviceRoutes from './routes/service.routes';
import kindergartenRoutes from './routes/kindergarten.routes';
import shopRoutes from './routes/shop.routes';
import socialRoutes from './routes/social.routes';
import donationRoutes from './routes/donation.routes';
import medicalRoutes from './routes/medical.routes';
import trainingRoutes from './routes/training.routes';

dotenv.config();

const app: Application = express();
const httpServer = createServer(app);

// Socket.io 配置
const io = new Server(httpServer, {
  cors: {
    origin: process.env.WS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

// 中间件
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`=== 请求：${req.method} ${req.path} ===`);
  console.log('请求头:', req.headers);
  console.log('请求体:', req.body);
  next();
});

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/adoption', adoptionRoutes);
app.use('/api/lost-pets', lostPetRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/kindergarten', kindergartenRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/medical', medicalRoutes);
app.use('/api/training', trainingRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.io 连接处理
io.on('connection', (socket) => {
  console.log('客户端连接:', socket.id);

  // 加入监控房间
  socket.on('join-monitor', (roomId: string) => {
    socket.join(roomId);
    console.log(`客户端 ${socket.id} 加入监控房间：${roomId}`);
  });

  // 离开监控房间
  socket.on('leave-monitor', (roomId: string) => {
    socket.leave(roomId);
    console.log(`客户端 ${socket.id} 离开监控房间：${roomId}`);
  });

  // 实时视频帧推送
  socket.on('video-frame', (data: { roomId: string; frame: string }) => {
    socket.to(data.roomId).emit('video-frame', data.frame);
  });

  // 聊天消息
  socket.on('chat-message', (data: { roomId: string; message: any }) => {
    socket.to(data.roomId).emit('chat-message', data.message);
  });

  socket.on('disconnect', () => {
    console.log('客户端断开连接:', socket.id);
  });
});

// 数据库连接
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pethome');
    console.log('MongoDB 连接成功');
  } catch (error) {
    console.error('MongoDB 连接失败:', error);
    process.exit(1);
  }
};

// 启动服务器
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
    console.log(`环境：${process.env.NODE_ENV}`);
  });
});

// 导出 io 实例供其他模块使用
export { io };
export default app;
