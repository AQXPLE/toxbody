'use client';

import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils.js';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = ({ title, message, type = 'info', duration = 4000 }) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast viewport */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-8k-modal backdrop-blur-xl transition-all animate-in slide-in-from-bottom-3',
              toast.type === 'success' && 'border-emerald-500/30 bg-zinc-950/90 text-white',
              toast.type === 'error' && 'border-rose-500/30 bg-zinc-950/90 text-white',
              toast.type === 'warning' && 'border-[#ff5500]/40 bg-zinc-950/90 text-white',
              toast.type === 'info' && 'border-white/[0.12] bg-zinc-950/90 text-white'
            )}
          >
            {toast.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertCircle className="h-4 w-4 text-[#ff5500] shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="h-4 w-4 text-zinc-300 shrink-0 mt-0.5" />}

            <div className="flex-1">
              {toast.title && <div className="text-xs font-bold text-white">{toast.title}</div>}
              {toast.message && <div className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{toast.message}</div>}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      addToast: (toast) => console.log('Toast:', toast),
    };
  }
  return context;
}
