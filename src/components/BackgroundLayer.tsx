import type { BackgroundMode } from '../types';

interface BackgroundLayerProps {
  mode: BackgroundMode;
  value?: string | null;
}

export function BackgroundLayer({ mode, value }: BackgroundLayerProps) {
  if (mode === 'photo' && value) {
    return (
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${value})`,
            filter: 'blur(20px) brightness(1.15) saturate(0.35)',
          }}
        />
        <div className="absolute inset-0 bg-white/75" />
      </div>
    );
  }

  if (mode === 'warm') {
    return (
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40" />
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(251, 191, 36, 0.15) 0%, transparent 60%)',
          }}
        />
      </div>
    );
  }

  if (mode === 'gradient') {
    return (
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/50 to-slate-100/30" />
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background: 'radial-gradient(ellipse 100% 80% at 80% 20%, rgba(148, 163, 184, 0.1) 0%, transparent 50%)',
          }}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-white" />
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 100% 0%, rgba(241, 245, 249, 0.8) 0%, transparent 50%)',
        }}
      />
    </div>
  );
}
