import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model';
import LostPet from '../models/LostPet.model';

dotenv.config();

// 增强的走失宠物数据 - 模拟真实的走失案例
const lostPetsData = [
  // 北京地区
  {
    petName: '豆豆',
    species: 'dog',
    breed: '泰迪犬',
    gender: 'female' as const,
    age: 3,
    color: '棕色',
    features: '非常粘人，听到"豆豆"这个名字会摇尾巴，脖子上戴着红色项圈',
    images: ['https://picsum.photos/seed/dog1/400/300', 'https://picsum.photos/seed/dog1a/400/300'],
    lostLocation: {
      type: 'Point' as const,
      coordinates: [116.4074, 39.9042],
      address: '北京市朝阳区国贸 CBD 附近',
      city: '北京市',
      district: '朝阳区'
    },
    lostTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    lastSeenTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    lastSeenLocation: '国贸地铁站出口',
    reward: 5000,
    status: 'lost' as const,
    notes: '2024 年 10 月 9 日下午遛弯时不慎走失，非常着急！豆豆胆子小，可能躲在角落。有线索请联系，必有重谢！'
  },
  {
    petName: '咪咪',
    species: 'cat',
    breed: '英国短毛猫',
    gender: 'male' as const,
    age: 2,
    color: '灰色',
    features: '胖乎乎的圆脸，性格温顺，不会抓人，叫声很轻柔',
    images: ['https://picsum.photos/seed/cat1/400/300', 'https://picsum.photos/seed/cat1a/400/300'],
    lostLocation: {
      type: 'Point' as const,
      coordinates: [116.3974, 39.9142],
      address: '北京市海淀区中关村大街附近',
      city: '北京市',
      district: '海淀区'
    },
    lostTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    lastSeenTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    lastSeenLocation: '中关村软件园',
    reward: 3000,
    status: 'lost' as const,
    notes: '从阳台意外溜走，家里还有猫粮和水，应该没走远。猫咪怕生，请不要惊吓它。'
  },
  {
    petName: '旺财',
    species: 'dog',
    breed: '金毛寻回犬',
    gender: 'male' as const,
    age: 5,
    color: '金色',
    features: '温顺友善，喜欢和人玩耍，体型较大，毛色金黄发亮',
    images: ['https://picsum.photos/seed/dog2/400/300', 'https://picsum.photos/seed/dog2a/400/300'],
    lostLocation: {
      type: 'Point' as const,
      coordinates: [116.4174, 39.9242],
      address: '北京市朝阳区三里屯太古里附近',
      city: '北京市',
      district: '朝阳区'
    },
    lostTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    lastSeenTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    lastSeenLocation: '三里屯酒吧街',
    reward: 8000,
    status: 'lost' as const,
    notes: '晚上散步时挣脱牵引绳走失，金毛很听话，叫名字会有反应。看到请帮忙留住，重谢！'
  },
  // 上海地区
  {
    petName: '雪球',
    species: 'cat',
    breed: '波斯猫',
    gender: 'female' as const,
    age: 4,
    color: '白色',
    features: '长毛白色，眼睛一蓝一黄，性格高冷，不爱理人',
    images: ['https://picsum.photos/seed/cat2/400/300', 'https://picsum.photos/seed/cat2a/400/300'],
    lostLocation: {
      type: 'Point' as const,
      coordinates: [121.4737, 31.2304],
      address: '上海市黄浦区南京东路附近',
      city: '上海市',
      district: '黄浦区'
    },
    lostTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    lastSeenTime: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    lastSeenLocation: '外滩观光隧道入口',
    reward: 10000,
    status: 'lost' as const,
    notes: '纯种波斯猫，价值较高。走失时戴着蓝色项圈，有铃铛。有线索请速联系！'
  },
  {
    petName: '可乐',
    species: 'dog',
    breed: '边境牧羊犬',
    gender: 'male' as const,
    age: 2,
    color: '黑白相间',
    features: '非常聪明，会很多指令，黑白花色，尾巴尖是白色的',
    images: ['https://picsum.photos/seed/dog3/400/300', 'https://picsum.photos/seed/dog3a/400/300'],
    lostLocation: {
      type: 'Point' as const,
      coordinates: [121.4837, 31.2404],
      address: '上海市浦东新区陆家嘴金融中心',
      city: '上海市',
      district: '浦东新区'
    },
    lostTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    lastSeenTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    lastSeenLocation: '东方明珠塔下',
    reward: 6000,
    status: 'lost' as const,
    notes: '边牧很聪明，可能会自己找回家。它记得"可乐"这个名字，叫它会回头。'
  },
  {
    petName: '小黑',
    species: 'cat',
    breed: '中华田园猫',
    gender: 'male' as const,
    age: 1,
    color: '黑色',
    features: '全黑毛色，绿眼睛，非常活泼好动，喜欢爬高',
    images: ['https://picsum.photos/seed/cat3/400/300', 'https://picsum.photos/seed/cat3a/400/300'],
    lostLocation: {
      type: 'Point' as const,
      coordinates: [121.4637, 31.2204],
      address: '上海市静安区南京西路附近',
      city: '上海市',
      district: '静安区'
    },
    lostTime: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    lastSeenTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    lastSeenLocation: '静安寺地铁站',
    reward: 2000,
    status: 'lost' as const,
    notes: '小猫刚满一岁，没有经验，可能躲在某个角落。晚上可能会叫。'
  },
  // 广州地区
  {
    petName: '布丁',
    species: 'dog',
    breed: '比熊犬',
    gender: 'female' as const,
    age: 2,
    color: '白色',
    features: '圆滚滚的像棉花糖，性格甜美，喜欢撒娇',
    images: ['https://picsum.photos/seed/dog4/400/300', 'https://picsum.photos/seed/dog4a/400/300'],
    lostLocation: {
      type: 'Point' as const,
      coordinates: [113.2644, 23.1291],
      address: '广州市天河区天河城附近',
      city: '广州市',
      district: '天河区'
    },
    lostTime: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    lastSeenTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    lastSeenLocation: '天河城购物中心',
    reward: 4000,
    status: 'lost' as const,
    notes: '小型犬，胆子小，看到陌生人会躲。走失时穿着粉色小衣服。'
  },
  {
    petName: '花花',
    species: 'cat',
    breed: '狸花猫',
    gender: 'female' as const,
    age: 3,
    color: '虎斑纹',
    features: '典型的狸花猫花纹，身体健壮，捕鼠能手',
    images: ['https://picsum.photos/seed/cat4/400/300', 'https://picsum.photos/seed/cat4a/400/300'],
    lostLocation: {
      type: 'Point' as const,
      coordinates: [113.2744, 23.1391],
      address: '广州市越秀区北京路附近',
      city: '广州市',
      district: '越秀区'
    },
    lostTime: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    lastSeenTime: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    lastSeenLocation: '北京路步行街',
    reward: 2500,
    status: 'lost' as const,
    notes: '狸花猫很独立，可能自己在附近活动。它喜欢吃鱼，可以用食物引诱。'
  },
  // 深圳地区
  {
    petName: '阿黄',
    species: 'dog',
    breed: '中华田园犬',
    gender: 'male' as const,
    age: 4,
    color: '黄色',
    features: '忠诚老实，耳朵一立一趴，尾巴卷曲',
    images: ['https://picsum.photos/seed/dog5/400/300', 'https://picsum.photos/seed/dog5a/400/300'],
    lostLocation: {
      type: 'Point' as const,
      coordinates: [114.0579, 22.5431],
      address: '深圳市南山区科技园附近',
      city: '深圳市',
      district: '南山区'
    },
    lostTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    lastSeenTime: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    lastSeenLocation: '腾讯大厦附近',
    reward: 3500,
    status: 'lost' as const,
    notes: '土狗很忠诚，不会随便跟陌生人走。可能还在附近徘徊。'
  },
  {
    petName: '娜娜',
    species: 'cat',
    breed: '布偶猫',
    gender: 'female' as const,
    age: 2,
    color: '重点色',
    features: '蓝眼睛，长毛，性格像小狗一样粘人',
    images: ['https://picsum.photos/seed/cat5/400/300', 'https://picsum.photos/seed/cat5a/400/300'],
    lostLocation: {
      type: 'Point' as const,
      coordinates: [114.0679, 22.5531],
      address: '深圳市福田区会展中心附近',
      city: '深圳市',
      district: '福田区'
    },
    lostTime: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
    lastSeenTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    lastSeenLocation: '会展中心地铁站',
    reward: 12000,
    status: 'lost' as const,
    notes: '纯种布偶猫，非常漂亮。走失时戴着粉色项圈，有名牌。看到请立刻联系！'
  },
  // 更多北京地区
  {
    petName: '球球',
    species: 'dog',
    breed: '柯基犬',
    gender: 'male' as const,
    age: 3,
    color: '黄白相间',
    features: '小短腿大屁股，性格活泼，跑得快',
    images: ['https://picsum.photos/seed/dog6/400/300', 'https://picsum.photos/seed/dog6a/400/300'],
    lostLocation: {
      type: 'Point' as const,
      coordinates: [116.3874, 39.9342],
      address: '北京市朝阳区望京 SOHO 附近',
      city: '北京市',
      district: '朝阳区'
    },
    lostTime: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    lastSeenTime: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
    lastSeenLocation: '望京小街',
    reward: 5500,
    status: 'lost' as const,
    notes: '柯基腿短但跑得快，可能已经跑远。它很贪吃，可以用零食引诱。'
  },
  {
    petName: '小白',
    species: 'cat',
    breed: '挪威森林猫',
    gender: 'male' as const,
    age: 5,
    color: '白色',
    features: '长毛大型猫，威武帅气，叫声洪亮',
    images: ['https://picsum.photos/seed/cat6/400/300', 'https://picsum.photos/seed/cat6a/400/300'],
    lostLocation: {
      type: 'Point' as const,
      coordinates: [116.3774, 39.9442],
      address: '北京市海淀区五道口附近',
      city: '北京市',
      district: '海淀区'
    },
    lostTime: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
    lastSeenTime: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    lastSeenLocation: '清华大学东门',
    reward: 7000,
    status: 'lost' as const,
    notes: '大型猫，体型较大容易辨认。性格独立，可能自己在附近找地方住。'
  },
  // 成都地区
  {
    petName: '巴豆',
    species: 'dog',
    breed: '柴犬',
    gender: 'male' as const,
    age: 2,
    color: '赤色',
    features: '典型的柴犬表情，爱笑，性格倔强',
    images: ['https://picsum.photos/seed/dog7/400/300', 'https://picsum.photos/seed/dog7a/400/300'],
    lostLocation: {
      type: 'Point' as const,
      coordinates: [104.0668, 30.5728],
      address: '成都市武侯区春熙路附近',
      city: '成都市',
      district: '武侯区'
    },
    lostTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    lastSeenTime: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
    lastSeenLocation: '太古里',
    reward: 6000,
    status: 'lost' as const,
    notes: '柴犬很固执，可能不愿意跟人走。看到请拍照联系我，不要强行抓捕。'
  },
  {
    petName: '茉莉',
    species: 'cat',
    breed: '孟加拉豹猫',
    gender: 'female' as const,
    age: 3,
    color: '豹纹',
    features: '稀有豹纹花纹，体型优美，像小豹子一样',
    images: ['https://picsum.photos/seed/cat7/400/300', 'https://picsum.photos/seed/cat7a/400/300'],
    lostLocation: {
      type: 'Point' as const,
      coordinates: [104.0768, 30.5828],
      address: '成都市锦江区IFS 附近',
      city: '成都市',
      district: '锦江区'
    },
    lostTime: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    lastSeenTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    lastSeenLocation: '熊猫爬墙拍照点',
    reward: 15000,
    status: 'lost' as const,
    notes: '稀有品种，非常珍贵。走失时戴着金色项圈。有线索请立刻联系，重谢！'
  },
  // 杭州地区
  {
    petName: '多多',
    species: 'dog',
    breed: '萨摩耶',
    gender: 'male' as const,
    age: 4,
    color: '白色',
    features: '微笑天使，毛茸茸的大尾巴，性格温和',
    images: ['https://picsum.photos/seed/dog8/400/300', 'https://picsum.photos/seed/dog8a/400/300'],
    lostLocation: {
      type: 'Point' as const,
      coordinates: [120.1551, 30.2741],
      address: '杭州市西湖区西湖边',
      city: '杭州市',
      district: '西湖区'
    },
    lostTime: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
    lastSeenTime: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    lastSeenLocation: '断桥残雪',
    reward: 7000,
    status: 'lost' as const,
    notes: '萨摩耶很友善，可能和游客走了。白色毛发很容易辨认。'
  },
  {
    petName: '团团',
    species: 'cat',
    breed: '苏格兰折耳猫',
    gender: 'female' as const,
    age: 2,
    color: '灰白相间',
    features: '耳朵向前折叠，圆脸大眼，性格温顺',
    images: ['https://picsum.photos/seed/cat8/400/300', 'https://picsum.photos/seed/cat8a/400/300'],
    lostLocation: {
      type: 'Point' as const,
      coordinates: [120.1651, 30.2841],
      address: '杭州市上城区湖滨银泰附近',
      city: '杭州市',
      district: '上城区'
    },
    lostTime: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000),
    lastSeenTime: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
    lastSeenLocation: '湖滨步行街',
    reward: 5000,
    status: 'lost' as const,
    notes: '折耳猫很特别，容易辨认。性格温顺，不会反抗。'
  },
  // 西安地区
  {
    petName: '长安',
    species: 'dog',
    breed: '藏獒',
    gender: 'male' as const,
    age: 6,
    color: '黑色',
    features: '体型巨大，威武霸气，忠诚护主',
    images: ['https://picsum.photos/seed/dog9/400/300', 'https://picsum.photos/seed/dog9a/400/300'],
    lostLocation: {
      type: 'Point' as const,
      coordinates: [108.9398, 34.3416],
      address: '西安市碑林区钟楼附近',
      city: '西安市',
      district: '碑林区'
    },
    lostTime: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    lastSeenTime: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000),
    lastSeenLocation: '回民街',
    reward: 20000,
    status: 'lost' as const,
    notes: '大型犬，可能有威慑力。但很忠诚，叫名字"长安"会有反应。请勿惊吓。'
  },
  {
    petName: '长安猫',
    species: 'cat',
    breed: '临清狮子猫',
    gender: 'female' as const,
    age: 3,
    color: '白色',
    features: '中国传统名猫，长毛狮子尾，一蓝一绿异瞳',
    images: ['https://picsum.photos/seed/cat9/400/300', 'https://picsum.photos/seed/cat9a/400/300'],
    lostLocation: {
      type: 'Point' as const,
      coordinates: [108.9498, 34.3516],
      address: '西安市雁塔区大雁塔附近',
      city: '西安市',
      district: '雁塔区'
    },
    lostTime: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
    lastSeenTime: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    lastSeenLocation: '大慈恩寺',
    reward: 8000,
    status: 'lost' as const,
    notes: '中国传统名猫，异瞳特征明显。性格温顺，可能躲在寺庙附近。'
  },
  // 重庆地区
  {
    petName: '火锅',
    species: 'dog',
    breed: '哈士奇',
    gender: 'male' as const,
    age: 3,
    color: '黑白灰',
    features: '二哈本性，爱拆家，表情丰富，爱嚎叫',
    images: ['https://picsum.photos/seed/dog10/400/300', 'https://picsum.photos/seed/dog10a/400/300'],
    lostLocation: {
      type: 'Point' as const,
      coordinates: [106.5516, 29.5630],
      address: '重庆市渝中区解放碑附近',
      city: '重庆市',
      district: '渝中区'
    },
    lostTime: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    lastSeenTime: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
    lastSeenLocation: '洪崖洞',
    reward: 4500,
    status: 'lost' as const,
    notes: '哈士奇很皮，可能到处乱跑。晚上会嚎叫，容易发现。'
  },
  {
    petName: '山城',
    species: 'cat',
    breed: '四川简州猫',
    gender: 'male' as const,
    age: 4,
    color: '灰色',
    features: '地方品种，耳尖有簇毛，捕鼠能手',
    images: ['https://picsum.photos/seed/cat10/400/300', 'https://picsum.photos/seed/cat10a/400/300'],
    lostLocation: {
      type: 'Point' as const,
      coordinates: [106.5616, 29.5730],
      address: '重庆市江北区观音桥附近',
      city: '重庆市',
      district: '江北区'
    },
    lostTime: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    lastSeenTime: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    lastSeenLocation: '观音桥步行街',
    reward: 3000,
    status: 'lost' as const,
    notes: '地方特色品种，耳尖有簇毛容易辨认。很独立，可能自己在附近活动。'
  }
];

