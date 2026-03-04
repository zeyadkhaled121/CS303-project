import { app } from "./app.js";
import { connectDB } from "./database/db.js";
import { startCleanupScheduler } from "./utils/cleanupUnverifiedAccounts.js";
import cloudinary from "cloudinary";
import os from "os";

connectDB();
startCleanupScheduler();

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PORT = process.env.PORT || 5000;

/**
 * Bind to "0.0.0.0" so the server is reachable from any device on the
 * local network — essential for testing with Expo Go on a physical phone.
 *
 *  React Native app should point to:
 *   http://<YOUR_MACHINE_IP>:5000/api/v1/...
 *
 * Run `ipconfig` (Windows) 
 *  machine's local IP (usually 192.168.x.x).
 */
app.listen(PORT, "0.0.0.0", () => {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === "IPv4" && !iface.internal) {
                addresses.push({ name, address: iface.address });
            }
        }
    }

    console.log(`\n  Server is running on port ${PORT}`);
    console.log(`  Local:   http://localhost:${PORT}`);
    addresses.forEach(({ name, address }) => {
        console.log(`  Network (${name}): http://${address}:${PORT}`);
    });
    console.log(`\n  Use the Network address above in your React Native / Expo app.\n`);
});
