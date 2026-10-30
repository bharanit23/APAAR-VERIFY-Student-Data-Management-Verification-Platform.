import React, { useState } from 'react';
import {
  ScrollText,
  Search,
  ShieldCheck,
  Filter,
  Download,
  Clock,
  User,
  Hash,
} from 'lucide-react';
import { AuditLog, UserRole } from '../../types';
import { downloadCsvFile } from '../../services/reportExportService';

interface AuditLogsViewProps {
  logs: AuditLog[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs }) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const filteredLogs = logs.filter(log => {
    if (roleFilter !== 'ALL' && log.actorRole !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        log.actorName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.entityId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportAuditCsv = () => {
    const headers = ['Log ID', 'Timestamp', 'Actor Name', 'Actor Role', 'Action', 'Entity Type', 'Entity ID', 'Details', 'IP Address'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.timestamp,
      `"${l.actorName.replace(/"/g, '""')}"`,
      l.actorRole,
      l.action,
      l.entityType,
      l.entityId,
      `"${l.details.replace(/"/g, '""')}"`,
      l.ipAddress,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCsvFile(`aicte_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="text-xs text-slate-500 mb-0.5">
            AICTE Statutory Governance & Academic Audit Cell
          </div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Immutable Regulatory Audit Log Registry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tamper-evident trail of registration, consent actions, validation events, and case adjudications.
          </p>
        </div>

        <button
          onClick={handleExportAuditCsv}
          className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Audit Trail</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search by actor, action, or details..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs text-slate-900 bg-white placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none"
          >
            <option value="ALL">All Roles</option>
            <option value="aicte_admin">AICTE Admin</option>
            <option value="aicte_reviewer">AICTE Reviewer</option>
            <option value="inst_admin">Institution Admin</option>
            <option value="student">Student</option>
            <option value="employer_verifier">Employer Verifier</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5">Timestamp & ID</th>
                <th className="px-3 py-2.5">Actor & Role</th>
                <th className="px-3 py-2.5">Action Event</th>
                <th className="px-3 py-2.5">Entity</th>
                <th className="px-3 py-2.5">Audit Event Details</th>
                <th className="px-3 py-2.5">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredLogs.map(l => (
                <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="font-mono text-[11px] text-slate-800">
                      {new Date(l.timestamp).toLocaleDateString()} {new Date(l.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{l.id}</div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{l.actorName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{l.actorRole}</div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="font-mono font-bold text-blue-900 text-[11px] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {l.action}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                    {l.entityType} ({l.entityId})
                  </td>
                  <td className="px-3 py-2.5 text-slate-700 max-w-md">
                    {l.details}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {l.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
