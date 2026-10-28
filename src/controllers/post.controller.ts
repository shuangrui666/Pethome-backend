import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Post from '../models/Post.model';
import User from '../models/User.model';
import { AuthRequest } from '../middleware/auth.middleware';

// 创建帖子
export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, category, tags } = req.body;

    const images = req.files ? (req.files as Express.Multer.File[]).map(file => `/uploads/${file.filename}`) : [];

    const post = new Post({
      authorId: req.user!.userId,
      title,
      content,
      category,
      tags,
      images
    });

    await post.save();

    res.status(201).json({
      success: true,
      message: '帖子发布成功',
      data: post
    });
  } catch (error: any) {
    console.error('创建帖子错误:', error);
    res.status(500).json({
      success: false,
      message: '发布帖子失败',
      error: error.message
    });
  }
};

// 获取帖子列表
export const getPosts = async (req: Request, res: Response) => {
  try {
    const { category, tags, sort = 'latest', page = 1, limit = 20 } = req.query;

    const query: any = {};
    
    if (category) query.category = category;
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }

    let sortOption: any = { createdAt: -1 };
    if (sort === 'hot') sortOption = { likes: -1, createdAt: -1 };
    if (sort === 'discussed') sortOption = { commentsCount: -1, createdAt: -1 };

    const posts = await Post.find(query)
      .populate('authorId', 'username avatar')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort(sortOption);

    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      data: posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    console.error('获取帖子列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取帖子列表失败',
      error: error.message
    });
  }
};

// 获取帖子列表
export const getPostList = async (req: Request, res: Response) => {
  try {
    const { category, tag, page = 1, limit = 20 } = req.query;

    const query: any = {};
    if (category) query.category = category;
    if (tag) query.tags = tag;

    const posts = await Post.find(query)
      .populate('authorId', 'username avatar bio')
      .populate('comments.authorId', 'username avatar')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      data: posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    console.error('获取帖子列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取帖子列表失败',
      error: error.message
    });
  }
};

// 获取帖子详情
export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id)
      .populate('authorId', 'username avatar bio')
      .populate('comments.authorId', 'username avatar');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在'
      });
    }

    // 增加阅读数
    post.viewsCount += 1;
    await post.save();

    res.json({
      success: true,
      data: post
    });
  } catch (error: any) {
    console.error('获取帖子详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取帖子详情失败',
      error: error.message
    });
  }
};

// 更新帖子
export const updatePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags } = req.body;

    const post = await Post.findOne({
      _id: id,
      authorId: req.user!.userId
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在或无权限'
      });
    }

    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;
    if (tags) post.tags = tags;

    // 处理新图片
    if (req.files) {
      const newImages = (req.files as Express.Multer.File[]).map(file => `/uploads/${file.filename}`);
      post.images = [...post.images, ...newImages];
    }

    await post.save();

    res.json({
      success: true,
      message: '帖子更新成功',
      data: post
    });
  } catch (error: any) {
    console.error('更新帖子错误:', error);
    res.status(500).json({
      success: false,
      message: '更新帖子失败',
      error: error.message
    });
  }
};

// 删除帖子
export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const post = await Post.findOneAndDelete({
      _id: id,
      authorId: req.user!.userId
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在或无权限'
      });
    }

    res.json({
      success: true,
      message: '帖子删除成功'
    });
  } catch (error: any) {
    console.error('删除帖子错误:', error);
    res.status(500).json({
      success: false,
      message: '删除帖子失败',
      error: error.message
    });
  }
};

// 添加评论
export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content, parentCommentId } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在'
      });
    }

    const user = await User.findById(req.user!.userId);
    const comment = {
      _id: new mongoose.Types.ObjectId(),
      userId: req.user!.userId,
      userName: user?.username || '',
      userAvatar: user?.avatar || '/uploads/default-avatar.png',
      content,
      parentId: parentCommentId,
      createdAt: new Date()
    };

    post.comments.push(comment);
    post.commentsCount += 1;
    await post.save();

    await post.populate('comments.userId', 'username avatar');

    res.status(201).json({
      success: true,
      message: '评论成功',
      data: post.comments[post.comments.length - 1]
    });
  } catch (error: any) {
    console.error('添加评论错误:', error);
    res.status(500).json({
      success: false,
      message: '添加评论失败',
      error: error.message
    });
  }
};

