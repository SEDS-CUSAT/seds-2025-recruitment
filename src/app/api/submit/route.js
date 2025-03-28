import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Applicant from '@/lib/models/applicant';
import { createUserId } from '@/lib/createUserId';

export async function POST(req) {
  try {
    await connectDB();
    const formData = await req.formData();

    let newUserId = createUserId();
    let userIdExistsFlag = await userIdExists(newUserId);
    let attempts = 0;
    while (userIdExistsFlag) {
      newUserId = createUserId();
      userIdExistsFlag = await userIdExists(newUserId);
      attempts++;
      if (attempts >= 5) {
        return NextResponse.json(
          { title: "UserID Generation Error", message: "User ID generation failed after multiple attempts" },
          { status: 500 }
        );
      }
    }
    const applicantId = newUserId;
    
    
    const applicantData = {
      userId: applicantId,
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
      { title: "Error", message: "Internal server error" },
      { status: 500 }
    );
  }
}

async function userIdExists(userId) {
  const applicant = await Applicant.findOne({ userId });
  return applicant !== null;
}