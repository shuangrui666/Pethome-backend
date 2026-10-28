import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Medical from '../models/Medical.model';
import User from '../models/User.model';
import { AuthRequest } from '../middleware/auth.middleware';

// 创建诊断记录
export const createDiagnosis = async (req: AuthRequest, res: Response) => {
  try {
    const {
      petId,
      petName,
      symptoms,
      diagnosis,
      treatment,
      medications,
      doctorName,
      clinicName,
      visitDate,
      images,
      followUpDate,
      notes
    } = req.body;

    const medicalRecord = new Medical({
      petId,
      petName,
      symptoms,
      diagnosis,
      treatment,
      medications,
      doctorName,
      clinicName,
      visitDate: new Date(visitDate),
      images,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      notes,
      createdBy: req.user!.userId,
      recordType: 'diagnosis',
      status: 'completed'
    });

    await medicalRecord.save();

    res.status(201).json({
      success: true,
      message: '诊断记录创建成功',
      data: medicalRecord
    });
  } catch (error: any) {
    console.error('创建诊断记录错误:', error);
    res.status(500).json({
      success: false,
      message: '创建诊断记录失败',
      error: error.message
    });
  }
};

// 获取诊断记录列表
export const getDiagnosisRecords = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, petId, startDate, endDate, sortBy = 'createdAt' } = req.query;

    const query: any = { createdBy: req.user!.userId, recordType: 'diagnosis' };
    
    if (petId) query.petId = petId;
    if (startDate || endDate) {
      query.visitDate = {};
      if (startDate) query.visitDate.$gte = new Date(startDate as string);
      if (endDate) query.visitDate.$lte = new Date(endDate as string);
    }

    const records = await Medical.find(query)
      .sort({ [sortBy as string]: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Medical.countDocuments(query);

    res.json({
      success: true,
      data: records,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    console.error('获取诊断记录错误:', error);
    res.status(500).json({
      success: false,
      message: '获取诊断记录失败',
      error: error.message
    });
  }
};

// 获取诊断记录详情
export const getDiagnosisById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const record = await Medical.findOne({
      _id: id,
      createdBy: req.user!.userId
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: '诊断记录不存在'
      });
    }

    res.json({
      success: true,
      data: record
    });
  } catch (error: any) {
    console.error('获取诊断记录错误:', error);
    res.status(500).json({
      success: false,
      message: '获取诊断记录失败',
      error: error.message
    });
  }
};

// 更新诊断记录
export const updateDiagnosis = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const record = await Medical.findOne({
      _id: id,
      createdBy: req.user!.userId
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: '诊断记录不存在'
      });
    }

    // 允许更新的字段
    const allowedFields = [
      'symptoms', 'diagnosis', 'treatment', 'medications',
      'doctorName', 'clinicName', 'notes', 'followUpDate', 'status'
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        (record as any)[field] = updates[field];
      }
    }

    await record.save();

    res.json({
      success: true,
      message: '诊断记录更新成功',
      data: record
    });
  } catch (error: any) {
    console.error('更新诊断记录错误:', error);
    res.status(500).json({
      success: false,
      message: '更新诊断记录失败',
      error: error.message
    });
  }
};

// 删除诊断记录
export const deleteDiagnosis = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const record = await Medical.findOneAndDelete({
      _id: id,
      createdBy: req.user!.userId
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: '诊断记录不存在或无权限'
      });
    }

    res.json({
      success: true,
      message: '诊断记录删除成功'
    });
  } catch (error: any) {
    console.error('删除诊断记录错误:', error);
    res.status(500).json({
      success: false,
      message: '删除诊断记录失败',
      error: error.message
    });
  }
};

