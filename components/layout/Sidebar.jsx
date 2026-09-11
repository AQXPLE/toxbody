'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Send,
  Users,
  Instagram,
  MapPin,
  UserCheck,
  BarChart3,
  FileSpreadsheet,
  ShieldCheck,
  Settings,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils.js';
import { Badge } from '@/components/ui/Badge.jsx';

export function Sidebar({ currentUser, onUserChange }) {
  const pathname = usePathname();
  const role = currentUser?.role || 'staff';

  const navItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      roles: ['admin', 'manager', 'staff'],
    },
    {
      name: 'Meta IG Search',
      href: '/meta-search',
      icon: Search,
      roles: ['admin', 'manager', 'staff'],
      badge: 'Live',
      badgeVariant: 'orange',
    },
    {
      name: 'Log Outreach',
      href: '/outreach',
      icon: Send,
      roles: ['admin', 'manager', 'staff'],
      badge: 'Fast',
      badgeVariant: 'primary',
    },
    {
      name: 'Influencer Directory',
      href: '/influencers',
      icon: Users,
      roles: ['admin', 'manager', 'staff'],
    },
    {
      name: 'Marketing Accounts',
      href: '/accounts',
      icon: Instagram,
      roles: ['admin', 'manager', 'staff'],
    },
    {
      name: 'Locations',
      href: '/locations',
      icon: MapPin,
      roles: ['admin', 'manager', 'staff'],
    },
    {
      name: 'Team & Staff',
      href: '/team',
      icon: UserCheck,
      roles: ['admin', 'manager'],
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      roles: ['admin', 'manager'],
    },
    {
      name: 'TSV / CSV Imports',
      href: '/imports',
      icon: FileSpreadsheet,
      roles: ['admin', 'manager'],
      badge: 'Migration',
      badgeVariant: 'default',
    },
    {
      name: 'Data Quality',
      href: '/data-quality',
      icon: ShieldAlert,
      roles: ['admin', 'manager'],
    },
    {
      name: 'Audit Logs',
      href: '/audit',
      icon: ShieldCheck,
      roles: ['admin'],
    },
    {
      name: 'System Settings',
      href: '/settings',
      icon: Settings,
      roles: ['admin'],
    },
  ];

  const visibleNavItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-64 shrink-0 border-r border-white/[0.08] bg-black/95 backdrop-blur-xl flex flex-col h-screen select-none relative z-20">
      {/* Brand Header */}
      <div className="h-16 border-b border-white/[0.08] flex items-center px-5 gap-3 bg-black">
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#ff5500] to-orange-600 flex items-center justify-center text-white font-bold shadow-tox-orange">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <div className="text-xs font-black tracking-wider uppercase text-white font-mono flex items-center gap-1.5">
            <span>The Tox</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.08] text-[#ff5500] border border-[#ff5500]/25">
              8K
            </span>
          </div>
          <div className="text-[11px] text-zinc-400 font-medium">Outreach Operations</div>
        </div>
      </div>

      {/* Role Badge Indicator */}
      <div className="px-5 py-2.5 border-b border-white/[0.05] bg-zinc-950/60">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500 text-[11px] font-mono uppercase tracking-wider">Active Role</span>
          <Badge
            variant={role === 'admin' ? 'orange' : role === 'manager' ? 'warning' : 'primary'}
            size="xs"
            className="uppercase font-mono tracking-wider text-[10px]"
          >
            {role}
          </Badge>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all relative',
                isActive
                  ? 'bg-white/[0.09] text-white border border-white/[0.12] shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'h-4 w-4 transition-colors',
                    isActive ? 'text-[#ff5500]' : 'text-zinc-500 group-hover:text-zinc-300'
                  )}
                />
                <span>{item.name}</span>
              </div>
              {item.badge ? (
                <Badge
                  variant={isActive ? 'orange' : item.badgeVariant || 'default'}
                  size="xs"
                >
                  {item.badge}
                </Badge>
              ) : (
                isActive && <ChevronRight className="h-3.5 w-3.5 text-[#ff5500]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Switcher / Testing Footer */}
      <div className="p-3 border-t border-white/[0.08] bg-zinc-950/80">
        <div className="rounded-xl border border-white/[0.08] bg-zinc-900/60 p-3 shadow-inner">
          <div className="text-[10px] text-zinc-500 uppercase font-mono font-bold tracking-wider mb-1.5 flex items-center justify-between">
            <span>Simulate Operator:</span>
          </div>
          <select
            value={currentUser?.id || ''}
            onChange={(e) => onUserChange && onUserChange(e.target.value)}
            className="w-full text-xs bg-black text-zinc-200 font-semibold border border-white/[0.1] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#ff5500]"
          >
            <option value="emp-daniyal">Daniyal (Admin)</option>
            <option value="emp-ahmed">Ahmed (Manager)</option>
            <option value="emp-sarah">Sarah (Staff - 3 Accounts)</option>
            <option value="emp-elena">Elena (Staff - 3 Accounts)</option>
          </select>
          <div className="mt-2 text-[11px] text-zinc-500 truncate font-mono">
            {currentUser?.email || 'daniyal@thetoxtechnique.com'}
          </div>
        </div>
      </div>
    </aside>
  );
}
