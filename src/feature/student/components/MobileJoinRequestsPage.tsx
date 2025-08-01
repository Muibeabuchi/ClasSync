import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  User,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import {
  useGetMyJoinRequests,
  useCancelJoinRequest,
  useDeleteJoinRequest,
} from '../api/join-requests';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { Id } from 'convex/_generated/dataModel';
import MobilePageContainer from '@/components/mobile/MobilePageContainer';

interface MobileJoinRequestCardProps {
  request: any; // Type from API
  onCancel: (requestId: Id<'joinRequests'>) => void;
  onDelete: (requestId: Id<'joinRequests'>) => void;
  isLoading: boolean;
}

const MobileJoinRequestCard: React.FC<MobileJoinRequestCardProps> = ({
  request,
  onCancel,
  onDelete,
  isLoading,
}) => {
  const getStatusInfo = () => {
    switch (request.status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-200',
          variant: 'secondary' as const,
          label: 'Pending',
        };
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
          variant: 'default' as const,
          label: 'Approved',
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
          variant: 'destructive' as const,
          label: 'Rejected',
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
          variant: 'secondary' as const,
          label: 'Unknown',
        };
    }
  };

  const status = getStatusInfo();
  const StatusIcon = status.icon;

  return (
    <Card className={cn('mobile-tap-feedback', status.borderColor)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="mobile-text-lg mb-1 truncate">
              {request.course.courseName}
            </CardTitle>
            <div className="flex items-center gap-2 mobile-text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4 shrink-0" />
              <span className="truncate">{request.course.courseCode}</span>
            </div>
          </div>
          <Badge variant={status.variant} className="shrink-0 mobile-text-xs">
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Lecturer Info */}
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={request.lecturer.profileImage} />
            <AvatarFallback className="mobile-text-xs">
              {request.lecturer.fullName
                ?.split(' ')
                .map((n: string) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="mobile-text-sm font-medium truncate">
              {request.lecturer.fullName}
            </p>
            <p className="mobile-text-xs text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              Lecturer
            </p>
          </div>
        </div>

        {/* Request Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mobile-text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {formatDistanceToNow(new Date(request._creationTime), {
                addSuffix: true,
              })}
            </span>
          </div>

          {request.status === 'rejected' && request.rejectionReason && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="mobile-text-sm font-medium text-red-800">
                    Rejection Reason
                  </p>
                  <p className="mobile-text-sm text-red-700 mt-1 break-words">
                    {request.rejectionReason}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {request.status === 'pending' && (
            <Drawer>
              <DrawerTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="flex-1 mobile-tap-feedback"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  <span className="mobile-text-sm">Cancel</span>
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader className="text-left">
                  <DrawerTitle className="mobile-text-lg">
                    Cancel Join Request
                  </DrawerTitle>
                  <DrawerDescription className="mobile-text-sm">
                    Are you sure you want to cancel your request to join{' '}
                    <strong>{request.course.courseName}</strong>? This action
                    cannot be undone.
                  </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter className="pt-2">
                  <Button
                    onClick={() => onCancel(request._id)}
                    variant="destructive"
                    className="mobile-tap-feedback"
                    disabled={isLoading}
                  >
                    Cancel Request
                  </Button>
                  <DrawerTrigger asChild>
                    <Button variant="outline" className="mobile-tap-feedback">
                      Keep Request
                    </Button>
                  </DrawerTrigger>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          )}

          {(request.status === 'rejected' || request.status === 'approved') && (
            <Drawer>
              <DrawerTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="flex-1 mobile-tap-feedback"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span className="mobile-text-sm">Delete</span>
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader className="text-left">
                  <DrawerTitle className="mobile-text-lg">
                    Delete Join Request
                  </DrawerTitle>
                  <DrawerDescription className="mobile-text-sm">
                    Are you sure you want to delete this request for{' '}
                    <strong>{request.course.courseName}</strong>? This will
                    remove it from your request history.
                  </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter className="pt-2">
                  <Button
                    onClick={() => onDelete(request._id)}
                    variant="destructive"
                    className="mobile-tap-feedback"
                    disabled={isLoading}
                  >
                    Delete Request
                  </Button>
                  <DrawerTrigger asChild>
                    <Button variant="outline" className="mobile-tap-feedback">
                      Keep Request
                    </Button>
                  </DrawerTrigger>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const MobileJoinRequestsPage: React.FC = () => {
  const { data: joinRequests } = useGetMyJoinRequests() || [];
  const isLoading = joinRequests === undefined;
  const { mutateAsync: cancelRequest, isPending: isCancelling } =
    useCancelJoinRequest();
  const { mutateAsync: deleteRequest, isPending: isDeleting } =
    useDeleteJoinRequest();

  const handleCancel = async (requestId: Id<'joinRequests'>) => {
    try {
      await cancelRequest({ requestId });
    } catch {
      // Error handling is done in the hook
    }
  };

  const handleDelete = async (requestId: Id<'joinRequests'>) => {
    try {
      await deleteRequest({ requestId });
    } catch {
      // Error handling is done in the hook
    }
  };

  const pendingRequests = joinRequests.filter(
    (req) => req.status === 'pending',
  );
  const approvedRequests = joinRequests.filter(
    (req) => req.status === 'approved',
  );
  const rejectedRequests = joinRequests.filter(
    (req) => req.status === 'rejected',
  );

  if (isLoading) {
    return (
      <MobilePageContainer
        showHeader
        headerTitle="Join Requests"
        className="bg-gradient-to-b from-background to-muted/20"
      >
        <div className="flex-1 p-4 pt-16 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                  <div className="h-8 bg-muted rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </MobilePageContainer>
    );
  }

  return (
    <MobilePageContainer
      showHeader
      headerTitle="Join Requests"
      className="bg-gradient-to-b from-background to-muted/20"
    >
      <div className="flex-1 p-4 pt-4 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 gap-3">
          <Card className="mobile-tap-feedback">
            <CardContent className="mobile-p-md">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="mobile-text-sm font-medium text-muted-foreground">
                    Pending
                  </p>
                  <p className="mobile-text-xl font-bold">
                    {pendingRequests.length}
                  </p>
                </div>
                <div className="mobile-p-sm bg-muted rounded-xl">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mobile-tap-feedback">
            <CardContent className="mobile-p-md">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="mobile-text-sm font-medium text-muted-foreground">
                    Approved
                  </p>
                  <p className="mobile-text-xl font-bold">
                    {approvedRequests.length}
                  </p>
                </div>
                <div className="mobile-p-sm bg-muted rounded-xl">
                  <CheckCircle className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mobile-tap-feedback">
            <CardContent className="mobile-p-md">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="mobile-text-sm font-medium text-muted-foreground">
                    Rejected
                  </p>
                  <p className="mobile-text-xl font-bold">
                    {rejectedRequests.length}
                  </p>
                </div>
                <div className="mobile-p-sm bg-muted rounded-xl">
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requests List */}
        {joinRequests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="mobile-text-lg font-medium mb-2">
                No Join Requests
              </h3>
              <p className="mobile-text-sm text-muted-foreground mb-6">
                You haven&apos;t made any course join requests yet.
              </p>
              <Button asChild className="mobile-tap-feedback">
                <a href="/dashboard/student/courses">Browse Courses</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div className="space-y-3">
                <h2 className="mobile-text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  Pending ({pendingRequests.length})
                </h2>
                <div className="space-y-3">
                  {pendingRequests.map((request) => (
                    <MobileJoinRequestCard
                      key={request._id}
                      request={request}
                      onCancel={handleCancel}
                      onDelete={handleDelete}
                      isLoading={isCancelling || isDeleting}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Rejected Requests */}
            {rejectedRequests.length > 0 && (
              <div className="space-y-3">
                <h2 className="mobile-text-lg font-semibold flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                  Rejected ({rejectedRequests.length})
                </h2>
                <div className="space-y-3">
                  {rejectedRequests.map((request) => (
                    <MobileJoinRequestCard
                      key={request._id}
                      request={request}
                      onCancel={handleCancel}
                      onDelete={handleDelete}
                      isLoading={isCancelling || isDeleting}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MobilePageContainer>
  );
};

export default MobileJoinRequestsPage;
