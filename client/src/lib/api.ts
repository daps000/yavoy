import { type Ride, type InsertRide, type DriverRating, type Review, type User, type RideContact } from "@shared/schema";
import { getSupabase } from "./supabase";

export type AuthUser = {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
} | null;

async function getAuthHeaders(): Promise<HeadersInit> {
  const supabase = await getSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.access_token) {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`,
    };
  }
  
  return {
    "Content-Type": "application/json",
  };
}

export async function fetchAuthUser(): Promise<AuthUser> {
  const headers = await getAuthHeaders();
  const response = await fetch("/api/auth/user", { headers });
  if (!response.ok) {
    return null;
  }
  return response.json();
}

export async function fetchUserProfile(): Promise<User | null> {
  const headers = await getAuthHeaders();
  const response = await fetch("/api/user/profile", { headers });
  if (!response.ok) {
    return null;
  }
  return response.json();
}

export async function updateUserPhone(phone: string): Promise<User> {
  const headers = await getAuthHeaders();
  const response = await fetch("/api/user/phone", {
    method: "PUT",
    headers,
    body: JSON.stringify({ phone }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update phone");
  }
  
  return response.json();
}

export async function updateUserProfile(data: { firstName?: string; lastName?: string; phone?: string }): Promise<User> {
  const headers = await getAuthHeaders();
  const response = await fetch("/api/user/profile", {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al guardar el perfil");
  }
  
  return response.json();
}

export async function recordRideContact(rideId: number, driverProfileId: number): Promise<RideContact> {
  const headers = await getAuthHeaders();
  const response = await fetch("/api/ride-contacts", {
    method: "POST",
    headers,
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
  const headers = await getAuthHeaders();
  const response = await fetch("/api/pending-reviews", { headers });
  if (!response.ok) {
    return [];
  }
  return response.json();
}

export async function markContactReviewed(contactId: number): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/ride-contacts/${contactId}/reviewed`, {
    method: "PUT",
    headers,
  });
  
  if (!response.ok) {
    throw new Error("Failed to mark contact as reviewed");
  }
}

export type RidesResponse = {
  rides: Ride[];
  filtered: boolean;
  homeTown?: string;
  totalCount?: number;
  nearbyCount?: number;
};

export async function fetchRides(showAll: boolean = false): Promise<RidesResponse> {
  const headers = await getAuthHeaders();
  const url = showAll ? "/api/rides?all=true" : "/api/rides";
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error("Failed to fetch rides");
  }
  return response.json();
}

export async function updateUserHomeLocation(homeTown: string): Promise<User> {
  const headers = await getAuthHeaders();
  const response = await fetch("/api/user/home-location", {
    method: "PUT",
    headers,
    body: JSON.stringify({ homeTown }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error al actualizar ubicación");
  }
  
  return response.json();
}

export async function fetchMyRides(): Promise<Ride[]> {
  const headers = await getAuthHeaders();
  const response = await fetch("/api/my-rides", { headers });
  if (!response.ok) {
    return [];
  }
  return response.json();
}

export async function updateRide(id: number, data: Partial<InsertRide>): Promise<Ride> {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/rides/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update ride");
  }
  
  return response.json();
}

export async function deleteRide(id: number): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/rides/${id}`, {
    method: "DELETE",
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete ride");
  }
}

export async function createRide(ride: InsertRide): Promise<Ride> {
  const headers = await getAuthHeaders();
  const response = await fetch("/api/rides", {
    method: "POST",
    headers,
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
}): Promise<Review> {
  const headers = await getAuthHeaders();
  const response = await fetch("/api/reviews", {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create review");
  }
  
  return response.json();
}

export async function checkCanReview(driverProfileId: number): Promise<boolean> {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/reviews/can-review?driverProfileId=${driverProfileId}`, { headers });
  if (!response.ok) {
    return false;
  }
  const data = await response.json();
  return data.canReview;
}
