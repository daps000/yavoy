import { type Ride, type InsertRide, type DriverRating, type Review } from "@shared/schema";

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

export async function fetchDriverRating(driverProfileId: number): Promise<DriverRating> {
  const response = await fetch(`/api/drivers/${driverProfileId}/rating`);
  if (!response.ok) {
    throw new Error("Failed to fetch driver rating");
  }
  return response.json();
}

export async function fetchDriverReviews(driverProfileId: number, limit: number = 5): Promise<Review[]> {
  const response = await fetch(`/api/drivers/${driverProfileId}/reviews?limit=${limit}`);
  if (!response.ok) {
    throw new Error("Failed to fetch driver reviews");
  }
  return response.json();
}

export async function createReview(data: {
  driverProfileId: number;
  stars: number;
  comment?: string;
  reviewerContact: string;
}): Promise<Review> {
  const response = await fetch("/api/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create review");
  }
  
  return response.json();
}

export async function checkCanReview(driverProfileId: number, reviewerContact: string): Promise<boolean> {
  const response = await fetch(`/api/reviews/can-review?driverProfileId=${driverProfileId}&reviewerContact=${encodeURIComponent(reviewerContact)}`);
  if (!response.ok) {
    return false;
  }
  const data = await response.json();
  return data.canReview;
}
