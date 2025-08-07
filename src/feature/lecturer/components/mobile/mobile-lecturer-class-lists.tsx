import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users,
  Search,
  Plus,
  MoreVertical,
  UserPlus,
  Upload,
  Download,
  Filter,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Trash2,
  Edit,
  Eye,
  UserMinus,
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useLecturerCourses } from '@/feature/lecturer/api/courses';
import type { Id } from 'convex/_generated/dataModel';

interface MobileLecturerClassListsProps {}

// Mock data for demonstration - replace with actual API calls
const mockClassLists = [
  {
    id: '1',
    courseId: 'course-1',
    courseName: 'Computer Science 101',
    courseCode: 'CS101',
    studentsCount: 45,
    lastUpdated: new Date('2024-01-15'),
    isActive: true,
  },
  {
    id: '2',
    courseId: 'course-2',
    courseName: 'Data Structures and Algorithms',
    courseCode: 'CS201',
    studentsCount: 32,
    lastUpdated: new Date('2024-01-10'),
    isActive: true,
  },
  {
    id: '3',
    courseId: 'course-3',
    courseName: 'Database Management Systems',
    courseCode: 'CS301',
    studentsCount: 28,
    lastUpdated: new Date('2024-01-08'),
    isActive: false,
  },
];

const mockStudents = [
  {
    id: '1',
    name: 'John Doe',
    regNumber: '202312345',
    email: 'john.doe@university.edu',
    gender: 'Male',
    enrolledDate: new Date('2024-01-01'),
    attendanceRate: 85,
    avatar: null,
  },
  {
    id: '2',
    name: 'Jane Smith',
    regNumber: '202312346',
    email: 'jane.smith@university.edu',
    gender: 'Female',
    enrolledDate: new Date('2024-01-02'),
    attendanceRate: 92,
    avatar: null,
  },
  {
    id: '3',
    name: 'Michael Johnson',
    regNumber: '202312347',
    email: 'michael.j@university.edu',
    gender: 'Male',
    enrolledDate: new Date('2024-01-03'),
    attendanceRate: 78,
    avatar: null,
  },
];

export const MobileLecturerClassLists: React.FC<MobileLecturerClassListsProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'courses' | 'students'>('courses');
  
  const { data: courses, isLoading } = useLecturerCourses();
  const navigate = useNavigate();

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourse(courseId);
    setViewMode('students');
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setViewMode('courses');
    setSearchQuery('');
  };

  const handleAddStudent = () => {
    // Navigate to add student page
    console.log('Add student');
  };

  const handleUploadClassList = () => {
    // Navigate to upload class list page
    console.log('Upload class list');
  };

  const handleExportClassList = () => {
    // Export class list functionality
    console.log('Export class list');
  };

  const filteredCourses = mockClassLists.filter((course) =>
    course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.courseCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudents = mockStudents.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.regNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCourseData = mockClassLists.find(course => course.id === selectedCourse);

  const truncatedCourseName = (courseName: string) => {
    return courseName.length > 25
      ? `${courseName.substring(0, 22)}...`
      : courseName;
  };

  if (isLoading) {
    return <MobileLecturerClassListsSkeleton />;
  }

  if (viewMode === 'students' && selectedCourseData) {
    return (
      <div className="space-y-6 pb-4">
        {/* Header with Back Button */}
        <div className="px-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToCourses}
            className="mb-4 -ml-2"
          >
            <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
            Back to Courses
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font