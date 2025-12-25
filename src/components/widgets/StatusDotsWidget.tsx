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
  away: '#FFE66D',
  busy: '#FF6B6B',
  offline: '#9CA3AF',
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

  return (
    <div className="relative w-40 h-32">
      {items.map((item, index) => {
        const color = item.color || statusColors[item.status];
        const isActive = item.status === 'online' || item.status === 'busy';
        const positions = [
          { x: 0, y: 10 },
          { x: 50, y: 0 },
          { x: 100, y: 20 },
          { x: 30, y: 70 },
          { x: 80, y: 60 },
        ];
        const pos = positions[index % positions.length];

        return (
          <div
            key={item.id}
            className="absolute group"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <div
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                isActive && !isAmbient ? 'animate-pulse-slow' : ''
              }`}
              style={{
                backgroundColor: color,
                boxShadow: `0 0 ${isActive ? '16px' : '8px'} ${color}`,
              }}
            />
            {!isAmbient && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="glass-panel-light px-2 py-1 text-xs font-light text-gray-600/80 whitespace-nowrap">
                  {item.name}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
