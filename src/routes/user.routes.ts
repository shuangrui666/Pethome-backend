import express from 'express';
import { body } from 'express-validator';
import { getUserProfile, updateUserProfile, getUsers, getUserStats } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = express.Router();

// 获取用户列表 (需要认证)
router.get('/', authenticate, getUsers);

// 获取自己的资料
router.get('/me', authenticate, getUserProfile);

// 获取其他用户资料
router.get('/:id', getUserProfile);

// 更新自己的资料
router.put('/me', authenticate, [
  body('username').optional().trim().isLength({ min: 3, max: 20 }),
  body('phone').optional().isMobilePhone('zh-CN'),
  body('bio').optional().isLength({ max: 200 }),
  body('avatar').optional().isURL()
], validate, updateUserProfile);

// 获取用户统计
router.get('/:id/stats', getUserStats);

export default router;
