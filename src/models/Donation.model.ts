import mongoose, { Document, Schema } from 'mongoose';

export interface IDonation extends Document {
  donorId: mongoose.Types.ObjectId;
  donorName: string;
  donorType: 'user' | 'organization';
  amount?: number;
  foodType?: string;
  foodQuantity?: number;
  foodUnit?: string;
  targetBaseId?: mongoose.Types.ObjectId;
  targetBaseName?: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'active';
  paymentMethod?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  transactionId?: string;
  donationDate?: Date;
  notes: Array<{
    _id: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
  }>;
  images?: string[];
  isAnonymous: boolean;
  donations: Array<{
    _id: mongoose.Types.ObjectId;
    donorName: string;
    amount?: number;
    foodType?: string;
    foodQuantity?: number;
    donatedAt: Date;
  }>;
  currentAmount: number;
  targetAmount: number;
  createdBy: mongoose.Types.ObjectId;
  trackingRecords?: Array<{
    status: string;
    description: string;
    timestamp: Date;
    location?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const donationSchema = new Schema<IDonation>(
  {
    donorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    donorName: {
      type: String,
      required: true
    },
    donorType: {
      type: String,
      enum: ['user', 'organization'],
      default: 'user'
    },
    amount: {
      type: Number,
      min: 0
    },
    foodType: {
      type: String
    },
    foodQuantity: {
      type: Number,
      min: 0
    },
    foodUnit: {
      type: String,
      enum: ['kg', 'g', 'bag', 'box']
    },
    targetBaseId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    targetBaseName: {
      type: String
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'cancelled'],
      default: 'pending'
    },
    paymentMethod: {
      type: String
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending'
    },
    transactionId: {
      type: String
    },
    donationDate: {
      type: Date
    },
    notes: {
      type: [
        {
          content: { type: String, required: true, maxlength: 500 },
          createdAt: { type: Date, default: Date.now }
        }
      ],
      default: []
    },
    images: {
      type: [String],
      default: []
    },
    isAnonymous: {
      type: Boolean,
      default: false
    },
    trackingRecords: {
      type: [
        {
          status: { type: String },
          description: { type: String },
          timestamp: { type: Date, default: Date.now },
          location: { type: String }
        }
      ],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// 索引
donationSchema.index({ donorId: 1 });
donationSchema.index({ targetBaseId: 1 });
donationSchema.index({ status: 1, donationDate: -1 });
donationSchema.index({ paymentStatus: 1 });

const Donation = mongoose.model<IDonation>('Donation', donationSchema);

export default Donation;
