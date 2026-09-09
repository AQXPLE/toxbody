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
    // Default to Daniyal or match email
    const emps = db.memoryStore.employees;
    const match = emps.find((e) => e.email.toLowerCase() === email.toLowerCase());
    if (match) {
      handleSimulateLogin(match.id);
    } else {
      handleSimulateLogin('emp-daniyal');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0b0e] p-4 select-none">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 mx-auto flex items-center justify-center text-zinc-950 font-bold shadow-xl shadow-amber-900/30">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold uppercase tracking-wider text-zinc-100 font-mono">
            The Tox Technique
          </h1>
          <p className="text-xs text-zinc-400">
            Influencer Outreach & Database Management Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-xl border border-zinc-800 bg-[#121319] p-6 shadow-2xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-200 block mb-1">
                Corporate Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="daniyal@thetoxtechnique.com"
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-200 block mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold text-xs shadow-lg transition-all"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In to Platform</span>
            </button>
          </form>

          {/* Quick Role Demonstration Access */}
          <div className="pt-4 border-t border-zinc-800/80 space-y-3">
            <div className="text-[11px] uppercase font-mono text-zinc-400 font-semibold flex items-center justify-between">
              <span>Instant Test Sign-In:</span>
              <span className="text-[10px] text-zinc-400 font-normal">Click role to test</span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleSimulateLogin('emp-daniyal')}
                className="w-full p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/50 flex items-center justify-between text-xs text-left transition-colors group"
              >
                <div>
                  <div className="font-semibold text-zinc-200 flex items-center gap-2">
                    <span>Daniyal Khan</span>
                    <Badge variant="danger" size="xs">
                      Admin
                    </Badge>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono">Full system authority</div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-amber-400 transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => handleSimulateLogin('emp-ahmed')}
                className="w-full p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/50 flex items-center justify-between text-xs text-left transition-colors group"
              >
                <div>
                  <div className="font-semibold text-zinc-200 flex items-center gap-2">
                    <span>Ahmed Malik</span>
                    <Badge variant="warning" size="xs">
                      Manager
                    </Badge>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono">Team analytics & assignments</div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-amber-400 transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => handleSimulateLogin('emp-sarah')}
                className="w-full p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/50 flex items-center justify-between text-xs text-left transition-colors group"
              >
                <div>
                  <div className="font-semibold text-zinc-200 flex items-center gap-2">
                    <span>Sarah Jenkins</span>
                    <Badge variant="info" size="xs">
                      Staff
                    </Badge>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono">Limited to 3 assigned accounts</div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-amber-400 transition-colors" />
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-[11px] text-zinc-400 font-mono">
          The Tox Technique Internal Operations Platform v1.0
        </div>
      </div>
    </div>
  );
}