// 药品推荐
export const getMedicationRecommendations = async (req: Request, res: Response) => {
  try {
    const { symptoms, petType, petAge } = req.query;

    // 基于症状和宠物类型推荐药品
    // 这里使用简单的规则匹配，实际应用中可以使用 AI 模型
    const recommendations: any[] = [];

    const symptom = symptoms?.toString().toLowerCase() || '';
    
    // 常见症状对应的药品推荐
    const medicationDatabase: any = {
      '感冒': [
        { name: '宠物感冒药', dosage: '按体重计算', precautions: '避免过量' },
        { name: '维生素 C', dosage: '每日一次', precautions: '配合饮食' }
      ],
      '腹泻': [
        { name: '益生菌', dosage: '每日两次', precautions: '饭后服用' },
        { name: '蒙脱石散', dosage: '按体重计算', precautions: '多喝水' }
      ],
      '呕吐': [
        { name: '止吐药', dosage: '按医嘱', precautions: '观察症状' },
        { name: '电解质水', dosage: '少量多次', precautions: '防止脱水' }
      ],
      '皮肤病': [
        { name: '外用消炎药膏', dosage: '每日涂抹', precautions: '避免舔食' },
        { name: '抗真菌药', dosage: '按疗程使用', precautions: '定期复查' }
      ],
      '寄生虫': [
        { name: '驱虫药', dosage: '每月一次', precautions: '定期驱虫' },
        { name: '体外驱虫喷雾', dosage: '按需使用', precautions: '避免接触眼睛' }
      ]
    };

    // 匹配症状
    const medications: any[] = Object.values(medicationDatabase).flat();
    for (const [key, medicates] of Object.entries(medicationDatabase) as Array<[string, any[]]>) {
      if (symptom.includes(key)) {
        recommendations.push(...medicates.map((m: any) => ({
          ...m,
          symptom: key
        })));
      }
    }

    // 根据宠物类型和年龄调整推荐
    if (petType) {
      recommendations.forEach(rec => {
        if (petType === 'cat') {
          rec.precautions += ' 猫特别注意';
        } else if (petType === 'dog') {
          rec.precautions += ' 狗特别注意';
        }
      });
    }

    if (petAge && Number(petAge) < 1) {
      recommendations.forEach(rec => {
        rec.precautions += ' 幼宠慎用';
      });
    }

    res.json({
      success: true,
      data: recommendations,
      disclaimer: '以上建议仅供参考，请务必咨询专业兽医'
    });
  } catch (error: any) {
    console.error('获取药品推荐错误:', error);
    res.status(500).json({
      success: false,
      message: '获取药品推荐失败',
      error: error.message
    });
  }
};

// 预约就诊
export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const {
      clinicName,
      clinicId,
      doctorName,
      appointmentDate,
      petName,
      petType,
      symptoms,
      contactPhone,
      notes
    } = req.body;

    const appointment = new Medical({
      clinicName,
      clinicId,
      doctorName,
      petName,
      petType,
      symptoms,
      contactPhone,
      visitDate: new Date(appointmentDate),
      notes,
      createdBy: req.user!.userId,
      recordType: 'appointment',
      status: 'pending'
    });

    await appointment.save();

    res.status(201).json({
      success: true,
      message: '预约创建成功',
      data: appointment
    });
  } catch (error: any) {
    console.error('创建预约错误:', error);
    res.status(500).json({
      success: false,
      message: '创建预约失败',
      error: error.message
    });
  }
};

// 获取我的预约
export const getMyAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, status, startDate, endDate } = req.query;

    const query: any = { 
      createdBy: req.user!.userId, 
      recordType: 'appointment' 
    };
    
    if (status) query.status = status;
    if (startDate || endDate) {
      query.visitDate = {};
      if (startDate) query.visitDate.$gte = new Date(startDate as string);
      if (endDate) query.visitDate.$lte = new Date(endDate as string);
    }

    const appointments = await Medical.find(query)
      .sort({ visitDate: 1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Medical.countDocuments(query);

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
    console.error('获取预约列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取预约列表失败',
      error: error.message
    });
  }
};

// 更新预约状态
export const updateAppointmentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const appointment = await Medical.findOne({
      _id: id,
      createdBy: req.user!.userId,
      recordType: 'appointment'
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

    const appointment = await Medical.findOne({
      _id: id,
      createdBy: req.user!.userId,
      recordType: 'appointment'
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

// 获取附近宠物医院
export const findNearbyClinics = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, distance = 5000, page = 1, limit = 20 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: '需要提供经纬度'
      });
    }

    // 这里假设有一个 Clinics 集合，实际应用中需要创建
    // 如果没有，可以返回一个示例结构
    const clinics = [
      {
        _id: '1',
        name: '宠物综合医院',
        location: {
          type: 'Point',
          coordinates: [Number(longitude) + 0.01, Number(latitude)]
        },
        address: '示例地址 1',
        phone: '12345678901',
        services: ['诊断', '手术', '疫苗'],
        rating: 4.5
      },
      {
        _id: '2',
        name: '爱宠诊所',
        location: {
          type: 'Point',
          coordinates: [Number(longitude) - 0.01, Number(latitude)]
        },
        address: '示例地址 2',
        phone: '12345678902',
        services: ['诊断', '体检'],
        rating: 4.2
      }
    ];

    res.json({
      success: true,
      data: clinics,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: clinics.length
      }
    });
  } catch (error: any) {
    console.error('查找附近医院错误:', error);
    res.status(500).json({
      success: false,
      message: '查找附近医院失败',
      error: error.message
    });
  }
};

