import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Shop from '../models/Shop.model';
import User from '../models/User.model';
import Service from '../models/Service.model';
import { AuthRequest } from '../middleware/auth.middleware';

// 创建宠物店
export const createShop = async (req: AuthRequest, res: Response) => {
  try {
    const { shopName, shopType, description, address, phone, priceRange, services, operatingHours } = req.body;

    // 检查用户是否为商家角色
    if (req.user!.role !== 'shop') {
      return res.status(403).json({
        success: false,
        message: '无权限创建宠物店'
      });
    }

    const shop = new Shop({
      ownerId: req.user!.userId,
      shopName,
      shopType,
      description,
      address,
      phone,
      priceRange,
      services,
      operatingHours,
      location: {
        type: 'Point',
        coordinates: req.body.location?.coordinates || [116.4074, 39.9042]
      }
    });

    await shop.save();

    res.status(201).json({
      success: true,
      message: '宠物店创建成功',
      data: shop
    });
  } catch (error: any) {
    console.error('创建宠物店错误:', error);
    res.status(500).json({
      success: false,
      message: '创建宠物店失败',
      error: error.message
    });
  }
};

// 获取宠物店列表
export const getShops = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, shopType, sortBy = 'rating' } = req.query;

    const query: any = {};
    
    if (shopType) query.shopType = shopType;

    const shops = await Shop.find(query)
      .populate('ownerId', 'username')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ [sortBy as string]: -1 });

    const total = await Shop.countDocuments(query);

    res.json({
      success: true,
      data: shops,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    console.error('获取宠物店列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取宠物店列表失败',
      error: error.message
    });
  }
};

// 别名
export const getShopList = getShops;

// 获取宠物店详情
export const getShopById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const shop = await Shop.findById(id)
      .populate('ownerId', 'username phone email')
      .populate('services.serviceId', 'name description price');

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: '宠物店不存在'
      });
    }

    // 获取实时监控流信息
    const liveStreams = shop.liveStreams || [];

    res.json({
      success: true,
      data: {
        shop,
        liveStreams
      }
    });
  } catch (error: any) {
    console.error('获取宠物店详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取宠物店详情失败',
      error: error.message
    });
  }
};

// 更新宠物店信息
export const updateShop = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const shop = await Shop.findOne({
      _id: id,
      ownerId: req.user!.userId
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: '宠物店不存在或无权限'
      });
    }

    // 更新字段
    const allowedFields = ['shopName', 'shopType', 'description', 'address', 'phone', 'priceRange', 'services', 'operatingHours', 'images'];
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        (shop as any)[field] = updateData[field];
      }
    }

    await shop.save();

    res.json({
      success: true,
      message: '宠物店信息更新成功',
      data: shop
    });
  } catch (error: any) {
    console.error('更新宠物店错误:', error);
    res.status(500).json({
      success: false,
      message: '更新宠物店信息失败',
      error: error.message
    });
  }
};

// 删除宠物店
export const deleteShop = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const shop = await Shop.findOneAndDelete({
      _id: id,
      ownerId: req.user!.userId
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: '宠物店不存在或无权限'
      });
    }

    res.json({
      success: true,
      message: '宠物店删除成功'
    });
  } catch (error: any) {
    console.error('删除宠物店错误:', error);
    res.status(500).json({
      success: false,
      message: '删除宠物店失败',
      error: error.message
    });
  }
};

// 获取附近的宠物店
export const getNearbyShops = async (req: Request, res: Response) => {
  try {
    const { longitude, latitude, distance = 10000, shopType } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: '请提供经度和纬度'
      });
    }

    const query: any = {};
    if (shopType) query.shopType = shopType;

    const shops = await Shop.find({
      ...query,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)]
          },
          $maxDistance: Number(distance)
        }
      }
    })
      .populate('ownerId', 'username phone')
      .sort({ rating: -1 });

    res.json({
      success: true,
      data: shops
    });
  } catch (error: any) {
    console.error('获取附近宠物店错误:', error);
    res.status(500).json({
      success: false,
      message: '获取附近宠物店失败',
      error: error.message
    });
  }
};

// 添加服务
export const addService = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, duration } = req.body;

    const shop = await Shop.findOne({
      _id: id,
      ownerId: req.user!.userId
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: '宠物店不存在或无权限'
      });
    }

    const service = {
      name,
      description,
      price,
      duration
    };

    shop.services.push(service);
    await shop.save();

    res.status(201).json({
      success: true,
      message: '服务添加成功',
      data: service
    });
  } catch (error: any) {
    console.error('添加服务错误:', error);
    res.status(500).json({
      success: false,
      message: '添加服务失败',
      error: error.message
    });
  }
};

// 添加实时监控流
export const addLiveStream = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { streamName, streamUrl, location } = req.body;

    const shop = await Shop.findOne({
      _id: id,
      ownerId: req.user!.userId
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: '宠物店不存在或无权限'
      });
    }

    const stream = {
      _id: new mongoose.Types.ObjectId(),
      streamId: String(streamName),
      title: String(streamName),
      status: 'live' as const,
      startedAt: new Date()
    };

    if (!shop.liveStreams) {
      shop.liveStreams = [];
    }
    shop.liveStreams.push(stream);
    await shop.save();

    res.status(201).json({
      success: true,
      message: '监控流添加成功',
      data: stream
    });
  } catch (error: any) {
    console.error('添加监控流错误:', error);
    res.status(500).json({
      success: false,
      message: '添加监控流失败',
      error: error.message
    });
  }
};

