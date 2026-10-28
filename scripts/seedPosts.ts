import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Post from '../src/models/Post.model';

dotenv.config();

const userNames = [
  '爱宠达人', '萌宠控', '宠物爱好者', '铲屎官小王', '毛孩子妈妈',
  '宠物小专家', '养宠日记', '萌宠时光', '宠物生活家', '爱宠小天使',
  '猫咪控', '狗狗迷', '宠物达人 123', '萌宠星球', '宠物乐园',
  '养宠新手', '资深铲屎官', '宠物护理师', '动物保护者', '萌宠摄影师'
];

const postTitles = [
  '新手养狗必读攻略', '猫咪绝育经验分享', '如何训练宠物定点大小便',
  '宠物美容 DIY 教程', '狗狗挑食怎么办', '猫咪健康饮食指南',
  '宠物疫苗注意事项', '如何挑选合适的宠物粮', '宠物洗澡频率建议',
  '狗狗社交技巧分享', '猫咪抓沙发怎么办', '宠物出行必备清单',
  '老年宠物护理心得', '宠物皮肤病防治', '如何帮助宠物减肥',
  '新手养猫避坑指南', '狗狗训练小技巧', '猫咪行为解读',
  '宠物用品推荐清单', '如何培养宠物好习惯', '宠物心理疏导方法',
  '宠物寄养注意事项', '狗狗夏季防暑指南', '猫咪冬季保暖技巧',
  '宠物 dental 护理', '如何给宠物剪指甲', '宠物驱虫全攻略',
  '狗狗分离焦虑应对', '猫咪多猫家庭相处', '宠物摄影技巧分享',
  '领养代替购买的意义', '流浪动物救助心得', '宠物保险值得买吗',
  '如何判断宠物健康状况', '宠物旅行经验总结'
];

const postContents = [
  '养宠物是一段美好的旅程，但也需要付出很多时间和精力。今天想和大家分享一些我的养宠心得，希望能帮助到新手朋友们。\n\n首先，选择合适的宠物粮非常重要。不要只看价格，要看成分表，优质蛋白应该排在第一位。其次，定期带宠物去体检，预防胜于治疗。\n\n最后，耐心和爱心是最重要的。每只宠物都有自己的性格，需要我们去理解和适应。希望大家都能和毛孩子幸福相处！',

  '今天带我家猫咪去做绝育手术了，分享一下整个流程和经验。\n\n术前准备：\n1. 提前禁食 8 小时\n2. 准备好舒适的回家环境\n3. 预约好接送时间\n\n术后护理：\n1. 注意保暖\n2. 按时服药\n3. 佩戴伊丽莎白圈防止舔伤口\n4. 观察精神状态\n\n大概一周左右就恢复得很好了，强烈建议给宠物绝育，对健康有好处！',

  '狗狗训练真的是个持久战，分享一下我训练定点大小便的经验。\n\n关键点：\n1. 固定时间带出去（早上起床、饭后、睡前）\n2. 选固定的地点\n3. 做对了及时奖励\n4. 做错了不要打骂，及时纠正\n5. 保持耐心，每只狗狗学习速度不同\n\n我家狗狗大概用了两周就学会了，现在每天都会主动去指定地点。最重要的是要坚持！',

  '宠物美容不一定非要去宠物店，在家也能 DIY！\n\n需要准备：\n- 宠物专用沐浴露\n- 梳子（不同粗细）\n- 吹风机（低温档）\n- 指甲剪\n- 耳部清洁液\n\n步骤：\n1. 先梳毛，去除浮毛和打结\n2. 温水打湿，涂抹沐浴露按摩\n3. 彻底冲洗干净\n4. 用毛巾吸干水分\n5. 低温吹干，边吹边梳\n\n省钱又温馨，还能增进感情哦！',

  '狗狗挑食真的是让很多主人头疼的问题。分享一下我的解决方法：\n\n1. 定时定量喂食，不要 24 小时放粮\n2. 不要给太多零食，会影响正餐食欲\n3. 可以尝试在狗粮里加一点罐头或煮熟的鸡肉\n4. 增加运动量，消耗大了自然饿了\n5. 如果持续挑食，要检查是否有健康问题\n\n坚持了一周，我家狗狗现在吃饭规律多了！',

  '猫咪的健康饮食真的很重要！分享一些我的经验：\n\n✅ 应该做的：\n- 提供充足的清水\n- 选择优质猫粮\n- 定期更换食物种类\n- 注意控制食量\n\n❌ 避免的：\n- 人类食物（尤其是巧克力、洋葱等）\n- 过多的猫零食\n- 长期只吃一种食物\n- 喂食过期食品\n\n我家猫咪现在身体很棒，毛发也很有光泽！',

  '宠物疫苗是预防疾病的重要手段，分享一些注意事项：\n\n💉 核心疫苗：\n- 犬瘟热、细小病毒（狗狗）\n- 猫瘟、猫疱疹（猫咪）\n- 狂犬疫苗（必须）\n\n⏰ 接种时间：\n- 幼宠 6-8 周开始首针\n- 每隔 3-4 周接种一次，共 3 针\n- 成年后每年加强一针\n\n⚠️ 注意事项：\n- 接种前确保宠物健康\n- 接种后观察 30 分钟\n- 一周内不要洗澡\n- 注意保存疫苗记录\n\n预防永远比治疗划算！',

  '挑选宠物粮真的是门学问，分享一下我的选购心得：\n\n📋 看成分表：\n- 第一位应该是明确的肉类（如鸡肉、牛肉）\n- 避免含有"肉类副产品"等模糊成分\n- 谷物不是必须的，有些宠物会过敏\n\n🔍 看营养指标：\n- 蛋白质含量：狗狗≥18%，猫咪≥26%\n- 脂肪含量适中\n- 纤维含量不宜过高\n\n💡 其他建议：\n- 可以先买小包装试吃\n- 观察宠物的排便和毛发情况\n- 不要频繁更换品牌\n\n选对粮，宠物更健康！',

  '狗狗洗澡不要太频繁！分享一些洗澡建议：\n\n🚿 洗澡频率：\n- 短毛狗：每月 1-2 次\n- 长毛狗：每 2-3 周 1 次\n- 特殊情况可适当增加\n\n🌡️ 水温控制：\n- 38-40 度最合适\n- 先用手腕试温\n\n🧴 洗护用品：\n- 必须使用宠物专用沐浴露\n- 人用的会破坏皮肤酸碱平衡\n\n💡 小贴士：\n- 洗澡前先梳毛\n- 注意保护耳朵进水\n- 彻底吹干防止皮肤病\n\n我家狗狗现在洗澡都很配合啦！',

  '带狗狗社交对它们的心理健康很重要，分享一些经验：\n\n🐕 社交时机：\n- 疫苗齐全后再开始\n- 从 3-14 周是黄金期\n- 成年后也要持续社交\n\n🎯 社交方式：\n- 宠物公园\n- 狗狗聚会\n- 训练课程\n- 拜访有宠朋友\n\n⚠️ 注意事项：\n- 初次见面保持距离\n- 观察肢体语言\n- 及时干预不当行为\n- 不要强迫社交\n\n社交好的狗狗更快乐、更自信！'
];

