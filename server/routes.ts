import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRideSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

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

      const ride = await storage.createRide(validation.data);
      
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

  return httpServer;
}
