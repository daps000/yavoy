import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  phone: varchar("phone"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  normalized: text("normalized").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Location = typeof locations.$inferSelect;

export const driverProfiles = pgTable("driver_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type DriverProfile = typeof driverProfiles.$inferSelect;

export const rides = pgTable("rides", {
  id: serial("id").primaryKey(),
  driverName: text("driver_name").notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  seats: integer("seats").notNull(),
  contact: text("contact").notNull(),
  notes: text("notes"),
  driverProfileId: integer("driver_profile_id"),
  userId: varchar("user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRideSchema = createInsertSchema(rides).omit({
  id: true,
  createdAt: true,
  driverProfileId: true,
  userId: true,
});

export type InsertRide = z.infer<typeof insertRideSchema>;
export type Ride = typeof rides.$inferSelect;

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  driverProfileId: integer("driver_profile_id").notNull(),
  stars: integer("stars").notNull(),
  comment: text("comment"),
  reviewerUserId: varchar("reviewer_user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type DriverRating = {
  averageStars: number;
  totalReviews: number;
};

export const rideContacts = pgTable("ride_contacts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  rideId: integer("ride_id").notNull(),
  driverProfileId: integer("driver_profile_id").notNull(),
  reviewSubmitted: integer("review_submitted").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type RideContact = typeof rideContacts.$inferSelect;
export type InsertRideContact = typeof rideContacts.$inferInsert;
