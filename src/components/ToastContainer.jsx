import React from 'react';
import { useNotification } from '../context/NotificationContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useNotification();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 sm:px-0 pointer-events-none"
      role="region"
      aria-label="Notificacions"
    >
      {toasts.map((toast) => {
        let bgStyle = 'bg-slate-800 border-slate-700 text-slate-100';
        let IconComponent = Info;
        let iconColor = 'text-blue-400';

        if (toast.type === 'success') {
          bgStyle = 'bg-emerald-950/90 border-emerald-700/60 text-emerald-100';
          IconComponent = CheckCircle;
          iconColor = 'text-emerald-400';
        } else if (toast.type === 'error') {
          bgStyle = 'bg-rose-950/90 border-rose-700/60 text-rose-100';
          IconComponent = AlertCircle;
          iconColor = 'text-rose-400';
        } else if (toast.type === 'info') {
          bgStyle = 'bg-slate-900/95 border-emerald-500/30 text-slate-200';
          IconComponent = Info;
          iconColor = 'text-emerald-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${bgStyle}`}
            role="alert"
          >
            <IconComponent className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 text-sm leading-relaxed font-medium">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              aria-label="Tancar notificació"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
