import { Request, Response } from 'express';
import Pet from '../models/Pet.model';
import { AuthRequest } from '../middleware/auth.middleware';
import mongoose from 'mongoose';

// 创建宠物
export const createPet = async (req: AuthRequest, res: Response) => {
  try {
    const { name, species, breed, gender, age, description, location, isAdoptable } = req.body;

    const images = req.files ? (req.files as Express.Multer.File[]).map(file => `/uploads/${file.filename}`) : [];

    const pet = new Pet({
      ownerId: req.user!.userId,
      name,
      species,
      breed,
      gender,
      age: parseInt(age),
      description,
      images,
      location: location || {
        type: 'Point',
        coordinates: [116.4074, 39.9042] // 默认北京坐标
      },
      isAdoptable: isAdoptable || false,
      isLost: false
    });

    await pet.save();

    res.status(201).json({
      success: true,
      message: '宠物信息创建成功',
      data: pet
    });
  } catch (error: any) {
    console.error('创建宠物错误:', error);
    res.status(500).json({
      success: false,
      message: '创建宠物失败',
      error: error.message
    });
  }
};

// 获取宠物列表
export const getPets = async (req: Request, res: Response) => {
  try {
    const { species, gender, page = 1, limit = 20 } = req.query;

    const query: any = {};
    
    if (species) query.species = species;
    if (gender) query.gender = gender;

    const pets = await Pet.find(query)
      .populate('ownerId', 'username avatar')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Pet.countDocuments(query);

    res.json({
      success: true,
      data: pets,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    console.error('获取宠物列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取宠物列表失败',
      error: error.message
    });
  }
};

// 获取宠物详情
export const getPetById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const pet = await Pet.findById(id)
      .populate('ownerId', 'username avatar phone');
    
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: '宠物不存在'
      });
    }

    res.json({
      success: true,
      data: pet
    });
  } catch (error: any) {
    console.error('获取宠物详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取宠物详情失败',
      error: error.message
    });
  }
};

// 更新宠物
export const updatePet = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // 检查宠物是否属于当前用户
    const pet = await Pet.findOne({ 
      _id: id, 
      ownerId: req.user!.userId 
    });

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: '宠物不存在或无权限'
      });
    }

    // 处理图片更新
    if (req.files) {
      updates.images = (req.files as Express.Multer.File[]).map(file => `/uploads/${file.filename}`);
    }

    // 更新年龄为数字
    if (updates.age) {
      updates.age = parseInt(updates.age);
    }

    const updatedPet = await Pet.findByIdAndUpdate(id, updates, {
      new: true
    }).populate('ownerId', 'username avatar');

    res.json({
      success: true,
      message: '宠物信息更新成功',
      data: updatedPet
    });
  } catch (error: any) {
    console.error('更新宠物错误:', error);
    res.status(500).json({
      success: false,
      message: '更新宠物失败',
      error: error.message
    });
  }
};

// 删除宠物
export const deletePet = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const pet = await Pet.findOneAndDelete({ 
      _id: id, 
      ownerId: req.user!.userId 
    });

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: '宠物不存在或无权限'
      });
    }

    res.json({
      success: true,
      message: '宠物信息删除成功'
    });
  } catch (error: any) {
    console.error('删除宠物错误:', error);
    res.status(500).json({
      success: false,
      message: '删除宠物失败',
      error: error.message
    });
  }
};

// 获取附近的宠物
export const getNearbyPets = async (req: Request, res: Response) => {
  try {
    const { longitude, latitude, distance = 10000 } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: '请提供经度和纬度'
      });
    }

    const pets = await Pet.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)]
          },
          $maxDistance: Number(distance)
        }
      }
    }).populate('ownerId', 'username avatar');

    res.json({
      success: true,
      data: pets
    });
  } catch (error: any) {
    console.error('获取附近宠物错误:', error);
    res.status(500).json({
      success: false,
      message: '获取附近宠物失败',
      error: error.message
    });
  }
};

// 获取可领养的宠物
export const getAdoptablePets = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const pets = await Pet.find({ isAdoptable: true })
      .populate('ownerId', 'username avatar')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Pet.countDocuments({ isAdoptable: true });

    res.json({
      success: true,
      data: pets,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    console.error('获取可领养宠物错误:', error);
    res.status(500).json({
      success: false,
      message: '获取可领养宠物失败',
      error: error.message
    });
  }
};

// 获取我的宠物
export const getMyPets = async (req: AuthRequest, res: Response) => {
  try {
    const pets = await Pet.find({ ownerId: req.user!.userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: pets
    });
  } catch (error: any) {
    console.error('获取我的宠物错误:', error);
    res.status(500).json({
      success: false,
      message: '获取我的宠物失败',
      error: error.message
    });
  }
};
