import crypto from "crypto";
import { storage } from "./storage";
import { sendEmail } from "./email";
import { buildReminderEmailHtml, buildReminderEmailSubject, type ReminderEmailData } from "./email-templates";

const THREE_WEEKS_MS = 21 * 24 * 60 * 60 * 1000;

export function generateUnsubscribeToken(userId: string): string {
  const secret = process.env.ADMIN_SECRET || "fallback-secret";
  const payload = `${userId}:unsubscribe`;
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return Buffer.from(`${userId}:${signature}`).toString("base64url");
}

export function verifyUnsubscribeToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const separatorIndex = decoded.lastIndexOf(":");
    if (separatorIndex === -1) return null;
    const userId = decoded.substring(0, separatorIndex);
    const signature = decoded.substring(separatorIndex + 1);
    const secret = process.env.ADMIN_SECRET || "fallback-secret";
    const expected = crypto.createHmac("sha256", secret).update(`${userId}:unsubscribe`).digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    return userId;
  } catch {
    return null;
  }
}

export async function sendReminderEmails(baseUrl: string): Promise<{ sent: number; skipped: number; errors: number; details: string[] }> {
  const details: string[] = [];
  let sent = 0;
  let skipped = 0;
  let errors = 0;

  const eligibleDrivers = await storage.getEligibleDriversForReminder();
  details.push(`Found ${eligibleDrivers.length} eligible drivers`);

  for (const driver of eligibleDrivers) {
    if (!driver.email) {
      skipped++;
      details.push(`Skipped ${driver.id}: no email`);
      continue;
    }

    try {
      const contactStats = await storage.getDriverContactStats(driver.id);

      let nearbyRideCount = 0;
      if (driver.homeLatitude != null && driver.homeLongitude != null) {
        nearbyRideCount = await storage.getNearbyRideCount(
          driver.homeLatitude, driver.homeLongitude, 30
        );
      }

      const lastRideDate = await getLastRideDate(driver.id);
      const isLongInactive = lastRideDate
        ? (Date.now() - lastRideDate.getTime()) > THREE_WEEKS_MS
        : true;

      const emailData: ReminderEmailData = {
        driverName: driver.firstName || driver.email.split('@')[0],
        topRideOrigin: contactStats.topOrigin || undefined,
        topRideDestination: contactStats.topDestination || undefined,
        contactCount: contactStats.totalContacts,
        nearbyRideCount,
        homeTown: driver.homeTown || undefined,
        isLongInactive,
        unsubscribeUrl: `${baseUrl}/api/unsubscribe?token=${generateUnsubscribeToken(driver.id)}`,
        publishUrl: `${baseUrl}/publicar`,
      };

      const subject = buildReminderEmailSubject(isLongInactive);
      const html = buildReminderEmailHtml(emailData);

      const result = await sendEmail(driver.email, subject, html);

      if (result.success) {
        await storage.updateLastReminderSent(driver.id);
        sent++;
        details.push(`Sent to ${driver.email} (${isLongInactive ? 'long-inactive' : 'regular'})`);
      } else {
        errors++;
        details.push(`Failed for ${driver.email}: ${result.error}`);
      }
    } catch (err: any) {
      errors++;
      details.push(`Error for ${driver.email}: ${err.message}`);
    }
  }

  return { sent, skipped, errors, details };
}

async function getLastRideDate(userId: string): Promise<Date | null> {
  const userRides = await storage.getUserRides(userId);
  if (userRides.length === 0) return null;
  const dates = userRides
    .map(r => r.createdAt ? new Date(r.createdAt) : null)
    .filter((d): d is Date => d !== null);
  if (dates.length === 0) return null;
  return dates.reduce((latest, d) => d > latest ? d : latest);
}
