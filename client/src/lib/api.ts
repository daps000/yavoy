import { type Ride, type InsertRide } from "@shared/schema";

export async function fetchRides(): Promise<Ride[]> {
  const response = await fetch("/api/rides");
  if (!response.ok) {
    throw new Error("Failed to fetch rides");
  }
  return response.json();
}

export async function createRide(ride: InsertRide): Promise<Ride> {
  const response = await fetch("/api/rides", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ride),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create ride");
  }
  
  return response.json();
}
