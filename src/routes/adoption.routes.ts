import express from 'express';
import { body } from 'express-validator';
import {
  createAdoption,
  getAdoptionList,
  getAdoptionById,
  updateAdoption,
  deleteAdoption,
  approveAdoption,
  rejectAdoption,
  getMyAdoptions,
  cancelAdoption,
  completeAdoption
} from '../controllers/adoption.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { upload } from '../middleware/upload.middleware';

const router = express.Router();

// 获取领养申请列表 (公开浏览无需认证，创建/管理需要认证)
router.get('/', getAdoptionList);

// 获取我的领养申请
router.get('/my', authenticate, getMyAdoptions);

// 创建领养申请
router.post('/', authenticate, upload.array('proofImages', 3), [
  body('petId').notEmpty().withMessage('请选择要领养的宠物'),
  body('reason').trim().isLength({ min: 10, max: 1000 }).withMessage('领养理由 10-1000 个字符'),
  body('livingSituation').isIn(['own-house', 'rent-house', 'dormitory', 'with-parents']).withMessage('居住环境类型无效'),
  body('applicantPhone').trim().isLength({ min: 11, max: 11 }).withMessage('手机号码必须 11 位'),
  body('applicantEmail').isEmail().withMessage('请输入有效的邮箱地址'),
  body('applicantAddress').trim().isLength({ min: 5, max: 200 }).withMessage('居住地址 5-200 个字符'),
  body('otherPets').isBoolean().withMessage('其他宠物字段无效'),
  body('familySupport').isBoolean().withMessage('家人支持字段无效'),
  body('experience').optional().trim().isLength({ max: 500 }).withMessage('养宠经验不能超过 500 个字符')
], validate, createAdoption);

// 获取领养申请详情
router.get('/:id', authenticate, getAdoptionById);

// 更新领养申请 (需要认证)
router.put('/:id', authenticate, upload.array('proofImages', 3), [
  body('reason').optional().trim().isLength({ min: 10, max: 500 }),
  body('livingSituation').optional().isIn(['own-house', 'rent-house', 'dormitory', 'with-parents']).withMessage('居住环境类型无效'),
  body('experience').optional().trim().isLength({ max: 500 }).withMessage('养宠经验不能超过 500 个字符')
], validate, updateAdoption);

// 删除领养申请 (需要认证)
router.delete('/:id', authenticate, deleteAdoption);

// 审核通过 (需要权限)
router.put('/:id/approve', authenticate, [
  body('message').optional().trim().isLength({ max: 200 })
], validate, approveAdoption);

// 审核拒绝 (需要权限)
router.put('/:id/reject', authenticate, [
  body('reason').trim().notEmpty().withMessage('请说明拒绝原因')
], validate, rejectAdoption);

// 取消领养申请 (pending → cancelled)
router.patch('/:id/cancel', authenticate, cancelAdoption);

// 完成领养 (approved → completed)
router.patch('/:id/complete', authenticate, completeAdoption);

export default router;
