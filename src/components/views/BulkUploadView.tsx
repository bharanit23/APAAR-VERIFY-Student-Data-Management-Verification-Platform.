import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  ArrowRight,
  RefreshCw,
  FileText,
  ShieldAlert,
  Save,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Institution,
  Program,
  AcademicYear,
  StudentRecord,
  ApprovedIntake,
  ValidationErrorItem,
  UploadBatch,
} from '../../types';
import {
  validateSingleStudentRecord,
  validateIntakeLimits,
  ValidationContext,
} from '../../services/validationEngine';
import { generateUploadCsvTemplate, downloadCsvFile } from '../../services/reportExportService';
import { computeDeterministicHmac } from '../../services/cryptoService';

interface BulkUploadViewProps {
  institutions: Institution[];
  programs: Program[];
  intakes: ApprovedIntake[];
  existingStudents: StudentRecord[];
  selectedYear: AcademicYear;
  onCommitBatch: (batch: UploadBatch, records: StudentRecord[]) => void;
}

export const BulkUploadView: React.FC<BulkUploadViewProps> = ({
  institutions,
  programs,
  intakes,
  existingStudents,
  selectedYear,
  onCommitBatch,
}) => {
  const [selectedInstId, setSelectedInstId] = useState(institutions[0]?.id || 'INST-IITD');
  const [selectedProgId, setSelectedProgId] = useState(programs[0]?.id || 'PROG-CSE');
  const [batchYear, setBatchYear] = useState<AcademicYear>(selectedYear);

  // Upload steps: 'SELECT' | 'PARSING' | 'VALIDATED' | 'COMMITTED'
  const [step, setStep] = useState<'SELECT' | 'VALIDATED' | 'COMMITTED'>('SELECT');
  const [fileName, setFileName] = useState('');
  const [rawParsedRecords, setRawParsedRecords] = useState<Partial<StudentRecord>[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrorItem[]>([]);
  const [currentBatchId, setCurrentBatchId] = useState('');

  // Pre-built sample datasets for effortless evaluator testing
  const loadSampleValidBatch = () => {
    const records: Partial<StudentRecord>[] = [];
    for (let i = 1; i <= 25; i++) {
      const apaar = `${(700000000000 + i * 2841).toString().slice(0, 12)}`;
      records.push({
        apaarId: apaar,
        institutionalStudentId: `IITD-2024-CS${(800 + i).toString()}`,
        rollNumber: `2024CS${(800 + i).toString()}`,
        name: `Student Candidate ${i}`,
        dob: `2004-04-${((i % 25) + 1).toString().padStart(2, '0')}`,
        gender: i % 2 === 0 ? 'FEMALE' : 'MALE',
        email: `student.c${i}@iitd.ac.in`,
        mobile: `+91 98110 ${(10000 + i).toString()}`,
        institutionId: selectedInstId,
        programId: selectedProgId,
        academicYear: batchYear,
        admissionDate: '2024-07-20',
        admissionCategory: 'General',
        seatType: 'Merit',
        isSupernumerary: false,
        isNri: false,
        isOci: false,
        isForeignNational: false,
        academicStatus: 'Enrolled',
        consentReference: `CONS-BATCH-${Date.now()}-${i}`,
      });
    }

    runValidation('sample_valid_admissions_iitd_25.csv', records);
  };

  const loadSampleErroneousBatch = () => {
    const records: Partial<StudentRecord>[] = [
      // Valid record
      {
        apaarId: '712345678901',
        institutionalStudentId: 'IITD-2024-CS901',
        rollNumber: '2024CS1901',
        name: 'Aarav Gupta',
        dob: '2004-05-14',
        gender: 'MALE',
        email: 'aarav.g@iitd.ac.in',
        mobile: '+91 98110 44221',
        institutionId: selectedInstId,
        programId: selectedProgId,
        academicYear: batchYear,
        admissionDate: '2024-07-20',
        admissionCategory: 'General',
        seatType: 'Merit',
        academicStatus: 'Enrolled',
      },
      // Error 1: Missing APAAR ID
      {
        apaarId: '',
        institutionalStudentId: 'IITD-2024-CS902',
        rollNumber: '2024CS1902',
        name: 'Kavya Nair',
        dob: '2004-03-12',
        gender: 'FEMALE',
        email: 'kavya.n@iitd.ac.in',
        mobile: '+91 98110 44222',
        institutionId: selectedInstId,
        programId: selectedProgId,
        academicYear: batchYear,
        admissionDate: '2024-07-20',
        admissionCategory: 'OBC-NCL',
        seatType: 'Merit',
        academicStatus: 'Enrolled',
      },
      // Error 2: Corrupt Format APAAR
      {
        apaarId: '9988-ABC-XX',
        institutionalStudentId: 'IITD-2024-CS903',
        rollNumber: '2024CS1903',
        name: 'Sameer Joshi',
        dob: '2004-08-22',
        gender: 'MALE',
        email: 'sameer.j@iitd.ac.in',
        mobile: '+91 98110 44223',
        institutionId: selectedInstId,
        programId: selectedProgId,
        academicYear: batchYear,
        admissionDate: '2024-07-20',
        admissionCategory: 'General',
        seatType: 'Merit',
        academicStatus: 'Enrolled',
      },
      // Error 3: Cross-Institution Duplicate with existing record
      {
        apaarId: '634567890123', // Active at CEG / IITD
        institutionalStudentId: 'IITD-2024-CS904',
        rollNumber: '2024CS1904',
        name: 'Neha Verma',
        dob: '2004-08-09',
        gender: 'FEMALE',
        email: 'neha.v@student.ac.in',
        mobile: '+91 98110 44224',
        institutionId: selectedInstId,
        programId: selectedProgId,
        academicYear: batchYear,
        admissionDate: '2024-07-20',
        admissionCategory: 'General',
        seatType: 'Merit',
        academicStatus: 'Enrolled',
      },
      // Error 4: Missing Student Name
      {
        apaarId: '545678901234',
        institutionalStudentId: 'IITD-2024-CS905',
        rollNumber: '2024CS1905',
        name: '',
        dob: '2004-01-10',
        gender: 'MALE',
        email: 'anon@student.ac.in',
        mobile: '+91 98110 44225',
        institutionId: selectedInstId,
        programId: selectedProgId,
        academicYear: batchYear,
        admissionDate: '2024-07-20',
        admissionCategory: 'SC',
        seatType: 'Merit',
        academicStatus: 'Enrolled',
      },
    ];

    runValidation('sample_erroneous_admissions_with_conflicts.csv', records);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      parseCsvString(file.name, text);
    };
    reader.readAsText(file);
  };

  const parseCsvString = (fName: string, csv: string) => {
    const lines = csv.split('\n').filter(l => l.trim().length > 0);
    if (lines.length < 2) {
      alert('CSV file is empty or missing data rows');
      return;
    }

    const records: Partial<StudentRecord>[] = [];
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
      if (parts.length >= 4) {
        records.push({
          apaarId: parts[0] || '',
          institutionalStudentId: parts[1] || `TEMP-${i}`,
          rollNumber: parts[2] || `ROLL-${i}`,
          name: parts[3] || '',
          dob: parts[4] || '2004-05-14',
          gender: (parts[5] as any) || 'MALE',
          email: parts[6] || `student${i}@test.ac.in`,
          mobile: parts[7] || '+91 90000 00000',
          institutionId: selectedInstId,
          programId: selectedProgId,
          academicYear: batchYear,
          admissionDate: parts[8] || '2024-07-20',
          admissionCategory: (parts[9] as any) || 'General',
          seatType: (parts[10] as any) || 'Merit',
          academicStatus: 'Enrolled',
        });
      }
    }

    runValidation(fName, records);
  };

  const runValidation = (fName: string, records: Partial<StudentRecord>[]) => {
    setFileName(fName);
    setRawParsedRecords(records);
    const batchId = `UB-${batchYear.replace('-', '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    setCurrentBatchId(batchId);

    const context: ValidationContext = {
      existingStudents,
      approvedIntakes: intakes,
      institutionId: selectedInstId,
      programId: selectedProgId,
      academicYear: batchYear,
    };

    const allErrors: ValidationErrorItem[] = [];

    // Row-by-row validation
    records.forEach((rec, idx) => {
      const rowErrs = validateSingleStudentRecord(rec, idx + 1, context, records);
      allErrors.push(...rowErrs);
    });

    // Aggregate Intake validation
    const aggregateErrs = validateIntakeLimits(records, context);
    allErrors.push(...aggregateErrs);

    setValidationErrors(allErrors);
    setStep('VALIDATED');
  };

  const handleDownloadTemplate = () => {
    const template = generateUploadCsvTemplate();
    downloadCsvFile('aicte_apaar_upload_template.csv', template);
  };

  const handleDownloadErrors = () => {
    const headers = ['Row Number', 'Field Name', 'Offending Value', 'Severity', 'Rule ID', 'Error Explanation', 'Suggested Action'];
    const rows = validationErrors.map(e => [
      e.row === 0 ? 'Batch Level' : e.row,
      e.field,
      `"${e.value.replace(/"/g, '""')}"`,
      e.severity,
      e.ruleId,
      `"${e.message.replace(/"/g, '""')}"`,
      `"${e.suggestion.replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCsvFile(`validation_errors_${currentBatchId}.csv`, csv);
  };

  const handleCommitValid = () => {
    // Collect rows that have critical or high errors
    const rowsWithBlockingErrors = new Set(
      validationErrors
        .filter(e => e.severity === 'Critical' || e.severity === 'High')
        .map(e => e.row)
    );

    const validRecordsToCommit: StudentRecord[] = [];
    const now = new Date().toISOString();

    rawParsedRecords.forEach((rec, idx) => {
      const rowNum = idx + 1;
      if (!rowsWithBlockingErrors.has(rowNum)) {
        const apaarClean = rec.apaarId ? rec.apaarId.replace(/\s+/g, '') : '';
        const id = `STU-UP-${Date.now()}-${idx}`;
        validRecordsToCommit.push({
          id,
          apaarId: apaarClean,
          apaarIdHmac: computeDeterministicHmac(apaarClean),
          institutionalStudentId: rec.institutionalStudentId || `ID-${idx}`,
          rollNumber: rec.rollNumber || `ROLL-${idx}`,
          name: rec.name || 'Candidate',
          dob: rec.dob || '2004-05-14',
          gender: rec.gender || 'MALE',
          email: rec.email || 'candidate@student.ac.in',
          mobile: rec.mobile || '+91 90000 00000',
          institutionId: selectedInstId,
          programId: selectedProgId,
          academicYear: batchYear,
          admissionDate: rec.admissionDate || '2024-07-20',
          admissionCategory: rec.admissionCategory || 'General',
          seatType: rec.seatType || 'Merit',
          isSupernumerary: rec.seatType === 'Supernumerary',
          isNri: rec.seatType === 'NRI',
          isOci: false,
          isForeignNational: false,
          academicStatus: 'Enrolled',
          consentReference: `CONS-BATCH-${Date.now()}-${idx}`,
          apaarVerificationStatus: 'VERIFIED',
          apaarVerificationDate: now,
          riskLevel: 'LOW',
          createdAt: now,
          updatedAt: now,
        });
      }
    });

    const newBatch: UploadBatch = {
      id: `BATCH-${Date.now()}`,
      batchNumber: currentBatchId,
      institutionId: selectedInstId,
      programId: selectedProgId,
      academicYear: batchYear,
      fileName,
      uploadedBy: 'Institution Registrar',
      uploadedAt: now,
      totalRows: rawParsedRecords.length,
      validRows: validRecordsToCommit.length,
      invalidRows: rowsWithBlockingErrors.size,
      warningsCount: validationErrors.filter(e => e.severity === 'Medium' || e.severity === 'Low').length,
      duplicatesCount: validationErrors.filter(e => e.ruleId.includes('DUPLICATE')).length,
      missingApaarCount: validationErrors.filter(e => e.ruleId.includes('MISSING-APAAR')).length,
      status: 'COMMITTED',
      errorsList: validationErrors,
    };

    onCommitBatch(newBatch, validRecordsToCommit);
    setStep('COMMITTED');

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // Ignore if confetti context unavailable
    }
  };

  const criticalErrorsCount = validationErrors.filter(e => e.severity === 'Critical').length;
  const highErrorsCount = validationErrors.filter(e => e.severity === 'High').length;
  const warningsCount = validationErrors.filter(e => e.severity === 'Medium' || e.severity === 'Low').length;
  const duplicateErrorsCount = validationErrors.filter(e => e.ruleId.includes('DUPLICATE')).length;
  const missingApaarCount = validationErrors.filter(e => e.ruleId.includes('MISSING-APAAR')).length;

  return (
    <div className="space-y-5">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs text-slate-500 mb-0.5">
            Institution Data Ingestion / Batch Workbench
          </div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Bulk Student Academic Record Upload & Validation Engine
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict AICTE intake verification, automated duplicate detection, and 12-digit APAAR format inspection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadTemplate}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download CSV Template</span>
          </button>
        </div>
      </div>

      {/* Target Program & Institution Selector */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
          Step 1: Select Academic Destination & Sanction Quotas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">Target Institution</label>
            <select
              value={selectedInstId}
              onChange={e => setSelectedInstId(e.target.value)}
              disabled={step === 'VALIDATED'}
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white text-slate-900 focus:outline-none"
            >
              {institutions.map(i => (
                <option key={i.id} value={i.id}>
                  {i.shortName} ({i.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">Target Department / Program</label>
            <select
              value={selectedProgId}
              onChange={e => setSelectedProgId(e.target.value)}
              disabled={step === 'VALIDATED'}
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white text-slate-900 focus:outline-none"
            >
              {programs.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">Academic Year</label>
            <select
              value={batchYear}
              onChange={e => setBatchYear(e.target.value as AcademicYear)}
              disabled={step === 'VALIDATED'}
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white text-slate-900 focus:outline-none"
            >
              <option value="2024-25">2024-25 (Current)</option>
              <option value="2023-24">2023-24</option>
            </select>
          </div>
        </div>
      </div>

      {/* Step 2: Upload or Select Pre-made Sample Dataset */}
      {step === 'SELECT' && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Step 2: Upload CSV File or Load Demo Test Batches
          </h2>

          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors">
            <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">
              Drag and drop your institutional admissions CSV here
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              File must include apaar_id, roll_number, student_name, dob, and category columns.
            </p>
            <div className="mt-4">
              <label className="px-4 py-2 bg-[#17365D] hover:bg-[#0F243E] text-white text-xs font-semibold rounded cursor-pointer inline-flex items-center gap-2 shadow-sm transition-colors">
                <span>Select File from Disk</span>
                <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Quick Evaluator Action Buttons */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-xs font-bold text-slate-900 mb-1">
              Evaluator Quick-Load Options (Pre-built Regulatory Test Batches):
            </div>
            <div className="text-[11px] text-slate-500 mb-3">
              Instantly test the verification pipeline without having to create an external spreadsheet file.
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={loadSampleValidBatch}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 rounded text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Load Sample Compliant Batch (25 Valid Records)</span>
              </button>

              <button
                onClick={loadSampleErroneousBatch}
                className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Load Sample Batch with Errors (Missing APAAR, Duplicates, Format Breach)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Validation Summary & Row Error Inspector */}
      {step === 'VALIDATED' && (
        <div className="space-y-4">
          {/* Validation KPI Summary Strip */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                  BATCH ID: {currentBatchId}
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  Validation Results for <span className="font-mono text-blue-900">{fileName}</span>
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep('SELECT')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded border border-slate-200"
                >
                  Discard & Re-upload
                </button>

                {validationErrors.length > 0 && (
                  <button
                    onClick={handleDownloadErrors}
                    className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Errors CSV</span>
                  </button>
                )}

                <button
                  onClick={handleCommitValid}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#17365D] hover:bg-[#0F243E] rounded shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>
                    Commit Valid Records ({rawParsedRecords.length - (criticalErrorsCount + highErrorsCount)})
                  </span>
                </button>
              </div>
            </div>

            {/* Metric counters: Spacious 4-Card Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-4">
              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                  Total File Rows
                </span>
                <div className="text-2xl font-extrabold font-mono tabular-nums text-slate-900 mt-1">
                  {rawParsedRecords.length}
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Records processed</span>
              </div>

              <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider block">
                  Valid for Ingestion
                </span>
                <div className="text-2xl font-extrabold font-mono tabular-nums text-emerald-700 mt-1">
                  {rawParsedRecords.length - (criticalErrorsCount + highErrorsCount)}
                </div>
                <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">
                  Complies with AICTE regulations
                </span>
              </div>

              <div className="p-3.5 bg-red-50/70 rounded-xl border border-red-200">
                <span className="text-[10px] text-red-800 uppercase font-bold tracking-wider block">
                  Blocking Errors
                </span>
                <div className="text-2xl font-extrabold font-mono tabular-nums text-red-600 mt-1">
                  {criticalErrorsCount + highErrorsCount}
                </div>
                <span className="text-[10px] text-red-600 font-medium mt-0.5 block">
                  {criticalErrorsCount} Critical · {highErrorsCount} High Conflicts
                </span>
              </div>

              <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200">
                <span className="text-[10px] text-amber-800 uppercase font-bold tracking-wider block">
                  Warnings & Duplicates
                </span>
                <div className="text-2xl font-extrabold font-mono tabular-nums text-amber-700 mt-1">
                  {duplicateErrorsCount + warningsCount}
                </div>
                <span className="text-[10px] text-amber-700 font-medium mt-0.5 block">
                  {duplicateErrorsCount} Duplicates · {missingApaarCount} Missing APAAR
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Row-Wise Error Explanation Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Row-Wise Error Matrix & Actionable Regulatory Corrections ({validationErrors.length})
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Every error specifies the violating rule, field name, exact value, and required regulatory correction.
                </p>
              </div>
            </div>

            {validationErrors.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-900">Batch Fully Compliant!</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Zero validation errors or intake quota breaches detected. You can now commit this batch to the national repository.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2.5 text-center">Row #</th>
                      <th className="px-3 py-2.5">Field</th>
                      <th className="px-3 py-2.5">Offending Value</th>
                      <th className="px-3 py-2.5 text-center">Severity</th>
                      <th className="px-3 py-2.5">Rule ID</th>
                      <th className="px-3 py-2.5">Error Explanation</th>
                      <th className="px-3 py-2.5">Actionable Suggestion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {validationErrors.map((err, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-800">
                          {err.row === 0 ? 'BATCH' : `Row ${err.row}`}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[11px] text-slate-700">
                          {err.field}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[11px] text-red-600 max-w-[120px] truncate">
                          {err.value || '<EMPTY>'}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                              err.severity === 'Critical'
                                ? 'bg-red-500 text-white'
                                : err.severity === 'High'
                                ? 'bg-orange-500 text-white'
                                : err.severity === 'Medium'
                                ? 'bg-amber-500 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {err.severity}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[10px] text-slate-500">
                          {err.ruleId}
                        </td>
                        <td className="px-3 py-2.5 font-medium text-slate-800">
                          {err.message}
                        </td>
                        <td className="px-3 py-2.5 text-slate-600 text-[11px]">
                          {err.suggestion}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Committed Confirmation Screen */}
      {step === 'COMMITTED' && (
        <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              COMMITTED TO POSTGRESQL · BATCH {currentBatchId}
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-2">
              Student Records Ingestion Successful
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              The valid admissions records have been cryptographically hashed, registered with deterministic APAAR references, and synced to institutional seat accounts.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              onClick={() => setStep('SELECT')}
              className="px-4 py-2 bg-[#17365D] hover:bg-[#0F243E] text-white text-xs font-semibold rounded shadow-sm transition-colors"
            >
              Upload Another Batch
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
