import mongoose from 'mongoose';
import dotenv from 'dotenv';
import LostPet from '../models/LostPet.model';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pet-home';

const mockLostPets = [
  {
    petName: '豆豆',
    species: 'dog',
    breed: '金毛寻回犬',
    gender: 'male',
    age: 2,
    color: '金色',
    features: '脖子上戴着红色项圈，尾巴末端有一撮白毛',
    images: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=800'],
    lostTime: new Date('2025-01-18T14:30:00Z'),
    lostLocation: {
      type: 'Point',
      coordinates: [113.3212, 23.1136],
      address: '广州市天河区珠江新城',
      city: '广州市',
      district: '天河区'
    },
    contactPhone: '138****5678',
    contactWechat: 'zhangsan123',
    reward: 2000,
    status: 'lost',
    reporterId: '67684a1b2c3d4e5f6a7b8c9d' // Placeholder - will be updated
  },
  {
    petName: '咪咪',
    species: 'cat',
    breed: '橘猫',
    gender: 'female',
    age: 1,
    color: '橘色',
    features: '左耳尖有一点缺角，肚子有一小块毛是白色的',
    images: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800'],
    lostTime: new Date('2025-01-17T20:00:00Z'),
    lostLocation: {
      type: 'Point',
      coordinates: [113.3512, 23.1208],
      address: '广州市天河区天河公园',
      city: '广州市',
      district: '天河区'
    },
    contactPhone: '139****1234',
    contactWechat: 'lisi567',
    reward: 1000,
    status: 'lost',
    reporterId: '67684a1b2c3d4e5f6a7b8c9e'
  },
  {
    petName: '旺财',
    species: 'dog',
    breed: '中华田园犬',
    gender: 'male',
    age: 5,
    color: '黄褐色',
    features: '体型中等，耳朵竖立，尾巴向上卷曲',
    images: ['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800'],
    lostTime: new Date('2025-01-16T10:15:00Z'),
    lostLocation: {
      type: 'Point',
      coordinates: [113.3089, 23.0356],
      address: '广州市番禺区大石镇',
      city: '广州市',
      district: '番禺区'
    },
    contactPhone: '136****9876',
    contactWechat: 'wang888',
    reward: 1500,
    status: 'lost',
    reporterId: '67684a1b2c3d4e5f6a7b8c9f'
  },
  {
    petName: '雪球',
    species: 'cat',
    breed: '英国短毛猫',
    gender: 'female',
    age: 3,
    color: '白色',
    features: '纯白色，蓝眼睛，体型圆润',
    images: ['https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800'],
    lostTime: new Date('2025-01-15T16:45:00Z'),
    lostLocation: {
      type: 'Point',
      coordinates: [113.3234, 23.0989],
      address: '广州市海珠区客村',
      city: '广州市',
      district: '海珠区'
    },
    contactPhone: '137****4567',
    contactWechat: 'chen999',
    reward: 3000,
    status: 'lost',
    reporterId: '67684a1b2c3d4e5f6a7b8ca0'
  },
  {
    petName: '可乐',
    species: 'dog',
    breed: '柯基犬',
    gender: 'male',
    age: 1,
    color: '黄白相间',
    features: '短腿大屁股，走路摇摇晃晃很可爱',
    images: ['https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800'],
    lostTime: new Date('2025-01-14T11:20:00Z'),
    lostLocation: {
      type: 'Point',
      coordinates: [113.2645, 23.1256],
      address: '广州市越秀区公园前',
      city: '广州市',
      district: '越秀区'
    },
    contactPhone: '135****7890',
    contactWechat: 'liu777',
    reward: 2500,
    status: 'found',
    reporterId: '67684a1b2c3d4e5f6a7b8ca1'
  },
  {
    petName: '小黑',
    species: 'cat',
    breed: '黑猫',
    gender: 'male',
    age: 2,
    color: '黑色',
    features: '全身乌黑，四只爪子是白色的，像戴了白手套',
    images: ['https://images.unsplash.com/photo-1513245543132-31f507447b27?w=800'],
    lostTime: new Date('2025-01-13T09:00:00Z'),
    lostLocation: {
      type: 'Point',
      coordinates: [113.2678, 23.1789],
      address: '广州市白云区江夏',
      city: '广州市',
      district: '白云区'
    },
    contactPhone: '134****2345',
    contactWechat: 'zhao666',
    reward: 1000,
    status: 'lost',
    reporterId: '67684a1b2c3d4e5f6a7b8ca2'
  },
  {
    petName: '豆豆',
    species: 'dog',
    breed: '泰迪犬',
    gender: 'female',
    age: 4,
    color: '棕色',
    features: '小型泰迪，毛发修剪得很整齐，戴着粉色项圈',
    images: ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800'],
    lostTime: new Date('2025-01-12T15:30:00Z'),
    lostLocation: {
      type: 'Point',
      coordinates: [113.5234, 22.7889],
      address: '广州市南沙区蕉门河',
      city: '广州市',
      district: '南沙区'
    },
    contactPhone: '133****6789',
    contactWechat: 'huang555',
    reward: 1800,
    status: 'lost',
    reporterId: '67684a1b2c3d4e5f6a7b8ca3'
  }
];

async function seedLostPets() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️  Clearing existing lost pets...');
    await LostPet.deleteMany({});
    console.log('✅ Cleared existing lost pets');

    console.log('📝 Inserting mock lost pets...');
    const inserted = await LostPet.insertMany(mockLostPets);
    console.log(`✅ Inserted ${inserted.length} lost pets`);

    console.log('\n📊 Inserted Lost Pet IDs:');
    inserted.forEach((pet, index) => {
      console.log(`  ${index + 1}. ${pet.petName} (${pet.species}): ${pet._id.toString()}`);
    });

    console.log('\n✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedLostPets();
