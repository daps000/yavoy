import React, { createContext, useContext, useState, useEffect } from "react";
import { Ride, INITIAL_RIDES } from "./mock-data";

interface RidesContextType {
  rides: Ride[];
  addRide: (ride: Ride) => void;
}

const RidesContext = createContext<RidesContextType | undefined>(undefined);

export function RidesProvider({ children }: { children: React.ReactNode }) {
  // Initialize from localStorage if available, else use INITIAL_RIDES
  const [rides, setRides] = useState<Ride[]>(() => {
    const saved = localStorage.getItem('vavoy_rides');
    return saved ? JSON.parse(saved) : INITIAL_RIDES;
  });

  useEffect(() => {
    localStorage.setItem('vavoy_rides', JSON.stringify(rides));
  }, [rides]);

  const addRide = (ride: Ride) => {
    setRides((prev) => [ride, ...prev]);
  };

  return (
    <RidesContext.Provider value={{ rides, addRide }}>
      {children}
    </RidesContext.Provider>
  );
}

export function useRides() {
  const context = useContext(RidesContext);
  if (context === undefined) {
    throw new Error("useRides must be used within a RidesProvider");
  }
  return context;
}
