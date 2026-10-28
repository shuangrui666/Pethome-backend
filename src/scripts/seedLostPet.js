require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User.model');
const Pet = require('../models/Pet.model');
const LostPet = require('../models/LostPet.model');

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

    // 查找一个宠物
    const pet = await Pet.findOne();
    if (!pet) {
      console.error('❌ 没有找到宠物，请先创建宠物数据');
      process.exit(1);
    }
    console.log(`🐕 使用宠物：${pet.name}`);

    // 创建测试走失宠物数据
    const lostPets = [
      {
        petId: pet._id,
        reporterId: user._id,
        petName: pet.name,
        species: 'dog',
        breed: pet.breed || '金毛寻回犬',
        gender: 'male',
        age: pet.age || 3,
        color: pet.color || '金黄色',
        features: '脖子上戴着红色项圈，上面有联系方式铭牌。性格温顺，见到人会摇尾巴。',
        images: pet.images || ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=800'],
        lostTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 天前
        lostLocation: {
          type: 'Point',
          coordinates: [116.4074, 39.9042], // 北京
          address: '北京市朝阳区建国路 88 号 SOHO 现代城附近',
          city: '北京市',
          district: '朝阳区'
        },
        lastSeenTime: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 小时前
        lastSeenLocation: '建国门地铁站附近',
        contactPhone: user.phone || '13800138000',
        contactWechat: user.username || 'lostpet2024',
        reward: 5000,
        status: 'lost',
        notes: '非常着急，宠物是家人重要的成员，如有线索请立刻联系！',
        matches: [],
        reports: []
      },
      {
        petId: pet._id,
        reporterId: user._id,
        petName: '小白',
        species: 'cat',
        breed: '英国短毛猫',
        gender: 'female',
        age: 2,
        color: '白色',
        features: '眼睛是蓝色的，脖子上戴着粉色项圈，胆小怕生，叫名字会有反应。',
        images: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800'],
        lostTime: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 天前
        lostLocation: {
          type: 'Point',
          coordinates: [121.4737, 31.2304], // 上海
          address: '上海市浦东新区陆家嘴环路 1000 号恒生银行大厦附近',
          city: '上海市',
          district: '浦东新区'
        },
        lastSeenTime: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 小时前
        lastSeenLocation: '世纪大道公园',
        contactPhone: '13900139000',
        contactWechat: 'xiaobai2024',
        reward: 3000,
        status: 'lost',
        notes: '刚绝育不久，可能需要特别照顾',
        matches: [],
        reports: []
      },
      {
        petId: pet._id,
        reporterId: user._id,
        petName: '豆豆',
        species: 'dog',
        breed: '泰迪犬',
        gender: 'female',
        age: 5,
        color: '棕色',
        features: '体型较小，毛发修剪得很整齐，喜欢叼着一个小玩具。',
        images: ['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800'],
        lostTime: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 小时前
        lostLocation: {
          type: 'Point',
          coordinates: [113.2644, 23.1291], // 广州
          address: '广州市天河区天河路 208 号天河城附近',
          city: '广州市',
          district: '天河区'
        },
        lastSeenTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 小时前
        lastSeenLocation: '正佳广场门口',
        contactPhone: '13700137000',
        contactWechat: 'doudou_love',
        reward: 2000,
        status: 'lost',
        notes: '年纪较大，需要按时吃药，非常着急！',
        matches: [],
        reports: []
      }
    ];

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
