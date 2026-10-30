/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  AcademicYear,
  Institution,
  Program,
  ApprovedIntake,
  StudentRecord,
  ComplianceCase,
  ConsentRecord,
  VerificationRequest,
  DigitalCredential,
  UploadBatch,
  AuditLog,
  NotificationItem,
} from './types';
import { SEED_USERS } from './data/seedData';
import { dbRepository } from './services/storageRepository';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { DemoScenariosGuide } from './components/DemoScenariosGuide';
import { NationalDashboardView } from './components/views/NationalDashboardView';
import { InstitutionDashboardView } from './components/views/InstitutionDashboardView';
import { StudentDirectoryView } from './components/views/StudentDirectoryView';
import { BulkUploadView } from './components/views/BulkUploadView';
import { ComplianceCasesView } from './components/views/ComplianceCasesView';
import { ApaarSandboxView } from './components/views/ApaarSandboxView';
import { StudentPortalView } from './components/views/StudentPortalView';
import { EmployerPortalView } from './components/views/EmployerPortalView';
import { CredentialsQrView } from './components/views/CredentialsQrView';
import { ReportsAnalyticsView } from './components/views/ReportsAnalyticsView';
import { AuditLogsView } from './components/views/AuditLogsView';
import { SwaggerDocView } from './components/views/SwaggerDocView';
import { signCredentialPayload, maskApaarId } from './services/cryptoService';

