import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import Applicant from '@/lib/models/applicant';
import { cookies } from 'next/headers';
import { createDiscordEmbed, sendDiscordWebhook } from '@/lib/sendWebhook';

export async function GET(request) {
  try {
    await verifyAuth();
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const team = searchParams.get('team');

    const query = team ? { team } : {};
    
    const applicants = await Applicant.find(query)
      .hint({ createdAt: -1 })
      .allowDiskUse(true)
      .sort({ createdAt: -1 });
      
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

    let status = 500;
    if (error.message === 'Unauthorized') {
      status = 401;
    } else if (error.message === 'Forbidden') {
      status = 403;
    }
    return NextResponse.json(
      { error: error.message },
      { status }
    );
  }

}