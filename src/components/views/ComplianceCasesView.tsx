import React, { useState } from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  Clock,
  MessageSquare,
  FileText,
  ChevronRight,
  ShieldAlert,
  Send,
  Building,
  ArrowRight,
  Check,
  X,
} from 'lucide-react';
import { ComplianceCase, Institution, StudentRecord, CaseStatus } from '../../types';
import { maskApaarId } from '../../services/cryptoService';

interface ComplianceCasesViewProps {
  cases: ComplianceCase[];
  institutions: Institution[];
  students: StudentRecord[];
  initialSelectedCaseId?: string;
  onUpdateCase: (id: string, updates: Partial<ComplianceCase>) => void;
}

export const ComplianceCasesView: React.FC<ComplianceCasesViewProps> = ({
  cases,
  institutions,
  students,
  initialSelectedCaseId,
  onUpdateCase,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(
    initialSelectedCaseId || cases[0]?.id || null
  );
  const [statusFilter, setStatusFilter] = useState<'ALL' | CaseStatus>('ALL');

  // Form states for reviewer actions
  const [clarificationText, setClarificationText] = useState('');
  const [responseText, setResponseText] = useState('');
  const [reviewerNotesText, setReviewerNotesText] = useState('');
  const [showResponseForm, setShowResponseForm] = useState(false);

  const filteredCases = cases.filter(c => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    return true;
  });

  const activeCase = cases.find(c => c.id === selectedCaseId) || cases[0];
  const primaryInst = institutions.find(i => i.id === activeCase?.institutionId);
  const secondaryInst = institutions.find(i => i.id === activeCase?.secondaryInstitutionId);

  const handleRequestClarification = () => {
    if (!activeCase || !clarificationText.trim()) return;
    onUpdateCase(activeCase.id, {
      status: 'CLARIFICATION_REQUESTED',
      requestedClarification: clarificationText,
    });
    setClarificationText('');
  };

  const handleSimulateInstitutionResponse = () => {
    if (!activeCase || !responseText.trim()) return;
    onUpdateCase(activeCase.id, {
      status: 'RESPONSE_RECEIVED',
      institutionResponse: responseText,
      institutionResponseDate: new Date().toISOString(),
    });
    setResponseText('');
    setShowResponseForm(false);
  };

  const handleResolveCase = (decision: string) => {
    if (!activeCase) return;
    onUpdateCase(activeCase.id, {
      status: 'RESOLVED',
      resolvedAt: new Date().toISOString(),
      resolvedBy: 'AICTE Reviewer Cell',
      resolutionDecision: decision,
      reviewerNotes: reviewerNotesText || activeCase.reviewerNotes,
    });
    setReviewerNotesText('');
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs text-slate-500 mb-0.5">
            AICTE Regulatory Enforcement / Show-Cause Investigation Cell
          </div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Compliance Case Management & Show-Cause Registry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review concurrent cross-institution enrolments, sanctioned intake violations, and institutional explanations.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 font-medium rounded transition-colors ${
              statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600'
            }`}
          >
            All ({cases.length})
          </button>
          <button
            onClick={() => setStatusFilter('OPEN')}
            className={`px-3 py-1 font-medium rounded transition-colors ${
              statusFilter === 'OPEN' ? 'bg-white text-red-700 shadow-sm font-semibold' : 'text-slate-600'
            }`}
          >
            Open ({cases.filter(c => c.status === 'OPEN').length})
          </button>
          <button
            onClick={() => setStatusFilter('CLARIFICATION_REQUESTED')}
            className={`px-3 py-1 font-medium rounded transition-colors ${
              statusFilter === 'CLARIFICATION_REQUESTED' ? 'bg-white text-amber-700 shadow-sm font-semibold' : 'text-slate-600'
            }`}
          >
            Awaiting Reply
          </button>
          <button
            onClick={() => setStatusFilter('RESOLVED')}
            className={`px-3 py-1 font-medium rounded transition-colors ${
              statusFilter === 'RESOLVED' ? 'bg-white text-emerald-700 shadow-sm font-semibold' : 'text-slate-600'
            }`}
          >
            Resolved
          </button>
        </div>
      </div>

      {/* 2-Column Case Layout: List on Left, Evidence & Action Workbench on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Cases List */}
        <div className="lg:col-span-4 space-y-3">
          {filteredCases.map(c => {
            const isSelected = activeCase?.id === c.id;
            const inst = institutions.find(i => i.id === c.institutionId);

            return (
              <div
                key={c.id}
                onClick={() => setSelectedCaseId(c.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-500 shadow-sm'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-[11px] font-bold text-slate-500">
                    {c.caseNumber}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                      c.status === 'OPEN'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : c.status === 'CLARIFICATION_REQUESTED'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : c.status === 'RESPONSE_RECEIVED'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {c.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-slate-900 line-clamp-1 leading-snug">{c.title}</h3>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">{c.description}</p>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-medium text-slate-700">{inst?.shortName}</span>
                  <span className="font-mono">{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Case Details & Investigation Workbench */}
        {activeCase && (
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 shadow-xs p-6 space-y-6">
            {/* Case Header */}
            <div className="border-b border-slate-200 pb-3 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {activeCase.caseNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      activeCase.severity === 'CRITICAL'
                        ? 'bg-red-500 text-white border-red-600'
                        : 'bg-orange-500 text-white border-orange-600'
                    }`}
                  >
                    {activeCase.severity} SEVERITY
                  </span>
                </div>
                <h2 className="text-sm font-bold text-slate-900">{activeCase.title}</h2>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Opened on {new Date(activeCase.createdAt).toLocaleString()} by {activeCase.openedBy}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                <span className="text-xs font-bold text-slate-900">{activeCase.status}</span>
              </div>
            </div>

            {/* Evidence Inspection Card */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>Forensic Evidence & Conflicting System Records</span>
              </h3>

              {activeCase.caseType === 'CROSS_INSTITUTION_DUPLICATE' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded border border-slate-200">
                    <span className="text-[10px] font-bold text-blue-900 uppercase block mb-1">
                      Institution A (Primary Enrolment)
                    </span>
                    <div className="font-semibold text-slate-900">{primaryInst?.name}</div>
                    <div className="text-slate-600 text-[11px] mt-1">
                      Candidate: <strong>{activeCase.evidence?.candidateName}</strong>
                    </div>
                    <div className="text-slate-500 text-[10px] font-mono mt-0.5">
                      APAAR: {maskApaarId(activeCase.evidence?.apaarId)}
                    </div>
                    <div className="text-slate-500 text-[10px] mt-1">
                      {activeCase.evidence?.institutionA}
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded border border-slate-200">
                    <span className="text-[10px] font-bold text-red-900 uppercase block mb-1">
                      Institution B (Conflicting Enrolment)
                    </span>
                    <div className="font-semibold text-slate-900">{secondaryInst?.name}</div>
                    <div className="text-slate-600 text-[11px] mt-1">
                      Candidate: <strong>{activeCase.evidence?.candidateName}</strong>
                    </div>
                    <div className="text-slate-500 text-[10px] font-mono mt-0.5">
                      APAAR: {maskApaarId(activeCase.evidence?.apaarId)}
                    </div>
                    <div className="text-slate-500 text-[10px] mt-1">
                      {activeCase.evidence?.institutionB}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-white rounded border border-slate-200 text-xs font-mono space-y-1">
                  {Object.entries(activeCase.evidence || {}).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between text-slate-700">
                      <span className="font-semibold text-slate-900">{key}:</span>
                      <span>{String(val)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Clarification Exchange Log */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
                <span>Show-Cause Notice & Institutional Clarification</span>
              </h3>

              {activeCase.requestedClarification ? (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded text-xs space-y-1">
                  <div className="font-semibold text-amber-900 flex items-center justify-between">
                    <span>AICTE Notice to Institution:</span>
                    <span className="text-[10px] text-amber-700 font-normal">Official Regulatory Directive</span>
                  </div>
                  <p className="text-amber-950 text-[11px] leading-relaxed">
                    "{activeCase.requestedClarification}"
                  </p>
                </div>
              ) : (
                <div className="p-3 border border-slate-200 rounded space-y-2">
                  <label className="text-[11px] font-semibold text-slate-700 block">
                    Issue Formal Clarification Notice to Institution Registrar:
                  </label>
                  <textarea
                    rows={2}
                    value={clarificationText}
                    onChange={e => setClarificationText(e.target.value)}
                    placeholder="Enter official inquiry text regarding conflicting enrollment / excess seats..."
                    className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:border-[#17365D]"
                  />
                  <button
                    onClick={handleRequestClarification}
                    disabled={!clarificationText.trim()}
                    className="px-3 py-1.5 bg-[#17365D] hover:bg-[#0F243E] disabled:opacity-50 text-white rounded text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Send className="w-3 h-3" />
                    <span>Issue Clarification Notice</span>
                  </button>
                </div>
              )}

              {/* Institution Response */}
              {activeCase.institutionResponse ? (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded text-xs space-y-1">
                  <div className="font-semibold text-blue-900 flex items-center justify-between">
                    <span>Institution Formal Response:</span>
                    <span className="text-[10px] text-blue-700 font-mono">
                      Received {new Date(activeCase.institutionResponseDate || '').toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-800 text-[11px] leading-relaxed">
                    "{activeCase.institutionResponse}"
                  </p>
                </div>
              ) : activeCase.status === 'CLARIFICATION_REQUESTED' ? (
                <div>
                  {!showResponseForm ? (
                    <button
                      onClick={() => setShowResponseForm(true)}
                      className="text-xs font-semibold text-blue-700 hover:underline"
                    >
                      + Simulate Institution Response (for Testing)
                    </button>
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2 text-xs">
                      <label className="font-semibold text-slate-800 block">
                        Institution Registrar Explanation:
                      </label>
                      <textarea
                        rows={2}
                        value={responseText}
                        onChange={e => setResponseText(e.target.value)}
                        placeholder="Provide justification or transfer certificate details..."
                        className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSimulateInstitutionResponse}
                          disabled={!responseText.trim()}
                          className="px-3 py-1 bg-blue-700 text-white rounded font-medium disabled:opacity-50"
                        >
                          Submit Formal Response
                        </button>
                        <button
                          onClick={() => setShowResponseForm(false)}
                          className="px-3 py-1 border border-slate-300 rounded text-slate-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Case Resolution Actions */}
            {activeCase.status !== 'RESOLVED' && (
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Reviewer Final Determination
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      handleResolveCase(
                        'Verified Transfer Certificate: Student permitted at IIT Delhi, cancelled at CEG'
                      )
                    }
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Authorize Migration & Resolve</span>
                  </button>

                  <button
                    onClick={() =>
                      handleResolveCase(
                        'Show-Cause Upheld: Excess seats derecognized and institution penalized'
                      )
                    }
                    className="px-3 py-1.5 bg-[#17365D] hover:bg-[#0F243E] text-white rounded text-xs font-semibold flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Finding & Close Case</span>
                  </button>
                </div>
              </div>
            )}

            {activeCase.status === 'RESOLVED' && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Case Resolved by {activeCase.resolvedBy}</span>
                </div>
                <div className="text-[11px] text-emerald-800 mt-1">
                  <strong>Decision:</strong> {activeCase.resolutionDecision}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
