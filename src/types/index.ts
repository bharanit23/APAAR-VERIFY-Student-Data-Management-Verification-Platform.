export type UserRole =
  | 'aicte_admin'
  | 'aicte_reviewer'
  | 'inst_admin'
  | 'admission_officer'
  | 'student'
  | 'employer_verifier'
  | 'auditor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institutionId?: string;
  institutionName?: string;
  designation: string;
  avatar?: string;
}

export interface Institution {
  id: string;
  aicteApprovalId: string;
  code: string;
  name: string;
  shortName: string;
  state: string;
  district: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  status: 'APPROVED' | 'PROVISIONAL' | 'UNDER_REVIEW' | 'FLAGGED';
  establishedYear: number;
  accreditation: string;
  complianceScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export type AcademicYear = '2024-25' | '2023-24' | '2022-23';

export interface Program {
  id: string;
  code: string;
  name: string;
  degree: 'B.Tech' | 'M.Tech' | 'MCA' | 'MBA' | 'B.Arch';
  durationYears: number;
}

export interface ApprovedIntake {
  id: string;
  institutionId: string;
  programId: string;
  academicYear: AcademicYear;
  approvedIntake: number;
  supernumeraryQuota: number;
  nriQuota: number;
  ociQuota: number;
  fnQuota: number;
}

export type AdmissionCategory = 'General' | 'OBC-NCL' | 'SC' | 'ST' | 'EWS';

export type SeatType = 'Merit' | 'Management' | 'Supernumerary' | 'NRI' | 'OCI' | 'FN';

export type AcademicStatus = 'Enrolled' | 'Graduated' | 'Suspended' | 'Withdrawn' | 'Transfer_Pending';

export type ApaarVerificationStatus =
  | 'VERIFIED'
  | 'INVALID_FORMAT'
  | 'NOT_FOUND'
  | 'NAME_MISMATCH'
  | 'DOB_MISMATCH'
  | 'PENDING';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface StudentRecord {
  id: string;
  apaarId: string; // 12-digit national ID e.g. 7123 4567 8901
  apaarIdHmac: string; // Deterministic HMAC hash for privacy-safe duplicate detection
  institutionalStudentId: string;
  rollNumber: string;
  name: string;
  dob: string; // YYYY-MM-DD
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  email: string;
  mobile: string;
  institutionId: string;
  programId: string;
  academicYear: AcademicYear;
  admissionDate: string;
  admissionCategory: AdmissionCategory;
  seatType: SeatType;
  isSupernumerary: boolean;
  isNri: boolean;
  isOci: boolean;
  isForeignNational: boolean;
  academicStatus: AcademicStatus;
  consentReference: string;
  apaarVerificationStatus: ApaarVerificationStatus;
  apaarVerificationDate?: string;
  verificationFailureReason?: string;
  flaggedDuplicate?: boolean;
  duplicateConflictType?: 'INTRA_INSTITUTION' | 'INTER_INSTITUTION' | 'NONE';
  conflictingInstitutionId?: string;
  conflictingStudentId?: string;
  riskLevel: RiskLevel;
  riskNotes?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ValidationErrorItem {
  row: number;
  field: string;
  value: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
  ruleId: string;
  message: string;
  suggestion: string;
}

export interface UploadBatch {
  id: string;
  batchNumber: string;
  institutionId: string;
  programId: string;
  academicYear: AcademicYear;
  fileName: string;
  uploadedBy: string;
  uploadedAt: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  warningsCount: number;
  duplicatesCount: number;
  missingApaarCount: number;
  status: 'PENDING_REVIEW' | 'VALIDATED' | 'COMMITTED' | 'REJECTED';
  errorsList: ValidationErrorItem[];
}

export type CaseStatus =
  | 'OPEN'
  | 'CLARIFICATION_REQUESTED'
  | 'RESPONSE_RECEIVED'
  | 'RESOLVED'
  | 'REJECTED';

export type CaseType =
  | 'CROSS_INSTITUTION_DUPLICATE'
  | 'INTRA_INSTITUTION_DUPLICATE'
  | 'EXCESS_INTAKE_VIOLATION'
  | 'NRI_QUOTA_BREACH'
  | 'NAME_MISMATCH_SUSPICION'
  | 'INVALID_APAAR_FORMAT';

export interface ComplianceCase {
  id: string;
  caseNumber: string;
  caseType: CaseType;
  institutionId: string;
  secondaryInstitutionId?: string;
  studentId?: string;
  secondaryStudentId?: string;
  apaarId?: string;
  programId?: string;
  academicYear: AcademicYear;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: CaseStatus;
  title: string;
  description: string;
  evidence: Record<string, any>;
  requestedClarification?: string;
  institutionResponse?: string;
  institutionResponseDate?: string;
  reviewerNotes?: string;
  openedBy: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionDecision?: string;
}

export interface ConsentRecord {
  id: string;
  studentId: string;
  requesterId: string;
  requesterName: string;
  requesterOrg: string;
  requesterPurpose: string;
  scope: string[]; // e.g. ['Enrolment Status', 'Academic Records', 'Degree Qualification', 'APAAR Reference']
  status: 'GRANTED' | 'DENIED' | 'REVOKED' | 'EXPIRED' | 'PENDING';
  requestedAt: string;
  grantedAt?: string;
  revokedAt?: string;
  expiresAt: string;
}

export interface VerificationRequest {
  id: string;
  requestId: string;
  verifierId: string;
  verifierOrg: string;
  verifierEmail: string;
  targetApaarId?: string;
  targetRollNumber?: string;
  targetInstitutionId?: string;
  targetDob?: string;
  studentId?: string;
  purpose: string;
  requestedFields: string[];
  status: 'PENDING_CONSENT' | 'VERIFIED' | 'CONSENT_DENIED' | 'NOT_FOUND';
  createdAt: string;
  completedAt?: string;
  consentId?: string;
  verificationReportId?: string;
}

export interface DigitalCredential {
  id: string;
  credentialId: string; // opaque ID e.g. CRD-2025-IND-88419
  studentId: string;
  institutionId: string;
  programId: string;
  academicYear: AcademicYear;
  issueDate: string;
  status: 'ACTIVE' | 'REVOKED';
  digitalSignature: string; // HMAC-SHA256 signature
  verificationUrl: string;
  qrPayload: string;
  revocationReason?: string;
  payloadSnapshot: {
    studentName: string;
    maskedApaarId: string;
    rollNumber: string;
    institutionName: string;
    programName: string;
    academicYear: string;
    admissionStatus: string;
    signedBy: string;
  };
}

export interface CorrectionRequest {
  id: string;
  studentId: string;
  institutionId: string;
  fieldName: 'name' | 'dob' | 'apaarId' | 'email' | 'mobile';
  currentValue: string;
  requestedValue: string;
  reason: string;
  supportingDocName: string;
  status: 'SUBMITTED' | 'INSTITUTION_VERIFIED' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  reviewedAt?: string;
  reviewerNotes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: 'STUDENT' | 'INSTITUTION' | 'BATCH' | 'CASE' | 'CREDENTIAL' | 'CONSENT' | 'SYSTEM';
  entityId: string;
  details: string;
  ipAddress: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS';
  timestamp: string;
  read: boolean;
  linkTab?: string;
  entityId?: string;
  roleFilter?: UserRole[];
}
