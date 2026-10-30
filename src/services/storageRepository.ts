/**
 * In-Browser Persistent PostgreSQL-Modelled Repository
 * Simulates normalized relational database tables with localStorage persistence.
 */

import {
  Institution,
  Program,
  ApprovedIntake,
  StudentRecord,
  ComplianceCase,
  ConsentRecord,
  VerificationRequest,
  DigitalCredential,
  AuditLog,
  UploadBatch,
  NotificationItem,
  User,
  AcademicYear,
} from '../types';
import {
  SEED_INSTITUTIONS,
  SEED_PROGRAMS,
  SEED_APPROVED_INTAKES,
  SEED_STUDENTS,
  SEED_CASES,
  SEED_CONSENTS,
  SEED_VERIFICATION_REQUESTS,
  SEED_CREDENTIALS,
  SEED_AUDIT_LOGS,
  SEED_USERS,
} from '../data/seedData';
import { computeDeterministicHmac } from './cryptoService';

const STORAGE_KEYS = {
  INSTITUTIONS: 'apaar_db_institutions_v1',
  PROGRAMS: 'apaar_db_programs_v1',
  INTAKES: 'apaar_db_intakes_v1',
  STUDENTS: 'apaar_db_students_v1',
  CASES: 'apaar_db_cases_v1',
  CONSENTS: 'apaar_db_consents_v1',
  REQUESTS: 'apaar_db_requests_v1',
  CREDENTIALS: 'apaar_db_credentials_v1',
  BATCHES: 'apaar_db_batches_v1',
  AUDIT: 'apaar_db_audit_v1',
  NOTIFICATIONS: 'apaar_db_notifications_v1',
  CURRENT_USER: 'apaar_current_user_v1',
};

