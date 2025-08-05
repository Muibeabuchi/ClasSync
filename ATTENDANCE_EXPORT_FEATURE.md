# 📊 Attendance Export Feature

A comprehensive attendance data export system for Classynk that allows lecturers to download attendance data for archived courses in multiple formats.

## 🎯 Overview

The attendance export feature enables lecturers to export detailed attendance data from their archived courses in three formats:

- **PDF**: Professional reports with formatted tables and summaries
- **CSV**: Raw data for spreadsheet applications and data analysis
- **Excel**: Multi-sheet workbooks with organized data and formatting

## 🏗️ Architecture

### Components

```
src/
├── components/attendance/
│   ├── AttendanceExportDropdown.tsx      # Main export UI component
│   └── AttendanceExportDropdown.example.tsx  # Usage examples
├── utils/
│   ├── exportUtils.ts                    # File generation utilities
│   └── downloadFile.ts                   # Download handling utilities
├── feature/attendance/api/
│   └── index.ts                          # API hooks (updated)
└── convex/
    └── attendance.ts                     # Backend query (updated)
```

### Data Flow

1. **User Interaction**: Lecturer clicks export button on archived course
2. **Data Fetching**: Convex query retrieves comprehensive attendance data
3. **File Generation**: Client-side utilities generate the requested format
4. **Download**: Browser downloads the file using Blob API and temporary URLs

## 🔧 Implementation Details

### Backend (Convex)

#### New Query: `getAttendanceExportData`

```typescript
export const getAttendanceExportData = query({
  args: { courseId: v.id('courses') },
  handler: async (ctx, args) => {
    // Validates lecturer access and archived status
    // Returns comprehensive attendance data structure
  },
});
```

**Data Structure Returned:**

```typescript
interface AttendanceExportData {
  courseInfo: {
    courseName: string;
    courseCode: string;
    lecturerName: string;
    lecturerTitle: string;
    archiveTimestamp: string;
    status: string;
  };
  summary: {
    totalSessions: number;
    totalAttendanceRecords: number;
    totalManualOverrides: number;
    averageAttendancePerSession: number;
  };
  sessions: Array<{
    sessionId: string;
    date: string;
    time: string;
    status: string;
    attendanceCodeUsed: boolean;
    totalPresent: number;
    manualOverrides: number;
    studentsPresent: Array<{
      name: string;
      registrationNumber: string;
      checkInTime: string;
      isManualOverride: boolean;
    }>;
  }>;
  exportTimestamp: string;
}
```

### Frontend Components

#### AttendanceExportDropdown

**Props:**

```typescript
interface AttendanceExportDropdownProps {
  courseId: Id<'courses'>;
  courseName: string;
  courseCode: string;
  className?: string;
}
```

**Features:**

- Dropdown menu with three export options
- Loading states during data fetch and file generation
- Error handling with user-friendly messages
- Automatic filename generation with timestamps
- Browser compatibility checks

### Utility Functions

#### Export Utils (`src/utils/exportUtils.ts`)

- `generatePDFExport()`: Creates formatted PDF reports using jsPDF and autoTable
- `generateCSVExport()`: Generates CSV files using PapaParse
- `generateExcelExport()`: Creates multi-sheet Excel workbooks using XLSX

#### Download Utils (`src/utils/downloadFile.ts`)

- `downloadFile()`: Handles file downloads using Blob API
- `generateFilename()`: Creates safe, timestamped filenames
- `isDownloadSupported()`: Browser compatibility checks
- `getMimeType()`: Returns appropriate MIME types for each format

## 📋 Export Formats

### PDF Export

- **Header**: Course information and lecturer details
- **Summary**: Statistics table with key metrics
- **Session Overview**: Table of all attendance sessions
- **Detailed Records**: Individual pages for each session with student lists
- **Formatting**: Professional layout with consistent styling

### CSV Export

- **Structure**: Flat file with all data in rows
- **Sections**: Course info, summary stats, session overview, detailed records
- **Compatibility**: Works with Excel, Google Sheets, and data analysis tools

### Excel Export

