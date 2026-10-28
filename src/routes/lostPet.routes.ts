import express from 'express';
import { body } from 'express-validator';
import {
  reportLostPet as createLostPet,
  getLostPets as getLostPetList,
  getLostPetById,
  updateLostPetStatus as updateLostPet,
  deleteLostPet,
  getMyLostPets,
  submitClue,
  matchLostPets as getMatches,
  updateLostPetStatus as confirmFound
} from '../controllers/lostPet.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { upload } from '../middleware/upload.middleware';

const router = express.Router();

// 获取走失宠物列表 (公开)
router.get('/', getLostPetList);

// 获取我的走失宠物报告
router.get('/my', authenticate, getMyLostPets);

// 创建走失宠物报告
router.post('/', authenticate, upload.array('images', 5), [
  body('petName').trim().notEmpty().withMessage('宠物名字不能为空'),
  body('species').isIn(['dog', 'cat', 'other']).withMessage('物种类型无效'),
  body('breed').trim().notEmpty().withMessage('品种不能为空'),
  body('gender').isIn(['male', 'female', 'unknown']).withMessage('性别无效'),
  body('color').trim().notEmpty().withMessage('毛色不能为空'),
  body('lostTime').notEmpty().withMessage('走失时间不能为空'),
  body('lostAddress').trim().notEmpty().withMessage('走失地址不能为空'),
  body('contactPhone').trim().notEmpty().withMessage('联系电话不能为空'),
  body('reward').optional().isNumeric()
], validate, createLostPet);

// 获取走失宠物详情
router.get('/:id', getLostPetById);

// 更新走失宠物报告
router.put('/:id', authenticate, upload.array('images', 5), [
  body('petName').optional().trim().notEmpty(),
  body('species').optional().isIn(['dog', 'cat', 'other']),
  body('breed').optional().trim().notEmpty(),
  body('gender').optional().isIn(['male', 'female', 'unknown']),
  body('lastSeenLocation').optional().trim().notEmpty(),
  body('lastSeenTime').optional(),
  body('reward').optional().isNumeric()
], validate, updateLostPet);

// 删除走失宠物报告
router.delete('/:id', authenticate, deleteLostPet);

// 提交线索
router.post('/:id/clue', authenticate, upload.array('clueImages', 3), [
  body('description').trim().notEmpty().withMessage('请描述线索'),
  body('clueTime').notEmpty().withMessage('线索时间不能为空'),
  body('clueLocation').trim().notEmpty().withMessage('线索地点不能为空')
], validate, submitClue);

// 获取智能匹配结果
router.get('/:id/matches', getMatches);

// 确认找到
router.put('/:id/confirm-found', authenticate, [
  body('foundLocation').trim().notEmpty().withMessage('请说明找到地点'),
  body('foundTime').notEmpty().withMessage('找到时间不能为空'),
  body('currentStatus').trim().notEmpty().withMessage('请说明当前状态')
], validate, confirmFound);

export default router;
