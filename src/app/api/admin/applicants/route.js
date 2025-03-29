import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import Applicant from '@/lib/models/applicant';

export async function GET() {
  try {
    await verifyAuth();
    await connectDB();
    
    const applicants = await Applicant.find().sort({ createdAt: -1 });
    return NextResponse.json({ applicants });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}