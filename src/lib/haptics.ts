type Kind = 'tap' | 'success' | 'warning' | 'error';

const patterns: Record<Kind, number | number[]> = {
  tap: 8,
  success: [10, 30, 10],
  warning: 20,
  error: [30, 40, 30],
};

export function haptic(kind: Kind = 'tap') {
  if (typeof navigator === 'undefined') return;
  // iOS Safari does not support Vibration API, but Android + some wrappers do.
  // Also no-op respecting reduced motion preferences.
  try {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    navigator.vibrate?.(patterns[kind]);
  } catch {}
}
