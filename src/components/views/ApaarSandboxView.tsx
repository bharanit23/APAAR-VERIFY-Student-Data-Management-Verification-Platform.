import React, { useState } from 'react';
import {
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  ExternalLink,
  Search,
} from 'lucide-react';
import {
  verifyWithApaarMockAdapter,
  validateApaarFormat,
  ApaarVerificationResult,
  SYNTHETIC_APAAR_REGISTRY,
} from '../../services/apaarMockProvider';
import { formatApaarWithSpaces, maskApaarId } from '../../services/cryptoService';

export const ApaarSandboxView: React.FC = () => {
  const [apaarInput, setApaarInput] = useState('712345678901');
  const [nameInput, setNameInput] = useState('Aryan Sharma');
  const [dobInput, setDobInput] = useState('2004-05-14');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ApaarVerificationResult | null>(null);
  const [history, setHistory] = useState<ApaarVerificationResult[]>([]);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setResult(null);

    // Simulate standard government API handshake latency (250ms)
    await new Promise(r => setTimeout(r, 250));

    const res = await verifyWithApaarMockAdapter(apaarInput, nameInput, dobInput);
    setResult(res);
    setHistory(prev => [res, ...prev.slice(0, 9)]);
    setIsLoading(false);
  };

  const loadPreset = (apaar: string, name: string, dob: string) => {
    setApaarInput(apaar);
    setNameInput(name);
    setDobInput(dob);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs text-slate-500 mb-0.5">
            National Academic Depository / ABC & DigiLocker Adapter
          </div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Independent APAAR Validation Gateway & Mock Registry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Simulated test adapter for 12-digit identity verification, fuzzy name matching, and birth date validation.
          </p>
        </div>
      </div>

      {/* Mandatory Regulatory Simulation Notice Banner */}
      <div className="bg-amber-50 border border-amber-300 rounded-lg p-3.5 shadow-sm text-xs text-amber-900">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase tracking-wide block">
              Government Protocol Notice: Simulated Mock Provider
            </span>
            <p className="mt-0.5 text-amber-800 leading-relaxed">
              This sandbox uses an authorized simulation adapter with seeded synthetic identities. It is designed for regulatory testing and does not transmit data to or connect with live production DigiLocker or Academic Bank of Credits (ABC) endpoints.
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Tester Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Presets */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5.5 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Identity Verification Query
            </h2>

            <form onSubmit={handleVerify} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  APAAR ID (12 Numeric Digits) *
                </label>
                <input
                  type="text"
                  maxLength={14}
                  placeholder="e.g. 712345678901"
                  value={apaarInput}
                  onChange={e => setApaarInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-[#17365D]"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Candidate Legal Full Name (from College Records) *
                </label>
                <input
                  type="text"
                  placeholder="Candidate Name"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#17365D]"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Date of Birth (YYYY-MM-DD)
                </label>
                <input
                  type="date"
                  value={dobInput}
                  onChange={e => setDobInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-[#17365D] hover:bg-[#0F243E] disabled:opacity-50 text-white rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                {isLoading ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying with Mock ABC...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Probe APAAR National Adapter</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Preset Buttons for Evaluator */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Seeded Test Identity Presets:
            </h3>

            <div className="space-y-2 text-xs">
              <button
                type="button"
                onClick={() => loadPreset('712345678901', 'Aryan Sharma', '2004-05-14')}
                className="w-full p-3 text-left rounded-lg bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-slate-900">Aryan Sharma</span>
                  <span className="text-[11px] text-slate-500 block font-mono mt-0.5">7123 4567 8901</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  VERIFIED
                </span>
              </button>

              <button
                type="button"
                onClick={() => loadPreset('823456789012', 'Priya R.', '2003-11-20')}
                className="w-full p-3 text-left rounded-lg bg-slate-50 hover:bg-amber-50/70 border border-slate-200 hover:border-amber-300 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-slate-900">Priya R. (ERP Abbreviation)</span>
                  <span className="text-[11px] text-slate-500 block font-mono mt-0.5">8234 5678 9012</span>
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  NAME MISMATCH
                </span>
              </button>

              <button
                type="button"
                onClick={() => loadPreset('545678901234', 'Rahul Dev', '2004-01-10')}
                className="w-full p-2 text-left rounded bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-slate-900">Rahul Dev (DOB 10th vs 12th)</span>
                  <span className="text-[11px] text-slate-500 block font-mono">5456 7890 1234</span>
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                  DOB MISMATCH
                </span>
              </button>

              <button
                type="button"
                onClick={() => loadPreset('9988-ABC-12', 'Vikram Singh', '2004-09-12')}
                className="w-full p-2 text-left rounded bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-300 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-slate-900">Corrupt Format</span>
                  <span className="text-[11px] text-slate-500 block font-mono">9988-ABC-12</span>
                </div>
                <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                  INVALID FORMAT
                </span>
              </button>

              <button
                type="button"
                onClick={() => loadPreset('990011223344', 'Unknown Student', '2004-01-01')}
                className="w-full p-2 text-left rounded bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-300 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-slate-900">Unregistered Identity</span>
                  <span className="text-[11px] text-slate-500 block font-mono">9900 1122 3344</span>
                </div>
                <span className="text-[10px] font-bold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded">
                  NOT FOUND
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Verification Results Inspector & Telemetry */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Verification Engine Response Analysis
            </h2>

            {!result && !isLoading && (
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-lg text-center text-slate-400 text-xs">
                Enter an APAAR ID on the left and click "Probe APAAR National Adapter" to view telemetry.
              </div>
            )}

            {isLoading && (
              <div className="p-10 text-center space-y-2">
                <RotateCcw className="w-8 h-8 text-[#17365D] animate-spin mx-auto" />
                <p className="text-xs text-slate-600 font-medium">
                  Connecting to Mock ABC / DigiLocker Verification Adapter...
                </p>
              </div>
            )}

            {result && !isLoading && (
              <div className="space-y-4 text-xs">
                {/* Status Hero */}
                <div
                  className={`p-4 rounded-lg border ${
                    result.status === 'VERIFIED'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : result.status === 'INVALID_FORMAT' || result.status === 'NOT_FOUND'
                      ? 'bg-red-50 border-red-300 text-red-950'
                      : 'bg-amber-50 border-amber-300 text-amber-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {result.status === 'VERIFIED' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold text-sm tracking-wide">
                          {result.status.replace('_', ' ')}
                        </span>
                        <div className="text-[11px] opacity-80 mt-0.5 font-mono">
                          Response Status: {result.status === 'VERIFIED' ? '200 OK (MATCHED)' : '422 UNPROCESSABLE IDENTITY'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono opacity-60">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  {result.failureReason && (
                    <div className="mt-2.5 pt-2 border-t border-current/20 text-[11px]">
                      <strong>Failure Reason:</strong> {result.failureReason}
                    </div>
                  )}
                </div>

                {/* Match Comparison Breakdown */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      Fuzzy Name Match Score
                    </span>
                    <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
                      {result.nameMatchScore}%
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Registry Legal Name: <strong>{result.registryName || 'N/A'}</strong>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      Date of Birth Match
                    </span>
                    <div className="text-xl font-bold font-mono text-slate-900">
                      {result.dobMatched ? 'MATCHED' : 'DISCREPANCY'}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Registry DOB: <strong>{result.registryDob || 'N/A'}</strong>
                    </div>
                  </div>
                </div>

                {/* Technical ABC Payload Inspection */}
                <div className="bg-slate-900 text-slate-200 p-3.5 rounded-lg font-mono text-[11px] overflow-x-auto space-y-1">
                  <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                    API Response Payload Snapshot (Simulated JSON)
                  </div>
                  <div>&#123;</div>
                  <div className="pl-4">"apaar_id": "{maskApaarId(result.apaarId)}",</div>
                  <div className="pl-4">"verification_status": "{result.status}",</div>
                  <div className="pl-4">"name_similarity_pct": {result.nameMatchScore},</div>
                  <div className="pl-4">"dob_valid": {result.dobMatched ? 'true' : 'false'},</div>
                  <div className="pl-4">"abc_account_id": "{result.abcAccountId || 'null'}",</div>
                  <div className="pl-4">"adapter_mode": "MOCK_SYNTHETIC_SANDBOX"</div>
                  <div>&#125;</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