export default function App() {
  // Current logged in user (starts as AICTE Super Administrator)
  const [currentUser, setCurrentUser] = useState<User>(SEED_USERS[0]);
  const [selectedYear, setSelectedYear] = useState<AcademicYear>('2024-25');
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<NavTab>('national_dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  // Subscribed Repository State
  const [institutions, setInstitutions] = useState<Institution[]>(() => dbRepository.getInstitutions());
  const [programs, setPrograms] = useState<Program[]>(() => dbRepository.getPrograms());
  const [intakes, setIntakes] = useState<ApprovedIntake[]>(() => dbRepository.getApprovedIntakes());
  const [students, setStudents] = useState<StudentRecord[]>(() => dbRepository.getStudents());
  const [cases, setCases] = useState<ComplianceCase[]>(() => dbRepository.getCases());
  const [consents, setConsents] = useState<ConsentRecord[]>(() => dbRepository.getConsents());
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>(() =>
    dbRepository.getVerificationRequests()
  );
  const [credentials, setCredentials] = useState<DigitalCredential[]>(() => dbRepository.getCredentials());
  const [batches, setBatches] = useState<UploadBatch[]>(() => dbRepository.getUploadBatches());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => dbRepository.getAuditLogs());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    dbRepository.getNotifications()
  );

  // Contextual initial state passed to tabs (e.g. from scenario clicks)
  const [initialCaseId, setInitialCaseId] = useState<string | undefined>();

  // Subscribe to storage repository updates
  useEffect(() => {
    const unsubscribe = dbRepository.subscribe(() => {
      setInstitutions([...dbRepository.getInstitutions()]);
      setPrograms([...dbRepository.getPrograms()]);
      setIntakes([...dbRepository.getApprovedIntakes()]);
      setStudents([...dbRepository.getStudents()]);
      setCases([...dbRepository.getCases()]);
      setConsents([...dbRepository.getConsents()]);
      setVerificationRequests([...dbRepository.getVerificationRequests()]);
      setCredentials([...dbRepository.getCredentials()]);
      setBatches([...dbRepository.getUploadBatches()]);
      setAuditLogs([...dbRepository.getAuditLogs()]);
      setNotifications([...dbRepository.getNotifications()]);
    });
    return unsubscribe;
  }, []);

  // Handle switching role
  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'student') {
      setActiveTab('student_portal');
    } else if (user.role === 'employer_verifier') {
      setActiveTab('employer_portal');
    } else if (user.role === 'inst_admin' || user.role === 'admission_officer') {
      if (user.institutionId) {
        setSelectedInstitutionId(user.institutionId);
      }
      setActiveTab('institution_dashboard');
    } else {
      setActiveTab('national_dashboard');
      setSelectedInstitutionId('ALL');
    }
  };

  // Handle navigating from scenario guide or notifications
  const handleNavigateToScenario = (tab: NavTab, actionDetails?: Record<string, any>) => {
    setActiveTab(tab);
    if (actionDetails?.caseId) {
      setInitialCaseId(actionDetails.caseId);
    }
  };

  const handleOpenNotification = (notif: NotificationItem) => {
    dbRepository.markNotificationRead(notif.id);
    if (notif.linkTab) {
      setActiveTab(notif.linkTab as NavTab);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all databases and tables to initial clean demonstration seeds?')) {
      dbRepository.resetToSeedData();
    }
  };

  const handleIssueCredential = (student: StudentRecord) => {
    const inst = institutions.find(i => i.id === student.institutionId);
    const prog = programs.find(p => p.id === student.programId);
    const credId = `CRD-${selectedYear.split('-')[0]}-${inst?.shortName.replace(/\s+/g, '') || 'AICTE'}-${Math.floor(10000 + Math.random() * 90000)}`;

    const snapshot = {
      studentName: student.name,
      maskedApaarId: maskApaarId(student.apaarId),
      rollNumber: student.rollNumber,
      institutionName: inst?.name || student.institutionId,
      programName: prog?.name || student.programId,
      academicYear: student.academicYear,
      admissionStatus: student.academicStatus,
      signedBy: `${inst?.name || 'Institution Registrar'} & AICTE National Authority`,
    };

    const newCred: DigitalCredential = {
      id: `CRD-${Date.now()}`,
      credentialId: credId,
      studentId: student.id,
      institutionId: student.institutionId,
      programId: student.programId,
      academicYear: student.academicYear,
      issueDate: new Date().toISOString().slice(0, 10),
      status: 'ACTIVE',
      digitalSignature: signCredentialPayload(snapshot),
      verificationUrl: `https://aicte-verify.gov.in/verify?crd=${credId}`,
      qrPayload: JSON.stringify({
        crd: credId,
        stu: student.name,
        apaar: maskApaarId(student.apaarId),
        inst: inst?.shortName,
      }),
      payloadSnapshot: snapshot,
    };

    dbRepository.createCredential(newCred);
    setActiveTab('credentials_qr');
  };

  // Determine current active institution for institution dashboard
  const activeInstitution =
    institutions.find(i => i.id === selectedInstitutionId) ||
    institutions.find(i => i.id === currentUser.institutionId) ||
    institutions[1]; // defaults to CEG Anna University (shows demo excess intake)

  // Current student record for student portal
  const currentStudentRecord =
    students.find(s => s.email === currentUser.email) ||
    students.find(s => s.id === 'STU-DEMO-01') ||
    students[0];

  const openCasesCount = cases.filter(c => c.status !== 'RESOLVED' && c.status !== 'REJECTED').length;
  const duplicateCount = students.filter(s => s.flaggedDuplicate).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA] text-slate-900 font-sans antialiased">
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        selectedInstitutionId={selectedInstitutionId}
        onInstitutionChange={setSelectedInstitutionId}
        institutions={institutions}
        notifications={notifications}
        onOpenNotification={handleOpenNotification}
        onResetData={handleResetData}
        onOpenGuide={() => setShowGuide(true)}
      />

      {/* 10 Demonstration Scenarios Modal Guide */}
      <DemoScenariosGuide
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        onNavigateToScenario={handleNavigateToScenario}
      />

      {/* Main Body with Sidebar + View Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          userRole={currentUser.role}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          openCasesCount={openCasesCount}
          duplicateCount={duplicateCount}
        />

        {/* Viewport Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
          <div className="max-w-7xl mx-auto space-y-8">
            {activeTab === 'national_dashboard' && (
              <NationalDashboardView
                institutions={institutions}
                students={students}
                cases={cases}
                selectedYear={selectedYear}
                onNavigateTab={handleNavigateToScenario}
                onSelectInstitutionScope={setSelectedInstitutionId}
              />
            )}

            {activeTab === 'institution_dashboard' && (
              <InstitutionDashboardView
                institution={activeInstitution}
                students={students}
                programs={programs}
                intakes={intakes}
                batches={batches}
                selectedYear={selectedYear}
                onNavigateTab={handleNavigateToScenario}
              />
            )}

            {activeTab === 'students' && (
              <StudentDirectoryView
                students={students}
                institutions={institutions}
                programs={programs}
                credentials={credentials}
                selectedYear={selectedYear}
                onAddStudent={record => dbRepository.createStudentRecord(record)}
                onUpdateStudent={(id, updates) => dbRepository.updateStudentRecord(id, updates)}
                onDeleteStudent={id => dbRepository.deleteStudentRecord(id)}
                onIssueCredential={handleIssueCredential}
              />
            )}

            {activeTab === 'upload' && (
              <BulkUploadView
                institutions={institutions}
                programs={programs}
                intakes={intakes}
                existingStudents={students}
                selectedYear={selectedYear}
                onCommitBatch={(batch, validRecords) => {
                  dbRepository.createUploadBatch(batch);
                  dbRepository.commitBatchRecords(batch.id, validRecords);
                }}
              />
            )}

            {activeTab === 'cases' && (
              <ComplianceCasesView
                cases={cases}
                institutions={institutions}
                students={students}
                initialSelectedCaseId={initialCaseId}
                onUpdateCase={(id, updates) => dbRepository.updateCase(id, updates)}
              />
            )}

            {activeTab === 'apaar_sandbox' && <ApaarSandboxView />}

            {activeTab === 'student_portal' && (
              <StudentPortalView
                currentStudent={currentStudentRecord}
                institution={institutions.find(i => i.id === currentStudentRecord?.institutionId)}
                program={programs.find(p => p.id === currentStudentRecord?.programId)}
                credentials={credentials}
                onNavigateTab={handleNavigateToScenario}
              />
            )}

            {activeTab === 'employer_portal' && (
              <EmployerPortalView
                requests={verificationRequests}
                students={students}
                institutions={institutions}
                programs={programs}
                onSubmitRequest={req => dbRepository.createVerificationRequest(req)}
                onNavigateTab={handleNavigateToScenario}
              />
            )}

            {activeTab === 'credentials_qr' && (
              <CredentialsQrView
                credentials={credentials}
                students={students}
                institutions={institutions}
                programs={programs}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsAnalyticsView
                institutions={institutions}
                students={students}
                programs={programs}
                intakes={intakes}
                selectedYear={selectedYear}
              />
            )}

            {activeTab === 'audit' && <AuditLogsView logs={auditLogs} />}

            {activeTab === 'swagger' && <SwaggerDocView />}
          </div>
        </main>
      </div>
    </div>
  );
}
