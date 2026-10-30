import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  RotateCcw,
  User,
} from 'lucide-react';
import { StudentRecord, Institution, Program, AcademicYear, DigitalCredential } from '../../types';
import { maskApaarId, formatApaarWithSpaces } from '../../services/cryptoService';
import { StudentDetailModal } from '../modals/StudentDetailModal';
import { exportInstitutionAdmissionsCsv, downloadCsvFile } from '../../services/reportExportService';
import { validateApaarFormat } from '../../services/apaarMockProvider';

interface StudentDirectoryViewProps {
  students: StudentRecord[];
  institutions: Institution[];
  programs: Program[];
  credentials: DigitalCredential[];
  selectedYear: AcademicYear;
  onAddStudent: (record: any) => void;
  onUpdateStudent: (id: string, updates: Partial<StudentRecord>) => void;
  onDeleteStudent: (id: string) => void;
  onIssueCredential: (student: StudentRecord) => void;
}

export const StudentDirectoryView: React.FC<StudentDirectoryViewProps> = ({
  students,
  institutions,
  programs,
  credentials,
  selectedYear,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onIssueCredential,
}) => {
  const [search, setSearch] = useState('');
  const [instFilter, setInstFilter] = useState('ALL');
  const [progFilter, setProgFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [verificationFilter, setVerificationFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 12; // Adjusted for comfortable vertical rhythm

  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Student Form State
  const [newApaar, setNewApaar] = useState('');
  const [newName, setNewName] = useState('');
  const [newRoll, setNewRoll] = useState('');
  const [newDob, setNewDob] = useState('2004-05-14');
  const [newGender, setNewGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [newEmail, setNewEmail] = useState('');
  const [newMobile, setNewMobile] = useState('+91 98110 12345');
  const [newInstId, setNewInstId] = useState(institutions[0]?.id || 'INST-IITD');
  const [newProgId, setNewProgId] = useState(programs[0]?.id || 'PROG-CSE');
  const [newCategory, setNewCategory] = useState<'General' | 'OBC-NCL' | 'SC' | 'ST' | 'EWS'>('General');
  const [newSeatType, setNewSeatType] = useState<'Merit' | 'Management' | 'Supernumerary' | 'NRI'>('Merit');
  const [formError, setFormError] = useState<string | null>(null);

  const resetAllFilters = () => {
    setSearch('');
    setInstFilter('ALL');
    setProgFilter('ALL');
    setStatusFilter('ALL');
    setVerificationFilter('ALL');
    setRiskFilter('ALL');
    setPage(1);
  };

  const isFiltered =
    search.trim() !== '' ||
    instFilter !== 'ALL' ||
    progFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    verificationFilter !== 'ALL' ||
    riskFilter !== 'ALL';

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (instFilter !== 'ALL' && s.institutionId !== instFilter) return false;
      if (progFilter !== 'ALL' && s.programId !== progFilter) return false;
      if (statusFilter !== 'ALL' && s.academicStatus !== statusFilter) return false;
      if (verificationFilter !== 'ALL' && s.apaarVerificationStatus !== verificationFilter) return false;
      if (riskFilter !== 'ALL' && s.riskLevel !== riskFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesRoll = s.rollNumber.toLowerCase().includes(q);
        const matchesId = s.institutionalStudentId.toLowerCase().includes(q);
        const matchesApaar = s.apaarId.includes(q);
        if (!matchesName && !matchesRoll && !matchesId && !matchesApaar) return false;
      }
      return true;
    });
  }, [students, instFilter, progFilter, statusFilter, verificationFilter, riskFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const paginatedStudents = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, page, pageSize]);

  const handleExportCsv = () => {
    const csv = exportInstitutionAdmissionsCsv(filteredStudents, institutions, programs);
    downloadCsvFile(`aicte_apaar_students_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const fmt = validateApaarFormat(newApaar);
    if (!fmt.valid) {
      setFormError(fmt.reason || 'Invalid 12-digit APAAR format');
      return;
    }

    if (!newName.trim()) {
      setFormError('Student full name is required');
      return;
    }

    if (!newRoll.trim()) {
      setFormError('Roll number is required');
      return;
    }

    onAddStudent({
      apaarId: newApaar.replace(/\s+/g, ''),
      institutionalStudentId: `${newInstId.split('-')[1]}-2024-${newRoll}`,
      rollNumber: newRoll,
      name: newName.trim(),
      dob: newDob,
      gender: newGender,
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, '.')}@student.ac.in`,
      mobile: newMobile,
      institutionId: newInstId,
      programId: newProgId,
      academicYear: selectedYear,
      admissionDate: new Date().toISOString().slice(0, 10),
      admissionCategory: newCategory,
      seatType: newSeatType,
      isSupernumerary: newSeatType === 'Supernumerary',
      isNri: newSeatType === 'NRI',
      isOci: false,
      isForeignNational: false,
      academicStatus: 'Enrolled',
      consentReference: `CONS-NEW-${Date.now()}`,
      apaarVerificationStatus: 'VERIFIED',
      apaarVerificationDate: new Date().toISOString(),
      riskLevel: 'LOW',
    });

    setShowAddModal(false);
    setNewApaar('');
    setNewName('');
    setNewRoll('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            National Student Academic Identity Registry
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Displaying {filteredStudents.length} candidate academic records with privacy-preserving masked APAAR identifiers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-xs font-semibold bg-[#17365D] hover:bg-[#0F243E] text-white rounded-lg flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Register Student</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar: Spacious 2-Tier Control Panel */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-3.5">
        {/* Tier 1: Primary Search & Quick Filters */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by student legal name, roll number, or masked APAAR..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-xs text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-[#17365D]"
            />
          </div>

          <div className="w-full md:w-64">
            <select
              value={instFilter}
              onChange={e => {
                setInstFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-none"
            >
              <option value="ALL">All Institutions</option>
              {institutions.map(i => (
                <option key={i.id} value={i.id}>
                  {i.shortName}
                </option>
              ))}
            </select>
          </div>

          {isFiltered && (
            <button
              onClick={resetAllFilters}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Tier 2: Secondary Attributes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Program / Branch
            </label>
            <select
              value={progFilter}
              onChange={e => {
                setProgFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-none"
            >
              <option value="ALL">All Programs</option>
              {programs.map(p => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              APAAR Status
            </label>
            <select
              value={verificationFilter}
              onChange={e => {
                setVerificationFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-none"
            >
              <option value="ALL">All Verification States</option>
              <option value="VERIFIED">Verified (ABC Matched)</option>
              <option value="INVALID_FORMAT">Invalid Format</option>
              <option value="NAME_MISMATCH">Name Mismatch</option>
              <option value="PENDING">Pending Verification</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Risk Level
            </label>
            <select
              value={riskFilter}
              onChange={e => {
                setRiskFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-none"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">Critical Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Enrolment Status
            </label>
            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Enrolled">Active Enrolled</option>
              <option value="Graduated">Graduated</option>
              <option value="Withdrawn">Withdrawn</option>
              <option value="Transfer_Pending">Transfer Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Student Table: Spacious Row Padding */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Student Name & Roll No</th>
                <th className="px-3.5 py-3.5">Masked APAAR ID</th>
                <th className="px-3.5 py-3.5">Institution & Department</th>
                <th className="px-3.5 py-3.5">Category & Seat</th>
                <th className="px-3.5 py-3.5 text-center">APAAR Verification</th>
                <th className="px-3.5 py-3.5 text-center">Conflict Status</th>
                <th className="px-3.5 py-3.5 text-center">Risk</th>
                <th className="px-4 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400 text-xs">
                    No student records matched the specified filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map(s => {
                  const inst = institutions.find(i => i.id === s.institutionId);
                  const prog = programs.find(p => p.id === s.programId);
                  const cred = credentials.find(c => c.studentId === s.id);

                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-slate-50/90 transition-colors ${
                        s.flaggedDuplicate ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span>{s.name}</span>
                              {cred && (
                                <span className="text-[9px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.2 rounded-md font-bold">
                                  CREDENTIAL
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                              Roll: {s.rollNumber}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-3.5 py-3.5 font-mono text-xs font-semibold text-slate-800">
                        {maskApaarId(s.apaarId)}
                      </td>

                      <td className="px-3.5 py-3.5">
                        <div className="font-semibold text-slate-800">{inst?.shortName || s.institutionId}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{prog?.code || s.programId}</div>
                      </td>

                      <td className="px-3.5 py-3.5">
                        <div className="text-slate-800 font-medium">{s.admissionCategory}</div>
                        <div className="text-[11px] text-slate-500">
                          {s.seatType} Seat
                        </div>
                      </td>

                      <td className="px-3.5 py-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            s.apaarVerificationStatus === 'VERIFIED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : s.apaarVerificationStatus === 'PENDING'
                              ? 'bg-slate-100 text-slate-700 border-slate-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {s.apaarVerificationStatus.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-3.5 py-3.5 text-center font-mono">
                        {s.flaggedDuplicate ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                            <Copy className="w-3 h-3" />
                            <span>{s.duplicateConflictType}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      <td className="px-3.5 py-3.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-bold ${
                            s.riskLevel === 'CRITICAL'
                              ? 'bg-red-500 text-white'
                              : s.riskLevel === 'HIGH'
                              ? 'bg-orange-500 text-white'
                              : s.riskLevel === 'MEDIUM'
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {s.riskLevel}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedStudent(s)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
                            title="Inspect Student Record"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteStudent(s.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-5 py-4 bg-slate-50/60 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing <span className="font-semibold text-slate-900">{(page - 1) * pageSize + 1}</span> to{' '}
            <span className="font-semibold text-slate-900">{Math.min(page * pageSize, filteredStudents.length)}</span> of{' '}
            <span className="font-semibold text-slate-900">{filteredStudents.length}</span> students
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-white text-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-800 px-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-white text-slate-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Selected Student Modal Drawer */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          institution={institutions.find(i => i.id === selectedStudent.institutionId)}
          program={programs.find(p => p.id === selectedStudent.programId)}
          credential={credentials.find(c => c.studentId === selectedStudent.id)}
          onClose={() => setSelectedStudent(null)}
          onIssueCredential={s => {
            onIssueCredential(s);
            setSelectedStudent(null);
          }}
          onUpdateStudent={(id, updates) => {
            onUpdateStudent(id, updates);
            setSelectedStudent(prev => (prev ? { ...prev, ...updates } : null));
          }}
        />
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 bg-[#17365D] text-white flex items-center justify-between">
              <h2 className="text-sm font-bold">Register Individual Student Academic Record</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-300 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  National APAAR ID (12 Numeric Digits) *
                </label>
                <input
                  type="text"
                  maxLength={12}
                  placeholder="e.g. 712345678901"
                  value={newApaar}
                  onChange={e => setNewApaar(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:border-[#17365D]"
                  required
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Validated against standard national 12-digit specification
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    placeholder="Candidate Legal Name"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#17365D]"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Roll / Reg Number *</label>
                  <input
                    type="text"
                    placeholder="e.g. 2024CS1090"
                    value={newRoll}
                    onChange={e => setNewRoll(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:border-[#17365D]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    value={newDob}
                    onChange={e => setNewDob(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Gender *</label>
                  <select
                    value={newGender}
                    onChange={e => setNewGender(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none"
                  >
                    <option value="MALE">MALE</option>
                    <option value="FEMALE">FEMALE</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Institution *</label>
                  <select
                    value={newInstId}
                    onChange={e => setNewInstId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none"
                  >
                    {institutions.map(i => (
                      <option key={i.id} value={i.id}>
                        {i.shortName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Program *</label>
                  <select
                    value={newProgId}
                    onChange={e => setNewProgId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none"
                  >
                    {programs.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Admission Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none"
                  >
                    <option value="General">General</option>
                    <option value="OBC-NCL">OBC-NCL</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Seat Type</label>
                  <select
                    value={newSeatType}
                    onChange={e => setNewSeatType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none"
                  >
                    <option value="Merit">Merit</option>
                    <option value="Management">Management</option>
                    <option value="NRI">NRI</option>
                    <option value="Supernumerary">Supernumerary</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#17365D] hover:bg-[#0F243E] text-white font-semibold rounded-lg shadow-xs transition-colors"
                >
                  Save & Validate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
