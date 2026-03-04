import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRideSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { z } from "zod";
import { requireAuth, optionalAuth, upsertUserFromSupabase } from "./supabaseAuth";
import { supabaseAdmin } from "./supabase";
import { geocodeTown } from "./geocode";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Supabase config endpoint for client
  app.get("/api/config/supabase", (req, res) => {
    let siteUrl: string | undefined;
    if (process.env.NODE_ENV === "production") {
      const host = req.get("host");
      if (host) {
        siteUrl = `https://${host}`;
      }
    } else if (process.env.REPLIT_DEV_DOMAIN) {
      siteUrl = `https://${process.env.REPLIT_DEV_DOMAIN}`;
    }
    
    res.json({
      url: process.env.SUPABASE_URL,
      anonKey: process.env.SUPABASE_ANON_KEY,
      siteUrl,
    });
  });

  // Get current user from Supabase token
  app.get("/api/auth/user", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.json(null);
      }

      const token = authHeader.split(' ')[1];
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      
      if (error || !user) {
        return res.json(null);
      }

      // Upsert user in our database
      await upsertUserFromSupabase(user.id, user.email, user.user_metadata);

      // Get user profile from our database
      const profile = await storage.getUser(user.id);

      return res.json({
        id: user.id,
        email: user.email,
        firstName: profile?.firstName || user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0] || null,
        lastName: profile?.lastName || user.user_metadata?.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || null,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.json(null);
    }
  });
  
  // Get user profile (including phone)
  app.get("/api/user/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const profile = await storage.getUser(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ error: "No se pudo cargar el perfil" });
    }
  });
  
  // Update user phone
  app.put("/api/user/phone", requireAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const { phone } = req.body;
      
      if (!phone || phone.trim().length < 9) {
        return res.status(400).json({ error: "Número de teléfono no válido" });
      }
      
      const updatedUser = await storage.updateUserPhone(userId, phone.trim());
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user phone:", error);
      res.status(500).json({ error: "No se pudo actualizar el teléfono" });
    }
  });
  
  // Update user profile (name and phone)
  app.put("/api/user/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const { firstName, lastName, phone } = req.body;
      
      const updatedUser = await storage.updateUserProfile(userId, {
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
        phone: phone?.trim() || null,
      });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ error: "No se pudo actualizar el perfil" });
    }
  });
  
  // Update user home location
  app.put("/api/user/home-location", requireAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const { homeTown } = req.body;
      
      if (!homeTown || homeTown.trim().length < 2) {
        return res.status(400).json({ error: "Nombre de localidad no válido" });
      }
      
      const geocoded = await geocodeTown(homeTown.trim());
      if (!geocoded) {
        return res.status(400).json({ error: "No se pudo localizar esta población" });
      }
      
      const updatedUser = await storage.updateUserHomeLocation(
        userId, homeTown.trim(), geocoded.lat, geocoded.lng
      );
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating home location:", error);
      res.status(500).json({ error: "No se pudo actualizar la ubicación" });
    }
  });

  // Record ride contact (when user clicks "Contactar")
  app.post("/api/ride-contacts", requireAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const { rideId, driverProfileId } = req.body;
      
      if (!rideId || !driverProfileId) {
        return res.status(400).json({ error: "Faltan datos del viaje" });
      }
      
      const existing = await storage.findRideContact(userId, rideId);
      if (existing) {
        return res.status(200).json(existing);
      }
      
      const contact = await storage.createRideContact({
        userId,
        rideId,
        driverProfileId,
      });
      
      res.status(201).json(contact);
    } catch (error) {
      console.error("Error recording ride contact:", error);
      res.status(500).json({ error: "No se pudo registrar el contacto" });
    }
  });
  
  // Get pending review contacts for current user
  app.get("/api/pending-reviews", requireAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const pendingContacts = await storage.getPendingReviewContacts(userId);
      res.json(pendingContacts);
    } catch (error) {
      console.error("Error fetching pending reviews:", error);
      res.status(500).json({ error: "No se pudieron cargar las valoraciones pendientes" });
    }
  });
  
  // Mark contact as reviewed
  app.put("/api/ride-contacts/:id/reviewed", requireAuth, async (req, res) => {
    try {
      const contactId = parseInt(req.params.id);
      if (isNaN(contactId)) {
        return res.status(400).json({ error: "ID de contacto no válido" });
      }
      await storage.markContactReviewed(contactId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking contact as reviewed:", error);
      res.status(500).json({ error: "No se pudo marcar como valorado" });
    }
  });

  // Get all rides (with optional proximity filtering for logged-in users)
  app.get("/api/rides", optionalAuth, async (req, res) => {
    try {
      const allRides = await storage.getAllRides();
      const showAll = req.query.all === "true";
      
      const userProfile = req.userId ? await storage.getUser(req.userId) : null;
      
      if (!showAll && userProfile?.homeLatitude != null && userProfile?.homeLongitude != null) {
        const { haversineDistance } = await import("./geocode");
        const RADIUS_KM = 30;
        
        const nearbyRides = allRides.filter(ride => {
          if (ride.originLat == null || ride.originLng == null) return true;
          const distance = haversineDistance(
            userProfile.homeLatitude!, userProfile.homeLongitude!,
            ride.originLat, ride.originLng
          );
          return distance <= RADIUS_KM;
        });
        
        return res.json({ 
          rides: nearbyRides, 
          filtered: true, 
          homeTown: userProfile.homeTown,
          totalCount: allRides.length,
          nearbyCount: nearbyRides.length,
        });
      }
      
      res.json({ rides: allRides, filtered: false, homeTown: userProfile?.homeTown || undefined });
    } catch (error) {
      console.error("Error fetching rides:", error);
      res.status(500).json({ error: "No se pudieron cargar los viajes" });
    }
  });

  // Create a new ride (requires authentication for ownership tracking)
  app.post("/api/rides", requireAuth, async (req, res) => {
    try {
      const validation = insertRideSchema.safeParse(req.body);
      
      if (!validation.success) {
        const error = fromZodError(validation.error);
        return res.status(400).json({ error: error.message });
      }

      const userId = req.userId!;
      
      const driverProfile = await storage.getOrCreateDriverProfile(
        userId,
        validation.data.driverName
      );

      const userProfile = await storage.getUser(userId);
      if (userProfile && !userProfile.phone && validation.data.contact) {
        await storage.updateUserPhone(userId, validation.data.contact);
      }

      let originLat: number | undefined;
      let originLng: number | undefined;
      
      const geocoded = await geocodeTown(validation.data.origin);
      if (geocoded) {
        originLat = geocoded.lat;
        originLng = geocoded.lng;
        
        if (userProfile && !userProfile.homeLatitude) {
          storage.updateUserHomeLocation(userId, validation.data.origin, geocoded.lat, geocoded.lng).catch(err => {
            console.error("Error auto-setting home location:", err);
          });
        }
      }

      const ride = await storage.createRide({
        ...validation.data,
        originLat: originLat ?? null,
        originLng: originLng ?? null,
        driverProfileId: driverProfile.id,
        userId,
      } as any);
      
      await Promise.all([
        storage.addLocation(validation.data.origin),
        storage.addLocation(validation.data.destination),
      ]);

      res.status(201).json(ride);
    } catch (error) {
      console.error("Error creating ride:", error);
      res.status(500).json({ error: "No se pudo crear el viaje. Inténtalo de nuevo." });
    }
  });

  // Get user's own rides
  app.get("/api/my-rides", requireAuth, async (req, res) => {
    try {
      const userId = req.userId!;
      const userRides = await storage.getUserRides(userId);
      res.json(userRides);
    } catch (error) {
      console.error("Error fetching user rides:", error);
      res.status(500).json({ error: "No se pudieron cargar tus viajes" });
    }
  });

  // Update user's ride
  app.put("/api/rides/:id", requireAuth, async (req, res) => {
    try {
      const rideId = parseInt(req.params.id);
      if (isNaN(rideId)) {
        return res.status(400).json({ error: "ID de viaje no válido" });
      }

      const userId = req.userId!;

      const validation = insertRideSchema.partial().safeParse(req.body);
      if (!validation.success) {
        const error = fromZodError(validation.error);
        return res.status(400).json({ error: error.message });
      }

      const updatedRide = await storage.updateRide(rideId, userId, validation.data);
      if (!updatedRide) {
        return res.status(404).json({ error: "Viaje no encontrado o no tienes permiso" });
      }

      res.json(updatedRide);
    } catch (error) {
      console.error("Error updating ride:", error);
      res.status(500).json({ error: "No se pudo actualizar el viaje" });
    }
  });

  // Delete user's ride
  app.delete("/api/rides/:id", requireAuth, async (req, res) => {
    try {
      const rideId = parseInt(req.params.id);
      if (isNaN(rideId)) {
        return res.status(400).json({ error: "ID de viaje no válido" });
      }

      const userId = req.userId!;

      const deleted = await storage.deleteRide(rideId, userId);
      if (!deleted) {
        return res.status(404).json({ error: "Viaje no encontrado o no tienes permiso" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting ride:", error);
      res.status(500).json({ error: "No se pudo eliminar el viaje" });
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
      res.status(500).json({ error: "No se pudieron buscar ubicaciones" });
    }
  });

  // Get driver rating
  app.get("/api/drivers/:id/rating", async (req, res) => {
    try {
      const driverProfileId = parseInt(req.params.id);
      if (isNaN(driverProfileId)) {
        return res.status(400).json({ error: "ID de conductor no válido" });
      }
      const rating = await storage.getDriverRating(driverProfileId);
      res.json(rating);
    } catch (error) {
      console.error("Error fetching driver rating:", error);
      res.status(500).json({ error: "No se pudo cargar la valoración del conductor" });
    }
  });

  // Get driver reviews
  app.get("/api/drivers/:id/reviews", async (req, res) => {
    try {
      const driverProfileId = parseInt(req.params.id);
      if (isNaN(driverProfileId)) {
        return res.status(400).json({ error: "ID de conductor no válido" });
      }
      const limit = parseInt(req.query.limit as string) || 5;
      const reviews = await storage.getDriverReviews(driverProfileId, limit);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching driver reviews:", error);
      res.status(500).json({ error: "No se pudieron cargar las valoraciones" });
    }
  });

  // Create a new review (requires authentication)
  const createReviewSchema = z.object({
    driverProfileId: z.number(),
    stars: z.number().min(1).max(5),
    comment: z.string().optional(),
  });

  app.post("/api/reviews", requireAuth, async (req, res) => {
    try {
      const validation = createReviewSchema.safeParse(req.body);
      
      if (!validation.success) {
        const error = fromZodError(validation.error);
        return res.status(400).json({ error: error.message });
      }

      const { driverProfileId, stars, comment } = validation.data;
      const reviewerUserId = req.userId!;

      if (stars < 3 && (!comment || comment.trim().length === 0)) {
        return res.status(400).json({ error: "Se requiere un comentario para valoraciones menores a 3 estrellas" });
      }

      const canReview = await storage.canUserReview(driverProfileId, reviewerUserId);
      if (!canReview) {
        return res.status(400).json({ error: "Ya has valorado a este conductor recientemente" });
      }

      const review = await storage.createReview({
        driverProfileId,
        stars,
        comment: comment || null,
        reviewerUserId,
      });

      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ error: "No se pudo crear la valoración" });
    }
  });

  // Check if user can review (requires authentication)
  app.get("/api/reviews/can-review", requireAuth, async (req, res) => {
    try {
      const driverProfileId = parseInt(req.query.driverProfileId as string);
      
      if (isNaN(driverProfileId)) {
        return res.status(400).json({ error: "Faltan parámetros" });
      }

      const canReview = await storage.canUserReview(driverProfileId, req.userId!);
      res.json({ canReview });
    } catch (error) {
      console.error("Error checking review eligibility:", error);
      res.status(500).json({ error: "No se pudo verificar si puedes valorar" });
    }
  });

  return httpServer;
}
