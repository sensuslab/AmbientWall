import type { ComponentType } from 'react';

export type {
  LiveNewsItem,
  WeatherData,
  WeatherForecast,
  GroundedBrief,
  PhotoData,
  CachedData,
  DataSourceConfig,
  ApiResponse,
} from './data';

export type ElevationLevel = 'surface' | 'raised-1' | 'raised-2' | 'raised-3' | 'raised-4' | 'floating';

export type WidgetCategory = 'time' | 'status' | 'information' | 'media' | 'interactive' | 'embed';

export type AppMode = 'ambient' | 'interaction' | 'edit' | 'calibration';

export type BackgroundMode = 'white' | 'warm' | 'gradient' | 'photo';

export interface SizeConstraints {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  aspectRatio?: number;
}

export interface WidgetSettingsField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'color';
  default: unknown;
  options?: { label: string; value: string | number }[];
}

export interface WidgetManifest {
  id: string;
  name: string;
  description: string;
  category: WidgetCategory;
  icon: string;
  defaultSize: { width: number; height: number };
  sizeConstraints?: SizeConstraints;
  defaultElevation: ElevationLevel;
  resizable: boolean;
  settingsSchema: WidgetSettingsField[];
  component: ComponentType<WidgetComponentProps>;
}

export interface WidgetComponentProps {
  settings: Record<string, unknown>;
  isAmbient: boolean;
  onSettingsChange?: (settings: Record<string, unknown>) => void;
}

export interface WidgetInstance {
  id: string;
  widget_type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  elevation: ElevationLevel;
  z_index: number;
  visible: boolean;
  settings: Record<string, unknown>;
  scene_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Scene {
  id: string;
  name: string;
  description: string;
  background_mode: BackgroundMode;
  background_value: string | null;
  is_active: boolean;
  sort_order: number;
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

export interface CalibrationSettings {
  safeAreaPadding: number;
  scaleFactor: number;
  contrastBoost: number;
  warmth: number;
  showGrid: boolean;
  snapToGrid: boolean;
}

export const ELEVATION_Z_INDEX: Record<ElevationLevel, number> = {
  'surface': 1,
  'raised-1': 10,
  'raised-2': 20,
  'raised-3': 30,
  'raised-4': 40,
  'floating': 100,
};

export type WidgetType =
  | 'time'
  | 'orb'
  | 'weather'
  | 'news'
  | 'notifications'
  | 'status_dots'
  | 'photo'
  | 'grounded_brief'
  | 'system_status'
  | 'voice_agent'
  | 'iframe';
