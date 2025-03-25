import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Applicant from '@/lib/models/applicant';

export async function POST(req) {
  try {
    await connectDB();
    const formData = await req.formData();
    
    const applicantData = {
      name: formData.get('name'),
      phoneNo: formData.get('phoneNo'),
      email: formData.get('email'),
      college: formData.get('college'),
      yearOfStudy: parseInt(formData.get('yearOfStudy')),
      degree: formData.get('degree'),
      department: formData.get('department'),
      course: formData.get('course'),
      team: formData.get('team'),
      transactionId: formData.get('transactionId'),
      paymentScreenshot: formData.get('paymentScreenshot'),
    };

    const applicant = await Applicant.create(applicantData);
    return NextResponse.json({ 
      message: "Application submitted successfully",
      userId: applicant.userId 
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}