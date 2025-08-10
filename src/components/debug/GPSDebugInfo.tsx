import { useAttendanceGPS } from '@/hooks/useAttendanceGPS';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, MapPin, Navigation, AlertTriangle } from 'lucide-react';

interface GPSDebugInfoProps {
  session: any;
  className?: string;
}

export const GPSDebugInfo = ({ session, className }: GPSDebugInfoProps) => {
  const {
    coords,
    distance,
    isWithinRange,
    gpsStatus,
    hasActiveSession,
    sessionLocation,
    sessionRadius,
    refreshGPS,
    lastCalculationTime,
    isCalculationStale,
  } = useAttendanceGPS({
    session,
    enabled: true,
  });

  if (!hasActiveSession) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-sm">
            GPS Debug - No Active Session
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">GPS Debug Info</CardTitle>
          <Button size="sm" variant="outline" onClick={refreshGPS}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        {/* Session Info */}
        <div className="space-y-1">
          <div className="font-medium">Session:</div>
          <div className="pl-2 space-y-1">
            <div>ID: {session?._id?.slice(-8) || 'N/A'}</div>
            <div>
              Status:{' '}
              <Badge variant="outline" className="text-xs">
                {session?.status}
              </Badge>
            </div>
            <div>Has Location: {sessionLocation ? '✅' : '❌'}</div>
            <div>Radius: {sessionRadius}m</div>
          </div>
        </div>

        {/* GPS Status */}
        <div className="space-y-1">
          <div className="font-medium">GPS Status:</div>
          <div className="pl-2 space-y-1">
            <div>Available: {gpsStatus.isAvailable ? '✅' : '❌'}</div>
            <div>Enabled: {gpsStatus.isEnabled ? '✅' : '❌'}</div>
            <div>Ready: {gpsStatus.isReady ? '✅' : '❌'}</div>
            <div>Has Error: {gpsStatus.hasError ? '❌' : '✅'}</div>
            {gpsStatus.errorMessage && (
              <div className="text-red-600">
                Error: {gpsStatus.errorMessage}
              </div>
            )}
          </div>
        </div>

        {/* Coordinates */}
        <div className="space-y-1">
          <div className="font-medium">Current Location:</div>
          <div className="pl-2 space-y-1">
            {coords ? (
              <>
                <div>Lat: {coords.latitude.toFixed(6)}</div>
                <div>Long: {coords.longitude.toFixed(6)}</div>
                <div>Accuracy: {coords.accuracy?.toFixed(0)}m</div>
              </>
            ) : (
              <div className="text-gray-500">No coordinates</div>
            )}
          </div>
        </div>

        {/* Session Location */}
        {sessionLocation && (
          <div className="space-y-1">
            <div className="font-medium">Session Location:</div>
            <div className="pl-2 space-y-1">
              <div>Lat: {sessionLocation.lat.toFixed(6)}</div>
              <div>Long: {sessionLocation.long.toFixed(6)}</div>
            </div>
          </div>
        )}

        {/* Distance Calculation */}
        <div className="space-y-1">
          <div className="font-medium">Distance Calculation:</div>
          <div className="pl-2 space-y-1">
            <div>
              Distance:{' '}
              {distance !== null
                ? `${Math.round(distance)}m`
                : 'Calculating...'}
            </div>
            <div>Within Range: {isWithinRange ? '✅' : '❌'}</div>
            <div>
              Last Update:{' '}
              {lastCalculationTime > 0
                ? new Date(lastCalculationTime).toLocaleTimeString()
                : 'Never'}
            </div>
            {isCalculationStale && (
              <div className="text-amber-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Calculation may be stale
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 border-t">
          <div className="flex gap-2">
            <Badge
              variant={hasActiveSession ? 'default' : 'secondary'}
              className="text-xs"
            >
              <Navigation className="h-3 w-3 mr-1" />
              {hasActiveSession ? 'Active Session' : 'No Session'}
            </Badge>
            {distance !== null && (
              <Badge
                variant={isWithinRange ? 'default' : 'destructive'}
                className="text-xs"
              >
                <MapPin className="h-3 w-3 mr-1" />
                {isWithinRange ? 'In Range' : 'Out of Range'}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
