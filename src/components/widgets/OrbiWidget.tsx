import { useState, useEffect } from 'react';

type OrbStatus = 'calm' | 'active' | 'alert';

const statusColors: Record<OrbStatus, { outer: string; inner: string; glow: string }> = {
  calm: {
    outer: 'from-cyan-400/80 to-teal-500/60',
    inner: 'from-white/60 via-cyan-200/30 to-transparent',
    glow: 'rgba(100, 181, 198, 0.4)',
  },
  active: {
    outer: 'from-emerald-400/80 to-cyan-500/60',
    inner: 'from-white/60 via-emerald-200/30 to-transparent',
    glow: 'rgba(78, 205, 196, 0.5)',
  },
  alert: {
    outer: 'from-rose-400/80 to-orange-400/60',
    inner: 'from-white/60 via-rose-200/30 to-transparent',
    glow: 'rgba(255, 107, 107, 0.5)',
  },
};

export function OrbiWidget() {
  const [status, setStatus] = useState<OrbStatus>('calm');
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
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
  }, []);

  const colors = statusColors[status];

  return (
    <div className="relative">
      <div
        className={`w-40 h-40 rounded-full bg-gradient-radial ${colors.outer} transition-all duration-1000 ease-in-out`}
        style={{
          background: `radial-gradient(circle at 30% 30%, var(--tw-gradient-from), var(--tw-gradient-to))`,
          boxShadow: `
            0 0 ${pulse ? '80px' : '60px'} ${colors.glow},
            inset 0 -20px 40px rgba(0, 0, 0, 0.1),
            inset 0 20px 40px rgba(255, 255, 255, 0.3)
          `,
        }}
      >
        <div
          className={`absolute inset-0 rounded-full bg-gradient-radial ${colors.inner}`}
          style={{
            background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6), transparent 60%)`,
          }}
        />
        <div
          className={`absolute inset-4 rounded-full transition-transform duration-1000 ${
            pulse ? 'scale-105' : 'scale-100'
          }`}
          style={{
            background: `radial-gradient(circle at 40% 40%, rgba(255,255,255,0.3), transparent 50%)`,
          }}
        />
      </div>
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-light text-gray-500/60 tracking-wider uppercase">
        {status}
      </div>
    </div>
  );
}
