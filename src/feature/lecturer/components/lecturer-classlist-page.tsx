import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Users,
  School,
  // Settings,
} from 'lucide-react';
import { CreateClassListSheet } from './CreateClassListSheet';
import { DeleteClassListModal } from './DeleteClassListModal';
import { ViewClassListModal } from './ViewClassListModal';
import { toast } from 'sonner';
import { useCreateClassList } from '@/feature/classList/api/create-classList';
import { useDeleteClassList } from '@/feature/classList/api/delete-classList';
import type { GetLecturerClassListsReturnType } from 'convex/schema';
import type { Id } from 'convex/_generated/dataModel';
import { Skeleton } from '@/components/ui/skeleton';

interface LecturerClassListsPageProps {
  LecturerClassLists: GetLecturerClassListsReturnType;
}

const LecturerClassListsPage = ({
  LecturerClassLists,
}: LecturerClassListsPageProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedClassList, setSelectedClassList] = useState<{
    id: Id<'classLists'>;
    name: string;
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredClassList = LecturerClassLists.filter((classList) =>
    classList?.classListName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const createClassList = useCreateClassList();
  const deleteClassList = useDeleteClassList();

  const handleCreateClassList = async (newClassList: {
    classListName: string;
    students: {
      gender: 'male' | 'female';
      registrationNumber: string;
      Name: string;
    }[];
  }) => {
    try {
      await createClassList.mutateAsync({
        classListName: newClassList.classListName,
        students: newClassList.students,
      });

      setShowCreateModal(false);
      toast.success('ClassList created successfully');
    } catch (error) {
      console.error('Error creating class list:', error);
      toast.error('Failed to create class list');
    }
  };

  const handleViewClick = (classList: {
    _id: Id<'classLists'>;
    classListName?: string;
  }) => {
    setSelectedClassList({
      id: classList._id,
      name: classList.classListName || 'Unnamed Class List',
    });
    setShowViewModal(true);
  };

  const handleDeleteClick = (classList: {
    _id: Id<'classLists'>;
    classListName?: string;
  }) => {
    setSelectedClassList({
      id: classList._id,
      name: classList.classListName || 'Unnamed Class List',
    });
    setShowDeleteModal(true);
  };

  const handleDeleteClassList = async () => {
    if (!selectedClassList) return;

    try {
      await deleteClassList.mutateAsync({
        classListId: selectedClassList.id,
      });

      toast.success('Class list deleted successfully');
      setShowDeleteModal(false);
      setSelectedClassList(null);
    } catch (error: any) {
      console.error('Error deleting class list:', error);

      // Handle specific error messages from the server
      if (error?.message?.includes('used in')) {
        toast.error('Cannot delete class list', {
          description: error.message,
        });
      } else {
        toast.error('Failed to delete class list', {
          description:
            'Please try again or contact support if the problem persists.',
        });
      }
    }
  };

  return (
    <div className=" sm:p-4 space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                ClassLists
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Manage your student class lists
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center space-x-2 w-full sm:w-auto"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create New ClassList</span>
            <span className="sm:hidden">Create ClassList</span>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search class lists by fullName "
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4 flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
              <School className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Total ClassLists
              </p>
              <p className="text-lg sm:text-xl font-semibold">
                {LecturerClassLists.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Total Students
              </p>
              <p className="text-lg sm:text-xl font-semibold">
                {LecturerClassLists.reduce(
                  (sum, cl) => sum + cl.numberOfStudent,
                  0,
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ClassLists Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your ClassLists</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredClassList.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <School className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
              <h3 className="text-base sm:text-lg font-medium mb-2">
                No class lists found
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">
                {searchTerm
                  ? 'Try adjusting your search or filters'
                  : 'Create your first class list to get started'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowCreateModal(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create ClassList
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="block sm:hidden space-y-4">
                {filteredClassList.map((classList) => (
                  <Card key={classList._id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">
                            {classList.classListName}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {/* {classList.department} */}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewClick(classList)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(classList)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {classList.numberOfStudent}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Created:{' '}
                        {new Date(classList._creationTime).toLocaleDateString()}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ClassList Name</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {LecturerClassLists.map((classList) => (
                      <TableRow key={classList._id}>
                        <TableCell className="font-medium">
                          {classList.classListName}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{classList.numberOfStudent}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(
                            classList._creationTime,
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewClick(classList)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              // onClick={() => onEditClassList(classList.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(classList)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateClassListSheet
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreateClassList={handleCreateClassList}
      />

      <ViewClassListModal
        open={showViewModal}
        onOpenChange={setShowViewModal}
        classListId={selectedClassList?.id || null}
        classListName={selectedClassList?.name || ''}
      />

      <DeleteClassListModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        classListName={selectedClassList?.name || ''}
        onConfirmDelete={handleDeleteClassList}
        isDeleting={deleteClassList.isPending}
      />

      {/* <UpdateClassListSheet
          isOpen={showUpdateSheet}
          onClose={() => {
            setShowUpdateSheet(false);
            setSelectedClassList(null);
          }}
          // classlist={selectedClassList}
          // onUpdate={handleUpdateClassList}
        /> */}
    </div>
  );
};

export const LecturerClassListsPageSkeleton = () => {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <School className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                ClassLists
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Manage your student class lists
              </p>
            </div>
          </div>
          <Button
            disabled
            className="flex items-center justify-center space-x-2 w-full sm:w-auto"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create New ClassList</span>
            <span className="sm:hidden">Create ClassList</span>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search class lists by fullName or department..."
              disabled
              className="pl-10"
            />
          </div>

          <div className="relative">
            <Select disabled>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by Faculty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="placeholder">Loading...</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <Select disabled>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by Batch Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="placeholder">Loading...</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-3 sm:p-4 flex items-center space-x-2 sm:space-x-3">
              <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-20 sm:h-4 sm:w-24" />
                <Skeleton className="h-5 w-10 sm:h-6 sm:w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* ClassLists Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your ClassLists</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile Card Layout Skeleton */}
          <div className="block sm:hidden space-y-4">
            {Array(3)
              .fill(0)
              .map((_, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-5 w-12 rounded-full" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-8" />
                    </div>

                    <Skeleton className="h-3 w-20" />
                  </div>
                </Card>
              ))}
          </div>

          {/* Desktop Table Layout Skeleton */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ClassList Name</TableHead>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Batch Year</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-5 w-[180px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-[150px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Skeleton className="h-5 w-8" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LecturerClassListsPage;
