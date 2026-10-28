import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
  type: 'dog-walking' | 'grooming-home' | 'grooming-shop' | 'boarding';
  title: string;
  description: string;
  providerId: mongoose.Types.ObjectId;
  providerName: string;
  providerType: 'user' | 'shop';
  petId?: mongoose.Types.ObjectId;
  serviceDate: Date;
  serviceTime: string;
  duration?: number;
  location: {
    address: string;
    city: string;
    district: string;
    coordinates: number[];
  };
  price: number;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  cancelReason?: string;
  photos: string[];
  timeSlot: {
    start: string;
    end: string;
  };
  address: string;
  customerId: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone: string;
  notes?: string;
  rating?: number;
  review?: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    type: {
      type: String,
      enum: ['dog-walking', 'grooming-home', 'grooming-shop', 'boarding'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      maxlength: 1000
    },
    providerId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    providerName: {
      type: String,
      required: true
    },
    providerType: {
      type: String,
      enum: ['user', 'shop'],
      required: true
    },
    petId: {
      type: Schema.Types.ObjectId,
      ref: 'Pet'
    },
    serviceDate: {
      type: Date,
      required: true
    },
    serviceTime: {
      type: String,
      required: true
    },
    duration: {
      type: Number
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
    price: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
      default: 'pending'
    },
    cancelReason: {
      type: String,
      maxlength: 500
    },
    photos: {
      type: [String],
      default: []
    },
    timeSlot: {
      start: {
        type: String,
        required: true
      },
      end: {
        type: String,
        required: true
      }
    },
    address: {
      type: String,
      required: true
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    customerName: {
      type: String,
      required: true
    },
    customerPhone: {
      type: String,
      required: true
    },
    notes: {
      type: String,
      maxlength: 500
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      maxlength: 500
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

// 索引
serviceSchema.index({ type: 1, status: 1 });
serviceSchema.index({ providerId: 1 });
serviceSchema.index({ customerId: 1 });
serviceSchema.index({ serviceDate: 1 });

const Service = mongoose.model<IService>('Service', serviceSchema);

export default Service;
