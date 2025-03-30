import mongoose from 'mongoose';
import { hashPassword } from '../src/lib/auth.js';
import Admin from '../src/lib/models/admin.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.log('No credentials found!');
  process.exit(1);
}

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existingAdmin = await Admin.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      console.log('Admin account already exists');
      process.exit(0);
    }

    const passwordHash = await hashPassword(ADMIN_PASSWORD);

    await Admin.create({
      email: ADMIN_EMAIL,
      passwordHash,
      deviceTokens: []
    });

    console.log('Admin account created successfully');
  } catch (error) {
    console.error('Error creating admin account:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();