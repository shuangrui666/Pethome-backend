import mongoose, { Document, Schema } from 'mongoose';

export interface IMeetup extends Document {
  title: string;
  description: string;
  organizerId: mongoose.Types.ObjectId;
  organizerName: string;
  organizerAvatar: string;
  location: string;
  coordinates?: {
    type: string;
    coordinates: [number, number];
  };
  meetupTime: Date;
  maxParticipants: number;
  currentParticipants: mongoose.Types.ObjectId[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const meetupSchema = new Schema<IMeetup>(
  {
    title: {
      type: String,
      required: [true, '标题不能为空'],
      trim: true,
      maxlength: [50, '标题最多 50 个字符']
    },
    description: {
      type: String,
      required: [true, '描述不能为空'],
      maxlength: [300, '描述最多 300 个字符']
    },
    organizerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    organizerName: {
      type: String,
      required: true
    },
    organizerAvatar: {
      type: String,
      default: '/uploads/default-avatar.png'
    },
    location: {
      type: String,
      required: [true, '地点不能为空']
    },
    coordinates: {
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
    meetupTime: {
      type: Date,
      required: [true, '聚会时间不能为空']
    },
    maxParticipants: {
      type: Number,
      required: [true, '最大参与人数不能为空'],
      min: [2, '至少 2 人'],
      max: [50, '最多 50 人']
    },
    currentParticipants: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: []
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming'
    },
    images: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// 地理位置索引
meetupSchema.index({ 'coordinates': '2dsphere' });
meetupSchema.index({ organizerId: 1 });
meetupSchema.index({ meetupTime: 1 });
meetupSchema.index({ status: 1, meetupTime: -1 });

const Meetup = mongoose.model<IMeetup>('Meetup', meetupSchema);

export default Meetup;
