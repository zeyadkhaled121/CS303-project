import admin from "firebase-admin";
import { readFileSync } from "fs";
import { join } from "path";

let serviceAccount;

try {
  serviceAccount = JSON.parse(
    readFileSync(join(process.cwd(), "serviceAccountKey.json"), "utf-8")
  );
} catch (error) {
  console.error(" Error: 'serviceAccountKey.json' is missing or invalid. Please check the root folder.");
  process.exit(1); 
}

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const db = admin.firestore();

export const connectDB = () => {
  console.log("Firestore Connected Successfully");
};
