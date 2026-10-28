import mongoose from 'mongoose';
import dotenv from 'dotenv';
import RescueBase from '../src/models/RescueBase.model';

dotenv.config();

// 全国主要城市数据
const cities = [
  { name: '北京', districts: ['朝阳', '海淀', '丰台', '通州', '大兴', '昌平'] },
  { name: '上海', districts: ['浦东', '黄浦', '徐汇', '长宁', '松江', '嘉定'] },
  { name: '广州', districts: ['天河', '越秀', '海珠', '白云', '黄埔', '番禺'] },
  { name: '深圳', districts: ['南山', '福田', '罗湖', '宝安', '龙岗', '龙华'] },
  { name: '成都', districts: ['锦江', '青羊', '金牛', '武侯', '成华', '高新'] },
  { name: '杭州', districts: ['西湖', '上城', '拱墅', '滨江', '余杭', '萧山'] },
  { name: '重庆', districts: ['渝中', '江北', '沙坪坝', '九龙坡', '南岸', '渝北'] },
  { name: '武汉', districts: ['武昌', '汉口', '汉阳', '洪山', '江汉', '青山'] },
  { name: '西安', districts: ['雁塔', '新城', '碑林', '莲湖', '未央', '长安'] },
  { name: '南京', districts: ['鼓楼', '玄武', '秦淮', '建邺', '雨花台', '江宁'] },
  { name: '天津', districts: ['和平', '河东', '河西', '南开', '北辰', '塘沽'] },
  { name: '苏州', districts: ['姑苏', '工业园', '新区', '吴中', '相城', '吴江'] },
  { name: '长沙', districts: ['岳麓', '芙蓉', '天心', '开福', '雨花', '望城'] },
  { name: '郑州', districts: ['金水', '中原', '二七', '管城', '惠济', '郑东'] },
  { name: '青岛', districts: ['市南', '市北', '李沧', '崂山', '城阳', '黄岛'] },
  { name: '大连', districts: ['中山', '西岗', '沙河口', '甘井子', '高新', '金州'] },
  { name: '沈阳', districts: ['和平', '沈河', '大东', '皇姑', '铁西', '浑南'] },
  { name: '宁波', districts: ['海曙', '江北', '鄞州', '镇海', '北仑', '奉化'] },
  { name: '厦门', districts: ['思明', '湖里', '集美', '海沧', '同安', '翔安'] },
  { name: '济南', districts: ['历下', '市中', '槐荫', '天桥', '历城', '高新'] }
];

const baseNames = [
  '爱心流浪动物救助基地', '希望宠物救助站', '温暖之家救助基地', '守护天使救助站',
  '流浪毛孩救助中心', '宠物庇护所', '爱心宠物家园', '流浪动物保护基地',
  '萌宠救助中心', '宠物救援站', '流浪宝贝救助基地', '动物福利救助站',
  '宠物爱心驿站', '流浪猫狗救助中心', '小动物保护基地', '宠物救援中心',
  '流浪动物收容所', '宠物救助之家', '毛孩子庇护所', '爱心动物救助站'
];

const coordinates: Record<string, [number, number]> = {
  '北京': [116.4074, 39.9042],
  '上海': [121.4737, 31.2304],
  '广州': [113.2644, 23.1291],
  '深圳': [114.0579, 22.5431],
  '成都': [104.0665, 30.5728],
  '杭州': [120.1551, 30.2741],
  '重庆': [106.5516, 29.5630],
  '武汉': [114.3054, 30.5931],
  '西安': [108.9398, 34.3416],
  '南京': [118.7969, 32.0603],
  '天津': [117.2009, 39.0842],
  '苏州': [120.5853, 31.2989],
  '长沙': [112.9388, 28.2282],
  '郑州': [113.6253, 34.7466],
  '青岛': [120.3826, 36.0671],
  '大连': [121.6147, 38.9140],
  '沈阳': [123.4315, 41.8057],
  '宁波': [121.5440, 29.8683],
  '厦门': [118.0894, 24.4798],
  '济南': [117.1573, 36.6512]
};

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomAddress(city: string, district: string): string {
  const roads = ['路', '街', '大道', '巷', '小区'];
  const roadName = ['中山', '人民', '建设', '和平', '解放', '光明', '幸福', '胜利'][Math.floor(Math.random() * 8)];
  const number = Math.floor(Math.random() * 200) + 1;
  return `${city}${district}${roadName}${roads[Math.floor(Math.random() * roads.length)]}${number}号`;
}