// 点赞/取消点赞
export const toggleLike = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在'
      });
    }

    const userId = req.user!.userId;
    const likedIndex = post.likes.indexOf(userId);

    if (likedIndex > -1) {
      // 取消点赞
      post.likes.splice(likedIndex, 1);
    } else {
      // 点赞
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      success: true,
      message: likedIndex > -1 ? '已取消点赞' : '已点赞',
      data: {
        likes: post.likes.length,
        isLiked: likedIndex === -1
      }
    });
  } catch (error: any) {
    console.error('点赞错误:', error);
    res.status(500).json({
      success: false,
      message: '操作失败',
      error: error.message
    });
  }
};

// 点赞（别名）
export const likePost = toggleLike;

// 收藏/取消收藏
export const toggleFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在'
      });
    }

    const userId = req.user!.userId;
    const favoritedIndex = post.favorites.indexOf(userId);

    if (favoritedIndex > -1) {
      // 取消收藏
      post.favorites.splice(favoritedIndex, 1);
    } else {
      // 收藏
      post.favorites.push(userId);
    }

    await post.save();

    res.json({
      success: true,
      message: favoritedIndex > -1 ? '已取消收藏' : '已收藏',
      data: {
        favorites: post.favorites.length,
        isFavorited: favoritedIndex === -1
      }
    });
  } catch (error: any) {
    console.error('收藏错误:', error);
    res.status(500).json({
      success: false,
      message: '操作失败',
      error: error.message
    });
  }
};

// 获取我的帖子
export const getMyPosts = async (req: AuthRequest, res: Response) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query: any = { authorId: req.user!.userId };

    const posts = await Post.find(query)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      data: posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    console.error('获取我的帖子错误:', error);
    res.status(500).json({
      success: false,
      message: '获取我的帖子失败',
      error: error.message
    });
  }
};

// 搜索帖子
export const searchPosts = async (req: Request, res: Response) => {
  try {
    const { keyword, category, page = 1, limit = 20 } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: '请输入搜索关键词'
      });
    }

    const query: any = {};
    if (category) query.category = category;
    
    query.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { content: { $regex: keyword, $options: 'i' } },
      { tags: { $regex: keyword, $options: 'i' } }
    ];

    const posts = await Post.find(query)
      .populate('authorId', 'username avatar')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      data: posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    });
  } catch (error: any) {
    console.error('搜索帖子错误:', error);
    res.status(500).json({
      success: false,
      message: '搜索失败',
      error: error.message
    });
  }
};

// 删除评论
export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id, commentId } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在'
      });
    }

    // 查找评论
    const commentIndex = post.comments.findIndex(
      (c: any) => c._id.toString() === commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '评论不存在'
      });
    }

    const comment = post.comments[commentIndex];

    // 检查权限：只能删除自己的评论或管理员
    if (comment.userId.toString() !== req.user!.userId) {
      return res.status(403).json({
        success: false,
        message: '无权限删除此评论'
      });
    }

    // 删除评论（包括回复）
    post.comments = post.comments.filter(
      (c: any) => c._id.toString() !== commentId && c.parentCommentId?.toString() === commentId
    );
    post.commentsCount -= 1;
    await post.save();

    res.json({
      success: true,
      message: '评论删除成功'
    });
  } catch (error: any) {
    console.error('删除评论错误:', error);
    res.status(500).json({
      success: false,
      message: '删除评论失败',
      error: error.message
    });
  }
};

// 取消点赞
export const unlikePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在'
      });
    }

    const userId = req.user!.userId;
    const likedIndex = post.likes.indexOf(userId);

    if (likedIndex === -1) {
      return res.status(400).json({
        success: false,
        message: '您还没有点赞'
      });
    }

    // 取消点赞
    post.likes.splice(likedIndex, 1);
    await post.save();

    res.json({
      success: true,
      message: '已取消点赞',
      data: {
        likes: post.likes.length,
        isLiked: false
      }
    });
  } catch (error: any) {
    console.error('取消点赞错误:', error);
    res.status(500).json({
      success: false,
      message: '操作失败',
      error: error.message
    });
  }
};
