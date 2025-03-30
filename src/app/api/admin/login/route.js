import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { comparePasswords, generateToken } from '@/lib/auth';
import Admin from '@/lib/models/admin';
import connectDB from '@/lib/db';
import { createDiscordEmbed, sendDiscordWebhook } from '@/lib/sendWebhook';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    await connectDB();

    const admin = await Admin.findOne({ email });
    if (!admin) {
      await sendDiscordWebhook(
        "⚠️ Failed Login Attempt",
        createDiscordEmbed({
          title: "Login Failed",
          description: "Invalid email address used",
          color: "#ff9900",
          fields: [
            { name: "Email", value: email, inline: true },
            { name: "IP", value: req.headers.get("x-forwarded-for") || "Unknown", inline: true }
          ]
        })
      );
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValid = await comparePasswords(password, admin.passwordHash);
    if (!isValid) {
      await sendDiscordWebhook(
        "⚠️ Failed Login Attempt",
        createDiscordEmbed({
          title: "Login Failed",
          description: "Invalid password used",
          color: "#ff9900",
          fields: [
            { name: "Email", value: email, inline: true },
            { name: "IP", value: req.headers.get("x-forwarded-for") || "Unknown", inline: true }
          ]
        })
      );
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const { token, jwt } = await generateToken();
    admin.deviceTokens.push({ token });
    await admin.save();

    cookies().set('admin-token', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    await sendDiscordWebhook(
      "✅ Admin Login Successful",
      createDiscordEmbed({
        title: "Admin Login",
        description: "An admin has logged in successfully",
        color: "#00ff00",
        fields: [
          { name: "Email", value: email, inline: true },
          { name: "IP", value: req.headers.get("x-forwarded-for") || "Unknown", inline: true }
        ]
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    await sendDiscordWebhook(
      "❌ Login Error",
      createDiscordEmbed({
        title: "Login System Error",
        description: "An error occurred during login",
        color: "#ff0000",
        fields: [
          { name: "Error Message", value: error.message || "Unknown error", inline: false },
          { name: "Stack Trace", value: (error.stack || "No stack trace").slice(0, 1000), inline: false }
        ]
      })
    );
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}