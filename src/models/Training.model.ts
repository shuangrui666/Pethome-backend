import mongoose, { Document, Schema } from 'mongoose';

export interface ITraining extends Document {
  trainerId: mongoose.Types.ObjectId;
  trainerName: string;
  trainerAvatar?: string;
  petId: mongoose.Types.ObjectId;
  petName: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  age: number;
  ageUnit: 'month' | 'year';
  gender: 'male' | 'female' | 'unknown';
  personality: string[];
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  trainingPlan: Array<{
    phase: string;
    goals: string[];
    duration: number;
    exercises: string[];
    completed: boolean;
    completedAt?: Date;
  }>;
  currentPhaseIndex: number;
  sessions: Array<{
    date: Date;
    duration: number;
    exercises: string[];
    progress: string;
    trainerNotes: string;
    videoUrl?: string;
  }>;
  goals: string[];
  specialNeeds?: string;
  notes: Array<{
    _id: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
  }>;
  trainerNotes?: string;
  stages: Array<{
    _id: mongoose.Types.ObjectId;
    name: string;
    progress: number;
    status: 'pending' | 'in-progress' | 'completed';
    startedAt?: Date;
    completedAt?: Date;
  }>;
  price: number;
  status: 'pending' | 'active' | 'paused' | 'confirmed' | 'completed' | 'cancelled';
  startDate?: Date;
  endDate?: Date;
  location: {
    address: string;
    city: string;
    district: string;
  };
  schedule: {
    dayOfWeek: number;
    time: string;
  }[];
  customerId: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone: string;
  rating?: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

const trainingSchema = new Schema<ITraining>(
  {
    trainerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    trainerName: {
      type: String,
      required: true
    },
    trainerAvatar: {
      type: String,
      default: '/uploads/default-avatar.png'
    },
    petId: {
      type: Schema.Types.ObjectId,
      ref: 'Pet',
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
    age: {
      type: Number,
      required: true
    },
    ageUnit: {
      type: String,
      enum: ['month', 'year'],
      default: 'year'
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'unknown'],
      default: 'unknown'
    },
    personality: {
      type: [String],
      default: []
    },
    currentLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    trainingPlan: {
      type: [
        {
          phase: { type: String, required: true },
          goals: { type: [String], required: true },
          duration: { type: Number, required: true },
          exercises: { type: [String], required: true },
          completed: { type: Boolean, default: false },
          completedAt: { type: Date }
        }
      ],
      default: []
    },
    currentPhaseIndex: {
      type: Number,
      default: 0
    },
    sessions: {
      type: [
        {
          date: { type: Date, required: true },
          duration: { type: Number, required: true },
          exercises: { type: [String], required: true },
          progress: { type: String },
          trainerNotes: { type: String },
          videoUrl: { type: String }
        }
      ],
      default: []
    },
    goals: {
      type: [String],
      required: true
    },
    specialNeeds: {
      type: String,
      maxlength: 500
    },
    price: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'paused', 'completed', 'cancelled'],
      default: 'pending'
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
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
      }
    },
    schedule: {
      type: [
        {
          dayOfWeek: { type: Number, required: true },
          time: { type: String, required: true }
        }
      ],
      default: []
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
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      maxlength: 500
    }
  },
  {
    timestamps: true
  }
);

// 索引
trainingSchema.index({ trainerId: 1, status: 1 });
trainingSchema.index({ petId: 1 });
trainingSchema.index({ customerId: 1 });
trainingSchema.index({ currentLevel: 1 });

const Training = mongoose.model<ITraining>('Training', trainingSchema);

export default Training;
