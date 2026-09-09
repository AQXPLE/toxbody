'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar.jsx';
import { Topbar } from '@/components/layout/Topbar.jsx';
import { CommandPalette } from '@/components/layout/CommandPalette.jsx';
import { db } from '@/lib/db/provider.js';

export default function DashboardLayout({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const user = db.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const handleUserChange = (newUserId) => {
    const updated = db.setCurrentUser(newUserId);
    setCurrentUser(updated);
    // Reload page state to trigger RBAC recalculation across views
    window.location.reload();
  };

  if (!mounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0b0c0e] text-zinc-400 font-mono text-xs">
        Loading The Tox Technique Outreach Platform...
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0d0e12]">
      {/* Navigation Sidebar */}
      <Sidebar currentUser={currentUser} onUserChange={handleUserChange} />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onOpenSearch={() => setIsSearchOpen(true)} currentUser={currentUser} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Quick Search Cmd+K */}
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
