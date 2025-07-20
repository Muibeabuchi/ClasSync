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
import { Badge } from '@/components/ui/badge';
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
  // Trash2,
  Users,
  Calendar,
  School,
  GraduationCap,
  X,
  // Settings,
} from 'lucide-react';
import { CreateClassListSheet } from './CreateClassListSheet';
import { toast } from 'sonner';
import { useCreateClassList } from '@/feature/classList/api/create-classList';
import type { GetLecturerClassListsReturnType } from 'convex/schema';
import { Skeleton } from '@/components/ui/skeleton';
// import { DeleteClassListModal } from './DeleteClassListModal';

interface LecturerClassListsPageProps {
  LecturerClassLists: GetLecturerClassListsReturnType;
}

const LecturerClassListsPage = ({
  LecturerClassLists,
}: LecturerClassListsPageProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  // const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('');
  const [batchYearFilter, setBatchYearFilter] = useState('');

  const faculties = ['SESET', 'SEET', 'SEMS', 'SLS'];
  const batchYears = [
    '2019/2020',
    '2020/2021',
    '2021/2022',
    '2022/2023',
    '2023/2024',
  ];

  const getFacultyColor = (faculty: string) => {
    const colors = {
      SESET: 'bg-blue-100 text-blue-800 border-blue-200',
      SEET: 'bg-green-100 text-green-800 border-green-200',
      SEMS: 'bg-purple-100 text-purple-800 border-purple-200',
      SLS: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return (
      colors[faculty as keyof typeof colors] ||
      'bg-gray-100 text-gray-800 border-gray-200'
    );
  };
  const createClassList = useCreateClassList();

  const handleCreateClassList = async (newClassList: {
    department: string;
    faculty: string;
    batchYear: string;
    classListName: string;
    students: {
      gender: 'male' | 'female';
      registrationNumber: string;
      Name: string;
    }[];
  }) => {
    await createClassList.mutateAsync({
      department: newClassList.department,
      faculty: newClassList.faculty,
      yearGroup: newClassList.batchYear,
      classListName: newClassList.classListName,
      students: newClassList.students,
    });

    setShowCreateModal(false);

    toast.success('ClassList created successfully');
  };

  const clearFacultyFilter = () => setFacultyFilter('');
  const clearBatchYearFilter = () => setBatchYearFilter('');

  return (
    <div className=" sm:p-4 space-y-4 sm:space-y-6">
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
              placeholder="Search class lists by fullName or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="relative">
            <Select value={facultyFilter} onValueChange={setFacultyFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by Faculty" />
              </SelectTrigger>
              <SelectContent>
                {faculties.map((faculty) => (
                  <SelectItem key={faculty} value={faculty}>
                    {faculty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {facultyFilter && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-8 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={clearFacultyFilter}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          <div className="relative">
            <Select value={batchYearFilter} onValueChange={setBatchYearFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by Batch Year" />
              </SelectTrigger>
              <SelectContent>
                {batchYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {batchYearFilter && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-8 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={clearBatchYearFilter}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters */}
        {(facultyFilter || batchYearFilter) && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Active filters:
            </span>
            {facultyFilter && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Faculty: {facultyFilter}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={clearFacultyFilter}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {batchYearFilter && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Batch: {batchYearFilter}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={clearBatchYearFilter}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}
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
        <Card>
          <CardContent className="p-3 sm:p-4 flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
              <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Faculties
              </p>
              <p className="text-lg sm:text-xl font-semibold">
                {new Set(LecturerClassLists.map((cl) => cl.faculty)).size}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Batch Years
              </p>
              <p className="text-lg sm:text-xl font-semibold">
                {new Set(LecturerClassLists.map((cl) => cl.yearGroup)).size}
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
          {LecturerClassLists.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <School className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
              <h3 className="text-base sm:text-lg font-medium mb-2">
                No class lists found
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">
                {searchTerm || facultyFilter || batchYearFilter
                  ? 'Try adjusting your search or filters'
                  : 'Create your first class list to get started'}
              </p>
              {!searchTerm && !facultyFilter && !batchYearFilter && (
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
                {LecturerClassLists.map((classList) => (
                  <Card key={classList._id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">
                            {classList.classListName}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {classList.department}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="outline"
                            className={`${getFacultyColor(classList.faculty)} text-xs`}
                          >
                            {classList.faculty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {classList.yearGroup}
                          </Badge>
                        </div>
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
                      <TableHead>Faculty</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Batch Year</TableHead>
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
                          <Badge
                            variant="outline"
                            className={getFacultyColor(classList.faculty)}
                          >
                            {classList.faculty}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {classList.department}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{classList.yearGroup}</Badge>
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
                              // onClick={() => onEditClassList(classList.id)}
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

      {/* <DeleteClassListModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        // classListName={selectedClassList?.name || ''}
        // onConfirmDelete={handleDeleteClassList}
      /> */}

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
