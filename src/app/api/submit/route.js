import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Applicant from '@/lib/models/applicant';
import { createUserId } from '@/lib/createUserId';
import { sendDiscordWebhook, createDiscordEmbed } from '@/lib/sendWebhook';

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
        const error = "User ID generation failed after multiple attempts";
        await sendDiscordWebhook(
          "⚠️ Application Submission Error",
          createDiscordEmbed({
            title: "User ID Generation Error",
            description: error,
            color: "#ff0000",
            fields: [
              { name: "Error Type", value: "ID Generation", inline: true },
              { name: "Attempts", value: attempts.toString(), inline: true }
            ]
          })
        );
        return NextResponse.json(
          { title: "UserID Generation Error", message: error },
          { status: 500 }
        );
      }
    }
    
    const applicantData = {
      userId: newUserId,
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

    const requiredFields = ['name', 'phoneNo', 'email', 'yearOfStudy', 'degree', 'department', 'team', 'transactionId', 'paymentScreenshot'];
    const missingFields = requiredFields.filter(field => !applicantData[field]);
    
    if (missingFields.length > 0) {
      const error = `Missing required fields: ${missingFields.join(', ')}`;
      await sendDiscordWebhook(
        "⚠️ Application Submission Error",
        createDiscordEmbed({
          title: "Validation Error",
          description: error,
          color: "#ff0000",
          fields: [
            { name: "Attempted Data", value: JSON.stringify(applicantData, null, 2).slice(0, 1000), inline: false }
          ]
        })
      );
      return NextResponse.json(
        { title: "Validation Error", message: error },
        { status: 400 }
      );
    }

    const applicant = await Applicant.create(applicantData);
    
    await sendDiscordWebhook(
      "✅ New Application Submitted",
      createDiscordEmbed({
        title: "New Application",
        description: `A new application has been submitted successfully`,
        color: "#00ff00",
        fields: [
          { name: "Name", value: applicantData.name, inline: true },
          { name: "Team", value: applicantData.team, inline: true },
          { name: "User ID", value: applicant.userId, inline: true },
          { name: "Email", value: applicantData.email, inline: false }
        ]
      })
    );

    return NextResponse.json({ 
      message: "Application submitted successfully",
      userId: applicant.userId 
    });

  } catch (error) {
    await sendDiscordWebhook(
      "❌ Application Submission Failed",
      createDiscordEmbed({
        title: "Internal Server Error",
        description: "An error occurred while processing the application",
        color: "#ff0000",
        fields: [
          { name: "Error Message", value: error.message || "Unknown error", inline: false },
          { name: "Error Stack", value: (error.stack || "No stack trace").slice(0, 1000), inline: false }
        ]
      })
    );

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