import mongoose, { Document, Schema } from 'mongoose';

export interface IAdoption extends Document {
  petId: mongoose.Types.ObjectId;
  applicantId: mongoose.Types.ObjectId;
  applicantName: string;
  applicantPhone: string;
  applicantEmail: string;
  applicantAddress: string;
  livingSituation: string;
  familySupport: boolean;
  otherPets: boolean;
  experience: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  reviewNote?: string;
  reviewBy?: mongoose.Types.ObjectId;
  reviewAt?: Date;
  meetUpTime?: Date;
  meetUpLocation?: string;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const adoptionSchema = new Schema<IAdoption>(
  {
    petId: {
      type: Schema.Types.ObjectId,
      ref: 'Pet',
      required: true
    },
    applicantId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    applicantName: {
      type: String,
      required: true
    },
    applicantPhone: {
      type: String,
      required: true
    },
    applicantEmail: {
      type: String,
      required: true
    },
    applicantAddress: {
      type: String,
      required: true
    },
    livingSituation: {
      type: String,
      enum: ['own-house', 'rent-house', 'dormitory', 'with-parents'],
      required: true
    },
    familySupport: {
      type: Boolean,
      required: true
    },
    otherPets: {
      type: Boolean,
      default: false
    },
    experience: {
      type: String,
      maxlength: 500
    },
    reason: {
      type: String,
      required: true,
      maxlength: 1000
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
      default: 'pending'
    },
    reviewNote: {
      type: String,
      maxlength: 500
    },
    reviewBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewAt: {
      type: Date
    },
    meetUpTime: {
      type: Date
    },
    meetUpLocation: {
      type: String
    },
    followUpDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// 索引
adoptionSchema.index({ petId: 1, status: 1 });
adoptionSchema.index({ applicantId: 1 });

const Adoption = mongoose.model<IAdoption>('Adoption', adoptionSchema);

export default Adoption;
