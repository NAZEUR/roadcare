import admin from "firebase-admin";

let adminApp;
if (!admin.apps?.length) {
  const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  const cleanedKey = rawKey ? rawKey.trim() : undefined;

  let serviceAccount;
  if (cleanedKey) {
    try {
      serviceAccount = JSON.parse(cleanedKey);
    } catch (e) {
      console.error("FIREBASE_SERVICE_ACCOUNT_KEY JSON PARSE FAILED:", e);

      throw new Error(
        "Gagal mengurai FIREBASE_SERVICE_ACCOUNT_KEY. Pastikan itu adalah string JSON yang valid dan dienkapsulasi dengan benar di .env.local.\n" +
          "Error asli: " +
          e.message
      );
    }
  }

  if (!serviceAccount) {
    try {
      adminApp = admin.initializeApp();
      console.warn("Menggunakan Google Application Credentials default.");
    } catch (e) {
      console.error("Firebase Admin initialization failed:", e);
      throw new Error(
        "Firebase Admin initialization failed: Tidak ada service account key dan default credentials tidak ditemukan."
      );
    }
  } else {
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log(
      "Firebase Admin initialized successfully with Service Account."
    );
  }
}

export const adminDb = admin.firestore();

export async function verifyIdTokenFromHeader(authorization) {
  if (!authorization) throw new Error("No authorization header");
  const parts = authorization.split(" ");
  const token =
    parts.length === 2 && parts[0].toLowerCase() === "bearer"
      ? parts[1]
      : parts[0];
  if (!token) throw new Error("No token provided");
  return await admin.auth().verifyIdToken(token);
}

export async function getUserRole(uid) {
  const snap = await adminDb.collection("users").doc(uid).get();
  if (!snap.exists) return null;
  const data = snap.data();
  return data?.role || null;
}
