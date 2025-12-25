import { useState, useEffect } from 'react';

export function TimeWidget() {
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
    <div className="glass-panel-light px-10 py-8 animate-breathe">
      <div className="flex items-baseline gap-2">
        <span className="time-numeral text-8xl text-gray-800/90">{hours}</span>
        <span className="time-numeral text-7xl text-gray-600/70 animate-pulse-slow">:</span>
        <span className="time-numeral text-8xl text-gray-800/90">{minutes}</span>
        <span className="time-numeral text-4xl text-gray-500/60 ml-2">{seconds}</span>
      </div>
      <div className="mt-4 text-gray-600/80 font-light text-lg tracking-wide">
        {dateString}
      </div>
    </div>
  );
}
