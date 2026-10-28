import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Shop from '../src/models/Shop.model';

dotenv.config();

// 全国主要城市数据
const cities = [
  { name: '北京', districts: ['朝阳', '海淀', '丰台', '石景山', '通州', '大兴'], coords: [116.4074, 39.9042] },
  { name: '上海', districts: ['浦东', '黄浦', '徐汇', '长宁', '静安', '普陀'], coords: [121.4737, 31.2304] },
  { name: '广州', districts: ['天河', '越秀', '海珠', '荔湾', '白云', '黄埔'], coords: [113.2644, 23.1291] },
  { name: '深圳', districts: ['南山', '福田', '罗湖', '宝安', '龙岗', '龙华'], coords: [114.0579, 22.5431] },
  { name: '成都', districts: ['锦江', '青羊', '金牛', '武侯', '成华', '高新'], coords: [104.0665, 30.5728] },
  { name: '杭州', districts: ['西湖', '上城', '拱墅', '滨江', '余杭', '萧山'], coords: [120.1551, 30.2741] },
  { name: '重庆', districts: ['渝中', '江北', '沙坪坝', '九龙坡', '南岸', '渝北'], coords: [106.5516, 29.5630] },
  { name: '武汉', districts: ['武昌', '汉口', '汉阳', '洪山', '江汉', '青山'], coords: [114.3054, 30.5931] },
  { name: '西安', districts: ['雁塔', '新城', '碑林', '莲湖', '未央', '长安'], coords: [108.9398, 34.3416] },
  { name: '南京', districts: ['鼓楼', '玄武', '秦淮', '建邺', '雨花台', '江宁'], coords: [118.7969, 32.0603] },
  { name: '天津', districts: ['和平', '河东', '河西', '南开', '北辰', '塘沽'], coords: [117.2008, 39.0842] },
  { name: '苏州', districts: ['姑苏', '工业园', '新区', '吴中', '相城', '吴江'], coords: [120.5853, 31.2989] },
  { name: '长沙', districts: ['岳麓', '芙蓉', '天心', '开福', '雨花', '望城'], coords: [112.9388, 28.2282] },
  { name: '郑州', districts: ['金水', '中原', '二七', '管城', '惠济', '郑东'], coords: [113.6254, 34.7466] },
  { name: '青岛', districts: ['市南', '市北', '李沧', '崂山', '城阳', '黄岛'], coords: [120.3826, 36.0671] },
  { name: '大连', districts: ['中山', '西岗', '沙河口', '甘井子', '旅顺', '金州'], coords: [121.6147, 38.9140] },
  { name: '沈阳', districts: ['和平', '沈河', '大东', '皇姑', '铁西', '浑南'], coords: [123.4315, 41.8057] },
  { name: '宁波', districts: ['海曙', '江北', '鄞州', '镇海', '北仑', '奉化'], coords: [121.5440, 29.8683] },
  { name: '厦门', districts: ['思明', '海沧', '湖里', '集美', '同安', '翔安'], coords: [118.0894, 24.4798] },
  { name: '济南', districts: ['历下', '市中', '槐荫', '天桥', '历城', '章丘'], coords: [117.1549, 36.6512] }
];

const shopNames = ['宠爱有家', '萌宠乐园', '宠物之星', '爱宠小屋', '宠物天堂', '萌宠世界', '宠物家园', '爱宠中心', '萌宠工坊', '宠物会所'];
const serviceNames = ['宠物美容', '洗澡 SPA', '宠物寄养', '宠物医疗', '宠物用品', '宠物训练', '宠物摄影', '宠物婚礼', '宠物殡葬', '宠物运输'];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateOpeningHours = () => {
  const hours = [];
  for (let i = 0; i < 7; i++) {
    hours.push({
      dayOfWeek: i,
      open: '09:00',
      close: '21:00'
    });
  }
  return hours;
};

const generateServices = () => {
  const count = 3 + Math.floor(Math.random() * 4);
  const selected = [];
  for (let i = 0; i < count; i++) {
    const serviceName = getRandomElement(serviceNames);
    selected.push({
      name: serviceName,
      description: `专业的${serviceName}服务`,
      price: Math.floor(Math.random() * 200) + 50,
      duration: Math.floor(Math.random() * 60) + 30
    });
  }
  return selected;
};

const generatePhone = () => {
  const areaCodes = ['010', '021', '020', '0755', '028', '0571', '023', '027', '029', '025', '022', '0512', '0731', '0371', '0532', '0411', '024', '0574', '0592', '0531'];
  const areaCode = getRandomElement(areaCodes);
  const localNumber = Math.floor(Math.random() * 8999999 + 1000000);
  return `${areaCode}-${localNumber}`;
};

async function seedShops() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pethome');
    console.log('MongoDB 连接成功');

    // 清空现有数据
    await Shop.deleteMany({});
    console.log('已清空现有宠物店数据');

    const shops: any[] = [];

    // 为每个城市生成 3-5 家宠物店
    for (const city of cities) {
      const shopCount = 3 + Math.floor(Math.random() * 3);

      for (let i = 0; i < shopCount; i++) {
        const district = getRandomElement(city.districts);
        const baseCoord = city.coords;

        // 在坐标附近随机偏移
        const lng = baseCoord[0] + (Math.random() - 0.5) * 0.1;
        const lat = baseCoord[1] + (Math.random() - 0.5) * 0.1;

        const shop = new Shop({
          name: `${getRandomElement(shopNames)}${city.name}${district}${Math.floor(Math.random() * 100) + 1}${i === 0 ? '(总店)' : ''}`,
          description: '专业宠物服务，用心对待每一位毛孩子，提供全方位的宠物护理和美容服务。',
          ownerId: new mongoose.Types.ObjectId(), // 系统生成的虚拟所有者
          licenseNumber: `LICENSE${Date.now()}${Math.floor(Math.random() * 1000)}`,
          licenseVerified: Math.random() > 0.3,
          location: {
            type: 'Point',
            coordinates: [lng, lat],
            address: `${city.name}${district}${getRandomElement(['路', '街', '大道', '巷'])}${Math.floor(Math.random() * 999) + 1}号`,
            city: city.name,
            district: district
          },
          phone: generatePhone(),
          email: `shop${shops.length + 1}@pethome.com`,
          openingHours: generateOpeningHours(),
          services: generateServices(),
          categories: ['美容', '寄养', '医疗', '用品'].sort(() => Math.random() - 0.5).slice(0, 3),
          images: [`https://picsum.photos/seed/shop${shops.length + 1}/400/300`],
          status: 'active',
          rating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
          reviewCount: Math.floor(Math.random() * 500) + 10
        });

        shops.push(shop);
      }
    }

    // 批量插入
    await Shop.insertMany(shops);
    console.log(`成功创建 ${shops.length} 家宠物店`);

    // 统计信息
    const stats = await Shop.aggregate([
      { $group: { _id: '$location.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n各城市宠物店数量:');
    stats.forEach((s: any) => {
      console.log(`  ${s._id}: ${s.count}家`);
    });

    process.exit(0);
  } catch (error) {
    console.error('种子数据创建失败:', error);
    process.exit(1);
  }
}

seedShops();
