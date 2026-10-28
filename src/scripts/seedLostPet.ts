import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model';
import Pet from '../models/Pet.model';
import LostPet from '../models/LostPet.model';

dotenv.config();

async function seedLostPet() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pethome');
    console.log('✅ 数据库连接成功');

    // 清空现有数据
    await LostPet.deleteMany({});
    console.log('🗑️ 已清空走失宠物数据');

    // 查找一个用户作为报告人
    const user = await User.findOne({ role: 'user' });
    if (!user) {
      console.error('❌ 没有找到用户，请先创建用户');
      process.exit(1);
    }
    console.log(`👤 使用用户：${user.username}`);

    // 查找数据库中所有真实宠物
    const pets = await Pet.find().limit(5);
    if (pets.length === 0) {
      console.error('❌ 没有找到宠物，请先创建宠物数据');
      process.exit(1);
    }
    console.log(`🐕 找到 ${pets.length} 只真实宠物`);

    // 为每只真实宠物创建走失记录
    const lostPets = pets.map((pet, index) => ({
      petId: pet._id,
      reporterId: user._id,
      petName: pet.name,
      species: pet.species,
      breed: pet.breed,
      gender: pet.gender,
      age: pet.age,
      color: pet.color || '未知',
      features: pet.description || `性格${pet.temperament.join(', ')}`,
      images: pet.images.length > 0 ? pet.images : ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=800'],
      lostTime: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000),
      lostLocation: {
        type: 'Point',
        coordinates: [116.4074 + index * 0.01, 39.9042 + index * 0.01],
        address: `北京市朝阳区建国路${88 + index}号附近`,
        city: '北京市',
        district: '朝阳区'
      },
      lastSeenTime: new Date(Date.now() - (index + 1) * 12 * 60 * 60 * 1000),
      lastSeenLocation: '附近公园',
      contactPhone: user.phone || '13800138000',
      contactWechat: user.username || 'lostpet2024',
      reward: 3000 + index * 1000,
      status: 'lost',
      notes: `这是真实宠物${pet.name}的走失信息，非常着急！`,
      matches: [],
      reports: []
    }));

    // 插入数据
    const inserted = await LostPet.insertMany(lostPets);
    console.log(`✅ 成功创建 ${inserted.length} 条走失宠物记录`);

    // 显示创建的记录
    for (const lp of inserted) {
      console.log(`\n📝 走失宠物 ID: ${lp._id}`);
      console.log(`   宠物名称：${lp.petName}`);
      console.log(`   品种：${lp.breed}`);
      console.log(`   走失地点：${lp.lostLocation.address}`);
      console.log(`   走失时间：${lp.lostTime}`);
      console.log(`   悬赏：${lp.reward}元`);
    }

    console.log('\n✅ 数据填充完成！');
    console.log('📍 可以在前端访问：http://localhost:3000/lost-found/' + inserted[0]._id);

  } catch (error) {
    console.error('❌ 数据填充失败:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 数据库连接已关闭');
    process.exit(0);
  }
}

seedLostPet();
