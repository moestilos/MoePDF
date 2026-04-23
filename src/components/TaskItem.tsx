import { useState } from 'react';
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { Check, Calendar, GripVertical, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTasks } from '@/lib/store';
import { haptic } from '@/lib/haptics';
import { formatDue, cn } from '@/lib/utils';
import type { Task } from '@/lib/types';

const priorityBar: Record<number, string> = {
  0: 'bg-muted/40',
  1: 'bg-primary',
  2: 'bg-warning',
};

const priorityLabel: Record<number, string> = {
  0: 'Prioridad baja',
  1: 'Prioridad media',
  2: 'Prioridad alta',
};

export default function TaskItem({ task, onDeleted, sortable = false, index = 0 }: { task: Task; onDeleted?: (t: Task) => void; sortable?: boolean; index?: number }) {
  const toggle = useTasks((s) => s.toggle);
  const remove = useTasks((s) => s.remove);
  const tags = useTasks((s) => s.tags);
  const tag = task.tagId ? tags.find((t) => t.id === task.tagId) : null;
  const x = useMotionValue(0);
  const leftBg = useTransform(x, [0, 120], [0, 1]);
  const rightBg = useTransform(x, [-120, 0], [1, 0]);
  const [removing, setRemoving] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id, disabled: !sortable });
  const style = sortable ? { transform: CSS.Transform.toString(transform), transition } : undefined;

  async function onDragEnd(_: any, info: PanInfo) {
    if (info.offset.x > 90) {
      haptic('success');
      await toggle(task.id);
      x.set(0);
    } else if (info.offset.x < -90) {
      haptic('warning');
      setRemoving(true);
      const deleted = await remove(task.id);
      if (deleted && onDeleted) onDeleted(deleted);
    } else {
      x.set(0);
    }
  }

  const due = formatDue(task.dueDate);
  const done = !!task.completedAt;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 6 }}
      animate={removing ? { opacity: 0, x: -400 } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: removing ? 0 : Math.min(index * 0.02, 0.2) }}
      className={cn('relative rounded-2xl overflow-hidden', isDragging && 'opacity-50 z-10')}
    >
      {/* swipe backgrounds */}
      <motion.div style={{ opacity: leftBg }} className="absolute inset-0 flex items-center justify-start pl-6 bg-primary/15 text-primary pointer-events-none" aria-hidden>
        <Check size={22} strokeWidth={2.5} />
      </motion.div>
      <motion.div style={{ opacity: rightBg }} className="absolute inset-0 flex items-center justify-end pr-6 bg-danger/15 text-danger pointer-events-none" aria-hidden>
        <Trash2 size={20} strokeWidth={2.25} />
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        style={{ x }}
        onDragEnd={onDragEnd}
        className={cn(
          'relative card-hover flex items-stretch gap-0 touch-pan-y',
          done && 'opacity-60',
        )}
      >
        {/* priority left bar */}
        <span
          aria-label={priorityLabel[task.priority]}
          className={cn('w-1 shrink-0 rounded-l-2xl', priorityBar[task.priority])}
        />

        <div className="flex items-start gap-3 flex-1 min-w-0 px-4 py-3.5">
          {sortable && (
            <button {...attributes} {...listeners} aria-label="Reordenar" className="text-muted/60 hover:text-muted p-1 -ml-1 mt-0.5 touch-none">
              <GripVertical size={16} />
            </button>
          )}
          <button
            onClick={() => { haptic(done ? 'tap' : 'success'); toggle(task.id); }}
            aria-label={done ? 'Marcar pendiente' : 'Completar'}
            className={cn(
              'mt-0.5 w-[22px] h-[22px] shrink-0 rounded-full border-2 flex items-center justify-center transition-all',
              done
                ? 'bg-primary border-primary scale-100'
                : 'border-border-strong hover:border-primary hover:scale-110 active:scale-95',
            )}
          >
            {done && <Check size={12} className="text-bg" strokeWidth={3.5} />}
          </button>
          <div className="flex-1 min-w-0">
            <p className={cn(
              'text-[15px] font-medium break-words leading-snug transition-colors',
              done && 'line-through text-muted',
            )}>
              {task.title}
            </p>
            {task.notes && <p className="text-[13px] text-muted mt-1 break-words leading-snug line-clamp-2">{task.notes}</p>}
            {(due.label || tag) && (
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {due.label && (
                  <span className={cn(
                    'inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full',
                    due.tone === 'danger' && 'bg-danger/10 text-danger',
                    due.tone === 'warning' && 'bg-warning/10 text-warning',
                    due.tone === 'primary' && 'bg-primary/10 text-primary',
                    due.tone === 'muted' && 'bg-surface-hover text-muted',
                  )}>
                    <Calendar size={11} strokeWidth={2.5} /> {due.label}
                  </span>
                )}
                {tag && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ color: tag.color, background: `${tag.color}18` }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: tag.color }} />
                    {tag.name}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
