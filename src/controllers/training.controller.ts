import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Training from '../models/Training.model';
import { AuthRequest } from '../middleware/auth.middleware';

// 创建训狗服务预约
export const createTrainingAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const {
      trainerId,
      trainerName,
      petName,
      petAge,
      petBreed,
      trainingType,
      trainingStage,
      startDate,
      endDate,
      schedule,
      notes,
      contactPhone
    } = req.body;

    const appointment = new Training({
      trainerId,
      trainerName,
      petName,
      petAge,
      petBreed,
      trainingType,
      trainingStage,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      schedule,
      notes,
      contactPhone,
      createdBy: req.user!.userId,
      status: 'pending',
      progress: 0
    });

    await appointment.save();

    res.status(201).json({
      success: true,
      message: '训狗预约创建成功',
      data: appointment
    });
  } catch (error: any) {
    console.error('创建训狗预约错误:', error);
    res.status(500).json({
      success: false,
      message: '创建训狗预约失败',
      error: error.message
    });
  }
};

// 获取训狗服务列表
export const getTrainingServices = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, trainingType, location, sortBy = 'createdAt' } = req.query;

    const query: any = { recordType: 'service' };
    
    if (trainingType) query.trainingType = trainingType;
    if (location && req.query.latitude && req.query.longitude) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(req.query.longitude), Number(req.query.latitude)]
          },
          $maxDistance: Number(req.query.distance || 10000)
        }
      };
    }

    const services = await Training.find(query)
      .populate('trainerId', 'username avatar phone')
      .sort({ [sortBy as string]: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Training.countDocuments(query);

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
    console.error('获取训狗服务错误:', error);
    res.status(500).json({
      success: false,
      message: '获取训狗服务失败',
      error: error.message
    });
  }
};

// 获取我的预约列表
export const getMyAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, status, startDate, endDate } = req.query;

    const query: any = { 
      createdBy: req.user!.userId,
      recordType: 'appointment'
    };
    
    if (status) query.status = status;
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate as string);
      if (endDate) query.startDate.$lte = new Date(endDate as string);
    }

    const appointments = await Training.find(query)
      .populate('trainerId', 'username avatar phone')
      .sort({ startDate: 1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Training.countDocuments(query);

    res.json({
      success: true,
      data: appointments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    console.error('获取我的预约错误:', error);
    res.status(500).json({
      success: false,
      message: '获取我的预约失败',
      error: error.message
    });
  }
};

// 获取预约详情
export const getAppointmentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const appointment = await Training.findOne({
      _id: id,
      createdBy: req.user!.userId
    }).populate('trainerId', 'username avatar phone bio');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: '预约不存在'
      });
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error: any) {
    console.error('获取预约详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取预约详情失败',
      error: error.message
    });
  }
};

// 更新预约状态
export const updateAppointmentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const appointment = await Training.findOne({
      _id: id,
      createdBy: req.user!.userId
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: '预约不存在'
      });
    }

    appointment.status = status;
    if (notes) {
      appointment.notes = notes;
    }

    await appointment.save();

    res.json({
      success: true,
      message: '预约状态更新成功',
      data: appointment
    });
  } catch (error: any) {
    console.error('更新预约状态错误:', error);
    res.status(500).json({
      success: false,
      message: '更新预约状态失败',
      error: error.message
    });
  }
};

// 取消预约
export const cancelAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await Training.findOne({
      _id: id,
      createdBy: req.user!.userId
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: '预约不存在'
      });
    }

    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: '无法取消该预约'
      });
    }

    appointment.status = 'cancelled';
    appointment.notes = reason || '用户取消';
    
    await appointment.save();

    res.json({
      success: true,
      message: '预约取消成功',
      data: appointment
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

// 更新训练进度
export const updateTrainingProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { sessionNotes, trainerNotes } = req.body;

    const appointment = await Training.findOne({
      _id: id,
      $or: [
        { createdBy: req.user!.userId },
        { trainerId: req.user!.userId }
      ]
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: '预约不存在'
      });
    }

    if (sessionNotes) {
      appointment.notes.push({
        _id: new mongoose.Types.ObjectId(),
        content: sessionNotes,
        createdAt: new Date()
      });
    }
    if (trainerNotes) {
      appointment.trainerNotes = trainerNotes;
    }

    await appointment.save();

    res.json({
      success: true,
      message: '训练进度更新成功',
      data: appointment
    });
  } catch (error: any) {
    console.error('更新训练进度错误:', error);
    res.status(500).json({
      success: false,
      message: '更新训练进度失败',
      error: error.message
    });
  }
};

