import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Users,
  Building,
  FileCheck,
  QrCode,
  ArrowRight,
  X,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface DemoScenariosGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToScenario: (tab: NavTab, actionDetails?: Record<string, any>) => void;
}

export const DemoScenariosGuide: React.FC<DemoScenariosGuideProps> = ({
  isOpen,
  onClose,
  onNavigateToScenario,
}) => {
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'IDENTITY' | 'COMPLIANCE' | 'SERVICES'>('ALL');

  if (!isOpen) return null;

  const scenarios = [
    {
      id: 1,
      category: 'IDENTITY',
      title: 'Valid APAAR Student',
      tag: 'COMPLIANT',
      tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'Aryan Sharma (IIT Delhi) with 12-digit APAAR 7123 4567 8901 verified via ABC registry.',
      targetTab: 'students' as NavTab,
      targetAction: { search: 'Aryan Sharma' },
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
    },
    {
      id: 2,
      category: 'IDENTITY',
      title: 'Invalid 12-Digit Format',
      tag: 'FORMAT ERROR',
      tagColor: 'bg-red-50 text-red-700 border-red-200',
      description: 'Vikram Singh (COEP Pune) has corrupt alphanumeric APAAR 9988-ABC-12, caught by validation engine.',
      targetTab: 'students' as NavTab,
      targetAction: { search: 'Vikram Singh' },
      icon: XCircle,
      iconColor: 'text-red-600',
    },
    {
      id: 3,
      category: 'COMPLIANCE',
      title: 'Intra-College Duplicate APAAR',
      tag: 'INTERNAL DUPLICATE',
      tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
      description: 'Rohan Kulkarni & Rohan K. share same APAAR 8234 5678 9012 at COEP Pune (double batch entry).',
      targetTab: 'students' as NavTab,
      targetAction: { search: 'Rohan' },
      icon: Copy,
      iconColor: 'text-amber-600',
    },
    {
      id: 4,
      category: 'COMPLIANCE',
      title: 'Cross-Institution Concurrent Enrolment',
      tag: 'INTER-COLLEGE CONFLICT',
      tagColor: 'bg-red-50 text-red-700 border-red-200',
      description: 'Neha Verma enrolled simultaneously at IIT Delhi and CEG Anna Univ with APAAR 6345 6789 0123.',
      targetTab: 'cases' as NavTab,
      targetAction: { caseId: 'CASE-2024-001' },
      icon: Users,
      iconColor: 'text-red-600',
    },
    {
      id: 5,
      category: 'COMPLIANCE',
      title: '130 Admissions vs 120 Approved Intake',
      tag: 'EXCESS INTAKE (108.3%)',
      tagColor: 'bg-red-50 text-red-700 border-red-200',
      description: 'CEG Anna University B.Tech CSE exceeded AICTE sanctioned intake capacity by 10 unauthorized seats.',
      targetTab: 'cases' as NavTab,
      targetAction: { caseId: 'CASE-2024-002' },
      icon: Building,
      iconColor: 'text-red-600',
    },
    {
      id: 6,
      category: 'COMPLIANCE',
      title: '35 NRI Admissions vs Sanctioned Limit of 30',
      tag: 'CATEGORY QUOTA BREACH',
      tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
      description: 'Manipal Tech enrolled 35 students under NRI sponsorship against sanctioned limit of 30 seats.',
      targetTab: 'cases' as NavTab,
      targetAction: { caseId: 'CASE-2024-003' },
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
    },
    {
      id: 7,
      category: 'IDENTITY',
      title: 'Name Mismatch Discrepancy',
      tag: 'IDENTITY MISMATCH',
      tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
      description: 'Priya Ranganathan: College ERP entered "Priya R.", while ABC National Depository has full legal name.',
      targetTab: 'students' as NavTab,
      targetAction: { search: 'Priya' },
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
    },
    {
      id: 8,
      category: 'IDENTITY',
      title: 'Pending APAAR Verification',
      tag: 'PENDING HANDSHAKE',
      tagColor: 'bg-slate-100 text-slate-700 border-slate-200',
      description: 'Fresh admission records awaiting DigiLocker synchronization and consent verification.',
      targetTab: 'apaar_sandbox' as NavTab,
      targetAction: { apaarId: '367890123456' },
      icon: AlertTriangle,
      iconColor: 'text-slate-500',
    },
    {
      id: 9,
      category: 'SERVICES',
      title: 'Employer Verification & Student Consent',
      tag: 'DPDP COMPLIANT',
      tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'TCS Talent verifier submitted request for candidate Aryan Sharma; student can Grant or Deny consent.',
      targetTab: 'student_portal' as NavTab,
      icon: FileCheck,
      iconColor: 'text-blue-600',
    },
    {
      id: 10,
      category: 'SERVICES',
      title: 'Cryptographic QR-Verifiable Credential',
      tag: 'HMAC-SHA256 SIGNED',
      tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
      description: 'Cryptographically signed academic credential with HMAC-SHA256 signature and real-time QR verifier.',
      targetTab: 'credentials_qr' as NavTab,
      icon: QrCode,
      iconColor: 'text-purple-600',
    },
  ];

  const filteredScenarios = scenarios.filter(s =>
    activeCategory === 'ALL' ? true : s.category === activeCategory
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#17365D] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                AICTE Demonstration Scenarios & Evaluation Guide
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Test the 10 seeded real-world regulatory scenarios in 1 click
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0 text-xs">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeCategory === 'ALL'
                ? 'bg-[#17365D] text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            All 10 Scenarios
          </button>
          <button
            onClick={() => setActiveCategory('IDENTITY')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeCategory === 'IDENTITY'
                ? 'bg-[#17365D] text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            APAAR & Identity (4)
          </button>
          <button
            onClick={() => setActiveCategory('COMPLIANCE')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeCategory === 'COMPLIANCE'
                ? 'bg-[#17365D] text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            Intake & Duplicates (4)
          </button>
          <button
            onClick={() => setActiveCategory('SERVICES')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeCategory === 'SERVICES'
                ? 'bg-[#17365D] text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            Consent & Verifiable Credentials (2)
          </button>
        </div>

        {/* Content Body: Spacious 2-Column Grid */}
        <div className="p-6 overflow-y-auto space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredScenarios.map(s => {
              const Icon = s.icon;
              return (
                <div
                  key={s.id}
                  onClick={() => {
                    onNavigateToScenario(s.targetTab, s.targetAction);
                    onClose();
                  }}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50/30 transition-all cursor-pointer shadow-xs hover:shadow-md group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-mono font-bold text-slate-400">
                        SCENARIO #{s.id}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${s.tagColor}`}>
                        {s.tag}
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5 mb-1.5">
                      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${s.iconColor}`} />
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-900 leading-snug">
                        {s.title}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed pl-6.5">
                      {s.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-blue-700 font-semibold pl-6.5">
                    <span>Jump to Live Workflow</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Click any card to immediately navigate and inspect the underlying system data</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
