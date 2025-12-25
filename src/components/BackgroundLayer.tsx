import type { BackgroundMode } from '../types';

interface BackgroundLayerProps {
  mode: BackgroundMode;
  value?: string | null;
}

const BACKGROUND_STYLES: Record<BackgroundMode, string> = {
  white: 'bg-white',
  warm: 'bg-surface-warm gradient-warm',
  gradient: 'gradient-ambient',
  photo: '',
};

export function BackgroundLayer({ mode, value }: BackgroundLayerProps) {
  if (mode === 'photo' && value) {
    return (
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${value})`,
            filter: 'blur(16px) brightness(1.1) saturate(0.4)',
          }}
        />
        <div className="absolute inset-0 bg-white/70" />
      </div>
    );
  }

  return (
    <>
      <div className={`fixed inset-0 -z-10 ${BACKGROUND_STYLES[mode]}`} />
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(to left, rgba(245, 245, 245, 0.3) 0%, transparent 40%)',
        }}
      />
    </>
  );
}
