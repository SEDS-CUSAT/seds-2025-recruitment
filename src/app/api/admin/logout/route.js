import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import Admin from '@/lib/models/admin';
import { createDiscordEmbed, sendDiscordWebhook } from '@/lib/sendWebhook';

export async function POST() {
  try {
    const admin = await verifyAuth();
    const token = cookies().get('admin-token');
    
    if (token) {
      await Admin.updateOne(
        { _id: admin._id },
        { $pull: { deviceTokens: { token: token.value } } }
      );
    }
    
    cookies().delete('admin-token');

    await sendDiscordWebhook(
      "👋 Admin Logout",
      createDiscordEmbed({
        title: "Admin Session Ended",
        description: "An admin has logged out",
        color: "#2563eb",
        fields: [
          { name: "Email", value: admin.email, inline: true }
        ]
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    await sendDiscordWebhook(
      "❌ Logout Error",
      createDiscordEmbed({
        title: "Logout System Error",
        description: "An error occurred during logout",
        color: "#ff0000",
        fields: [
          { name: "Error Message", value: error.message || "Unknown error", inline: false },
          { name: "Stack Trace", value: (error.stack || "No stack trace").slice(0, 1000), inline: false }
        ]
      })
    );
    
    cookies().delete('admin-token');
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}