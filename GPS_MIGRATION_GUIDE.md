# GPS Attendance System - Migration Guide

## Overview

This guide helps developers understand the changes made to the GPS attendance system and how to work with the new implementation.

## Key Changes

### 1. Standardized GPS Hook Usage

**Before**: Mixed usage of `useOptimizedGPS` and `useGeolocated`
**After**: Consistent use of `react-geolocated` across all components

```tsx
// OLD - Don't use this anymore
const { coords, isTracking } = useOptimizedGPS({
  enableTracking: hasActiveSessions,
  onLocationUpdate: handleLocationUpdate,
});

// NEW - Use this pattern
const {
  isGeolocationAvailable,
  isGeolocationEnabled,
  coords,
  positionError,
  getPosition,
} = useGeolocated({
  positionOptions: {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 30000,
  },
  userDecisionTimeout: 10000,
  suppressLocationOnMount: !hasActiveSessions,
  watchPosition: hasActiveSessions,
  onSuccess: handleLocationSuccess,
  onError: handleLocationError,
});
```

### 2. GPS Status Management

**Before**: Manual GPS status checking
**After**: Centralized GPS status utility

```tsx
// OLD - Manual status checking
const gpsReady =
  isGeolocationAvailable && isGeolocationEnabled && !positionError;

// NEW - Use shared utility
import { createGPSStatus } from '@/utils/gps';

const gpsStatus = createGPSStatus(
  isGeolocationAvailable,
  isGeolocationEnabled,
  positionError,
  customError,
  hasActiveSessions,
  coords,
);
```

### 3. Distance Calculation

**Before**: Duplicate distance calculation functions
**After**: Shared utility function

```tsx
// OLD - Don't duplicate this
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  // Haversine formula implementation...
};

// NEW - Import from shared utility
import { calculateDistance, formatDistance } from '@/utils/gps';

const distance = calculateDistance(lat1, lon1, lat2, lon2);
const formattedDistance = formatDistance(distance);
```

## Component-Specific Changes

### Lecturer Components

- **AttendanceSessionModal**: Enhanced GPS validation before session creation
- **Session controls**: Disabled when GPS not ready
- **Error handling**: Comprehensive GPS error messages

### Student Components

- **Attendance buttons**: Only functional when GPS enabled
- **Distance validation**: Warnings shown but don't block attendance
- **Error recovery**: Retry mechanisms for GPS errors

## New Utilities

### GPS Utilities (`src/utils/gps.ts`)

```tsx
import {
  calculateDistance,
  formatDistance,
  getGPSErrorMessage,
  createGPSStatus,
  type GPSStatus,
} from '@/utils/gps';

// Calculate distance between coordinates
const distance = calculateDistance(lat1, lon1, lat2, lon2);

// Format distance for display
const formatted = formatDistance(1500); // "1.5km"

// Get user-friendly error message
const errorMsg = getGPSErrorMessage(positionError);

// Create comprehensive GPS status
const status = createGPSStatus(
  isGeolocationAvailable,
  isGeolocationEnabled,
  positionError,
  customError,
  hasActiveSessions,
  coords,
);
```

## Best Practices

### 1. GPS Status Checking

Always use the `createGPSStatus` utility for consistent status checking:

```tsx
const gpsStatus = createGPSStatus(
  isGeolocationAvailable,
  isGeolocationEnabled,
  positionError,
  customError,
  hasActiveSessions,
  coords,
);

// Use status properties
if (!gpsStatus.isReady) {
  // Handle GPS not ready
}

if (gpsStatus.hasError) {
  // Show error message: gpsStatus.errorMessage
}
```

### 2. Error Handling

Implement comprehensive error handling:

```tsx
const handleLocationError = (error: GeolocationPositionError) => {
  const errorMessage = getGPSErrorMessage(error);
  setCustomError(errorMessage);

  toast.error('Location Error', {
    description: errorMessage,
  });
};
```

### 3. User Feedback

Provide clear feedback for GPS states:

```tsx
// For lecturers - prevent invalid actions
<Button disabled={!gpsStatus.isReady} onClick={handleStartSession}>
  {!gpsStatus.isReady ? 'Enable GPS to Start' : 'Start Session'}
</Button>;

// For students - show helpful messages
{
  gpsStatus.hasError && (
    <div className="error-display">
      <p>{gpsStatus.errorMessage}</p>
      <Button onClick={retryGPS}>Try Again</Button>
    </div>
  );
}
```

## Testing

### Unit Tests

Test GPS utilities with the provided test suite:

```bash
npm test src/utils/__tests__/gps.test.ts
```

### Integration Testing

Test GPS functionality in components:

```tsx
// Mock useGeolocated for testing
jest.mock('react-geolocated', () => ({
  useGeolocated: jest.fn(() => ({
    isGeolocationAvailable: true,
    isGeolocationEnabled: true,
    coords: { latitude: 40.7128, longitude: -74.006 },
    positionError: null,
    getPosition: jest.fn(),
  })),
}));
```

## Common Issues and Solutions

### Issue: GPS not working in development

**Solution**: Ensure you're using HTTPS or localhost for GPS access

### Issue: Distance calculation errors

**Solution**: Use the shared `calculateDistance` utility which handles edge cases

### Issue: Inconsistent GPS states

**Solution**: Use `createGPSStatus` utility for consistent state management

### Issue: Students can't take attendance

**Solution**: Check GPS status and provide clear error messages with retry options

## Migration Checklist

- [ ] Replace `useOptimizedGPS` with `useGeolocated`
- [ ] Update GPS status checking to use `createGPSStatus`
- [ ] Replace duplicate distance calculations with shared utility
- [ ] Add proper error handling for GPS failures
- [ ] Test GPS functionality on HTTPS/localhost
- [ ] Verify attendance flow works with GPS enabled/disabled
- [ ] Update any custom GPS-related components

## Support

If you encounter issues during migration:

1. Check the GPS utilities tests for expected behavior
2. Verify GPS permissions in browser settings
3. Test on HTTPS or localhost for GPS access
4. Review the comprehensive error messages for guidance

This migration improves reliability, consistency, and user experience of the GPS-based attendance system.
