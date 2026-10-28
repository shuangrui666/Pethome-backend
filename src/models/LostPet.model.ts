import mongoose, { Document, Schema } from 'mongoose';

export interface ILostPet extends Document {
  petId: mongoose.Types.ObjectId;
  reporterId: mongoose.Types.ObjectId;
  petName: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  gender: 'male' | 'female' | 'unknown';
  age?: number;
  color: string;
  features: string;
  images: string[];
  lostTime: Date;
  lostLocation: {
    type: { type: string };
    coordinates: number[];
    address: string;
    city: string;
    district: string;
  };
  lastSeenTime?: Date;
  lastSeenLocation?: string;
  contactPhone: string;
  contactWechat?: string;
  reward?: number;
  status: 'lost' | 'found' | 'adopted' | 'closed';
  notes?: string;
  matches: Array<{
    lostPetId: mongoose.Types.ObjectId;
    similarity: number;
    status: 'pending' | 'confirmed' | 'rejected';
  }>;
  reports: Array<{
    reporterId: mongoose.Types.ObjectId;
    location: {
      type: { type: string };
      coordinates: number[];
      address: string;
    };
    time: Date;
    description: string;
    images: string[];
    status: 'verified' | 'unverified';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const lostPetSchema = new Schema<ILostPet>(
  {
    petId: {
      type: Schema.Types.ObjectId,
      ref: 'Pet',
      default: null
    },
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    petName: {
      type: String,
      required: true
    },
    species: {
      type: String,
      enum: ['dog', 'cat', 'other'],
      required: true
    },
    breed: {
      type: String,
      required: true
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'unknown'],
      default: 'unknown'
    },
    age: {
      type: Number
    },
    color: {
      type: String,
      required: true
    },
    features: {
      type: String,
      maxlength: 500
    },
    images: {
      type: [String],
      required: true
    },
    lostTime: {
      type: Date,
      required: true
    },
    lostLocation: {
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
    lastSeenTime: {
      type: Date
    },
    lastSeenLocation: {
      type: String
    },
    contactPhone: {
      type: String,
      required: true
    },
    contactWechat: {
      type: String
    },
    reward: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['lost', 'found', 'adopted', 'closed'],
      default: 'lost'
    },
    notes: {
      type: String,
      maxlength: 500
    },
    matches: {
      type: [
        {
          lostPetId: { type: Schema.Types.ObjectId, ref: 'LostPet' },
          similarity: { type: Number },
          status: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' }
        }
      ],
      default: []
    },
    reports: {
      type: [
        {
          reporterId: { type: Schema.Types.ObjectId, ref: 'User' },
          location: {
            type: {
              type: String,
              enum: ['Point'],
              default: 'Point'
            },
            coordinates: { type: [Number] },
            address: { type: String }
          },
          time: { type: Date },
          description: { type: String },
          images: { type: [String] },
          status: { type: String, enum: ['verified', 'unverified'], default: 'unverified' }
        }
      ],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// 地理位置索引
lostPetSchema.index({ lostLocation: '2dsphere' });
lostPetSchema.index({ reporterId: 1 });
lostPetSchema.index({ status: 1, species: 1 });

const LostPet = mongoose.model<ILostPet>('LostPet', lostPetSchema);

export default LostPet;
