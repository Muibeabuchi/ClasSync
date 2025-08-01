import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
import { Link } from '@tanstack/react-router';

interface JoinRequestCardProps {
  request: any; // Type from API
  onCancel: (requestId: Id<'joinRequests'>) => void;
  onDelete: (requestId: Id<'joinRequests'>) => void;
  isLoading: boolean;
}

const JoinRequestCard: React.FC<JoinRequestCardProps> = ({
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
    <Card className={cn('transition-all duration-200', status.borderColor)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">
              {request.course.courseName}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {request.course.courseCode}
            </CardDescription>
          </div>
          <Badge variant={status.variant} className="shrink-0">
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Lecturer Info */}
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          <Avatar className="h-8 w-8">
            <AvatarImage src={request.lecturer.profileImage} />
            <AvatarFallback className="text-xs">
              {request.lecturer.fullName
                ?.split(' ')
                .map((n: string) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">{request.lecturer.fullName}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              Lecturer
            </p>
          </div>
        </div>

        {/* Request Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Requested{' '}
              {formatDistanceToNow(new Date(request._creationTime), {
                addSuffix: true,
              })}
            </span>
          </div>

          {request.status === 'rejected' && request.rejectionReason && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Rejection Reason
                  </p>
                  <p className="text-sm text-red-700 mt-1">
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Request
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Join Request</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel your request to join{' '}
                    <strong>{request.course.courseName}</strong>? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Request</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onCancel(request._id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Cancel Request
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {(request.status === 'rejected' || request.status === 'approved') && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Request
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Join Request</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this request for{' '}
                    <strong>{request.course.courseName}</strong>? This will
                    remove it from your request history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Request</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(request._id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Request
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const JoinRequestsPage: React.FC = () => {
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Join Requests</h1>
          <p className="text-muted-foreground">
            Manage your course join requests
          </p>
        </div>
        <div className="grid gap-4">
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Join Requests</h1>
        <p className="text-muted-foreground">
          View and manage your course join requests
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending
                </p>
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Approved
                </p>
                <p className="text-2xl font-bold">{approvedRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Rejected
                </p>
                <p className="text-2xl font-bold">{rejectedRequests.length}</p>
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
            <h3 className="text-lg font-medium mb-2">No Join Requests</h3>
            <p className="text-muted-foreground mb-6">
              You haven&apos;t made any course join requests yet.
            </p>
            <Button asChild>
              <Link to="/dashboard/student/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                Pending Requests ({pendingRequests.length})
              </h2>
              <div className="grid gap-4">
                {pendingRequests.map((request) => (
                  <JoinRequestCard
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

          {/* Approved Requests */}
          {approvedRequests.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Approved Requests ({approvedRequests.length})
              </h2>
              <div className="grid gap-4">
                {approvedRequests.map((request) => (
                  <JoinRequestCard
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
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                Rejected Requests ({rejectedRequests.length})
              </h2>
              <div className="grid gap-4">
                {rejectedRequests.map((request) => (
                  <JoinRequestCard
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
  );
};

export default JoinRequestsPage;
