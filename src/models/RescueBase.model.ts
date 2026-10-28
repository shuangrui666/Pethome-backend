import mongoose, { Document, Schema } from 'mongoose';

export interface IRescueBase extends Document {
  name: string;
  city: string;
  district: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  phone: string;
  email: string;
  description: string;
  currentAnimals: number;
  maxCapacity: number;
  availableSpace: number;
  needsDonation: boolean;
  donationGoal: number;
  donationRaised: number;
  images?: string[];
  services: string[];
  operatingHours: string;
  isVerified: boolean;
  isOpen: boolean;
  status: 'active' | 'inactive' | 'suspended';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const rescueBaseSchema = new Schema<IRescueBase>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true
    },
    district: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
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
    description: {
      type: String,
      required: true,
      maxlength: 500
    },
    currentAnimals: {
      type: Number,
      required: true,
      min: 0
    },
    maxCapacity: {
      type: Number,
      required: true,
      min: 1
    },
    availableSpace: {
      type: Number,
      required: true,
      min: 0
    },
    needsDonation: {
      type: Boolean,
      default: false
    },
    donationGoal: {
      type: Number,
      min: 0,
      default: 0
    },
    donationRaised: {
      type: Number,
      min: 0,
      default: 0
    },
    images: {
      type: [String],
      default: []
    },
    services: {
      type: [String],
      default: ['临时收容', '领养对接']
    },
    operatingHours: {
      type: String,
      default: '09:00-18:00'
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    isOpen: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active'
    },
    createdBy: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// 索引
rescueBaseSchema.index({ city: 1, district: 1 });
rescueBaseSchema.index({ location: '2dsphere' });
rescueBaseSchema.index({ isVerified: 1, isOpen: 1 });
rescueBaseSchema.index({ status: 1 });

const RescueBase = mongoose.model<IRescueBase>('RescueBase', rescueBaseSchema);

export default RescueBase;
