import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Service from '../models/Service.model';
import User from '../models/User.model';
import { AuthRequest } from '../middleware/auth.middleware';

// 创建服务预约
export const createService = async (req: AuthRequest, res: Response) => {
  try {
    const { providerId, serviceType, petId, serviceDate, serviceTime, duration, address, specialRequirements } = req.body;

    // 检查服务提供者是否存在
    const provider = await User.findOne({ _id: providerId });
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: '服务提供者不存在'
      });
    }

    // 映射服务类型
    const typeMap: Record<string, 'dog-walking' | 'grooming-home' | 'grooming-shop' | 'boarding'> = {
      'walk': 'dog-walking',
      'grooming': 'grooming-shop',
      'boarding': 'boarding',
      'training': 'dog-walking'
    };

    const service = new Service({
      type: typeMap[serviceType] || 'dog-walking',
      title: `${serviceType} 服务预约`,
      description: specialRequirements || '',
      providerId: new mongoose.Types.ObjectId(providerId),
      providerName: provider.username || provider.email,
      providerType: provider.role === 'shop' ? 'shop' : 'user',
      petId: petId ? new mongoose.Types.ObjectId(petId) : undefined,
      serviceDate: new Date(serviceDate),
      serviceTime: serviceTime || '10:00',
      duration: duration || 60,
      location: {
        address: address || '',
        city: '',
        district: '',
        coordinates: [0, 0]
      },
      price: 0,
      customerId: new mongoose.Types.ObjectId(req.user!.userId),
      customerName: req.user!.username || req.user!.email,
      customerPhone: req.user!.phone || '',
      notes: specialRequirements,
      status: 'pending',
      timeSlot: {
        start: serviceTime || '10:00',
        end: serviceTime || '11:00'
      },
      address: address || '',
      photos: [],
      images: []
    });

    await service.save();

    res.status(201).json({
      success: true,
      message: '服务预约已提交',
      data: service
    });
  } catch (error: any) {
    console.error('创建服务预约错误:', error);
    res.status(500).json({
      success: false,
      message: '预约失败',
      error: error.message
    });
  }
};

// 获取服务列表（商家查看）
export const getServices = async (req: Request, res: Response) => {
  try {
    const { shopId, status, serviceType, page = 1, limit = 20 } = req.query;

    const query: any = {};
    if (shopId) query.shopId = shopId;
    if (status) query.status = status;
    if (serviceType) query.serviceType = serviceType;

    const services = await Service.find(query)
      .populate('userId', 'username phone avatar')
      .populate('shopId', 'shopName shopType phone address')
      .populate('petId', 'name species breed')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ serviceDate: 1 });

    const total = await Service.countDocuments(query);

    res.json({
      success: true,
      data: services,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    console.error('获取服务列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取服务列表失败',
      error: error.message
    });
  }
};

// 获取服务详情
export const getServiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id)
      .populate('userId', 'username phone email avatar')
      .populate('shopId', 'shopName shopType phone address description images')
      .populate('petId', 'name species breed age weight images description');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: '服务预约不存在'
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error: any) {
    console.error('获取服务详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取服务详情失败',
      error: error.message
    });
  }
};

// 更新服务状态
export const updateServiceStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes, rating, review } = req.body;

    const service = await Service.findOne({
      _id: id
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: '服务预约不存在'
      });
    }

    // 检查权限
    const userRole = req.user!.role;
    if (userRole === 'shop' && service.providerId.toString() !== req.user!.userId) {
      return res.status(403).json({
        success: false,
        message: '无权限操作'
      });
    }

    if (userRole === 'user' && service.customerId.toString() !== req.user!.userId) {
      return res.status(403).json({
        success: false,
        message: '无权限操作'
      });
    }

    service.status = status;
    if (notes) service.notes = notes;
    if (rating) service.rating = rating;
    if (review) service.review = review;

    await service.save();

    res.json({
      success: true,
      message: '状态更新成功',
      data: service
    });
  } catch (error: any) {
    console.error('更新服务状态错误:', error);
    res.status(500).json({
      success: false,
      message: '更新状态失败',
      error: error.message
    });
  }
};

