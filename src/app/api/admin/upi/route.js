import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import Admin from "@/lib/models/admin";
import { DEFAULT_UPI_LIST } from "@/lib/constants";

export async function GET(request) {
  try {
    const admin = await verifyAuth();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUpiPerson = admin.currentUpiPerson;
    const upiDetails = DEFAULT_UPI_LIST.find(u => u.name === currentUpiPerson) || DEFAULT_UPI_LIST[0];
    
    return NextResponse.json({ person: currentUpiPerson, details: upiDetails });
  } catch (error) {
    console.error("Error in UPI GET route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const admin = await verifyAuth();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { person } = await request.json();
    
    if (!DEFAULT_UPI_LIST.some(u => u.name === person)) {
      return NextResponse.json(
        { error: "Invalid UPI person selected" },
        { status: 400 }
      );
    }

    await Admin.findByIdAndUpdate(admin._id, { currentUpiPerson: person });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in UPI PUT route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}