import { useState } from 'react';
import {
  Card,
  // CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { Avatar, AvatarFallback } from '@/components/ui/avatar';
// import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  // BookOpen,
  // Users,
  //  Clock,
  Send,
} from 'lucide-react';
// import { useToast } from "@/hooks/use-toast";
// toast
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog';
import { toast } from 'sonner';
// import { Label } from '@/components/ui/label';
import { api } from 'convex/_generated/api';
// import type { Id } from 'convex/_generated/dataModel';
import { useRequestToJoinCourseClassList } from '@/feature/joinRequest/api';
import { useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';

// interface JoinCoursePageProps {
//   onBack: () => void;
// }

const JoinCoursePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse] = useState<any>(null);
  const [requestMessage] = useState('');
  const { data: searchResult } = useQuery(
    convexQuery(api.courses.searchCourse, { courseCode: searchTerm }),
  );

  const { mutateAsync: requestToJoin } = useRequestToJoinCourseClassList();

  const handleSendRequest = async () => {
    if (!searchResult) return;
    if (searchResult.isMember) return;
    await requestToJoin({
      courseId: searchResult._id,
      lecturerId: searchResult.lecturer.id,
      message: requestMessage,
    });

    toast.success(
      `Your request to join ${selectedCourse.name} has been sent to ${selectedCourse.lecturer}.`,
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Join Course</h1>
          <p className="text-muted-foreground">
            Browse and request to join available courses
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <form className="gap-x-3 flex items-center w-full">
        <div className="relative w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses by Course  Code given to you by your lecturer"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </form>

      {/* Available Courses */}
      {searchResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card
            key={searchResult?._id}
            className="transition-all py-1 gap-y-2 hover:shadow-md border-opacity-50"
          >
            <CardHeader className="pb-1">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-medium">
                    {searchResult?.courseName}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {searchResult?.courseCode}
                  </CardDescription>
                </div>
              </div>
              <div className="mt-2 text-sm">
                <span className="opacity-75">Lecturer: </span>
                <span className="font-medium">
                  {searchResult?.lecturer.name}
                </span>
              </div>
            </CardHeader>
            <div className="px-6 pb-2">
              <Button
                className="mt-4 rounded-md"
                variant="default"
                disabled={searchResult?.isMember}
                onClick={handleSendRequest}
              >
                <Send className="h-4 w-4 mr-2" />
                {searchResult?.isMember ? 'Already Joined' : 'Request to Join'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default JoinCoursePage;
