import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  AlertCircle,
  //  GraduationCap,
  X,
  Loader2,
} from 'lucide-react';
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
import { useMediaQuery } from '@/hooks/use-media-query';
// import type { Doc } from 'convex/_generated/dataModel';
import type {
  GetLecturerClassListWithStudentsReturnType,
  GetLecturerJoinRequestsReturnType,
} from 'convex/schema';
import type { Id } from 'convex/_generated/dataModel';
import { Input } from '@/components/ui/input';

// interface Student {
//   id: string;
//   name: string;
//   regNumber: string;
//   gender: 'Male' | 'Female';
//   isBound?: boolean;
// }

// interface ClassList {
//   id: string;
//   name: string;
//   batchYear: string;
//   department: string;
//   faculty: string;
//   students: Student[];
// }

// interface JoinRequest {
//   id: string;
//   student: {
//     name: string;
//     regNumber: string;
//     email: string;
//     profileImage?: string;
//     department: string;
//     yearLevel: string;
//     batchYear?: string;
//   };
//   courseId: string;
//   courseName: string;
// }

interface StudentBindingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: GetLecturerJoinRequestsReturnType[number] | null;
  classListsWithStudents:
    | GetLecturerClassListWithStudentsReturnType
    | undefined
    | null;
  onBindAndApprove: (value: {
    // requestId: string;
    selectedStudentId: Id<'classListStudents'>;
    classListId: Id<'classLists'>;
  }) => Promise<void>;
  loadingClassListWithAvailableStudents: boolean;
}