- **Multi-sheet**: Separate sheets for different data views
- **Sheets**: Course Info, Session Overview, Detailed Attendance, Individual Sessions
- **Formatting**: Column widths, headers, and organized layout

## 🔒 Security & Access Control

### Access Restrictions

- Only available to course lecturers (owner verification)
- Only works with archived courses
- Requires authentication through Convex auth system

### Data Privacy

- All file generation happens client-side
- No files are stored on the server
- Temporary object URLs are cleaned up after download
- No sensitive data exposure in error messages

## 🎨 UI/UX Features

### Visual Design

- Consistent with existing Classynk design system
- Color-coded export options (PDF: red, CSV: green, Excel: blue)
- Loading states with spinners and descriptive text
- Responsive design for mobile and desktop

### User Experience

- One-click export with format selection
- Clear progress indicators during processing
- Success notifications with filename confirmation
- Error handling with actionable messages
- Disabled states during processing to prevent duplicate requests

## 🧪 Usage Examples

### Basic Integration

```tsx
import { AttendanceExportDropdown } from '@/components/attendance/AttendanceExportDropdown';

// In an archived course card
<AttendanceExportDropdown
  courseId={course._id}
  courseName={course.courseName}
  courseCode={course.courseCode}
  className="h-7 text-xs"
/>;
```

### Conditional Rendering

```tsx
{
  isArchived && (course.stats?.sessionsHeld || 0) > 0 && (
    <div className="mt-4 pt-3 border-t border-muted/50">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground font-medium">
          Export attendance data
        </div>
        <AttendanceExportDropdown
          courseId={course._id}
          courseName={course.courseName}
          courseCode={course.courseCode}
          className="h-7 text-xs"
        />
      </div>
    </div>
  );
}
```

## 📦 Dependencies

### Required Libraries

- `jspdf`: PDF generation
- `jspdf-autotable`: PDF table formatting
- `xlsx`: Excel file generation
- `papaparse`: CSV parsing and generation
- `@types/papaparse`: TypeScript definitions

### Browser Requirements

- Modern browsers with Blob API support
- JavaScript enabled
- File download capabilities

## 🚀 Performance Considerations

### Optimization Strategies

- Lazy loading: Data is only fetched when export is triggered
- Client-side processing: Reduces server load
- Memory management: Object URLs are cleaned up after use
- Efficient data structures: Optimized for large datasets

### Scalability

- Handles courses with hundreds of students
- Supports multiple attendance sessions
- Efficient memory usage during file generation
- Non-blocking UI during processing

## 🔧 Maintenance & Troubleshooting

### Common Issues

1. **Browser Compatibility**: Check `isDownloadSupported()` result
2. **Large Files**: Monitor memory usage for courses with extensive data
3. **Network Issues**: Handle Convex query failures gracefully
4. **File Generation Errors**: Validate data structure before processing

### Monitoring

- Error logging for failed exports
- Success tracking for analytics
- Performance monitoring for large datasets
- User feedback collection

## 🎯 Future Enhancements

### Potential Improvements

- Custom date range filtering
- Additional export formats (JSON, XML)
- Batch export for multiple courses
- Email delivery option
- Export scheduling and automation
- Advanced filtering and sorting options

### Integration Opportunities

- Integration with external analytics tools
- API endpoints for programmatic access
- Webhook notifications for completed exports
- Cloud storage integration (Google Drive, Dropbox)

## 📝 Testing

### Test Coverage

- Unit tests for utility functions
- Integration tests for component behavior
- End-to-end tests for complete export flow
- Browser compatibility testing
- Performance testing with large datasets

### Test Files

```
src/components/attendance/__tests__/
├── AttendanceExportDropdown.test.tsx
├── exportUtils.test.ts
└── downloadFile.test.ts
```

## 📚 Documentation

### Additional Resources

- Component examples: `AttendanceExportDropdown.example.tsx`
- API documentation: Convex function comments
- Type definitions: TypeScript interfaces
- Usage guidelines: This README file

---

This feature provides a comprehensive solution for attendance data export, ensuring lecturers can easily access and analyze their course attendance data in their preferred format.
