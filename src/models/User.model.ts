import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email?: string;
  password: string;
  phone?: string;
  avatar?: string;
  realName?: string;
  idCard?: string;
  idCardFront?: string;
  idCardBack?: string;
  realNameVerified?: boolean;
  realNameVerifiedAt?: Date;
  role: 'user' | 'admin' | 'shop' | 'kindergarten' | 'base';
  gender?: 'male' | 'female' | 'other';
  birthday?: Date;
  address?: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  bio?: string;
  petCount?: number;
  pets?: string[];
  following: string[];
  followers: string[];
  friendRequests: Array<{
    requestId: string;
    senderId: string;
    message?: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: Date;
  }>;
  friends: string[];
  messages: Array<{
    senderId: string;
    recipientId: string;
    content: string;
    createdAt: Date;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, '用户名不能为空'],
      trim: true,
      minlength: [3, '用户名至少 3 个字符'],
      maxlength: [20, '用户名最多 20 个字符']
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, '请输入有效的邮箱地址']
    },
    password: {
      type: String,
      required: [true, '密码不能为空'],
      minlength: [6, '密码至少 6 个字符'],
      select: false
    },
    phone: {
      type: String,
      match: [/^1[3-9]\d{9}$/, '请输入有效的手机号']
    },
    avatar: {
      type: String,
      default: '/uploads/default-avatar.png'
    },
    // 实名认证信息
    realName: {
      type: String,
      default: ''
    },
    idCard: {
      type: String,
      default: ''
    },
    idCardFront: {
      type: String,
      default: ''
    },
    idCardBack: {
      type: String,
      default: ''
    },
    realNameVerified: {
      type: Boolean,
      default: false
    },
    realNameVerifiedAt: {
      type: Date
    },
    // 用户角色
    role: {
      type: String,
      enum: ['user', 'admin', 'shop', 'kindergarten', 'base'],
      default: 'user'
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    birthday: {
      type: Date
    },
    address: {
      type: String,
      default: ''
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
    bio: {
      type: String,
      default: ''
    },
    petCount: {
      type: Number,
      default: 0
    },
    pets: {
      type: [String],
      ref: 'Pet',
      default: []
    },
    following: {
      type: [String],
      ref: 'User',
      default: []
    },
    followers: {
      type: [String],
      ref: 'User',
      default: []
    },
    friendRequests: {
      type: [
        {
          requestId: String,
          senderId: String,
          message: String,
          status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
          },
          createdAt: { type: Date, default: Date.now }
        }
      ],
      default: []
    },
    friends: {
      type: [String],
      ref: 'User',
      default: []
    },
    messages: {
      type: [
        {
          senderId: String,
          recipientId: String,
          content: String,
          createdAt: { type: Date, default: Date.now }
        }
      ],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// 密码加密
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 比较密码方法
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// 索引
userSchema.index({ email: 1 }, { sparse: true, unique: true });
userSchema.index(
  { phone: 1 },
  {
    unique: true,
    partialFilterExpression: { phone: { $exists: true, $type: 'string' } }
  }
);
userSchema.index({ username: 1 });
userSchema.index({ location: '2dsphere' });

const User = mongoose.model<IUser>('User', userSchema);

export default User;
