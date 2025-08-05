import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  generatePDFExport,
  generateCSVExport,
  generateExcelExport,
  type AttendanceExportData,
} from '../exportUtils';

// Mock data for testing
const mockAttendanceData: AttendanceExportData = {
  courseInfo: {
    courseName: 'Computer Science 101',
    courseCode: 'CS101',
    lecturerName: 'Dr. John Smith',
    lecturerTitle: 'Dr.',
    archiveTimestamp: '2024-01-15T10:00:00.000Z',
    status: 'archived',
  },
  summary: {
    totalSessions: 2,
    totalAttendanceRecords: 8,
    totalManualOverrides: 1,
    averageAttendancePerSession: 4,
  },
  sessions: [
    {
      sessionId: 'session1',
      date: '2024-01-10',
      time: '10:00:00 AM',
      status: 'complete',
      attendanceCodeUsed: true,
      totalPresent: 4,
      manualOverrides: 0,
      studentsPresent: [
        {
          name: 'Alice Johnson',
          registrationNumber: '202301001',
          checkInTime: '2024-01-10T10:05:00.000Z',
          isManualOverride: false,
        },
        {
          name: 'Bob Wilson',
          registrationNumber: '202301002',
          checkInTime: '2024-01-10T10:07:00.000Z',
          isManualOverride: false,
        },
      ],
    },
    {
      sessionId: 'session2',
      date: '2024-01-12',
      time: '10:00:00 AM',
      status: 'complete',
      attendanceCodeUsed: false,
      totalPresent: 4,
      manualOverrides: 1,
      studentsPresent: [
        {
          name: 'Charlie Brown',
          registrationNumber: '202301003',
          checkInTime: '2024-01-12T10:03:00.000Z',
          isManualOverride: false,
        },
        {
          name: 'Diana Prince',
          registrationNumber: '202301004',
          checkInTime: '2024-01-12T10:00:00.000Z',
          isManualOverride: true,
        },
      ],
    },
  ],
  exportTimestamp: '2024-01-15T10:00:00.000Z',
};

describe('Export Utils', () => {
  describe('generatePDFExport', () => {
    it('should generate a PDF blob', () => {
      const result = generatePDFExport(mockAttendanceData);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/pdf');
      expect(result.size).toBeGreaterThan(0);
    });

    it('should handle empty sessions', () => {
      const emptyData = {
        ...mockAttendanceData,
        sessions: [],
        summary: {
          ...mockAttendanceData.summary,
          totalSessions: 0,
        },
      };

      const result = generatePDFExport(emptyData);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/pdf');
    });
  });

  describe('generateCSVExport', () => {
    it('should generate a CSV blob', () => {
      const result = generateCSVExport(mockAttendanceData);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('text/csv;charset=utf-8;');
      expect(result.size).toBeGreaterThan(0);
    });

    it('should contain course information', async () => {
      const result = generateCSVExport(mockAttendanceData);
      const text = await result.text();

      expect(text).toContain('Computer Science 101');
      expect(text).toContain('CS101');
      expect(text).toContain('Dr. John Smith');
    });

    it('should contain session data', async () => {
      const result = generateCSVExport(mockAttendanceData);
      const text = await result.text();

      expect(text).toContain('2024-01-10');
      expect(text).toContain('Alice Johnson');
      expect(text).toContain('202301001');
    });
  });

  describe('generateExcelExport', () => {
    it('should generate an Excel blob', () => {
      const result = generateExcelExport(mockAttendanceData);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(result.size).toBeGreaterThan(0);
    });

    it('should handle courses with no sessions', () => {
      const emptyData = {
        ...mockAttendanceData,
        sessions: [],
        summary: {
          ...mockAttendanceData.summary,
          totalSessions: 0,
        },
      };

      const result = generateExcelExport(emptyData);

      expect(result).toBeInstanceOf(Blob);
      expect(result.size).toBeGreaterThan(0);
    });
  });

  describe('Data integrity', () => {
    it('should preserve all course information across formats', async () => {
      const pdfBlob = generatePDFExport(mockAttendanceData);
      const csvBlob = generateCSVExport(mockAttendanceData);
      const excelBlob = generateExcelExport(mockAttendanceData);

      // All should be valid blobs
      expect(pdfBlob).toBeInstanceOf(Blob);
      expect(csvBlob).toBeInstanceOf(Blob);
      expect(excelBlob).toBeInstanceOf(Blob);

      // CSV should contain all key information
      const csvText = await csvBlob.text();
      expect(csvText).toContain(mockAttendanceData.courseInfo.courseName);
      expect(csvText).toContain(mockAttendanceData.courseInfo.courseCode);
      expect(csvText).toContain(mockAttendanceData.courseInfo.lecturerName);
    });

    it('should handle manual overrides correctly', async () => {
      const csvBlob = generateCSVExport(mockAttendanceData);
      const csvText = await csvBlob.text();

      // Should contain manual override indicator
      expect(csvText).toContain('Manual Override');
      expect(csvText).toContain('Regular Check-in');
    });

    it('should include summary statistics', async () => {
      const csvBlob = generateCSVExport(mockAttendanceData);
      const csvText = await csvBlob.text();

      expect(csvText).toContain('Total Sessions');
      expect(csvText).toContain('2'); // totalSessions
      expect(csvText).toContain('Total Attendance Records');
      expect(csvText).toContain('8'); // totalAttendanceRecords
    });
  });
});
