import mongoose, { Document, Schema } from 'mongoose';

export interface IShop extends Document {
  name: string;
  description: string;
  ownerId: mongoose.Types.ObjectId;
  licenseNumber: string;
  licenseVerified: boolean;
  location: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
    city: string;
    district: string;
  };
  phone: string;
  email: string;
  openingHours: {
    dayOfWeek: number;
    open: string;
    close: string;
  }[];
  services: Array<{
    name: string;
    description: string;
    price: number;
    duration?: number;
  }>;
  categories: string[];
  images: string[];
  videoRoomId?: string;
  liveStreams: Array<{
    _id: mongoose.Types.ObjectId;
    streamId: string;
    title: string;
    status: 'live' | 'ended';
    startedAt: Date;
    endedAt?: Date;
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
  monitoringRooms: Array<{
    _id: mongoose.Types.ObjectId;
    roomId: string;
    roomName: string;
    cameraCount: number;
    status: 'active' | 'inactive';
    createdAt: Date;
  }>;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const shopSchema = new Schema<IShop>(
  {
    name: {
      type: String,
      required: [true, '店铺名称不能为空'],
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
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      },
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
      type: [
        {
          name: { type: String, required: true },
          description: { type: String },
          price: { type: Number, required: true },
          duration: { type: Number }
        }
      ],
      default: []
    },
    categories: {
      type: [String],
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
shopSchema.index({ ownerId: 1 });
shopSchema.index({ status: 1 });
shopSchema.index({ location: '2dsphere' });
shopSchema.index({ rating: -1 });

const Shop = mongoose.model<IShop>('Shop', shopSchema);

export default Shop;
