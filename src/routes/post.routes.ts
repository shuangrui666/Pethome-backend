import express from 'express';
import { body } from 'express-validator';
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  getMyPosts,
  addComment,
  deleteComment,
  likePost,
  unlikePost,
  searchPosts,
  toggleFavorite
} from '../controllers/post.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { upload } from '../middleware/upload.middleware';

const router = express.Router();

// 获取帖子列表 (公开)
router.get('/', getPosts);

// 获取热门帖子
router.get('/popular', getPosts);

// 搜索帖子
router.get('/search', searchPosts);

// 获取我的帖子
router.get('/my', authenticate, getMyPosts);

// 获取我的收藏
router.get('/my-favorites', authenticate, (req, res) => {
  // TODO: 实现获取收藏帖子列表
  res.json({
    success: true,
    data: [],
    pagination: { page: 1, limit: 20, total: 0 }
  });
});

// 收藏/取消收藏帖子
router.post('/:id/favorite', authenticate, toggleFavorite);

// 创建帖子
router.post('/', authenticate, upload.array('images', 9), [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('标题 5-100 个字符'),
  body('content').trim().isLength({ min: 20 }).withMessage('内容至少 20 个字符'),
  body('category').isIn(['experience', 'question', 'advice', 'story', 'other']).withMessage('分类无效'),
  body('tags').optional().isArray()
], validate, createPost);

// 获取帖子详情
router.get('/:id', getPostById);

// 更新帖子
router.put('/:id', authenticate, upload.array('images', 9), [
  body('title').optional().trim().isLength({ min: 5, max: 100 }),
  body('content').optional().trim().isLength({ min: 20 }),
  body('category').optional().isIn(['experience', 'question', 'advice', 'story', 'other']),
  body('tags').optional().isArray()
], validate, updatePost);

// 删除帖子
router.delete('/:id', authenticate, deletePost);

// 添加评论
router.post('/:id/comments', authenticate, [
  body('content').trim().isLength({ min: 1, max: 500 }).withMessage('评论内容 1-500 个字符'),
  body('parentId').optional().notEmpty()
], validate, addComment);

// 删除评论
router.delete('/:id/comments/:commentId', authenticate, deleteComment);

// 点赞
router.post('/:id/like', authenticate, likePost);

// 取消点赞
router.delete('/:id/like', authenticate, unlikePost);

export default router;
