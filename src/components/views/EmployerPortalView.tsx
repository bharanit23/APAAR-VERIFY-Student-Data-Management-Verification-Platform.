import React, { useState } from 'react';
import {
  Search,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Download,
  QrCode,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { VerificationRequest, StudentRecord, Institution, Program } from '../../types';
import { maskApaarId } from '../../services/cryptoService';
import { dbRepository } from '../../services/storageRepository';

interface EmployerPortalViewProps {
  requests: VerificationRequest[];
  students: StudentRecord[];
  institutions: Institution[];
  programs: Program[];
  onSubmitRequest: (req: any) => void;
  onNavigateTab: (tab: any) => void;
}

export const EmployerPortalView: React.FC<EmployerPortalViewProps> = ({
  requests,
  students,
  institutions,
  programs,
  onSubmitRequest,
  onNavigateTab,
}) => {
  const [apaarQuery, setApaarQuery] = useState('712345678901');
  const [purposeQuery, setPurposeQuery] = useState('Campus Recruitment Background Verification for Associate Software Engineer');
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    'Enrolment Status',
    'Program & Branch',
    'AICTE Institution Accreditation',
    'APAAR Verification Validity',
  ]);
  const [activeRequest, setActiveRequest] = useState<VerificationRequest | null>(
    requests[0] || null
  );

  const handleScopeToggle = (scope: string) => {
    setSelectedScopes(prev =>
      prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope]
    );
  };

  const handleNewRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = apaarQuery.replace(/\s+/g, '');
    const matchedStudent = dbRepository.getStudentByApaar(clean);

    const newReq: VerificationRequest = {
      id: `REQ-${Date.now()}`,
      requestId: `VER-REQ-2025-${Math.floor(1000 + Math.random() * 9000)}`,
      verifierId: 'USR-EMP-01',
      verifierOrg: 'Tata Consultancy Services (TCS)',
      verifierEmail: 'rajesh.menon@tcs-talent.com',
      targetApaarId: clean,
      studentId: matchedStudent?.id,
      purpose: purposeQuery,
      requestedFields: selectedScopes,
      status: 'PENDING_CONSENT',
      createdAt: new Date().toISOString(),
    };

    onSubmitRequest(newReq);
    setActiveRequest(newReq);
  };

  const matchedStudent = activeRequest?.studentId
    ? students.find(s => s.id === activeRequest.studentId)
    : undefined;
  const inst = matchedStudent ? institutions.find(i => i.id === matchedStudent.institutionId) : undefined;
  const prog = matchedStudent ? programs.find(p => p.id === matchedStudent.programId) : undefined;

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs text-slate-500 mb-0.5">
            Authorized Verifier Gateway / Background Verification
          </div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Employer & Third-Party Academic Credential Verification Portal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Consent-driven candidate background verification backed by National APAAR reference and AICTE central registry.
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Authorized Entity</span>
          <span className="text-xs font-semibold text-slate-800">Tata Consultancy Services Ltd. (TCS)</span>
        </div>
      </div>

      {/* Main 2-Column Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Request Form & Previous Requests */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3.5">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-blue-600" />
              <span>Initiate Verification Request</span>
            </h2>

            <form onSubmit={handleNewRequest} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Candidate APAAR ID (12 Digits) *
                </label>
                <input
                  type="text"
                  maxLength={14}
                  placeholder="e.g. 712345678901"
                  value={apaarQuery}
                  onChange={e => setApaarQuery(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono text-xs focus:outline-none focus:border-[#17365D]"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Verification Purpose *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pre-employment Background Check"
                  value={purposeQuery}
                  onChange={e => setPurposeQuery(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">
                  Requested Information Scope:
                </label>
                <div className="space-y-1.5">
                  {[
                    'Enrolment Status',
                    'Program & Branch',
                    'AICTE Institution Accreditation',
                    'APAAR Verification Validity',
                  ].map(sc => (
                    <label key={sc} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedScopes.includes(sc)}
                        onChange={() => handleScopeToggle(sc)}
                        className="rounded border-slate-300 text-[#17365D]"
                      />
                      <span className="text-slate-700 text-xs">{sc}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#17365D] hover:bg-[#0F243E] text-white font-semibold rounded text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Submit Verification Query</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Verification Requests History */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Verification Queries History ({requests.length})
            </h3>
            <div className="space-y-1.5">
              {requests.map(r => (
                <div
                  key={r.id}
                  onClick={() => setActiveRequest(r)}
                  className={`p-2.5 rounded border text-xs cursor-pointer transition-all ${
                    activeRequest?.id === r.id
                      ? 'bg-blue-50/70 border-blue-400 font-medium'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-slate-900">{r.requestId}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                        r.status === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : r.status === 'CONSENT_DENIED'
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {r.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">{r.purpose}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Verification Result & Minimization Display */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  REF: {activeRequest?.requestId || 'N/A'}
                </span>
                <h2 className="text-sm font-bold text-slate-900">
                  Authorized Verification Result Certificate
                </h2>
              </div>

              {activeRequest && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded border uppercase ${
                    activeRequest.status === 'VERIFIED'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : activeRequest.status === 'CONSENT_DENIED'
                      ? 'bg-red-100 text-red-800 border-red-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  {activeRequest.status.replace('_', ' ')}
                </span>
              )}
            </div>

            {!activeRequest && (
              <div className="p-8 text-center text-slate-400 text-xs">
                Select or submit a verification query to view the authorized response.
              </div>
            )}

            {activeRequest && activeRequest.status === 'PENDING_CONSENT' && (
              <div className="p-6 bg-amber-50/70 border border-amber-200 rounded-lg text-center space-y-3">
                <Clock className="w-10 h-10 text-amber-600 mx-auto" />
                <h3 className="text-sm font-bold text-amber-950">
                  Awaiting Student Consent (DPDP Compliant)
                </h3>
                <p className="text-xs text-amber-800 max-w-md mx-auto leading-relaxed">
                  In compliance with the Digital Personal Data Protection Act, verification details will be released once student <strong>Aryan Sharma</strong> authorizes this request in their student portal.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => onNavigateTab('student_portal')}
                    className="px-3.5 py-1.5 bg-[#17365D] hover:bg-[#0F243E] text-white text-xs font-semibold rounded shadow-sm inline-flex items-center gap-1.5"
                  >
                    <span>Switch to Student Portal to Grant Consent →</span>
                  </button>
                </div>
              </div>
            )}

            {activeRequest && activeRequest.status === 'VERIFIED' && matchedStudent && (
              <div className="space-y-4">
                {/* Official Verification Slip */}
                <div className="border border-slate-300 rounded-lg p-4 bg-slate-50/50 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <span className="font-bold text-xs uppercase tracking-wide text-slate-900">
                        AICTE National Depository Verified Academic Record
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                      AUTHENTICATED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Candidate Legal Name</span>
                      <span className="font-bold text-slate-900 text-sm">{matchedStudent.name}</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">National APAAR Reference</span>
                      <span className="font-mono font-semibold text-slate-800">{maskApaarId(matchedStudent.apaarId)}</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">AICTE Approved Institution</span>
                      <span className="font-semibold text-slate-900">{inst?.name}</span>
                      <span className="text-[10px] text-slate-500 block">{inst?.aicteApprovalId}</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Program & Branch</span>
                      <span className="font-semibold text-slate-900">{prog?.name}</span>
                      <span className="text-[10px] text-slate-500 block">Academic Year: {matchedStudent.academicYear}</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Enrolment Status</span>
                      <span className="font-bold text-emerald-700">Enrolled & Compliant</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">DigiLocker / ABC Status</span>
                      <span className="font-bold text-emerald-700">Verified National Reference</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded border border-slate-200 text-[11px] text-slate-500 space-y-1">
                    <div><strong>Requester:</strong> Tata Consultancy Services Ltd.</div>
                    <div><strong>Purpose:</strong> {activeRequest.purpose}</div>
                    <div><strong>Timestamp:</strong> {new Date().toLocaleString()} (Secure Audit Log AUD-001)</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Print Official Certificate</span>
                  </button>

                  <button
                    onClick={() => onNavigateTab('credentials_qr')}
                    className="text-xs font-semibold text-[#17365D] hover:underline flex items-center gap-1"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Verify via Public QR Scanner →</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
