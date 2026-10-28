import { Request, Response } from 'express';
import User from '../models/User.model';
import { AuthRequest } from '../middleware/auth.middleware';

// 获取用户列表
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find()
      .select('-password')
      .limit(50);

    res.json({
      success: true,
      data: users
    });
  } catch (error: any) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户列表失败',
      error: error.message
    });
  }
};

// 获取用户资料
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    
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
    console.error('获取用户资料错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户资料失败',
      error: error.message
    });
  }
};

// 更新用户资料
export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { username, phone, bio, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user!.userId,
      { username, phone, bio, avatar },
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

// 获取用户统计
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // 这里需要聚合查询相关数据
    const stats = {
      petsCount: 0,
      postsCount: 0,
      adoptionApplicationsCount: 0,
      lostPetReportsCount: 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('获取用户统计错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户统计失败',
      error: error.message
    });
  }
};
