import { useState, useEffect } from 'react';
import { FileText, ChevronRight, Loader2 } from 'lucide-react';
import { useLiveNews } from '../../hooks/useLiveNews';
import type { WidgetComponentProps } from '../../types';

function extractKeyTopics(news: { title: string; snippet?: string }[]): string[] {
  const topics = new Set<string>();
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'that', 'this', 'these', 'those', 'it', 'its', 'new', 'how', 'says', 'after', 'over', 'into'];

  news.forEach(item => {
    const text = `${item.title} ${item.snippet || ''}`;
    const words = text.split(/\s+/).filter(w => w.length > 0);

    for (let i = 0; i < words.length - 1; i++) {
      const word1Raw = words[i];
      const word2Raw = words[i + 1];

      if (!word1Raw || !word2Raw) continue;

      const word1 = word1Raw.replace(/[^a-zA-Z]/g, '').toLowerCase();
      const word2 = word2Raw.replace(/[^a-zA-Z]/g, '').toLowerCase();

      const word1Char = word1Raw.replace(/[^a-zA-Z]/g, '')[0];
      const word2Char = word2Raw.replace(/[^a-zA-Z]/g, '')[0];

      if (word1.length > 3 && word2.length > 3 &&
          !commonWords.includes(word1) && !commonWords.includes(word2) &&
          word1Char && word2Char &&
          (word1Char === word1Char.toUpperCase() || word2Char === word2Char.toUpperCase())) {
        const phrase = `${word1Raw} ${word2Raw}`.replace(/[^a-zA-Z\s]/g, '');
        if (phrase.length > 6) topics.add(phrase);
      }
    }
  });

  return Array.from(topics).slice(0, 4);
}

function generateBriefSummary(news: { title: string }[]): string {
  if (news.length === 0) return 'No updates available at this time.';

  const categories = {
    tech: 0,
    market: 0,
    climate: 0,
    health: 0,
    politics: 0,
    science: 0,
  };

  news.forEach(item => {
    const title = item.title.toLowerCase();
    if (title.includes('tech') || title.includes('ai') || title.includes('digital')) categories.tech++;
    if (title.includes('market') || title.includes('stock') || title.includes('economy')) categories.market++;
    if (title.includes('climate') || title.includes('environment') || title.includes('energy')) categories.climate++;
    if (title.includes('health') || title.includes('medical') || title.includes('vaccine')) categories.health++;
    if (title.includes('politic') || title.includes('government') || title.includes('election')) categories.politics++;
    if (title.includes('science') || title.includes('space') || title.includes('research')) categories.science++;
  });

  const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
  const categoryNames: Record<string, string> = {
    tech: 'technology and innovation',
    market: 'markets and economy',
    climate: 'climate and environment',
    health: 'health and medicine',
    politics: 'politics and governance',
    science: 'science and discovery',
  };

  return `Today's headlines are focused on ${categoryNames[topCategory[0]] || 'current events'}, with ${news.length} stories tracked across multiple sources.`;
}

export function GroundedBriefWidget({ isAmbient }: WidgetComponentProps) {
  const { news, loading } = useLiveNews();
  const [summary, setSummary] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [expandedTopic, setExpandedTopic] = useState<number | null>(null);

  useEffect(() => {
    if (news.length > 0) {
      setSummary(generateBriefSummary(news));
      setTopics(extractKeyTopics(news));
    }
  }, [news]);

  if (loading) {
    return (
      <div className="relative w-80 p-6 rounded-2xl">
        <div className="absolute inset-0 bg-white/25 backdrop-blur-glass rounded-2xl border border-white/40" style={{
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 8px 32px rgba(0, 0, 0, 0.06)'
        }} />
        <div className="relative flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-80 rounded-2xl">
      <div className="absolute inset-0 bg-white/25 backdrop-blur-glass rounded-2xl border border-white/40" style={{
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 8px 32px rgba(0, 0, 0, 0.06)'
      }} />

      <div className="relative p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-teal-500/10">
            <FileText className="w-4 h-4 text-teal-600/70" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700/90">Daily Brief</h3>
            <p className="text-xs font-light text-gray-400/70">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>

        <p className="text-sm font-light text-gray-600/80 leading-relaxed mb-4">
          {summary}
        </p>

        {topics.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500/60 uppercase tracking-wider">Key Topics</p>
            <div className="flex flex-wrap gap-2">
              {topics.map((topic, idx) => (
                <button
                  key={idx}
                  onClick={() => !isAmbient && setExpandedTopic(expandedTopic === idx ? null : idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-light transition-all duration-200 ${
                    expandedTopic === idx
                      ? 'bg-teal-500/15 text-teal-700 border border-teal-500/20'
                      : 'bg-white/30 text-gray-600/70 border border-white/40 hover:bg-white/50'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
          <span className="text-xs font-light text-gray-400/60">
            {news.length} stories tracked
          </span>
          {!isAmbient && (
            <button className="flex items-center gap-1 text-xs text-teal-600/70 hover:text-teal-700 transition-colors">
              <span>View all</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
