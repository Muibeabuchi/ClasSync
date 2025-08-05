import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className="mobile-tap-feedback border-0 shadow-sm bg-white/80 backdrop-blur-sm">
      <CardContent className="p-3">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-gray-900 truncate mb-0.5">
              {request.course.courseName}
            </h3>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <BookOpen className="h-3 w-3 shrink-0" />
              <span className="truncate">{request.course.courseCode}</span>
            </div>
          </div>
          <Badge
            variant={status.variant}
            className={cn(
              'shrink-0 text-xs px-1.5 py-0.5 font-medium',
              status.color,
              status.bgColor,
              'border-0',
            )}
          >
            <StatusIcon className="h-2.5 w-2.5 mr-1" />
            {status.label}
          </Badge>
        </div>

        {/* Lecturer Info - Compact */}
        <div className="flex items-center gap-2 mb-2 p-1.5 bg-gray-50/50 rounded">
          <Avatar className="h-5 w-5">
            <AvatarImage src={request.lecturer.profileImage} />
            <AvatarFallback className="text-xs bg-gray-200">
              {request.lecturer.fullName
                ?.split(' ')
                .map((n: string) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-700 truncate">
              {request.lecturer.fullName}
            </p>
          </div>
        </div>

        {/* Request Time */}
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <Calendar className="h-3 w-3" />
          <span className="truncate">
            {formatDistanceToNow(new Date(request._creationTime), {
              addSuffix: true,
            })}
          </span>
        </div>

        {/* Rejection Reason - Compact */}
        {request.status === 'rejected' && request.rejectionReason && (
          <div className="p-2 bg-red-50 border border-red-100 rounded mb-2">
            <div className="flex items-start gap-1">
              <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-red-800 mb-0.5">
                  Rejected
                </p>
                <p className="text-xs text-red-700 leading-relaxed break-words">
                  {request.rejectionReason}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions - Compact */}
        <div className="flex gap-2">
          {request.status === 'pending' && (
            <Drawer>
              <DrawerTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="flex-1 h-7 text-xs mobile-tap-feedback hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader className="text-left">
                  <DrawerTitle className="text-lg">
                    Cancel Join Request
                  </DrawerTitle>
                  <DrawerDescription className="text-sm">
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
                  className="flex-1 h-7 text-xs mobile-tap-feedback hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader className="text-left">
                  <DrawerTitle className="text-lg">
                    Delete Join Request
                  </DrawerTitle>
                  <DrawerDescription className="text-sm">
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
          <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
            <CardContent className="text-center py-12">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Join Requests
              </h3>
              <p className="text-sm text-gray-500 mb-6 px-4">
                You haven't made any course join requests yet. Start by browsing
                available courses.
              </p>
              <Button asChild className="mobile-tap-feedback px-6">
                <a href="/dashboard/student/courses">Browse Courses</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Accordion
            type="multiple"
            defaultValue={['pending', 'approved', 'rejected']}
            className="space-y-3"
          >
            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <AccordionItem
                value="pending"
                className="border-0 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-amber-100 rounded-lg">
                      <Clock className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        Pending
                      </h3>
                      <p className="text-xs text-gray-600">
                        {pendingRequests.length} awaiting approval
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="grid grid-cols-1 gap-3">
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
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Approved Requests */}
            {approvedRequests.length > 0 && (
              <AccordionItem
                value="approved"
                className="border-0 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-emerald-100 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        Approved
                      </h3>
                      <p className="text-xs text-gray-600">
                        {approvedRequests.length} requests approved
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="grid grid-cols-1 gap-3">
                    {approvedRequests.map((request) => (
                      <MobileJoinRequestCard
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
                className="border-0 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-red-100 rounded-lg">
                      <XCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        Rejected
                      </h3>
                      <p className="text-xs text-gray-600">
                        {rejectedRequests.length} requests rejected
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="grid grid-cols-1 gap-3">
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
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        )}
      </div>
    </MobilePageContainer>
  );
};

export default MobileJoinRequestsPage;
