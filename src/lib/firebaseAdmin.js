import admin from "firebase-admin";

let adminApp;
if (!admin.apps?.length) {
  console.log("--- ISI MENTAH DARI ENV VARIABLE ---");
  console.log(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  console.log("--- AKHIR DARI ISI MENTAH ---");

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined;

  if (!serviceAccount) {
    try {
      adminApp = admin.initializeApp();
    } catch (e) {
      throw new Error(
        "Firebase Admin initialization failed: no service account provided and default application credentials were not found.\n" +
          "Provide a service account JSON via the FIREBASE_SERVICE_ACCOUNT environment variable (stringified JSON),\n" +
          "or set GOOGLE_APPLICATION_CREDENTIALS to the path of your service account JSON file.\n" +
          "Original error: " +
          e.message
      );
    }
  } else {
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
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
