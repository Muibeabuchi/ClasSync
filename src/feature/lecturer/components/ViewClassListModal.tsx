import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Users, User, UserCheck } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import type { Id } from 'convex/_generated/dataModel';
import { Skeleton } from '@/components/ui/skeleton';

interface ViewClassListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classListId: Id<'classLists'> | null;
  classListName: string;
}

export const ViewClassListModal = ({
  open,
  onOpenChange,
  classListId,
  classListName,
}: ViewClassListModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const isDesktop = useMediaQuery('(min-width: 768px)');

  // Query to get class list with students
  const classListData = useQuery(
    api.classLists.getClassList,
    classListId ? { classListId } : 'skip',
  );

  const filteredStudents = classListData?.classListStudents?.filter(
    (student) =>
      student.student.studentName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      student.student.studentRegistrationNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const content = (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search students by name or registration number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-xl font-semibold">
                {classListData?.classListStudents?.length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserCheck className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Filtered Results</p>
              <p className="text-xl font-semibold">
                {filteredStudents?.length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      {classListData === undefined ? (
        <StudentsListSkeleton />
      ) : filteredStudents && filteredStudents.length > 0 ? (
        <>
          {/* Mobile Card Layout */}
          <div className="block md:hidden space-y-3">
            <ScrollArea className="h-[400px]">
              {filteredStudents.map((student, index) => (
                <Card key={student._id} className="mb-3">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-muted rounded-full">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">
                            {student.student.studentName}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {student.student.studentRegistrationNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge
                          variant={
                            student.student.studentGender === 'male'
                              ? 'default'
                              : 'secondary'
                          }
                          className="text-xs"
                        >
                          {student.student.studentGender}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          #{student.student.classlistPosition}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block">
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Position</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Registration Number</TableHead>
                    <TableHead>Gender</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell className="font-medium">
                        #{student.student.classlistPosition}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 bg-muted rounded-full">
                            <User className="h-3 w-3" />
                          </div>
                          <span>{student.student.studentName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {student.student.studentRegistrationNumber}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            student.student.studentGender === 'male'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {student.student.studentGender}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {searchTerm
              ? 'No students found'
              : 'No students in this class list'}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'This class list is empty'}
          </p>
        </div>
      )}
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Students in "{classListName}"</span>
            </DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Students in "{classListName}"</span>
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4">{content}</div>
      </DrawerContent>
    </Drawer>
  );
};

const StudentsListSkeleton = () => {
  return (
    <div className="space-y-4">
      {/* Mobile Skeleton */}
      <div className="block md:hidden space-y-3">
        {Array(5)
          .fill(0)
          .map((_, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <Skeleton className="h-5 w-12 rounded-full" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Desktop Skeleton */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Position</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Registration Number</TableHead>
              <TableHead>Gender</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(8)
              .fill(0)
              .map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-12 rounded-full" />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
