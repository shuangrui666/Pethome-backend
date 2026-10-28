import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.model';
import Pet from '../src/models/Pet.model';
import Adoption from '../src/models/Adoption.model';

dotenv.config();

// 全国主要城市数据
const cities = [
  { name: '北京', districts: ['朝阳', '海淀', '丰台', '通州'], coords: [116.4074, 39.9042] },
  { name: '上海', districts: ['浦东', '黄浦', '徐汇', '静安'], coords: [121.4737, 31.2304] },
  { name: '广州', districts: ['天河', '越秀', '海珠', '白云'], coords: [113.2644, 23.1291] },
  { name: '深圳', districts: ['南山', '福田', '罗湖', '宝安'], coords: [114.0579, 22.5431] },
  { name: '成都', districts: ['锦江', '青羊', '金牛', '武侯'], coords: [104.0665, 30.5728] },
  { name: '杭州', districts: ['西湖', '上城', '拱墅', '滨江'], coords: [120.1551, 30.2741] }
];

const dogBreeds = ['金毛', '拉布拉多', '哈士奇', '萨摩耶', '柴犬', '泰迪', '比熊', '边境牧羊犬', '柯基', '博美'];
const catBreeds = ['英短', '美短', '布偶猫', '波斯猫', '暹罗猫', '缅因猫', '斯芬克斯', '挪威森林猫', '孟加拉豹猫', '苏格兰折耳猫'];
const petNames = ['豆豆', '花花', '球球', '布丁', '糖糖', '可乐', '奶茶', '泡泡', '果冻', '糖果', '多多', '乐乐', '欢欢', '贝贝', '晶晶'];
const temperaments = ['温顺', '活泼', '粘人', '独立', '聪明', '忠诚', '友善', '调皮', '安静', '勇敢'];
const descriptions = [
  '非常可爱的宠物，性格温顺，适合家庭饲养。',
  '活泼好动，喜欢和人玩耍，是个小天使。',
  '聪明伶俐，容易训练，是理想的伴侣宠物。',
  '安静乖巧，不吵不闹，适合上班族饲养。',
  '性格独立，偶尔粘人，很有个性的小家伙。',
  '非常友善，对其他宠物也很友好。',
  '忠诚护主，是看家护院的好帮手。',
  '调皮可爱，总能给你带来欢乐。'
];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generatePhone = () => {
  const prefix = ['138', '139', '158', '159', '188', '189', '177', '199'][Math.floor(Math.random() * 8)];
  const suffix = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('');
  return `${prefix}${suffix}`;
};

const generateEmail = (username: string, index: number) => `${username}${index}@pethome.com`;