// 确认预约
export const confirmAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const appointment = await Training.findOne({
      _id: id,
      trainerId: req.user!.userId
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: '预约不存在或无权限'
      });
    }

    appointment.status = 'active';
    await appointment.save();

    res.json({
      success: true,
      message: '预约确认成功',
      data: appointment
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

// 完成训练阶段
export const completeTrainingStage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, completionDate, notes } = req.body;

    const appointment = await Training.findOne({
      _id: id,
      trainerId: req.user!.userId
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: '预约不存在或无权限'
      });
    }

    appointment.stages.push({
      _id: new mongoose.Types.ObjectId(),
      name,
      progress: 100,
      status: 'completed',
      startedAt: new Date(),
      completedAt: completionDate ? new Date(completionDate) : new Date()
    });

    await appointment.save();

    res.json({
      success: true,
      message: '训练阶段完成成功',
      data: appointment
    });
  } catch (error: any) {
    console.error('完成训练阶段错误:', error);
    res.status(500).json({
      success: false,
      message: '完成训练阶段失败',
      error: error.message
    });
  }
};

// 添加训练评价
export const addTrainingReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, review, images } = req.body;

    const appointment = await Training.findOne({
      _id: id,
      createdBy: req.user!.userId
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: '预约不存在'
      });
    }

    if (appointment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: '只有完成的训练才能评价'
      });
    }

    if (appointment.review) {
      return res.status(400).json({
        success: false,
        message: '已经评价过'
      });
    }

    appointment.review = `${rating}星:${review}`;

    await appointment.save();

    res.json({
      success: true,
      message: '评价成功',
      data: appointment
    });
  } catch (error: any) {
    console.error('添加评价错误:', error);
    res.status(500).json({
      success: false,
      message: '添加评价失败',
      error: error.message
    });
  }
};

// 获取训练阶段定义
export const getTrainingStages = async (req: Request, res: Response) => {
  try {
    const stages = [
      {
        name: '基础训练',
        description: '基础服从训练，建立主人与宠物的信任关系',
        duration: '4-6 周',
        skills: [
          '坐下',
          '等待',
          '过来',
          '随行',
          '定点大小便'
        ],
        level: 1
      },
      {
        name: '进阶训练',
        description: '强化基础技能，增加复杂指令和社交训练',
        duration: '4-6 周',
        skills: [
          '握手',
          '趴下',
          '翻滚',
          '社交训练',
          '分离焦虑训练'
        ],
        level: 2
      },
      {
        name: '高级训练',
        description: '高级技能和行为矫正，个性化训练',
        duration: '6-8 周',
        skills: [
          '护卫技能',
          '搜救技能',
          '行为问题矫正',
          '专业技能培训'
        ],
        level: 3
      }
    ];

    res.json({
      success: true,
      data: stages
    });
  } catch (error: any) {
    console.error('获取训练阶段错误:', error);
    res.status(500).json({
      success: false,
      message: '获取训练阶段失败',
      error: error.message
    });
  }
};

// 获取训练类型
export const getTrainingTypes = async (req: Request, res: Response) => {
  try {
    const types = [
      {
        id: 'basic',
        name: '基础服从训练',
        description: '适合幼犬，建立基本服从性',
        priceRange: '2000-4000 元'
      },
      {
        id: 'behavior',
        name: '行为矫正训练',
        description: '纠正不良行为习惯',
        priceRange: '3000-6000 元'
      },
      {
        id: 'social',
        name: '社交训练',
        description: '提升宠物社交能力',
        priceRange: '2500-5000 元'
      },
      {
        id: 'agility',
        name: '敏捷训练',
        description: '提升宠物体能和协调性',
        priceRange: '4000-8000 元'
      },
      {
        id: 'protection',
        name: '护卫训练',
        description: '专业护卫技能训练',
        priceRange: '6000-12000 元'
      }
    ];

    res.json({
      success: true,
      data: types
    });
  } catch (error: any) {
    console.error('获取训练类型错误:', error);
    res.status(500).json({
      success: false,
      message: '获取训练类型失败',
      error: error.message
    });
  }
};