// 使用英文枚举值匹配 Schema
const categories = ['experience', 'advice', 'story', 'question', 'showcase'];

const tags = ['狗狗', '猫咪', '新手', '经验', '护理', '训练', '饮食', '美容', '健康', '领养'];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomElements<T>(arr: T[], min: number, max: number): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateComments(count: number) {
  const comments = [];
  for (let i = 0; i < count; i++) {
    comments.push({
      commentId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      userName: getRandomElement(userNames),
      userAvatar: `https://picsum.photos/seed/comment${i}/100/100`,
      content: '分享得很好，谢谢楼主！',
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    });
  }
  return comments;
}

function generateLikes(count: number) {
  const likes = [];
  for (let i = 0; i < count; i++) {
    likes.push(new mongoose.Types.ObjectId());
  }
  return likes;
}

async function seedPosts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pethome');
    console.log('MongoDB 连接成功');

    // 清空现有数据
    await Post.deleteMany({});
    console.log('已清空现有社区帖子数据');

    const posts: any[] = [];

    // 生成 40 篇帖子
    for (let i = 0; i < 40; i++) {
      const userName = getRandomElement(userNames);
      const postTags = getRandomElements(tags, 2, 4);
      const views = Math.floor(Math.random() * 2000) + 100;

      const post = new Post({
        title: postTitles[i % postTitles.length],
        content: postContents[i % postContents.length],
        authorId: new mongoose.Types.ObjectId(),
        authorName: userName,
        authorAvatar: `https://picsum.photos/seed/user${i + 1}/100/100`,
        category: getRandomElement(categories),
        tags: postTags,
        images: Math.random() > 0.3
          ? [`https://picsum.photos/seed/post${i + 1}/600/400`]
          : [],
        video: Math.random() > 0.9 ? `https://example.com/video${i + 1}.mp4` : undefined,
        likes: generateLikes(Math.floor(Math.random() * 200) + 10),
        views: views,
        viewsCount: views,
        comments: generateComments(Math.floor(Math.random() * 50) + 2),
        commentsCount: Math.floor(Math.random() * 50) + 2,
        isTop: Math.random() > 0.95,
        isFeatured: Math.random() > 0.8,
        status: 'published'
      });

      posts.push(post);
    }

    // 批量插入
    await Post.insertMany(posts);
    console.log(`成功创建 ${posts.length} 篇社区帖子`);

    // 统计信息
    const categoryStats = await Post.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n各分类帖子数量:');
    const categoryNames: Record<string, string> = {
      'experience': '养宠经验',
      'advice': '健康护理',
      'story': '宠物故事',
      'question': '问答交流',
      'showcase': '萌宠展示'
    };
    categoryStats.forEach((s: any) => {
      console.log(`  ${categoryNames[s._id] || s._id}: ${s.count}篇`);
    });

    process.exit(0);
  } catch (error) {
    console.error('种子数据创建失败:', error);
    process.exit(1);
  }
}

seedPosts();
