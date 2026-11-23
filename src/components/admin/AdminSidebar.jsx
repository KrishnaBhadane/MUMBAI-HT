import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  FileSpreadsheet,
  ShieldAlert,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function AdminSidebar({ isCollapsed, onToggle }) {
  const location = useLocation();
  const { applications, currentUser } = useApp();

  const pendingCount = applications.filter(a => a.status === 'under_review').length;
  const fraudCount = applications.filter(a => a.fraudAlerts && a.fraudAlerts.length > 0).length;

  const navItems = [
    {
      name: 'Underwriting Queue',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor: 'bg-orange-500 text-white shadow-[0_0_8px_rgba(249,115,22,0.5)]'
    },
    {
      name: 'All Application Dossiers',
      path: '/admin/applications',
      icon: FileSpreadsheet,
      badge: applications.length,
      badgeColor: 'bg-white/10 text-white'
    },
  ];

  return (
    <aside
      className={`glass-panel border-r border-white/[0.08] flex flex-col justify-between transition-all duration-200 z-30 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="p-4 space-y-6">
        {/* Workspace Brand / Department */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          {!isCollapsed && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                Credit Underwriting Desk
              </span>
              <h2 className="font-display font-bold text-sm text-white leading-tight">
                Hero Housing Finance
              </h2>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors mx-auto"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Primary Navigation List */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 shadow-[0_0_12px_rgba(249,115,22,0.2)]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                }`}
                title={item.name}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-orange-400' : 'text-zinc-400'}`} />
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between">
                    <span className="truncate">{item.name}</span>
                    {item.badge !== null && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Filter Section */}
        {!isCollapsed && (
          <div className="pt-4 border-t border-white/[0.08] space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 px-3">
              Triage Views
            </span>
            <div className="space-y-1 text-xs">
              <Link
                to="/admin/dashboard?filter=refer"
                className="flex items-center justify-between px-3 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pending Underwriter Sign-off</span>
                </span>
                <span className="font-mono text-[11px] font-bold text-amber-400">{pendingCount}</span>
              </Link>

              <Link
                to="/admin/dashboard?filter=anomalies"
                className="flex items-center justify-between px-3 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                  <span>Fraud &amp; Income Anomalies</span>
                </span>
                <span className="font-mono text-[11px] font-bold text-red-400">{fraudCount}</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Underwriter Profile Card at bottom */}
      <div className="p-3 border-t border-white/[0.08] bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-[0_0_10px_rgba(249,115,22,0.4)]">
            {currentUser.avatarInitials}
          </div>
          {!isCollapsed && (
            <div className="truncate text-xs">
              <div className="font-semibold text-white truncate">{currentUser.name}</div>
              <div className="text-[10px] text-zinc-400 truncate">Senior Underwriter</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
