import { Sun, Cloud, CloudRain, CloudSnow, Wind, CloudFog, CloudLightning, Loader2 } from 'lucide-react';
import { useLiveWeather } from '../../hooks/useLiveWeather';
import type { WidgetComponentProps } from '../../types';

const weatherIcons: Record<string, typeof Sun> = {
  sunny: Sun,
  'partly-cloudy': Cloud,
  cloudy: Cloud,
  rainy: CloudRain,
  snowy: CloudSnow,
  windy: Wind,
  foggy: CloudFog,
  stormy: CloudLightning,
};

const iconColors: Record<string, string> = {
  sunny: 'text-amber-500/80',
  'partly-cloudy': 'text-gray-500/70',
  cloudy: 'text-gray-500/70',
  rainy: 'text-blue-500/70',
  snowy: 'text-blue-300/70',
  windy: 'text-teal-500/70',
  foggy: 'text-gray-400/70',
  stormy: 'text-yellow-500/80',
};

const iconGlows: Record<string, string> = {
  sunny: 'rgba(251,191,36,0.6)',
  'partly-cloudy': 'rgba(156,163,175,0.4)',
  cloudy: 'rgba(156,163,175,0.4)',
  rainy: 'rgba(59,130,246,0.4)',
  snowy: 'rgba(147,197,253,0.4)',
  windy: 'rgba(20,184,166,0.4)',
  foggy: 'rgba(156,163,175,0.3)',
  stormy: 'rgba(234,179,8,0.5)',
};

export function WeatherWidget({ isAmbient, settings }: WidgetComponentProps) {
  const location = (settings?.location as string) || 'San Francisco';
  const { weather, loading } = useLiveWeather(location);

  if (loading || !weather) {
    return (
      <div className="relative px-7 py-6 rounded-2xl">
        <div className="absolute inset-0 bg-white/30 backdrop-blur-glass rounded-2xl border border-white/40" style={{
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 8px 32px rgba(0, 0, 0, 0.06)'
        }} />
        <div className="relative flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  const CurrentIcon = weatherIcons[weather.icon] || Sun;
  const iconColor = iconColors[weather.icon] || 'text-amber-500/80';
  const glowColor = iconGlows[weather.icon] || 'rgba(251,191,36,0.6)';

  return (
    <div className="relative px-7 py-6 rounded-2xl">
      <div className="absolute inset-0 bg-white/30 backdrop-blur-glass rounded-2xl border border-white/40" style={{
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 8px 32px rgba(0, 0, 0, 0.06)'
      }} />
      <div className="relative">
        <div className="flex items-center gap-4">
          <div className="relative">
            <CurrentIcon
              className={`w-12 h-12 ${iconColor}`}
              strokeWidth={1.5}
            />
            <div
              className={`absolute inset-0 blur-xl ${isAmbient ? 'opacity-25' : 'opacity-35'}`}
              style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)` }}
            />
          </div>
          <div>
            <div className="text-4xl font-extralight text-gray-800/90 tracking-tight">
              {weather.temperature}°
            </div>
            <div className="text-sm font-light text-gray-500/70 capitalize">
              {weather.condition}
            </div>
          </div>
        </div>
        <div className="mt-1 text-xs font-light text-gray-400/60 tracking-wide">
          {weather.location}
        </div>
        {weather.forecast && weather.forecast.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/20 flex gap-6">
            {weather.forecast.map((day) => {
              const DayIcon = weatherIcons[day.icon] || Cloud;
              return (
                <div key={day.day} className="text-center">
                  <div className="text-xs font-light text-gray-400/70">{day.day}</div>
                  <DayIcon className="w-5 h-5 mx-auto mt-1.5 text-gray-500/60" strokeWidth={1.5} />
                  <div className="text-sm font-light text-gray-600/80 mt-1">{day.high}°</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
