/**
 * Admission Compliance & Seat Utilization Engine
 * Computes AICTE regulatory metrics, utilization rates, and detects violations.
 */

import { StudentRecord, ApprovedIntake, AcademicYear } from '../types';

export interface ProgramComplianceMetrics {
  programId: string;
  programCode: string;
  programName: string;
  academicYear: AcademicYear;
  approvedIntake: number;
  actualEnrolment: number;
  remainingSeats: number;
  intakeUtilizationPct: number; // e.g. 108.3%
  isExcessAdmission: boolean;
  excessSeatsCount: number;
  categoryBreakdown: {
    merit: number;
    management: number;
    nri: number;
    oci: number;
    foreignNational: number;
    supernumerary: number;
  };
  quotas: {
    nriApproved: number;
    nriActual: number;
    nriBreached: boolean;
    supernumeraryApproved: number;
    supernumeraryActual: number;
  };
  apaarVerificationRate: number; // percentage verified
}

export function calculateProgramCompliance(
  programId: string,
  programCode: string,
  programName: string,
  institutionId: string,
  academicYear: AcademicYear,
  students: StudentRecord[],
  approvedIntakes: ApprovedIntake[]
): ProgramComplianceMetrics {
  const intakeRule = approvedIntakes.find(
    i => i.institutionId === institutionId && i.programId === programId && i.academicYear === academicYear
  );

  const approvedIntake = intakeRule ? intakeRule.approvedIntake : 120;
  const nriQuota = intakeRule ? intakeRule.nriQuota : 15;
  const supernumeraryQuota = intakeRule ? intakeRule.supernumeraryQuota : 10;

  // Filter enrolled students
  const activeStudents = students.filter(
    s => s.institutionId === institutionId && s.programId === programId && s.academicYear === academicYear && s.academicStatus === 'Enrolled'
  );

  const actualEnrolment = activeStudents.length;
  const remainingSeats = Math.max(0, approvedIntake - actualEnrolment);
  const intakeUtilizationPct = approvedIntake > 0 ? Number(((actualEnrolment / approvedIntake) * 100).toFixed(1)) : 0;
  const isExcessAdmission = actualEnrolment > approvedIntake;
  const excessSeatsCount = Math.max(0, actualEnrolment - approvedIntake);

  // Category counts
  let merit = 0;
  let management = 0;
  let nri = 0;
  let oci = 0;
  let fn = 0;
  let supernumerary = 0;
  let apaarVerified = 0;

  for (const s of activeStudents) {
    if (s.seatType === 'Merit') merit++;
    else if (s.seatType === 'Management') management++;
    else if (s.seatType === 'NRI' || s.isNri) nri++;
    else if (s.seatType === 'OCI' || s.isOci) oci++;
    else if (s.seatType === 'FN' || s.isForeignNational) fn++;
    else if (s.seatType === 'Supernumerary' || s.isSupernumerary) supernumerary++;

    if (s.apaarVerificationStatus === 'VERIFIED') apaarVerified++;
  }

  const apaarVerificationRate = actualEnrolment > 0 ? Number(((apaarVerified / actualEnrolment) * 100).toFixed(1)) : 0;

  return {
    programId,
    programCode,
    programName,
    academicYear,
    approvedIntake,
    actualEnrolment,
    remainingSeats,
    intakeUtilizationPct,
    isExcessAdmission,
    excessSeatsCount,
    categoryBreakdown: {
      merit,
      management,
      nri,
      oci,
      foreignNational: fn,
      supernumerary,
    },
    quotas: {
      nriApproved: nriQuota,
      nriActual: nri,
      nriBreached: nri > nriQuota,
      supernumeraryApproved: supernumeraryQuota,
      supernumeraryActual: supernumerary,
    },
    apaarVerificationRate,
  };
}
