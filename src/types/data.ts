export interface LiveNewsItem {
  title: string;
  link: string;
  snippet: string;
  source: string;
  date?: string;
  imageUrl?: string;
}

export interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  forecast: WeatherForecast[];
  lastUpdated: string;
}

export interface WeatherForecast {
  day: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
}

export interface GroundedBrief {
  topic: string;
  summary: string;
  keyPoints: string[];
  sources: { title: string; url: string }[];
  generatedAt: string;
}

export interface PhotoData {
  id: string;
  url: string;
  photographer: string;
  photographerUrl: string;
  avgColor: string;
  alt: string;
}

export interface CachedData<T> {
  data: T;
  cachedAt: string;
  expiresAt: string;
  source: string;
}

export interface DataSourceConfig {
  name: string;
  refreshInterval: number;
  cacheDuration: number;
  rateLimit: {
    requests: number;
    windowMs: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
  cachedAt?: string;
}
