import { useState, useEffect, useCallback, useRef } from 'react';
import { useGeolocated } from 'react-geolocated';
import { calculateDistance, createGPSStatus } from '@/utils/gps';

interface AttendanceSession {
  _id: string;
  status: string;
  location?: {
    lat: number;
    long: number;
  };
  radius?: number;
}

interface UseAttendanceGPSOptions {
  session: AttendanceSession | null;
  enabled?: boolean;
}

export const useAttendanceGPS = ({
  session,
  enabled = true,
}: UseAttendanceGPSOptions) => {
  const [distance, setDistance] = useState<number | null>(null);
  const [isWithinRange, setIsWithinRange] = useState(false);
  const [lastCalculationTime, setLastCalculationTime] = useState<number>(0);

  // Track session changes to force GPS refresh
  const sessionIdRef = useRef<string | null>(null);
  const hasActiveSession = session?.status === 'active';
  const sessionLocation = session?.location;
  const sessionRadius = session?.radius || 100;

  // Calculate distance and range status
  const calculateDistanceAndRange = useCallback(
    (coords: GeolocationCoordinates) => {
      if (!coords || !sessionLocation || !hasActiveSession) {
        setDistance(null);
        setIsWithinRange(false);
        return;
      }

      const calculatedDistance = calculateDistance(
        coords.latitude,
        coords.longitude,
        sessionLocation.lat,
        sessionLocation.long,
      );

      setDistance(calculatedDistance);
      setIsWithinRange(calculatedDistance <= sessionRadius);
      setLastCalculationTime(Date.now());

      console.log('GPS calculation updated:', {
        distance: calculatedDistance,
        withinRange: calculatedDistance <= sessionRadius,
        sessionId: session?._id,
        timestamp: new Date().toISOString(),
      });
    },
    [sessionLocation, sessionRadius, hasActiveSession, session?._id],
  );

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
      maximumAge: 5000, // Reduce cache time for more frequent updates
    },
    userDecisionTimeout: 10000,
    suppressLocationOnMount: !enabled,
    watchPosition: enabled && hasActiveSession,
    onSuccess: (position) => {
      if (hasActiveSession && enabled) {
        calculateDistanceAndRange(position.coords);
      }
    },
    onError: (error) => {
      console.error('GPS error:', error);
      setDistance(null);
      setIsWithinRange(false);
    },
  });

  // Effect to handle session changes and force GPS refresh
  useEffect(() => {
    const currentSessionId = session?._id || null;

    // If session changed, reset state and force new GPS reading
    if (sessionIdRef.current !== currentSessionId) {
      console.log('🔄 Session changed, resetting GPS state:', {
        oldSession: sessionIdRef.current,
        newSession: currentSessionId,
        hasActiveSession,
        sessionStatus: session?.status,
      });

      sessionIdRef.current = currentSessionId;
      setDistance(null);
      setIsWithinRange(false);
      setLastCalculationTime(0);

      // Force fresh GPS reading for new active session
      if (
        hasActiveSession &&
        enabled &&
        isGeolocationAvailable &&
        isGeolocationEnabled
      ) {
        console.log('🎯 Forcing fresh GPS reading for new active session');
        setTimeout(() => {
          getPosition();
        }, 100); // Small delay to ensure state is updated
      }
    }
  }, [
    session?._id,
    hasActiveSession,
    enabled,
    isGeolocationAvailable,
    isGeolocationEnabled,
    getPosition,
  ]);

  // Effect to calculate distance when coords or session data changes
  useEffect(() => {
    if (coords && hasActiveSession && sessionLocation && enabled) {
      console.log('📍 Calculating distance with current coordinates');
      calculateDistanceAndRange(coords);
    } else if (!hasActiveSession) {
      console.log('🚫 No active session, resetting distance state');
      setDistance(null);
      setIsWithinRange(false);
    }
  }, [
    coords,
    hasActiveSession,
    sessionLocation,
    enabled,
    calculateDistanceAndRange,
  ]);

  // Additional effect to handle when session becomes active while user is on page
  useEffect(() => {
    if (
      hasActiveSession &&
      enabled &&
      !coords &&
      isGeolocationAvailable &&
      isGeolocationEnabled
    ) {
      console.log(
        '🔄 Session is active but no coordinates, requesting position',
      );
      // Small delay to avoid rapid successive calls
      const timer = setTimeout(() => {
        getPosition();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [
    hasActiveSession,
    enabled,
    coords,
    isGeolocationAvailable,
    isGeolocationEnabled,
    getPosition,
  ]);

  // Force GPS refresh function
  const refreshGPS = useCallback(() => {
    if (isGeolocationAvailable && isGeolocationEnabled) {
      console.log('Manually refreshing GPS position');
      getPosition();
    }
  }, [isGeolocationAvailable, isGeolocationEnabled, getPosition]);

  // GPS status
  const gpsStatus = createGPSStatus(
    isGeolocationAvailable,
    isGeolocationEnabled,
    positionError,
    null,
    hasActiveSession,
    coords || null,
  );

  // Check if GPS calculation seems stuck (no update in 30 seconds)
  const isCalculationStale =
    lastCalculationTime > 0 &&
    hasActiveSession &&
    coords &&
    sessionLocation &&
    Date.now() - lastCalculationTime > 30000;

  return {
    // GPS state
    coords,
    distance,
    isWithinRange,
    gpsStatus,

    // Session state
    hasActiveSession,
    sessionLocation,
    sessionRadius,

    // Actions
    refreshGPS,
    getPosition,

    // Debug info
    lastCalculationTime,
    isCalculationStale,
  };
};
