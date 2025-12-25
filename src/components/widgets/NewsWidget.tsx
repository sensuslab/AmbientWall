import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { NewsItem } from '../../types';

const defaultNews: Omit<NewsItem, 'id' | 'created_at'>[] = [
  { headline: 'Technology reshapes the future of ambient computing', source: 'TechReview', url: null, priority: 1, active: true },
  { headline: 'New breakthroughs in sustainable energy announced', source: 'ScienceDaily', url: null, priority: 2, active: true },
  { headline: 'Global markets show steady growth this quarter', source: 'Financial Times', url: null, priority: 3, active: true },
  { headline: 'Space exploration enters new era of discovery', source: 'SpaceNews', url: null, priority: 4, active: true },
  { headline: 'Art exhibition showcases digital renaissance', source: 'ArtWorld', url: null, priority: 5, active: true },
];

export function NewsWidget() {
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
    <div className="glass-panel-light py-4 w-[90vw] max-w-[1400px] overflow-hidden news-strip">
      <div className="flex animate-scroll-news">
        {duplicatedNews.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="flex items-center gap-4 px-8 whitespace-nowrap"
          >
            <span className="text-gray-700/80 font-light">{item.headline}</span>
            <span className="text-gray-400/60 text-sm font-light">{item.source}</span>
            <span className="w-1 h-1 rounded-full bg-gray-400/40" />
          </div>
        ))}
      </div>
    </div>
  );
}
