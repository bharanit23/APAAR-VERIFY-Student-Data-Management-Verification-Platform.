/**
 * Export and Reporting Service for APAAR-Verify
 * Generates downloadable CSV datasets and formatted printable reports.
 */

import { StudentRecord, Institution, Program, ApprovedIntake, AcademicYear } from '../types';

export function downloadCsvFile(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 1. Institution Admissions CSV Report
export function exportInstitutionAdmissionsCsv(
  students: StudentRecord[],
  institutions: Institution[],
  programs: Program[]
): string {
  const headers = [
    'Student UUID',
    'Masked APAAR ID',
    'Institutional Student ID',
    'Roll Number',
    'Student Name',
    'DOB',
    'Gender',
    'Institution Name',
    'AICTE Code',
    'Program',
    'Academic Year',
    'Admission Date',
    'Admission Category',
    'Seat Type',
    'Enrolment Status',
    'APAAR Verification Status',
    'Risk Level',
  ];

  const rows = students.map(s => {
    const inst = institutions.find(i => i.id === s.institutionId);
    const prog = programs.find(p => p.id === s.programId);
    return [
      s.id,
      s.apaarId.length === 12 ? `•••• •••• ${s.apaarId.slice(-4)}` : s.apaarId,
      s.institutionalStudentId,
      s.rollNumber,
      `"${s.name.replace(/"/g, '""')}"`,
      s.dob,
      s.gender,
      `"${(inst?.name || s.institutionId).replace(/"/g, '""')}"`,
      inst?.code || '',
      `"${(prog?.name || s.programId).replace(/"/g, '""')}"`,
      s.academicYear,
      s.admissionDate,
      s.admissionCategory,
      s.seatType,
      s.academicStatus,
      s.apaarVerificationStatus,
      s.riskLevel,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

// 2. Intake vs Enrolment Compliance CSV Report
export function exportIntakeComplianceCsv(
  institutions: Institution[],
  programs: Program[],
  intakes: ApprovedIntake[],
  students: StudentRecord[],
  year: AcademicYear
): string {
  const headers = [
    'Institution Name',
    'AICTE Approval ID',
    'State',
    'Program Code',
    'Program Name',
    'Academic Year',
    'Sanctioned Intake',
    'Actual Enrolment',
    'Remaining Seats',
    'Intake Utilization (%)',
    'Compliance Status',
    'NRI Permitted',
    'NRI Admitted',
  ];

  const rows: string[] = [];

  for (const inst of institutions) {
    for (const prog of programs) {
      const intakeRule = intakes.find(
        i => i.institutionId === inst.id && i.programId === prog.id && i.academicYear === year
      );
      if (!intakeRule) continue;

      const enrolled = students.filter(
        s => s.institutionId === inst.id && s.programId === prog.id && s.academicYear === year && s.academicStatus === 'Enrolled'
      );
      const actualCount = enrolled.length;
      const sanctioned = intakeRule.approvedIntake;
      const utilPct = sanctioned > 0 ? ((actualCount / sanctioned) * 100).toFixed(1) : '0';
      const status = actualCount > sanctioned ? 'EXCESS_INTAKE_VIOLATION' : 'COMPLIANT';
      const nriAdmitted = enrolled.filter(s => s.isNri || s.seatType === 'NRI').length;

      rows.push(
        [
          `"${inst.name.replace(/"/g, '""')}"`,
          inst.aicteApprovalId,
          inst.state,
          prog.code,
          `"${prog.name.replace(/"/g, '""')}"`,
          year,
          sanctioned,
          actualCount,
          Math.max(0, sanctioned - actualCount),
          `${utilPct}%`,
          status,
          intakeRule.nriQuota,
          nriAdmitted,
        ].join(',')
      );
    }
  }

  return [headers.join(','), ...rows].join('\n');
}

// 3. Duplicate APAAR Conflict CSV Report
export function exportDuplicateConflictsCsv(
  students: StudentRecord[],
  institutions: Institution[]
): string {
  const headers = [
    'Student Name',
    'Masked APAAR ID',
    'Conflict Type',
    'Primary Institution',
    'Primary Roll Number',
    'Conflicting Institution / ID',
    'Risk Level',
    'Action Required',
  ];

  const duplicates = students.filter(s => s.flaggedDuplicate);
  const rows = duplicates.map(s => {
    const inst = institutions.find(i => i.id === s.institutionId);
    const confInst = institutions.find(i => i.id === s.conflictingInstitutionId);

    return [
      `"${s.name.replace(/"/g, '""')}"`,
      `•••• •••• ${s.apaarId.slice(-4)}`,
      s.duplicateConflictType || 'INTERNAL',
      `"${(inst?.name || s.institutionId).replace(/"/g, '""')}"`,
      s.rollNumber,
      `"${(confInst?.name || s.conflictingInstitutionId || s.conflictingStudentId || '').replace(/"/g, '""')}"`,
      s.riskLevel,
      'Review via AICTE Compliance Portal',
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

// Generate Blank CSV Template for Institutional Upload
export function generateUploadCsvTemplate(): string {
  const headers = [
    'apaar_id',
    'institutional_student_id',
    'roll_number',
    'student_name',
    'dob',
    'gender',
    'email',
    'mobile',
    'admission_date',
    'admission_category',
    'seat_type',
    'is_nri',
    'is_supernumerary',
  ];

  const samples = [
    '712345678901,IITD-2024-CS901,2024CS1901,Abhinav Deshmukh,2004-06-15,MALE,abhinav.d@iitd.ac.in,+91 98110 12345,2024-07-20,General,Merit,false,false',
    '456789012345,IITD-2024-CS902,2024CS1902,Kalyani Venkat,2004-03-22,FEMALE,kalyani.v@iitd.ac.in,+91 98110 54321,2024-07-20,OBC-NCL,Merit,false,false',
  ];

  return [headers.join(','), ...samples].join('\n');
}
