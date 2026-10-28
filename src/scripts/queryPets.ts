import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Pet from '../models/Pet.model';

dotenv.config();

async function queryPets() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pethome');
    console.log('✅ 数据库连接成功\n');

    const pets = await Pet.find().limit(10);
    
    console.log(`📊 找到 ${pets.length} 只宠物:\n`);
    for (const pet of pets) {
      console.log(`🐕 ${pet.name}`);
      console.log(`   品种：${pet.breed}`);
      console.log(`   年龄：${pet.age}${pet.ageUnit === 'year' ? '岁' : '个月'}`);
      console.log(`   性别：${pet.gender === 'male' ? '公' : '母'}`);
      console.log(`   颜色：${pet.color || '无'}`);
      console.log(`   描述：${pet.description || '无'}`);
      console.log(`   性格：${pet.temperament.join(', ') || '无'}`);
      console.log(`   图片：${pet.images[0] || '无'}`);
      console.log('');
    }

  } catch (error) {
    console.error('❌ 查询失败:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

queryPets();
