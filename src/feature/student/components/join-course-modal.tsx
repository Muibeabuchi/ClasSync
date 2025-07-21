import { useState } from 'react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from 'convex/_generated/api';
import { useRequestToJoinCourseClassList } from '@/feature/joinRequest/api';
import { useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';

interface JoinCourseModalProps {
  onSuccess?: () => void;
}

const JoinCourseModal = ({ onSuccess }: JoinCourseModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [requestMessage] = useState('');

  const { data: searchResult, isLoading: isSearching } = useQuery(
    convexQuery(api.courses.searchCourse, { courseCode: searchTerm }),
  );

  const { mutateAsync: requestToJoin, isPending: isJoining } =
    useRequestToJoinCourseClassList();

  const handleSendRequest = async () => {
    if (!searchResult) return;
    if (searchResult.isMember) return;

    try {
      await requestToJoin({
        courseId: searchResult._id,
        lecturerId: searchResult.lecturer.id,
        message: requestMessage,
      });

      toast.success(
        `Your request to join ${searchResult.courseName} has been sent to ${searchResult.lecturer.name}.`,
      );

      // Reset form
      setSearchTerm('');

      // Call success callback to close modal
      onSuccess?.();
    } catch {
      toast.error('Failed to send join request. Please try again.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResult && !searchResult.isMember) {
      handleSendRequest();
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Enter course code provided by your lecturer"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            disabled={isSearching || isJoining}
          />
        </div>
      </form>

      {/* Search Results */}
      {isSearching && searchTerm && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">
            Searching...
          </span>
        </div>
      )}

      {searchResult && !isSearching && (
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
              <span className="font-medium">{searchResult.lecturer.name}</span>
            </div>

            <div className="pt-3">
              <Button
                className="w-full"
                variant="default"
                disabled={searchResult.isMember || isJoining}
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
                    {searchResult.isMember
                      ? 'Already Joined'
                      : 'Request to Join'}
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      {searchTerm && !searchResult && !isSearching && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            {`No course found with code "{searchTerm}" `}
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
