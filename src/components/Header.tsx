import React, { useState } from 'react';
import {
  ShieldCheck,
  Bell,
  RefreshCw,
  Building2,
  Calendar,
  ChevronDown,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
} from 'lucide-react';
import { User, UserRole, AcademicYear, Institution, NotificationItem } from '../types';
import { SEED_USERS } from '../data/seedData';
import { dbRepository } from '../services/storageRepository';

interface HeaderProps {
  currentUser: User;
  onSwitchUser: (user: User) => void;
  selectedYear: AcademicYear;
  onYearChange: (year: AcademicYear) => void;
  selectedInstitutionId: string;
  onInstitutionChange: (id: string) => void;
  institutions: Institution[];
  notifications: NotificationItem[];
  onOpenNotification: (notif: NotificationItem) => void;
  onResetData: () => void;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSwitchUser,
  selectedYear,
  onYearChange,
  selectedInstitutionId,
  onInstitutionChange,
  institutions,
  notifications,
  onOpenNotification,
  onResetData,
  onOpenGuide,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const roleLabels: Record<UserRole, { title: string; tag: string }> = {
    aicte_admin: { title: 'AICTE Super Administrator', tag: 'Apex Regulator' },
    aicte_reviewer: { title: 'AICTE Regulatory Reviewer', tag: 'Compliance Cell' },
    inst_admin: { title: 'Institution Administrator', tag: 'IIT Delhi' },
    admission_officer: { title: 'Admission Officer', tag: 'CEG Anna Univ' },
    student: { title: 'Student', tag: 'Aryan Sharma' },
    employer_verifier: { title: 'Authorized Verifier', tag: 'TCS Talent' },
    auditor: { title: 'Statutory Auditor', tag: 'CAG Cell' },
  };

  return (
    <header className="bg-[#17365D] text-white border-b border-[#0F243E] sticky top-0 z-40 shadow-xs">
      {/* Top Ministry Ribbon */}
      <div className="bg-[#0F243E] px-6 py-1 flex items-center justify-between text-[11px] text-slate-300 border-b border-slate-700/40">
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-white tracking-wide">ALL INDIA COUNCIL FOR TECHNICAL EDUCATION</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">Ministry of Education, Government of India</span>
        </div>
        <div className="flex items-center gap-4 text-[10px]">
          <span className="font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
            NATIONAL APAAR ENGINE ACTIVE
          </span>
          <span className="text-slate-400 font-mono">NODE DL-01</span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="px-6 py-3 flex items-center justify-between gap-6">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3.5 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-white text-[#17365D] flex items-center justify-center font-bold shadow-sm">
            <ShieldCheck className="w-6 h-6 text-[#17365D]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white leading-tight">
                APAAR-Verify
              </span>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-400/30">
                PROTOTYPE
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              National Student Academic Identity & Enrollment Compliance Platform
            </p>
          </div>
        </div>

        {/* Global Selectors & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Academic Year Selector */}
          <div className="flex items-center gap-2 bg-[#0F243E] px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 text-[11px]">Year:</span>
            <select
              value={selectedYear}
              onChange={e => onYearChange(e.target.value as AcademicYear)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs"
            >
              <option value="2024-25" className="bg-[#17365D] text-white">2024-25 (Current)</option>
              <option value="2023-24" className="bg-[#17365D] text-white">2023-24</option>
              <option value="2022-23" className="bg-[#17365D] text-white">2022-23</option>
            </select>
          </div>

          {/* Institution Selector */}
          {(currentUser.role.startsWith('aicte') || currentUser.role === 'auditor') && (
            <div className="hidden lg:flex items-center gap-2 bg-[#0F243E] px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 text-[11px]">Institution:</span>
              <select
                value={selectedInstitutionId}
                onChange={e => onInstitutionChange(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs max-w-[170px] truncate"
              >
                <option value="ALL" className="bg-[#17365D] text-white">All (National Scope)</option>
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id} className="bg-[#17365D] text-white">
                    {inst.shortName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Demo Scenarios Button */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/40 transition-colors shadow-xs"
            title="Explore 10 Demonstration Scenarios"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Demo Scenarios (10)</span>
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={onResetData}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white rounded-lg border border-white/15 text-xs transition-colors"
            title="Reset repository to initial synthetic demo state"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/15 text-white transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-800 z-50 overflow-hidden animate-in fade-in duration-100">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Compliance Notifications</span>
                  <button
                    onClick={() => {
                      dbRepository.markAllNotificationsRead();
                      setShowNotifMenu(false);
                    }}
                    className="text-[11px] text-blue-600 hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-5 text-center text-xs text-slate-400">No notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          onOpenNotification(n);
                          setShowNotifMenu(false);
                        }}
                        className={`p-3.5 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                          !n.read ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {n.type === 'CRITICAL' ? (
                            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          ) : n.type === 'SUCCESS' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          ) : (
                            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900 leading-snug">{n.title}</p>
                            <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 bg-[#0F243E] hover:bg-slate-800 rounded-lg border border-slate-700 text-left transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-white leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-300 font-medium">
                  {roleLabels[currentUser.role]?.title}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Role Switcher Menu */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-76 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-800 z-50 overflow-hidden animate-in fade-in duration-100">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <p className="text-xs font-bold text-slate-900">Switch Role Profile</p>
                  <p className="text-[11px] text-slate-500">Select any of the 7 roles to explore tailored views</p>
                </div>
                <div className="p-1.5 divide-y divide-slate-100">
                  {SEED_USERS.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSwitchUser(u);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 text-xs rounded-lg hover:bg-slate-100 flex items-center justify-between transition-colors ${
                        currentUser.id === u.id ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-500">{roleLabels[u.role]?.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{u.designation}</div>
                      </div>
                      {currentUser.id === u.id && (
                        <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
