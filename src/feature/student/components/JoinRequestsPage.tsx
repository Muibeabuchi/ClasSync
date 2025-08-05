import React from 'react';
import {
  Card,
  CardContent,
  // CardDescription,
  CardHeader,
  // CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
  // User,
  Calendar,
  AlertTriangle,
  // ChevronDown,
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
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          variant: 'secondary' as const,
          label: 'Pending',
        };
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          variant: 'default' as const,
          label: 'Approved',
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          variant: 'destructive' as const,
          label: 'Rejected',
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          variant: 'secondary' as const,
          label: 'Unknown',
        };
    }
  };

  const status = getStatusInfo();
  const StatusIcon = status.icon;

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border shadow-sm  backdrop-blur-sm relative">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm  truncate mb-1">
              {request.course.courseName}
            </h3>
            <div className="flex items-center gap-1.5 text-xs ">
              <BookOpen className="h-3 w-3 shrink-0" />
              <span className="truncate">{request.course.courseCode}</span>
            </div>
          </div>
          <Badge
            variant={status.variant}
            className={cn(
              'shrink-0 text-xs px-2 py-0.5 font-medium',
              status.color,
              status.bgColor,
              'border-0',
            )}
          >
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>
        </div>

        {/* Lecturer Info - Compact */}
        <div className="flex items-center gap-2 mb-3 p-2 border rounded-md">
          <Avatar className="h-6 w-6">
            <AvatarImage src={request.lecturer.profileImage} />
            <AvatarFallback className="text-xs ">
              {request.lecturer.fullName
                ?.split(' ')
                .map((n: string) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium  truncate">
              {request.lecturer.fullName}
            </p>
          </div>
        </div>

        {/* Request Time */}
        <div className="flex items-center gap-1.5 text-xs  mb-3">
          <Calendar className="h-3 w-3" />
          <span>
            {formatDistanceToNow(new Date(request._creationTime), {
              addSuffix: true,
            })}
          </span>
        </div>

        {/* Rejection Reason - Compact */}
        {request.status === 'rejected' && request.rejectionReason && (
          <div className="p-2 bg-red-50 border border-red-100 rounded-md mb-3">
            <div className="flex items-start gap-1.5">
              <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-red-800 mb-0.5">
                  Rejected
                </p>
                <p className="text-xs text-red-700 leading-relaxed">
                  {request.rejectionReason}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions - Compact */}
        <div className="flex absolute -top-3 -right-3 gap-2 z-9999">
          {request.status === 'pending' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="flex-1 h-8 text-xs  hover:text-red-700"
                >
                  <XCircle className="h-3 w-3 mr-1.5" />
                  {/* Cancel */}
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
                  className="flex-1 h-8 text-xs hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3 mr-1.5" />
                  {/* Delete */}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Pending
                </p>
                <p className="text-3xl font-bold">{pendingRequests.length}</p>
              </div>
              <div className="p-3 bg-muted rounded-xl">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Approved
                </p>
                <p className="text-3xl font-bold">{approvedRequests.length}</p>
              </div>
              <div className="p-3 bg-muted rounded-xl">
                <CheckCircle className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Rejected
                </p>
                <p className="text-3xl font-bold">{rejectedRequests.length}</p>
              </div>
              <div className="p-3 bg-muted rounded-xl">
                <XCircle className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      {joinRequests.length === 0 ? (
        <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
          <CardContent className="text-center py-16">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Join Requests
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              You haven&apos;t made any course join requests yet. Start by
              browsing available courses.
            </p>
            <Button asChild className="px-6 py-2">
              <Link to="/dashboard/student/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Accordion
          type="multiple"
          defaultValue={['pending', 'approved', 'rejected']}
          className="space-y-4"
        >
          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <AccordionItem
              value="pending"
              className="border-0 bg-gradient-to-r rounded-lg"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2  rounded-lg">
                    <Clock className="h-5 w-5 " />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold ">Pending Requests</h3>
                    <p className="text-sm ">
                      {pendingRequests.length} requests awaiting approval
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 py-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Approved Requests */}
          {approvedRequests.length > 0 && (
            <AccordionItem
              value="approved"
              className="border-0 bg-gradient-to-r rounded-lg"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold ">Approved Requests</h3>
                    <p className="text-sm ">
                      {approvedRequests.length} requests approved
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-5">
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
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Rejected Requests */}
          {rejectedRequests.length > 0 && (
            <AccordionItem
              value="rejected"
              className="border-0 bg-gradient-to- rounded-lg"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">Rejected Requests</h3>
                    <p className="text-sm ">
                      {rejectedRequests.length} requests rejected
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 py-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      )}
    </div>
  );
};

export default JoinRequestsPage;
