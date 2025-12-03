import { type Ride, type InsertRide, type DriverRating, type Review, type User, type RideContact } from "@shared/schema";

export type AuthUser = {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
} | null;

export async function fetchAuthUser(): Promise<AuthUser> {
  const response = await fetch("/api/auth/user");
  if (!response.ok) {
    return null;
  }
  return response.json();
}

export async function fetchUserProfile(): Promise<User | null> {
  const response = await fetch("/api/user/profile");
  if (!response.ok) {
    return null;
  }
  return response.json();
}

export async function updateUserPhone(phone: string): Promise<User> {
  const response = await fetch("/api/user/phone", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phone }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update phone");
  }
  
  return response.json();
}

export async function recordRideContact(rideId: number, driverProfileId: number): Promise<RideContact> {
  const response = await fetch("/api/ride-contacts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rideId, driverProfileId }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to record contact");
  }
  
  return response.json();
}

export type PendingReviewContact = RideContact & { driverName: string | null };

export async function fetchPendingReviews(): Promise<PendingReviewContact[]> {
  const response = await fetch("/api/pending-reviews");
  if (!response.ok) {
    return [];
  }
  return response.json();
}

export async function markContactReviewed(contactId: number): Promise<void> {
  const response = await fetch(`/api/ride-contacts/${contactId}/reviewed`, {
    method: "PUT",
  });
  
  if (!response.ok) {
    throw new Error("Failed to mark contact as reviewed");
  }
}

export async function fetchRides(): Promise<Ride[]> {
  const response = await fetch("/api/rides");
  if (!response.ok) {
    throw new Error("Failed to fetch rides");
  }
  return response.json();
}

export async function fetchMyRides(): Promise<Ride[]> {
  const response = await fetch("/api/my-rides");
  if (!response.ok) {
    return [];
  }
  return response.json();
}

export async function updateRide(id: number, data: Partial<InsertRide>): Promise<Ride> {
  const response = await fetch(`/api/rides/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update ride");
  }
  
  return response.json();
}

export async function deleteRide(id: number): Promise<void> {
  const response = await fetch(`/api/rides/${id}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete ride");
  }
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
