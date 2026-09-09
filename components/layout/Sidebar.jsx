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
      badge: 'Messy TSV',
      badgeVariant: 'warning',
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
    <aside className="w-64 shrink-0 border-r border-zinc-800/80 bg-[#0e0f13] flex flex-col h-screen select-none">
      {/* Brand Header */}
      <div className="h-16 border-b border-zinc-800/80 flex items-center px-5 gap-3">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-zinc-950 font-bold shadow-md shadow-amber-900/20">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <div className="text-xs font-bold tracking-wider uppercase text-zinc-100 font-mono">
            The Tox Technique
          </div>
          <div className="text-[11px] text-zinc-400 font-medium">Outreach Platform</div>
        </div>
      </div>

      {/* Role Badge Indicator */}
      <div className="px-5 py-3 border-b border-zinc-800/50 bg-zinc-900/40">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 text-[11px]">Active Role:</span>
          <Badge
            variant={role === 'admin' ? 'danger' : role === 'manager' ? 'warning' : 'info'}
            size="xs"
            className="uppercase font-mono tracking-wider font-semibold"
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
                'group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                isActive
                  ? 'bg-zinc-800/90 text-zinc-100 border border-zinc-700/60 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'h-4 w-4 transition-colors',
                    isActive ? 'text-amber-400' : 'text-zinc-500 group-hover:text-zinc-300'
                  )}
                />
                <span>{item.name}</span>
              </div>
              {item.badge ? (
                <Badge variant={item.badgeVariant || 'default'} size="xs">
                  {item.badge}
                </Badge>
              ) : (
                isActive && <ChevronRight className="h-3 w-3 text-zinc-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Switcher / Testing Footer */}
      <div className="p-3 border-t border-zinc-800/80 bg-[#0c0d10]">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
          <div className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider mb-1.5 flex items-center justify-between">
            <span>Simulate User:</span>
          </div>
          <select
            value={currentUser?.id || ''}
            onChange={(e) => onUserChange && onUserChange(e.target.value)}
            className="w-full text-xs bg-zinc-800 text-zinc-200 border border-zinc-700 rounded px-2 py-1 focus:outline-none focus:border-amber-500 font-sans"
          >
            <option value="emp-daniyal">Daniyal (Admin)</option>
            <option value="emp-ahmed">Ahmed (Manager)</option>
            <option value="emp-sarah">Sarah (Staff - 3 Accounts)</option>
            <option value="emp-elena">Elena (Staff - 3 Accounts)</option>
          </select>
          <div className="mt-2 text-[11px] text-zinc-400 truncate">
            {currentUser?.email || 'daniyal@thetoxtechnique.com'}
          </div>
        </div>
      </div>
    </aside>
  );
}
