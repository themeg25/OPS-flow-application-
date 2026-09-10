import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);
let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const push = useCallback((message, type = 'info') => {
    const id = ++idCounter;
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => remove(id), 4200);
  }, [remove]);

  const toast = {
    success: (m) => push(m, 'success'),
    error: (m) => push(m, 'error'),
    info: (m) => push(m, 'info')
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-[340px] max-w-[90vw]">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`animate-toast-in rounded-xl2 shadow-popover px-4 py-3 text-sm font-medium flex items-start gap-2.5 border
              ${t.type === 'success' ? 'bg-white border-success/20 text-ink-900' : ''}
              ${t.type === 'error' ? 'bg-white border-danger/20 text-ink-900' : ''}
              ${t.type === 'info' ? 'bg-white border-info/20 text-ink-900' : ''}`}
          >
            <span className={`mt-0.5 h-2 w-2 rounded-full shrink-0
              ${t.type === 'success' ? 'bg-success' : ''}
              ${t.type === 'error' ? 'bg-danger' : ''}
              ${t.type === 'info' ? 'bg-info' : ''}`} />
            <span className="flex-1">{t.message}</span>
            <button onClick={() => remove(t.id)} className="text-ink-400 hover:text-ink-700">✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