const StudentBindingModal = ({
  open,
  onOpenChange,
  onBindAndApprove,
  request,
  classListsWithStudents,
  loadingClassListWithAvailableStudents,
}: StudentBindingModalProps) => {
  const [selectedStudentId, setSelectedStudentId] =
    useState<Id<'classListStudents'> | null>(null);
  const [selectedClassListId, setSelectedClassListId] =
    useState<Id<'classLists'> | null>(null);
  const [isBinding, setIsBinding] = useState(false);

  const isDesktop = useMediaQuery('(min-width: 768px)');

  const handleStudentSelect = (
    studentId: Id<'classListStudents'>,
    classListId: Id<'classLists'>,
  ) => {
    // Prevent selection changes while binding is in progress
    if (isBinding) return;

    setSelectedStudentId(studentId);
    setSelectedClassListId(classListId);
  };

  const handleBindAndApprove = async () => {
    if (
      !selectedStudentId ||
      !selectedClassListId ||
      !classListsWithStudents ||
      isBinding
    ) {
      return;
    }

    try {
      setIsBinding(true);
      await onBindAndApprove({
        selectedStudentId,
        classListId: selectedClassListId,
      });

      // Reset selections only on success
      setSelectedStudentId(null);
      setSelectedClassListId(null);
      // Close modal on success
      onOpenChange(false);
    } catch (error) {
      // Keep selections on error so user can retry
      console.error('Failed to bind student:', error);
    } finally {
      setIsBinding(false);
    }
  };

  const handleCancel = () => {
    // Prevent closing while binding is in progress
    if (isBinding) return;

    setSelectedStudentId(null);
    setSelectedClassListId(null);
    onOpenChange(false);
  };

  // Prevent modal from closing by clicking outside or pressing escape while binding
  const handleOpenChange = (newOpen: boolean) => {
    if (isBinding && !newOpen) return; // Prevent closing while binding
    onOpenChange(newOpen);
  };

  // Show loading skeleton while data is being fetched
  if (
    loadingClassListWithAvailableStudents ||
    request === undefined
    // ||
    // classListsWithStudents === null ||
    // classListsWithStudents === undefined
  ) {
    return <StudentBindingModalSkeleton isDesktop={isDesktop} />;
  }

  if (!request) return null;

  const content = (
    <>
      {/* Student Request Details */}
      <StudentRequestCard request={request} />

      <Separator className="my-4 md:my-6" />

      {/* ClassList Selection */}
      {classListsWithStudents?.length === 0 ? (
        <NoMatchesCard />
      ) : classListsWithStudents ? (
        <ClassListSelection
          classListsWithStudents={classListsWithStudents}
          selectedStudentId={selectedStudentId}
          selectedClassListId={selectedClassListId}
          onStudentSelect={handleStudentSelect}
          isBinding={isBinding}
        />
      ) : null}
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="max-w-4xl max-h-[90vh] overflow-hidden"
          onPointerDownOutside={(e) => {
            // Prevent closing by clicking outside while binding
            if (isBinding) {
              e.preventDefault();
            }
          }}
          onEscapeKeyDown={(e) => {
            // Prevent closing with escape key while binding
            if (isBinding) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isBinding && (
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              )}
              Match Student to ClassList
            </DialogTitle>
            <DialogDescription>
              Bind{' '}
              <strong className="text-primary">
                {request.student.fullName}
              </strong>{' '}
              to an existing student entry in your class lists
            </DialogDescription>
          </DialogHeader>

          <div
            className={`space-y-6 overflow-y-auto max-h-[60vh] ${isBinding ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {content}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isBinding}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBindAndApprove}
              disabled={
                !selectedStudentId ||
                classListsWithStudents?.length === 0 ||
                isBinding
              }
            >
              {isBinding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Binding...
                </>
              ) : (
                'Bind & Approve'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="max-h-[95vh]">
        <DrawerHeader className="text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isBinding ? (
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              ) : (
                <Users className="h-5 w-5 text-primary" />
              )}
              <DrawerTitle className="text-lg">Match Student</DrawerTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="h-8 w-8"
              disabled={isBinding}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DrawerDescription className="text-sm">
            Bind {request.student.fullName} to an existing student entry
          </DrawerDescription>
        </DrawerHeader>

        <div
          className={`flex-1 overflow-y-auto px-4 pb-4 ${isBinding ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <div className="space-y-4">{content}</div>
        </div>

        <DrawerFooter className="pt-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
              disabled={isBinding}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBindAndApprove}
              disabled={
                !selectedStudentId ||
                classListsWithStudents?.length === 0 ||
                isBinding
              }
              className="flex-1"
            >
              {isBinding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Binding...
                </>
              ) : (
                'Bind & Approve'
              )}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

// Student Request Card Component
const StudentRequestCard = ({
  request,
}: {
  request: GetLecturerJoinRequestsReturnType[number];
}) => (
  <Card className="border-primary/20 w-full bg-primary/5">
    {/* <CardHeader className="pb-2 px-3 md:px-6">
      <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
        Join Request Details
      </CardTitle>
    </CardHeader> */}
    <CardContent className="px-3 md:px-6">
      <div className="flex items-start space-x-2 md:space-x-3">
        <div className="flex-1 min-w-0 space-y-1.5 md:space-y-2">
          <div>
            <h4 className="font-medium text-foreground text-sm md:text-base truncate leading-tight">
              {request.student.fullName}
            </h4>
            <div className="text-xl font-bold  text-primary  flex items-center gap-1 mt-0.5">
              {(request.student.registrationNumber || request.uniqueCode) && (
                <>
                  <span className="text-muted-foreground text-xs">
                    {request.student.registrationNumber
                      ? 'Registration Number:'
                      : 'Unique Code:'}
                  </span>
                  <span className="truncate font-mono">
                    {request.student.registrationNumber || request.uniqueCode}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="space-y-1 text-xs">
            <div className="space-y-0.5 flex items-center gap-x-2">
              <span className="text-muted-foreground text-xs">Email:</span>
              <p className="font-medium truncate text-xs md:text-sm">
                {request.student.email}
              </p>
            </div>
            <div className="space-y-0.5 flex gap-x-2 items-center">
              <span className="text-muted-foreground text-xs">Course:</span>
              <p className="font-medium truncate text-xs md:text-sm">
                {request.course.courseName}
              </p>
            </div>
          </div>
        </div>
        <Avatar className="h-8 w-8 md:h-10 md:w-10 ring-1 ring-primary/20 flex-shrink-0">
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
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
              {request.student.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          )}
        </Avatar>
      </div>
    </CardContent>
  </Card>
);

// No Matches Card Component
const NoMatchesCard = () => (
  <Card className="border-destructive/20 bg-destructive/5">
    <CardContent className="pt-6">
      <div className="text-center space-y-2">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
        <h3 className="font-semibold text-destructive text-sm md:text-base">
          No Available Matches
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground max-w-md mx-auto">
          Could&apos;t find any unbound students in your class lists. You may
          need to upload a new class list or reject this request.
        </p>
      </div>
    </CardContent>
  </Card>
);

// ClassList Selection Component
const ClassListSelection = ({
  classListsWithStudents,
  selectedStudentId,
  selectedClassListId,
  onStudentSelect,
  isBinding = false,
}: {
  classListsWithStudents: GetLecturerClassListWithStudentsReturnType;
  selectedStudentId: Id<'classListStudents'> | null;
  selectedClassListId: Id<'classLists'> | null;
  onStudentSelect: (
    studentId: Id<'classListStudents'>,
    classListId: Id<'classLists'>,
  ) => void;
  isBinding?: boolean;
}) => {
  const [filterTerm, setFilterTerm] = useState('');

  // Filter class lists to only show those with students matching the filter term
  const filteredClassLists =
    classListsWithStudents?.filter((classList) => {
      if (!filterTerm.trim()) return true; // Show all if no filter

      // Check if any student in this class list matches the filter
      return classList.classListStudents.some((student) => {
        const regNumber =
          student.student.studentRegistrationNumber?.toLowerCase() || '';
        const name = student.student.studentName?.toLowerCase() || '';
        const searchTerm = filterTerm.toLowerCase().trim();

        return regNumber.includes(searchTerm) || name.includes(searchTerm);
      });
    }) || [];

  // Further filter students within each class list
  const getFilteredStudents = (
    classList: GetLecturerClassListWithStudentsReturnType[number],
  ) => {
    if (!filterTerm.trim()) return classList.classListStudents;

    return classList.classListStudents.filter((student) => {
      const regNumber =
        student.student.studentRegistrationNumber?.toLowerCase() || '';
      const name = student.student.studentName?.toLowerCase() || '';
      const searchTerm = filterTerm.toLowerCase().trim();

      return regNumber.includes(searchTerm) || name.includes(searchTerm);
    });
  };

  return (
    <>
      <div className="space-y-4 pb-5">
        <h3 className="font-semibold text-foreground text-sm md:text-base">
          Select ClassList Entry to Bind
        </h3>
        <Input
          onChange={(e) => setFilterTerm(e.target.value)}
          value={filterTerm}
          placeholder="Search by Registration/Unique number or Name"
          disabled={isBinding}
        />

        {filteredClassLists.length === 0 && filterTerm.trim() ? (
          <Card className="border-muted-foreground/20 bg-muted/5">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <AlertCircle className="h-6 w-6 text-muted-foreground mx-auto" />
                <p className="text-xs md:text-sm text-muted-foreground">
                  No students found matching "{filterTerm}"
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <RadioGroup
            value={`${selectedClassListId}-${selectedStudentId}`}
            onValueChange={(value) => {
              const [classListId, classListStudentId] = value.split('-');
              onStudentSelect(
                classListStudentId as Id<'classListStudents'>,
                classListId as Id<'classLists'>,
              );
            }}
          >
            {filteredClassLists.map((classList) => {
              const filteredStudents = getFilteredStudents(classList);

              if (filteredStudents.length === 0) return null;
              return (
                <Card key={classList._id} className=" border-border/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm md:text-base flex items-center gap-2 min-w-0">
                        <span className="text-base">📚</span>
                        <span className="truncate">
                          {classList.classListName}
                        </span>
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className="text-xs flex-shrink-0"
                      >
                        {filteredStudents.length}{' '}
                        {filteredStudents.length === 1 ? 'match' : 'matches'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {filteredStudents.map((student) => (
                      <div
                        key={student._id}
                        className="flex items-center space-x-3 p-2 md:p-3 rounded-lg border border-border/30 hover:bg-accent/50 transition-colors"
                      >
                        <RadioGroupItem
                          value={`${classList._id}-${student._id}`}
                          id={`${classList._id}-${student._id}`}
                          className="flex-shrink-0"
                        />
                        <Avatar className="h-6 w-6 md:h-8 md:w-8 flex-shrink-0">
                          <AvatarFallback className="text-xs">
                            {student.student.studentName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <Label
                          htmlFor={`${classList._id}-${student._id}`}
                          className="flex-1 cursor-pointer min-w-0"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-xs md:text-sm truncate">
                                {student.student.studentName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {student.student.studentRegistrationNumber}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className="text-xs flex-shrink-0"
                            >
                              {student.student.studentGender}
                            </Badge>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </RadioGroup>
        )}
      </div>
    </>
  );
};

// Loading Skeleton Component
export const StudentBindingModalSkeleton = ({
  isDesktop,
}: {
  isDesktop: boolean;
}) => {
  const skeletonContent = (
    <div className="space-y-4 md:space-y-6">
      {/* Student Request Details Skeleton */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            <Skeleton className="h-4 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-3 md:space-x-4">
            <Skeleton className="h-10 w-10 md:h-12 md:w-12 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="space-y-1">
                <Skeleton className="h-4 md:h-5 w-32 md:w-40" />
                <div className="flex items-center gap-1">
                  <Skeleton className="h-3 w-3 rounded" />
                  <Skeleton className="h-3 md:h-4 w-20 md:w-24" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="space-y-1">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 md:h-4 w-28 md:w-32" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-3 w-16 md:w-20" />
                  <Skeleton className="h-3 md:h-4 w-24 md:w-28" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Separator />

      {/* ClassList Selection Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-5 md:h-6 w-40 md:w-52" />

        {/* Multiple ClassList Cards */}
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index} className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 md:h-5 w-4 md:w-6" />
                  <Skeleton className="h-4 md:h-5 w-24 md:w-32" />
                </div>
                <Skeleton className="h-4 md:h-5 w-12 md:w-16 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Student entries skeleton */}
              {Array.from({ length: 3 }).map((_, studentIndex) => (
                <div
                  key={studentIndex}
                  className="flex items-center space-x-3 p-2 md:p-3 rounded-lg border border-border/30"
                >
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-6 w-6 md:h-8 md:w-8 rounded-full" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Skeleton className="h-3 md:h-4 w-20 md:w-28" />
                        <Skeleton className="h-3 w-16 md:w-20" />
                      </div>
                      <Skeleton className="h-4 md:h-5 w-10 md:w-12 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-6 w-48" />
            </DialogTitle>
            <DialogDescription>
              <Skeleton className="h-4 w-80" />
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[60vh] px-6">
            {skeletonContent}
          </div>

          <DialogFooter className="gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-32" />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open>
      <DrawerContent className="max-h-[95vh]">
        <DrawerHeader className="text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-8 w-8 rounded" />
          </div>
          <Skeleton className="h-4 w-48 mt-2" />
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {skeletonContent}
        </div>

        <DrawerFooter className="pt-4">
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default StudentBindingModal;