// 健康提醒
export const getHealthReminders = async (req: Request, res: Response) => {
  try {
    const { petType, petAge } = req.query;

    const reminders: any[] = [];

    // 根据宠物类型和年龄生成健康提醒
    if (petType === 'dog') {
      reminders.push(
        { type: '疫苗', content: '每年定期接种狂犬病和核心疫苗', frequency: '每年' },
        { type: '驱虫', content: '定期进行内外驱虫', frequency: '每月/每 3 个月' },
        { type: '体检', content: '年度全面体检', frequency: '每年' },
        { type: '牙齿', content: '定期清洁牙齿', frequency: '每月' }
      );
    } else if (petType === 'cat') {
      reminders.push(
        { type: '疫苗', content: '猫三联疫苗定期接种', frequency: '每年' },
        { type: '驱虫', content: '内外驱虫', frequency: '每月/每 3 个月' },
        { type: '体检', content: '年度体检，关注肾脏健康', frequency: '每年' },
        { type: '绝育', content: '建议适龄绝育', frequency: '6-8 个月' }
      );
    }

    // 根据年龄调整
    if (petAge && Number(petAge) > 7) {
      reminders.push(
        { type: '老年体检', content: '老年宠物建议半年体检一次', frequency: '每半年' },
        { type: '关节', content: '关注关节健康，适当补充营养品', frequency: '持续' }
      );
    }

    res.json({
      success: true,
      data: reminders
    });
  } catch (error: any) {
    console.error('获取健康提醒错误:', error);
    res.status(500).json({
      success: false,
      message: '获取健康提醒失败',
      error: error.message
    });
  }
};

// 获取诊断历史（别名）
export const getDiagnosisHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, petId, startDate, endDate, sortBy = 'createdAt' } = req.query;

    const query: any = { createdBy: req.user!.userId, recordType: 'diagnosis' };

    if (petId) query.petId = petId;
    if (startDate || endDate) {
      query.visitDate = {};
      if (startDate) query.visitDate.$gte = new Date(startDate as string);
      if (endDate) query.visitDate.$lte = new Date(endDate as string);
    }

    const records = await Medical.find(query)
      .sort({ [sortBy as string]: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Medical.countDocuments(query);

    res.json({
      success: true,
      data: records,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    console.error('获取诊断历史错误:', error);
    res.status(500).json({
      success: false,
      message: '获取诊断历史失败',
      error: error.message
    });
  }
};

// 获取兽医列表
export const getVetList = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, location, specialization } = req.query;

    // 返回示例兽医数据
    const vets = [
      {
        _id: '1',
        name: '张医生',
        specialization: '内科',
        experience: 10,
        clinicName: '爱宠宠物医院',
        location: '北京市朝阳区',
        rating: 4.8,
        available: true
      },
      {
        _id: '2',
        name: '李医生',
        specialization: '外科',
        experience: 8,
        clinicName: '宠物综合医院',
        location: '北京市海淀区',
        rating: 4.9,
        available: true
      },
      {
        _id: '3',
        name: '王医生',
        specialization: '皮肤科',
        experience: 12,
        clinicName: '健康宠物诊所',
        location: '上海市浦东新区',
        rating: 4.7,
        available: false
      }
    ];

    res.json({
      success: true,
      data: vets,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: vets.length
      }
    });
  } catch (error: any) {
    console.error('获取兽医列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取兽医列表失败',
      error: error.message
    });
  }
};

// 预约兽医
export const bookVetAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const {
      vetId,
      petId,
      appointmentTime,
      reason,
      contactPhone
    } = req.body;

    const appointment = new Medical({
      petId,
      symptoms: reason,
      doctorName: '兽医',
      visitDate: new Date(appointmentTime),
      contactPhone,
      createdBy: req.user!.userId,
      recordType: 'appointment',
      status: 'pending'
    });

    await appointment.save();

    res.status(201).json({
      success: true,
      message: '预约成功',
      data: appointment
    });
  } catch (error: any) {
    console.error('预约兽医错误:', error);
    res.status(500).json({
      success: false,
      message: '预约失败',
      error: error.message
    });
  }
};

// 获取医疗资源
export const getMedicalResources = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, category, type } = req.query;

    // 返回示例医疗资源数据
    const resources = [
      {
        _id: '1',
        title: '宠物疫苗指南',
        type: 'article',
        category: '预防医学',
        content: '详细的宠物疫苗接种指南',
        author: '兽医协会',
        createdAt: new Date()
      },
      {
        _id: '2',
        title: '常见宠物疾病手册',
        type: 'pdf',
        category: '疾病防治',
        content: '宠物常见疾病的诊断和治疗',
        author: '宠物医疗中心',
        createdAt: new Date()
      },
      {
        _id: '3',
        title: '宠物急救视频',
        type: 'video',
        category: '急救',
        content: '宠物急救技能培训视频',
        author: '兽医协会',
        createdAt: new Date()
      }
    ];

    res.json({
      success: true,
      data: resources,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: resources.length
      }
    });
  } catch (error: any) {
    console.error('获取医疗资源错误:', error);
    res.status(500).json({
      success: false,
      message: '获取医疗资源失败',
      error: error.message
    });
  }
};
