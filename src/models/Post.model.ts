import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  title: string;
  content: string;
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  authorAvatar: string;
  category: 'feeding' | 'training' | 'health' | 'behavior' | 'product' | 'story';
  tags: string[];
  images: string[];
  video?: string;
  likes: mongoose.Types.ObjectId[];
  views: number;
  viewsCount: number;
  comments: Array<{
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    userName: string;
    userAvatar: string;
    content: string;
    parentId?: mongoose.Types.ObjectId;
    createdAt: Date;
  }>;
  commentsCount: number;
  favorites: Array<{
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
  }>;
  isTop: boolean;
  isFeatured: boolean;
  status: 'published' | 'draft' | 'reviewing' | 'hidden';
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: [true, '标题不能为空'],
      trim: true,
      maxlength: [100, '标题最多 100 个字符']
    },
    content: {
      type: String,
      required: [true, '内容不能为空'],
      maxlength: [10000, '内容最多 10000 个字符']
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    authorName: {
      type: String,
      required: true
    },
    authorAvatar: {
      type: String,
      default: '/uploads/default-avatar.png'
    },
    category: {
      type: String,
      enum: ['feeding', 'training', 'health', 'behavior', 'product', 'story'],
      default: 'feeding'
    },
    tags: {
      type: [String],
      default: []
    },
    images: {
      type: [String],
      default: []
    },
    video: {
      type: String
    },
    likes: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: []
    },
    views: {
      type: Number,
      default: 0
    },
    comments: {
      type: [
        {
          commentId: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
          userId: { type: Schema.Types.ObjectId, ref: 'User' },
          userName: { type: String },
          userAvatar: { type: String },
          content: { type: String },
          parentId: { type: Schema.Types.ObjectId },
          createdAt: { type: Date, default: Date.now }
        }
      ],
      default: []
    },
    isTop: {
      type: Boolean,
      default: false
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['published', 'draft', 'reviewing', 'hidden'],
      default: 'published'
    }
  },
  {
    timestamps: true
  }
);

// 索引
postSchema.index({ authorId: 1 });
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ isTop: 1, createdAt: -1 });

const Post = mongoose.model<IPost>('Post', postSchema);

export default Post;
