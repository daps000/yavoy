import { users, rides, locations, driverProfiles, reviews, rideContacts, type User, type UpsertUser, type Ride, type InsertRide, type Location, type DriverProfile, type Review, type InsertReview, type DriverRating, type RideContact, type InsertRideContact } from "@shared/schema";
import { db } from "./db";
import { eq, desc, ilike, sql, and, avg, count } from "drizzle-orm";
import crypto from "crypto";

function normalizeLocationName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function hashContact(contact: string): string {
  return crypto.createHash('sha256').update(contact.trim().toLowerCase()).digest('hex');
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserPhone(userId: string, phone: string): Promise<User>;
  
  getAllRides(): Promise<Ride[]>;
  createRide(ride: InsertRide): Promise<Ride>;
  
  searchLocations(query: string): Promise<Location[]>;
  addLocation(name: string): Promise<Location | null>;
  
  getOrCreateDriverProfile(name: string, contact: string): Promise<DriverProfile>;
  getDriverProfile(id: number): Promise<DriverProfile | undefined>;
  getDriverRating(driverProfileId: number): Promise<DriverRating>;
  getDriverReviews(driverProfileId: number, limit?: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  canUserReview(driverProfileId: number, reviewerContact: string): Promise<boolean>;
  
  createRideContact(contact: InsertRideContact): Promise<RideContact>;
  getPendingReviewContacts(userId: string): Promise<(RideContact & { driverName: string | null })[]>;
  markContactReviewed(contactId: number): Promise<void>;
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

  async getAllRides(): Promise<Ride[]> {
    return await db.select().from(rides).orderBy(desc(rides.createdAt));
  }

  async createRide(insertRide: InsertRide): Promise<Ride> {
    const [ride] = await db
      .insert(rides)
      .values(insertRide)
      .returning();
    return ride;
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

  async getOrCreateDriverProfile(name: string, contact: string): Promise<DriverProfile> {
    const contactHash = hashContact(contact);
    const [existing] = await db.select().from(driverProfiles).where(eq(driverProfiles.contactHash, contactHash));
    if (existing) {
      return existing;
    }
    const [profile] = await db
      .insert(driverProfiles)
      .values({ name: name.trim(), contactHash })
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

  async canUserReview(driverProfileId: number, reviewerContact: string): Promise<boolean> {
    const reviewerHash = hashContact(reviewerContact);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    
    const existingReviews = await db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.driverProfileId, driverProfileId),
          eq(reviews.reviewerContactHash, reviewerHash)
        )
      )
      .orderBy(desc(reviews.createdAt))
      .limit(1);
    
    if (existingReviews.length === 0) return true;
    
    const lastReview = existingReviews[0];
    return lastReview.createdAt < fourteenDaysAgo;
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
}

export const storage = new DatabaseStorage();

export { hashContact };
