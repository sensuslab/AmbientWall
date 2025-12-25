/*
  # Ambient Dashboard Schema
  
  1. New Tables
    - `widget_positions`
      - `id` (uuid, primary key)
      - `widget_type` (text) - Type of widget (time, orb, weather, news, notifications, status_dots)
      - `x` (integer) - X position as percentage of viewport
      - `y` (integer) - Y position as percentage of viewport
      - `z_index` (integer) - Stacking order for 3D depth
      - `visible` (boolean) - Whether widget is shown
      - `settings` (jsonb) - Widget-specific settings
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `notifications`
      - `id` (uuid, primary key)
      - `title` (text) - Notification title
      - `message` (text) - Notification body
      - `type` (text) - info, reminder, alert
      - `read` (boolean) - Whether notification has been read
      - `expires_at` (timestamptz) - Optional expiration
      - `created_at` (timestamptz)
    
    - `status_items`
      - `id` (uuid, primary key)
      - `name` (text) - Status item name
      - `status` (text) - online, away, busy, offline
      - `color` (text) - Custom color override
      - `x` (integer) - X position percentage
      - `y` (integer) - Y position percentage
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `news_items`
      - `id` (uuid, primary key)
      - `headline` (text) - News headline
      - `source` (text) - News source
      - `url` (text) - Optional link
      - `priority` (integer) - Display order
      - `active` (boolean) - Whether to show
      - `created_at` (timestamptz)
    
    - `dashboard_settings`
      - `id` (uuid, primary key)
      - `key` (text, unique) - Setting key
      - `value` (jsonb) - Setting value
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read/write access (for personal dashboard use)
*/

CREATE TABLE IF NOT EXISTS widget_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_type text NOT NULL,
  x integer NOT NULL DEFAULT 50,
  y integer NOT NULL DEFAULT 50,
  z_index integer NOT NULL DEFAULT 1,
  visible boolean NOT NULL DEFAULT true,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text DEFAULT '',
  type text NOT NULL DEFAULT 'info',
  read boolean NOT NULL DEFAULT false,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS status_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text NOT NULL DEFAULT 'offline',
  color text,
  x integer NOT NULL DEFAULT 50,
  y integer NOT NULL DEFAULT 50,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS news_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  headline text NOT NULL,
  source text DEFAULT '',
  url text,
  priority integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dashboard_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE widget_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on widget_positions"
  ON widget_positions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert on widget_positions"
  ON widget_positions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update on widget_positions"
  ON widget_positions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete on widget_positions"
  ON widget_positions FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read on notifications"
  ON notifications FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert on notifications"
  ON notifications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update on notifications"
  ON notifications FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete on notifications"
  ON notifications FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read on status_items"
  ON status_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert on status_items"
  ON status_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update on status_items"
  ON status_items FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete on status_items"
  ON status_items FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read on news_items"
  ON news_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert on news_items"
  ON news_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update on news_items"
  ON news_items FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete on news_items"
  ON news_items FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read on dashboard_settings"
  ON dashboard_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert on dashboard_settings"
  ON dashboard_settings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update on dashboard_settings"
  ON dashboard_settings FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete on dashboard_settings"
  ON dashboard_settings FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_widget_positions_type ON widget_positions(widget_type);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_items_priority ON news_items(priority);
CREATE INDEX IF NOT EXISTS idx_status_items_status ON status_items(status);