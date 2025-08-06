import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Download,
  FileText,
  FileSpreadsheet,
  File,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Id } from 'convex/_generated/dataModel';
import { useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from 'convex/_generated/api';
import {
  generatePDFExport,
  generateCSVExport,
  generateExcelExport,
  // type AttendanceExportData,
} from '@/utils/exportUtils';
import {
  downloadFile,
  generateFilename,
  getMimeType,
  isDownloadSupported,
} from '@/utils/downloadFile';

interface AttendanceExportDropdownProps {
  courseId: Id<'courses'>;
  courseName: string;
  courseCode: string;
  className?: string;
}

type ExportFormat = 'pdf' | 'csv' | 'excel';

export const AttendanceExportDropdown = ({
  courseId,
  courseName,
  courseCode,
  className,
}: AttendanceExportDropdownProps) => {
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(false);

  // Only fetch data when export is triggered
  const {
    data: exportData,
    isLoading,
    error,
  } = useQuery({
    ...convexQuery(api.attendance.getAttendanceExportData, { courseId }),
    enabled: shouldFetch,
  });

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      if (isExporting) return;

      setIsExporting(format);

      try {
        // Trigger data fetch if not already done
        if (!exportData && !shouldFetch) {
          setShouldFetch(true);
          return;
        }

        // Wait for data if still loading
        if (isLoading || !exportData) {
          return;
        }

        // Check for errors
        if (error) {
          throw new Error('Failed to fetch attendance data');
        }

        // Generate the appropriate file
        let blob: Blob;
        let extension: string;

        switch (format) {
          case 'pdf':
            blob = generatePDFExport(exportData);
            extension = 'pdf';
            break;
          case 'csv':
            blob = generateCSVExport(exportData);
            extension = 'csv';
            break;
          case 'excel':
            blob = generateExcelExport(exportData);
            extension = 'xlsx';
            break;
          default:
            throw new Error('Unsupported export format');
        }

        // Generate filename and download
        const filename = generateFilename(courseName, courseCode, extension);
        const mimeType = getMimeType(format);

        downloadFile(blob, filename, mimeType);

        toast.success(`${format.toUpperCase()} export completed successfully`, {
          description: `Downloaded: ${filename}`,
        });

        setIsOpen(false);
      } catch (error) {
        console.error('Export error:', error);
        toast.error('Export failed', {
          description:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred during export',
        });
      } finally {
        setIsExporting(null);
      }
    },
    [
      exportData,
      isLoading,
      error,
      courseName,
      courseCode,
      isExporting,
      shouldFetch,
    ],
  );

  // Auto-retry export when data becomes available
  if (shouldFetch && exportData && isExporting && !isLoading) {
    handleExport(isExporting);
  }

  const getExportIcon = (format: ExportFormat) => {
    switch (format) {
      case 'pdf':
        return <FileText className="h-4 w-4 mr-2 text-red-600" />;
      case 'csv':
        return <File className="h-4 w-4 mr-2 text-green-600" />;
      case 'excel':
        return <FileSpreadsheet className="h-4 w-4 mr-2 text-blue-600" />;
    }
  };

  const getFormatLabel = (format: ExportFormat) => {
    switch (format) {
      case 'pdf':
        return 'Export as PDF';
      case 'csv':
        return 'Export as CSV';
      case 'excel':
        return 'Export as Excel';
    }
  };

  // Check if download is supported
  if (!isDownloadSupported()) {
    return null;
  }

  const isCurrentlyExporting = !!isExporting || (shouldFetch && isLoading);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={className}
          disabled={isCurrentlyExporting}
        >
          {isCurrentlyExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isLoading ? 'Loading...' : 'Exporting...'}
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
          Export attendance data
        </div>
        <DropdownMenuSeparator />

        {(['pdf', 'csv', 'excel'] as const).map((format) => (
          <DropdownMenuItem
            key={format}
            onClick={(e) => {
              e.preventDefault();
              handleExport(format);
            }}
            disabled={isCurrentlyExporting}
            className="cursor-pointer"
          >
            {isExporting === format ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isLoading
                  ? 'Loading data...'
                  : `Generating ${format.toUpperCase()}...`}
              </>
            ) : (
              <>
                {getExportIcon(format)}
                {getFormatLabel(format)}
              </>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
