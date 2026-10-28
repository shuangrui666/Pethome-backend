import express from 'express';
import { body } from 'express-validator';
import {
  createDonation,
  getDonationList,
  getDonationById,
  getMyDonations,
  cancelDonation,
  getShelterList,
  getShelterDetails,
  donateToShelter,
  getDonationTracking
} from '../controllers/donation.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = express.Router();

// 获取捐赠列表 (公开)
router.get('/', getDonationList);

// 获取我的捐赠
router.get('/my', authenticate, getMyDonations);

// 获取捐赠详情
router.get('/:id', getDonationById);

// 创建捐赠
router.post('/', authenticate, [
  body('donationType').isIn(['money', 'food', 'supplies']).withMessage('捐赠类型无效'),
  body('amount').optional().isNumeric().withMessage('金额必须是数字'),
  body('foodType').optional().trim(),
  body('quantity').optional().isNumeric(),
  body('targetShelterId').optional().notEmpty(),
  body('message').optional().trim().isLength({ max: 200 })
], validate, createDonation);

// 取消捐赠
router.put('/:id/cancel', authenticate, cancelDonation);

// 获取追踪记录
router.get('/:id/tracking', authenticate, getDonationTracking);

// 获取流浪动物救助站列表
router.get('/shelters', getShelterList);

// 获取救助站详情
router.get('/shelters/:id', getShelterDetails);

// 向救助站捐赠
router.post('/shelters/:id/donate', authenticate, [
  body('donationType').isIn(['money', 'food', 'supplies']).withMessage('捐赠类型无效'),
  body('amount').optional().isNumeric().withMessage('金额必须是数字'),
  body('foodType').optional().trim(),
  body('quantity').optional().isNumeric(),
  body('message').optional().trim().isLength({ max: 200 })
], validate, donateToShelter);

export default router;
