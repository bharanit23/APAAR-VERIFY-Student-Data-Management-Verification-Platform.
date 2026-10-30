import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  UploadCloud,
  AlertOctagon,
  KeyRound,
  QrCode,
  FileSpreadsheet,
  ScrollText,
  FileCode2,
  ChevronLeft,
  ChevronRight,
  UserCheck2,
  Search,
} from 'lucide-react';
import { UserRole } from '../types';

export type NavTab =
  | 'national_dashboard'
  | 'institution_dashboard'
  | 'students'
  | 'upload'
  | 'cases'
  | 'apaar_sandbox'
  | 'student_portal'
  | 'employer_portal'
  | 'credentials_qr'
  | 'reports'
  | 'audit'
  | 'swagger';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  userRole: UserRole;
  collapsed: boolean;
  onToggleCollapse: () => void;
  openCasesCount: number;
  duplicateCount: number;
}

interface NavSection {
  title: string;
  items: Array<{
    id: NavTab;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
    roles: UserRole[];
  }>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  userRole,
  collapsed,
  onToggleCollapse,
  openCasesCount,
  duplicateCount,
}) => {
  const sections: NavSection[] = [
    {
      title: 'Regulatory Monitoring',
      items: [
        {
          id: 'national_dashboard',
          label: 'National Overview',
          icon: LayoutDashboard,
          roles: ['aicte_admin', 'aicte_reviewer', 'auditor'],
        },
        {
          id: 'institution_dashboard',
          label: 'Institution Intake',
          icon: Building2,
          roles: ['aicte_admin', 'aicte_reviewer', 'inst_admin', 'admission_officer', 'auditor'],
        },
        {
          id: 'cases',
          label: 'Compliance Cases',
          icon: AlertOctagon,
          badge: openCasesCount > 0 ? openCasesCount : undefined,
          badgeColor: 'bg-red-500 text-white',
          roles: ['aicte_admin', 'aicte_reviewer', 'inst_admin', 'auditor'],
        },
      ],
    },
    {
      title: 'Student Admissions',
      items: [
        {
          id: 'students',
          label: 'Student Registry',
          icon: Users,
          badge: duplicateCount > 0 ? `${duplicateCount} flags` : undefined,
          badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300',
          roles: ['aicte_admin', 'aicte_reviewer', 'inst_admin', 'admission_officer', 'auditor'],
        },
        {
          id: 'upload',
          label: 'Bulk Data Upload',
          icon: UploadCloud,
          roles: ['aicte_admin', 'inst_admin', 'admission_officer'],
        },
        {
          id: 'apaar_sandbox',
          label: 'APAAR Validation',
          icon: KeyRound,
          roles: ['aicte_admin', 'aicte_reviewer', 'inst_admin', 'admission_officer'],
        },
      ],
    },
    {
      title: 'Consent & Verification',
      items: [
        {
          id: 'student_portal',
          label: 'Student Consent Hub',
          icon: UserCheck2,
          roles: ['student', 'aicte_admin'],
        },
        {
          id: 'employer_portal',
          label: 'Verifier Portal',
          icon: Search,
          roles: ['employer_verifier', 'aicte_admin'],
        },
        {
          id: 'credentials_qr',
          label: 'Credentials & QR',
          icon: QrCode,
          roles: ['aicte_admin', 'aicte_reviewer', 'inst_admin', 'student', 'employer_verifier', 'auditor'],
        },
      ],
    },
    {
      title: 'Governance & APIs',
      items: [
        {
          id: 'reports',
          label: 'Reports & Analytics',
          icon: FileSpreadsheet,
          roles: ['aicte_admin', 'aicte_reviewer', 'inst_admin', 'admission_officer', 'auditor'],
        },
        {
          id: 'audit',
          label: 'Audit Trail',
          icon: ScrollText,
          roles: ['aicte_admin', 'auditor'],
        },
        {
          id: 'swagger',
          label: 'REST API & OpenAPI',
          icon: FileCode2,
          roles: ['aicte_admin', 'inst_admin'],
        },
      ],
    },
  ];

  return (
    <aside
      className={`bg-white border-r border-slate-200 transition-all duration-200 flex flex-col shrink-0 select-none shadow-xs ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Navigation Header with Collapse Toggle */}
      <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
        {!collapsed && (
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">
            System Modules
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors mx-auto"
          title={collapsed ? 'Expand Menu' : 'Collapse Menu'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 py-4 px-2.5 space-y-6 overflow-y-auto">
        {sections.map((section, sIdx) => {
          const visibleItems = section.items.filter(item => item.roles.includes(userRole));
          if (visibleItems.length === 0) return null;

          return (
            <div key={sIdx} className="space-y-1">
              {!collapsed && (
                <div className="px-2.5 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {section.title}
                </div>
              )}
              {visibleItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left group ${
                      isActive
                        ? 'bg-[#17365D] text-white shadow-xs font-semibold'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800'
                      }`}
                    />
                    {!collapsed && (
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <span className="truncate">{item.label}</span>
                        {item.badge !== undefined && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                              item.badgeColor || 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Bottom Footer Info */}
      {!collapsed && (
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/60 text-[11px] text-slate-500">
          <div className="font-semibold text-slate-700">AICTE Regulatory Cell</div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">APAAR Node DL-01</div>
        </div>
      )}
    </aside>
  );
};
