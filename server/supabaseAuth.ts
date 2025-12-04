import type { RequestHandler } from "express";
import { supabaseAdmin } from "./supabase";
import { storage } from "./storage";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
    }
  }
}

export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const token = authHeader.split(' ')[1];
    
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: "Token inválido" });
    }

    req.userId = user.id;
    req.userEmail = user.email;
    
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ error: "Error de autenticación" });
  }
};

export async function upsertUserFromSupabase(userId: string, email: string | undefined, metadata: any) {
  try {
    await storage.upsertUser({
      id: userId,
      email: email || null,
      firstName: metadata?.first_name || metadata?.full_name?.split(' ')[0] || null,
      lastName: metadata?.last_name || metadata?.full_name?.split(' ').slice(1).join(' ') || null,
    });
  } catch (error) {
    console.error("Error upserting user:", error);
  }
}
