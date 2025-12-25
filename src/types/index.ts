export interface WidgetPosition {
  id: string;
  widget_type: string;
  x: number;
  y: number;
  z_index: number;
  visible: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'reminder' | 'alert';
  read: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface StatusItem {
  id: string;
  name: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  color: string | null;
  x: number;
  y: number;
  created_at: string;
  updated_at: string;
}

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  url: string | null;
  priority: number;
  active: boolean;
  created_at: string;
}

export interface DashboardSettings {
  id: string;
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}

export type WidgetType = 'time' | 'orb' | 'weather' | 'news' | 'notifications' | 'status_dots';
