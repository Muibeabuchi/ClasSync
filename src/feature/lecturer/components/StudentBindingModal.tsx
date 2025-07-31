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
  }) => void;
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

  const isDesktop = useMediaQuery('(min-width: 768px)');

  const handleStudentSelect = (
    studentId: Id<'classListStudents'>,
    classListId: Id<'classLists'>,
  ) => {
    setSelectedStudentId(studentId);
    setSelectedClassListId(classListId);
  };

  const handleBindAndApprove = () => {
    if (!selectedStudentId || !selectedClassListId || !classListsWithStudents) {
      return;
    }

    onBindAndApprove({
      selectedStudentId,
      classListId: selectedClassListId,
    });

    // Reset selections
    setSelectedStudentId(null);
    setSelectedClassListId(null);
  };

  const handleCancel = () => {
    setSelectedStudentId(null);
    setSelectedClassListId(null);
    onOpenChange(false);
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
        />
      ) : null}
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {/* <Users className="h-5 w-5 text-primary" /> */}
              Match Student to ClassList
            </DialogTitle>
            <DialogDescription>
              Bind {request.student.fullName} to an existing student entry in
              your class lists
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 overflow-y-auto max-h-[60vh] px-6">
            {content}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleBindAndApprove}
              disabled={
                !selectedStudentId || classListsWithStudents?.length === 0
              }
            >
              Bind & Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[95vh]">
        <DrawerHeader className="text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <DrawerTitle className="text-lg">Match Student</DrawerTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DrawerDescription className="text-sm">
            Bind {request.student.fullName} to an existing student entry
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-4">{content}</div>
        </div>

        <DrawerFooter className="pt-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleBindAndApprove}
              disabled={
                !selectedStudentId || classListsWithStudents?.length === 0
              }
              className="flex-1"
            >
              Bind & Approve
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
  <Card className="border-primary/20 bg-primary/5">
    <CardHeader className="pb-2 px-3 md:px-6">
      <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
        Join Request Details
      </CardTitle>
    </CardHeader>
    <CardContent className="px-3 md:px-6">
      <div className="flex items-start space-x-2 md:space-x-3">
        <Avatar className="h-8 w-8 md:h-10 md:w-10 ring-1 ring-primary/20 flex-shrink-0">
          {request.student.profileImage ? (
            <img
              src={request.student.profileImage}
              alt={request.student.fullName}
              className="h-full w-full object-cover"
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
        <div className="flex-1 min-w-0 space-y-1.5 md:space-y-2">
          <div>
            <h4 className="font-medium text-foreground text-sm md:text-base truncate leading-tight">
              {request.student.fullName}
            </h4>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              {/* <GraduationCap className="h-3 w-3 flex-shrink-0" /> */}
              {request.student.registrationNumber ?? (
                <span className="truncate">
                  {request.student.registrationNumber}
                </span>
              )}
            </p>
          </div>
          <div className="space-y-1 text-xs">
            <div className="space-y-0.5">
              <span className="text-muted-foreground text-xs">Email</span>
              <p className="font-medium truncate text-xs md:text-sm">
                {request.student.email}
              </p>
            </div>
            <div className="space-y-0.5">
              <span className="text-muted-foreground text-xs">Course</span>
              <p className="font-medium truncate text-xs md:text-sm">
                {request.course.courseName}
              </p>
            </div>
          </div>
        </div>
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
          Couldn&apos;t find any unbound students in your class lists. You may
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
}: {
  classListsWithStudents: GetLecturerClassListWithStudentsReturnType;
  selectedStudentId: Id<'classListStudents'> | null;
  selectedClassListId: Id<'classLists'> | null;
  onStudentSelect: (
    studentId: Id<'classListStudents'>,
    classListId: Id<'classLists'>,
  ) => void;
}) => (
  <div className="space-y-4">
    <h3 className="font-semibold text-foreground text-sm md:text-base">
      Select ClassList Entry to Bind
    </h3>
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
      {classListsWithStudents?.map((classList) => (
        <Card key={classList._id} className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm md:text-base flex items-center gap-2 min-w-0">
                <span className="text-base">📚</span>
                <span className="truncate">{classList.classListName}</span>
              </CardTitle>
              <Badge variant="secondary" className="text-xs flex-shrink-0">
                {classList.classListStudents.length} available
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {classList.classListStudents.map((student) => (
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
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {student.student.studentGender}
                    </Badge>
                  </div>
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </RadioGroup>
  </div>
);

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
