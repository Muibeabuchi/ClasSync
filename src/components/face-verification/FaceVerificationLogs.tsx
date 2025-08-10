import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FaceVerificationLogsProps {
  attendanceSessionId: string;
}

export const FaceVerificationLogs: React.FC<FaceVerificationLogsProps> = ({
  attendanceSessionId,
}) => {
  const logs = useQuery(api.faceVerification.getSessionFaceVerificationLogs, {
    attendanceSessionId: attendanceSessionId as any,
  });

  if (logs === undefined) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading verification logs...</span>
        </CardContent>
      </Card>
    );
  }

  if (logs === null || logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Face Verification Logs</span>
          </CardTitle>
          <CardDescription>
            Track face verification attempts for this session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Eye className="h-4 w-4" />
            <AlertDescription>
              No face verification attempts recorded for this session.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Group logs by student
  const logsByStudent = logs.reduce(
    (acc, log) => {
      const key = log.studentId;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(log);
      return acc;
    },
    {} as Record<string, typeof logs>,
  );

  // Calculate statistics
  const totalAttempts = logs.length;
  const successfulAttempts = logs.filter(
    (log) => log.verificationStatus === 'success',
  ).length;
  const failedAttempts = logs.filter(
    (log) => log.verificationStatus === 'failed',
  ).length;
  const fallbackUsed = logs.filter(
    (log) => log.verificationStatus === 'fallback_used',
  ).length;
  const uniqueStudents = Object.keys(logsByStudent).length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'fallback_used':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Verified
          </Badge>
        );
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'fallback_used':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Fallback
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Verification Statistics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {totalAttempts}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Attempts
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {successfulAttempts}
              </div>
              <div className="text-sm text-muted-foreground">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {failedAttempts}
              </div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {fallbackUsed}
              </div>
              <div className="text-sm text-muted-foreground">Fallback Used</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Success Rate:</span>
              <span className="font-medium">
                {totalAttempts > 0
                  ? Math.round((successfulAttempts / totalAttempts) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Students Attempted:</span>
              <span className="font-medium">{uniqueStudents}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Verification Logs</span>
          </CardTitle>
          <CardDescription>
            Detailed face verification attempts by student
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(logsByStudent).map(([studentId, studentLogs]) => {
              const sortedLogs = studentLogs.sort(
                (a, b) =>
                  new Date(b.verificationTimestamp).getTime() -
                  new Date(a.verificationTimestamp).getTime(),
              );
              const latestLog = sortedLogs[0];

              return (
                <div
                  key={studentId}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {latestLog.studentName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {latestLog.studentRegistrationNumber}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(latestLog.verificationStatus)}
                      <span className="text-sm text-muted-foreground">
                        {sortedLogs.length} attempt
                        {sortedLogs.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {sortedLogs.map((log, index) => (
                      <div
                        key={`${log._id}-${index}`}
                        className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded"
                      >
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(log.verificationStatus)}
                          <div className="text-sm">
                            <div className="flex items-center space-x-2">
                              <span>Attempt {log.retryAttempt}</span>
                              {log.matchScore !== undefined && (
                                <span className="text-muted-foreground">
                                  (Score: {(log.matchScore * 100).toFixed(1)}%)
                                </span>
                              )}
                            </div>
                            {log.fallbackReason && (
                              <div className="text-xs text-muted-foreground">
                                {log.fallbackReason}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(
                            new Date(log.verificationTimestamp),
                            { addSuffix: true },
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
