import React, { useState } from 'react';
import {
  FileCode2,
  Copy,
  Check,
  Play,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { OPENAPI_SPEC } from '../../services/swaggerSpec';

export const SwaggerDocView: React.FC = () => {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/apaar/validate');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCopyCurl = (endpoint: string, method: string) => {
    const curl = `curl -X ${method.toUpperCase()} "https://aicte-verify.gov.in/api/v1${endpoint}" \\\n  -H "Authorization: Bearer <JWT_TOKEN>" \\\n  -H "Content-Type: application/json"`;
    navigator.clipboard.writeText(curl);
    setCopiedPath(endpoint);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const handleRunMockCall = async (endpoint: string) => {
    setIsLoading(true);
    setTestResponse(null);
    await new Promise(r => setTimeout(r, 200));

    if (endpoint === '/apaar/validate') {
      setTestResponse(
        JSON.stringify(
          {
            status: 'VERIFIED',
            apaar_id: '712345678901',
            candidate_name: 'Aryan Sharma',
            match_score: 100,
            dob_matched: true,
            abc_account_id: 'ABC-DL-2024-8841',
            timestamp: new Date().toISOString(),
          },
          null,
          2
        )
      );
    } else if (endpoint === '/compliance/overview') {
      setTestResponse(
        JSON.stringify(
          {
            academic_year: '2024-25',
            total_institutions: 5,
            total_students_enrolled: 130,
            apaar_verified_pct: 94.2,
            duplicate_cases_flagged: 3,
            excess_intake_violations: 1,
            regulatory_status: 'MONITORING_ACTIVE',
          },
          null,
          2
        )
      );
    } else {
      setTestResponse(
        JSON.stringify(
          {
            status: 'success',
            endpoint,
            execution_time_ms: 18,
            records_count: 25,
            page: 1,
          },
          null,
          2
        )
      );
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs text-slate-500 mb-0.5">
            API Documentation & Institutional ERP Integration Gateway
          </div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>FastAPI OpenAPI 3.1.0 Swagger Specification</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono px-2 py-0.5 rounded font-bold border border-emerald-300">
              OAS v3.1
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            REST endpoints for institutional ERP integration, bulk uploads, automated validation, and verifier queries.
          </p>
        </div>
      </div>

      {/* OpenAPI Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Endpoints Index */}
        <div className="lg:col-span-5 space-y-2">
          {Object.entries(OPENAPI_SPEC.paths).map(([path, methods]) => {
            const method = Object.keys(methods)[0];
            const details = (methods as any)[method];
            const isSelected = selectedEndpoint === path;

            return (
              <div
                key={path}
                onClick={() => {
                  setSelectedEndpoint(path);
                  setTestResponse(null);
                }}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-400 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 font-mono">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        method === 'post'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {method.toUpperCase()}
                    </span>
                    <span className="font-semibold text-slate-900">{path}</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-600">{details.summary}</div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Interactive Tester & Schema Workbench */}
        <div className="lg:col-span-7 bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                {selectedEndpoint}
              </span>
              <div className="text-xs text-slate-600 mt-1 font-medium">
                {(OPENAPI_SPEC.paths as any)[selectedEndpoint]?.post?.summary ||
                  (OPENAPI_SPEC.paths as any)[selectedEndpoint]?.get?.summary}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyCurl(selectedEndpoint, 'POST')}
                className="px-2.5 py-1 text-xs border border-slate-300 rounded text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                title="Copy cURL command"
              >
                {copiedPath === selectedEndpoint ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>Copy cURL</span>
              </button>

              <button
                onClick={() => handleRunMockCall(selectedEndpoint)}
                disabled={isLoading}
                className="px-3 py-1 bg-[#17365D] hover:bg-[#0F243E] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Play className="w-3 h-3" />
                <span>Test Endpoint</span>
              </button>
            </div>
          </div>

          {/* cURL Display */}
          <div className="bg-slate-900 text-slate-200 p-3 rounded font-mono text-[11px] overflow-x-auto space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
              Sample cURL Request
            </span>
            <div className="text-emerald-400">curl -X POST "https://aicte-verify.gov.in/api/v1{selectedEndpoint}" \</div>
            <div className="text-slate-300 pl-4">-H "Authorization: Bearer &lt;JWT_TOKEN&gt;" \</div>
            <div className="text-slate-300 pl-4">-H "Content-Type: application/json"</div>
          </div>

          {/* Live Response Output */}
          {testResponse && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500">Live JSON Response (200 OK)</span>
              <pre className="p-3 bg-slate-900 text-emerald-400 rounded text-[11px] font-mono overflow-x-auto">
                {testResponse}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
