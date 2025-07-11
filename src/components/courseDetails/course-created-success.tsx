import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

interface CourseCreatedSuccessProps {
  courseCreated: boolean;
  joinLink: string;
  courseName: string;
  studentCount: number;
}

const CourseCreatedSuccess = ({
  courseCreated,
  joinLink,
  //   courseName,
  //   studentCount,
}: CourseCreatedSuccessProps) => {
  const copyJoinLink = () => {
    navigator.clipboard.writeText(joinLink);
    toast.success(
      'Link Copied! ,Course join link has been copied to clipboard.',
    );
  };

  if (!courseCreated) return null;

  return (
    <Card className="border-green-200 bg-green-50 animate-scale-in hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-green-800">
          Course Created Successfully!
        </CardTitle>
        <CardDescription className="text-green-600">
          Your course is now active and ready for student enrollment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-white rounded-lg border">
          <Label className="text-sm font-medium text-gray-700">
            Course Join Link
          </Label>
          <div className="flex items-center space-x-2 mt-2">
            <Input value={joinLink} readOnly className="flex-1" />
            <Button
              onClick={copyJoinLink}
              className="hover:scale-105 transition-transform"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Share this link with students to allow them to join your course
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCreatedSuccess;
