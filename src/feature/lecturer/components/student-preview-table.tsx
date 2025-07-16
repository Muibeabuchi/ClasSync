import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users } from 'lucide-react';

interface StudentPreviewTableProps {
  csvData: any[];
  onStudentClick: (student: any) => void;
}

const StudentPreviewTable = ({
  csvData,
  onStudentClick,
}: StudentPreviewTableProps) => {
  if (csvData.length === 0) return null;

  return (
    <Card className="animate-fade-in hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Student Preview
        </CardTitle>
        <CardDescription>
          Preview of students from uploaded CSV (click on a row to view details)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Registration Number</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Gender</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {csvData.slice(0, 5).map((student) => (
              <TableRow
                key={student.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onStudentClick(student)}
              >
                <TableCell className="font-medium">
                  {student.regNumber}
                </TableCell>
                <TableCell>{student.fullName}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.gender}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {csvData.length > 5 && (
          <p className="text-sm text-muted-foreground mt-2">
            And {csvData.length - 5} more students...
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentPreviewTable;
