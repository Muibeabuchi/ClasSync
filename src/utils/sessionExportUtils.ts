import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export interface SessionExportData {
  courseInfo: {
    courseName: string;
    courseCode: string;
    lecturerName: string;
    lecturerTitle: string;
    status: string;
  };
  session: {
    sessionId: string;
    date: string;
    time: string;
    status: string;
    attendanceCodeUsed: boolean;
    totalPresent: number;
    totalEnrolled: number;
    manualOverrides: number;
    studentsPresent: Array<{
      name: string;
      registrationNumber: string;
      checkInTime: string;
      isManualOverride: boolean;
    }>;
  };
  summary: {
    totalEnrolled: number;
    totalPresent: number;
    totalAbsent: number;
    manualOverrides: number;
    attendancePercentage: number;
  };
  exportTimestamp: string;
}

/**
 * Generate PDF export for a single attendance session
 */
export const generateSessionPDFExport = (data: SessionExportData): Blob => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;

  // Title and Session Information
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Attendance Session Report', pageWidth / 2, 25, { align: 'center' });

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
  yPosition += 15;

  // Session Details
  doc.setFont('helvetica', 'bold');
  doc.text('Session Details:', margin, yPosition);
  yPosition += 8;

  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${data.session.date}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Time: ${data.session.time}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Status: ${data.session.status.toUpperCase()}`, margin, yPosition);
  yPosition += 6;
  doc.text(
    `Attendance Code Used: ${data.session.attendanceCodeUsed ? 'Yes' : 'No'}`,
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
    ['Total Enrolled Students', data.summary.totalEnrolled.toString()],
    ['Students Present', data.summary.totalPresent.toString()],
    ['Students Absent', data.summary.totalAbsent.toString()],
    ['Manual Overrides', data.summary.manualOverrides.toString()],
    ['Attendance Percentage', `${data.summary.attendancePercentage}%`],
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

  // Student Attendance List
  if (data.session.studentsPresent.length > 0) {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 25;
    }

    doc.setFont('helvetica', 'bold');
    doc.text('Students Present:', margin, yPosition);
    yPosition += 10;

    const studentData = data.session.studentsPresent.map((student) => [
      student.name,
      student.registrationNumber,
      new Date(student.checkInTime).toLocaleTimeString(),
      student.isManualOverride ? 'Manual Override' : 'Regular Check-in',
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Student Name', 'Registration Number', 'Check-in Time', 'Type']],
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

  return new Blob([doc.output('blob')], { type: 'application/pdf' });
};

/**
 * Generate CSV export for a single attendance session
 */
export const generateSessionCSVExport = (data: SessionExportData): Blob => {
  const csvData: any[] = [];

  // Session Report Header
  csvData.push(['ATTENDANCE SESSION REPORT']);
  csvData.push(['']);
  csvData.push(['Course Information']);
  csvData.push(['Course Name', data.courseInfo.courseName]);
  csvData.push(['Course Code', data.courseInfo.courseCode]);
  csvData.push([
    'Lecturer',
    `${data.courseInfo.lecturerTitle} ${data.courseInfo.lecturerName}`,
  ]);
  csvData.push(['']);

  // Session Details
  csvData.push(['Session Details']);
  csvData.push(['Date', data.session.date]);
  csvData.push(['Time', data.session.time]);
  csvData.push(['Status', data.session.status.toUpperCase()]);
  csvData.push([
    'Attendance Code Used',
    data.session.attendanceCodeUsed ? 'Yes' : 'No',
  ]);
  csvData.push([
    'Export Date',
    new Date(data.exportTimestamp).toLocaleDateString(),
  ]);
  csvData.push(['']);

  // Summary Statistics
  csvData.push(['Summary Statistics']);
  csvData.push(['Total Enrolled Students', data.summary.totalEnrolled]);
  csvData.push(['Students Present', data.summary.totalPresent]);
  csvData.push(['Students Absent', data.summary.totalAbsent]);
  csvData.push(['Manual Overrides', data.summary.manualOverrides]);
  csvData.push([
    'Attendance Percentage',
    `${data.summary.attendancePercentage}%`,
  ]);
  csvData.push(['']);

  // Student Attendance Records
  csvData.push(['Student Attendance Records']);
  csvData.push([
    'Student Name',
    'Registration Number',
    'Check-in Time',
    'Type',
  ]);

  data.session.studentsPresent.forEach((student) => {
    csvData.push([
      student.name,
      student.registrationNumber,
      new Date(student.checkInTime).toLocaleTimeString(),
      student.isManualOverride ? 'Manual Override' : 'Regular Check-in',
    ]);
  });

  const csvString = Papa.unparse(csvData);
  return new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
};

/**
 * Generate Excel export for a single attendance session
 */
export const generateSessionExcelExport = (data: SessionExportData): Blob => {
  const workbook = XLSX.utils.book_new();

  // Session Information Sheet
  const sessionInfoData = [
    ['ATTENDANCE SESSION REPORT'],
    [''],
    ['Course Information'],
    ['Course Name', data.courseInfo.courseName],
    ['Course Code', data.courseInfo.courseCode],
    [
      'Lecturer',
      `${data.courseInfo.lecturerTitle} ${data.courseInfo.lecturerName}`,
    ],
    [''],
    ['Session Details'],
    ['Date', data.session.date],
    ['Time', data.session.time],
    ['Status', data.session.status.toUpperCase()],
    ['Attendance Code Used', data.session.attendanceCodeUsed ? 'Yes' : 'No'],
    ['Export Date', new Date(data.exportTimestamp).toLocaleDateString()],
    [''],
    ['Summary Statistics'],
    ['Total Enrolled Students', data.summary.totalEnrolled],
    ['Students Present', data.summary.totalPresent],
    ['Students Absent', data.summary.totalAbsent],
    ['Manual Overrides', data.summary.manualOverrides],
    ['Attendance Percentage', `${data.summary.attendancePercentage}%`],
  ];

  const sessionInfoSheet = XLSX.utils.aoa_to_sheet(sessionInfoData);

  // Set column widths
  sessionInfoSheet['!cols'] = [{ width: 25 }, { width: 30 }];

  XLSX.utils.book_append_sheet(workbook, sessionInfoSheet, 'Session Info');

  // Student Attendance Sheet
  const attendanceData = [
    ['Student Name', 'Registration Number', 'Check-in Time', 'Type'],
    ...data.session.studentsPresent.map((student) => [
      student.name,
      student.registrationNumber,
      new Date(student.checkInTime).toLocaleTimeString(),
      student.isManualOverride ? 'Manual Override' : 'Regular Check-in',
    ]),
  ];

  const attendanceSheet = XLSX.utils.aoa_to_sheet(attendanceData);
  attendanceSheet['!cols'] = [
    { width: 25 },
    { width: 18 },
    { width: 15 },
    { width: 18 },
  ];

  XLSX.utils.book_append_sheet(workbook, attendanceSheet, 'Student Attendance');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
};
