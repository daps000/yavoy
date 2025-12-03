import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, hashContact } from "./storage";
import { insertRideSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Get all rides
  app.get("/api/rides", async (req, res) => {
    try {
      const rides = await storage.getAllRides();
      res.json(rides);
    } catch (error) {
      console.error("Error fetching rides:", error);
      res.status(500).json({ error: "Failed to fetch rides" });
    }
  });

  // Create a new ride
  app.post("/api/rides", async (req, res) => {
    try {
      const validation = insertRideSchema.safeParse(req.body);
      
      if (!validation.success) {
        const error = fromZodError(validation.error);
        return res.status(400).json({ error: error.message });
      }

      const driverProfile = await storage.getOrCreateDriverProfile(
        validation.data.driverName,
        validation.data.contact
      );

      const ride = await storage.createRide({
        ...validation.data,
        driverProfileId: driverProfile.id,
      } as any);
      
      await Promise.all([
        storage.addLocation(validation.data.origin),
        storage.addLocation(validation.data.destination),
      ]);

      res.status(201).json(ride);
    } catch (error) {
      console.error("Error creating ride:", error);
      res.status(500).json({ error: "Failed to create ride" });
    }
  });

  // Search locations
  app.get("/api/locations", async (req, res) => {
    try {
      const query = req.query.q as string || "";
      const locations = await storage.searchLocations(query);
      res.json(locations.map(l => l.name));
    } catch (error) {
      console.error("Error searching locations:", error);
      res.status(500).json({ error: "Failed to search locations" });
    }
  });

  // Get driver rating
  app.get("/api/drivers/:id/rating", async (req, res) => {
    try {
      const driverProfileId = parseInt(req.params.id);
      if (isNaN(driverProfileId)) {
        return res.status(400).json({ error: "Invalid driver ID" });
      }
      const rating = await storage.getDriverRating(driverProfileId);
      res.json(rating);
    } catch (error) {
      console.error("Error fetching driver rating:", error);
      res.status(500).json({ error: "Failed to fetch driver rating" });
    }
  });

  // Get driver reviews
  app.get("/api/drivers/:id/reviews", async (req, res) => {
    try {
      const driverProfileId = parseInt(req.params.id);
      if (isNaN(driverProfileId)) {
        return res.status(400).json({ error: "Invalid driver ID" });
      }
      const limit = parseInt(req.query.limit as string) || 5;
      const reviews = await storage.getDriverReviews(driverProfileId, limit);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching driver reviews:", error);
      res.status(500).json({ error: "Failed to fetch driver reviews" });
    }
  });

  // Create a new review
  const createReviewSchema = z.object({
    driverProfileId: z.number(),
    stars: z.number().min(1).max(5),
    comment: z.string().optional(),
    reviewerContact: z.string().min(9),
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const validation = createReviewSchema.safeParse(req.body);
      
      if (!validation.success) {
        const error = fromZodError(validation.error);
        return res.status(400).json({ error: error.message });
      }

      const { driverProfileId, stars, comment, reviewerContact } = validation.data;

      if (stars < 3 && (!comment || comment.trim().length === 0)) {
        return res.status(400).json({ error: "Se requiere un comentario para valoraciones menores a 3 estrellas" });
      }

      const canReview = await storage.canUserReview(driverProfileId, reviewerContact);
      if (!canReview) {
        return res.status(400).json({ error: "Ya has valorado a este conductor recientemente" });
      }

      const review = await storage.createReview({
        driverProfileId,
        stars,
        comment: comment || null,
        reviewerContactHash: hashContact(reviewerContact),
      });

      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  // Check if user can review
  app.get("/api/reviews/can-review", async (req, res) => {
    try {
      const driverProfileId = parseInt(req.query.driverProfileId as string);
      const reviewerContact = req.query.reviewerContact as string;
      
      if (isNaN(driverProfileId) || !reviewerContact) {
        return res.status(400).json({ error: "Missing parameters" });
      }

      const canReview = await storage.canUserReview(driverProfileId, reviewerContact);
      res.json({ canReview });
    } catch (error) {
      console.error("Error checking review eligibility:", error);
      res.status(500).json({ error: "Failed to check review eligibility" });
    }
  });

  return httpServer;
}
