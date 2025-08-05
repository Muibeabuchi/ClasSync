import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import {
  downloadFile,
  generateFilename,
  isDownloadSupported,
  getMimeType,
} from '../downloadFile';

// Mock DOM APIs
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();
const mockClick = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();
const mockCreateElement = jest.fn();

// Setup DOM mocks
beforeEach(() => {
  // Mock URL methods
  Object.defineProperty(window, 'URL', {
    value: {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    },
    writable: true,
  });

  // Mock document methods
  Object.defineProperty(document, 'createElement', {
    value: mockCreateElement,
    writable: true,
  });

  Object.defineProperty(document.body, 'appendChild', {
    value: mockAppendChild,
    writable: true,
  });

  Object.defineProperty(document.body, 'removeChild', {
    value: mockRemoveChild,
    writable: true,
  });

  // Mock anchor element
  const mockAnchor = {
    href: '',
    download: '',
    type: '',
    style: { display: '' },
    click: mockClick,
  };

  mockCreateElement.mockReturnValue(mockAnchor);
  mockCreateObjectURL.mockReturnValue('blob:mock-url');
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Download File Utils', () => {
  describe('downloadFile', () => {
    it('should create and trigger download', () => {
      const mockBlob = new Blob(['test content'], { type: 'text/plain' });
      const filename = 'test-file.txt';
      const mimeType = 'text/plain';

      downloadFile(mockBlob, filename, mimeType);

      // Should create object URL
      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);

      // Should create anchor element
      expect(mockCreateElement).toHaveBeenCalledWith('a');

      // Should append and remove from DOM
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();

      // Should clean up object URL
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should handle errors gracefully', () => {
      mockCreateObjectURL.mockImplementation(() => {
        throw new Error('Mock error');
      });

      const mockBlob = new Blob(['test content']);

      expect(() => {
        downloadFile(mockBlob, 'test.txt');
      }).toThrow('Failed to download file. Please try again.');
    });

    it('should set correct anchor properties', () => {
      const mockBlob = new Blob(['test content']);
      const filename = 'test-file.txt';
      const mimeType = 'text/plain';

      const mockAnchor = {
        href: '',
        download: '',
        type: '',
        style: { display: '' },
        click: mockClick,
      };

      mockCreateElement.mockReturnValue(mockAnchor);

      downloadFile(mockBlob, filename, mimeType);

      expect(mockAnchor.href).toBe('blob:mock-url');
      expect(mockAnchor.download).toBe(filename);
      expect(mockAnchor.type).toBe(mimeType);
      expect(mockAnchor.style.display).toBe('none');
    });
  });

  describe('generateFilename', () => {
    it('should generate safe filename with timestamp', () => {
      const courseName = 'Computer Science 101';
      const courseCode = 'CS101';
      const extension = 'pdf';

      const filename = generateFilename(courseName, courseCode, extension);

      expect(filename).toMatch(
        /^Computer_Science_101_CS101_attendance_\d{4}-\d{2}-\d{2}\.pdf$/,
      );
    });

    it('should clean special characters from course name', () => {
      const courseName = 'Math & Physics: Advanced Topics!';
      const courseCode = 'MP-401';
      const extension = 'csv';

      const filename = generateFilename(courseName, courseCode, extension);

      expect(filename).toMatch(
        /^Math__Physics_Advanced_Topics_MP401_attendance_\d{4}-\d{2}-\d{2}\.csv$/,
      );
    });

    it('should limit filename length', () => {
      const longCourseName =
        'This is a very long course name that should be truncated to prevent filesystem issues';
      const longCourseCode = 'VERYLONGCODE123';
      const extension = 'xlsx';

      const filename = generateFilename(
        longCourseName,
        longCourseCode,
        extension,
      );

      // Should be truncated
      expect(filename.length).toBeLessThan(100);
      expect(filename).toContain('This_is_a_very_long_course_name');
      expect(filename).toContain('VERYLONGCO'); // Truncated course code
    });

    it('should handle empty inputs', () => {
      const filename = generateFilename('', '', 'pdf');

      expect(filename).toMatch(/^__attendance_\d{4}-\d{2}-\d{2}\.pdf$/);
    });
  });

  describe('isDownloadSupported', () => {
    it('should return true when all APIs are available', () => {
      // APIs are mocked and available
      expect(isDownloadSupported()).toBe(true);
    });

    it('should return false when URL API is missing', () => {
      // Remove URL from window
      delete (window as any).URL;

      expect(isDownloadSupported()).toBe(false);
    });

    it('should return false when createObjectURL is missing', () => {
      Object.defineProperty(window, 'URL', {
        value: {},
        writable: true,
      });

      expect(isDownloadSupported()).toBe(false);
    });
  });

  describe('getMimeType', () => {
    it('should return correct MIME type for PDF', () => {
      expect(getMimeType('pdf')).toBe('application/pdf');
    });

    it('should return correct MIME type for CSV', () => {
      expect(getMimeType('csv')).toBe('text/csv;charset=utf-8;');
    });

    it('should return correct MIME type for Excel', () => {
      expect(getMimeType('excel')).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
    });

    it('should return default MIME type for unknown format', () => {
      expect(getMimeType('unknown' as any)).toBe('application/octet-stream');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete download flow', () => {
      const testData = 'Course,Student,Status\nCS101,John Doe,Present';
      const blob = new Blob([testData], { type: 'text/csv' });
      const filename = generateFilename('Computer Science', 'CS101', 'csv');
      const mimeType = getMimeType('csv');

      expect(() => {
        downloadFile(blob, filename, mimeType);
      }).not.toThrow();

      expect(mockCreateObjectURL).toHaveBeenCalledWith(blob);
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });

    it('should work without optional mimeType parameter', () => {
      const blob = new Blob(['test']);
      const filename = 'test.txt';

      expect(() => {
        downloadFile(blob, filename);
      }).not.toThrow();
    });
  });
});
