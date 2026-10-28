import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Kindergarten from '../models/Kindergarten.model';
import User from '../models/User.model';
import Pet from '../models/Pet.model';
import { AuthRequest } from '../middleware/auth.middleware';

// 创建幼儿园
export const createKindergarten = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, address, phone, priceRange, facilities, services } = req.body;

    // 检查用户是否为商家角色
    if (req.user!.role !== 'kindergarten') {
      return res.status(403).json({
        success: false,
        message: '无权限创建幼儿园'
      });
    }

    const kindergarten = new Kindergarten({
      ownerId: req.user!.userId,
      name,
      description,
      address,
      phone,
      priceRange,
      facilities,
      services,
      location: {
        type: 'Point',
        coordinates: req.body.location?.coordinates || [116.4074, 39.9042]
      }
    });

    await kindergarten.save();

    res.status(201).json({
      success: true,
      message: '幼儿园创建成功',
      data: kindergarten
    });
  } catch (error: any) {
    console.error('创建幼儿园错误:', error);
    res.status(500).json({
      success: false,
      message: '创建幼儿园失败',
      error: error.message
    });
  }
};

// 获取幼儿园列表
export const getKindergartens = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, sortBy = 'rating' } = req.query;

    const query: any = {};

    const kindergartens = await Kindergarten.find(query)
      .populate('ownerId', 'username')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ [sortBy as string]: -1 });

    const total = await Kindergarten.countDocuments(query);

    res.json({
      success: true,
      data: kindergartens,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    console.error('获取幼儿园列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取幼儿园列表失败',
      error: error.message
    });
  }
};

// 获取幼儿园详情
export const getKindergartenById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const kindergarten = await Kindergarten.findById(id)
      .populate('ownerId', 'username phone email')
      .populate('enrolledPets.petId', 'name species breed images');

    if (!kindergarten) {
      return res.status(404).json({
        success: false,
        message: '幼儿园不存在'
      });
    }

    // 获取实时监控流信息
    const liveStreams = kindergarten.liveStreams || [];

    res.json({
      success: true,
      data: {
        kindergarten,
        liveStreams
      }
    });
  } catch (error: any) {
    console.error('获取幼儿园详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取幼儿园详情失败',
      error: error.message
    });
  }
};

// 更新幼儿园信息
export const updateKindergarten = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const kindergarten = await Kindergarten.findOne({
      _id: id,
      ownerId: req.user!.userId
    });

    if (!kindergarten) {
      return res.status(404).json({
        success: false,
        message: '幼儿园不存在或无权限'
      });
    }

    // 更新字段
    const allowedFields = ['name', 'description', 'address', 'phone', 'priceRange', 'facilities', 'services', 'images'];
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        (kindergarten as any)[field] = updateData[field];
      }
    }

    await kindergarten.save();

    res.json({
      success: true,
      message: '幼儿园信息更新成功',
      data: kindergarten
    });
  } catch (error: any) {
    console.error('更新幼儿园错误:', error);
    res.status(500).json({
      success: false,
      message: '更新幼儿园信息失败',
      error: error.message
    });
  }
};

// 删除幼儿园
export const deleteKindergarten = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const kindergarten = await Kindergarten.findOneAndDelete({
      _id: id,
      ownerId: req.user!.userId
    });

    if (!kindergarten) {
      return res.status(404).json({
        success: false,
        message: '幼儿园不存在或无权限'
      });
    }

    res.json({
      success: true,
      message: '幼儿园删除成功'
    });
  } catch (error: any) {
    console.error('删除幼儿园错误:', error);
    res.status(500).json({
      success: false,
      message: '删除幼儿园失败',
      error: error.message
    });
  }
};

// 预约入园
export const enrollPet = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { petId, startDate, endDate, notes } = req.body;

    const kindergarten = await Kindergarten.findById(id);
    if (!kindergarten) {
      return res.status(404).json({
        success: false,
        message: '幼儿园不存在'
      });
    }

    // 检查宠物是否存在
    const pet = await Pet.findOne({
      _id: petId,
      ownerId: req.user!.userId
    });
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: '宠物不存在或无权限'
      });
    }

    // 检查是否已 enroll
    const existingEnrollment = kindergarten.enrolledPets.find(
      e => e.petId.toString() === petId.toString() && e.status === 'active'
    );
    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: '该宠物已在园中'
      });
    }

    kindergarten.enrolledPets.push({
      _id: new mongoose.Types.ObjectId(),
      petId,
      ownerName: req.user!.username || 'Unknown',
      petName: pet.name,
      status: 'active',
      enrolledAt: new Date()
    });

    await kindergarten.save();

    res.status(201).json({
      success: true,
      message: '入园预约成功',
      data: kindergarten
    });
  } catch (error: any) {
    console.error('预约入园错误:', error);
    res.status(500).json({
      success: false,
      message: '预约入园失败',
      error: error.message
    });
  }
};

// 退出幼儿园
export const withdrawPet = async (req: AuthRequest, res: Response) => {
  try {
    const { id, petId } = req.params;

    const kindergarten = await Kindergarten.findOne({
      _id: id,
      'enrolledPets.petId': petId
    });

    if (!kindergarten) {
      return res.status(404).json({
        success: false,
        message: '幼儿园或宠物记录不存在'
      });
    }

    const enrollment = kindergarten.enrolledPets.find(
      e => e.petId.toString() === petId
    );

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: '宠物记录不存在'
      });
    }

    enrollment.status = 'completed';
    enrollment.completedAt = new Date();
    await kindergarten.save();

    res.json({
      success: true,
      message: '宠物已退园',
      data: kindergarten
    });
  } catch (error: any) {
    console.error('退出幼儿园错误:', error);
    res.status(500).json({
      success: false,
      message: '退出幼儿园失败',
      error: error.message
    });
  }
};

