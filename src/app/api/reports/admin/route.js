import { NextResponse } from "next/server";
import admin from "firebase-admin";
import {
  adminDb,
  verifyIdTokenFromHeader,
  getUserRole,
} from "@/lib/firebaseAdmin";

export async function GET(request) {
  try {
    const auth = request.headers.get("authorization");
    const decoded = await verifyIdTokenFromHeader(auth);
    const role = await getUserRole(decoded.uid);
    if (role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const snapshot = await adminDb.collection("reports").get();
    const reports = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ reports });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function PATCH(request) {
  try {
    const auth = request.headers.get("authorization");
    const decoded = await verifyIdTokenFromHeader(auth);
    const role = await getUserRole(decoded.uid);
    if (role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { id, status } = body;
    if (!id || !status)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    await adminDb
      .collection("reports")
      .doc(id)
      .update({ status, updatedAt: admin.firestore.Timestamp.now() });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}