// 获取训犬师列表
export const getTrainers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, trainingType, location, sortBy = 'rating' } = req.query;

    // 这里假设从用户表中获取训犬师信息
    // 实际应用中应该有专门的训犬师表
    const query: any = { role: 'trainer' };
    
    if (location && req.query.latitude && req.query.longitude) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(req.query.longitude), Number(req.query.latitude)]
          },
          $maxDistance: Number(req.query.distance || 10000)
        }
      };
    }

    // 模拟数据
    const trainers = [
      {
        _id: '1',
        username: '王教练',
        avatar: '/avatars/trainer1.jpg',
        phone: '13800138001',
        bio: '10 年训犬经验，国际认证训犬师',
        trainingTypes: ['basic', 'behavior', 'social'],
        rating: 4.8,
        completedTrainings: 200,
        location: {
          type: 'Point',
          coordinates: [116.4074, 39.9042]
        }
      },
      {
        _id: '2',
        username: '李教练',
        avatar: '/avatars/trainer2.jpg',
        phone: '13800138002',
        bio: '专业敏捷训练教练，多次全国冠军',
        trainingTypes: ['agility', 'protection'],
        rating: 4.9,
        completedTrainings: 150,
        location: {
          type: 'Point',
          coordinates: [116.4174, 39.9142]
        }
      }
    ];

    const total = trainers.length;

    const paginatedTrainers = trainers
      .slice((Number(page) - 1) * Number(limit), Number(page) * Number(limit));

    res.json({
      success: true,
      data: paginatedTrainers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    console.error('获取训犬师列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取训犬师列表失败',
      error: error.message
    });
  }
};

// 获取训犬师详情
export const getTrainerProfile = async (req: Request, res: Response) => {
  try {
    const { trainerId } = req.params;

    // 模拟数据
    const trainer = {
      _id: trainerId,
      username: '王教练',
      avatar: '/avatars/trainer1.jpg',
      phone: '13800138001',
      bio: '10 年训犬经验，国际认证训犬师',
      trainingTypes: ['basic', 'behavior', 'social'],
      rating: 4.8,
      completedTrainings: 200,
      certifications: [
        '国际认证训犬师',
        '宠物行为矫正师'
      ],
      experience: '2014 年至今',
      location: {
        type: 'Point',
        coordinates: [116.4074, 39.9042]
      }
    };

    res.json({
      success: true,
      data: trainer
    });
  } catch (error: any) {
    console.error('获取训犬师详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取训犬师详情失败',
      error: error.message
    });
  }
};

// 创建训练服务
export const createTrainingService = async (req: AuthRequest, res: Response) => {
  try {
    const {
      trainerName,
      trainerAvatar,
      petId,
      petName,
      species,
      breed,
      age,
      ageUnit,
      gender,
      personality,
      currentLevel,
      trainingPlan,
      goals,
      specialNeeds,
      price,
      startDate,
      endDate,
      location,
      schedule,
      customerName,
      customerPhone
    } = req.body;

    const training = new Training({
      trainerId: req.user!.userId,
      trainerName,
      trainerAvatar,
      petId,
      petName,
      species,
      breed,
      age,
      ageUnit,
      gender,
      personality,
      currentLevel,
      trainingPlan,
      goals,
      specialNeeds,
      price,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      location,
      schedule,
      customerId: req.user!.userId,
      customerName,
      customerPhone,
      status: 'pending'
    });

    await training.save();

    res.status(201).json({
      success: true,
      message: '训练服务创建成功',
      data: training
    });
  } catch (error: any) {
    console.error('创建训练服务错误:', error);
    res.status(500).json({
      success: false,
      message: '创建训练服务失败',
      error: error.message
    });
  }
};

// 获取训练服务列表
export const getTrainingServiceList = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, currentLevel, location, sortBy = 'createdAt' } = req.query;

    const query: any = {};
    
    if (currentLevel) query.currentLevel = currentLevel;
    if (location && req.query.latitude && req.query.longitude) {
      query['location.district'] = req.query.location;
    }

    const services = await Training.find(query)
      .populate('trainerId', 'username avatar phone')
      .populate('petId', 'name species breed')
      .sort({ [sortBy as string]: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Training.countDocuments(query);

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
    console.error('获取训练服务列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取训练服务列表失败',
      error: error.message
    });
  }
};

// 获取训练服务详情
export const getTrainingServiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const service = await Training.findById(id)
      .populate('trainerId', 'username avatar phone bio')
      .populate('petId', 'name species breed age');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: '训练服务不存在'
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error: any) {
    console.error('获取训练服务详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取训练服务详情失败',
      error: error.message
    });
  }
};

// 更新训练服务
export const updateTrainingService = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const service = await Training.findOne({
      _id: id,
      customerId: req.user!.userId
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: '训练服务不存在或无权限'
      });
    }

    // 更新允许的字段
    const allowedFields = [
      'petName', 'species', 'breed', 'age', 'ageUnit', 'gender',
      'personality', 'currentLevel', 'trainingPlan', 'goals',
      'specialNeeds', 'price', 'startDate', 'endDate', 'location',
      'schedule'
    ];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        (service as any)[field] = updateData[field];
      }
    }

    await service.save();

    res.json({
      success: true,
      message: '训练服务更新成功',
      data: service
    });
  } catch (error: any) {
    console.error('更新训练服务错误:', error);
    res.status(500).json({
      success: false,
      message: '更新训练服务失败',
      error: error.message
    });
  }
};

