/**
 * Automated Validation Engine for APAAR-Verify
 * Implements rigorous rule-based checks with actionable correction suggestions.
 */

import { StudentRecord, ApprovedIntake, ValidationErrorItem, AcademicYear } from '../types';
import { validateApaarFormat } from './apaarMockProvider';
import { computeDeterministicHmac } from './cryptoService';

export interface ValidationContext {
  existingStudents: StudentRecord[];
  approvedIntakes: ApprovedIntake[];
  institutionId: string;
  programId: string;
  academicYear: AcademicYear;
}

export function validateSingleStudentRecord(
  record: Partial<StudentRecord>,
  rowNumber: number,
  context: ValidationContext,
  batchRecords: Partial<StudentRecord>[] = []
): ValidationErrorItem[] {
  const errors: ValidationErrorItem[] = [];

  // Rule 1: Mandatory Fields Check
  if (!record.name || record.name.trim().length === 0) {
    errors.push({
      row: rowNumber,
      field: 'name',
      value: record.name || '',
      severity: 'Critical',
      ruleId: 'RULE-MANDATORY-NAME',
      message: 'Student legal full name is missing.',
      suggestion: 'Provide the official student name matching secondary school certificate.',
    });
  }

  if (!record.rollNumber || record.rollNumber.trim().length === 0) {
    errors.push({
      row: rowNumber,
      field: 'rollNumber',
      value: record.rollNumber || '',
      severity: 'High',
      ruleId: 'RULE-MANDATORY-ROLL',
      message: 'Institutional roll number / registration number is missing.',
      suggestion: 'Enter the unique roll number assigned by the institution registrar.',
    });
  }

  if (!record.dob || !/^\d{4}-\d{2}-\d{2}$/.test(record.dob.trim())) {
    errors.push({
      row: rowNumber,
      field: 'dob',
      value: record.dob || '',
      severity: 'High',
      ruleId: 'RULE-INVALID-DOB',
      message: 'Date of birth is missing or not in standard ISO YYYY-MM-DD format.',
      suggestion: 'Reformat date of birth as YYYY-MM-DD (e.g. 2004-05-14).',
    });
  }

  // Rule 2: APAAR ID Format & Presence
  if (!record.apaarId || record.apaarId.trim().length === 0) {
    errors.push({
      row: rowNumber,
      field: 'apaarId',
      value: '',
      severity: 'Critical',
      ruleId: 'RULE-MISSING-APAAR',
      message: 'Mandatory 12-digit APAAR ID is absent.',
      suggestion: 'Obtain student APAAR ID via DigiLocker / ABC portal or student consent.',
    });
  } else {
    const fmt = validateApaarFormat(record.apaarId);
    if (!fmt.valid) {
      errors.push({
        row: rowNumber,
        field: 'apaarId',
        value: record.apaarId,
        severity: 'Critical',
        ruleId: 'RULE-INVALID-APAAR-FORMAT',
        message: fmt.reason || 'Invalid APAAR format.',
        suggestion: 'Ensure APAAR is exactly 12 numeric digits without spaces, hyphens, or letters.',
      });
    }
  }

  // Rule 3: Intra-institution Duplicate APAAR (inside batch or existing database)
  if (record.apaarId && /^\d{12}$/.test(record.apaarId.replace(/\s+/g, ''))) {
    const cleanId = record.apaarId.replace(/\s+/g, '');
    const hmac = computeDeterministicHmac(cleanId);

    // Check against batch
    const duplicateInBatch = batchRecords.find(
      (b, idx) => idx !== rowNumber - 1 && b.apaarId?.replace(/\s+/g, '') === cleanId
    );
    if (duplicateInBatch) {
      errors.push({
        row: rowNumber,
        field: 'apaarId',
        value: record.apaarId,
        severity: 'Critical',
        ruleId: 'RULE-INTRA-BATCH-DUPLICATE-APAAR',
        message: `Duplicate APAAR ID appears multiple times within this upload batch.`,
        suggestion: 'Verify if the student was accidentally entered twice in this upload file.',
      });
    }

    // Check against database within same institution
    const duplicateInSameInst = context.existingStudents.find(
      s => s.institutionId === context.institutionId && s.apaarIdHmac === hmac && s.id !== record.id
    );
    if (duplicateInSameInst) {
      errors.push({
        row: rowNumber,
        field: 'apaarId',
        value: record.apaarId,
        severity: 'Critical',
        ruleId: 'RULE-INTRA-INST-DUPLICATE-APAAR',
        message: `APAAR ID is already enrolled in this institution under Student ID ${duplicateInSameInst.institutionalStudentId} (${duplicateInSameInst.name}).`,
        suggestion: 'Check if this is a duplicate admission or re-registration. Do not create multiple active identities.',
      });
    }

    // Rule 4: Cross-institution Duplicate APAAR (Inter-institution enrollment conflict)
    const duplicateInOtherInst = context.existingStudents.find(
      s => s.institutionId !== context.institutionId && s.apaarIdHmac === hmac && s.academicStatus === 'Enrolled' && s.id !== record.id
    );
    if (duplicateInOtherInst) {
      errors.push({
        row: rowNumber,
        field: 'apaarId',
        value: record.apaarId,
        severity: 'High',
        ruleId: 'RULE-CROSS-INST-DUPLICATE-APAAR',
        message: `Cross-Institution conflict: This APAAR ID is concurrently active in another AICTE institution (${duplicateInOtherInst.institutionId}).`,
        suggestion: 'Flag record for AICTE compliance review. Verify transfer certificate / migration status before confirming enrollment.',
      });
    }
  }

  // Rule 5: Duplicate Institutional Student ID or Roll Number
  if (record.rollNumber) {
    const dupRoll = context.existingStudents.find(
      s => s.institutionId === context.institutionId && s.programId === context.programId && s.academicYear === context.academicYear && s.rollNumber.toLowerCase() === record.rollNumber?.toLowerCase() && s.id !== record.id
    );
    if (dupRoll) {
      errors.push({
        row: rowNumber,
        field: 'rollNumber',
        value: record.rollNumber,
        severity: 'High',
        ruleId: 'RULE-DUPLICATE-ROLL-NUMBER',
        message: `Roll number '${record.rollNumber}' is already assigned to student ${dupRoll.name} in this program.`,
        suggestion: 'Ensure institutional roll numbers are unique per program and academic year.',
      });
    }
  }

  // Rule 6: Admission Date Validity
  if (record.admissionDate) {
    const admYear = new Date(record.admissionDate).getFullYear();
    const currYear = new Date().getFullYear();
    if (isNaN(admYear) || admYear < 2018 || admYear > currYear + 1) {
      errors.push({
        row: rowNumber,
        field: 'admissionDate',
        value: record.admissionDate,
        severity: 'Medium',
        ruleId: 'RULE-INVALID-ADMISSION-DATE',
        message: `Admission date year ${admYear} is outside plausible range for academic year ${context.academicYear}.`,
        suggestion: 'Verify admission date against institutional admission registry.',
      });
    }
  }

  return errors;
}

