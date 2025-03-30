import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import Applicant from '@/lib/models/applicant';
import { cookies } from 'next/headers';
import { createDiscordEmbed, sendDiscordWebhook } from '@/lib/sendWebhook';

export async function GET() {
  try {
    await verifyAuth();
    await connectDB();
    
    const applicants = await Applicant.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ applicants });
  } catch (error) {
    cookies().delete('admin-token');
    console.error('Error occurred:', error);

    const embed = createDiscordEmbed({
      title: '❌ Error in Admin Dashboard',
      description: 'Error occurred while fetching applications',
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