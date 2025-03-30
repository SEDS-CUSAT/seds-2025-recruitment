import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import Applicant from '@/lib/models/applicant';
import { cookies } from 'next/headers';
import { createDiscordEmbed, sendDiscordWebhook } from '@/lib/sendWebhook';

export async function DELETE(req, { params }) {
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

    await Applicant.deleteOne({ userId });

    const embed = createDiscordEmbed({
      title: '🗑️ Application Deleted',
      description: 'An application has been deleted from the system',
      color: '#dc2626',
      fields: [
        { name: 'Applicant ID', value: userId, inline: true },
        { name: 'Name', value: applicant.name, inline: true },
        { name: 'Previous Status', value: applicant.status.toUpperCase(), inline: true },
      ]
    });

    await sendDiscordWebhook('', embed);
    return NextResponse.json({ success: true });
  } catch (error) {
    cookies().delete('admin-token');
    console.error('Error occurred:', error);

    const embed = createDiscordEmbed({
      title: '❌ Error in Admin Dashboard',
      description: 'Error occurred while deleting application',
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