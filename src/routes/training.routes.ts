import express from 'express';
import { body } from 'express-validator';
import {
  createTrainingService,
  getTrainingServiceList,
  getTrainingServiceById,
  updateTrainingService,
  deleteTrainingService,
  enrollTraining,
  cancelEnrollment,
  getMyTrainings,
  updateTrainingProgress,
  getTrainingPlan
} from '../controllers/training.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { upload } from '../middleware/upload.middleware';

const router = express.Router();

// 获取训练服务列表 (公开)
router.get('/', getTrainingServiceList);

// 获取我的训练服务
router.get('/my', authenticate, getMyTrainings);

// 创建训练服务 (需要权限)
router.post('/', authenticate, upload.array('images', 5), [
  body('trainerName').trim().notEmpty().withMessage('训导师姓名不能为空'),
  body('description').trim().isLength({ min: 20 }).withMessage('请详细描述服务'),
  body('price').isNumeric().withMessage('请输入价格'),
  body('duration').isNumeric().withMessage('请输入时长 (小时)'),
  body('location').trim().notEmpty().withMessage('训练地点不能为空')
], validate, createTrainingService);

// 获取训练服务详情
router.get('/:id', getTrainingServiceById);

// 更新训练服务
router.put('/:id', authenticate, upload.array('images', 5), [
  body('trainerName').optional().trim().notEmpty(),
  body('description').optional().trim().isLength({ min: 20 }),
  body('price').optional().isNumeric(),
  body('duration').optional().isNumeric(),
  body('location').optional().trim().notEmpty()
], validate, updateTrainingService);

// 删除训练服务
router.delete('/:id', authenticate, deleteTrainingService);

// 报名训练
router.post('/:id/enroll', authenticate, [
  body('petId').notEmpty().withMessage('请选择宠物'),
  body('trainingType').isIn(['basic', 'advanced', 'behavior', 'agility']).withMessage('训练类型无效'),
  body('startDate').notEmpty().withMessage('请选择开始日期'),
  body('specialNeeds').optional().trim().isLength({ max: 300 })
], validate, enrollTraining);

// 取消报名
router.put('/:id/cancel', authenticate, [
  body('enrollmentId').notEmpty().withMessage('报名 ID 不能为空'),
  body('reason').optional().trim().isLength({ max: 200 })
], validate, cancelEnrollment);

// 更新训练进度
router.put('/:id/progress', authenticate, [
  body('enrollmentId').notEmpty().withMessage('报名 ID 不能为空'),
  body('stage').isIn(['beginner', 'intermediate', 'advanced', 'completed']).withMessage('阶段无效'),
  body('progress').isInt({ min: 0, max: 100 }).withMessage('进度 0-100'),
  body('notes').optional().trim().isLength({ max: 500 })
], validate, updateTrainingProgress);

// 获取训练计划
router.get('/:id/plan/:enrollmentId', authenticate, getTrainingPlan);

export default router;