class StorageRepository {
  private institutions: Institution[] = [];
  private programs: Program[] = [];
  private intakes: ApprovedIntake[] = [];
  private students: StudentRecord[] = [];
  private cases: ComplianceCase[] = [];
  private consents: ConsentRecord[] = [];
  private verificationRequests: VerificationRequest[] = [];
  private credentials: DigitalCredential[] = [];
  private batches: UploadBatch[] = [];
  private auditLogs: AuditLog[] = [];
  private notifications: NotificationItem[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  private init() {
    try {
      const storedInst = localStorage.getItem(STORAGE_KEYS.INSTITUTIONS);
      if (storedInst) {
        this.institutions = JSON.parse(storedInst);
        this.programs = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRAMS) || '[]');
        this.intakes = JSON.parse(localStorage.getItem(STORAGE_KEYS.INTAKES) || '[]');
        this.students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
        this.cases = JSON.parse(localStorage.getItem(STORAGE_KEYS.CASES) || '[]');
        this.consents = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONSENTS) || '[]');
        this.verificationRequests = JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || '[]');
        this.credentials = JSON.parse(localStorage.getItem(STORAGE_KEYS.CREDENTIALS) || '[]');
        this.batches = JSON.parse(localStorage.getItem(STORAGE_KEYS.BATCHES) || '[]');
        this.auditLogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT) || '[]');
        this.notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
      } else {
        this.resetToSeedData();
      }
    } catch (e) {
      console.warn('Error reading from localStorage, resetting to seeds:', e);
      this.resetToSeedData();
    }
  }

  public resetToSeedData() {
    this.institutions = [...SEED_INSTITUTIONS];
    this.programs = [...SEED_PROGRAMS];
    this.intakes = [...SEED_APPROVED_INTAKES];
    this.students = [...SEED_STUDENTS];
    this.cases = [...SEED_CASES];
    this.consents = [...SEED_CONSENTS];
    this.verificationRequests = [...SEED_VERIFICATION_REQUESTS];
    this.credentials = [...SEED_CREDENTIALS];
    this.batches = [
      {
        id: 'BATCH-2024-CEG-01',
        batchNumber: 'UB-2024-0089',
        institutionId: 'INST-CEG',
        programId: 'PROG-CSE',
        academicYear: '2024-25',
        fileName: 'ceg_cse_fresh_admissions_2024.csv',
        uploadedBy: 'Dr. Meenakshi Sundaram',
        uploadedAt: '2024-07-20T09:00:00Z',
        totalRows: 130,
        validRows: 120,
        invalidRows: 10,
        warningsCount: 4,
        duplicatesCount: 2,
        missingApaarCount: 1,
        status: 'COMMITTED',
        errorsList: [],
      },
    ];
    this.auditLogs = [...SEED_AUDIT_LOGS];
    this.notifications = [
      {
        id: 'NOTIF-01',
        title: 'Cross-Institution Conflict Detected',
        message: 'APAAR ID 6345 6789 0123 has concurrent active enrolment at IIT Delhi and CEG Anna University.',
        type: 'CRITICAL',
        timestamp: '2024-07-29T14:00:00Z',
        read: false,
        linkTab: 'cases',
        entityId: 'CASE-2024-001',
      },
      {
        id: 'NOTIF-02',
        title: 'Excess Intake Alert',
        message: 'CEG Anna University B.Tech CSE admissions exceeded approved quota by 10 seats.',
        type: 'CRITICAL',
        timestamp: '2024-08-01T10:30:00Z',
        read: false,
        linkTab: 'cases',
        entityId: 'CASE-2024-002',
      },
      {
        id: 'NOTIF-03',
        title: 'Academic Verification Requested',
        message: 'TCS Talent Acquisition requested verification for Aryan Sharma.',
        type: 'INFO',
        timestamp: '2024-08-10T09:15:00Z',
        read: false,
        linkTab: 'student_portal',
        entityId: 'CONS-DEMO-01',
      },
    ];
    this.saveAll();
    this.notify();
  }

  private saveAll() {
    try {
      localStorage.setItem(STORAGE_KEYS.INSTITUTIONS, JSON.stringify(this.institutions));
      localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(this.programs));
      localStorage.setItem(STORAGE_KEYS.INTAKES, JSON.stringify(this.intakes));
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(this.students));
      localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(this.cases));
      localStorage.setItem(STORAGE_KEYS.CONSENTS, JSON.stringify(this.consents));
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(this.verificationRequests));
      localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(this.credentials));
      localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(this.batches));
      localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(this.auditLogs));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
    } catch (e) {
      console.error('Failed saving to localStorage:', e);
    }
  }

  // Institutions
  public getInstitutions(): Institution[] {
    return this.institutions;
  }

  public getInstitutionById(id: string): Institution | undefined {
    return this.institutions.find(i => i.id === id);
  }

  public updateInstitution(id: string, updates: Partial<Institution>): Institution {
    const idx = this.institutions.findIndex(i => i.id === id);
    if (idx !== -1) {
      this.institutions[idx] = { ...this.institutions[idx], ...updates };
      this.saveAll();
      this.notify();
      return this.institutions[idx];
    }
    throw new Error('Institution not found');
  }

  // Programs & Intakes
  public getPrograms(): Program[] {
    return this.programs;
  }

  public getApprovedIntakes(): ApprovedIntake[] {
    return this.intakes;
  }

  public updateApprovedIntake(id: string, newIntake: number, nriQuota: number): ApprovedIntake {
    const idx = this.intakes.findIndex(i => i.id === id);
    if (idx !== -1) {
      this.intakes[idx] = {
        ...this.intakes[idx],
        approvedIntake: newIntake,
        nriQuota: nriQuota,
      };
      this.saveAll();
      this.notify();
      return this.intakes[idx];
    }
    throw new Error('Intake record not found');
  }

  // Students
  public getStudents(filters?: {
    institutionId?: string;
    programId?: string;
    academicYear?: AcademicYear | 'ALL';
    status?: string;
    verificationStatus?: string;
    riskLevel?: string;
    search?: string;
  }): StudentRecord[] {
    let result = [...this.students];
    if (!filters) return result;

    if (filters.institutionId && filters.institutionId !== 'ALL') {
      result = result.filter(s => s.institutionId === filters.institutionId);
    }
    if (filters.programId && filters.programId !== 'ALL') {
      result = result.filter(s => s.programId === filters.programId);
    }
    if (filters.academicYear && filters.academicYear !== 'ALL') {
      result = result.filter(s => s.academicYear === filters.academicYear);
    }
    if (filters.status && filters.status !== 'ALL') {
      result = result.filter(s => s.academicStatus === filters.status);
    }
    if (filters.verificationStatus && filters.verificationStatus !== 'ALL') {
      result = result.filter(s => s.apaarVerificationStatus === filters.verificationStatus);
    }
    if (filters.riskLevel && filters.riskLevel !== 'ALL') {
      result = result.filter(s => s.riskLevel === filters.riskLevel);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.rollNumber.toLowerCase().includes(q) ||
          s.institutionalStudentId.toLowerCase().includes(q) ||
          s.apaarId.includes(q) ||
          s.email.toLowerCase().includes(q)
      );
    }
    return result;
  }

  public getStudentById(id: string): StudentRecord | undefined {
    return this.students.find(s => s.id === id);
  }

  public getStudentByApaar(apaarId: string): StudentRecord | undefined {
    const clean = apaarId.replace(/\s+/g, '');
    const hmac = computeDeterministicHmac(clean);
    return this.students.find(s => s.apaarIdHmac === hmac || s.apaarId.replace(/\s+/g, '') === clean);
  }

  public createStudentRecord(record: Omit<StudentRecord, 'id' | 'createdAt' | 'updatedAt' | 'apaarIdHmac'>): StudentRecord {
    const id = `STU-GEN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();
    const hmac = computeDeterministicHmac(record.apaarId);
    const newStudent: StudentRecord = {
      ...record,
      id,
      apaarIdHmac: hmac,
      createdAt: now,
      updatedAt: now,
    };
    this.students.unshift(newStudent);
    this.addAuditLog({
      actorId: 'CURRENT_USER',
      actorName: 'Institution Officer',
      actorRole: 'admission_officer',
      action: 'CREATE_STUDENT_RECORD',
      entityType: 'STUDENT',
      entityId: id,
      details: `Created student registration for ${newStudent.name} (${newStudent.rollNumber})`,
      ipAddress: '127.0.0.1',
    });
    this.saveAll();
    this.notify();
    return newStudent;
  }

  public updateStudentRecord(id: string, updates: Partial<StudentRecord>): StudentRecord {
    const idx = this.students.findIndex(s => s.id === id);
    if (idx !== -1) {
      if (updates.apaarId) {
        updates.apaarIdHmac = computeDeterministicHmac(updates.apaarId);
      }
      this.students[idx] = {
        ...this.students[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.addAuditLog({
        actorId: 'CURRENT_USER',
        actorName: 'Authorized Registrar',
        actorRole: 'inst_admin',
        action: 'UPDATE_STUDENT_RECORD',
        entityType: 'STUDENT',
        entityId: id,
        details: `Updated record fields: ${Object.keys(updates).join(', ')}`,
        ipAddress: '127.0.0.1',
      });
      this.saveAll();
      this.notify();
      return this.students[idx];
    }
    throw new Error('Student not found');
  }

  public deleteStudentRecord(id: string): boolean {
    const idx = this.students.findIndex(s => s.id === id);
    if (idx !== -1) {
      const s = this.students[idx];
      this.students.splice(idx, 1);
      this.addAuditLog({
        actorId: 'CURRENT_USER',
        actorName: 'Authorized Registrar',
        actorRole: 'inst_admin',
        action: 'DELETE_STUDENT_RECORD',
        entityType: 'STUDENT',
        entityId: id,
        details: `Deleted student record for ${s.name} (${s.rollNumber})`,
        ipAddress: '127.0.0.1',
      });
      this.saveAll();
      this.notify();
      return true;
    }
    return false;
  }

  // Upload Batches
  public getUploadBatches(): UploadBatch[] {
    return this.batches;
  }

  public createUploadBatch(batch: UploadBatch): UploadBatch {
    this.batches.unshift(batch);
    this.saveAll();
    this.notify();
    return batch;
  }

  public commitBatchRecords(batchId: string, records: StudentRecord[]): void {
    const b = this.batches.find(item => item.id === batchId);
    if (b) {
      b.status = 'COMMITTED';
    }
    // Add records
    for (const r of records) {
      // Check if already exists
      const existingIdx = this.students.findIndex(s => s.id === r.id);
      if (existingIdx !== -1) {
        this.students[existingIdx] = r;
      } else {
        this.students.unshift(r);
      }
    }
    this.addAuditLog({
      actorId: 'CURRENT_USER',
      actorName: 'Admission Registrar',
      actorRole: 'admission_officer',
      action: 'BATCH_COMMITTED',
      entityType: 'BATCH',
      entityId: batchId,
      details: `Committed ${records.length} validated student records to institutional repository`,
      ipAddress: '127.0.0.1',
    });
    this.saveAll();
    this.notify();
  }

  // Cases
  public getCases(): ComplianceCase[] {
    return this.cases;
  }

  public getCaseById(id: string): ComplianceCase | undefined {
    return this.cases.find(c => c.id === id);
  }

  public updateCase(id: string, updates: Partial<ComplianceCase>): ComplianceCase {
    const idx = this.cases.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.cases[idx] = {
        ...this.cases[idx],
        ...updates,
      };
      this.addAuditLog({
        actorId: 'CURRENT_USER',
        actorName: 'AICTE Reviewer',
        actorRole: 'aicte_reviewer',
        action: 'UPDATE_COMPLIANCE_CASE',
        entityType: 'CASE',
        entityId: id,
        details: `Updated case ${this.cases[idx].caseNumber}: status -> ${this.cases[idx].status}`,
        ipAddress: '127.0.0.1',
      });
      this.saveAll();
      this.notify();
      return this.cases[idx];
    }
    throw new Error('Case not found');
  }

  // Consents
  public getConsents(): ConsentRecord[] {
    return this.consents;
  }

  public getConsentsForStudent(studentId: string): ConsentRecord[] {
    return this.consents.filter(c => c.studentId === studentId);
  }

  public updateConsentStatus(id: string, status: 'GRANTED' | 'DENIED' | 'REVOKED'): ConsentRecord {
    const idx = this.consents.findIndex(c => c.id === id);
    if (idx !== -1) {
      const now = new Date().toISOString();
      this.consents[idx] = {
        ...this.consents[idx],
        status,
        grantedAt: status === 'GRANTED' ? now : this.consents[idx].grantedAt,
        revokedAt: status === 'REVOKED' ? now : undefined,
      };
      // If linked to a verification request, update that too
      const req = this.verificationRequests.find(r => r.consentId === id);
      if (req) {
        req.status = status === 'GRANTED' ? 'VERIFIED' : status === 'DENIED' ? 'CONSENT_DENIED' : 'PENDING_CONSENT';
        req.completedAt = status === 'GRANTED' ? now : undefined;
      }
      this.addAuditLog({
        actorId: 'CURRENT_USER',
        actorName: 'Student User',
        actorRole: 'student',
        action: `CONSENT_${status}`,
        entityType: 'CONSENT',
        entityId: id,
        details: `Consent record ${id} status set to ${status}`,
        ipAddress: '127.0.0.1',
      });
      this.saveAll();
      this.notify();
      return this.consents[idx];
    }
    throw new Error('Consent record not found');
  }

  // Verification Requests
  public getVerificationRequests(): VerificationRequest[] {
    return this.verificationRequests;
  }

  public createVerificationRequest(req: VerificationRequest): VerificationRequest {
    this.verificationRequests.unshift(req);
    // If student exists, automatically create matching pending consent record
    if (req.studentId) {
      const consentId = `CONS-AUTO-${Date.now()}`;
      this.consents.unshift({
        id: consentId,
        studentId: req.studentId,
        requesterId: req.verifierId,
        requesterName: req.verifierOrg,
        requesterOrg: req.verifierOrg,
        requesterPurpose: req.purpose,
        scope: req.requestedFields,
        status: 'PENDING',
        requestedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      req.consentId = consentId;
    }
    this.addAuditLog({
      actorId: req.verifierId,
      actorName: req.verifierOrg,
      actorRole: 'employer_verifier',
      action: 'CREATE_VERIFICATION_REQUEST',
      entityType: 'SYSTEM',
      entityId: req.requestId,
      details: `Created candidate verification request for student ID: ${req.studentId || 'Query'}`,
      ipAddress: '127.0.0.1',
    });
    this.saveAll();
    this.notify();
    return req;
  }

  // Credentials
  public getCredentials(): DigitalCredential[] {
    return this.credentials;
  }

  public getCredentialById(id: string): DigitalCredential | undefined {
    return this.credentials.find(c => c.credentialId === id || c.id === id);
  }

  public createCredential(cred: DigitalCredential): DigitalCredential {
    this.credentials.unshift(cred);
    this.addAuditLog({
      actorId: 'CURRENT_USER',
      actorName: 'Digital Signing Authority',
      actorRole: 'inst_admin',
      action: 'ISSUE_DIGITAL_CREDENTIAL',
      entityType: 'CREDENTIAL',
      entityId: cred.credentialId,
      details: `Issued verifiable cryptographic student credential for ${cred.payloadSnapshot.studentName} (${cred.credentialId})`,
      ipAddress: '127.0.0.1',
    });
    this.saveAll();
    this.notify();
    return cred;
  }

  public revokeCredential(credentialId: string, reason: string): boolean {
    const cred = this.credentials.find(c => c.credentialId === credentialId || c.id === credentialId);
    if (cred) {
      cred.status = 'REVOKED';
      cred.revocationReason = reason;
      this.addAuditLog({
        actorId: 'CURRENT_USER',
        actorName: 'AICTE Compliance Office',
        actorRole: 'aicte_reviewer',
        action: 'REVOKE_CREDENTIAL',
        entityType: 'CREDENTIAL',
        entityId: cred.credentialId,
        details: `Revoked credential ${cred.credentialId}. Reason: ${reason}`,
        ipAddress: '127.0.0.1',
      });
      this.saveAll();
      this.notify();
      return true;
    }
    return false;
  }

  // Audit Logs
  public getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  public addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const log: AuditLog = {
      ...entry,
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    // Keep max 200 logs
    if (this.auditLogs.length > 200) {
      this.auditLogs = this.auditLogs.slice(0, 200);
    }
    this.saveAll();
  }

  // Notifications
  public getNotifications(): NotificationItem[] {
    return this.notifications;
  }

  public markNotificationRead(id: string): void {
    const n = this.notifications.find(item => item.id === id);
    if (n) {
      n.read = true;
      this.saveAll();
      this.notify();
    }
  }

  public markAllNotificationsRead(): void {
    this.notifications.forEach(n => (n.read = true));
    this.saveAll();
    this.notify();
  }

  public addNotification(notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>): void {
    this.notifications.unshift({
      ...notif,
      id: `NOTIF-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    });
    this.saveAll();
    this.notify();
  }
}

export const dbRepository = new StorageRepository();
