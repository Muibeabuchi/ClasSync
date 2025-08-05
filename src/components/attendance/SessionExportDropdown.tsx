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
  generateSessionPDFExport,
  generateSessionCSVExport,
  generateSessionExcelExport,
  type SessionExportData,
} from '@/utils/sessionExportUtils';
import {
  downloadFile,
  generateFilename,
  getMimeType,
  isDownloadSupported,
} from '@/utils/downloadFile';

interface SessionExportDropdownProps {
  attendanceSessionId: Id<'attendanceSessions'>;
  courseId: Id<'courses'>;
  courseName: string;
  courseCode: string;
  sessionDate?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

type ExportFormat = 'pdf' | 'csv' | 'excel';

export const SessionExportDropdown = ({
  attendanceSessionId,
  courseId,
  courseName,
  courseCode,
  sessionDate,
  className,
  variant = 'outline',
  size = 'sm',
}: SessionExportDropdownProps) => {
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(false);

  // Only fetch data when export is triggered
  const {
    data: exportData,
    isLoading,
    error,
  } = useQuery({
    ...convexQuery(api.attendance.getSessionExportData, {
      attendanceSessionId,
      courseId,
    }),
    enabled: shouldFetch,
  });

  // Check if download is supported
  if (!isDownloadSupported()) {
    return null;
  }

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
          throw new Error('Failed to fetch session data');
        }

        // Generate the appropriate file
        let blob: Blob;
        let extension: string;

        switch (format) {
          case 'pdf':
            blob = generateSessionPDFExport(exportData);
            extension = 'pdf';
            break;
          case 'csv':
            blob = generateSessionCSVExport(exportData);
            extension = 'csv';
            break;
          case 'excel':
            blob = generateSessionExcelExport(exportData);
            extension = 'xlsx';
            break;
          default:
            throw new Error('Unsupported export format');
        }

        // Generate filename with session date if available
        const baseFilename = sessionDate
          ? `${courseName}_${courseCode}_${sessionDate}_session`
          : `${courseName}_${courseCode}_session`;

        const filename = generateFilename(baseFilename, '', extension);
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
      attendanceSessionId,
      courseId,
      courseName,
      courseCode,
      sessionDate,
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

  const isCurrentlyExporting = !!isExporting || (shouldFetch && isLoading);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
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
              Export Session
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
          Export session data
        </div>
        <DropdownMenuSeparator />

        {(['pdf', 'csv', 'excel'] as const).map((format) => (
          <DropdownMenuItem
            key={format}
            onClick={() => handleExport(format)}
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
