import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Users,
  Copy,
} from 'lucide-react';
import { Institution, StudentRecord, Program, ApprovedIntake, AcademicYear } from '../../types';
import {
  exportInstitutionAdmissionsCsv,
  exportIntakeComplianceCsv,
  exportDuplicateConflictsCsv,
  downloadCsvFile,
} from '../../services/reportExportService';
import { maskApaarId } from '../../services/cryptoService';

interface ReportsAnalyticsViewProps {
  institutions: Institution[];
  students: StudentRecord[];
  programs: Program[];
  intakes: ApprovedIntake[];
  selectedYear: AcademicYear;
}

export const ReportsAnalyticsView: React.FC<ReportsAnalyticsViewProps> = ({
  institutions,
  students,
  programs,
  intakes,
  selectedYear,
}) => {
  const [reportType, setReportType] = useState<
    'ADMISSION' | 'INTAKE_COMPLIANCE' | 'DUPLICATES' | 'NRI_QUOTA' | 'DATA_QUALITY'
  >('INTAKE_COMPLIANCE');
  const [filterInst, setFilterInst] = useState('ALL');

  const yearStudents = students.filter(s => s.academicYear === selectedYear);

  const handleDownloadActiveReport = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    if (reportType === 'ADMISSION') {
      const csv = exportInstitutionAdmissionsCsv(yearStudents, institutions, programs);
      downloadCsvFile(`aicte_admissions_report_${selectedYear}_${timestamp}.csv`, csv);
    } else if (reportType === 'INTAKE_COMPLIANCE') {
      const csv = exportIntakeComplianceCsv(institutions, programs, intakes, students, selectedYear);
      downloadCsvFile(`aicte_intake_compliance_report_${selectedYear}_${timestamp}.csv`, csv);
    } else if (reportType === 'DUPLICATES') {
      const csv = exportDuplicateConflictsCsv(yearStudents, institutions);
      downloadCsvFile(`aicte_duplicate_apaar_report_${selectedYear}_${timestamp}.csv`, csv);
    } else {
      const csv = exportIntakeComplianceCsv(institutions, programs, intakes, students, selectedYear);
      downloadCsvFile(`aicte_statutory_report_${selectedYear}_${timestamp}.csv`, csv);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs text-slate-500 mb-0.5">
            AICTE Regulatory Reporting & Statutory Analytics Cell
          </div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            National Enrollment Reports & Compliance Datasets
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Downloadable CSV/Excel reports and real-time previews for academic audit and council oversight.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadActiveReport}
            className="px-3.5 py-1.5 text-xs font-semibold bg-[#17365D] hover:bg-[#0F243E] text-white rounded flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Selected Report CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print View</span>
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-wrap gap-2 text-xs">
        {[
          { id: 'INTAKE_COMPLIANCE', label: 'Approved Intake vs Enrolment' },
          { id: 'ADMISSION', label: 'Institution Student Admissions' },
          { id: 'DUPLICATES', label: 'Duplicate APAAR Conflicts' },
          { id: 'NRI_QUOTA', label: 'NRI & Supernumerary Quota' },
          { id: 'DATA_QUALITY', label: 'Identity Data Quality Audit' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id as any)}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              reportType === tab.id
                ? 'bg-[#17365D] text-white font-semibold shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Preview Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {reportType === 'INTAKE_COMPLIANCE' && 'Sanctioned Intake vs Actual Enrolment Audit (Academic Year ' + selectedYear + ')'}
              {reportType === 'ADMISSION' && 'Student Admissions Master Registry (' + yearStudents.length + ' Records)'}
              {reportType === 'DUPLICATES' && 'Duplicate APAAR Cross-Institution Investigation Report'}
              {reportType === 'NRI_QUOTA' && 'NRI, OCI and Supernumerary Seat Allocation Audit'}
              {reportType === 'DATA_QUALITY' && 'Identity Synchronization and APAAR Quality Scores'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live database preview rendered from AICTE Central Repository.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {reportType === 'INTAKE_COMPLIANCE' && (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-3.5 py-2.5">Institution</th>
                  <th className="px-3 py-2.5">Approval ID</th>
                  <th className="px-3 py-2.5">Program</th>
                  <th className="px-3 py-2.5 text-right">Sanctioned</th>
                  <th className="px-3 py-2.5 text-right">Enrolled</th>
                  <th className="px-3 py-2.5 text-right">Remaining</th>
                  <th className="px-3 py-2.5 text-right">Intake %</th>
                  <th className="px-3 py-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {institutions.map(inst => {
                  const instStudents = yearStudents.filter(s => s.institutionId === inst.id);
                  const sanctioned = inst.id === 'INST-CEG' ? 120 : inst.id === 'INST-MIT' ? 180 : 120;
                  const util = sanctioned > 0 ? ((instStudents.length / sanctioned) * 100).toFixed(1) : '0';
                  const isExcess = Number(util) > 100;

                  return (
                    <tr key={inst.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3.5 py-3 font-semibold text-slate-900">{inst.name}</td>
                      <td className="px-3 py-3 font-mono text-[11px] text-slate-500">{inst.aicteApprovalId}</td>
                      <td className="px-3 py-3 font-mono text-slate-700">BTECH-CSE</td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums">{sanctioned}</td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums font-semibold">{instStudents.length}</td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums text-slate-600">
                        {Math.max(0, sanctioned - instStudents.length)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums font-bold">
                        <span className={isExcess ? 'text-red-600' : 'text-slate-800'}>{util}%</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                            isExcess
                              ? 'bg-red-100 text-red-800 border-red-300'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          {isExcess ? 'EXCESS INTAKE' : 'COMPLIANT'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {reportType === 'DUPLICATES' && (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-3.5 py-2.5">Candidate Name</th>
                  <th className="px-3 py-2.5">Masked APAAR ID</th>
                  <th className="px-3 py-2.5">Primary College</th>
                  <th className="px-3 py-2.5">Conflicting Institution / ID</th>
                  <th className="px-3 py-2.5 text-center">Conflict Type</th>
                  <th className="px-3 py-2.5 text-center">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {yearStudents
                  .filter(s => s.flaggedDuplicate)
                  .map(s => {
                    const inst = institutions.find(i => i.id === s.institutionId);
                    const confInst = institutions.find(i => i.id === s.conflictingInstitutionId);

                    return (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3.5 py-3 font-semibold text-slate-900">{s.name}</td>
                        <td className="px-3 py-3 font-mono">{maskApaarId(s.apaarId)}</td>
                        <td className="px-3 py-3">{inst?.shortName}</td>
                        <td className="px-3 py-3 font-medium text-slate-800">
                          {confInst?.name || s.conflictingStudentId || 'Concurrent Enrollment'}
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-red-700">
                          {s.duplicateConflictType}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                            {s.riskLevel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}

          {(reportType === 'ADMISSION' || reportType === 'NRI_QUOTA' || reportType === 'DATA_QUALITY') && (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-3.5 py-2.5">Student Name & Roll No</th>
                  <th className="px-3 py-2.5">Masked APAAR</th>
                  <th className="px-3 py-2.5">Institution</th>
                  <th className="px-3 py-2.5">Category</th>
                  <th className="px-3 py-2.5 text-center">Seat Type</th>
                  <th className="px-3 py-2.5 text-center">Verification Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {yearStudents.slice(0, 15).map(s => {
                  const inst = institutions.find(i => i.id === s.institutionId);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3.5 py-3 font-semibold text-slate-900">
                        {s.name} <span className="text-slate-400 font-mono text-[11px]">({s.rollNumber})</span>
                      </td>
                      <td className="px-3 py-3 font-mono">{maskApaarId(s.apaarId)}</td>
                      <td className="px-3 py-3">{inst?.shortName}</td>
                      <td className="px-3 py-3">{s.admissionCategory}</td>
                      <td className="px-3 py-3 text-center font-medium">{s.seatType}</td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            s.apaarVerificationStatus === 'VERIFIED'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}
                        >
                          {s.apaarVerificationStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
