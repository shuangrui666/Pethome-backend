import { Request, Response } from 'express';
import Adoption from '../models/Adoption.model';
import Pet from '../models/Pet.model';
import User from '../models/User.model';
import { AuthRequest } from '../middleware/auth.middleware';

// 创建领养申请
export const createAdoption = async (req: AuthRequest, res: Response) => {
  try {
    const { petId, reason, livingSituation, applicantPhone, applicantEmail, applicantAddress, otherPets, familySupport, experience } = req.body;

    // 检查宠物是否存在且可领养
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: '宠物不存在'
      });
    }

    if (!pet.isAdoptable) {
      return res.status(400).json({
        success: false,
        message: '该宠物当前不可领养'
      });
    }

    // 检查是否已提交过申请
    const existingApplication = await Adoption.findOne({
      petId,
      applicantId: req.user!.userId,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: '您已提交过该宠物的领养申请'
      });
    }

    // 检查用户是否实名认证
    if (!req.user!.realNameVerified) {
      return res.status(403).json({
        success: false,
        message: '领养需要实名认证，请先完成认证'
      });
    }

    const application = new Adoption({
      petId,
      applicantId: req.user!.userId,
      applicantName: req.user!.username,
      applicantPhone,
      applicantEmail,
      applicantAddress,
      livingSituation,
      otherPets,
      familySupport,
      experience,
      reason
    });

    await application.save();

    res.status(201).json({
      success: true,
      message: '领养申请提交成功',
      data: application
    });
  } catch (error: any) {
    console.error('创建领养申请错误:', error);
    res.status(500).json({
      success: false,
      message: '提交领养申请失败',
      error: error.message
    });
  }
};

// 获取领养申请列表
export const getAdoptionList = async (req: Request, res: Response) => {
  try {
    const { status, petType, page = 1, limit = 20 } = req.query;

    const query: any = {};
    if (status) query.status = status;

    const applications = await Adoption.find(query)
      .populate('petId', 'name species breed images')
      .populate('applicantId', 'username phone email realName realNameVerified')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Adoption.countDocuments(query);

    // 提取所有宠物 ID，批量查询宠物数据
    const petIds = applications
      .map(app => app.petId?._id)
      .filter(id => id);
    
    let pets = petIds.length > 0 
      ? await Pet.find({ _id: { $in: petIds } })
        .select('name species breed age images description ownerId isAdoptable adoptionStatus')
      : [];

    // 如果前端传递了 petType 过滤参数，在客户端过滤
    if (petType && petType !== 'all') {
      const speciesMap: any = {
        'dog': 'dog',
        'cat': 'cat',
        'other': 'other'
      };
      const petTypeStr = Array.isArray(petType) ? petType[0] : String(petType);
      const species = speciesMap[petTypeStr as keyof typeof speciesMap];
      if (species) {
        pets = pets.filter(p => p.species === species);
        // 同时过滤 applications，只保留匹配宠物的申请
        const validPetIds = new Set(pets.map(p => p._id.toString()));
        // 注意：这里只过滤返回的 pets 数组，adoptions 保持原样
      }
    }

    res.json({
      success: true,
      adoptions: applications,
      pets,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    console.error('获取领养申请列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取领养申请列表失败',
      error: error.message
    });
  }
};

// 获取领养申请详情
export const getAdoptionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const application = await Adoption.findById(id)
      .populate('petId', 'name species breed age images description')
      .populate('applicantId', 'username phone email realName avatar bio');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: '领养申请不存在'
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error: any) {
    console.error('获取领养申请详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取领养申请详情失败',
      error: error.message
    });
  }
};

// 审核领养申请（通过）
export const approveAdoption = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const application = await Adoption.findById(id)
      .populate('petId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: '领养申请不存在'
      });
    }

    // 检查是否有权限审核（宠物主人或管理员）
    const pet = await Pet.findById(application.petId);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: '宠物不存在'
      });
    }

    if (String(pet.ownerId) !== req.user!.userId && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '无权限审核此申请'
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '申请状态不是待审核'
      });
    }

    application.status = 'approved';
    application.reviewNote = notes;
    application.reviewBy = req.user!.userId;
    application.reviewAt = new Date();

    await application.save();

    // 更新宠物状态为已领养
    await Pet.findByIdAndUpdate(pet._id, {
      isAdoptable: false,
      adoptionStatus: 'adopted',
      adoptedAt: new Date()
    });

    res.json({
      success: true,
      message: '领养申请已通过',
      data: application
    });
  } catch (error: any) {
    console.error('审核领养申请错误:', error);
    res.status(500).json({
      success: false,
      message: '审核领养申请失败',
      error: error.message
    });
  }
};

