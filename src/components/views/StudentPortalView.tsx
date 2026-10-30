import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  FileCheck2,
  AlertCircle,
  FileEdit,
  Send,
  QrCode,
  Lock,
} from 'lucide-react';
import { StudentRecord, Institution, Program, ConsentRecord, CorrectionRequest, DigitalCredential } from '../../types';
import { maskApaarId, formatApaarWithSpaces } from '../../services/cryptoService';
import { dbRepository } from '../../services/storageRepository';

interface StudentPortalViewProps {
  currentStudent: StudentRecord;
  institution?: Institution;
  program?: Program;
  credentials: DigitalCredential[];
  onNavigateTab: (tab: any) => void;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  currentStudent,
  institution,
  program,
  credentials,
  onNavigateTab,
}) => {
  const [consents, setConsents] = useState<ConsentRecord[]>(() =>
    dbRepository.getConsentsForStudent(currentStudent.id)
  );

  const [corrections, setCorrections] = useState<CorrectionRequest[]>([
    {
      id: 'CORR-01',
      studentId: currentStudent.id,
      institutionId: currentStudent.institutionId,
      fieldName: 'name',
      currentValue: 'Aryan Sharma',
      requestedValue: 'Aryan Sharma',
      reason: 'Periodic national identity registry sync verification',
      supportingDocName: 'class10_marksheet_cbse.pdf',
      status: 'APPROVED',
      createdAt: '2024-07-16T10:00:00Z',
    },
  ]);

  // Correction Form
  const [showCorrectionForm, setShowCorrectionForm] = useState(false);
  const [corrField, setCorrField] = useState<'name' | 'dob' | 'email' | 'mobile'>('name');
  const [corrValue, setCorrValue] = useState('');
  const [corrReason, setCorrReason] = useState('');
  const [corrDoc, setCorrDoc] = useState('aadhaar_card_masked.pdf');

  const studentCred = credentials.find(c => c.studentId === currentStudent.id);

  const handleConsentAction = (consentId: string, status: 'GRANTED' | 'DENIED' | 'REVOKED') => {
    dbRepository.updateConsentStatus(consentId, status);
    setConsents(dbRepository.getConsentsForStudent(currentStudent.id));
  };

  const handleRaiseCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!corrValue.trim() || !corrReason.trim()) return;

    const newReq: CorrectionRequest = {
      id: `CORR-${Date.now()}`,
      studentId: currentStudent.id,
      institutionId: currentStudent.institutionId,
      fieldName: corrField,
      currentValue: (currentStudent as any)[corrField] || '',
      requestedValue: corrValue,
      reason: corrReason,
      supportingDocName: corrDoc,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
    };

    setCorrections(prev => [newReq, ...prev]);
    setShowCorrectionForm(false);
    setCorrValue('');
    setCorrReason('');
  };

  return (
    <div className="space-y-6">
      {/* Student Identity Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#17365D] text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {currentStudent.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">{currentStudent.name}</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                ACTIVE ENROLLED
              </span>
            </div>
            <div className="text-xs text-slate-500 font-mono mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
              <span>Roll: {currentStudent.rollNumber}</span>
              <span>·</span>
              <span>{program?.name}</span>
              <span>·</span>
              <span>{institution?.name}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {studentCred && (
            <button
              onClick={() => onNavigateTab('credentials_qr')}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-[#17365D] hover:bg-[#0F243E] rounded flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>View Signed Credential & QR</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: APAAR Identity Card & Consent Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: National Academic Identity Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#17365D] text-white rounded-lg p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Government APAAR Card
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                ABC LINKED
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  APAAR Number
                </span>
                <div className="text-base font-bold font-mono tracking-wider mt-0.5">
                  {maskApaarId(currentStudent.apaarId)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Date of Birth</span>
                  <span className="font-medium text-slate-200">{currentStudent.dob}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Gender</span>
                  <span className="font-medium text-slate-200">{currentStudent.gender}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block">Enrolled Institution</span>
                <span className="text-xs font-medium text-slate-200">{institution?.name}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-700/80 text-[10px] text-slate-400 flex items-center justify-between">
              <span>National Academic Depository</span>
              <span>Encrypted Reference</span>
            </div>
          </div>

          {/* Privacy & DPDP Rights Notice */}
          <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>Digital Personal Data Protection (DPDP)</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Under Indian data protection regulations, employers and third-party verifiers cannot access your academic transcripts without your explicit, revocable consent.
            </p>
          </div>
        </div>

        {/* Right Column: Consent Requests & Correction Workflow */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Consent Requests */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Employer Background Verification Requests ({consents.length})
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Authorize or reject credential validation requests from verified recruiters.
                </p>
              </div>
            </div>

            {consents.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No pending or active verification requests.
              </div>
            ) : (
              <div className="space-y-3">
                {consents.map(c => (
                  <div key={c.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3 text-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{c.requesterOrg}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{c.requesterPurpose}</div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                          c.status === 'GRANTED'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : c.status === 'DENIED'
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : c.status === 'REVOKED'
                            ? 'bg-slate-200 text-slate-700 border-slate-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <div className="p-2.5 bg-white rounded border border-slate-200/70 text-[11px] text-slate-600">
                      <strong>Requested Information Scope:</strong> {c.scope.join(', ')}
                      <div className="text-[10px] text-slate-400 mt-1">
                        Valid until: {new Date(c.expiresAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      {c.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleConsentAction(c.id, 'GRANTED')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Grant Consent</span>
                          </button>
                          <button
                            onClick={() => handleConsentAction(c.id, 'DENIED')}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Deny Consent</span>
                          </button>
                        </>
                      )}

                      {c.status === 'GRANTED' && (
                        <button
                          onClick={() => handleConsentAction(c.id, 'REVOKED')}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-xs font-semibold transition-colors"
                        >
                          Revoke Granted Consent
                        </button>
                      )}

                      {c.status === 'REVOKED' && (
                        <span className="text-[11px] text-slate-500 italic">
                          Consent was revoked by student.
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Academic Record Correction Workflow */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Academic Record Correction Requests
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Submit proof to correct typographical errors between institutional ERP and DigiLocker.
                </p>
              </div>

              {!showCorrectionForm && (
                <button
                  onClick={() => setShowCorrectionForm(true)}
                  className="px-3 py-1.5 bg-[#17365D] hover:bg-[#0F243E] text-white rounded text-xs font-semibold flex items-center gap-1.5"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>Raise Correction</span>
                </button>
              )}
            </div>

            {showCorrectionForm && (
              <form onSubmit={handleRaiseCorrection} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3 text-xs">
                <h3 className="font-bold text-slate-900">New Correction Request</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">Field to Correct</label>
                    <select
                      value={corrField}
                      onChange={e => setCorrField(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                    >
                      <option value="name">Student Legal Name</option>
                      <option value="dob">Date of Birth</option>
                      <option value="email">Email Address</option>
                      <option value="mobile">Mobile Number</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">Correct Legal Value *</label>
                    <input
                      type="text"
                      placeholder="Enter verified correct value"
                      value={corrValue}
                      onChange={e => setCorrValue(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Reason for Discrepancy *</label>
                  <input
                    type="text"
                    placeholder="e.g. Spelling error in institutional matriculation record"
                    value={corrReason}
                    onChange={e => setCorrReason(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCorrectionForm(false)}
                    className="px-3 py-1 text-slate-600 border border-slate-300 rounded hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1 bg-[#17365D] text-white rounded font-semibold hover:bg-[#0F243E]"
                  >
                    Submit to Registrar
                  </button>
                </div>
              </form>
            )}

            {/* History Table */}
            <div className="space-y-2">
              {corrections.map(c => (
                <div key={c.id} className="p-3 bg-slate-50 rounded border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">
                      Field: <span className="uppercase font-mono">{c.fieldName}</span> → "{c.requestedValue}"
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Reason: {c.reason} · Doc: {c.supportingDocName}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                      c.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
