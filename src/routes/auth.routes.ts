import express from 'express';
import { body } from 'express-validator';
import { register, login, getProfile, updateProfile, uploadAvatar, verifyRealName } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { upload } from '../middleware/upload.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// 路由级别日志
console.log('=== auth.routes.ts 已加载 ===');

router.use((req, res, next) => {
  console.log('=== auth 路由中间件触发 ===', req.method, req.path);
  next();
});

// 注册
const registerValidations = [
  body('username').trim().isLength({ min: 3, max: 20 }).withMessage('用户名 3-20 个字符'),
  body('email').optional().isEmail().withMessage('请输入有效的邮箱'),
  body('password').isLength({ min: 6 }).withMessage('密码至少 6 个字符'),
  body('phone').optional().isMobilePhone('zh-CN').withMessage('请输入有效的手机号')
];
router.post('/register', registerValidations, validate(registerValidations), register);

// 登录
const loginValidations = [
  body('usernameOrEmail').notEmpty().withMessage('请输入用户名/邮箱/手机号'),
  body('password').notEmpty().withMessage('密码不能为空')
];
router.post('/login', loginValidations, validate(loginValidations), login);

// 获取当前用户信息 (需要认证)
router.get('/me', authenticate, getProfile);

// 获取个人资料 (需要认证)
router.get('/profile', authenticate, getProfile);

// 更新个人资料 (需要认证)
const updateProfileValidations = [
  body('username').optional().trim().isLength({ min: 3, max: 20 }),
  body('phone').optional().isMobilePhone('zh-CN'),
  body('bio').optional().isLength({ max: 200 })
];
router.put('/profile', authenticate, updateProfileValidations, validate(updateProfileValidations), updateProfile);

// 上传头像 (需要认证)
router.post('/avatar', authenticate, upload.single('avatar'), uploadAvatar);

// 实名认证 (需要认证)
const verifyRealnameValidations = [
  body('realName').trim().notEmpty().withMessage('真实姓名不能为空'),
  body('idCard').isLength({ min: 15, max: 18 }).withMessage('请输入有效的身份证号'),
  body('idCardFront').notEmpty().withMessage('请上传身份证正面照片'),
  body('idCardBack').notEmpty().withMessage('请上传身份证反面照片')
];
router.post('/verify-realname', authenticate, verifyRealnameValidations, validate(verifyRealnameValidations), upload.fields([
  { name: 'idCardFront', maxCount: 1 },
  { name: 'idCardBack', maxCount: 1 }
]), verifyRealName);

export default router;