/**
 * Validates aggregate admission limits (Intake & Category Quotas)
 */
export function validateIntakeLimits(
  batchStudents: Partial<StudentRecord>[],
  context: ValidationContext
): ValidationErrorItem[] {
  const errors: ValidationErrorItem[] = [];

  const intakeRule = context.approvedIntakes.find(
    i => i.institutionId === context.institutionId && i.programId === context.programId && i.academicYear === context.academicYear
  );

  if (!intakeRule) {
    errors.push({
      row: 0,
      field: 'approvedIntake',
      value: 'Not Configured',
      severity: 'Critical',
      ruleId: 'RULE-MISSING-APPROVED-INTAKE',
      message: `No approved intake configuration found for this program in academic year ${context.academicYear}.`,
      suggestion: 'Configure official AICTE approved intake for this program before uploading student records.',
    });
    return errors;
  }

  // Current enrolled students in this institution, program, and year
  const currentEnrolled = context.existingStudents.filter(
    s => s.institutionId === context.institutionId && s.programId === context.programId && s.academicYear === context.academicYear && s.academicStatus === 'Enrolled'
  );

  const totalAfterBatch = currentEnrolled.length + batchStudents.length;
  const approvedLimit = intakeRule.approvedIntake;

  // Rule: Exceeding Approved Intake
  if (totalAfterBatch > approvedLimit) {
    errors.push({
      row: 0,
      field: 'approvedIntake',
      value: `${totalAfterBatch} / ${approvedLimit}`,
      severity: 'Critical',
      ruleId: 'RULE-EXCESS-INTAKE-VIOLATION',
      message: `Admissions exceed AICTE approved intake! Total would be ${totalAfterBatch} students against approved capacity of ${approvedLimit} (${totalAfterBatch - approvedLimit} excess seats).`,
      suggestion: 'Admissions beyond AICTE sanctioned intake violate regulatory guidelines. Cancel excess unapproved admissions or apply for supernumerary approval.',
    });
  }

  // Rule: NRI Quota Limits
  const currentNri = currentEnrolled.filter(s => s.isNri || s.seatType === 'NRI').length;
  const batchNri = batchStudents.filter(s => s.isNri || s.seatType === 'NRI').length;
  const totalNri = currentNri + batchNri;
  if (totalNri > intakeRule.nriQuota) {
    errors.push({
      row: 0,
      field: 'nriQuota',
      value: `${totalNri} / ${intakeRule.nriQuota}`,
      severity: 'High',
      ruleId: 'RULE-NRI-QUOTA-BREACH',
      message: `NRI admissions (${totalNri}) exceed AICTE approved quota limit of ${intakeRule.nriQuota}.`,
      suggestion: `Reclassify non-resident seats or adjust to within permissible ${intakeRule.nriQuota} threshold.`,
    });
  }

  return errors;
}
