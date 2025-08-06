import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  UserPlus,
  Check,
  User,
  Key,
  Clock,
  Zap,
  // CheckSquare,
  // Square,
} from 'lucide-react';
import { toast } from 'sonner';
import type { GetLecturerJoinRequestsReturnType } from 'convex/schema';
import type { Id } from 'convex/_generated/dataModel';
import { useBatchAcceptJoinRequests } from '@/feature/joinRequest/api';
import { useIsMobile } from '@/hooks/use-mobile';

interface AutoMatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: Id<'courses'>;
  courseName: string;
  joinRequests: GetLecturerJoinRequestsReturnType;
}

const AutoMatchModal = ({
  open,
  onOpenChange,
  courseId,
  courseName,
  joinRequests,
}: AutoMatchModalProps) => {
  const [selectedRequestIds, setSelectedRequestIds] = useState<Set<string>>(
    new Set(),
  );
  const isMobile = useIsMobile();

  const { mutateAsync: batchAcceptRequests, isPending: isProcessing } =
    useBatchAcceptJoinRequests();

  // Filter requests for this specific course
  const courseRequests = joinRequests.filter(
    (request) => request.courseId === courseId && request.status === 'pending',
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequestIds(new Set(courseRequests.map((req) => req._id)));
    } else {
      setSelectedRequestIds(new Set());
    }
  };

  const handleSelectRequest = (requestId: string, checked: boolean) => {
    const newSelected = new Set(selectedRequestIds);
    if (checked) {
      newSelected.add(requestId);
    } else {
      newSelected.delete(requestId);
    }
    setSelectedRequestIds(newSelected);
  };

  const handleBatchAccept = async () => {
    if (selectedRequestIds.size === 0) {
      toast.error('No requests selected', {
        description: 'Please select at least one request to process.',
      });
      return;
    }

    try {
      const result = await batchAcceptRequests({
        courseId,
        requestIds: Array.from(selectedRequestIds) as Id<'joinRequests'>[],
      });

      // Show summary toast
      const { accepted, alreadyAccepted, noMatch } = result;
      // const totalProcessed =
      //   accepted.length + alreadyAccepted.length + noMatch.length;

      if (accepted.length > 0) {
        toast.success('Auto Match Complete!', {
          description: `${accepted.length} student${accepted.length !== 1 ? 's' : ''} successfully accepted${
            alreadyAccepted.length > 0
              ? `, ${alreadyAccepted.length} already enrolled`
              : ''
          }${
            noMatch.length > 0 ? `, ${noMatch.length} couldn't be matched` : ''
          }.`,
        });
      } else if (alreadyAccepted.length > 0 && noMatch.length === 0) {
        toast.info('All students already enrolled', {
          description: `${alreadyAccepted.length} student${alreadyAccepted.length !== 1 ? 's were' : ' was'} already enrolled in the course.`,
        });
      } else if (noMatch.length > 0) {
        toast.warning("Some students couldn't be matched", {
          description: `${noMatch.length} student${noMatch.length !== 1 ? 's' : ''} couldn't be matched to the class list. Please review manually.`,
        });
      }

      // Reset selection and close modal
      setSelectedRequestIds(new Set());
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to process requests', {
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

  const isAllSelected =
    courseRequests.length > 0 &&
    selectedRequestIds.size === courseRequests.length;
  const isIndeterminate =
    selectedRequestIds.size > 0 &&
    selectedRequestIds.size < courseRequests.length;

  const content = (
    <div className="space-y-4">
      {courseRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="rounded-full bg-muted/50 p-4 mb-4">
            <UserPlus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
          <p className="text-muted-foreground text-sm">
            There are no pending join requests for this course.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                className="data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground"
                {...(isIndeterminate && { 'data-state': 'indeterminate' })}
              />
              <span className="text-sm font-medium">
                Select all ({courseRequests.length} requests)
              </span>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              {selectedRequestIds.size} selected
            </Badge>
          </div>

          <ScrollArea className={''}>
            {isMobile ? (
              // Mobile: Card layout
              <div className="space-y-3">
                {courseRequests.map((request) => (
                  <Card key={request._id} className="border shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={selectedRequestIds.has(request._id)}
                          onCheckedChange={(checked) =>
                            handleSelectRequest(request._id, checked as boolean)
                          }
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                {request.student.profileImage ? (
                                  <img
                                    src={request.student.profileImage}
                                    alt={request.student.fullName}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <AvatarFallback className="text-xs">
                                    {request.student.fullName
                                      .split(' ')
                                      .map((n) => n[0])
                                      .join('')}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">
                                  {request.student.fullName}
                                </p>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {getTimeAgo(
                                    new Date(
                                      request._creationTime,
                                    ).toLocaleString(),
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {request.student.registrationNumber ? (
                              <Badge
                                variant="outline"
                                className="text-xs flex items-center gap-1"
                              >
                                <User className="h-3 w-3" />
                                {request.student.registrationNumber}
                              </Badge>
                            ) : request.uniqueCode ? (
                              <Badge
                                variant="outline"
                                className="text-xs flex items-center gap-1"
                              >
                                <Key className="h-3 w-3" />
                                {request.uniqueCode}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                No ID
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              // Desktop: Table layout
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                        className="data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground"
                        {...(isIndeterminate && {
                          'data-state': 'indeterminate',
                        })}
                      />
                    </TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Identifier</TableHead>
                    <TableHead>Requested</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courseRequests.map((request) => (
                    <TableRow key={request._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRequestIds.has(request._id)}
                          onCheckedChange={(checked) =>
                            handleSelectRequest(request._id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            {request.student.profileImage ? (
                              <img
                                src={request.student.profileImage}
                                alt={request.student.fullName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <AvatarFallback className="text-xs">
                                {request.student.fullName
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <span className="font-medium">
                            {request.student.fullName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {request.student.registrationNumber ? (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 w-fit"
                          >
                            <User className="h-3 w-3" />
                            {request.student.registrationNumber}
                          </Badge>
                        ) : request.uniqueCode ? (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 w-fit"
                          >
                            <Key className="h-3 w-3" />
                            {request.uniqueCode}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">No ID</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {getTimeAgo(
                          new Date(request._creationTime).toLocaleString(),
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>

          {/* {courseRequests.length > 0 && (
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  How Auto Match works:
                </span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                <li>
                  • Students are matched by registration number to your class
                  list
                </li>
                <li>
                  • Students with unique codes are matched to available slots
                </li>
                <li>• Already enrolled students are skipped</li>
                <li>• Unmatched students will need manual review</li>
              </ul>
            </div>
          )} */}
        </>
      )}
    </div>
  );

  const footer = courseRequests.length > 0 && (
    <div className="flex gap-3">
      <Button
        variant="outline"
        onClick={() => onOpenChange(false)}
        disabled={isProcessing}
        className="flex-1"
      >
        Cancel
      </Button>
      <Button
        onClick={handleBatchAccept}
        disabled={selectedRequestIds.size === 0 || isProcessing}
        className="flex-1"
      >
        {isProcessing ? (
          'Processing...'
        ) : (
          <>
            <Check className="h-4 w-4 mr-2" />
            Accept Selected ({selectedRequestIds.size})
          </>
        )}
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Auto Match - {courseName}
            </DrawerTitle>
            <DrawerDescription>
              Select join requests to automatically match and accept into the
              course.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4">{content}</div>
          {footer && <DrawerFooter>{footer}</DrawerFooter>}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Auto Match - {courseName}
          </DialogTitle>
          <DialogDescription>
            Select join requests to automatically match and accept into the
            course.
          </DialogDescription>
        </DialogHeader>
        {content}
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
};

export default AutoMatchModal;
