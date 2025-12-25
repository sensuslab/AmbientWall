/*
  # Add Data Cache and Rate Limiting Tables

  1. New Tables
    - `data_cache`
      - `id` (uuid, primary key)
      - `cache_key` (text, unique) - Identifier for cached data (e.g., "news:tech", "weather:sf")
      - `data` (jsonb) - The cached data
      - `source` (text) - Data source identifier
      - `cached_at` (timestamptz) - When the data was cached
      - `expires_at` (timestamptz) - When the cache expires
      - `created_at` (timestamptz)
    
    - `api_rate_limits`
      - `id` (uuid, primary key)
      - `api_name` (text) - API identifier (e.g., "serper", "weather")
      - `requests_count` (integer) - Number of requests made
      - `window_start` (timestamptz) - Start of rate limit window
      - `max_requests` (integer) - Maximum requests allowed in window
      - `window_duration_ms` (integer) - Window duration in milliseconds

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated access
*/

CREATE TABLE IF NOT EXISTS data_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text UNIQUE NOT NULL,
  data jsonb NOT NULL DEFAULT '{}',
  source text NOT NULL,
  cached_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS api_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_name text UNIQUE NOT NULL,
  requests_count integer NOT NULL DEFAULT 0,
  window_start timestamptz NOT NULL DEFAULT now(),
  max_requests integer NOT NULL DEFAULT 100,
  window_duration_ms integer NOT NULL DEFAULT 3600000,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_data_cache_key ON data_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_data_cache_expires ON data_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_name ON api_rate_limits(api_name);

ALTER TABLE data_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to data cache"
  ON data_cache FOR SELECT
  USING (true);

CREATE POLICY "Allow insert to data cache"
  ON data_cache FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update to data cache"
  ON data_cache FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete expired cache entries"
  ON data_cache FOR DELETE
  USING (expires_at < now());

CREATE POLICY "Allow read access to rate limits"
  ON api_rate_limits FOR SELECT
  USING (true);

CREATE POLICY "Allow insert to rate limits"
  ON api_rate_limits FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update to rate limits"
  ON api_rate_limits FOR UPDATE
  USING (true)
  WITH CHECK (true);
