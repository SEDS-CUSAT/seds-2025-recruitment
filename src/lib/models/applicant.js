import mongoose from 'mongoose';
import { DEPARTMENTS, TEAMS } from '../constants';

const applicantSchema = new mongoose.Schema({
  userId: {
    type: String,
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
    enum: DEPARTMENTS,
    required: true
  },
  course: {
    type: String,
    required: true
  },
  team: {
    type: String,
    enum: TEAMS,
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
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Applicant || mongoose.model('Applicant', applicantSchema);