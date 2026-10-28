import mongoose, { Document, Schema } from 'mongoose';

export interface IMedical extends Document {
  userId: mongoose.Types.ObjectId;
  petId?: mongoose.Types.ObjectId;
  petName?: string;
  species: 'dog' | 'cat' | 'other';
  breed?: string;
  age?: number;
  gender?: 'male' | 'female' | 'unknown';
  symptoms: string;
  symptomDuration?: string;
  temperature?: number;
  appetite?: string;
  behavior?: string;
  images?: string[];
  diagnosis: string;
  diagnosisConfidence?: number;
  recommendations: string[];
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    type: 'prescription' | 'otc' | 'supplement';
  }>;
  vetRecommendations?: string;
  relatedArticles?: string[];
  notes: Array<{
    _id: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
  }>;
  status: 'draft' | 'submitted' | 'diagnosed' | 'follow-up' | 'resolved' | 'cancelled' | 'completed';
  followUpDate?: Date;
  isEmergency: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const medicalSchema = new Schema<IMedical>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    petId: {
      type: Schema.Types.ObjectId,
      ref: 'Pet'
    },
    petName: {
      type: String
    },
    species: {
      type: String,
      enum: ['dog', 'cat', 'other'],
      required: true
    },
    breed: {
      type: String
    },
    age: {
      type: Number
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'unknown'],
      default: 'unknown'
    },
    symptoms: {
      type: String,
      required: [true, '症状描述不能为空'],
      maxlength: [1000, '症状描述最多 1000 个字符']
    },
    symptomDuration: {
      type: String
    },
    temperature: {
      type: Number,
      min: 35,
      max: 42
    },
    appetite: {
      type: String,
      enum: ['normal', 'decreased', 'none', 'increased']
    },
    behavior: {
      type: String,
      maxlength: 500
    },
    images: {
      type: [String],
      default: []
    },
    diagnosis: {
      type: String,
      maxlength: 2000
    },
    diagnosisConfidence: {
      type: Number,
      min: 0,
      max: 100
    },
    recommendations: {
      type: [String],
      default: []
    },
    medications: {
      type: [
        {
          name: { type: String, required: true },
          dosage: { type: String, required: true },
          frequency: { type: String, required: true },
          duration: { type: String, required: true },
          type: { type: String, enum: ['prescription', 'otc', 'supplement'], required: true }
        }
      ],
      default: []
    },
    vetRecommendations: {
      type: String,
      maxlength: 2000
    },
    relatedArticles: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'diagnosed', 'follow-up', 'resolved'],
      default: 'draft'
    },
    followUpDate: {
      type: Date
    },
    isEmergency: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// 索引
medicalSchema.index({ userId: 1, createdAt: -1 });
medicalSchema.index({ species: 1, status: 1 });
medicalSchema.index({ isEmergency: 1, createdAt: -1 });

const Medical = mongoose.model<IMedical>('Medical', medicalSchema);

export default Medical;
