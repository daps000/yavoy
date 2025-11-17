// Geolocation utilities for VAVOY

// Known coordinates for towns in the area (Merindades de Burgos)
const KNOWN_LOCATIONS = {
  // Normalize location names (lowercase, no accents)
  'villarcayo': { lat: 42.9390, lng: -3.5720, name: 'Villarcayo' },
  'villaves': { lat: 42.9700, lng: -3.7192, name: 'Villaves' },
  'soncillo': { lat: 42.9700, lng: -3.7856, name: 'Soncillo' },
  'medina de pomar': { lat: 42.9333, lng: -3.4833, name: 'Medina de Pomar' },
  'medina': { lat: 42.9333, lng: -3.4833, name: 'Medina de Pomar' },

  // Additional towns in Merindades area
  'espinosa de los monteros': { lat: 43.0667, lng: -3.5667, name: 'Espinosa de los Monteros' },
  'espinosa': { lat: 43.0667, lng: -3.5667, name: 'Espinosa de los Monteros' },
  'quincoces de yuso': { lat: 42.9167, lng: -3.5833, name: 'Quincoces de Yuso' },
  'quincoces': { lat: 42.9167, lng: -3.5833, name: 'Quincoces de Yuso' },

  // Valle de Benasque area
  'benasque': { lat: 42.6056, lng: 0.5211, name: 'Benasque' },
  'cerler': { lat: 42.5764, lng: 0.5292, name: 'Cerler' },
  'huesca': { lat: 42.1401, lng: -0.4081, name: 'Huesca' },
  'zaragoza': { lat: 41.6488, lng: -0.8891, name: 'Zaragoza' },
  'barbastro': { lat: 42.0370, lng: 0.1265, name: 'Barbastro' },

  // Major cities
  'burgos': { lat: 42.3439, lng: -3.6970, name: 'Burgos' },
  'bilbao': { lat: 43.2630, lng: -2.9350, name: 'Bilbao' },
  'santander': { lat: 43.4623, lng: -3.8100, name: 'Santander' }
};

/**
 * Normalize location name for lookup
 * @param {string} location - Location name
 * @returns {string} Normalized location name
 */
function normalizeLocation(location) {
  if (!location) return '';

  return location
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remove accents
}

/**
 * Get coordinates for a known location
 * @param {string} location - Location name
 * @returns {object|null} Coordinates {lat, lng, name} or null if not found
 */
function geocodeLocation(location) {
  const normalized = normalizeLocation(location);
  return KNOWN_LOCATIONS[normalized] || null;
}

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  // Validate inputs
  if (!lat1 || !lng1 || !lat2 || !lng2) {
    return null;
  }

  const R = 6371; // Earth's radius in kilometers

  // Convert degrees to radians
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in km

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Get all known locations
 * @returns {object} Dictionary of all known locations
 */
function getAllLocations() {
  return KNOWN_LOCATIONS;
}

/**
 * Check if a location is known
 * @param {string} location - Location name
 * @returns {boolean} True if location is known
 */
function isKnownLocation(location) {
  const normalized = normalizeLocation(location);
  return normalized in KNOWN_LOCATIONS;
}

module.exports = {
  geocodeLocation,
  calculateDistance,
  getAllLocations,
  isKnownLocation,
  normalizeLocation
};
