import mongoose, { Document, Schema } from 'mongoose';

export interface IHospital extends Document {
  name: string;
  city: string;
  district: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  phone: string;
  email?: string;
  services: string[];
  openingHours: string | Array<{
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    open: string; // '09:00'
    close: string; // '21:00'
  }>;
  rating: number;
  reviewCount: number;
  description: string;
  images?: string[];
  doctorNames?: string[];
  hasEmergency: boolean;
  isVerified: boolean;
  isOpen: boolean;
  distance?: number;
  createdBy?: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

const hospitalSchema = new Schema<IHospital>(
  {
    name: {
      type: String,
      required: [true, '医院名称不能为空'],
      trim: true
    },
    city: {
      type: String,
      required: [true, '城市不能为空'],
      index: true
    },
    district: {
      type: String,
      required: [true, '区域不能为空']
    },
    address: {
      type: String,
      required: [true, '地址不能为空']
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    phone: {
      type: String,
      required: [true, '联系电话不能为空']
    },
    email: {
      type: String
    },
    services: {
      type: [String],
      default: []
    },
    openingHours: {
      type: Schema.Types.Mixed,
      default: '24 小时营业'
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    description: {
      type: String,
      maxlength: 2000
    },
    images: {
      type: [String],
      default: []
    },
    doctorNames: {
      type: [String],
      default: []
    },
    hasEmergency: {
      type: Boolean,
      default: false
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    isOpen: {
      type: Boolean,
      default: true
    },
    distance: {
      type: Number
    },
    createdBy: {
      type: String
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

// 索引
hospitalSchema.index({ city: 1, district: 1 });
hospitalSchema.index({ location: '2dsphere' });
hospitalSchema.index({ name: 'text', description: 'text' });
hospitalSchema.index({ isVerified: 1, rating: -1 });

const Hospital = mongoose.model<IHospital>('Hospital', hospitalSchema);

export default Hospital;
