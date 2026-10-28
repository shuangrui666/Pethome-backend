import express from 'express';
import { body } from 'express-validator';
import {
  createPet,
  getPets,
  getPetById,
  updatePet,
  deletePet,
  getNearbyPets,
  getAdoptablePets,
  getMyPets
} from '../controllers/pet.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { upload } from '../middleware/upload.middleware';

const router = express.Router();

// 获取所有宠物 (公开)
router.get('/', getPets);

// 获取可领养的宠物
router.get('/adoptable', getAdoptablePets);

// 获取附近的宠物
router.get('/nearby', getNearbyPets);

// 获取我的宠物 (需要认证)
router.get('/my', authenticate, getMyPets);

// 创建宠物 (需要认证)
router.post('/', authenticate, upload.array('images', 5), [
  body('name').trim().notEmpty().withMessage('宠物名字不能为空'),
  body('species').isIn(['dog', 'cat', 'other']).withMessage('物种类型无效'),
  body('breed').trim().notEmpty().withMessage('品种不能为空'),
  body('gender').isIn(['male', 'female']).withMessage('性别无效'),
  body('age').isNumeric().withMessage('年龄必须是数字'),
  body('location.coordinates').optional().isArray()
], validate, createPet);

// 获取宠物详情
router.get('/:id', getPetById);

// 更新宠物 (需要认证)
router.put('/:id', authenticate, upload.array('images', 5), [
  body('name').optional().trim().notEmpty(),
  body('species').optional().isIn(['dog', 'cat', 'other']),
  body('breed').optional().trim().notEmpty(),
  body('gender').optional().isIn(['male', 'female']),
  body('age').optional().isNumeric(),
  body('isLost').optional().isBoolean(),
  body('isAdoptable').optional().isBoolean()
], validate, updatePet);

// 删除宠物 (需要认证)
router.delete('/:id', authenticate, deletePet);

export default router;
