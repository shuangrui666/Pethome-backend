import mongoose, { Document, Schema } from 'mongoose';

export interface IPet extends Document {
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  gender: 'male' | 'female';
  age: number;
  ageUnit: 'month' | 'year';
  weight?: number;
  color?: string;
  sterilized: boolean;
  vaccinated: boolean;
  microchipped: boolean;
  images: string[];
  description: string;
  healthStatus: string;
  temperament: string[];
  ownerId: mongoose.Types.ObjectId;
  ownerType: 'user' | 'shelter' | 'base';
  isLost: boolean;
  isAdoptable: boolean;
  location: {
    type: { type: string };
    coordinates: number[];
    address: string;
  };
  status: 'active' | 'adopted' | 'lost' | 'deceased';
  createdAt: Date;
  updatedAt: Date;
}

const petSchema = new Schema<IPet>(
  {
    name: {
      type: String,
      required: [true, '宠物名字不能为空'],
      trim: true
    },
    species: {
      type: String,
      enum: ['dog', 'cat', 'other'],
      required: true
    },
    breed: {
      type: String,
      required: [true, '品种不能为空']
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: true
    },
    age: {
      type: Number,
      required: true
    },
    ageUnit: {
      type: String,
      enum: ['month', 'year'],
      default: 'year'
    },
    weight: {
      type: Number
    },
    color: {
      type: String
    },
    sterilized: {
      type: Boolean,
      default: false
    },
    vaccinated: {
      type: Boolean,
      default: false
    },
    microchipped: {
      type: Boolean,
      default: false
    },
    images: {
      type: [String],
      default: []
    },
    description: {
      type: String,
      maxlength: 1000
    },
    healthStatus: {
      type: String,
      default: '健康'
    },
    temperament: {
      type: [String],
      default: []
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    ownerType: {
      type: String,
      enum: ['user', 'shelter', 'base'],
      default: 'user'
    },
    isLost: {
      type: Boolean,
      default: false
    },
    isAdoptable: {
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
        default: [0, 0]
      },
      address: {
        type: String,
        default: ''
      }
    },
    status: {
      type: String,
      enum: ['active', 'adopted', 'lost', 'deceased'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

// 地理位置索引
petSchema.index({ location: '2dsphere' });
petSchema.index({ ownerId: 1 });
petSchema.index({ species: 1, status: 1 });

const Pet = mongoose.model<IPet>('Pet', petSchema);

export default Pet;
