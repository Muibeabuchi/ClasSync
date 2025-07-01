import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, Download } from 'lucide-react';

interface StudentUploadSectionProps {
  csvData: any[];
  onCsvUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const StudentUploadSection = ({
  csvData,
  onCsvUpload,
}: StudentUploadSectionProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>Student List (Optional)</CardTitle>
        <CardDescription>
          Upload a CSV file with student information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors animate-slide-in-right">
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-4" />
          <Label htmlFor="csv-upload">
            <div className="cursor-pointer">
              <p className="text-sm font-medium text-gray-700">
                Upload Student CSV
              </p>
              <p className="text-xs text-gray-500 mt-1">
                CSV should contain: reg_number, full_name, email, gender
              </p>
            </div>
          </Label>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={onCsvUpload}
          />
        </div>

        {csvData.length > 0 && (
          <div className="space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {csvData.length} students loaded
              </span>
              <Button
                variant="outline"
                size="sm"
                className="hover:scale-105 transition-transform"
              >
                <Download className="h-4 w-4 mr-2" />
                Template
              </Button>
            </div>
            <div className="text-xs text-gray-500">
              Students will be able to join using the course link after
              creation.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentUploadSection;
