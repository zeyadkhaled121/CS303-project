import admin from "firebase-admin";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let serviceAccount;

try {
  serviceAccount = JSON.parse(
    readFileSync(join(__dirname, "..", "serviceAccountKey.json"), "utf-8")
  );
} catch (error) {
  console.error(" Error: 'serviceAccountKey.json' is missing or invalid. Please check the server/ folder.");
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