// 拒绝领养申请
export const rejectAdoption = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, notes } = req.body;

    const application = await Adoption.findById(id)
      .populate('petId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: '领养申请不存在'
      });
    }

    // 检查是否有权限审核
    const pet = await Pet.findById(application.petId);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: '宠物不存在'
      });
    }

    if (String(pet.ownerId) !== req.user!.userId && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '无权限审核此申请'
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '申请状态不是待审核'
      });
    }

    application.status = 'rejected';
    application.reviewNote = reason;
    application.reviewBy = req.user!.userId;
    application.reviewAt = new Date();

    await application.save();

    res.json({
      success: true,
      message: '领养申请已拒绝',
      data: application
    });
  } catch (error: any) {
    console.error('拒绝领养申请错误:', error);
    res.status(500).json({
      success: false,
      message: '拒绝领养申请失败',
      error: error.message
    });
  }
};

// 获取我的领养申请
export const getMyAdoptions = async (req: AuthRequest, res: Response) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query: any = { applicantId: req.user!.userId };
    if (status) query.status = status;

    const applications = await Adoption.find(query)
      .populate('petId', 'name species breed age images description')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Adoption.countDocuments(query);

    res.json({
      success: true,
      data: applications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    console.error('获取我的领养申请错误:', error);
    res.status(500).json({
      success: false,
      message: '获取我的领养申请失败',
      error: error.message
    });
  }
};

// 撤回领养申请
export const withdrawAdoptionApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const application = await Adoption.findOne({
      _id: id,
      applicantId: req.user!.userId
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: '领养申请不存在或无权限'
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '只有待审核状态的申请可以撤回'
      });
    }

    application.status = 'cancelled';
    await application.save();

    res.json({
      success: true,
      message: '领养申请已撤回',
      data: application
    });
  } catch (error: any) {
    console.error('撤回领养申请错误:', error);
    res.status(500).json({
      success: false,
      message: '撤回领养申请失败',
      error: error.message
    });
  }
};

// 获取待审核的领养申请数量
export const getPendingApplicationsCount = async (req: AuthRequest, res: Response) => {
  try {
    // 获取用户拥有的可领养宠物
    const userPets = await Pet.find({
      ownerId: req.user!.userId,
      isAdoptable: true
    }).select('_id');

    const petIds = userPets.map(p => p._id);

    const count = await Adoption.countDocuments({
      petId: { $in: petIds },
      status: 'pending'
    });

    res.json({
      success: true,
      data: { count }
    });
  } catch (error: any) {
    console.error('获取待审核数量错误:', error);
    res.status(500).json({
      success: false,
      message: '获取待审核数量失败',
      error: error.message
    });
  }
};

// 更新领养申请
export const updateAdoption = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, livingConditions, experience } = req.body;

    const application = await Adoption.findOne({
      _id: id,
      applicantId: req.user!.userId
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: '领养申请不存在或无权限'
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '只有待审核状态的申请可以更新'
      });
    }

    if (reason) application.reason = reason;
    if (livingConditions) application.livingSituation = livingConditions;
    if (experience) application.experience = experience;

    await application.save();

    res.json({
      success: true,
      message: '领养申请已更新',
      data: application
    });
  } catch (error: any) {
    console.error('更新领养申请错误:', error);
    res.status(500).json({
      success: false,
      message: '更新领养申请失败',
      error: error.message
    });
  }
};

// 删除领养申请
export const deleteAdoption = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const application = await Adoption.findOne({
      _id: id,
      applicantId: req.user!.userId
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: '领养申请不存在或无权限'
      });
    }

    if (application.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: '已通过的申请无法删除'
      });
    }

    await Adoption.deleteOne({ _id: id });

    res.json({
      success: true,
      message: '领养申请已删除'
    });
  } catch (error: any) {
    console.error('删除领养申请错误:', error);
    res.status(500).json({
      success: false,
      message: '删除领养申请失败',
      error: error.message
    });
  }
};

// 取消领养申请
export const cancelAdoption = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const application = await Adoption.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: '领养申请不存在'
      });
    }

    // 只有 pending 状态的申请可以取消
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '只有待审核状态的申请可以取消'
      });
    }

    application.status = 'cancelled';
    await application.save();

    res.json({
      success: true,
      message: '领养申请已取消',
      data: application
    });
  } catch (error: any) {
    console.error('取消领养申请错误:', error);
    res.status(500).json({
      success: false,
      message: '取消领养申请失败',
      error: error.message
    });
  }
};

// 完成领养
export const completeAdoption = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const application = await Adoption.findById(id)
      .populate('petId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: '领养申请不存在'
      });
    }

    // 只有 approved 状态的申请可以完成
    if (application.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: '只有已通过的申请可以完成'
      });
    }

    application.status = 'completed';
    await application.save();

    // 更新宠物的领养状态
    if (application.petId) {
      await Pet.findByIdAndUpdate(application.petId._id, {
        adoptionStatus: 'completed',
        completedAt: new Date()
      });
    }

    res.json({
      success: true,
      message: '领养已完成',
      data: application
    });
  } catch (error: any) {
    console.error('完成领养错误:', error);
    res.status(500).json({
      success: false,
      message: '完成领养失败',
      error: error.message
    });
  }
};
