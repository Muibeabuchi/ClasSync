import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export interface AttendanceExportData {
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

/**
 * Generate PDF export of attendance data
 */
export const generatePDFExport = (data: AttendanceExportData): Blob => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;

  // Title and Course Information
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Attendance Report', pageWidth / 2, 25, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  let yPosition = 45;

  // Course Details
  doc.setFont('helvetica', 'bold');
  doc.text('Course Information:', margin, yPosition);
  yPosition += 8;

  doc.setFont('helvetica', 'normal');
  doc.text(
    `Course: ${data.courseInfo.courseName} (${data.courseInfo.courseCode})`,
    margin,
    yPosition,
  );
  yPosition += 6;
  doc.text(
    `Lecturer: ${data.courseInfo.lecturerTitle} ${data.courseInfo.lecturerName}`,
    margin,
    yPosition,
  );
  yPosition += 6;
  doc.text(
    `Status: ${data.courseInfo.status.toUpperCase()}`,
    margin,
    yPosition,
  );
  yPosition += 6;
  doc.text(
    `Export Date: ${new Date(data.exportTimestamp).toLocaleDateString()}`,
    margin,
    yPosition,
  );
  yPosition += 15;

  // Summary Statistics
  doc.setFont('helvetica', 'bold');
  doc.text('Summary Statistics:', margin, yPosition);
  yPosition += 8;

  const summaryData = [
    ['Total Sessions', data.summary.totalSessions.toString()],
    [
      'Total Attendance Records',
      data.summary.totalAttendanceRecords.toString(),
    ],
    ['Manual Overrides', data.summary.totalManualOverrides.toString()],
    [
      'Average Attendance/Session',
      data.summary.averageAttendancePerSession.toString(),
    ],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [66, 139, 202] },
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { fontStyle: 'bold' },
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 20;

  // Sessions Details
  if (data.sessions.length > 0) {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 25;
    }

    doc.setFont('helvetica', 'bold');
    doc.text('Session Details:', margin, yPosition);
    yPosition += 10;

    const sessionData = data.sessions.map((session) => [
      session.date,
      session.time,
      session.status.toUpperCase(),
      session.attendanceCodeUsed ? 'Yes' : 'No',
      session.totalPresent.toString(),
      session.manualOverrides.toString(),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Date', 'Time', 'Status', 'Code Used', 'Present', 'Overrides']],
      body: sessionData,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] },
      margin: { left: margin, right: margin },
      styles: { fontSize: 9 },
    });

    // Detailed attendance for each session
    data.sessions.forEach((session, index) => {
      if (session.studentsPresent.length > 0) {
        doc.addPage();
        yPosition = 25;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(
          `Session ${index + 1} - ${session.date} at ${session.time}`,
          margin,
          yPosition,
        );
        yPosition += 15;

        const studentData = session.studentsPresent.map((student) => [
          student.name,
          student.registrationNumber,
          new Date(student.checkInTime).toLocaleTimeString(),
          student.isManualOverride ? 'Manual Override' : 'Regular Check-in',
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [
            ['Student Name', 'Registration Number', 'Check-in Time', 'Type'],
          ],
          body: studentData,
          theme: 'striped',
          headStyles: { fillColor: [66, 139, 202] },
          margin: { left: margin, right: margin },
          styles: { fontSize: 10 },
          columnStyles: {
            3: {
              cellWidth: 35,
              fontSize: 9,
            },
          },
        });
      }
    });
  }

  return new Blob([doc.output('blob')], { type: 'application/pdf' });
};

/**
 * Generate CSV export of attendance data
 */
export const generateCSVExport = (data: AttendanceExportData): Blob => {
  const csvData: any[] = [];

  // Course Information Header
  csvData.push(['ATTENDANCE REPORT']);
  csvData.push(['']);
  csvData.push(['Course Information']);
  csvData.push(['Course Name', data.courseInfo.courseName]);
  csvData.push(['Course Code', data.courseInfo.courseCode]);
  csvData.push([
    'Lecturer',
    `${data.courseInfo.lecturerTitle} ${data.courseInfo.lecturerName}`,
  ]);
  csvData.push(['Status', data.courseInfo.status.toUpperCase()]);
  csvData.push([
    'Export Date',
    new Date(data.exportTimestamp).toLocaleDateString(),
  ]);
  csvData.push(['']);

  // Summary Statistics
  csvData.push(['Summary Statistics']);
  csvData.push(['Total Sessions', data.summary.totalSessions]);
  csvData.push([
    'Total Attendance Records',
    data.summary.totalAttendanceRecords,
  ]);
  csvData.push(['Manual Overrides', data.summary.totalManualOverrides]);
  csvData.push([
    'Average Attendance per Session',
    data.summary.averageAttendancePerSession,
  ]);
  csvData.push(['']);

  // Session Overview
  csvData.push(['Session Overview']);
  csvData.push([
    'Date',
    'Time',
    'Status',
    'Code Used',
    'Students Present',
    'Manual Overrides',
  ]);

  data.sessions.forEach((session) => {
    csvData.push([
      session.date,
      session.time,
      session.status.toUpperCase(),
      session.attendanceCodeUsed ? 'Yes' : 'No',
      session.totalPresent,
      session.manualOverrides,
    ]);
  });

  csvData.push(['']);

  // Detailed Attendance Records
  csvData.push(['Detailed Attendance Records']);
  csvData.push([
    'Session Date',
    'Session Time',
    'Student Name',
    'Registration Number',
    'Check-in Time',
    'Type',
  ]);

  data.sessions.forEach((session) => {
    session.studentsPresent.forEach((student) => {
      csvData.push([
        session.date,
        session.time,
        student.name,
        student.registrationNumber,
        new Date(student.checkInTime).toLocaleTimeString(),
        student.isManualOverride ? 'Manual Override' : 'Regular Check-in',
      ]);
    });
  });

  const csvString = Papa.unparse(csvData);
  return new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
};

