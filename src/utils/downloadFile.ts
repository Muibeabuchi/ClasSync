/**
 * Utility function to trigger file download using Blob API and temporary object URLs
 * Works in all modern browsers without persisting files on the server
 */
export const downloadFile = (
  blob: Blob,
  filename: string,
  mimeType?: string,
): void => {
  try {
    // Create a temporary object URL for the blob
    const url = window.URL.createObjectURL(blob);

    // Create an invisible anchor element
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // Set MIME type if provided
    if (mimeType) {
      link.type = mimeType;
    }

    // Make the link invisible
    link.style.display = 'none';

    // Append to document body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the object URL to free memory
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error('Failed to download file. Please try again.');
  }
};

/**
 * Generate a safe filename with timestamp
 */
export const generateFilename = (
  courseName: string,
  courseCode: string,
  extension: string,
): string => {
  // Clean the course name and code for filename safety
  const cleanCourseName = courseName
    .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .substring(0, 30); // Limit length

  const cleanCourseCode = courseCode
    .replace(/[^a-zA-Z0-9-]/g, '') // Remove special characters
    .substring(0, 10); // Limit length

  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  return `${cleanCourseName}_${cleanCourseCode}_attendance_${timestamp}.${extension}`;
};

/**
 * Check if the browser supports file downloads
 */
export const isDownloadSupported = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    'URL' in window &&
    'createObjectURL' in window.URL &&
    'revokeObjectURL' in window.URL &&
    'createElement' in document
  );
};

/**
 * Get appropriate MIME types for different file formats
 */
export const getMimeType = (format: 'pdf' | 'csv' | 'excel'): string => {
  switch (format) {
    case 'pdf':
      return 'application/pdf';
    case 'csv':
      return 'text/csv;charset=utf-8;';
    case 'excel':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    default:
      return 'application/octet-stream';
  }
};
