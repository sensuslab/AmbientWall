import { useState, useEffect } from 'react';
import { Bell, Calendar, AlertCircle, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Notification, WidgetComponentProps } from '../../types';

const defaultNotifications: Omit<Notification, 'id' | 'created_at'>[] = [
  { title: 'Welcome', message: 'Your ambient dashboard is ready', type: 'info', read: false, expires_at: null },
  { title: 'Reminder', message: 'Weekly review at 3pm', type: 'reminder', read: false, expires_at: null },
  { title: 'System Update', message: 'New features available', type: 'info', read: false, expires_at: null },
];

const typeIcons = {
  info: Bell,
  reminder: Calendar,
  alert: AlertCircle,
};

const typeColors = {
  info: 'text-teal-600/70',
  reminder: 'text-amber-600/70',
  alert: 'text-rose-600/70',
};

export function NotificationsWidget({ isAmbient }: WidgetComponentProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('read', false)
      .order('created_at', { ascending: false })
      .limit(3);

    if (data && data.length > 0) {
      setNotifications(data);
    } else {
      const { data: inserted } = await supabase
        .from('notifications')
        .insert(defaultNotifications)
        .select();
      if (inserted) setNotifications(inserted);
    }
  }

  async function dismissNotification(id: string) {
    setNotifications(prev => prev.filter(n => n.id !== id));
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
  }

  return (
    <div className="flex flex-col gap-3">
      {notifications.map((notification, index) => {
        const Icon = typeIcons[notification.type];
        const colorClass = typeColors[notification.type];
        const offset = index * 6;
        const zOffset = 3 - index;

        return (
          <div
            key={notification.id}
            className={`relative w-64 group p-4 rounded-2xl transition-transform duration-300 hover:scale-[1.02] ${isAmbient ? '' : 'animate-slide-in'}`}
            style={{
              marginLeft: `${offset}px`,
              zIndex: zOffset,
              animationDelay: isAmbient ? '0ms' : `${index * 100}ms`,
            }}
          >
            <div className="absolute inset-0 bg-white/30 backdrop-blur-glass rounded-2xl border border-white/40" style={{
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 8px 32px rgba(0, 0, 0, 0.06)'
            }} />
            <div className="relative flex items-start gap-3">
              <Icon className={`w-5 h-5 mt-0.5 ${colorClass}`} strokeWidth={1.5} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-700/90">
                  {notification.title}
                </div>
                <div className="text-xs font-light text-gray-500/70 mt-0.5 truncate">
                  {notification.message}
                </div>
              </div>
              {!isAmbient && (
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/40 rounded-lg"
                >
                  <X className="w-3 h-3 text-gray-400/70" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
