// Calculate distance between two GPS coordinates in meters
export function calculateDistance({
  lat1,
  lat2,
  lon1,
  lon2,
}: {
  lat1: number;
  lon1: number;
  lat2: number;
  lon2: number;
}): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function generateAttendanceCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
