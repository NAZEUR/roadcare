import { NextResponse } from "next/server";
import { adminDb, verifyIdTokenFromHeader } from "@/lib/firebaseAdmin";

export async function GET(request) {
  try {
    const auth = request.headers.get("authorization");
    const decoded = await verifyIdTokenFromHeader(auth);
    const uid = decoded.uid;

    const snapshot = await adminDb.collection("reports").where("userId", "==", uid).get();
    const reports = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ reports });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(request) {
  try {
    const auth = request.headers.get("authorization");
    const decoded = await verifyIdTokenFromHeader(auth);
    const uid = decoded.uid;
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const docRef = adminDb.collection("reports").doc(id);
    const snap = await docRef.get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (snap.data().userId !== uid) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await docRef.delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 401 });
  }
}