// 添加实时监控流
export const addLiveStream = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { streamName, streamUrl, location } = req.body;

    const kindergarten = await Kindergarten.findOne({
      _id: id,
      ownerId: req.user!.userId
    });

    if (!kindergarten) {
      return res.status(404).json({
        success: false,
        message: '幼儿园不存在或无权限'
      });
    }

    const stream = {
      _id: new mongoose.Types.ObjectId(),
      streamId: String(streamName),
      title: String(streamName),
      status: 'live' as const,
      startedAt: new Date()
    };

    if (!kindergarten.liveStreams) {
      kindergarten.liveStreams = [];
    }
    kindergarten.liveStreams.push(stream);
    await kindergarten.save();

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

// 获取附近的幼儿园
export const getNearbyKindergartens = async (req: Request, res: Response) => {
  try {
    const { longitude, latitude, distance = 10000 } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: '请提供经度和纬度'
      });
    }

    const kindergartens = await Kindergarten.find({
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
      data: kindergartens
    });
  } catch (error: any) {
    console.error('获取附近幼儿园错误:', error);
    res.status(500).json({
      success: false,
      message: '获取附近幼儿园失败',
      error: error.message
    });
  }
};

// 提交评价
export const submitReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { petId, rating, review } = req.body;

    const kindergarten = await Kindergarten.findById(id);
    if (!kindergarten) {
      return res.status(404).json({
        success: false,
        message: '幼儿园不存在'
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

    kindergarten.reviews.push(reviewRecord);

    // 重新计算平均评分
    const totalRating = kindergarten.reviews.reduce((sum, r) => sum + r.rating, 0);
    kindergarten.rating = totalRating / kindergarten.reviews.length;

    await kindergarten.save();

    res.status(201).json({
      success: true,
      message: '评价提交成功',
      data: kindergarten
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

// 获取我的幼儿园
export const getMyKindergartens = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const kindergartens = await Kindergarten.find({ ownerId: req.user!.userId })
      .populate('ownerId', 'username')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Kindergarten.countDocuments({ ownerId: req.user!.userId });

    res.json({
      success: true,
      data: kindergartens,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    console.error('获取我的幼儿园错误:', error);
    res.status(500).json({
      success: false,
      message: '获取我的幼儿园失败',
      error: error.message
    });
  }
};

// 退园（别名：withdrawPet）
export const unenrollPet = withdrawPet;

// 创建视频房间
export const createVideoRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { roomName, streamUrl } = req.body;

    const kindergarten = await Kindergarten.findOne({
      _id: id,
      ownerId: req.user!.userId
    });

    if (!kindergarten) {
      return res.status(404).json({
        success: false,
        message: '幼儿园不存在或无权限'
      });
    }

    const videoRoom = {
      roomId: roomName,
      roomName,
      status: 'active',
      createdAt: new Date()
    };

    if (!kindergarten.videoRooms) {
      kindergarten.videoRooms = [];
    }
    kindergarten.videoRooms.push(videoRoom as any);
    await kindergarten.save();

    res.status(201).json({
      success: true,
      message: '视频房间创建成功',
      data: videoRoom
    });
  } catch (error: any) {
    console.error('创建视频房间错误:', error);
    res.status(500).json({
      success: false,
      message: '创建视频房间失败',
      error: error.message
    });
  }
};

// 关闭视频房间
export const closeVideoRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { id, roomId } = req.params;

    const kindergarten = await Kindergarten.findOne({
      _id: id,
      ownerId: req.user!.userId
    });

    if (!kindergarten) {
      return res.status(404).json({
        success: false,
        message: '幼儿园不存在或无权限'
      });
    }

    const videoRoom = kindergarten.videoRooms?.find(r => r._id.toString() === roomId);
    if (!videoRoom) {
      return res.status(404).json({
        success: false,
        message: '视频房间不存在'
      });
    }

    videoRoom.status = 'inactive';
    await kindergarten.save();

    res.json({
      success: true,
      message: '视频房间已关闭'
    });
  } catch (error: any) {
    console.error('关闭视频房间错误:', error);
    res.status(500).json({
      success: false,
      message: '关闭视频房间失败',
      error: error.message
    });
  }
};

// 获取课程表
export const getClassSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const kindergarten = await Kindergarten.findById(id);
    if (!kindergarten) {
      return res.status(404).json({
        success: false,
        message: '幼儿园不存在'
      });
    }

    res.json({
      success: true,
      data: kindergarten.classSchedule || []
    });
  } catch (error: any) {
    console.error('获取课程表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取课程表失败',
      error: error.message
    });
  }
};

// 更新课程表
export const updateClassSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { classes } = req.body;

    const kindergarten = await Kindergarten.findOne({
      _id: id,
      ownerId: req.user!.userId
    });

    if (!kindergarten) {
      return res.status(404).json({
        success: false,
        message: '幼儿园不存在或无权限'
      });
    }

    kindergarten.classSchedule = classes;
    await kindergarten.save();

    res.json({
      success: true,
      message: '课程表更新成功',
      data: classes
    });
  } catch (error: any) {
    console.error('更新课程表错误:', error);
    res.status(500).json({
      success: false,
      message: '更新课程表失败',
      error: error.message
    });
  }
};

// 函数名别名
export const getKindergartenList = getKindergartens;
