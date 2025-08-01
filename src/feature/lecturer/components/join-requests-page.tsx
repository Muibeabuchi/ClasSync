import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Clock, UserPlus, Check, X, User, Key } from 'lucide-react';
import { toast } from 'sonner';
import type { GetLecturerJoinRequestsReturnType } from 'convex/schema';
import type { Id } from 'convex/_generated/dataModel';
import StudentBindingModal from './StudentBindingModal';
import {
  useAcceptJoinRequest,
  useRejectJoinRequest,
} from '@/feature/joinRequest/api';
import { useGetClassListWithAvailableStudents } from '@/feature/classList/api/get-classlist-with-available-students';
import { useIsMobile } from '@/hooks/use-mobile';

interface JoinRequestsPageProps {
  lecturerJoinRequests: GetLecturerJoinRequestsReturnType;
  // lecturerCourses: Doc<'courses'>[];
  // onBack: () => void;
}

const JoinRequestsPage = ({ lecturerJoinRequests }: JoinRequestsPageProps) => {
  const [selectedRequest, setSelectedRequest] = useState<
    GetLecturerJoinRequestsReturnType[number] | null
  >(null);
  const [isBindingModalOpen, setIsBindingModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const isMobile = useIsMobile();

  const {
    data: classListWithStudents,
    isLoading: loadingClassListWithAvailableStudents,
  } = useGetClassListWithAvailableStudents({
    courseId: selectedRequest ? selectedRequest.courseId : null,
  });

  const { mutateAsync: acceptJoinRequest, isPending: isAccepting } =
    useAcceptJoinRequest();
  const { mutateAsync: rejectJoinRequest, isPending: isRejecting } =
    useRejectJoinRequest();

  const handleBindAndApprove = async ({
    selectedStudentId,
    classListId,
  }: {
    selectedStudentId: Id<'classListStudents'>;
    classListId: Id<'classLists'>;
  }) => {
    if (!selectedRequest) return;

    try {
      await acceptJoinRequest({
        classListId,
        classListStudentId: selectedStudentId,
        courseId: selectedRequest.courseId,
        requestId: selectedRequest._id,
        studentId: selectedRequest.studentId,
      });

      toast.success('Student Successfully Matched', {
        description:
          'Student has been bound to the class list and approved for the course.',
      });

      setIsBindingModalOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      toast.error('Failed to approve request', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleAcceptRequest = (
    request: GetLecturerJoinRequestsReturnType[number],
  ) => {
    setSelectedRequest(request);
    setIsBindingModalOpen(true);
  };

  const handleRejectRequest = (
    request: GetLecturerJoinRequestsReturnType[number],
  ) => {
    setSelectedRequest(request);
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedRequest) return;

    try {
      await rejectJoinRequest({
        joinRequestId: selectedRequest._id,
        rejectionReason: rejectReason.trim() || undefined,
      });

      setIsRejectModalOpen(false);
      setSelectedRequest(null);
      setRejectReason('');
    } catch (error) {
      toast.error('Failed to reject request', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  // const openRequestModal = (request: any) => {
  //   setSelectedRequest(request);
  //   // setIsModalOpen(true);
  // };

  // Empty state component
  const EmptyRequestsState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted/50 p-6 mb-4">
        <UserPlus className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No join requests yet</h3>
      <p className="text-muted-foreground mb-6 max-w-sm text-sm">
        When students request to join your courses, their requests will appear
        here for your review and approval.
      </p>
      <div className="text-sm text-muted-foreground">
        <h3 className="text-primary text-md font-semibold ">
          Students can request to join by:
        </h3>
        <ul className="mt-2 space-y-1">
          <li>• Searching for your course using the course code</li>
          <li>• Following invitation links</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center space-x-2 md:space-x-4 min-w-0 flex-1">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold">Join Requests</h1>
              <Badge
                variant="secondary"
                className="size-4 bg-transparent text-foreground border-foreground p-3 ml-2 font-semibold  text-base md:hidden rounded-full border  flex-shrink-0"
              >
                {lecturerJoinRequests.length}
              </Badge>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Review and approve student join requests
            </p>
          </div>
        </div>
        <Badge
          variant="secondary"
          className="hidden md:flex px-3 py-1 flex-shrink-0"
        >
          {lecturerJoinRequests.length} pending
        </Badge>
      </div>
      {/* Course Filter */}
      {/* <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filter by Course</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select course to filter requests" />
            </SelectTrigger>
            <SelectContent>
              {mockCourses.map((course) => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  <div>
                    <p className="font-medium text-sm">{course.name}</p>
                    {course.code && (
                      <p className="text-xs text-muted-foreground">
                        {course.code}
                      </p>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card> */}
      {/* Requests Grid or Empty State */}
      {lecturerJoinRequests.length === 0 ? (
        <EmptyRequestsState />
      ) : (
        <div className="grid gap-3 md:gap-4">
          {lecturerJoinRequests.map((request) => (
            <Card
              key={request._id}
              className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-r from-background to-muted/30"
            >
              <CardContent className="p-3 md:p-4">
                <div className="space-y-4">
                  {/* Student Info */}
                  <div className="flex items-start md:items-center justify-between gap-3">
                    <div className="flex items-start md:items-center space-x-3 min-w-0 flex-1">
                      <Avatar className="h-10 w-10 md:h-12 md:w-12 ring-2 ring-muted flex-shrink-0">
                        {request.student.profileImage ? (
                          <img
                            src={request.student.profileImage}
                            alt={request.student.fullName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <AvatarFallback className="text-xs md:text-sm font-medium">
                            {request.student.fullName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                          <h3 className="font-medium text-sm md:text-base truncate">
                            {request.student.fullName}
                          </h3>
                          <div className="flex items-center gap-2">
                            {request.student.registrationNumber ? (
                              <Badge
                                variant="outline"
                                className="text-xs px-2 py-0 self-start md:self-auto flex items-center gap-1"
                              >
                                <User className="h-3 w-3" />
                                {request.student.registrationNumber}
                              </Badge>
                            ) : request.uniqueCode ? (
                              <Badge
                                variant="outline"
                                className="text-xs px-2 py-0 self-start md:self-auto flex items-center gap-1"
                              >
                                <Key className="h-3 w-3" />
                                {request.uniqueCode}
                              </Badge>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="text-xs px-2 py-0 self-start md:self-auto"
                              >
                                No ID
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 text-xs text-muted-foreground">
                          <span className="truncate font-medium">
                            {request.course.courseName}
                          </span>
                          <span className="hidden md:inline">•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            {getTimeAgo(
                              new Date(request._creationTime).toLocaleString(),
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        request.status === 'pending' ? 'secondary' : 'default'
                      }
                      className="text-xs rounded-full px-2 py-1 flex-shrink-0 animate-pulse"
                    >
                      {request.status}
                    </Badge>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAcceptRequest(request);
                      }}
                      disabled={isAccepting || isRejecting}
                      className=""
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRejectRequest(request);
                      }}
                      disabled={isAccepting || isRejecting}
                      className=""
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <StudentBindingModal
        open={isBindingModalOpen}
        classListsWithStudents={classListWithStudents}
        loadingClassListWithAvailableStudents={
          loadingClassListWithAvailableStudents
        }
        onBindAndApprove={handleBindAndApprove}
        onOpenChange={setIsBindingModalOpen}
        request={selectedRequest}
      />

      {/* Reject Modal/Drawer */}
      {isMobile ? (
        <Drawer open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Reject Join Request</DrawerTitle>
              <DrawerDescription>
                {selectedRequest && (
                  <>
                    Are you sure you want to reject{' '}
                    <strong>{selectedRequest.student.fullName}</strong>&apos;s
                    request to join{' '}
                    <strong>{selectedRequest.course.courseName}</strong>?
                  </>
                )}
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-4">
              <div className="space-y-2">
                <Label htmlFor="reject-reason">
                  Reason for rejection (optional)
                </Label>
                <Textarea
                  id="reject-reason"
                  placeholder="Provide a reason for rejecting this request..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  This reason will be shown to the student
                </p>
              </div>
            </div>
            <DrawerFooter>
              <Button
                variant="destructive"
                onClick={handleConfirmReject}
                disabled={isRejecting}
              >
                {isRejecting ? 'Rejecting...' : 'Reject Request'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectReason('');
                }}
                disabled={isRejecting}
              >
                Cancel
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Join Request</DialogTitle>
              <DialogDescription>
                {selectedRequest && (
                  <>
                    Are you sure you want to reject{' '}
                    <strong>{selectedRequest.student.fullName}</strong>&apos;s
                    request to join{' '}
                    <strong>{selectedRequest.course.courseName}</strong>?
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reject-reason">
                  Reason for rejection (optional)
                </Label>
                <Textarea
                  id="reject-reason"
                  placeholder="Provide a reason for rejecting this request..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  This reason will be shown to the student
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectReason('');
                }}
                disabled={isRejecting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmReject}
                disabled={isRejecting}
              >
                {isRejecting ? 'Rejecting...' : 'Reject Request'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default JoinRequestsPage;
