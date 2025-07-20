import { useState } from 'react';
import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
import {
  Avatar,
  AvatarFallback,
  // AvatarImage
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  // Search,
  Users,
  AlertCircle,
  // User,
  // Mail,
  GraduationCap,
} from 'lucide-react';
// import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  // classLists,
}: StudentBindingModalProps) => {
  // const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});
  const [selectedStudentId, setSelectedStudentId] =
    useState<Id<'classListStudents'> | null>(null);
  const [selectedClassListId, setSelectedClassListId] =
    useState<Id<'classLists'> | null>(null);

  // const filteredClassLists = classLists
  //   .map((classList) => ({
  //     ...classList,
  //     students: classList.students.filter((student) => {
  //       if (student.isBound) return false; // Hide already bound students

  //       const searchTerm = searchTerms[classList.id]?.toLowerCase() || '';
  //       const matchesSearch =
  //         student.name.toLowerCase().includes(searchTerm) ||
  //         student.regNumber.toLowerCase().includes(searchTerm);
  //       return matchesSearch;
  //     }),
  //   }))
  //   .filter((classList) => classList.students.length > 0);

  // const handleSearchChange = (classListId: string, value: string) => {
  //   setSearchTerms((prev) => ({ ...prev, [classListId]: value }));
  // };

  const handleStudentSelect = (
    studentId: Id<'classListStudents'>,
    classListId: Id<'classLists'>,
  ) => {
    setSelectedStudentId(studentId);
    setSelectedClassListId(classListId);
  };

  const handleBindAndApprove = () => {
    if (!selectedStudentId || !selectedClassListId || !classListsWithStudents) {
      //   toast({
      //     title: "Selection Required",
      //     description: "Please select a student to bind before approving.",
      //     variant: "destructive"
      //   });
      return;
    }

    onBindAndApprove({
      // requestId: request.id,
      selectedStudentId,
      classListId: selectedClassListId,
    });

    // Reset selections
    setSelectedStudentId(null);
    setSelectedClassListId(null);
    // setSearchTerms({});
  };

  const handleCancel = () => {
    setSelectedStudentId(null);
    setSelectedClassListId(null);
    // setSearchTerms({});
    onOpenChange(false);
  };

  // Show loading skeleton while data is being fetched
  if (loadingClassListWithAvailableStudents || request === undefined) {
    return <StudentBindingModalSkeleton />;
  }

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Match Student to ClassList
          </DialogTitle>
          <DialogDescription>
            Bind {request.student.fullName} to an existing student entry in your
            class lists
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto max-h-[60vh] px-6">
          {/* Student Request Details */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Join Request Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-4">
                <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {request.student.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {request.student.fullName}
                    </h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" />
                      {request.student.registrationNumber}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <p className="font-medium">{request.student.email}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Department:</span>
                      <p className="font-medium">
                        {request.student.department}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* ClassList Selection */}
          {classListsWithStudents?.length === 0 ? (
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
                  <h3 className="font-semibold text-destructive">
                    No Available Matches
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    {`Couldn't find any unbound students in your class lists. You
                    may need to upload a new class list or reject this request.`}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">
                Select ClassList Entry to Bind
              </h3>
              <RadioGroup
                value={`${selectedClassListId}-${selectedStudentId}`}
                onValueChange={(value) => {
                  const [classListId, classListStudentId] = value.split('-');
                  handleStudentSelect(
                    classListStudentId as Id<'classListStudents'>,
                    classListId as Id<'classLists'>,
                  );
                }}
              >
                {classListsWithStudents?.map((classList) => (
                  <Card key={classList._id} className="border-border/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          📚 {classList.classListName}
                          <Badge variant="outline" className="text-xs">
                            {classList.yearGroup}
                          </Badge>
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {classList.classListStudents.length} available
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {classList.classListStudents.map((student) => (
                        <div
                          key={student._id}
                          className="flex items-center space-x-3 p-3 rounded-lg border border-border/30 hover:bg-accent/50 transition-colors"
                        >
                          <RadioGroupItem
                            value={`${classList._id}-${student._id}`}
                            id={`${classList._id}-${student._id}`}
                          />
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {student.student.studentName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <Label
                            htmlFor={`${classList._id}-${student._id}`}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm">
                                  {student.student.studentName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {student.student.studentRegistrationNumber}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-xs">
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
          )}
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
};

// Loading Skeleton Component
export const StudentBindingModalSkeleton = () => {
  return (
    <Dialog>
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

        <DialogContent>
          <div className="space-y-6 overflow-y-auto max-h-[60vh]">
            {/* Student Request Details Skeleton */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  <Skeleton className="h-4 w-32" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="space-y-1">
                      <Skeleton className="h-5 w-40" />
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-3 w-3 rounded" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* ClassList Selection Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-52" />

              {/* Multiple ClassList Cards */}
              {Array.from({ length: 2 }).map((_, index) => (
                <Card key={index} className="border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-6" />
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {/* Student entries skeleton */}
                    {Array.from({ length: 3 }).map((_, studentIndex) => (
                      <div
                        key={studentIndex}
                        className="flex items-center space-x-3 p-3 rounded-lg border border-border/30"
                      >
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Skeleton className="h-4 w-28" />
                              <Skeleton className="h-3 w-20" />
                            </div>
                            <Skeleton className="h-5 w-12 rounded-full" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>

        <DialogFooter className="gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-32" />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StudentBindingModal;
