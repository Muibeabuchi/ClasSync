import { useState, useEffect, useCallback, useRef } from 'react';
import { useGeolocated } from 'react-geolocated';

interface UseOptimizedGPSOptions {
  enableTracking: boolean; // Only track when needed
  onLocationUpdate?: (coords: GeolocationCoordinates) => void;
  onError?: (error: GeolocationPositionError) => void;
}

interface GPSState {
  isGeolocationAvailable: boolean;
  isGeolocationEnabled: boolean;
  coords: GeolocationCoordinates | null;
  positionError: GeolocationPositionError | null;
  isTracking: boolean;
  getPosition: () => void;
}

export const useOptimizedGPS = ({
  enableTracking,
  onLocationUpdate,
  onError,
}: UseOptimizedGPSOptions): GPSState => {
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const UPDATE_THROTTLE = 5000; // Update every 5 seconds max

  // Use react-geolocated only when tracking is enabled
  const {
    isGeolocationAvailable,
    isGeolocationEnabled,
    coords,
    getPosition,
    positionError,
  } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 30000,
    },
    userDecisionTimeout: 10000,
    suppressLocationOnMount: !enableTracking,
    watchPosition: false, // We'll handle watching manually
    onSuccess: (position) => {
      const now = Date.now();
      // Throttle updates to avoid excessive calculations
      if (now - lastUpdateRef.current > UPDATE_THROTTLE) {
        lastUpdateRef.current = now;
        onLocationUpdate?.(position.coords);
      }
    },
    onError: (error) => {
      console.error('GPS error:', error);
      onError?.(error);
    },
  });

  // Start/stop GPS tracking based on enableTracking flag
  useEffect(() => {
    if (!enableTracking) {
      // Stop tracking when not needed
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
        setIsTracking(false);
      }
      return;
    }

    // Start tracking when needed and GPS is available
    if (
      enableTracking &&
      isGeolocationAvailable &&
      isGeolocationEnabled &&
      !positionError &&
      watchIdRef.current === null
    ) {
      setIsTracking(true);

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const now = Date.now();
          if (now - lastUpdateRef.current > UPDATE_THROTTLE) {
            lastUpdateRef.current = now;
            onLocationUpdate?.(position.coords);
          }
        },
        (error) => {
          console.error('GPS watch error:', error);
          onError?.(error);
          setIsTracking(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000,
        },
      );
    }

    // Cleanup on unmount or when tracking is disabled
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
        setIsTracking(false);
      }
    };
  }, [
    enableTracking,
    isGeolocationAvailable,
    isGeolocationEnabled,
    positionError,
    onLocationUpdate,
    onError,
  ]);

  return {
    isGeolocationAvailable,
    isGeolocationEnabled,
    coords,
    positionError,
    isTracking,
    getPosition,
  };
};
