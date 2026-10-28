import express from 'express';
import { body } from 'express-validator';
import {
  createKindergarten,
  getKindergartenList,
  getKindergartenById,
  updateKindergarten,
  deleteKindergarten,
  enrollPet,
  unenrollPet,
  getMyKindergartens,
  createVideoRoom,
  closeVideoRoom,
  getClassSchedule,
  updateClassSchedule
} from '../controllers/kindergarten.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { upload } from '../middleware/upload.middleware';

const router = express.Router();

// 获取幼儿园列表 (公开)
router.get('/', getKindergartenList);

// 获取我的幼儿园
router.get('/my', authenticate, getMyKindergartens);

// 创建幼儿园 (需要权限)
router.post('/', authenticate, upload.array('images', 10), [
  body('name').trim().isLength({ min: 3, max: 50 }).withMessage('幼儿园名称 3-50 个字符'),
  body('description').trim().isLength({ min: 20 }).withMessage('请详细描述'),
  body('address').trim().notEmpty().withMessage('地址不能为空'),
  body('phone').trim().notEmpty().withMessage('联系电话不能为空'),
  body('pricePerMonth').isNumeric().withMessage('请输入月费'),
  body('maxCapacity').isNumeric().withMessage('请输入最大容量')
], validate, createKindergarten);

// 获取幼儿园详情
router.get('/:id', getKindergartenById);

// 更新幼儿园
router.put('/:id', authenticate, upload.array('images', 10), [
  body('name').optional().trim().isLength({ min: 3, max: 50 }),
  body('description').optional().trim().isLength({ min: 20 }),
  body('address').optional().trim().notEmpty(),
  body('phone').optional().trim().notEmpty(),
  body('pricePerMonth').optional().isNumeric(),
  body('maxCapacity').optional().isNumeric()
], validate, updateKindergarten);

// 删除幼儿园
router.delete('/:id', authenticate, deleteKindergarten);

// 报名入园
router.post('/:id/enroll', authenticate, [
  body('petId').notEmpty().withMessage('请选择宠物'),
  body('startDate').notEmpty().withMessage('请选择开始日期'),
  body('plan').isIn(['daily', 'weekly', 'monthly']).withMessage('计划类型无效')
], validate, enrollPet);

// 退园
router.post('/:id/unenroll', authenticate, [
  body('petId').notEmpty().withMessage('请选择宠物'),
  body('endDate').notEmpty().withMessage('请选择结束日期'),
  body('reason').optional().trim().isLength({ max: 200 })
], validate, unenrollPet);

// 创建视频房间 (实时监控)
router.post('/:id/video-room', authenticate, [
  body('roomName').trim().notEmpty().withMessage('房间名称不能为空')
], validate, createVideoRoom);

// 关闭视频房间
router.delete('/:id/video-room/:roomId', authenticate, closeVideoRoom);

// 获取课程表
router.get('/:id/schedule', getClassSchedule);

// 更新课程表
router.put('/:id/schedule', authenticate, [
  body('classes').isArray().withMessage('课程必须是数组')
], validate, updateClassSchedule);

export default router;
