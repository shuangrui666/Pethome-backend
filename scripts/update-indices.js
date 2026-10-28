require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

async function updateIndices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB 连接成功');

    const collection = mongoose.connection.collection('users');

    // 删除所有索引（除了 _id）
    console.log('删除现有索引...');
    try {
      await collection.dropIndexes();
    } catch (err) {
      console.log('删除索引时:', err.message);
    }
    console.log('索引已删除');

    // 重新创建索引
    console.log('创建新索引...');
    await collection.createIndex({ email: 1 }, { sparse: true, unique: true });
    await collection.createIndex(
      { phone: 1 },
      {
        unique: true,
        partialFilterExpression: { phone: { $exists: true, $type: 'string' } }
      }
    );
    await collection.createIndex({ username: 1 });
    await collection.createIndex({ location: '2dsphere' });
    console.log('新索引已创建');

    // 显示当前索引
    const indices = await collection.indexInformation();
    console.log('当前索引:', JSON.stringify(indices, null, 2));

    console.log('索引更新完成');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('索引更新失败:', error);
    process.exit(1);
  }
}

updateIndices();
