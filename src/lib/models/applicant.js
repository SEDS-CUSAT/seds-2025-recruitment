import mongoose from 'mongoose';
import { createUserId } from '../createUserId';

const applicantSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: createUserId,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phoneNo: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  college: {
    type: String,
    enum: ['CUSAT', 'CUCEK'],
    required: true
  },
  yearOfStudy: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  degree: {
    type: String,
    enum: ['UG', 'PG'],
    required: true
  },
  department: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true
  },
  team: {
    type: String,
    required: true
  },
  transactionId: {
    type: String,
    required: true
  },
  paymentScreenshot: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Applicant || mongoose.model('Applicant', applicantSchema);