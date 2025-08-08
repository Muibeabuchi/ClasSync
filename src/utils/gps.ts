/**
 * GPS and location utilities for attendance system
 */

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in meters
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Format distance for display
 * @param meters Distance in meters
 * @returns Formatted string (e.g., "150m" or "1.2km")
 */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

/**
 * GPS error messages based on error codes
 */
export const getGPSErrorMessage = (error: GeolocationPositionError): string => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Location permission denied. Please enable location access in your browser settings.';
    case error.POSITION_UNAVAILABLE:
      return 'Location information is unavailable. Please check your GPS settings.';
    case error.TIMEOUT:
      return 'Location request timed out. Please try again.';
    default:
      return 'Unable to get your location. Please check your GPS settings and try again.';
  }
};

/**
 * Enhanced GPS status interface
 */
export interface GPSStatus {
  isAvailable: boolean;
  isEnabled: boolean;
  hasError: boolean;
  errorMessage?: string;
  isReady: boolean;
  isTracking: boolean;
}

/**
 * Create GPS status object from useGeolocated hook values
 */
export const createGPSStatus = (
  isGeolocationAvailable: boolean,
  isGeolocationEnabled: boolean,
  positionError: GeolocationPositionError | null,
  customError: string | null,
  hasActiveSessions: boolean,
  coords: GeolocationCoordinates | null,
): GPSStatus => {
  return {
    isAvailable: isGeolocationAvailable,
    isEnabled: isGeolocationEnabled,
    hasError: !!positionError || !!customError,
    errorMessage:
      customError ||
      (positionError ? getGPSErrorMessage(positionError) : undefined),
    isReady:
      isGeolocationAvailable &&
      isGeolocationEnabled &&
      !positionError &&
      !customError,
    isTracking: hasActiveSessions && coords !== null,
  };
};
