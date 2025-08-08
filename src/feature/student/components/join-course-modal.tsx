import { useState, useEffect } from 'react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Send, Loader2, User, Key } from 'lucide-react';
import { toast } from 'sonner';
import { api } from 'convex/_generated/api';
import { useRequestToJoinCourseClassList } from '@/feature/joinRequest/api';
import { useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { useGetCurrentUser } from '@/feature/student/api/student-profile';

interface JoinCourseModalProps {
  onSuccess?: () => void;
}

const JoinCourseModal = ({ onSuccess }: JoinCourseModalProps) => {
  const [courseCode, setCourseCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [requestMessage] = useState('');
  const [uniqueCode, setUniqueCode] = useState('');
  const [editableRegNumber, setEditableRegNumber] = useState('');

  const { data: currentUser } = useGetCurrentUser();
  const { data: searchResult, isLoading: isSearching } = useQuery({
    ...convexQuery(api.courses.searchCourse, { courseCode: searchQuery }),
    enabled: !!searchQuery, // Only run query when searchQuery is set
  });

  const { mutateAsync: requestToJoin, isPending: isJoining } =
    useRequestToJoinCourseClassList();

  // Initialize editable registration number when user data loads
  useEffect(() => {
    if (currentUser?.registrationNumber) {
      setEditableRegNumber(currentUser.registrationNumber);
    } else {
      setEditableRegNumber(''); // Clear if no registration number
    }
  }, [currentUser]);

  const hasRegistrationNumber = Boolean(currentUser?.registrationNumber);
  const canSubmitRequest =
    (hasRegistrationNumber && editableRegNumber.trim().length > 0) ||
    (!hasRegistrationNumber && uniqueCode.trim().length > 0);

  const handleSearch = () => {
    if (!courseCode.trim()) {
      toast.error('Please enter a course code');
      return;
    }
    setSearchQuery(courseCode.trim());
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleSendRequest = async () => {
    if (!searchResult) return;
    if (searchResult.isMember) return;
    if (!canSubmitRequest) {
      toast.error(
        'Please provide a unique code or complete your profile with a registration number',
      );
      return;
    }

    try {
      await requestToJoin({
        courseId: searchResult._id,
        lecturerId: searchResult.lecturer.id,
        message: requestMessage,
        uniqueCode: hasRegistrationNumber ? editableRegNumber : uniqueCode,
      });

      toast.success(
        `Your request to join ${searchResult.courseName} has been sent to ${searchResult.lecturer.name}.`,
      );

      // Reset form
      setCourseCode('');
      setSearchQuery('');
      setUniqueCode('');
      // Reset editable registration number to original value
      if (currentUser?.registrationNumber) {
        setEditableRegNumber(currentUser.registrationNumber);
      } else {
        setEditableRegNumber('');
      }

      // Call success callback to close modal
      onSuccess?.();
    } catch {
      toast.error('Failed to send join request. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Enter course code provided by your lecturer"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              className="pl-10"
              disabled={isSearching || isJoining}
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            disabled={!courseCode.trim() || isSearching || isJoining}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>

      {/* Search Results */}
      {isSearching && searchQuery && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">
            Searching...
          </span>
        </div>
      )}

      {searchResult && !isSearching && (
        <div className="space-y-4">
          <Card className="transition-all hover:shadow-md border-opacity-50">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-medium">
                    {searchResult.courseName}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {searchResult.courseCode}
                  </CardDescription>
                </div>
              </div>
              <div className="mt-2 text-sm">
                <span className="opacity-75">Lecturer: </span>
                <span className="font-medium">
                  {searchResult.lecturer.name}
                </span>
              </div>
            </CardHeader>
          </Card>

          {/* Student Identification Section */}
          {!searchResult.isMember && (
            <Card className="border-dashed">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Student Identification
                </CardTitle>
                <CardDescription>
                  Help your lecturer identify you from their class list
                </CardDescription>
              </CardHeader>
              <div className="px-6 pb-6 space-y-4">
                {hasRegistrationNumber ? (
                  <div className="space-y-2">
                    <Label htmlFor="regNumber" className="text-sm font-medium">
                      Registration Number{' '}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="regNumber"
                      placeholder="Enter your registration number"
                      value={editableRegNumber}
                      onChange={(e) => setEditableRegNumber(e.target.value)}
                      disabled={isJoining}
                    />
                    <p className="text-xs text-muted-foreground">
                      You can edit your registration number before sending the
                      request
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label
                      htmlFor="uniqueCode"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <Key className="h-3 w-3" />
                      Unique Code <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="uniqueCode"
                      placeholder="Enter the unique code provided by your lecturer"
                      value={uniqueCode}
                      onChange={(e) => setUniqueCode(e.target.value)}
                      disabled={isJoining}
                    />
                    <p className="text-xs text-muted-foreground">
                      Since you don&apos;t have a registration number in your
                      profile, please enter the unique code your lecturer
                      provided
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Submit Button */}
          <Button
            className="w-full"
            variant="default"
            disabled={searchResult.isMember || isJoining || !canSubmitRequest}
            onClick={handleSendRequest}
          >
            {isJoining ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending Request...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {searchResult.isMember ? 'Already Joined' : 'Request to Join'}
              </>
            )}
          </Button>
        </div>
      )}

      {searchQuery && !searchResult && !isSearching && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            {`No course found with code "${searchQuery}" `}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Make sure you have the correct course code from your lecturer
          </p>
        </div>
      )}
    </div>
  );
};

export default JoinCourseModal;
