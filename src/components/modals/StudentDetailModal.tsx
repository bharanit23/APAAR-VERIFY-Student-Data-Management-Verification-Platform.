import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Calendar,
  Building2,
  Mail,
  Phone,
  QrCode,
  User,
  Hash,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { StudentRecord, Institution, Program, DigitalCredential } from '../../types';
import { maskApaarId, formatApaarWithSpaces } from '../../services/cryptoService';
import { dbRepository } from '../../services/storageRepository';

interface StudentDetailModalProps {
  student: StudentRecord;
  institution?: Institution;
  program?: Program;
  credential?: DigitalCredential;
  onClose: () => void;
  onIssueCredential: (student: StudentRecord) => void;
  onUpdateStudent: (id: string, updates: Partial<StudentRecord>) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  institution,
  program,
  credential,
  onClose,
  onIssueCredential,
  onUpdateStudent,
}) => {
  const [showRawApaar, setShowRawApaar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(student.name);
  const [editRoll, setEditRoll] = useState(student.rollNumber);
  const [editStatus, setEditStatus] = useState(student.academicStatus);

  const consents = dbRepository.getConsentsForStudent(student.id);

  const handleSave = () => {
    onUpdateStudent(student.id, {
      name: editName,
      rollNumber: editRoll,
      academicStatus: editStatus,
    });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 bg-[#17365D] text-white flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-white text-[#17365D] flex items-center justify-center font-bold text-sm">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">{student.name}</h2>
              <p className="text-[11px] text-slate-300 font-mono">
                Student UUID: {student.id} · Roll: {student.rollNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-xs text-slate-700">
          {/* Duplicate Conflict Warning if flagged */}
          {student.flaggedDuplicate && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start gap-2 text-red-800">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <div>
                  <div className="font-bold text-red-900 uppercase tracking-wide text-[11px]">
                    Flagged Duplicate Conflict ({student.duplicateConflictType})
                  </div>
                  <div className="mt-0.5 text-slate-700">
                    This APAAR identity appears concurrently enrolled in another record. AICTE compliance case has been initiated for investigation.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Identity & APAAR Card */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                National Academic Identity
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  student.apaarVerificationStatus === 'VERIFIED'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : student.apaarVerificationStatus === 'PENDING'
                    ? 'bg-slate-100 text-slate-700 border-slate-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                {student.apaarVerificationStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[11px] text-slate-500 block">Masked APAAR ID:</span>
                <div className="font-mono font-semibold text-slate-900 text-sm mt-0.5 flex items-center gap-2">
                  <span>{showRawApaar ? formatApaarWithSpaces(student.apaarId) : maskApaarId(student.apaarId)}</span>
                  <button
                    onClick={() => setShowRawApaar(!showRawApaar)}
                    className="text-[10px] text-blue-600 hover:underline font-sans font-normal"
                  >
                    {showRawApaar ? 'Mask' : 'Reveal'}
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                  HMAC: {student.apaarIdHmac.slice(0, 18)}...
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block">Date of Birth & Gender:</span>
                <span className="font-medium text-slate-800 block mt-0.5">
                  {student.dob} · {student.gender}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Category: {student.admissionCategory} ({student.seatType} Seat)
                </span>
              </div>
            </div>

            {student.verificationFailureReason && (
              <div className="mt-2 pt-2 border-t border-slate-200 text-amber-800 text-[11px]">
                <strong>Discrepancy:</strong> {student.verificationFailureReason}
              </div>
            )}
          </div>

          {/* Academic & Institution Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 border border-slate-200 rounded-md">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Institution
              </span>
              <div className="font-semibold text-slate-900">{institution?.name || student.institutionId}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{institution?.aicteApprovalId} · {institution?.state}</div>
            </div>

            <div className="p-3 border border-slate-200 rounded-md">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Program & Year
              </span>
              <div className="font-semibold text-slate-900">{program?.name || student.programId}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Academic Year: {student.academicYear} · Status: {student.academicStatus}
              </div>
            </div>
          </div>

          {/* Edit Form (if toggled) */}
          {isEditing ? (
            <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-lg space-y-3">
              <h3 className="font-bold text-blue-900 text-xs">Edit Student Registration Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Roll Number</label>
                  <input
                    type="text"
                    value={editRoll}
                    onChange={e => setEditRoll(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-900"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 text-xs border border-slate-300 bg-white rounded text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-3 py-1 text-xs bg-[#17365D] text-white rounded font-medium hover:bg-[#0F243E]"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs font-semibold text-[#17365D] hover:underline"
              >
                Edit Registration Details
              </button>

              {credential ? (
                <div className="flex items-center gap-1.5 text-purple-700 font-semibold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Credential Issued ({credential.credentialId})</span>
                </div>
              ) : (
                <button
                  onClick={() => onIssueCredential(student)}
                  className="px-3 py-1.5 bg-[#17365D] hover:bg-[#0F243E] text-white rounded text-xs font-medium flex items-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Issue Verifiable Credential</span>
                </button>
              )}
            </div>
          )}

          {/* Consent History & DPDP Authorization */}
          <div className="border-t border-slate-200 pt-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Consent & Employer Verification History ({consents.length})
            </h3>
            {consents.length === 0 ? (
              <p className="text-[11px] text-slate-400">No external verification requests submitted yet for this student.</p>
            ) : (
              <div className="space-y-2">
                {consents.map(c => (
                  <div key={c.id} className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{c.requesterOrg}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          c.status === 'GRANTED'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : c.status === 'DENIED'
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">{c.requesterPurpose}</div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Scope: {c.scope.join(', ')} · Requested: {new Date(c.requestedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
