import { Sun, Cloud, CloudRain, CloudSnow, Wind } from 'lucide-react';
import type { WidgetComponentProps } from '../../types';

interface WeatherDay {
  day: string;
  temp: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy';
}

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  snowy: CloudSnow,
  windy: Wind,
};

const mockWeather: { current: { temp: number; condition: keyof typeof weatherIcons; location: string }; forecast: WeatherDay[] } = {
  current: {
    temp: 72,
    condition: 'sunny',
    location: 'San Francisco',
  },
  forecast: [
    { day: 'Mon', temp: 74, condition: 'sunny' },
    { day: 'Tue', temp: 68, condition: 'cloudy' },
    { day: 'Wed', temp: 65, condition: 'rainy' },
  ],
};

export function WeatherWidget({ isAmbient }: WidgetComponentProps) {
  const CurrentIcon = weatherIcons[mockWeather.current.condition];

  return (
    <div className="relative px-7 py-6 rounded-2xl">
      <div className="absolute inset-0 bg-white/30 backdrop-blur-glass rounded-2xl border border-white/40" style={{
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 8px 32px rgba(0, 0, 0, 0.06)'
      }} />
      <div className="relative">
        <div className="flex items-center gap-4">
          <div className="relative">
            <CurrentIcon
              className="w-12 h-12 text-amber-500/80"
              strokeWidth={1.5}
            />
            <div
              className={`absolute inset-0 blur-xl ${isAmbient ? 'opacity-25' : 'opacity-35'}`}
              style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.6) 0%, transparent 70%)' }}
            />
          </div>
          <div>
            <div className="text-4xl font-extralight text-gray-800/90 tracking-tight">
              {mockWeather.current.temp}°
            </div>
            <div className="text-sm font-light text-gray-500/70 capitalize">
              {mockWeather.current.condition}
            </div>
          </div>
        </div>
        <div className="mt-1 text-xs font-light text-gray-400/60 tracking-wide">
          {mockWeather.current.location}
        </div>
        <div className="mt-4 pt-4 border-t border-white/20 flex gap-6">
          {mockWeather.forecast.map((day) => {
            const DayIcon = weatherIcons[day.condition];
            return (
              <div key={day.day} className="text-center">
                <div className="text-xs font-light text-gray-400/70">{day.day}</div>
                <DayIcon className="w-5 h-5 mx-auto mt-1.5 text-gray-500/60" strokeWidth={1.5} />
                <div className="text-sm font-light text-gray-600/80 mt-1">{day.temp}°</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
