import { users, rides, locations, type User, type InsertUser, type Ride, type InsertRide, type Location } from "@shared/schema";
import { db } from "./db";
import { eq, desc, ilike, sql } from "drizzle-orm";

function normalizeLocationName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllRides(): Promise<Ride[]>;
  createRide(ride: InsertRide): Promise<Ride>;
  
  searchLocations(query: string): Promise<Location[]>;
  addLocation(name: string): Promise<Location | null>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
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
}

export const storage = new DatabaseStorage();
