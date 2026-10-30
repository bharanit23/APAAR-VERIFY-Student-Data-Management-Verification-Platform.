/**
 * Intelligent Anomaly & Institutional Risk Engine
 * Analyzes admission data patterns, duplicate graphs, and compliance signals.
 */

import { StudentRecord, Institution, ComplianceCase, RiskLevel } from '../types';

export interface InstitutionRiskEvaluation {
  institutionId: string;
  institutionName: string;
  riskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  totalStudents: number;
  unverifiedApaarCount: number;
  duplicateCount: number;
  excessIntakeCount: number;
  quotaViolationsCount: number;
  factors: Array<{
    title: string;
    description: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    penalty: number;
  }>;
}

export function evaluateInstitutionRisk(
  institution: Institution,
  students: StudentRecord[],
  cases: ComplianceCase[]
): InstitutionRiskEvaluation {
  const instStudents = students.filter(s => s.institutionId === institution.id);
  const instCases = cases.filter(
    c => c.institutionId === institution.id || c.secondaryInstitutionId === institution.id
  );

  const factors: InstitutionRiskEvaluation['factors'] = [];
  let score = 0;

  // 1. Cross-institution or Intra-institution Duplicates
  const duplicates = instStudents.filter(s => s.flaggedDuplicate);
  if (duplicates.length > 0) {
    const penalty = Math.min(40, duplicates.length * 15);
    score += penalty;
    factors.push({
      title: 'Active Duplicate APAAR Enrolments Detected',
      description: `${duplicates.length} student record(s) flagged with conflicting concurrent enrolments across institutions or repeated internal IDs.`,
      severity: duplicates.length > 2 ? 'CRITICAL' : 'HIGH',
      penalty,
    });
  }

  // 2. Open Compliance Cases
  const openCases = instCases.filter(c => c.status === 'OPEN' || c.status === 'CLARIFICATION_REQUESTED');
  if (openCases.length > 0) {
    const penalty = Math.min(30, openCases.length * 10);
    score += penalty;
    factors.push({
      title: 'Unresolved AICTE Compliance Cases',
      description: `${openCases.length} open regulatory investigation(s) awaiting institutional explanation or resolution.`,
      severity: 'HIGH',
      penalty,
    });
  }

  // 3. Excess Intake or Quota Breach cases
  const excessIntakeCases = instCases.filter(c => c.caseType === 'EXCESS_INTAKE_VIOLATION' && c.status !== 'RESOLVED');
  if (excessIntakeCases.length > 0) {
    score += 25;
    factors.push({
      title: 'Sanctioned Intake Over-Admission',
      description: 'Institutional admissions exceed AICTE approved maximum threshold in one or more engineering departments.',
      severity: 'CRITICAL',
      penalty: 25,
    });
  }

  // 4. Low APAAR Verification Rate
  const unverified = instStudents.filter(
    s => s.apaarVerificationStatus === 'INVALID_FORMAT' || s.apaarVerificationStatus === 'NAME_MISMATCH' || s.apaarVerificationStatus === 'NOT_FOUND'
  );
  if (unverified.length > 0) {
    const penalty = Math.min(20, unverified.length * 5);
    score += penalty;
    factors.push({
      title: 'National Registry Verification Discrepancies',
      description: `${unverified.length} record(s) failed ABC/DigiLocker verification due to invalid format, name mismatch, or missing identity reference.`,
      severity: 'MEDIUM',
      penalty,
    });
  }

  // Cap score at 100
  const finalScore = Math.min(100, Math.max(5, score));

  let riskLevel: RiskLevel = 'LOW';
  if (finalScore >= 75) riskLevel = 'CRITICAL';
  else if (finalScore >= 50) riskLevel = 'HIGH';
  else if (finalScore >= 25) riskLevel = 'MEDIUM';

  return {
    institutionId: institution.id,
    institutionName: institution.name,
    riskScore: finalScore,
    riskLevel,
    totalStudents: instStudents.length,
    unverifiedApaarCount: unverified.length,
    duplicateCount: duplicates.length,
    excessIntakeCount: excessIntakeCases.length,
    quotaViolationsCount: instCases.filter(c => c.caseType === 'NRI_QUOTA_BREACH').length,
    factors,
  };
}