// 取消预约
export const cancelService = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const service = await Service.findOne({
      _id: id,
      userId: req.user!.userId
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: '服务预约不存在或无权限'
      });
    }

    if (service.status !== 'pending' && service.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: '当前状态不可取消'
      });
    }

    service.status = 'cancelled';
    service.cancelReason = reason;
    await service.save();

    res.json({
      success: true,
      message: '预约已取消',
      data: service
    });
  } catch (error: any) {
    console.error('取消预约错误:', error);
    res.status(500).json({
      success: false,
      message: '取消预约失败',
      error: error.message
    });
  }
};

// 获取我的服务预约
export const getMyServices = async (req: AuthRequest, res: Response) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query: any = { userId: req.user!.userId };
    if (status) query.status = status;

    const services = await Service.find(query)
      .populate('shopId', 'shopName shopType phone address')
      .populate('petId', 'name species breed')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ serviceDate: 1 });

    const total = await Service.countDocuments(query);

    res.json({
      success: true,
      data: services,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    console.error('获取我的服务预约错误:', error);
    res.status(500).json({
      success: false,
      message: '获取我的服务预约失败',
      error: error.message
    });
  }
};

// 商家确认预约
export const confirmService = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const service = await Service.findOne({
      _id: id,
      shopId: req.user!.userId
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: '服务预约不存在或无权限'
      });
    }

    if (service.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '当前状态不可确认'
      });
    }

    service.status = 'confirmed';
    if (notes) service.notes = notes;
    await service.save();

    res.json({
      success: true,
      message: '预约已确认',
      data: service
    });
  } catch (error: any) {
    console.error('确认预约错误:', error);
    res.status(500).json({
      success: false,
      message: '确认预约失败',
      error: error.message
    });
  }
};

// 商家完成服务
export const completeService = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { summary, photos } = req.body;

    const service = await Service.findOne({
      _id: id,
      shopId: req.user!.userId
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: '服务预约不存在或无权限'
      });
    }

    if (service.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: '当前状态不可完成'
      });
    }

    service.status = 'completed';
    if (summary) service.notes = summary;
    if (photos && photos.length > 0) service.photos = photos;
    await service.save();

    res.json({
      success: true,
      message: '服务已完成',
      data: service
    });
  } catch (error: any) {
    console.error('完成服务错误:', error);
    res.status(500).json({
      success: false,
      message: '完成服务失败',
      error: error.message
    });
  }
};

// 获取服务列表（公开）- 别名
export const getServiceList = getServices;

// 更新服务预约
export const updateService = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { serviceDate, serviceTime, duration, address, specialRequirements } = req.body;

    const service = await Service.findOne({
      _id: id,
      userId: req.user!.userId
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: '服务预约不存在或无权限'
      });
    }

    if (service.status === 'confirmed' || service.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: '当前状态不可修改'
      });
    }

    if (serviceDate) service.serviceDate = new Date(serviceDate);
    if (serviceTime) service.timeSlot = serviceTime;
    if (duration) service.duration = duration;
    if (address) service.address = address;
    if (specialRequirements) service.notes = specialRequirements;

    await service.save();

    res.json({
      success: true,
      message: '服务预约已更新',
      data: service
    });
  } catch (error: any) {
    console.error('更新服务预约错误:', error);
    res.status(500).json({
      success: false,
      message: '更新服务预约失败',
      error: error.message
    });
  }
};

// 删除服务预约
export const deleteService = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const service = await Service.findOne({
      _id: id,
      userId: req.user!.userId
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: '服务预约不存在或无权限'
      });
    }

    if (service.status === 'confirmed' || service.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: '当前状态不可删除'
      });
    }

    await Service.deleteOne({ _id: id });

    res.json({
      success: true,
      message: '服务预约已删除'
    });
  } catch (error: any) {
    console.error('删除服务预约错误:', error);
    res.status(500).json({
      success: false,
      message: '删除服务预约失败',
      error: error.message
    });
  }
};

// 评价服务
export const rateService = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const service = await Service.findOne({
      _id: id,
      userId: req.user!.userId
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: '服务预约不存在或无权限'
      });
    }

    if (service.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: '只能对已完成的服务进行评价'
      });
    }

    if (service.rating) {
      return res.status(400).json({
        success: false,
        message: '您已经评价过此服务'
      });
    }

    service.rating = rating;
    service.review = comment;
    await service.save();

    res.json({
      success: true,
      message: '评价成功',
      data: service
    });
  } catch (error: any) {
    console.error('评价服务错误:', error);
    res.status(500).json({
      success: false,
      message: '评价失败',
      error: error.message
    });
  }
};
