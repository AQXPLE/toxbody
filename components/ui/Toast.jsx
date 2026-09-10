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
              'pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-3',
              toast.type === 'success' && 'border-emerald-200 bg-white text-zinc-900 ring-1 ring-emerald-500/10',
              toast.type === 'error' && 'border-rose-200 bg-white text-zinc-900 ring-1 ring-rose-500/10',
              toast.type === 'warning' && 'border-orange-300 bg-orange-50/95 text-zinc-900 ring-1 ring-orange-500/20',
              toast.type === 'info' && 'border-zinc-200 bg-white text-zinc-900 ring-1 ring-zinc-500/10'
            )}
          >
            {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertCircle className="h-5 w-5 text-[#ff5500] shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="h-5 w-5 text-zinc-800 shrink-0 mt-0.5" />}

            <div className="flex-1">
              {toast.title && <div className="text-xs font-bold text-zinc-900">{toast.title}</div>}
              {toast.message && <div className="text-xs text-zinc-600 mt-0.5 leading-relaxed">{toast.message}</div>}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-400 hover:text-zinc-700 transition-colors"
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
