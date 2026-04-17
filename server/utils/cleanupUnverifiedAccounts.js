import { db } from "../database/db.js";

/*
 Delete all unverified accounts whose verification code has expired.
 */
export const removeExpiredUnverifiedAccounts = async () => {
  try {
    const snapshot = await db
      .collection("users")
      .where("accountVerified", "==", false)
      .get();

    if (snapshot.empty) return 0;

    const now = new Date();
    let deletedCount = 0;

    const batch = db.batch();

    snapshot.docs.forEach((doc) => {
      const data = doc.data();

      const expiry = data.verificationCodeExpire?.toDate
        ? data.verificationCodeExpire.toDate()
        : new Date(data.verificationCodeExpire);

      if (expiry < now) {
        batch.delete(doc.ref);
        deletedCount++;
      }
    });

    if (deletedCount > 0) {
      await batch.commit();
      console.log(
        `[Cleanup] Deleted ${deletedCount} expired unverified account(s).`
      );
    }

    return deletedCount;
  } catch (error) {
    console.error("[Cleanup] Error removing unverified accounts:", error.message);
    return 0;
  }
};

/**

 *
 * @param {number} intervalMs
 * @returns {NodeJS.Timeout} 
 */
export const startCleanupScheduler = (intervalMs = 15 * 60 * 1000) => {

    removeExpiredUnverifiedAccounts();

  const id = setInterval(removeExpiredUnverifiedAccounts, intervalMs);

  console.log(
    `[Cleanup] Scheduler started — checking every ${Math.round(
      intervalMs / 60000
    )} minute(s) for expired unverified accounts.`
  );

  return id;
};
