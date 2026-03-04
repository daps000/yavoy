import { users, rides, locations, driverProfiles, reviews, rideContacts, type User, type UpsertUser, type Ride, type InsertRide, type Location, type DriverProfile, type Review, type InsertReview, type DriverRating, type RideContact, type InsertRideContact } from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, ilike, sql, and, avg, count, gte } from "drizzle-orm";

function normalizeLocationName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}


export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserPhone(userId: string, phone: string): Promise<User>;
  updateUserProfile(userId: string, data: { firstName: string | null; lastName: string | null; phone: string | null }): Promise<User>;
  
  getAllRides(): Promise<Ride[]>;
  getUserRides(userId: string): Promise<Ride[]>;
  getRide(id: number): Promise<Ride | undefined>;
  createRide(ride: InsertRide & { userId?: string }): Promise<Ride>;
  updateRide(id: number, userId: string, data: Partial<InsertRide>): Promise<Ride | null>;
  deleteRide(id: number, userId: string): Promise<boolean>;
  
  searchLocations(query: string): Promise<Location[]>;
  addLocation(name: string): Promise<Location | null>;
  
  getOrCreateDriverProfile(userId: string, name: string): Promise<DriverProfile>;
  getDriverProfile(id: number): Promise<DriverProfile | undefined>;
  getDriverRating(driverProfileId: number): Promise<DriverRating>;
  getDriverReviews(driverProfileId: number, limit?: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  canUserReview(driverProfileId: number, reviewerUserId: string): Promise<boolean>;
  
  updateUserHomeLocation(userId: string, homeTown: string, lat: number, lng: number): Promise<User>;
  
  findRideContact(userId: string, rideId: number): Promise<RideContact | null>;
  createRideContact(contact: InsertRideContact): Promise<RideContact>;
  getPendingReviewContacts(userId: string): Promise<(RideContact & { driverName: string | null })[]>;
  markContactReviewed(contactId: number): Promise<void>;

  getEligibleDriversForReminder(): Promise<User[]>;
  getDriverContactStats(userId: string): Promise<{ totalContacts: number; topOrigin: string | null; topDestination: string | null }>;
  getNearbyRideCount(lat: number, lng: number, radiusKm: number): Promise<number>;
  updateLastReminderSent(userId: string): Promise<void>;
  setEmailReminders(userId: string, enabled: boolean): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserPhone(userId: string, phone: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ phone, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserProfile(userId: string, data: { firstName: string | null; lastName: string | null; phone: string | null }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getAllRides(): Promise<Ride[]> {
    const today = new Date().toISOString().split('T')[0];
    return await db
      .select()
      .from(rides)
      .where(gte(rides.date, today))
      .orderBy(asc(rides.date), asc(rides.time));
  }

  async getUserRides(userId: string): Promise<Ride[]> {
    return await db
      .select()
      .from(rides)
      .where(eq(rides.userId, userId))
      .orderBy(desc(rides.createdAt));
  }

  async getRide(id: number): Promise<Ride | undefined> {
    const [ride] = await db.select().from(rides).where(eq(rides.id, id));
    return ride || undefined;
  }

  async createRide(insertRide: InsertRide & { userId?: string }): Promise<Ride> {
    const [ride] = await db
      .insert(rides)
      .values(insertRide)
      .returning();
    return ride;
  }

  async updateRide(id: number, userId: string, data: Partial<InsertRide>): Promise<Ride | null> {
    const [ride] = await db
      .update(rides)
      .set(data)
      .where(and(eq(rides.id, id), eq(rides.userId, userId)))
      .returning();
    return ride || null;
  }

  async deleteRide(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(rides)
      .where(and(eq(rides.id, id), eq(rides.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async searchLocations(query: string): Promise<Location[]> {
    if (!query || query.length < 2) return [];
    const normalizedQuery = normalizeLocationName(query);
    return await db
      .select()
      .from(locations)
      .where(ilike(locations.normalized, `%${normalizedQuery}%`))
      .orderBy(locations.name)
      .limit(10);
  }

  async addLocation(name: string): Promise<Location | null> {
    if (!name || name.trim().length === 0) return null;
    const trimmedName = name.trim();
    const normalized = normalizeLocationName(trimmedName);
    try {
      const [location] = await db
        .insert(locations)
        .values({ name: trimmedName, normalized })
        .onConflictDoNothing()
        .returning();
      return location || null;
    } catch {
      return null;
    }
  }

  async getOrCreateDriverProfile(userId: string, name: string): Promise<DriverProfile> {
    const [existing] = await db.select().from(driverProfiles).where(eq(driverProfiles.userId, userId));
    if (existing) {
      return existing;
    }
    const [profile] = await db
      .insert(driverProfiles)
      .values({ userId, name: name.trim() })
      .returning();
    return profile;
  }

  async getDriverProfile(id: number): Promise<DriverProfile | undefined> {
    const [profile] = await db.select().from(driverProfiles).where(eq(driverProfiles.id, id));
    return profile || undefined;
  }

  async getDriverRating(driverProfileId: number): Promise<DriverRating> {
    const result = await db
      .select({
        averageStars: avg(reviews.stars),
        totalReviews: count(reviews.id),
      })
      .from(reviews)
      .where(eq(reviews.driverProfileId, driverProfileId));
    
    const row = result[0];
    return {
      averageStars: row?.averageStars ? parseFloat(row.averageStars) : 0,
      totalReviews: row?.totalReviews || 0,
    };
  }

  async getDriverReviews(driverProfileId: number, limit: number = 5): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.driverProfileId, driverProfileId))
      .orderBy(desc(reviews.createdAt))
      .limit(limit);
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db
      .insert(reviews)
      .values(review)
      .returning();
    return newReview;
  }

  async canUserReview(driverProfileId: number, reviewerUserId: string): Promise<boolean> {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    
    const existingReviews = await db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.driverProfileId, driverProfileId),
          eq(reviews.reviewerUserId, reviewerUserId)
        )
      )
      .orderBy(desc(reviews.createdAt))
      .limit(1);
    
    if (existingReviews.length === 0) return true;
    
    const lastReview = existingReviews[0];
    return lastReview.createdAt < fourteenDaysAgo;
  }

  async updateUserHomeLocation(userId: string, homeTown: string, lat: number, lng: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ homeTown, homeLatitude: lat, homeLongitude: lng, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async findRideContact(userId: string, rideId: number): Promise<RideContact | null> {
    const [contact] = await db
      .select()
      .from(rideContacts)
      .where(and(eq(rideContacts.userId, userId), eq(rideContacts.rideId, rideId)))
      .limit(1);
    return contact || null;
  }

  async createRideContact(contact: InsertRideContact): Promise<RideContact> {
    const [newContact] = await db
      .insert(rideContacts)
      .values(contact)
      .returning();
    return newContact;
  }

  async getPendingReviewContacts(userId: string): Promise<(RideContact & { driverName: string | null })[]> {
    const result = await db
      .select({
        id: rideContacts.id,
        userId: rideContacts.userId,
        rideId: rideContacts.rideId,
        driverProfileId: rideContacts.driverProfileId,
        reviewSubmitted: rideContacts.reviewSubmitted,
        createdAt: rideContacts.createdAt,
        driverName: driverProfiles.name,
      })
      .from(rideContacts)
      .leftJoin(driverProfiles, eq(rideContacts.driverProfileId, driverProfiles.id))
      .where(
        and(
          eq(rideContacts.userId, userId),
          eq(rideContacts.reviewSubmitted, 0)
        )
      )
      .orderBy(desc(rideContacts.createdAt));
    return result;
  }

  async markContactReviewed(contactId: number): Promise<void> {
    await db
      .update(rideContacts)
      .set({ reviewSubmitted: 1 })
      .where(eq(rideContacts.id, contactId));
  }

  async getEligibleDriversForReminder(): Promise<User[]> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const result = await db
      .select({ user: users })
      .from(users)
      .innerJoin(driverProfiles, eq(users.id, driverProfiles.userId))
      .where(
        and(
          eq(users.emailReminders, 1),
          sql`(${users.lastReminderSentAt} IS NULL OR ${users.lastReminderSentAt} < ${sevenDaysAgo})`
        )
      );
    return result.map(r => r.user);
  }

  async getDriverContactStats(userId: string): Promise<{ totalContacts: number; topOrigin: string | null; topDestination: string | null }> {
    const result = await db
      .select({
        rideId: rides.id,
        origin: rides.origin,
        destination: rides.destination,
        contactCount: count(rideContacts.id),
      })
      .from(rides)
      .leftJoin(rideContacts, eq(rides.id, rideContacts.rideId))
      .where(eq(rides.userId, userId))
      .groupBy(rides.id, rides.origin, rides.destination)
      .orderBy(desc(count(rideContacts.id)));

    let totalContacts = 0;
    let topOrigin: string | null = null;
    let topDestination: string | null = null;

    for (const row of result) {
      const cnt = Number(row.contactCount);
      totalContacts += cnt;
      if (topOrigin == null && cnt > 0) {
        topOrigin = row.origin;
        topDestination = row.destination;
      }
    }

    return { totalContacts, topOrigin, topDestination };
  }

  async getNearbyRideCount(lat: number, lng: number, radiusKm: number): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(rides)
      .where(
        sql`origin_lat IS NOT NULL AND origin_lng IS NOT NULL AND
          (6371 * acos(
            cos(radians(${lat})) * cos(radians(origin_lat)) *
            cos(radians(origin_lng) - radians(${lng})) +
            sin(radians(${lat})) * sin(radians(origin_lat))
          )) <= ${radiusKm}`
      );
    return Number(result[0]?.count ?? 0);
  }

  async updateLastReminderSent(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ lastReminderSentAt: new Date() })
      .where(eq(users.id, userId));
  }

  async setEmailReminders(userId: string, enabled: boolean): Promise<void> {
    await db
      .update(users)
      .set({ emailReminders: enabled ? 1 : 0 })
      .where(eq(users.id, userId));
  }
}

export const storage = new DatabaseStorage();
