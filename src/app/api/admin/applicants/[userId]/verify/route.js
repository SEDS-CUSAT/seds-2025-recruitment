import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import Applicant from '@/lib/models/applicant';
import { cookies } from 'next/headers';

export async function POST(req, { params }) {
  try {
    await verifyAuth();
    await connectDB();
    
    const { userId } = params;
    const applicant = await Applicant.findOne({ userId });
    
    if (!applicant) {
      return NextResponse.json(
        { error: 'Applicant not found' },
        { status: 404 }
      );
    }

    applicant.approved = true;
    await applicant.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    cookies().delete('admin-token');
    console.error('Error occurred:', error);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}