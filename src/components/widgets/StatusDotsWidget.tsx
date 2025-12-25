import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { StatusItem, WidgetComponentProps } from '../../types';

const defaultStatusItems: Omit<StatusItem, 'id' | 'created_at' | 'updated_at'>[] = [
  { name: 'Home', status: 'online', color: null, x: 0, y: 0 },
  { name: 'Office', status: 'away', color: null, x: 40, y: 20 },
  { name: 'Server', status: 'online', color: null, x: 80, y: 10 },
  { name: 'Backup', status: 'offline', color: null, x: 20, y: 60 },
  { name: 'Cloud', status: 'busy', color: null, x: 60, y: 50 },
];

const statusColors: Record<string, string> = {
  online: '#4ECDC4',
  away: '#F59E0B',
  busy: '#EF4444',
  offline: '#94A3B8',
};

export function StatusDotsWidget({ isAmbient }: WidgetComponentProps) {
  const [items, setItems] = useState<StatusItem[]>([]);

  useEffect(() => {
    loadStatusItems();
  }, []);

  async function loadStatusItems() {
    const { data } = await supabase
      .from('status_items')
      .select('*')
      .order('created_at', { ascending: true });

    if (data && data.length > 0) {
      setItems(data);
    } else {
      const { data: inserted } = await supabase
        .from('status_items')
        .insert(defaultStatusItems)
        .select();
      if (inserted) setItems(inserted);
    }
  }

  const positions = [
    { x: 10, y: 15 },
    { x: 55, y: 5 },
    { x: 90, y: 25 },
    { x: 30, y: 65 },
    { x: 75, y: 55 },
  ];

  return (
    <div className="relative w-36 h-28">
      {items.map((item, index) => {
        const color = item.color || statusColors[item.status];
        const isActive = item.status === 'online' || item.status === 'busy';
        const pos = positions[index % positions.length];

        return (
          <div
            key={item.id}
            className="absolute group transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <div
              className={`w-3 h-3 rounded-full transition-all duration-500 ${
                isActive && !isAmbient ? 'animate-pulse-gentle' : ''
              }`}
              style={{
                backgroundColor: color,
                boxShadow: `0 0 ${isActive ? '14px' : '6px'} ${color}60`,
              }}
            />
            {!isAmbient && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="relative px-2.5 py-1 rounded-lg whitespace-nowrap">
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-glass rounded-lg border border-white/50" style={{
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)'
                  }} />
                  <span className="relative text-xs font-light text-gray-600/80">{item.name}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
