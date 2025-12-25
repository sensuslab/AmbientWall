import type { AppMode } from '../types';

interface ModeIndicatorProps {
  mode: AppMode;
}

const MODE_LABELS: Record<AppMode, string> = {
  ambient: 'Ambient',
  interaction: 'Active',
  edit: 'Editing',
  calibration: 'Calibrating',
};

export function ModeIndicator({ mode }: ModeIndicatorProps) {
  if (mode === 'ambient') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 animate-fade-in">
      <div className="relative px-3.5 py-1.5 rounded-full">
        <div className="absolute inset-0 bg-white/35 backdrop-blur-glass rounded-full border border-white/40" style={{
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }} />
        <span className="relative text-xs font-light tracking-wide text-gray-500/70">
          {MODE_LABELS[mode]}
        </span>
      </div>
    </div>
  );
}
