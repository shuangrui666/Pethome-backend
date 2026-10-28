import { Request, Response } from 'express';
import LostPet from '../models/LostPet.model';
import Pet from '../models/Pet.model';
import User from '../models/User.model';
import { AuthRequest } from '../middleware/auth.middleware';
import mongoose from 'mongoose';

// 报告走失宠物
export const reportLostPet = async (req: AuthRequest, res: Response) => {
  try {
    const {
      petName,
      species,
      breed,
      gender,
      age,
      color,
      features,
      lostTime,
      lostAddress,
      lostCity,
      lostDistrict,
      contactPhone,
      contactWechat,
      reward
    } = req.body;

    // 验证必填字段
    if (!petName || !species || !breed || !color || !lostTime || !lostAddress || !contactPhone) {
      return res.status(400).json({
        success: false,
        message: '请填写所有必填字段'
      });
    }

    // 创建走失记录
    const lostPet = new LostPet({
      petName,
      species,
      breed,
      gender: gender || 'unknown',
      age: age ? Number(age) : undefined,
      color,
      features,
      lostTime: new Date(lostTime),
      lostLocation: {
        type: 'Point',
        coordinates: [116.4074, 39.9042],
        address: lostAddress,
        city: lostCity || '北京',
        district: lostDistrict || '朝阳区'
      },
      contactPhone,
      contactWechat,
      reward: reward ? Number(reward) : 0,
      status: 'lost',
      reporterId: req.user!.userId,
      images: req.files ? (req.files as Express.Multer.File[]).map(f => f.path) : []
    });

    await lostPet.save();

    res.status(201).json({
      success: true,
      message: '走失宠物报告已提交',
      data: lostPet
    });
  } catch (error: any) {
    console.error('报告走失宠物错误:', error);
    res.status(500).json({
      success: false,
      message: '报告走失宠物失败',
      error: error.message
    });
  }
};

// 获取走失宠物列表
export const getLostPets = async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query: any = {};
    if (status) query.status = status;

    const lostPets = await LostPet.find(query)
      .populate('reporterId', 'username phone avatar')
      .populate('petId', 'name species breed images')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await LostPet.countDocuments(query);

    res.json({
      success: true,
      data: lostPets,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    console.error('获取走失宠物列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取走失宠物列表失败',
      error: error.message
    });
  }
};

// 获取走失宠物详情
export const getLostPetById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 验证 ObjectId 格式
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '无效的宠物 ID 格式'
      });
    }

    const lostPet = await LostPet.findById(id)
      .populate('reporterId', 'username phone email avatar')
      .populate('petId', 'name species breed age images description');

    if (!lostPet) {
      return res.status(404).json({
        success: false,
        message: '走失宠物记录不存在'
      });
    }

    // 获取线索列表
    const clues = await LostPet.find({
      relatedLostPetId: id,
      type: 'clue'
    }).populate('reporterId', 'username avatar');

    // 获取匹配记录
    const matches = await LostPet.find({
      relatedLostPetId: id,
      type: 'match'
    }).populate('reporterId', 'username avatar');

    res.json({
      success: true,
      data: {
        lostPet,
        clues,
        matches
      }
    });
  } catch (error: any) {
    console.error('获取走失宠物详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取走失宠物详情失败',
      error: error.message
    });
  }
};

// 智能匹配相似的走失宠物
export const matchLostPets = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const lostPet = await LostPet.findById(id);
    if (!lostPet) {
      return res.status(404).json({
        success: false,
        message: '走失宠物记录不存在'
      });
    }

    // 查找时间和地点相近的其他走失记录
    const timeWindow = 7 * 24 * 60 * 60 * 1000; // 7 天
    const timeMin = new Date(lostPet.lostTime.getTime() - timeWindow);
    const timeMax = new Date(lostPet.lostTime.getTime() + timeWindow);

    const potentialMatches = await LostPet.find({
      _id: { $ne: id },
      lostTime: { $gte: timeMin, $lte: timeMax },
      status: { $in: ['lost', 'found'] }
    });

    const matches = [];

    for (const potentialMatch of potentialMatches) {
      // 计算距离
      const distance = calculateDistance(
        lostPet.lostLocation.coordinates,
        potentialMatch.lostLocation.coordinates
      );

      // 如果距离在 5 公里内，认为是潜在匹配
      if (distance < 5000) {
        matches.push({
          lostPet: potentialMatch,
          distance,
          similarityScore: calculateSimilarity(lostPet, potentialMatch, distance)
        });
      }
    }

    // 按相似度排序
    matches.sort((a, b) => b.similarityScore - a.similarityScore);

    // 保存匹配记录
    for (const match of matches.slice(0, 5)) { // 保存前 5 个最相似的
      const matchRecord = new LostPet({
        type: 'match',
        description: `智能匹配到相似的走失记录`,
        lostTime: lostPet.lostTime,
        lostLocation: lostPet.lostLocation,
        reporterId: lostPet.reporterId,
        relatedLostPetId: id,
        matchedWith: match.lostPet._id,
        status: 'pending'
      });
      await matchRecord.save();
    }

    res.json({
      success: true,
      data: {
        original: lostPet,
        matches: matches.slice(0, 10) // 返回前 10 个匹配
      }
    });
  } catch (error: any) {
    console.error('匹配走失宠物错误:', error);
    res.status(500).json({
      success: false,
      message: '匹配走失宠物失败',
      error: error.message
    });
  }
};

