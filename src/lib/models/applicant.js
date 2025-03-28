import mongoose from 'mongoose';

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
    enum: [
      'Cochin University College of Engineering Kuttanad (CUCEK)',
      'Department of Applied Economics',
      'Department of Biotechnology',
      'Department of Chemical Oceanography',
      'Department of Chemistry',
      'Department of Computer Applications (DCA)',
      'Department of Computer Science (DCS)',
      'Department of Electronics (DOE)',
      'Department of English and Foreign Languages',
      'Department of Hindi',
      'Department of Marine Biology, Microbiology & Biochemistry',
      'Department of Mathematics',
      'Department of Physical Oceanography',
      'Department of Physics',
      'Department of Polymer Science and Rubber Technology',
      'Department of Ship Technology',
      'Department of Statistics',
      'International School of Photonics (ISP)',
      'Kunjali Marakkar School of Marine Engineering (KMSME)',
      'School of Engineering (SOE)',
      'School of Environmental Studies',
      'School of Industrial Fisheries',
      'School of Legal Studies (SLS)',
      'School of Management Studies (SMS)'
    ],
    required: true
  },
  course: {
    type: String,
    required: true
  },
  team: {
    type: String,
    enum: [
      'Ambience',
      'Content',
      'Curation',
      'Event',
      'HR',
      'Media and Production',
      'Outreach',
      'Project',
      'Sponsorship',
      'Tech'
    ],
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