// 提交评价
export const submitReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;

    const shop = await Shop.findById(id);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: '宠物店不存在'
      });
    }

    const reviewRecord = {
      _id: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(req.user!.userId),
      userName: req.user!.username || 'Unknown',
      userAvatar: req.user!.avatar || '/uploads/default-avatar.png',
      rating,
      comment: review,
      createdAt: new Date()
    };

    shop.reviews.push(reviewRecord);
    
    // 重新计算平均评分
    const totalRating = shop.reviews.reduce((sum, r) => sum + r.rating, 0);
    shop.rating = totalRating / shop.reviews.length;

    await shop.save();

    res.status(201).json({
      success: true,
      message: '评价提交成功',
      data: shop
    });
  } catch (error: any) {
    console.error('提交评价错误:', error);
    res.status(500).json({
      success: false,
      message: '评价提交失败',
      error: error.message
    });
  }
};

// 获取店铺预约列表
export const getShopServices = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    const query: any = { shopId: id };
    if (status) query.status = status;

    const services = await Service.find(query)
      .populate('userId', 'username phone')
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
    console.error('获取店铺预约列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取预约列表失败',
      error: error.message
    });
  }
};

// 获取所有店铺的服务项目
export const getAllShopServices = async (req: Request, res: Response) => {
  try {
    const shops = await Shop.find({})
      .select('shopName shopType services rating address phone priceRange')
      .lean();

    // 将所有店铺的服务项目合并到一个列表中
    const allServices = shops.flatMap(shop => {
      const shopAny = shop as any;
      return (shopAny.services || []).map((service: any) => ({
        ...(service.toObject ? service.toObject() : service),
        shopName: shopAny.shopName,
        shopId: shopAny._id,
        shopType: shopAny.shopType,
        shopRating: shopAny.rating,
        shopAddress: shopAny.address,
        shopPhone: shopAny.phone,
        shopPriceRange: shopAny.priceRange
      }));
    });

    res.json({
      success: true,
      data: allServices
    });
  } catch (error: any) {
    console.error('获取所有店铺服务项目错误:', error);
    res.status(500).json({
      success: false,
      message: '获取服务项目失败',
      error: error.message
    });
  }
};

// 获取我的宠物店
export const getMyShops = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const shops = await Shop.find({ ownerId: req.user!.userId })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Shop.countDocuments({ ownerId: req.user!.userId });

    res.json({
      success: true,
      data: shops,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    console.error('获取我的宠物店错误:', error);
    res.status(500).json({
      success: false,
      message: '获取我的宠物店失败',
      error: error.message
    });
  }
};

// 删除服务项目
export const removeService = async (req: AuthRequest, res: Response) => {
  try {
    const { id, serviceId } = req.params;

    const shop = await Shop.findOne({
      _id: id,
      ownerId: req.user!.userId
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: '宠物店不存在或无权限'
      });
    }

    // 从 services 数组中移除对应服务
    const initialLength = shop.services.length;
    shop.services = shop.services.filter(
      (s: any) => s._id.toString() !== serviceId
    );

    if (shop.services.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: '服务不存在'
      });
    }

    await shop.save();

    res.json({
      success: true,
      message: '服务删除成功',
      data: shop
    });
  } catch (error: any) {
    console.error('删除服务错误:', error);
    res.status(500).json({
      success: false,
      message: '删除服务失败',
      error: error.message
    });
  }
};

// 更新服务项目
export const updateService = async (req: AuthRequest, res: Response) => {
  try {
    const { id, serviceId } = req.params;
    const { serviceName, description, price, duration } = req.body;

    const shop = await Shop.findOne({
      _id: id,
      ownerId: req.user!.userId
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: '宠物店不存在或无权限'
      });
    }

    // 查找并更新服务
    const service = shop.services.find(
      (s: any) => s._id.toString() === serviceId
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: '服务不存在'
      });
    }

    // 更新字段
    if (serviceName) service.name = serviceName;
    if (description) service.description = description;
    if (price) service.price = price;
    if (duration) service.duration = duration;

    await shop.save();

    res.json({
      success: true,
      message: '服务更新成功',
      data: shop
    });
  } catch (error: any) {
    console.error('更新服务错误:', error);
    res.status(500).json({
      success: false,
      message: '更新服务失败',
      error: error.message
    });
  }
};

// 创建监控房间
export const createMonitoringRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { roomName, cameraUrl } = req.body;

    const shop = await Shop.findOne({
      _id: id,
      ownerId: req.user!.userId
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: '宠物店不存在或无权限'
      });
    }

    const monitoringRoom = {
      _id: new mongoose.Types.ObjectId(),
      roomId: String(roomName),
      roomName,
      cameraCount: 0,
      status: 'active' as const,
      createdAt: new Date()
    };

    if (!shop.monitoringRooms) {
      shop.monitoringRooms = [];
    }
    shop.monitoringRooms.push(monitoringRoom);
    await shop.save();

    res.status(201).json({
      success: true,
      message: '监控房间创建成功',
      data: monitoringRoom
    });
  } catch (error: any) {
    console.error('创建监控房间错误:', error);
    res.status(500).json({
      success: false,
      message: '创建监控房间失败',
      error: error.message
    });
  }
};

// 关闭监控房间
export const closeMonitoringRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { id, roomId } = req.params;

    const shop = await Shop.findOne({
      _id: id,
      ownerId: req.user!.userId
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: '宠物店不存在或无权限'
      });
    }

    if (!shop.monitoringRooms) {
      return res.status(404).json({
        success: false,
        message: '监控房间不存在'
      });
    }

    const room = shop.monitoringRooms.find(
      (r: any) => r._id.toString() === roomId
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: '监控房间不存在'
      });
    }

    room.status = 'inactive';
    await shop.save();

    res.json({
      success: true,
      message: '监控房间已关闭',
      data: room
    });
  } catch (error: any) {
    console.error('关闭监控房间错误:', error);
    res.status(500).json({
      success: false,
      message: '关闭监控房间失败',
      error: error.message
    });
  }
};
