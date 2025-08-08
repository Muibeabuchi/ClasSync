import {
  calculateDistance,
  formatDistance,
  getGPSErrorMessage,
  createGPSStatus,
} from '../gps';

describe('GPS Utilities', () => {
  describe('calculateDistance', () => {
    it('calculates distance between two coordinates correctly', () => {
      // Test with known coordinates (NYC to LA)
      const distance = calculateDistance(40.7128, -74.006, 34.0522, -118.2437);
      expect(distance).toBeCloseTo(3944000, -3); // ~3944 km in meters
    });

    it('returns 0 for identical coordinates', () => {
      const distance = calculateDistance(40.7128, -74.006, 40.7128, -74.006);
      expect(distance).toBe(0);
    });

    it('calculates short distances accurately', () => {
      // Test with coordinates ~100m apart
      const distance = calculateDistance(40.7128, -74.006, 40.7138, -74.006);
      expect(distance).toBeCloseTo(111, 0); // ~111 meters
    });
  });

  describe('formatDistance', () => {
    it('formats meters correctly', () => {
      expect(formatDistance(50)).toBe('50m');
      expect(formatDistance(999)).toBe('999m');
    });

    it('formats kilometers correctly', () => {
      expect(formatDistance(1000)).toBe('1.0km');
      expect(formatDistance(1500)).toBe('1.5km');
      expect(formatDistance(2345)).toBe('2.3km');
    });
  });

  describe('getGPSErrorMessage', () => {
    it('returns correct message for permission denied', () => {
      const error = { code: 1 } as GeolocationPositionError;
      expect(getGPSErrorMessage(error)).toContain('permission denied');
    });

    it('returns correct message for position unavailable', () => {
      const error = { code: 2 } as GeolocationPositionError;
      expect(getGPSErrorMessage(error)).toContain('unavailable');
    });

    it('returns correct message for timeout', () => {
      const error = { code: 3 } as GeolocationPositionError;
      expect(getGPSErrorMessage(error)).toContain('timeout');
    });

    it('returns default message for unknown error', () => {
      const error = { code: 999 } as GeolocationPositionError;
      expect(getGPSErrorMessage(error)).toContain(
        'Unable to get your location',
      );
    });
  });

  describe('createGPSStatus', () => {
    it('creates correct status when GPS is ready', () => {
      const status = createGPSStatus(
        true, // isGeolocationAvailable
        true, // isGeolocationEnabled
        null, // positionError
        null, // customError
        true, // hasActiveSessions
        { latitude: 40.7128, longitude: -74.006 } as GeolocationCoordinates, // coords
      );

      expect(status.isReady).toBe(true);
      expect(status.hasError).toBe(false);
      expect(status.isTracking).toBe(true);
    });

    it('creates correct status when GPS is not available', () => {
      const status = createGPSStatus(
        false, // isGeolocationAvailable
        false, // isGeolocationEnabled
        null, // positionError
        null, // customError
        true, // hasActiveSessions
        null, // coords
      );

      expect(status.isReady).toBe(false);
      expect(status.hasError).toBe(false);
      expect(status.isTracking).toBe(false);
    });

    it('creates correct status with error', () => {
      const error = { code: 1 } as GeolocationPositionError;
      const status = createGPSStatus(
        true, // isGeolocationAvailable
        true, // isGeolocationEnabled
        error, // positionError
        null, // customError
        true, // hasActiveSessions
        null, // coords
      );

      expect(status.isReady).toBe(false);
      expect(status.hasError).toBe(true);
      expect(status.errorMessage).toContain('permission denied');
    });
  });
});
