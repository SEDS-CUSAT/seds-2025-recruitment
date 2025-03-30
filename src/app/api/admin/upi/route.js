import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import Admin from "@/lib/models/admin";
import { DEFAULT_UPI_LIST } from "@/lib/constants";
import { createDiscordEmbed, sendDiscordWebhook } from '@/lib/sendWebhook';
import connectDB from '@/lib/db';

export async function GET(request) {
  try {
    await connectDB();
    
    const admin = await Admin.findOne({});
    if (!admin) {
      return NextResponse.json({ 
        person: DEFAULT_UPI_LIST[0].name, 
        details: DEFAULT_UPI_LIST[0] 
      });
    }

    const currentUpiPerson = admin.currentUpiPerson;
    const upiDetails = DEFAULT_UPI_LIST.find(u => u.name === currentUpiPerson) || DEFAULT_UPI_LIST[0];
    
    return NextResponse.json({ person: currentUpiPerson, details: upiDetails });
  } catch (error) {
    console.error("Error in UPI GET route:", error);
    await sendDiscordWebhook(
      "❌ UPI Fetch Error",
      createDiscordEmbed({
        title: "UPI System Error",
        description: "Error occurred while fetching UPI details",
        color: "#ff0000",
        fields: [
          { name: "Error Message", value: error.message || "Unknown error", inline: false },
          { name: "Stack Trace", value: (error.stack || "No stack trace").slice(0, 1000), inline: false }
        ]
      })
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    
    const admin = await verifyAuth();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { person } = await request.json();
    
    if (!DEFAULT_UPI_LIST.some(u => u.name === person)) {
      await sendDiscordWebhook(
        "⚠️ Invalid UPI Update Attempt",
        createDiscordEmbed({
          title: "Invalid UPI Person",
          description: "Attempt to set invalid UPI person",
          color: "#ff9900",
          fields: [
            { name: "Admin Email", value: admin.email, inline: true },
            { name: "Attempted Value", value: person, inline: true }
          ]
        })
      );
      return NextResponse.json(
        { error: "Invalid UPI person selected" },
        { status: 400 }
      );
    }

    const previousPerson = admin.currentUpiPerson;
    await Admin.findByIdAndUpdate(admin._id, { currentUpiPerson: person });
    
    await sendDiscordWebhook(
      "💳 UPI Account Changed",
      createDiscordEmbed({
        title: "UPI Payment Account Updated",
        description: "The active UPI payment account has been changed",
        color: "#00ff00",
        fields: [
          { name: "Changed By", value: admin.email, inline: true },
          { name: "Previous Account", value: previousPerson || "None", inline: true },
          { name: "New Account", value: person, inline: true }
        ]
      })
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in UPI PUT route:", error);
    await sendDiscordWebhook(
      "❌ UPI Update Error",
      createDiscordEmbed({
        title: "UPI System Error",
        description: "Error occurred while updating UPI person",
        color: "#ff0000",
        fields: [
          { name: "Error Message", value: error.message || "Unknown error", inline: false },
          { name: "Stack Trace", value: (error.stack || "No stack trace").slice(0, 1000), inline: false }
        ]
      })
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}