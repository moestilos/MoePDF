import { useEffect, useState } from 'react';
import { X, Share, PlusSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DISMISS_KEY = 'cqh-ios-install-dismissed';

export default function IosInstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua);
    const isStandalone =
      (window.navigator as any).standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches;
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (isIOS && !isStandalone && !dismissed) {
      const t = setTimeout(() => setShow(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  function dismiss() {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, '1');
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 260 }}
          role="dialog"
          aria-label="Instalar en pantalla de inicio"
          className="fixed left-3 right-3 z-50 card p-4 shadow-xl shadow-black/30"
          style={{ bottom: 'calc(env(safe-area-inset-bottom) + 5rem)' }}
        >
          <button
            onClick={dismiss}
            aria-label="Cerrar"
            className="absolute top-2.5 right-2.5 p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-hover"
          >
            <X size={16} />
          </button>
          <div className="flex gap-3 pr-6">
            <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary" aria-hidden><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[15px] leading-tight">Instala la app</p>
              <p className="text-[12px] text-muted leading-snug mt-0.5">
                Añádela a tu pantalla de inicio. Abre más rápido y funciona offline.
              </p>
              <ol className="mt-2.5 space-y-1.5 text-[12px] text-muted">
                <li className="flex items-center gap-2">
                  <span className="chip">1</span>
                  Pulsa <Share size={14} className="inline text-primary" aria-label="Compartir" /> abajo
                </li>
                <li className="flex items-center gap-2">
                  <span className="chip">2</span>
                  Elige <PlusSquare size={14} className="inline text-primary" aria-label="Añadir" />
                  <span className="font-medium text-text">Añadir a pantalla de inicio</span>
                </li>
              </ol>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
