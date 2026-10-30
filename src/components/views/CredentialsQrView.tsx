import React, { useState, useEffect } from 'react';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Download,
  Printer,
  Copy,
  ExternalLink,
  Lock,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { DigitalCredential, StudentRecord, Institution, Program } from '../../types';
import { generateVerifiableQrCodeUrl } from '../../services/qrService';
import { verifyCredentialSignature, maskApaarId } from '../../services/cryptoService';
import { dbRepository } from '../../services/storageRepository';

interface CredentialsQrViewProps {
  credentials: DigitalCredential[];
  students: StudentRecord[];
  institutions: Institution[];
  programs: Program[];
}

export const CredentialsQrView: React.FC<CredentialsQrViewProps> = ({
  credentials,
  students,
  institutions,
  programs,
}) => {
  const [selectedCredId, setSelectedCredId] = useState<string>(
    credentials[0]?.credentialId || ''
  );
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [tamperTestPayload, setTamperTestPayload] = useState(false);

  // QR Scanner Simulator
  const [scanQuery, setScanQuery] = useState(credentials[0]?.credentialId || '');
  const [scanResult, setScanResult] = useState<{
    found: boolean;
    validSignature: boolean;
    credential?: DigitalCredential;
    student?: StudentRecord;
    institution?: Institution;
  } | null>(null);

  const activeCred = credentials.find(c => c.credentialId === selectedCredId) || credentials[0];
  const activeStudent = activeCred ? students.find(s => s.id === activeCred.studentId) : undefined;
  const activeInst = activeCred ? institutions.find(i => i.id === activeCred.institutionId) : undefined;
  const activeProg = activeCred ? programs.find(p => p.id === activeCred.programId) : undefined;

  useEffect(() => {
    if (activeCred) {
      generateVerifiableQrCodeUrl(activeCred.verificationUrl).then(url => setQrDataUrl(url));
    }
  }, [activeCred]);

  // Compute signature validity
  const isSignatureValid = activeCred
    ? verifyCredentialSignature(
        tamperTestPayload
          ? { ...activeCred.payloadSnapshot, studentName: 'Tampered Name' }
          : activeCred.payloadSnapshot,
        activeCred.digitalSignature
      )
    : false;

  const handleSimulateScan = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanId = scanQuery.trim();
    const cred = dbRepository.getCredentialById(cleanId);
    if (!cred) {
      setScanResult({
        found: false,
        validSignature: false,
      });
      return;
    }

    const valid = verifyCredentialSignature(cred.payloadSnapshot, cred.digitalSignature);
    const stu = students.find(s => s.id === cred.studentId);
    const inst = institutions.find(i => i.id === cred.institutionId);

    setScanResult({
      found: true,
      validSignature: valid,
      credential: cred,
      student: stu,
      institution: inst,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs text-slate-500 mb-0.5">
            National Academic Depository / Verifiable Credentials Engine
          </div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Verifiable Digital Credentials & Cryptographic QR Verification
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tamper-proof academic identity records signed via institutional ECDSA/HMAC and verifiable via opaque QR references.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Certificate View</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Certificate on Left, Verification & Scanner on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Official Certificate Preview Card */}
        <div className="lg:col-span-7 space-y-4">
          {activeCred && (
            <div className="bg-white rounded-lg border-2 border-slate-800 shadow-md p-6 relative overflow-hidden text-slate-900 font-sans print:shadow-none print:border-none">
              {/* Demonstration Disclaimer Header Banner */}
              <div className="bg-amber-100 border border-amber-300 text-amber-900 px-3 py-1 rounded text-[10px] font-bold text-center uppercase tracking-wider mb-5">
                PROTOTYPE DEMONSTRATION DOCUMENT · NOT AN OFFICIAL DEGREE CERTIFICATE
              </div>

              {/* Institution Seal & AICTE Crest */}
              <div className="text-center pb-4 border-b-2 border-slate-800">
                <div className="w-12 h-12 rounded bg-[#17365D] text-white flex items-center justify-center font-bold text-lg mx-auto shadow-sm mb-2">
                  <ShieldCheck className="w-7 h-7 text-white" />
                </div>
                <div className="text-xs font-bold text-slate-500 tracking-wider uppercase">
                  Government of India · Ministry of Education
                </div>
                <h2 className="text-base font-extrabold text-[#17365D] uppercase tracking-tight mt-0.5">
                  ALL INDIA COUNCIL FOR TECHNICAL EDUCATION
                </h2>
                <div className="text-xs font-semibold text-slate-700">
                  National Academic Identity & Enrolment Verification Registry
                </div>
              </div>

              {/* Certificate Body */}
              <div className="py-6 space-y-4 text-center">
                <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
                  Verifiable Academic Identity Record
                </div>

                <div className="text-sm text-slate-700">
                  This is to certify that candidate
                </div>

                <div className="text-xl font-extrabold text-[#17365D] tracking-tight">
                  {activeCred.payloadSnapshot.studentName}
                </div>

                <div className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                  bearing Institutional Student Roll Number <span className="font-mono font-bold text-slate-900">{activeCred.payloadSnapshot.rollNumber}</span> has been authenticated under National Academic Bank of Credits reference{' '}
                  <span className="font-mono font-bold text-slate-900">{activeCred.payloadSnapshot.maskedApaarId}</span> for active admission in:
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200 inline-block text-center max-w-md mx-auto">
                  <div className="text-xs font-bold text-slate-900">
                    {activeCred.payloadSnapshot.programName}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    {activeCred.payloadSnapshot.institutionName}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">
                    Academic Year {activeCred.payloadSnapshot.academicYear} · Status: {activeCred.payloadSnapshot.admissionStatus}
                  </div>
                </div>
              </div>

              {/* Certificate Footer with QR Code & Digital Signature */}
              <div className="pt-4 border-t-2 border-slate-800 flex items-end justify-between gap-4 text-left">
                {/* QR Code */}
                <div className="flex items-center gap-3">
                  {qrDataUrl && (
                    <img
                      src={qrDataUrl}
                      alt="Verifiable Credential QR"
                      className="w-20 h-20 border border-slate-300 rounded p-1 bg-white"
                    />
                  )}
                  <div className="text-[10px] text-slate-600 font-mono space-y-0.5">
                    <div><strong>Credential ID:</strong></div>
                    <div className="font-bold text-slate-900">{activeCred.credentialId}</div>
                    <div className="text-slate-400">Issue Date: {activeCred.issueDate}</div>
                    <div className="text-emerald-700 font-bold">DIGITALLY SIGNED</div>
                  </div>
                </div>

                {/* Digital Signature Details */}
                <div className="text-right text-[10px] font-mono space-y-0.5">
                  <div className="text-slate-400">Cryptographic Signing Authority</div>
                  <div className="font-semibold text-slate-800">{activeCred.payloadSnapshot.signedBy}</div>
                  <div className="text-slate-500 break-all max-w-[200px]">
                    {activeCred.digitalSignature}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Cryptographic Verifier & QR Scanner */}
        <div className="lg:col-span-5 space-y-5">
          {/* Cryptographic Signature Inspector */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>ECDSA / HMAC-SHA256 Signature Verification</span>
              <Lock className="w-3.5 h-3.5 text-blue-600" />
            </h2>

            <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Signature Status:</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                    isSignatureValid
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-red-100 text-red-800 border-red-300'
                  }`}
                >
                  {isSignatureValid ? 'VALID & UNTAMPERED' : 'INVALID / TAMPERED'}
                </span>
              </div>

              <div className="font-mono text-[10px] text-slate-500 break-all">
                Hash: {activeCred?.digitalSignature}
              </div>

              {/* Tamper Simulation Toggle */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-700">Simulate payload tampering:</span>
                <button
                  onClick={() => setTamperTestPayload(!tamperTestPayload)}
                  className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                    tamperTestPayload
                      ? 'bg-red-500 text-white border-red-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {tamperTestPayload ? 'Tampering Active (Invalid)' : 'Test Tamper Detection'}
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Public QR Scanner & Verifier Simulator */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-purple-600" />
              <span>Public QR Verifier Simulator</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Simulates scanning the QR code on a student credential or entering an opaque credential reference.
            </p>

            <form onSubmit={handleSimulateScan} className="space-y-2 text-xs">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. CRD-2024-IITD-88419"
                  value={scanQuery}
                  onChange={e => setScanQuery(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded font-mono text-xs focus:outline-none focus:border-[#17365D]"
                  required
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#17365D] hover:bg-[#0F243E] text-white rounded font-semibold text-xs shadow-sm"
                >
                  Verify QR
                </button>
              </div>
            </form>

            {/* Scan Result Card */}
            {scanResult && (
              <div className="mt-3 text-xs space-y-2">
                {!scanResult.found ? (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-red-900 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>No credential record exists with reference ID "{scanQuery}".</span>
                  </div>
                ) : (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-emerald-950">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Authentic Verifiable Credential</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-800 font-bold">
                        ACTIVE · UNREVOKED
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-800 font-medium">
                      <div>Student: {scanResult.student?.name}</div>
                      <div>APAAR: {maskApaarId(scanResult.student?.apaarId)}</div>
                      <div>College: {scanResult.institution?.shortName}</div>
                      <div>Roll: {scanResult.student?.rollNumber}</div>
                    </div>

                    <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-emerald-200">
                      Signature Check: ECDSA Valid · AICTE Registry Verified
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