/**
 * Generate Excel export of attendance data
 */
export const generateExcelExport = (data: AttendanceExportData): Blob => {
  const workbook = XLSX.utils.book_new();

  // Course Information Sheet
  const courseInfoData = [
    ['ATTENDANCE REPORT'],
    [''],
    ['Course Information'],
    ['Course Name', data.courseInfo.courseName],
    ['Course Code', data.courseInfo.courseCode],
    [
      'Lecturer',
      `${data.courseInfo.lecturerTitle} ${data.courseInfo.lecturerName}`,
    ],
    ['Status', data.courseInfo.status.toUpperCase()],
    ['Export Date', new Date(data.exportTimestamp).toLocaleDateString()],
    [''],
    ['Summary Statistics'],
    ['Total Sessions', data.summary.totalSessions],
    ['Total Attendance Records', data.summary.totalAttendanceRecords],
    ['Manual Overrides', data.summary.totalManualOverrides],
    [
      'Average Attendance per Session',
      data.summary.averageAttendancePerSession,
    ],
  ];

  const courseInfoSheet = XLSX.utils.aoa_to_sheet(courseInfoData);

  // Set column widths
  courseInfoSheet['!cols'] = [{ width: 25 }, { width: 30 }];

  XLSX.utils.book_append_sheet(workbook, courseInfoSheet, 'Course Info');

  // Session Overview Sheet
  const sessionOverviewData = [
    [
      'Date',
      'Time',
      'Status',
      'Code Used',
      'Students Present',
      'Manual Overrides',
    ],
    ...data.sessions.map((session) => [
      session.date,
      session.time,
      session.status.toUpperCase(),
      session.attendanceCodeUsed ? 'Yes' : 'No',
      session.totalPresent,
      session.manualOverrides,
    ]),
  ];

  const sessionOverviewSheet = XLSX.utils.aoa_to_sheet(sessionOverviewData);
  sessionOverviewSheet['!cols'] = [
    { width: 12 },
    { width: 10 },
    { width: 12 },
    { width: 12 },
    { width: 15 },
    { width: 15 },
  ];

  XLSX.utils.book_append_sheet(
    workbook,
    sessionOverviewSheet,
    'Session Overview',
  );

  // Detailed Attendance Sheet
  const detailedAttendanceData = [
    [
      'Session Date',
      'Session Time',
      'Student Name',
      'Registration Number',
      'Check-in Time',
      'Type',
    ],
    ...data.sessions.flatMap((session) =>
      session.studentsPresent.map((student) => [
        session.date,
        session.time,
        student.name,
        student.registrationNumber,
        new Date(student.checkInTime).toLocaleTimeString(),
        student.isManualOverride ? 'Manual Override' : 'Regular Check-in',
      ]),
    ),
  ];

  const detailedAttendanceSheet = XLSX.utils.aoa_to_sheet(
    detailedAttendanceData,
  );
  detailedAttendanceSheet['!cols'] = [
    { width: 12 },
    { width: 12 },
    { width: 25 },
    { width: 18 },
    { width: 15 },
    { width: 18 },
  ];

  XLSX.utils.book_append_sheet(
    workbook,
    detailedAttendanceSheet,
    'Detailed Attendance',
  );

  // Individual Session Sheets (if there are sessions)
  data.sessions.forEach((session, index) => {
    if (session.studentsPresent.length > 0) {
      const sessionData = [
        [`Session ${index + 1} - ${session.date} at ${session.time}`],
        [''],
        ['Session Details'],
        ['Status', session.status.toUpperCase()],
        ['Attendance Code Used', session.attendanceCodeUsed ? 'Yes' : 'No'],
        ['Total Present', session.totalPresent],
        ['Manual Overrides', session.manualOverrides],
        [''],
        ['Student Attendance'],
        ['Student Name', 'Registration Number', 'Check-in Time', 'Type'],
        ...session.studentsPresent.map((student) => [
          student.name,
          student.registrationNumber,
          new Date(student.checkInTime).toLocaleTimeString(),
          student.isManualOverride ? 'Manual Override' : 'Regular Check-in',
        ]),
      ];

      const sessionSheet = XLSX.utils.aoa_to_sheet(sessionData);
      sessionSheet['!cols'] = [
        { width: 25 },
        { width: 18 },
        { width: 15 },
        { width: 18 },
      ];

      XLSX.utils.book_append_sheet(
        workbook,
        sessionSheet,
        `Session ${index + 1}`,
      );
    }
  });

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
};
