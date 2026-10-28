import mongoose, { Document, Schema } from 'mongoose';

export interface IFriendRequest extends Document {
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  senderAvatar: string;
  recipientId: mongoose.Types.ObjectId;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const friendRequestSchema = new Schema<IFriendRequest>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    senderName: {
      type: String,
      required: true
    },
    senderAvatar: {
      type: String,
      default: '/uploads/default-avatar.png'
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      maxlength: [100, '消息最多 100 个字符']
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

// 索引
friendRequestSchema.index({ senderId: 1, recipientId: 1 });
friendRequestSchema.index({ recipientId: 1, status: 1 });

const FriendRequest = mongoose.model<IFriendRequest>('FriendRequest', friendRequestSchema);

export default FriendRequest;
