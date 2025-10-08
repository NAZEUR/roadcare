import { adminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import { NextResponse } from "next/server";

// GET all reports
export async function GET() {
  try {
    const snapshot = await adminDb.collection("reports").get();
    const reports = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json(reports);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

// POST a new report
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, photoUrl, description, latitude, longitude } = body;

    if (!userId || !photoUrl || !description || !latitude || !longitude) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const now = admin.firestore.Timestamp.now();
    const newReport = {
      userId,
      photoUrl,
      description,
      latitude,
      longitude,
      status: "Baru",
      createdAt: now,
      updatedAt: now,
      adminNote: "",
    };

    const docRef = await adminDb.collection("reports").add(newReport);
    return NextResponse.json({ id: docRef.id, ...newReport }, { status: 201 });
  } catch (error) {
    console.error("Error creating report: ", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}
