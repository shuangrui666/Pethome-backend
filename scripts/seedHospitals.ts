import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hospital from '../src/models/Hospital.model';

dotenv.config();

// 全国主要城市数据
const cities = [
  { name: '北京', districts: ['朝阳', '海淀', '丰台', '石景山', '通州', '大兴', '昌平'] },
  { name: '上海', districts: ['浦东', '黄浦', '徐汇', '长宁', '静安', '普陀', '杨浦'] },
  { name: '广州', districts: ['天河', '越秀', '海珠', '荔湾', '白云', '黄埔', '番禺'] },
  { name: '深圳', districts: ['南山', '福田', '罗湖', '宝安', '龙岗', '龙华', '盐田'] },
  { name: '成都', districts: ['锦江', '青羊', '金牛', '武侯', '成华', '高新', '天府'] },
  { name: '杭州', districts: ['西湖', '上城', '拱墅', '滨江', '余杭', '萧山', '临安'] },
  { name: '重庆', districts: ['渝中', '江北', '沙坪坝', '九龙坡', '南岸', '渝北', '巴南'] },
  { name: '武汉', districts: ['武昌', '汉口', '汉阳', '洪山', '江汉', '青山', '江夏'] },
  { name: '西安', districts: ['雁塔', '新城', '碑林', '莲湖', '未央', '长安', '灞桥'] },
  { name: '南京', districts: ['鼓楼', '玄武', '秦淮', '建邺', '雨花台', '江宁', '浦口'] },
  { name: '天津', districts: ['和平', '河东', '河西', '南开', '北辰', '塘沽', '东丽'] },
  { name: '苏州', districts: ['姑苏', '工业园', '新区', '吴中', '相城', '吴江', '昆山'] },
  { name: '长沙', districts: ['岳麓', '芙蓉', '天心', '开福', '雨花', '望城', '浏阳'] },
  { name: '郑州', districts: ['金水', '中原', '二七', '管城', '惠济', '郑东', '航空港'] },
  { name: '青岛', districts: ['市南', '市北', '李沧', '崂山', '城阳', '黄岛', '即墨'] },
  { name: '大连', districts: ['中山', '西岗', '沙河口', '甘井子', '高新', '金州', '旅顺'] },
  { name: '沈阳', districts: ['和平', '沈河', '大东', '皇姑', '铁西', '浑南', '沈北'] },
  { name: '宁波', districts: ['海曙', '江北', '鄞州', '镇海', '北仑', '奉化', '余姚'] },
  { name: '厦门', districts: ['思明', '湖里', '集美', '海沧', '同安', '翔安'] },
  { name: '济南', districts: ['历下', '市中', '槐荫', '天桥', '历城', '高新', '章丘'] }
];

const hospitalNames = [
  '宠爱宠物医院', '萌宠宠物医院', '宠物综合医院', '爱宠宠物医院', '宠物专科医院',
  '宠物医疗中心', '萌宠医疗中心', '宠物健康中心', '爱宠医疗中心', '宠物诊疗中心',
  '宠物动物医院', '萌宠动物医院', '宠物宠物诊所', '爱宠动物医院', '宠物宠物医院',
  '宠爱宠物诊所', '萌宠宠物诊所', '宠物之家医院', '爱宠宠物诊所', '萌宠动物诊所'
];

const services = [
  ['普通诊疗', '宠物手术', '宠物疫苗', '宠物体检', '急诊服务'],
  ['普通诊疗', '宠物手术', '宠物疫苗', '宠物绝育', '牙科治疗'],
  ['普通诊疗', '宠物体检', '宠物疫苗', '影像学检查', '实验室检测'],
  ['普通诊疗', '宠物手术', '急诊服务', '重症监护', '宠物麻醉'],
  ['普通诊疗', '宠物疫苗', '宠物体检', '皮肤病治疗', '内科诊疗'],
  ['普通诊疗', '宠物手术', '宠物绝育', '眼科治疗', '骨科治疗'],
  ['普通诊疗', '宠物疫苗', '宠物体检', '宠物驱虫', '营养咨询'],
  ['普通诊疗', '宠物手术', '急诊服务', '宠物住院', '术后护理']
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

function generateRandomPhone(): string {
  const prefix = ['010', '021', '020', '0755', '028', '0571', '023', '027', '029', '025'][Math.floor(Math.random() * 10)];
  const suffix = Math.floor(1000000 + Math.random() * 9000000);
  return `${prefix}-${suffix}`;
}

function generateRandomAddress(city: string, district: string): string {
  const roads = ['路', '街', '大道', '巷'];
  const roadName = ['中山', '人民', '建设', '和平', '解放', '光明', '幸福', '胜利'][Math.floor(Math.random() * 8)];
  const number = Math.floor(Math.random() * 500) + 1;
  return `${city}${district}${roadName}${roads[Math.floor(Math.random() * roads.length)]}${number}号`;
}

async function seedHospitals() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pethome');
    console.log('MongoDB 连接成功');

    // 清空现有数据
    await Hospital.deleteMany({});
    console.log('已清空现有宠物医院数据');

    const hospitals: any[] = [];

    // 为每个城市生成 4-5 家宠物医院
    for (const city of cities) {
      const hospitalCount = 4 + Math.floor(Math.random() * 2);
      
      for (let i = 0; i < hospitalCount; i++) {
        const district = getRandomElement(city.districts);
        const baseCoord = coordinates[city.name];
        
        // 在坐标附近随机偏移
        const lng = baseCoord[0] + (Math.random() - 0.5) * 0.15;
        const lat = baseCoord[1] + (Math.random() - 0.5) * 0.15;

        const hospital = new Hospital({
          name: `${hospitalNames[Math.floor(Math.random() * hospitalNames.length)]}${Math.floor(Math.random() * 100) + 1}${i === 0 ? '(总院)' : ''}`,
          city: city.name,
          district: district,
          address: generateRandomAddress(city.name, district),
          location: {
            type: 'Point' as const,
            coordinates: [lng, lat]
          },
          phone: generateRandomPhone(),
          email: `hospital${hospitals.length + 1}@pethome.com`,
          services: getRandomElement(services),
          openingHours: '24 小时营业',
          rating: Number((4.0 + Math.random() * 1.0).toFixed(1)),
          reviewCount: Math.floor(Math.random() * 800) + 20,
          description: '专业宠物医疗，24 小时急诊服务',
          images: [`https://picsum.photos/seed/hospital${hospitals.length + 1}/400/300`],
          doctorNames: ['张医生', '李医生', '王医生', '刘医生', '陈医生'].slice(0, 2 + Math.floor(Math.random() * 3)),
          hasEmergency: Math.random() > 0.3,
          isVerified: Math.random() > 0.15,
          isOpen: true,
          distance: 0,
          createdBy: 'system',
          status: 'active'
        });

        hospitals.push(hospital);
      }
    }

    // 批量插入
    await Hospital.insertMany(hospitals);
    console.log(`成功创建 ${hospitals.length} 家宠物医院`);

    // 统计信息
    const stats = await Hospital.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n各城市宠物医院数量:');
    stats.forEach((s: any) => {
      console.log(`  ${s._id}: ${s.count}家`);
    });

    process.exit(0);
  } catch (error) {
    console.error('种子数据创建失败:', error);
    process.exit(1);
  }
}

seedHospitals();
