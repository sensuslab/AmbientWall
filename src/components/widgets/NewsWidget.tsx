import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { NewsItem, WidgetComponentProps } from '../../types';

const defaultNews: Omit<NewsItem, 'id' | 'created_at'>[] = [
  { headline: 'Technology reshapes the future of ambient computing', source: 'TechReview', url: null, priority: 1, active: true },
  { headline: 'New breakthroughs in sustainable energy announced', source: 'ScienceDaily', url: null, priority: 2, active: true },
  { headline: 'Global markets show steady growth this quarter', source: 'Financial Times', url: null, priority: 3, active: true },
  { headline: 'Space exploration enters new era of discovery', source: 'SpaceNews', url: null, priority: 4, active: true },
  { headline: 'Art exhibition showcases digital renaissance', source: 'ArtWorld', url: null, priority: 5, active: true },
];

export function NewsWidget({ isAmbient }: WidgetComponentProps) {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    loadNews();
  }, []);

  async function loadNews() {
    const { data } = await supabase
      .from('news_items')
      .select('*')
      .eq('active', true)
      .order('priority', { ascending: true });

    if (data && data.length > 0) {
      setNews(data);
    } else {
      const { data: inserted } = await supabase
        .from('news_items')
        .insert(defaultNews)
        .select();
      if (inserted) setNews(inserted);
    }
  }

  const duplicatedNews = [...news, ...news];

  return (
    <div className="relative py-4 w-[90vw] max-w-[1400px] overflow-hidden rounded-2xl">
      <div className="absolute inset-0 bg-white/20 backdrop-blur-glass border border-white/30 rounded-2xl" style={{
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 4px 20px rgba(0, 0, 0, 0.04)'
      }} />
      <div className="absolute inset-0 rounded-2xl" style={{
        maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
      }} />
      <div className={`relative flex ${isAmbient ? '' : 'animate-scroll-news'}`}>
        {duplicatedNews.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="flex items-center gap-4 px-8 whitespace-nowrap"
          >
            <span className="text-gray-600/80 font-light">{item.headline}</span>
            <span className="text-gray-400/50 text-sm font-light">{item.source}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300/40" />
          </div>
        ))}
      </div>
    </div>
  );
}
