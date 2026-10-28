import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Donation from '../models/Donation.model';
import { AuthRequest } from '../middleware/auth.middleware';

// 创建捐赠
export const createDonation = async (req: AuthRequest, res: Response) => {
  try {
    const {
      donationType,
      amount,
      foodType,
      quantity,
      targetShelterId,
      message
    } = req.body;

    const donation = new Donation({
      donationType,
      amount: amount || 0,
      foodType,
      quantity: quantity || 0,
      targetShelterId,
      message,
      userId: req.user!.userId,
      status: 'active'
    });

    await donation.save();

    res.status(201).json({
      success: true,
      message: '捐赠创建成功',
      data: donation
    });
  } catch (error: any) {
    console.error('创建捐赠错误:', error);
    res.status(500).json({
      success: false,
      message: '创建捐赠失败',
      error: error.message
    });
  }
};

// 获取捐赠列表
export const getDonationList = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, donationType, status } = req.query;

    const query: any = {};
    if (donationType) query.donationType = donationType;
    if (status) query.status = status;

    const donations = await Donation.find(query)
      .populate('userId', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Donation.countDocuments(query);

    res.json({
      success: true,
      data: donations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    console.error('获取捐赠列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取捐赠列表失败',
      error: error.message
    });
  }
};

// 获取捐赠详情
export const getDonationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const donation = await Donation.findById(id)
      .populate('userId', 'username avatar');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: '捐赠不存在'
      });
    }

    res.json({
      success: true,
      data: donation
    });
  } catch (error: any) {
    console.error('获取捐赠详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取捐赠详情失败',
      error: error.message
    });
  }
};

// 获取我的捐赠
export const getMyDonations = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query: any = { userId: req.user!.userId };
    if (status) query.status = status;

    const donations = await Donation.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Donation.countDocuments(query);

    res.json({
      success: true,
      data: donations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    console.error('获取我的捐赠错误:', error);
    res.status(500).json({
      success: false,
      message: '获取我的捐赠失败',
      error: error.message
    });
  }
};

// 取消捐赠
export const cancelDonation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const donation = await Donation.findOne({
      _id: id,
      userId: req.user!.userId
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: '捐赠不存在或无权限'
      });
    }

    if (donation.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: '只能取消进行中的捐赠'
      });
    }

    donation.status = 'cancelled';
    await donation.save();

    res.json({
      success: true,
      message: '捐赠已取消',
      data: donation
    });
  } catch (error: any) {
    console.error('取消捐赠错误:', error);
    res.status(500).json({
      success: false,
      message: '取消捐赠失败',
      error: error.message
    });
  }
};

// 获取捐赠追踪
export const getDonationTracking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const donation = await Donation.findOne({
      _id: id,
      userId: req.user!.userId
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: '捐赠不存在或无权限'
      });
    }

    res.json({
      success: true,
      data: donation
    });
  } catch (error: any) {
    console.error('获取捐赠追踪错误:', error);
    res.status(500).json({
      success: false,
      message: '获取捐赠追踪失败',
      error: error.message
    });
  }
};

// 获取救助站列表
export const getShelterList = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const query: any = {};

    const shelters = await Donation.find(query)
      .populate('userId', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Donation.countDocuments(query);

    res.json({
      success: true,
      data: shelters,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    console.error('获取救助站列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取救助站列表失败',
      error: error.message
    });
  }
};

// 获取救助站详情
export const getShelterDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const shelter = await Donation.findById(id)
      .populate('userId', 'username avatar email phone');

    if (!shelter) {
      return res.status(404).json({
        success: false,
        message: '救助站不存在'
      });
    }

    res.json({
      success: true,
      data: shelter
    });
  } catch (error: any) {
    console.error('获取救助站详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取救助站详情失败',
      error: error.message
    });
  }
};

// 向救助站捐赠
export const donateToShelter = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { donationType, amount, foodType, quantity, message } = req.body;

    const shelter = await Donation.findById(id);
    if (!shelter) {
      return res.status(404).json({
        success: false,
        message: '救助站不存在'
      });
    }

    const donation = new Donation({
      donationType,
      amount: amount || 0,
      foodType,
      quantity: quantity || 0,
      targetShelterId: id,
      message,
      userId: req.user!.userId,
      status: 'active'
    });

    await donation.save();

    res.status(201).json({
      success: true,
      message: '捐赠成功',
      data: donation
    });
  } catch (error: any) {
    console.error('向救助站捐赠错误:', error);
    res.status(500).json({
      success: false,
      message: '捐赠失败',
      error: error.message
    });
  }
};

// 创建资助项目
export const createDonationProject = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      targetAmount,
      currentAmount = 0,
      category,
      location,
      images,
      endDate
    } = req.body;

    const project = new Donation({
      title,
      description,
      targetAmount,
      currentAmount,
      category,
      location,
      images,
      endDate: endDate ? new Date(endDate) : null,
      createdBy: req.user!.userId,
      status: 'active'
    });

    await project.save();

    res.status(201).json({
      success: true,
      message: '资助项目创建成功',
      data: project
    });
  } catch (error: any) {
    console.error('创建资助项目错误:', error);
    res.status(500).json({
      success: false,
      message: '创建资助项目失败',
      error: error.message
    });
  }
};

