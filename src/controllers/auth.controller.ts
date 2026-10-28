import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.model';
import { AuthRequest } from '../middleware/auth.middleware';

// 注册
export const register = async (req: Request, res: Response) => {
  try {
    console.log('=== 注册请求开始 ===');
    console.log('请求体:', req.body);
    const { username, email, password, phone } = req.body;
    console.log('解构后的值:', { username, email, password, phone });

    // 检查用户是否存在
    const query: any = { username };
    if (email) {
      query.$or = [{ email }];
    }
    if (phone) {
      if (!query.$or) {
        query.$or = [];
      }
      query.$or.push({ phone });
    }
    const existingUser = await User.findOne(query);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '用户名、邮箱或手机号已存在'
      });
    }

    // 创建用户 (密码会由 pre('save') 钩子自动加密)
    const user = new User({
      username,
      email,
      password, // 直接传入明文密码，让钩子处理加密
      phone,
      role: 'user'
    });

    await user.save();

    // 生成 token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      }
    });
  } catch (error: any) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '注册失败',
      error: error.message
    });
  }
};

// 登录
export const login = async (req: Request, res: Response) => {
  try {
    console.log('=== 登录请求开始 ===');
    console.log('请求体:', req.body);
    const { usernameOrEmail, password } = req.body;
    console.log('解构后的值:', { usernameOrEmail, password });

    if (!usernameOrEmail || !password) {
      return res.status(400).json({
        success: false,
        message: '请输入用户名/邮箱/手机号和密码'
      });
    }

    // 根据输入内容判断是用户名、邮箱还是手机号
    let query: any = {};
    if (usernameOrEmail.includes('@')) {
      query = { email: usernameOrEmail };
    } else if (/^1[3-9]\d{9}$/.test(usernameOrEmail)) {
      query = { phone: usernameOrEmail };
    } else {
      query = { username: usernameOrEmail };
    }
    console.log('查询条件:', query);

    // 查找用户 (需要选择 password 字段)
    const user = await User.findOne(query).select('+password');
    console.log('查找到的用户:', user ? { id: user._id, username: user.username } : 'null');
    console.log('用户密码字段是否存在:', user?.password ? '是' : '否');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 验证密码
    console.log('开始验证密码...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('密码验证结果:', isPasswordValid ? '成功' : '失败');
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 生成 token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          realNameVerified: user.realNameVerified
        }
      }
    });
  } catch (error: any) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '登录失败',
      error: error.message
    });
  }
};

// 获取个人资料
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error: any) {
    console.error('获取资料错误:', error);
    res.status(500).json({
      success: false,
      message: '获取资料失败',
      error: error.message
    });
  }
};

// 更新个人资料
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { username, phone, bio } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user!.userId,
      { username, phone, bio },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      message: '资料更新成功',
      data: user
    });
  } catch (error: any) {
    console.error('更新资料错误:', error);
    res.status(500).json({
      success: false,
      message: '更新资料失败',
      error: error.message
    });
  }
};

// 上传头像
export const uploadAvatar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请上传文件'
      });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user!.userId,
      { avatar: avatarUrl },
      { new: true, select: '-password' }
    );

    res.json({
      success: true,
      message: '头像上传成功',
      data: { avatar: avatarUrl }
    });
  } catch (error: any) {
    console.error('上传头像错误:', error);
    res.status(500).json({
      success: false,
      message: '上传头像失败',
      error: error.message
    });
  }
};

// 实名认证
export const verifyRealName = async (req: AuthRequest, res: Response) => {
  try {
    const { realName, idCard, idCardFront, idCardBack } = req.body;

    // 这里应该调用真实的实名认证接口
    // 实际实现需要接入公安系统接口
    // 这里模拟验证成功

    // 验证身份证格式 (简单验证)
    const idCardRegex = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
    if (!idCardRegex.test(idCard)) {
      return res.status(400).json({
        success: false,
        message: '身份证号格式不正确'
      });
    }

    // 验证文件上传
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请上传身份证正反面图片'
      });
    }

    // 更新用户实名认证信息
    const user = await User.findByIdAndUpdate(
      req.user!.userId,
      {
        realName,
        idCard,
        idCardFront: `/uploads/${(req.files as any)['idCardFront'][0].filename}`,
        idCardBack: `/uploads/${(req.files as any)['idCardBack'][0].filename}`,
        realNameVerified: true,
        verifiedAt: new Date()
      },
      { new: true, select: '-password' }
    );

    res.json({
      success: true,
      message: '实名认证成功',
      data: user
    });
  } catch (error: any) {
    console.error('实名认证错误:', error);
    res.status(500).json({
      success: false,
      message: '实名认证失败',
      error: error.message
    });
  }
};
