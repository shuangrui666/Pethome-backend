import express from 'express';
import { body } from 'express-validator';
import {
  createDiagnosis,
  getDiagnosisHistory,
  getDiagnosisById,
  getMedicationRecommendations,
  getVetList,
  bookVetAppointment,
  getMedicalResources
} from '../controllers/medical.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = express.Router();

// 获取医疗资源 (公开)
router.get('/resources', getMedicalResources);

// 获取兽医列表 (公开)
router.get('/vets', getVetList);

// 创建诊断
router.post('/diagnosis', authenticate, [
  body('petId').notEmpty().withMessage('请选择宠物'),
  body('symptoms').trim().notEmpty().withMessage('请描述症状'),
  body('duration').optional().trim(),
  body('temperature').optional().isNumeric(),
  body('appetite').optional().isIn(['normal', 'decreased', 'none']),
  body('behavior').optional().trim()
], validate, createDiagnosis);

// 获取诊断历史
router.get('/diagnosis', authenticate, getDiagnosisHistory);

// 获取诊断详情
router.get('/diagnosis/:id', authenticate, getDiagnosisById);

// 获取药品推荐
router.get('/medicines', authenticate, getMedicationRecommendations);

// 预约兽医
router.post('/vet-appointment', authenticate, [
  body('vetId').notEmpty().withMessage('请选择兽医'),
  body('petId').notEmpty().withMessage('请选择宠物'),
  body('appointmentTime').notEmpty().withMessage('请选择预约时间'),
  body('reason').trim().notEmpty().withMessage('请说明预约原因'),
  body('contactPhone').trim().notEmpty().withMessage('请联系电话不能为空')
], validate, bookVetAppointment);

export default router;
