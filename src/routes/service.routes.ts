import express from 'express';
import { body } from 'express-validator';
import {
  createService,
  getServiceList,
  getServiceById,
  updateService,
  deleteService,
  getMyServices,
  confirmService,
  completeService,
  cancelService,
  rateService
} from '../controllers/service.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { upload } from '../middleware/upload.middleware';

const router = express.Router();

// 获取服务列表 (公开)
router.get('/', getServiceList);

// 获取我的服务预约
router.get('/my', authenticate, getMyServices);

// 创建服务预约
router.post('/', authenticate, [
  body('serviceType').isIn(['walk', 'grooming', 'boarding', 'training']).withMessage('服务类型无效'),
  body('providerId').notEmpty().withMessage('请选择服务提供者'),
  body('petId').notEmpty().withMessage('请选择宠物'),
  body('serviceDate').notEmpty().withMessage('请选择服务日期'),
  body('serviceTime').trim().notEmpty().withMessage('请指定服务时间'),
  body('duration').optional().isNumeric(),
  body('address').optional().trim(),
  body('specialRequirements').optional().trim().isLength({ max: 500 })
], validate, createService);

// 获取服务详情
router.get('/:id', getServiceById);

// 更新服务预约
router.put('/:id', authenticate, [
  body('serviceDate').optional().notEmpty(),
  body('serviceTime').optional().trim().notEmpty(),
  body('duration').optional().isNumeric(),
  body('address').optional().trim(),
  body('specialRequirements').optional().trim().isLength({ max: 500 })
], validate, updateService);

// 删除服务预约
router.delete('/:id', authenticate, deleteService);

// 确认服务 (服务提供者)
router.put('/:id/confirm', authenticate, confirmService);

// 完成服务
router.put('/:id/complete', authenticate, [
  body('summary').optional().trim().isLength({ max: 500 }),
  body('photos').optional().isArray()
], validate, completeService);

// 取消服务
router.put('/:id/cancel', authenticate, [
  body('reason').trim().notEmpty().withMessage('请说明取消原因')
], validate, cancelService);

// 评价服务
router.post('/:id/rate', authenticate, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('评分 1-5 分'),
  body('comment').optional().trim().isLength({ max: 500 })
], validate, rateService);

export default router;
