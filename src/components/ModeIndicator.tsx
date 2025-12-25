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
    <div className="mode-indicator animate-fade-in">
      <span className="opacity-70">{MODE_LABELS[mode]}</span>
    </div>
  );
}
