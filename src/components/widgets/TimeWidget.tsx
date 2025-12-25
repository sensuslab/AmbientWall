import { useState, useEffect } from 'react';
import type { WidgetComponentProps } from '../../types';

export function TimeWidget({ isAmbient }: WidgetComponentProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  };
  const dateString = time.toLocaleDateString('en-US', dateOptions);

  return (
    <div className={`relative px-12 py-10 rounded-3xl ${isAmbient ? '' : 'animate-breathe'}`}>
      <div className="absolute inset-0 bg-white/25 backdrop-blur-glass rounded-3xl border border-white/40" style={{
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 8px 32px rgba(0, 0, 0, 0.06)'
      }} />
      <div className="relative">
        <div className="flex items-baseline gap-2">
          <span className="font-extralight text-[5.5rem] leading-none tracking-tight text-gray-800/90" style={{
            textShadow: '0 4px 24px rgba(0, 0, 0, 0.06)'
          }}>
            {hours}
          </span>
          <span className={`font-extralight text-6xl text-gray-500/50 ${isAmbient ? '' : 'animate-pulse-gentle'}`}>
            :
          </span>
          <span className="font-extralight text-[5.5rem] leading-none tracking-tight text-gray-800/90" style={{
            textShadow: '0 4px 24px rgba(0, 0, 0, 0.06)'
          }}>
            {minutes}
          </span>
          <span className="font-light text-3xl text-gray-400/50 ml-3 self-end mb-3">
            {seconds}
          </span>
        </div>
        <div className="mt-5 text-gray-500/70 font-light text-lg tracking-wide">
          {dateString}
        </div>
      </div>
    </div>
  );
}
