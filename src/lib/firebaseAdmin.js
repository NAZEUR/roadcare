import admin from "firebase-admin";

let adminApp;
if (!admin.apps?.length) {
  // Expect service account JSON string in FIREBASE_SERVICE_ACCOUNT env var
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined;

  if (!serviceAccount) {
    // If no service account is provided, try to initialize using default application credentials
    // (e.g., when running on GCP). If that fails, throw an actionable error so callers know
    // how to provide credentials locally.
    try {
      adminApp = admin.initializeApp();
    } catch (e) {
      throw new Error(
        "Firebase Admin initialization failed: no service account provided and default application credentials were not found.\n" +
          "Provide a service account JSON via the FIREBASE_SERVICE_ACCOUNT environment variable (stringified JSON),\n" +
          "or set GOOGLE_APPLICATION_CREDENTIALS to the path of your service account JSON file.\n" +
          "Original error: " + e.message
      );
    }
  } else {
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
}

export const adminDb = admin.firestore();

// Verify Firebase ID token from Authorization header or raw token
export async function verifyIdTokenFromHeader(authorization) {
  if (!authorization) throw new Error("No authorization header");
  const parts = authorization.split(" ");
  const token = parts.length === 2 && parts[0].toLowerCase() === "bearer" ? parts[1] : parts[0];
  if (!token) throw new Error("No token provided");
  return await admin.auth().verifyIdToken(token);
}

export async function getUserRole(uid) {
  const snap = await adminDb.collection("users").doc(uid).get();
  if (!snap.exists) return null;
  const data = snap.data();
  return data?.role || null;
}