function generateDescription(): string {
  const descriptions = [
    '致力于救助流浪动物，提供临时住所和医疗照顾，帮助它们找到温暖的家',
    '专注流浪猫狗救助，提供绝育、疫苗接种和领养服务',
    '公益救助基地，依靠社会捐赠运营，急需各界支持',
    '为流浪动物提供庇护，开展领养推广和动物保护教育',
    '专业救助团队，24 小时接收流浪动物救援请求',
    '非营利组织，致力于改善流浪动物生存状况',
    '提供临时寄养、医疗救助和领养对接服务',
    '倡导科学养宠，推动流浪动物绝育和领养代替购买'
  ];
  return getRandomElement(descriptions);
}

async function seedRescueBases() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pethome');
    console.log('MongoDB 连接成功');

    // 清空现有数据
    await RescueBase.deleteMany({});
    console.log('已清空现有流浪救助基地数据');

    const bases: any[] = [];

    // 为每个城市生成 1-2 家救助基地
    for (const city of cities) {
      const baseCount = 1 + Math.floor(Math.random() * 2);
      
      for (let i = 0; i < baseCount; i++) {
        const district = getRandomElement(city.districts);
        const baseCoord = coordinates[city.name];
        
        // 在坐标附近随机偏移
        const lng = baseCoord[0] + (Math.random() - 0.5) * 0.2;
        const lat = baseCoord[1] + (Math.random() - 0.5) * 0.2;

        const currentAnimals = Math.floor(Math.random() * 30) + 5;
        const maxCapacity = currentAnimals + Math.floor(Math.random() * 20) + 10;

        const base = new RescueBase({
          name: `${baseNames[Math.floor(Math.random() * baseNames.length)]}${city.name}${Math.floor(Math.random() * 100) + 1}`,
          city: city.name,
          district: district,
          address: generateRandomAddress(city.name, district),
          location: {
            type: 'Point' as const,
            coordinates: [lng, lat]
          },
          phone: `0${Math.floor(10 + Math.random() * 90)}-${Math.floor(1000000 + Math.random() * 9000000)}`,
          email: `base${bases.length + 1}@rescue.com`,
          description: generateDescription(),
          currentAnimals: currentAnimals,
          maxCapacity: maxCapacity,
          availableSpace: maxCapacity - currentAnimals,
          needsDonation: Math.random() > 0.3,
          donationGoal: Math.floor(Math.random() * 50000) + 10000,
          donationRaised: Math.floor(Math.random() * 30000) + 5000,
          images: [`https://picsum.photos/seed/rescue${bases.length + 1}/400/300`],
          services: ['临时收容', '医疗救助', '领养对接', '绝育服务'],
          operatingHours: '09:00-18:00',
          isVerified: Math.random() > 0.2,
          isOpen: true,
          status: 'active',
          createdBy: 'system'
        });

        bases.push(base);
      }
    }

    // 批量插入
    await RescueBase.insertMany(bases);
    console.log(`成功创建 ${bases.length} 个流浪救助基地`);

    // 统计信息
    const stats = await RescueBase.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n各城市救助基地数量:');
    stats.forEach((s: any) => {
      console.log(`  ${s._id}: ${s.count}个`);
    });

    // 总统计
    const totalStats = await RescueBase.aggregate([
      { $group: {
        _id: null,
        totalAnimals: { $sum: '$currentAnimals' },
        totalCapacity: { $sum: '$maxCapacity' },
        totalDonationGoal: { $sum: '$donationGoal' },
        totalDonationRaised: { $sum: '$donationRaised' }
      }}
    ]);

    if (totalStats.length > 0) {
      const ts = totalStats[0];
      console.log('\n总体统计:');
      console.log(`  收容动物总数：${ts.totalAnimals}只`);
      console.log(`  总收容能力：${ts.totalCapacity}只`);
      console.log(`  总筹款目标：¥${Math.round(ts.totalDonationGoal).toLocaleString()}`);
      console.log(`  已筹款：¥${Math.round(ts.totalDonationRaised).toLocaleString()}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('种子数据创建失败:', error);
    process.exit(1);
  }
}

seedRescueBases();
