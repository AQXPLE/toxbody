'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db/provider.js';
import { Badge } from '@/components/ui/Badge.jsx';
import { useToast } from '@/components/ui/Toast.jsx';
import { Sparkles, Shield, User, LogIn, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSimulateLogin = (employeeId) => {
    const user = db.setCurrentUser(employeeId);
    addToast({
      title: 'Authenticated Successfully',
      message: `Signed in as ${user.full_name} (${user.role.toUpperCase()}).`,
      type: 'success',
    });
    router.push('/');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const emps = db.memoryStore.employees;
    const match = emps.find((e) => e.email.toLowerCase() === email.toLowerCase());
    if (match) {
      handleSimulateLogin(match.id);
    } else {
      handleSimulateLogin('emp-daniyal');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian-950 text-white p-4 select-none relative overflow-hidden bg-dot-grid">
      {/* Ambient glowing ember aura */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-tox-orange/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand */}
        <div className="text-center space-y-2.5">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-tox-orange to-amber-500 mx-auto flex items-center justify-center text-black font-bold text-2xl shadow-tox-orange">
            T
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white font-mono uppercase">
            The Tox Technique
          </h1>
          <p className="text-xs text-zinc-400 font-medium">
            Influencer Outreach Operations & Creator Intelligence
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Corporate Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="daniyal@thetoxtechnique.com"
                className="w-full bg-obsidian-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-tox-orange font-mono shadow-inner transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-obsidian-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-tox-orange font-mono shadow-inner transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-tox-orange hover:bg-tox-orange-hover text-black font-semibold text-xs shadow-tox-orange transition-all cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In to Platform</span>
            </button>
          </form>

          {/* Quick Role Demonstration Access */}
          <div className="pt-5 border-t border-white/[0.08] space-y-3">
            <div className="text-[11px] uppercase font-mono font-medium text-zinc-400 flex items-center justify-between">
              <span>Quick Test Sign-In:</span>
              <span className="text-[10px] text-zinc-500 font-normal">Click role to test</span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleSimulateLogin('emp-daniyal')}
                className="w-full p-3.5 rounded-2xl border border-white/[0.08] bg-obsidian-900/60 hover:bg-white/[0.04] hover:border-tox-orange/30 flex items-center justify-between text-xs text-left transition-all group cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-white group-hover:text-tox-orange flex items-center gap-2 transition-colors">
                    <span>Daniyal Khan</span>
                    <Badge variant="danger" size="xs">
                      Admin
                    </Badge>
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono mt-0.5">Full system authority</div>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-tox-orange group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => handleSimulateLogin('emp-ahmed')}
                className="w-full p-3.5 rounded-2xl border border-white/[0.08] bg-obsidian-900/60 hover:bg-white/[0.04] hover:border-tox-orange/30 flex items-center justify-between text-xs text-left transition-all group cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-white group-hover:text-tox-orange flex items-center gap-2 transition-colors">
                    <span>Ahmed Malik</span>
                    <Badge variant="warning" size="xs">
                      Manager
                    </Badge>
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono mt-0.5">Team analytics & assignments</div>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-tox-orange group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => handleSimulateLogin('emp-sarah')}
                className="w-full p-3.5 rounded-2xl border border-white/[0.08] bg-obsidian-900/60 hover:bg-white/[0.04] hover:border-tox-orange/30 flex items-center justify-between text-xs text-left transition-all group cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-white group-hover:text-tox-orange flex items-center gap-2 transition-colors">
                    <span>Sarah Jenkins</span>
                    <Badge variant="info" size="xs">
                      Staff
                    </Badge>
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono mt-0.5">Assigned marketing accounts only</div>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-tox-orange group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-[11px] text-zinc-500 font-mono">
          The Tox Technique Outreach Operations Platform
        </div>
      </div>
    </div>
  );
}
