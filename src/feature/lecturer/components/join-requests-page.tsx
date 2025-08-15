import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
// import { Checkbox } from '@/components/ui/checkbox';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Clock,
  UserPlus,
  Check,
  X,
  User,
  Key,
  BookOpen,
  ArrowUpDown,
  Zap,
  Camera,
} from 'lucide-react';
import { toast } from 'sonner';
import type { GetLecturerJoinRequestsReturnType } from 'convex/schema';
import type { Id } from 'convex/_generated/dataModel';
import StudentBindingModal from './StudentBindingModal';
import AutoMatchModal from './AutoMatchModal';
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
  const [isAutoMatchModalOpen, setIsAutoMatchModalOpen] = useState(false);
  const [selectedCourseForAutoMatch, setSelectedCourseForAutoMatch] = useState<{
    courseId: Id<'courses'>;
    courseName: string;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedRejectReason, setSelectedRejectReason] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const isMobile = useIsMobile();

  // Common rejection reasons for join requests
  const COMMON_REJECTION_REASONS = [
    'Student not enrolled in this course',
    'Course capacity has been reached',
    'Registration period has ended',
    'Student does not meet prerequisites',
    'Duplicate request - already enrolled',
  ];

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

  // Group requests by course and sort within each group
  const groupedRequests = useMemo(() => {
    const groups = lecturerJoinRequests.reduce(
      (acc, request) => {
        const courseKey = `${request.courseId}-${request.course.courseName}`;
        if (!acc[courseKey]) {
          acc[courseKey] = {
            course: request.course,
            requests: [],
          };
        }
        acc[courseKey].requests.push(request);
        return acc;
      },
      {} as Record<
        string,
        {
          course: GetLecturerJoinRequestsReturnType[number]['course'];
          requests: GetLecturerJoinRequestsReturnType;
        }
      >,
    );

    // Sort requests within each group by creation time
    Object.values(groups).forEach((group) => {
      group.requests.sort(
        (
          a: GetLecturerJoinRequestsReturnType[number],
          b: GetLecturerJoinRequestsReturnType[number],
        ) => {
          const timeA = new Date(a._creationTime).getTime();
          const timeB = new Date(b._creationTime).getTime();
          return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
        },
      );
    });

    return groups;
  }, [lecturerJoinRequests, sortOrder]);

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

  const handleRejectReasonChange = (value: string) => {
    setSelectedRejectReason(value);
    if (value === 'custom') {
      setRejectReason('');
    } else {
      setRejectReason(value);
    }
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
      setSelectedRejectReason('');
    } catch (error) {
      toast.error('Failed to reject request', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleAutoMatch = (courseId: Id<'courses'>, courseName: string) => {
    setSelectedCourseForAutoMatch({ courseId, courseName });
    setIsAutoMatchModalOpen(true);
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
      {/* Sort Controls */}
      {lecturerJoinRequests.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Sort by time:</span>
              </div>
              <Select
                value={sortOrder}
                onValueChange={(value: 'newest' | 'oldest') =>
                  setSortOrder(value)
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requests Grid or Empty State */}
      {lecturerJoinRequests.length === 0 ? (
        <EmptyRequestsState />
      ) : (
        <Accordion
          type="multiple"
          className="space-y-4"
          defaultValue={Object.keys(groupedRequests)}
        >
          {Object.entries(groupedRequests).map(([courseKey, group]) => (
            <AccordionItem
              key={courseKey}
              value={courseKey}
              className="border-0 shadow-sm rounded-lg"
            >
              <AccordionTrigger className="hover:no-underline hover:bg-muted/30 px-6 py-4 rounded-t-lg">
                <div className="flex items-center justify-between w-full mr-4">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <h3 className="text-lg font-semibold">
                        {group.course.courseName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {group.course.courseCode}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAutoMatch(
                          group.course._id,
                          group.course.courseName,
                        );
                      }}
                      className="flex items-center gap-2"
                      disabled={group.requests.length === 0}
                    >
                      <Zap className="h-4 w-4" />
                      Auto Match
                    </Button>
                    <Badge variant="secondary" className="px-3 py-1">
                      {group.requests.length} request
                      {group.requests.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="grid gap-3 md:gap-4">
                  {group.requests.map((request) => (
                    <Card
                      key={request._id}
                      className="border shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-r from-background to-muted/30"
                    >
                      <CardContent className="p-3 md:p-4">
                        <div className="space-y-4">
                          {/* Student Info */}
                          <div className="flex items-start md:items-center justify-between gap-3">
                            <div className="flex items-start md:items-center space-x-3 min-w-0 flex-1">
                              <div className="relative">
                                <Avatar className="h-10 w-10 md:h-12 md:w-12 ring-2 ring-muted flex-shrink-0">
                                  {request.courseSpecificImageUrl ? (
                                    <img
                                      src={request.courseSpecificImageUrl}
                                      alt={`${request.student.fullName} - Course`}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : request.student.profileImage ? (
                                    <img
                                      src={request.student.profileImage}
                                      alt={request.student.fullName}
                                      className="h-full w-full object-cover opacity-60"
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
                                {/* Course-specific image indicator */}
                                {request.courseSpecificImageUrl && (
                                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                                    <Camera className="h-2 w-2 md:h-3 md:w-3 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                                  <h3 className="font-medium text-sm md:text-base truncate">
                                    {request.student.fullName}
                                  </h3>
                                  <div className="flex items-center gap-2">
                                    {request.student.registrationNumber ? (
                                      <Badge
                                        variant="outline"
                                        className="text-xs px-2 py-0 self-start md:self-auto flex items-center gap-1 font-mono"
                                      >
                                        <User className="h-3 w-3" />
                                        {request.student.registrationNumber}
                                      </Badge>
                                    ) : request.uniqueCode ? (
                                      <Badge
                                        variant="outline"
                                        className="text-xs px-2 py-0 self-start md:self-auto flex items-center gap-1 font-mono"
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
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3 flex-shrink-0" />
                                  {getTimeAgo(
                                    new Date(
                                      request._creationTime,
                                    ).toLocaleString(),
                                  )}
                                </div>
                              </div>
                            </div>
                            <Badge
                              variant={
                                request.status === 'pending'
                                  ? 'secondary'
                                  : 'default'
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
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
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

      {/* Auto Match Modal */}
      {selectedCourseForAutoMatch && (
        <AutoMatchModal
          open={isAutoMatchModalOpen}
          onOpenChange={setIsAutoMatchModalOpen}
          courseId={selectedCourseForAutoMatch.courseId}
          courseName={selectedCourseForAutoMatch.courseName}
          joinRequests={lecturerJoinRequests}
        />
      )}

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
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>Select a reason for rejection</Label>
                  <RadioGroup
                    value={selectedRejectReason}
                    onValueChange={handleRejectReasonChange}
                    className="space-y-2"
                  >
                    {COMMON_REJECTION_REASONS.map((reason, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={reason} id={`reason-${index}`} />
                        <Label
                          htmlFor={`reason-${index}`}
                          className="text-sm font-normal cursor-pointer flex-1"
                        >
                          {reason}
                        </Label>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" id="reason-custom" />
                      <Label
                        htmlFor="reason-custom"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Custom reason
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {selectedRejectReason === 'custom' && (
                  <div className="space-y-2">
                    <Label htmlFor="custom-reject-reason">
                      Custom rejection reason
                    </Label>
                    <Textarea
                      id="custom-reject-reason"
                      placeholder="Provide a custom reason for rejecting this request..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                )}

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
                  setSelectedRejectReason('');
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
              <div className="space-y-3">
                <Label>Select a reason for rejection</Label>
                <RadioGroup
                  value={selectedRejectReason}
                  onValueChange={handleRejectReasonChange}
                  className="space-y-2"
                >
                  {COMMON_REJECTION_REASONS.map((reason, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={reason}
                        id={`desktop-reason-${index}`}
                      />
                      <Label
                        htmlFor={`desktop-reason-${index}`}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {reason}
                      </Label>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="desktop-reason-custom" />
                    <Label
                      htmlFor="desktop-reason-custom"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Custom reason
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {selectedRejectReason === 'custom' && (
                <div className="space-y-2">
                  <Label htmlFor="desktop-custom-reject-reason">
                    Custom rejection reason
                  </Label>
                  <Textarea
                    id="desktop-custom-reject-reason"
                    placeholder="Provide a custom reason for rejecting this request..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                This reason will be shown to the student
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectReason('');
                  setSelectedRejectReason('');
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
