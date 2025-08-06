import { AttendanceExportDropdown } from './AttendanceExportDropdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Id } from 'convex/_generated/dataModel';

/**
 * Example usage of the AttendanceExportDropdown component
 * This demonstrates how to integrate the export functionality into archived course cards
 */
export const AttendanceExportExample = () => {
  // Mock course data for demonstration
  const mockCourseId = 'course123' as Id<'courses'>;
  const mockCourseName = 'Computer Science 101';
  const mockCourseCode = 'CS101';

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-2">Attendance Export Feature</h2>
        <p className="text-muted-foreground">
          This feature allows lecturers to export attendance data for archived
          courses in PDF, CSV, or Excel formats.
        </p>
      </div>

      {/* Example 1: Standalone Export Dropdown */}
      <Card>
        <CardHeader>
          <CardTitle>Standalone Export Dropdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{mockCourseName}</p>
              <p className="text-sm text-muted-foreground">{mockCourseCode}</p>
            </div>
            <AttendanceExportDropdown
              courseId={mockCourseId}
              courseName={mockCourseName}
              courseCode={mockCourseCode}
            />
          </div>
        </CardContent>
      </Card>

      {/* Example 2: Integrated in Course Card */}
      <Card className="opacity-75">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>
              <div className="text-muted-foreground">{mockCourseName}</div>
              <div className="text-sm text-muted-foreground">
                {mockCourseCode}
              </div>
            </div>
            <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
              Archived
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-2 bg-muted/30 rounded-lg">
              <div className="text-sm font-semibold text-muted-foreground">
                2
              </div>
              <div className="text-xs text-muted-foreground">Lists</div>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded-lg">
              <div className="text-sm font-semibold text-muted-foreground">
                45
              </div>
              <div className="text-xs text-muted-foreground">Students</div>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded-lg">
              <div className="text-sm font-semibold text-muted-foreground">
                12
              </div>
              <div className="text-xs text-muted-foreground">Sessions</div>
            </div>
          </div>

          {/* Export Section */}
          <div className="pt-3 border-t border-muted/50">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground font-medium">
                Export attendance data
              </div>
              <AttendanceExportDropdown
                courseId={mockCourseId}
                courseName={mockCourseName}
                courseCode={mockCourseCode}
                className="h-7 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Description */}
      <Card>
        <CardHeader>
          <CardTitle>Export Formats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-red-100 rounded flex items-center justify-center">
                  📄
                </div>
                <span className="font-medium">PDF Export</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Comprehensive report with course info, summary statistics, and
                detailed attendance records
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-green-100 rounded flex items-center justify-center">
                  📃
                </div>
                <span className="font-medium">CSV Export</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Raw data format perfect for importing into spreadsheet
                applications or data analysis tools
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                  📊
                </div>
                <span className="font-medium">Excel Export</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Multi-sheet workbook with organized data, perfect for advanced
                analysis and reporting
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Export feature is only available for archived courses</li>
            <li>• Only courses with attendance sessions can be exported</li>
            <li>• Files are generated client-side and downloaded directly</li>
            <li>• No data is stored on the server during export</li>
            <li>
              • Exported files include course info, session details, and student
              attendance records
            </li>
            <li>• Manual overrides are clearly marked in all export formats</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
