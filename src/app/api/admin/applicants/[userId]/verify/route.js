import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import Applicant from '@/lib/models/applicant';
import { cookies } from 'next/headers';
import { createDiscordEmbed, sendDiscordWebhook } from '@/lib/sendWebhook';

export async function POST(req, { params }) {
  try {
    await verifyAuth();
    await connectDB();
    
    const { userId } = params;
    const { status } = await req.json();
    const applicant = await Applicant.findOne({ userId });
    
    if (!applicant) {
      return NextResponse.json(
        { error: 'Applicant not found' },
        { status: 404 }
      );
    }

    if (!['verified', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    applicant.status = status;
    await applicant.save();

    const embed = createDiscordEmbed({
      title: '✨ Application Status Updated',
      description: `Application status changed to ${status.toUpperCase()}`,
      color: '#2563eb',
      fields: [
        { name: 'Applicant ID', value: userId, inline: true },
        { name: 'Name', value: applicant.name, inline: true },
        { name: 'New Status', value: status.toUpperCase(), inline: true },
      ]
    });

    await sendDiscordWebhook('', embed);
    return NextResponse.json({ success: true });
  } catch (error) {
    cookies().delete('admin-token');
    console.error('Error occurred:', error);

    const embed = createDiscordEmbed({
      title: '❌ Error in Admin Dashboard',
      description: 'Error occurred while updating application status',
      color: '#dc2626',
      fields: [
        { name: 'Error Message', value: error.message },
        { name: 'Stack Trace', value: error.stack?.slice(0, 1000) || 'No stack trace' },
      ]
    });

    await sendDiscordWebhook('', embed);

    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}