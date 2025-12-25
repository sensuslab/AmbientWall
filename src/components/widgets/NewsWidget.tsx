import { useState, useEffect, useCallback } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { useLiveNews } from '../../hooks/useLiveNews';
import type { WidgetComponentProps } from '../../types';

const ROTATION_INTERVAL = 8000;

export function NewsWidget({ isAmbient }: WidgetComponentProps) {
  const { news, loading, refresh } = useLiveNews();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const rotateNews = useCallback(() => {
    if (news.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
      setIsTransitioning(false);
    }, 300);
  }, [news.length]);

  useEffect(() => {
    if (news.length <= 1 || isAmbient) return;
    const interval = setInterval(rotateNews, ROTATION_INTERVAL);
    return () => clearInterval(interval);
  }, [news.length, isAmbient, rotateNews]);

  const currentNews = news[currentIndex];

  if (loading || !currentNews) {
    return (
      <div className="relative w-[420px] p-6 rounded-2xl">
        <div className="absolute inset-0 bg-white/25 backdrop-blur-glass rounded-2xl border border-white/40" style={{
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 8px 32px rgba(0, 0, 0, 0.06)'
        }} />
        <div className="relative flex items-center justify-center h-20">
          <div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-[420px] rounded-2xl group">
      <div className="absolute inset-0 bg-white/25 backdrop-blur-glass rounded-2xl border border-white/40" style={{
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 8px 32px rgba(0, 0, 0, 0.06)'
      }} />

      <div className="relative p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <span className="text-xs font-medium text-teal-600/70 uppercase tracking-wider">
            {currentNews.source}
          </span>
          {!isAmbient && (
            <button
              onClick={refresh}
              className="p-1.5 rounded-lg hover:bg-white/40 text-gray-400 transition-all opacity-0 group-hover:opacity-100"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
          <h3 className="text-base font-medium text-gray-700/90 leading-relaxed line-clamp-2">
            {currentNews.title}
          </h3>

          {currentNews.snippet && (
            <p className="mt-2 text-sm font-light text-gray-500/70 leading-relaxed line-clamp-2">
              {currentNews.snippet}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/20">
          <div className="flex gap-1.5">
            {news.slice(0, 5).map((_, idx) => (
              <button
                key={idx}
                onClick={() => !isAmbient && setCurrentIndex(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'bg-teal-500/60 w-4'
                    : 'bg-gray-300/50 hover:bg-gray-400/50'
                }`}
              />
            ))}
            {news.length > 5 && (
              <span className="text-xs text-gray-400/50 ml-1">+{news.length - 5}</span>
            )}
          </div>

          {currentNews.link && currentNews.link !== '#' && !isAmbient && (
            <a
              href={currentNews.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-gray-400/70 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
            >
              <span>Read more</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
