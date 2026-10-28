import mongoose, { Document, Schema } from 'mongoose';

export interface IKindergarten extends Document {
  name: string;
  description: string;
  ownerId: mongoose.Types.ObjectId;
  licenseNumber: string;
  licenseVerified: boolean;
  location: {
    address: string;
    city: string;
    district: string;
    coordinates: number[];
  };
  phone: string;
  email: string;
  openingHours: {
    dayOfWeek: number;
    open: string;
    close: string;
  }[];
  services: string[];
  prices: Array<{
    service: string;
    price: number;
    unit: 'day' | 'month' | 'hour';
  }>;
  images: string[];
  videoRoomId?: string;
  videoRooms: Array<{
    _id: mongoose.Types.ObjectId;
    roomId: string;
    roomName: string;
    status: 'active' | 'inactive';
    createdAt: Date;
  }>;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  rating: number;
  reviewCount: number;
  liveStreams: Array<{
    _id: mongoose.Types.ObjectId;
    streamId: string;
    title: string;
    status: 'live' | 'ended';
    startedAt: Date;
    endedAt?: Date;
  }>;
  enrolledPets: Array<{
    _id: mongoose.Types.ObjectId;
    petId: mongoose.Types.ObjectId;
    ownerName: string;
    petName: string;
    status: 'active' | 'completed' | 'cancelled';
    enrolledAt: Date;
    completedAt?: Date;
  }>;
  reviews: Array<{
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    userName: string;
    userAvatar: string;
    rating: number;
    comment: string;
    createdAt: Date;
  }>;
  classSchedule: Array<{
    _id: mongoose.Types.ObjectId;
    dayOfWeek: number;
    time: string;
    activity: string;
    location: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const kindergartenSchema = new Schema<IKindergarten>(
  {
    name: {
      type: String,
      required: [true, '幼儿园名称不能为空'],
      trim: true,
      maxlength: [100, '名称最多 100 个字符']
    },
    description: {
      type: String,
      maxlength: [2000, '描述最多 2000 个字符']
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true
    },
    licenseVerified: {
      type: Boolean,
      default: false
    },
    location: {
      address: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      district: {
        type: String,
        required: true
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    openingHours: {
      type: [
        {
          dayOfWeek: { type: Number, required: true },
          open: { type: String, required: true },
          close: { type: String, required: true }
        }
      ],
      default: []
    },
    services: {
      type: [String],
      default: []
    },
    prices: {
      type: [
        {
          service: { type: String, required: true },
          price: { type: Number, required: true },
          unit: { type: String, enum: ['day', 'month', 'hour'], required: true }
        }
      ],
      default: []
    },
    images: {
      type: [String],
      default: []
    },
    videoRoomId: {
      type: String
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'suspended'],
      default: 'pending'
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// 索引
kindergartenSchema.index({ ownerId: 1 });
kindergartenSchema.index({ status: 1 });
kindergartenSchema.index({ location: '2dsphere' });
kindergartenSchema.index({ rating: -1 });

const Kindergarten = mongoose.model<IKindergarten>('Kindergarten', kindergartenSchema);

export default Kindergarten;
