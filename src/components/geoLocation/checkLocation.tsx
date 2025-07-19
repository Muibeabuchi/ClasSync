import { useGeolocated as useGeolocate } from 'react-geolocated';
import { Button } from '../ui/button';
import { useCreateAttendanceSession } from '@/feature/attendance/api';

export function CheckLocation() {
  const {
    coords,
    isGeolocationAvailable,
    // isGeolocationEnabled
    positionError,
    getPosition,
  } = useGeolocate({
    positionOptions: {
      enableHighAccuracy: true,
    },
    userDecisionTimeout: 5000,
    suppressLocationOnMount: true,
    onSuccess: (position) => {
      console.log('Location success:', position);
      createAttendance.mutateAsync({
        gpsCoordinates: {
          lat: position.coords.latitude,
          long: position.coords.longitude,
        },
        courseId: '265r778y9u9u289u9',
        requireCode: false,
      });
    },
    onError: (error) => {
      console.log('Location error:', error);
    },
  });
  //   console.log({ isGeolocationAvailable });
  const createAttendance = useCreateAttendanceSession();
  console.log({ positionError });
  return (
    <>
      <p>isGeoLocationAvailable: {isGeolocationAvailable ? 'TRUE' : 'FALSE'}</p>
      <div>{JSON.stringify(coords, null, 2)}</div>

      <Button variant="secondary" onClick={getPosition}>
        Get Position
      </Button>
    </>
  );
}
