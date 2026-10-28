import express from 'express';
import { body } from 'express-validator';
import {
  createShop,
  getShopList,
  getShopById,
  updateShop,
  deleteShop,
  getMyShops,
  addService,
  removeService,
  updateService,
  createMonitoringRoom,
  closeMonitoringRoom,
  getAllShopServices
} from '../controllers/shop.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { upload } from '../middleware/upload.middleware';

const router = express.Router();

// 获取宠物店列表 (公开)
router.get('/', getShopList);

// 获取所有店铺的服务项目 (公开)
router.get('/services', getAllShopServices);

// 获取我的宠物店
router.get('/my', authenticate, getMyShops);

// 创建宠物店 (需要权限)
router.post('/', authenticate, upload.array('images', 10), [
  body('name').trim().isLength({ min: 3, max: 50 }).withMessage('店铺名称 3-50 个字符'),
  body('description').trim().isLength({ min: 20 }).withMessage('请详细描述'),
  body('address').trim().notEmpty().withMessage('地址不能为空'),
  body('phone').trim().notEmpty().withMessage('联系电话不能为空'),
  body('businessHours').trim().notEmpty().withMessage('营业时间不能为空')
], validate, createShop);

// 获取宠物店详情
router.get('/:id', getShopById);

// 更新宠物店
router.put('/:id', authenticate, upload.array('images', 10), [
  body('name').optional().trim().isLength({ min: 3, max: 50 }),
  body('description').optional().trim().isLength({ min: 20 }),
  body('address').optional().trim().notEmpty(),
  body('phone').optional().trim().notEmpty(),
  body('businessHours').optional().trim().notEmpty()
], validate, updateShop);

// 删除宠物店
router.delete('/:id', authenticate, deleteShop);

// 添加服务项目
router.post('/:id/services', authenticate, [
  body('serviceName').trim().notEmpty().withMessage('服务名称不能为空'),
  body('description').optional().trim(),
  body('price').isNumeric().withMessage('价格必须是数字'),
  body('duration').optional().isNumeric()
], validate, addService);

// 删除服务项目
router.delete('/:id/services/:serviceId', authenticate, removeService);

// 更新服务项目
router.put('/:id/services/:serviceId', authenticate, [
  body('serviceName').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('price').optional().isNumeric(),
  body('duration').optional().isNumeric()
], validate, updateService);

// 创建监控房间
router.post('/:id/monitoring', authenticate, [
  body('roomName').trim().notEmpty().withMessage('房间名称不能为空'),
  body('cameraUrl').optional().trim()
], validate, createMonitoringRoom);

// 关闭监控房间
router.delete('/:id/monitoring/:roomId', authenticate, closeMonitoringRoom);

export default router;
