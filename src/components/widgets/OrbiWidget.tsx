import { useState, useEffect } from 'react';
import type { WidgetComponentProps } from '../../types';

type OrbStatus = 'calm' | 'active' | 'alert';

const statusColors: Record<OrbStatus, { gradient: string; glow: string }> = {
  calm: {
    gradient: 'radial-gradient(circle at 30% 30%, rgba(100, 181, 198, 0.8), rgba(78, 205, 196, 0.6))',
    glow: 'rgba(100, 181, 198, 0.4)',
  },
  active: {
    gradient: 'radial-gradient(circle at 30% 30%, rgba(78, 205, 196, 0.8), rgba(100, 181, 198, 0.6))',
    glow: 'rgba(78, 205, 196, 0.5)',
  },
  alert: {
    gradient: 'radial-gradient(circle at 30% 30%, rgba(255, 107, 107, 0.8), rgba(255, 180, 100, 0.6))',
    glow: 'rgba(255, 107, 107, 0.5)',
  },
};

export function OrbiWidget({ isAmbient }: WidgetComponentProps) {
  const [status, setStatus] = useState<OrbStatus>('calm');
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (isAmbient) return;

    const statusInterval = setInterval(() => {
      const statuses: OrbStatus[] = ['calm', 'active', 'alert'];
      const weights = [0.7, 0.2, 0.1];
      const random = Math.random();
      let cumulative = 0;
      for (let i = 0; i < statuses.length; i++) {
        cumulative += weights[i];
        if (random < cumulative) {
          setStatus(statuses[i]);
          break;
        }
      }
    }, 10000);

    const pulseInterval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 1000);
    }, 4000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(pulseInterval);
    };
  }, [isAmbient]);

  const colors = statusColors[status];

  return (
    <div className="relative">
      <div
        className="w-40 h-40 rounded-full transition-all duration-1000 ease-in-out"
        style={{
          background: colors.gradient,
          boxShadow: `
            0 0 ${pulse && !isAmbient ? '80px' : '60px'} ${colors.glow},
            inset 0 -20px 40px rgba(0, 0, 0, 0.1),
            inset 0 20px 40px rgba(255, 255, 255, 0.3)
          `,
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6), transparent 60%)',
          }}
        />
        <div
          className={`absolute inset-4 rounded-full transition-transform duration-1000 ${
            pulse && !isAmbient ? 'scale-105' : 'scale-100'
          }`}
          style={{
            background: 'radial-gradient(circle at 40% 40%, rgba(255,255,255,0.3), transparent 50%)',
          }}
        />
      </div>
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-light text-gray-500/60 tracking-wider uppercase">
        {status}
      </div>
    </div>
  );
}
