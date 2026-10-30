import React from 'react';
import {
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FileCheck2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Institution, StudentRecord, Program, ApprovedIntake, AcademicYear, UploadBatch } from '../../types';
import { calculateProgramCompliance } from '../../services/complianceEngine';
import { NavTab } from '../Sidebar';

interface InstitutionDashboardViewProps {
  institution: Institution;
  students: StudentRecord[];
  programs: Program[];
  intakes: ApprovedIntake[];
  batches: UploadBatch[];
  selectedYear: AcademicYear;
  onNavigateTab: (tab: NavTab, actionDetails?: Record<string, any>) => void;
}

export const InstitutionDashboardView: React.FC<InstitutionDashboardViewProps> = ({
  institution,
  students,
  programs,
  intakes,
  batches,
  selectedYear,
  onNavigateTab,
}) => {
  const instStudents = students.filter(
    s => s.institutionId === institution.id && s.academicYear === selectedYear
  );

  const instBatches = batches.filter(b => b.institutionId === institution.id);

  // Compute program compliance metrics for this institution
  const programMetrics = programs.map(prog =>
    calculateProgramCompliance(
      prog.id,
      prog.code,
      prog.name,
      institution.id,
      selectedYear,
      students,
      intakes
    )
  );

  // Aggregated totals
  const totalApproved = programMetrics.reduce((sum, p) => sum + p.approvedIntake, 0);
  const totalEnrolled = instStudents.length;
  const totalRemaining = Math.max(0, totalApproved - totalEnrolled);
  const overallUtilization = totalApproved > 0 ? Number(((totalEnrolled / totalApproved) * 100).toFixed(1)) : 0;

  const verifiedCount = instStudents.filter(s => s.apaarVerificationStatus === 'VERIFIED').length;
  const pendingCount = instStudents.filter(s => s.apaarVerificationStatus === 'PENDING').length;
  const invalidCount = instStudents.filter(
    s => s.apaarVerificationStatus === 'INVALID_FORMAT' || s.apaarVerificationStatus === 'NAME_MISMATCH' || s.apaarVerificationStatus === 'NOT_FOUND'
  ).length;

  const duplicates = instStudents.filter(s => s.flaggedDuplicate);

  // Check if any program has excess admission or NRI breach
  const excessViolations = programMetrics.filter(p => p.isExcessAdmission);
  const nriViolations = programMetrics.filter(p => p.quotas.nriBreached);

  return (
    <div className="space-y-6">
      {/* Top Banner with Institution Identity */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#17365D] text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
            {institution.shortName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                {institution.name}
              </h1>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  institution.status === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                {institution.status}
              </span>
            </div>
            <div className="text-xs text-slate-500 font-mono mt-1 flex flex-wrap gap-x-3 gap-y-1">
              <span>Approval ID: {institution.aicteApprovalId}</span>
              <span>·</span>
              <span>Code: {institution.code}</span>
              <span>·</span>
              <span>{institution.district}, {institution.state}</span>
              <span>·</span>
              <span className="font-sans font-medium text-slate-700">{institution.accreditation}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('upload')}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#17365D] hover:bg-[#0F243E] rounded transition-colors shadow-sm flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Student Batch</span>
          </button>
        </div>
      </div>

      {/* Violation Alert Box if Intake or Quota Exceeded */}
      {(excessViolations.length > 0 || nriViolations.length > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="text-xs font-bold text-red-900 uppercase tracking-wide">
                Regulatory Compliance Alert: Sanctioned Capacity Breached
              </h2>
              {excessViolations.map(v => (
                <p key={v.programId} className="text-xs text-red-800 mt-1">
                  • <strong>{v.programName} ({v.programCode})</strong>: {v.actualEnrolment} admissions enrolled against AICTE sanctioned intake of {v.approvedIntake} ({v.intakeUtilizationPct}% utilization, <strong>{v.excessSeatsCount} excess seats</strong>).
                </p>
              ))}
              {nriViolations.map(v => (
                <p key={v.programId} className="text-xs text-red-800 mt-1">
                  • <strong>{v.programName} ({v.programCode})</strong>: {v.quotas.nriActual} NRI admissions admitted against sanctioned quota of {v.quotas.nriApproved} (<strong>{v.quotas.nriActual - v.quotas.nriApproved} excess NRI seats</strong>).
                </p>
              ))}
              <div className="mt-2 text-[11px] text-red-700">
                Action: Formal show-cause inquiry generated. Reconcile admissions or upload council approval sanction.
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('cases')}
              className="text-xs font-semibold text-red-700 hover:text-red-900 underline whitespace-nowrap"
            >
              View Compliance Case →
            </button>
          </div>
        </div>
      )}

      {/* Institutional Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        {/* Approved Intake */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Approved Sanctioned Intake
          </span>
          <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums mt-1.5 tracking-tight">
            {totalApproved}
          </div>
          <span className="text-xs text-slate-400 block mt-1">AICTE approved capacity</span>
        </div>

        {/* Actual Enrolment */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Actual Enrolment
          </span>
          <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums mt-1.5 tracking-tight">
            {totalEnrolled}
          </div>
          <span className={`text-xs font-semibold block mt-1 ${overallUtilization > 100 ? 'text-red-600' : 'text-slate-500'}`}>
            Utilization: {overallUtilization}% {overallUtilization > 100 ? '(EXCEEDED)' : ''}
          </span>
        </div>

        {/* APAAR Verification Status */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            APAAR Verified Records
          </span>
          <div className="text-3xl font-extrabold text-emerald-700 font-mono tabular-nums mt-1.5 tracking-tight">
            {verifiedCount}
          </div>
          <span className="text-xs text-slate-500 block mt-1">
            {pendingCount} Pending · {invalidCount} Discrepancies
          </span>
        </div>

        {/* Duplicate Alerts */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Duplicate Conflicts
          </span>
          <div className="text-3xl font-extrabold text-amber-700 font-mono tabular-nums mt-1.5 tracking-tight">
            {duplicates.length}
          </div>
          <span className="text-xs text-slate-500 block mt-1">
            {duplicates.filter(d => d.duplicateConflictType === 'INTER_INSTITUTION').length} Cross-Institution
          </span>
        </div>
      </div>

      {/* Program-Wise Approved Intake vs Actual Enrolment Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Department-Wise Intake Compliance & Category Distribution
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Intake utilization calculated as: (Actual Enrolment / Approved Intake) × 100
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-3.5 py-2.5">Program & Code</th>
                <th className="px-3 py-2.5 text-right">Approved Intake</th>
                <th className="px-3 py-2.5 text-right">Actual Enrolment</th>
                <th className="px-3 py-2.5 text-right">Remaining Seats</th>
                <th className="px-3 py-2.5 text-right">Utilization %</th>
                <th className="px-3 py-2.5 text-center">Merit / Mgmt</th>
                <th className="px-3 py-2.5 text-center">NRI Admitted (Max)</th>
                <th className="px-3 py-2.5 text-center">APAAR Match</th>
                <th className="px-3 py-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {programMetrics.map(p => {
                const isViolation = p.isExcessAdmission;
                return (
                  <tr key={p.programId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3.5 py-3">
                      <div className="font-semibold text-slate-900">{p.programName}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{p.programCode}</div>
                    </td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums text-slate-700">{p.approvedIntake}</td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {p.actualEnrolment}
                    </td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums text-slate-600">
                      {p.remainingSeats}
                    </td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums">
                      <span className={`font-bold ${isViolation ? 'text-red-600' : 'text-slate-800'}`}>
                        {p.intakeUtilizationPct}%
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center font-mono text-[11px]">
                      {p.categoryBreakdown.merit} / {p.categoryBreakdown.management}
                    </td>
                    <td className="px-3 py-3 text-center font-mono text-[11px]">
                      <span className={p.quotas.nriBreached ? 'text-red-600 font-bold' : 'text-slate-700'}>
                        {p.quotas.nriActual} (Limit: {p.quotas.nriApproved})
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center font-mono text-[11px]">
                      <span className="text-emerald-700 font-semibold">{p.apaarVerificationRate}%</span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                          isViolation
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : p.quotas.nriBreached
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {isViolation ? 'EXCESS INTAKE' : p.quotas.nriBreached ? 'NRI BREACH' : 'COMPLIANT'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Upload Batches Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Batch Ingestion History</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Audit trail of uploaded CSV/Excel files and validation summaries.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('upload')}
            className="text-xs font-semibold text-[#17365D] hover:underline flex items-center gap-1"
          >
            <span>Upload New Batch</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-3.5 py-2.5">Batch Number & File</th>
                <th className="px-3 py-2.5">Academic Year</th>
                <th className="px-3 py-2.5 text-right">Total Rows</th>
                <th className="px-3 py-2.5 text-right">Valid</th>
                <th className="px-3 py-2.5 text-right">Invalid</th>
                <th className="px-3 py-2.5 text-right">Duplicates</th>
                <th className="px-3 py-2.5 text-center">Batch Status</th>
                <th className="px-3 py-2.5">Uploaded By & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {instBatches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-slate-400">
                    No recent upload batches for this institution.
                  </td>
                </tr>
              ) : (
                instBatches.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3.5 py-3">
                      <div className="font-semibold text-slate-900 font-mono">{b.batchNumber}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{b.fileName}</div>
                    </td>
                    <td className="px-3 py-3 text-slate-700">{b.academicYear}</td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums font-semibold">{b.totalRows}</td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums text-emerald-700 font-semibold">{b.validRows}</td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums text-red-600 font-semibold">{b.invalidRows}</td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums text-amber-600 font-semibold">{b.duplicatesCount}</td>
                    <td className="px-3 py-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {b.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      <div>{b.uploadedBy}</div>
                      <div className="text-[10px] text-slate-400">{new Date(b.uploadedAt).toLocaleDateString()}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
