import React from 'react';
import {
  Users,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Copy,
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Institution, StudentRecord, ComplianceCase, AcademicYear } from '../../types';
import { evaluateInstitutionRisk } from '../../services/anomalyDetectionEngine';
import { NavTab } from '../Sidebar';

interface NationalDashboardViewProps {
  institutions: Institution[];
  students: StudentRecord[];
  cases: ComplianceCase[];
  selectedYear: AcademicYear;
  onNavigateTab: (tab: NavTab, actionDetails?: Record<string, any>) => void;
  onSelectInstitutionScope: (id: string) => void;
}

export const NationalDashboardView: React.FC<NationalDashboardViewProps> = ({
  institutions,
  students,
  cases,
  selectedYear,
  onNavigateTab,
  onSelectInstitutionScope,
}) => {
  const totalInstitutions = institutions.length;
  const yearStudents = students.filter(s => s.academicYear === selectedYear);
  const totalStudents = yearStudents.length;

  const verifiedStudents = yearStudents.filter(s => s.apaarVerificationStatus === 'VERIFIED');
  const verifiedPct = totalStudents > 0 ? ((verifiedStudents.length / totalStudents) * 100).toFixed(1) : '0';

  const duplicateStudents = yearStudents.filter(s => s.flaggedDuplicate);
  const openCases = cases.filter(c => c.status !== 'RESOLVED' && c.status !== 'REJECTED');

  const institutionRisks = institutions.map(inst =>
    evaluateInstitutionRisk(inst, yearStudents, cases)
  );

  const stateSummary = institutions.reduce((acc, inst) => {
    const instStudents = yearStudents.filter(s => s.institutionId === inst.id);
    const duplicates = instStudents.filter(s => s.flaggedDuplicate).length;
    if (!acc[inst.state]) {
      acc[inst.state] = {
        state: inst.state,
        institutionsCount: 0,
        enrolledCount: 0,
        duplicatesCount: 0,
        institutions: [],
      };
    }
    acc[inst.state].institutionsCount += 1;
    acc[inst.state].enrolledCount += instStudents.length;
    acc[inst.state].duplicatesCount += duplicates;
    acc[inst.state].institutions.push(inst.shortName);
    return acc;
  }, {} as Record<string, { state: string; institutionsCount: number; enrolledCount: number; duplicatesCount: number; institutions: string[] }>);

  return (
    <div className="space-y-7">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>National Depository</span>
            <span>/</span>
            <span>Central Apex Registry</span>
            <span>/</span>
            <span className="font-semibold text-slate-800">Academic Year {selectedYear}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            AICTE National Compliance Overview
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Real-time enrollment telemetry, identity verification integrity, and institutional intake monitoring across AICTE approved technical colleges.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigateTab('reports')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            Download National Report
          </button>
          <button
            onClick={() => onNavigateTab('cases')}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#17365D] hover:bg-[#0F243E] rounded-lg transition-colors shadow-xs flex items-center gap-2"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Open Cases ({openCases.length})</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics: Clean, Spacious 4-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Enrolled Students
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
              {totalStudents}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5">
              <span>Across {totalInstitutions} Technical Institutions</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              APAAR Verified Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-700 font-mono tabular-nums tracking-tight">
              {verifiedPct}%
            </div>
            <div className="text-xs text-emerald-700 font-medium mt-1.5">
              {verifiedStudents.length} records verified via ABC Registry
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Duplicate Conflicts
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Copy className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-amber-700 font-mono tabular-nums tracking-tight">
              {duplicateStudents.length}
            </div>
            <div className="text-xs text-amber-700 font-medium mt-1.5">
              Cross-institution & intra-batch conflicts
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Show-Cause Investigations
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
              <ShieldAlert className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
              {openCases.length}
            </div>
            <div className="text-xs text-red-600 font-medium mt-1.5">
              Excess intake & quota breach notices
            </div>
          </div>
        </div>
      </div>

      {/* Regulatory Alerts Banner */}
      {openCases.length > 0 && (
        <div className="bg-red-50/70 border border-red-200 rounded-xl p-4.5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xs font-bold text-red-900 uppercase tracking-wide">
                  Active Regulatory Alerts Requiring Reviewer Action ({openCases.length})
                </h2>
                <div className="mt-1 space-y-1">
                  {openCases.map(c => (
                    <div
                      key={c.id}
                      onClick={() => onNavigateTab('cases', { caseId: c.id })}
                      className="text-xs text-red-800 hover:text-red-950 font-medium cursor-pointer hover:underline flex items-center gap-1.5"
                    >
                      <span>• [{c.caseNumber}] {c.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 inline text-red-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('cases')}
              className="text-xs font-semibold text-red-700 hover:text-red-900 underline whitespace-nowrap self-start sm:self-center"
            >
              Review Cases in Cell →
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Institution Monitoring & Geographic Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Institutional Compliance Table */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Institutional Compliance & Risk Monitoring Matrix
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated from real-time database records: duplicate frequency, sanctioned intake, and ABC sync.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('students')}
              className="text-xs font-semibold text-[#17365D] hover:underline flex items-center gap-1"
            >
              <span>View Registry</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Institution & Code</th>
                  <th className="px-3.5 py-3.5">State</th>
                  <th className="px-3 py-3.5 text-right">Sanctioned</th>
                  <th className="px-3 py-3.5 text-right">Enrolled</th>
                  <th className="px-3 py-3.5 text-right">Intake %</th>
                  <th className="px-3.5 py-3.5 text-center">APAAR Sync</th>
                  <th className="px-3 py-3.5 text-center">Duplicates</th>
                  <th className="px-3.5 py-3.5 text-center">Risk Level</th>
                  <th className="px-4 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {institutions.map(inst => {
                  const instStudents = yearStudents.filter(s => s.institutionId === inst.id);
                  const riskEval = institutionRisks.find(r => r.institutionId === inst.id);
                  const duplicates = instStudents.filter(s => s.flaggedDuplicate).length;
                  const verified = instStudents.filter(s => s.apaarVerificationStatus === 'VERIFIED').length;
                  const verifiedRate = instStudents.length > 0 ? Math.round((verified / instStudents.length) * 100) : 0;

                  const sanctioned = inst.id === 'INST-CEG' ? 120 : inst.id === 'INST-MIT' ? 180 : 120;
                  const utilization = sanctioned > 0 ? Number(((instStudents.length / sanctioned) * 100).toFixed(1)) : 0;
                  const isExcess = utilization > 100;

                  return (
                    <tr key={inst.id} className="hover:bg-slate-50/90 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">{inst.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{inst.aicteApprovalId} · {inst.code}</div>
                      </td>
                      <td className="px-3.5 py-3.5 text-slate-600 whitespace-nowrap">{inst.state}</td>
                      <td className="px-3 py-3.5 text-right font-mono tabular-nums text-slate-700">{sanctioned}</td>
                      <td className="px-3 py-3.5 text-right font-mono tabular-nums font-semibold text-slate-900">
                        {instStudents.length}
                      </td>
                      <td className="px-3 py-3.5 text-right font-mono tabular-nums">
                        <span className={`font-bold ${isExcess ? 'text-red-600' : 'text-slate-800'}`}>
                          {utilization}%
                        </span>
                      </td>
                      <td className="px-3.5 py-3.5 text-center">
                        <span className={`font-mono text-xs font-semibold ${verifiedRate >= 90 ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {verifiedRate}%
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-center font-mono tabular-nums">
                        {duplicates > 0 ? (
                          <span className="text-red-700 font-bold bg-red-50 border border-red-200 px-2 py-0.5 rounded-full text-[10px]">
                            {duplicates} Flagged
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="px-3.5 py-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            riskEval?.riskLevel === 'CRITICAL'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : riskEval?.riskLevel === 'HIGH'
                              ? 'bg-orange-50 text-orange-700 border-orange-200'
                              : riskEval?.riskLevel === 'MEDIUM'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {riskEval?.riskLevel} ({riskEval?.riskScore})
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => {
                            onSelectInstitutionScope(inst.id);
                            onNavigateTab('institution_dashboard');
                          }}
                          className="text-xs font-semibold text-[#17365D] hover:underline"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 4 Cols: State Distribution & Direct Tools */}
        <div className="lg:col-span-4 space-y-5">
          {/* State Distribution Card */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              State-Wise Admission Distribution
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Geographic aggregation of enrolled candidates and compliance flags.
            </p>

            <div className="space-y-3.5">
              {Object.values(stateSummary).map(s => {
                const pct = totalStudents > 0 ? Math.round((s.enrolledCount / totalStudents) * 100) : 0;
                return (
                  <div key={s.state} className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/70">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-900 mb-1.5">
                      <span>{s.state}</span>
                      <span className="font-mono tabular-nums text-slate-600">{s.enrolledCount} ({pct}%)</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2">
                      <div
                        className="bg-[#17365D] h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min(100, pct * 2)}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{s.institutionsCount} Institutions</span>
                      {s.duplicatesCount > 0 ? (
                        <span className="text-red-600 font-semibold">{s.duplicatesCount} Duplicates</span>
                      ) : (
                        <span className="text-emerald-600 font-medium">Clean</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Services Panel */}
          <div className="bg-[#17365D] text-white rounded-xl p-5 shadow-xs space-y-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Verification Shortcuts
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Probe live simulated ABC adapters or inspect verifiable cryptographic student credentials.
              </p>
            </div>
            <div className="space-y-2 pt-1">
              <button
                onClick={() => onNavigateTab('apaar_sandbox')}
                className="w-full py-2.5 px-3 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold text-left flex items-center justify-between transition-colors border border-white/15"
              >
                <span>Launch APAAR Identity Sandbox</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
              </button>
              <button
                onClick={() => onNavigateTab('credentials_qr')}
                className="w-full py-2.5 px-3 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold text-left flex items-center justify-between transition-colors border border-white/15"
              >
                <span>Scan & Verify QR Digital Credential</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