// 删除训练服务
export const deleteTrainingService = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const service = await Training.findOne({
      _id: id,
      customerId: req.user!.userId
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: '训练服务不存在或无权限'
      });
    }

    if (service.status === 'active') {
      return res.status(400).json({
        success: false,
        message: '进行中的训练服务无法删除'
      });
    }

    await Training.deleteOne({ _id: id });

    res.json({
      success: true,
      message: '训练服务删除成功'
    });
  } catch (error: any) {
    console.error('删除训练服务错误:', error);
    res.status(500).json({
      success: false,
      message: '删除训练服务失败',
      error: error.message
    });
  }
};

// 报名训练
export const enrollTraining = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { petId, trainingType, startDate, specialNeeds } = req.body;

    const service = await Training.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: '训练服务不存在'
      });
    }

    // 创建新的报名记录
    const enrollment = new Training({
      trainerId: service.trainerId,
      trainerName: service.trainerName,
      petId,
      petName: service.petName,
      species: service.species,
      breed: service.breed,
      age: service.age,
      ageUnit: service.ageUnit,
      gender: service.gender,
      personality: service.personality,
      currentLevel: service.currentLevel,
      trainingPlan: service.trainingPlan,
      goals: service.goals,
      specialNeeds,
      price: service.price,
      startDate: new Date(startDate),
      location: service.location,
      schedule: service.schedule,
      customerId: req.user!.userId,
      customerName: req.body.customerName || '',
      customerPhone: req.body.customerPhone || '',
      status: 'pending'
    });

    await enrollment.save();

    res.status(201).json({
      success: true,
      message: '报名成功',
      data: enrollment
    });
  } catch (error: any) {
    console.error('报名训练错误:', error);
    res.status(500).json({
      success: false,
      message: '报名训练失败',
      error: error.message
    });
  }
};

// 取消报名
export const cancelEnrollment = async (req: AuthRequest, res: Response) => {
  try {
    const { enrollmentId } = req.body;

    const enrollment = await Training.findOne({
      _id: enrollmentId,
      customerId: req.user!.userId
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: '报名记录不存在或无权限'
      });
    }

    if (enrollment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: '已完成的训练无法取消'
      });
    }

    enrollment.status = 'cancelled';
    await enrollment.save();

    res.json({
      success: true,
      message: '取消报名成功',
      data: enrollment
    });
  } catch (error: any) {
    console.error('取消报名错误:', error);
    res.status(500).json({
      success: false,
      message: '取消报名失败',
      error: error.message
    });
  }
};

// 获取我的训练
export const getMyTrainings = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, status, sortBy = 'createdAt' } = req.query;

    const query: any = {
      customerId: req.user!.userId
    };

    if (status) query.status = status;

    const trainings = await Training.find(query)
      .populate('trainerId', 'username avatar phone bio')
      .populate('petId', 'name species breed')
      .sort({ [sortBy as string]: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Training.countDocuments(query);

    res.json({
      success: true,
      data: trainings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    console.error('获取我的训练错误:', error);
    res.status(500).json({
      success: false,
      message: '获取我的训练失败',
      error: error.message
    });
  }
};

// 获取训练计划
export const getTrainingPlan = async (req: AuthRequest, res: Response) => {
  try {
    const { id, enrollmentId } = req.params;

    const training = await Training.findOne({
      _id: enrollmentId,
      $or: [
        { customerId: req.user!.userId },
        { trainerId: req.user!.userId }
      ]
    }).populate('trainerId', 'username avatar phone');

    if (!training) {
      return res.status(404).json({
        success: false,
        message: '报名记录不存在或无权限'
      });
    }

    // 生成训练计划
    const plan = {
      petInfo: {
        name: training.petName,
        breed: training.breed,
        age: training.age,
        currentLevel: training.currentLevel
      },
      phases: training.trainingPlan.map((phase, index) => ({
        ...phase,
        isCurrent: index === training.currentPhaseIndex,
        isCompleted: phase.completed
      })),
      currentPhase: training.trainingPlan[training.currentPhaseIndex],
      sessions: training.sessions,
      status: training.status
    };

    res.json({
      success: true,
      data: plan
    });
  } catch (error: any) {
    console.error('获取训练计划错误:', error);
    res.status(500).json({
      success: false,
      message: '获取训练计划失败',
      error: error.message
    });
  }
};