// 获取资助项目列表
export const getDonationProjects = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, category, status, sortBy = 'createdAt' } = req.query;

    const query: any = {};
    
    if (category) query.category = category;
    if (status) query.status = status;

    const projects = await Donation.find(query)
      .populate('createdBy', 'username organization')
      .sort({ [sortBy as string]: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Donation.countDocuments(query);

    res.json({
      success: true,
      data: projects,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    console.error('获取资助项目列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取资助项目列表失败',
      error: error.message
    });
  }
};

// 获取资助项目详情
export const getDonationProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const project = await Donation.findById(id)
      .populate('createdBy', 'username organization email phone')
      .populate('donations.userId', 'username avatar');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: '资助项目不存在'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error: any) {
    console.error('获取资助项目详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取资助项目详情失败',
      error: error.message
    });
  }
};

// 资助项目
export const donateToProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, message, paymentMethod, paymentInfo } = req.body;

    const project = await Donation.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: '资助项目不存在'
      });
    }

    if (project.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: '该项目已结束或已关闭'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: '资助金额必须大于 0'
      });
    }

    const donation = {
      _id: new mongoose.Types.ObjectId(),
      donorName: req.user!.username || req.user!.organization || '匿名捐赠者',
      amount,
      foodType: message,
      foodQuantity: amount,
      donatedAt: new Date()
    };

    project.donations.push(donation);
    project.currentAmount += amount;

    // 检查是否达到目标金额
    if (project.currentAmount >= project.targetAmount) {
      project.status = 'completed';
    }

    await project.save();

    res.status(201).json({
      success: true,
      message: '资助成功',
      data: {
        project,
        donation
      }
    });
  } catch (error: any) {
    console.error('资助项目错误:', error);
    res.status(500).json({
      success: false,
      message: '资助失败',
      error: error.message
    });
  }
};

// 确认收到资助
export const confirmDonation = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, donationIndex } = req.body;

    const project = await Donation.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: '资助项目不存在'
      });
    }

    // 检查是否为项目创建者
    if (project.createdBy.toString() !== req.user!.userId) {
      return res.status(403).json({
        success: false,
        message: '无权限确认资助'
      });
    }

    const donation = project.donations[donationIndex];
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: '资助记录不存在'
      });
    }

    // 更新资助状态而非确认
    await project.save();

    res.json({
      success: true,
      message: '资助确认成功'
    });
  } catch (error: any) {
    console.error('确认资助错误:', error);
    res.status(500).json({
      success: false,
      message: '确认资助失败',
      error: error.message
    });
  }
};

// 更新资助项目状态
export const updateProjectStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const project = await Donation.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: '资助项目不存在'
      });
    }

    // 检查是否为项目创建者或管理员
    if (project.createdBy.toString() !== req.user!.userId && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '无权限更新项目状态'
      });
    }

    project.status = status;
    if (notes) {
      project.notes.push({
        _id: new mongoose.Types.ObjectId(),
        content: notes,
        createdAt: new Date()
      });
    }

    await project.save();

    res.json({
      success: true,
      message: '项目状态更新成功',
      data: project
    });
  } catch (error: any) {
    console.error('更新项目状态错误:', error);
    res.status(500).json({
      success: false,
      message: '更新项目状态失败',
      error: error.message
    });
  }
};

// 获取我的创建的资助项目
export const getMyCreatedProjects = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query: any = { createdBy: req.user!.userId };
    if (status) query.status = status;

    const projects = await Donation.find(query)
      .populate('createdBy', 'username organization')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Donation.countDocuments(query);

    res.json({
      success: true,
      data: projects,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    console.error('获取我的项目错误:', error);
    res.status(500).json({
      success: false,
      message: '获取我的项目失败',
      error: error.message
    });
  }
};

// 删除资助项目
export const deleteDonationProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const project = await Donation.findOne({
      _id: id,
      createdBy: req.user!.userId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: '项目不存在或无权限'
      });
    }

    // 只有未开始或草稿状态的项目才能删除
    if (project.status === 'active' && project.currentAmount > 0) {
      return res.status(400).json({
        success: false,
        message: '已有资助的项目不能删除'
      });
    }

    await Donation.findByIdAndDelete(id);

    res.json({
      success: true,
      message: '项目删除成功'
    });
  } catch (error: any) {
    console.error('删除项目错误:', error);
    res.status(500).json({
      success: false,
      message: '删除项目失败',
      error: error.message
    });
  }
};

// 获取资助统计数据
export const getDonationStats = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    const query: any = {};
    if (category) query.category = category;

    const stats = await Donation.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$category',
          totalProjects: { $sum: 1 },
          totalRaised: { $sum: '$currentAmount' },
          totalTarget: { $sum: '$targetAmount' },
          activeProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          completedProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    const totalStats = await Donation.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          totalRaised: { $sum: '$currentAmount' },
          totalTarget: { $sum: '$targetAmount' },
          totalDonors: { $addToSet: '$donations.userId' },
          activeProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        byCategory: stats,
        overall: totalStats[0] || {
          totalProjects: 0,
          totalRaised: 0,
          totalTarget: 0,
          activeProjects: 0
        }
      }
    });
  } catch (error: any) {
    console.error('获取统计数据错误:', error);
    res.status(500).json({
      success: false,
      message: '获取统计数据失败',
      error: error.message
    });
  }
};
