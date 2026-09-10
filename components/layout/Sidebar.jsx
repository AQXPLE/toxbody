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
    <aside className="w-64 shrink-0 border-r border-zinc-200 bg-white flex flex-col h-screen select-none shadow-xs">
      {/* Brand Header */}
      <div className="h-16 border-b border-zinc-200 flex items-center px-5 gap-3 bg-white">
        <div className="h-9 w-9 rounded-xl bg-[#ff5500] flex items-center justify-center text-white font-bold shadow-tox-orange">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <div className="text-xs font-black tracking-wider uppercase text-zinc-950 font-mono">
            The Tox Technique
          </div>
          <div className="text-[11px] text-[#ff5500] font-bold">Outreach Operations</div>
        </div>
      </div>

      {/* Role Badge Indicator */}
      <div className="px-5 py-2.5 border-b border-zinc-100 bg-slate-50/70">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500 text-[11px] font-medium">Logged Role:</span>
          <Badge
            variant={role === 'admin' ? 'black' : role === 'manager' ? 'warning' : 'primary'}
            size="xs"
            className="uppercase font-mono tracking-wider"
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
                'group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all',
                isActive
                  ? 'bg-zinc-950 text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/70'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'h-4 w-4 transition-colors',
                    isActive ? 'text-[#ff5500]' : 'text-zinc-400 group-hover:text-zinc-800'
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
                isActive && <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Switcher / Testing Footer */}
      <div className="p-3 border-t border-zinc-200 bg-slate-50/70">
        <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-2xs">
          <div className="text-[10px] text-zinc-500 uppercase font-mono font-bold tracking-wider mb-1.5 flex items-center justify-between">
            <span>Simulate Role:</span>
          </div>
          <select
            value={currentUser?.id || ''}
            onChange={(e) => onUserChange && onUserChange(e.target.value)}
            className="w-full text-xs bg-slate-50 text-zinc-900 font-semibold border border-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#ff5500]"
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