async function seedPets() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pethome');
    console.log('MongoDB 连接成功');

    // 清空现有数据
    await User.deleteMany({});
    await Pet.deleteMany({});
    await Adoption.deleteMany({});
    console.log('已清空现有数据');

    const users: any[] = [];
    const pets: any[] = [];
    const adoptions: any[] = [];

    // 创建 10 个示例用户
    console.log('\n正在创建示例用户...');
    for (let i = 1; i <= 10; i++) {
      const city = getRandomElement(cities);
      const district = getRandomElement(city.districts);
      const username = `用户${i}`;
      
      const user = new User({
        username: username,
        email: generateEmail(username, i),
        password: '123456', // 简单密码用于测试
        phone: generatePhone(),
        avatar: `https://picsum.photos/seed/user${i}/100/100`,
        realName: `真实姓名${i}`,
        idCard: `${20240000 + i}0000${String(i).padStart(4, '0')}`,
        realNameVerified: true,
        realNameVerifiedAt: new Date(),
        role: 'user',
        gender: i % 2 === 0 ? 'female' : 'male',
        address: `${city.name}${district}${['路', '街', '大道'][Math.floor(Math.random() * 3)]}${Math.floor(Math.random() * 999) + 1}号`,
        location: {
          type: 'Point',
          coordinates: [
            city.coords[0] + (Math.random() - 0.5) * 0.1,
            city.coords[1] + (Math.random() - 0.5) * 0.1
          ]
        },
        bio: '爱宠人士，希望能找到有缘的毛孩子',
        petCount: 0,
        pets: [],
        following: [],
        followers: [],
        friendRequests: [],
        friends: [],
        messages: [],
        isActive: true
      });

      await user.save();
      users.push(user);
      console.log(`  创建用户：${username}`);
    }

    // 为前 5 个用户创建可领养的宠物
    console.log('\n正在创建可领养的宠物...');
    let petIndex = 0;
    for (let i = 0; i < 5; i++) {
      const user = users[i];
      const species = i % 2 === 0 ? 'dog' : 'cat';
      const breeds = species === 'dog' ? dogBreeds : catBreeds;
      const breed = getRandomElement(breeds);
      const city = getRandomElement(cities);
      
      const pet = new Pet({
        name: `${getRandomElement(petNames)}${petIndex + 1}`,
        species: species,
        breed: breed,
        gender: i % 2 === 0 ? 'male' : 'female',
        age: Math.floor(Math.random() * 5) + 1,
        ageUnit: 'year',
        weight: Number((Math.random() * 20 + 2).toFixed(1)),
        color: ['黑色', '白色', '棕色', '花色', '灰色'][Math.floor(Math.random() * 5)],
        sterilized: Math.random() > 0.3,
        vaccinated: true,
        microchipped: Math.random() > 0.5,
        images: [
          `https://picsum.photos/seed/pet${petIndex + 1}/400/300`,
          `https://picsum.photos/seed/pet${petIndex + 1}a/400/300`
        ],
        description: getRandomElement(descriptions),
        healthStatus: '健康',
        temperament: temperaments.sort(() => Math.random() - 0.5).slice(0, 3),
        ownerId: user._id,
        ownerType: 'user',
        isLost: false,
        isAdoptable: true,
        location: {
          type: 'Point',
          coordinates: [
            city.coords[0] + (Math.random() - 0.5) * 0.1,
            city.coords[1] + (Math.random() - 0.5) * 0.1
          ],
          address: `${city.name}${getRandomElement(city.districts)}${['路', '街', '大道'][Math.floor(Math.random() * 3)]}${Math.floor(Math.random() * 999) + 1}号`
        },
        status: 'active'
      });

      await pet.save();
      pets.push(pet);
      
      // 更新用户的宠物列表
      user.pets.push(pet._id);
      user.petCount = user.pets.length;
      await user.save();
      
      console.log(`  创建宠物：${pet.name} (${breed})`);
      petIndex++;
    }

    // 创建领养申请记录
    console.log('\n正在创建领养申请...');
    for (let i = 0; i < 3; i++) {
      if (pets[i] && users[i + 5]) {
        const city = getRandomElement(cities);
        const district = getRandomElement(city.districts);
        const adoption = new Adoption({
          petId: pets[i]._id,
          applicantId: users[i + 5]._id,
          applicantName: users[i + 5].username,
          applicantPhone: users[i + 5].phone,
          applicantEmail: users[i + 5].email,
          applicantAddress: `${city.name}${district}${['路', '街', '大道'][Math.floor(Math.random() * 3)]}${Math.floor(Math.random() * 999) + 1}号`,
          livingSituation: 'own-house',
          familySupport: i % 2 === 0,
          otherPets: i % 2 === 0,
          experience: '饲养过金毛和泰迪，有 5 年养宠经验。',
          reason: '非常喜欢这只宠物，有稳定的住所和收入，希望能给它一个温暖的家。',
          status: 'pending'
        });
        
        await adoption.save();
        adoptions.push(adoption);
        console.log(`  创建领养申请：${users[i + 5].username} 申请领养 ${pets[i].name}`);
      }
    }

    console.log(`\n成功创建 ${users.length} 个用户`);
    console.log(`成功创建 ${pets.length} 只可领养的宠物`);
    console.log(`成功创建 ${adoptions.length} 个领养申请`);

    // 统计信息
    const petStats = await Pet.aggregate([
      { $group: { _id: '$species', count: { $sum: 1 } } }
    ]);

    console.log('\n宠物统计:');
    petStats.forEach((s: any) => {
      const speciesName = s._id === 'dog' ? '狗狗' : s._id === 'cat' ? '猫咪' : '其他';
      console.log(`  ${speciesName}: ${s.count}只`);
    });

    process.exit(0);
  } catch (error) {
    console.error('种子数据创建失败:', error);
    process.exit(1);
  }
}

seedPets();