// 上报线索
export const submitClue = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { description, sightingTime, sightingLocation, photos } = req.body;

    const lostPet = await LostPet.findById(id);
    if (!lostPet) {
      return res.status(404).json({
        success: false,
        message: '走失宠物记录不存在'
      });
    }

    const clue = new LostPet({
      type: 'clue',
      description,
      lostTime: sightingTime ? new Date(sightingTime) : new Date(),
      lostLocation: sightingLocation || lostPet.lostLocation,
      reporterId: req.user!.userId,
      relatedLostPetId: id,
      photos: photos || [],
      status: 'pending'
    });

    await clue.save();

    res.status(201).json({
      success: true,
      message: '线索上报成功',
      data: clue
    });
  } catch (error: any) {
    console.error('上报线索错误:', error);
    res.status(500).json({
      success: false,
      message: '上报线索失败',
      error: error.message
    });
  }
};

// 更新走失宠物状态
export const updateLostPetStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const lostPet = await LostPet.findOne({
      _id: id,
      reporterId: req.user!.userId
    });

    if (!lostPet) {
      return res.status(404).json({
        success: false,
        message: '走失宠物记录不存在或无权限'
      });
    }

    lostPet.status = status;
    if (notes) {
      lostPet.notes = notes;
    }

    await lostPet.save();

    // 如果找到宠物，更新关联的宠物状态
    if (status === 'found' && lostPet.petId) {
      await Pet.findByIdAndUpdate(lostPet.petId, {
        isLost: false,
        foundAt: new Date()
      });
    }

    res.json({
      success: true,
      message: '状态更新成功',
      data: lostPet
    });
  } catch (error: any) {
    console.error('更新状态错误:', error);
    res.status(500).json({
      success: false,
      message: '更新状态失败',
      error: error.message
    });
  }
};

// 获取我的走失宠物报告
export const getMyLostPets = async (req: AuthRequest, res: Response) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query: any = {
      reporterId: req.user!.userId,
      type: { $in: ['lost', undefined] }
    };
    if (status) query.status = status;

    const lostPets = await LostPet.find(query)
      .populate('petId', 'name species breed images')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await LostPet.countDocuments(query);

    res.json({
      success: true,
      data: lostPets,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    console.error('获取我的走失宠物错误:', error);
    res.status(500).json({
      success: false,
      message: '获取我的走失宠物失败',
      error: error.message
    });
  }
};

// 获取附近的走失宠物
export const getNearbyLostPets = async (req: Request, res: Response) => {
  try {
    const { longitude, latitude, distance = 10000 } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: '请提供经度和纬度'
      });
    }

    const lostPets = await LostPet.find({
      status: { $in: ['lost', 'found'] },
      lostLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)]
          },
          $maxDistance: Number(distance)
        }
      }
    })
      .populate('reporterId', 'username phone')
      .populate('petId', 'name species breed images')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: lostPets
    });
  } catch (error: any) {
    console.error('获取附近走失宠物错误:', error);
    res.status(500).json({
      success: false,
      message: '获取附近走失宠物失败',
      error: error.message
    });
  }
};

// 计算两点之间的距离（米）
function calculateDistance(coord1: number[], coord2: number[]): number {
  const R = 6371e3; // 地球半径（米）
  const lat1 = (coord1[1] * Math.PI) / 180;
  const lat2 = (coord2[1] * Math.PI) / 180;
  const dLat = ((coord2[1] - coord1[1]) * Math.PI) / 180;
  const dLon = ((coord2[0] - coord1[0]) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// 计算相似度分数
function calculateSimilarity(lostPet1: any, lostPet2: any, distance: number): number {
  let score = 100;

  // 距离越近分数越高
  score -= Math.min(distance / 100, 50);

  // 时间越近分数越高
  const timeDiff = Math.abs(lostPet1.lostTime.getTime() - lostPet2.lostTime.getTime());
  score -= Math.min(timeDiff / (24 * 60 * 60 * 1000), 30);

  // 如果品种相同加分
  if (lostPet1.petId && lostPet2.petId) {
    if (lostPet1.petId.breed === lostPet2.petId.breed) {
      score += 20;
    }
    if (lostPet1.petId.species === lostPet2.petId.species) {
      score += 10;
    }
  }

  return Math.max(0, score);
}

// 删除走失宠物报告
export const deleteLostPet = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const lostPet = await LostPet.findOne({
      _id: id,
      reporterId: req.user!.userId
    });

    if (!lostPet) {
      return res.status(404).json({
        success: false,
        message: '走失宠物记录不存在或无权限'
      });
    }

    await LostPet.deleteOne({ _id: id });

    res.json({
      success: true,
      message: '走失宠物报告已删除'
    });
  } catch (error: any) {
    console.error('删除走失宠物错误:', error);
    res.status(500).json({
      success: false,
      message: '删除走失宠物报告失败',
      error: error.message
    });
  }
};
