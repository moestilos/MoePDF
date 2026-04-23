import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { useTasks } from '@/lib/store';
import { haptic } from '@/lib/haptics';
import type { Priority } from '@/lib/types';

export default function FabSheet({ demo }: { demo?: boolean }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>(1);
  const [tagId, setTagId] = useState<string | null>(null);
  const tags = useTasks((s) => s.tags);
  const add = useTasks((s) => s.add);
  const loadTags = useTasks((s) => s.loadTags);
  const setDemo = useTasks((s) => s.setDemo);

  useEffect(() => {
    if (demo) setDemo(true);
    loadTags();
    // Handle ?new=1 from PWA shortcut
    const url = new URL(window.location.href);
    if (url.searchParams.get('new') === '1') {
      setOpen(true);
      url.searchParams.delete('new');
      window.history.replaceState({}, '', url.toString());
    }
  }, [demo]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.key === 'n' || e.key === 'N') && !open && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName ?? '')) {
        e.preventDefault(); setOpen(true);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    haptic('success');
    await add({
      title: title.trim(),
      notes: notes.trim() || null,
      dueDate: dueDate || null,
      priority,
      tagId,
    });
    setTitle(''); setNotes(''); setDueDate(''); setPriority(1); setTagId(null);
    setOpen(false);
  }

  function onSheetDragEnd(_: any, info: PanInfo) {
    if (info.offset.y > 120 || info.velocity.y > 500) {
      haptic('tap');
      setOpen(false);
    }
  }

  return (
    <>
      <button
        onClick={() => { haptic('tap'); setOpen(true); }}
        aria-label="Nueva tarea (atajo: N)"
        title="Nueva tarea (N)"
        className="fixed right-4 z-40 w-14 h-14 rounded-2xl text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 focus-visible:ring-4 focus-visible:ring-cta/40"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom) + 4.75rem)',
          background: 'linear-gradient(135deg, rgb(var(--cta)) 0%, rgb(var(--cta)) 50%, rgb(var(--primary)) 130%)',
          boxShadow: '0 10px 30px -10px rgb(var(--cta) / 0.5), 0 4px 12px -4px rgb(var(--cta) / 0.3)',
        }}
      >
        <Plus size={26} strokeWidth={2.75} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              aria-hidden
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.3 }}
              onDragEnd={onSheetDragEnd}
              role="dialog" aria-modal="true" aria-label="Nueva tarea"
              className="fixed left-0 right-0 bottom-0 z-50 bg-bg-elevated rounded-t-3xl border-t border-border p-5 max-h-[92dvh] overflow-y-auto overscroll-contain"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
            >
              <div className="w-10 h-1 rounded-full bg-border mx-auto mb-4" aria-hidden />
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold tracking-tight">Nueva tarea</h2>
                <button onClick={() => setOpen(false)} aria-label="Cerrar" className="p-1.5 rounded-lg hover:bg-bg text-muted hover:text-text transition-colors">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={submit} className="space-y-4">
                <input
                  autoFocus
                  className="input text-base font-medium"
                  placeholder="¿Qué hay que hacer?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <textarea
                  className="input min-h-[64px] resize-none text-[14px]"
                  placeholder="Notas (opcional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-muted mb-2 block font-semibold">Prioridad</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { v: 0, label: 'Baja', cls: priority === 0 ? 'border-muted bg-surface-hover text-text' : 'border-border text-muted hover:text-text', dot: 'bg-muted' },
                      { v: 1, label: 'Media', cls: priority === 1 ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted hover:text-text', dot: 'bg-primary' },
                      { v: 2, label: 'Alta', cls: priority === 2 ? 'border-warning bg-warning/10 text-warning' : 'border-border text-muted hover:text-text', dot: 'bg-warning' },
                    ] as const).map((o) => (
                      <button
                        key={o.v}
                        type="button"
                        onClick={() => setPriority(o.v as Priority)}
                        className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm font-medium transition-colors ${o.cls}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${o.dot}`} aria-hidden />
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="due" className="text-[11px] uppercase tracking-wider text-muted mb-2 block font-semibold">Fecha límite</label>
                  <input id="due" type="date" className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
                {tags.length > 0 && (
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-muted mb-2 block font-semibold">Tag</label>
                    <div className="flex flex-wrap gap-1.5">
                      <button type="button" onClick={() => setTagId(null)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${tagId === null ? 'border-text text-text' : 'border-border text-muted hover:text-text'}`}>Ninguno</button>
                      {tags.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTagId(t.id)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
                          style={tagId === t.id
                            ? { color: t.color, borderColor: t.color, background: `${t.color}14` }
                            : { color: 'rgb(var(--muted))', borderColor: 'rgb(var(--border))' }}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <button type="submit" className="btn-primary w-full py-3.5 text-base">Guardar tarea</button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
