import express from 'express';
import { body } from 'express-validator';
import {
  findCompanions,
  createMeetup,
  getMeetupList,
  getMyMeetups,
  joinMeetup,
  leaveMeetup,
  cancelMeetup,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  unfriend,
  getFriends,
  getFriendRequests
} from '../controllers/social.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = express.Router();

// 查找附近养宠人
router.get('/companions', authenticate, findCompanions);

// 获取我的好友
router.get('/friends', authenticate, getFriends);

// 获取好友请求
router.get('/friend-requests', authenticate, getFriendRequests);

// 发送好友请求
router.post('/friend-request', authenticate, [
  body('targetUserId').notEmpty().withMessage('请选择要添加的用户'),
  body('message').optional().trim().isLength({ max: 100 })
], validate, sendFriendRequest);

// 接受好友请求
router.post('/friend-request/accept', authenticate, [
  body('requestId').notEmpty().withMessage('请求 ID 不能为空')
], validate, acceptFriendRequest);

// 拒绝好友请求
router.post('/friend-request/reject', authenticate, [
  body('requestId').notEmpty().withMessage('请求 ID 不能为空')
], validate, rejectFriendRequest);

// 取消好友
router.delete('/friend/:friendId', authenticate, unfriend);

// 创建遛狗聚会
router.post('/meetup', authenticate, [
  body('title').trim().isLength({ min: 5, max: 50 }).withMessage('标题 5-50 个字符'),
  body('description').trim().isLength({ min: 10, max: 300 }).withMessage('描述 10-300 个字符'),
  body('location').trim().notEmpty().withMessage('地点不能为空'),
  body('meetupTime').notEmpty().withMessage('请选择聚会时间'),
  body('maxParticipants').isNumeric().withMessage('请输入最大参与人数')
], validate, createMeetup);

// 获取聚会列表
router.get('/meetup', authenticate, getMeetupList);

// 获取我的聚会
router.get('/meetup/my', authenticate, getMyMeetups);

// 加入聚会
router.post('/meetup/:id/join', authenticate, joinMeetup);

// 退出聚会
router.post('/meetup/:id/leave', authenticate, leaveMeetup);

// 取消聚会
router.delete('/meetup/:id', authenticate, cancelMeetup);

export default router;