async function seedLostPetsEnhanced() {
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

    // 准备数据
    const lostPets = lostPetsData.map((data) => ({
      ...data,
      reporterId: user._id,
      contactPhone: user.phone || '13800138000',
      contactWechat: user.username || 'lostpet2024',
      matches: [],
      reports: []
    }));

    // 插入数据
    const inserted = await LostPet.insertMany(lostPets);
    console.log(`\n✅ 成功创建 ${inserted.length} 条走失宠物记录\n`);

    // 按城市统计
    const cityStats: Record<string, number> = {};
    inserted.forEach((lp) => {
      const city = lp.lostLocation.city;
      cityStats[city] = (cityStats[city] || 0) + 1;
    });

    console.log('📊 数据分布：');
    Object.entries(cityStats).forEach(([city, count]) => {
      console.log(`   ${city}: ${count} 条`);
    });

    // 显示部分创建的记录
    console.log('\n📝 部分走失宠物记录：');
    for (let i = 0; i < Math.min(5, inserted.length); i++) {
      const lp = inserted[i];
      console.log(`\n${i + 1}. ${lp.petName} (${lp.breed})`);
      console.log(`   地点：${lp.lostLocation.address}`);
      console.log(`   时间：${lp.lostTime.toLocaleDateString()}`);
      console.log(`   悬赏：${lp.reward}元`);
    }

    console.log('\n✅ 数据填充完成！');
    console.log(`📍 访问走失寻回页面：http://localhost:3000/lost-found`);
    console.log(`📍 查看示例详情：http://localhost:3000/lost-found/${inserted[0]._id}`);

  } catch (error) {
    console.error('❌ 数据填充失败:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 数据库连接已关闭');
    process.exit(0);
  }
}

seedLostPetsEnhanced();
