/*
  # Add Scenes and Enhance Widget System
  
  1. New Tables
    - `scenes`
      - `id` (uuid, primary key)
      - `name` (text) - Scene name (e.g., Morning, Work, Evening)
      - `description` (text) - Optional description
      - `background_mode` (text) - white, warm, gradient, photo
      - `background_value` (text) - URL or gradient value
      - `is_active` (boolean) - Currently active scene
      - `sort_order` (integer) - Display order
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Changes to Existing Tables
    - `widget_positions` - Add new columns:
      - `width` (integer) - Widget width in viewport units
      - `height` (integer) - Widget height in viewport units
      - `elevation` (text) - Elevation level token
      - `scene_id` (uuid) - Foreign key to scenes table
  
  3. Security
    - Enable RLS on scenes table
    - Add public read/write policies for personal dashboard use
*/

CREATE TABLE IF NOT EXISTS scenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  background_mode text NOT NULL DEFAULT 'white',
  background_value text,
  is_active boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on scenes"
  ON scenes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert on scenes"
  ON scenes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update on scenes"
  ON scenes FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete on scenes"
  ON scenes FOR DELETE
  TO anon, authenticated
  USING (true);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'widget_positions' AND column_name = 'width'
  ) THEN
    ALTER TABLE widget_positions ADD COLUMN width integer NOT NULL DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'widget_positions' AND column_name = 'height'
  ) THEN
    ALTER TABLE widget_positions ADD COLUMN height integer NOT NULL DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'widget_positions' AND column_name = 'elevation'
  ) THEN
    ALTER TABLE widget_positions ADD COLUMN elevation text NOT NULL DEFAULT 'raised-1';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'widget_positions' AND column_name = 'scene_id'
  ) THEN
    ALTER TABLE widget_positions ADD COLUMN scene_id uuid REFERENCES scenes(id) ON DELETE SET NULL;
  END IF;
END $$;

INSERT INTO scenes (name, description, background_mode, is_active, sort_order)
SELECT 'Default', 'Default ambient scene', 'white', true, 0
WHERE NOT EXISTS (SELECT 1 FROM scenes WHERE name = 'Default');

UPDATE widget_positions
SET scene_id = (SELECT id FROM scenes WHERE name = 'Default' LIMIT 1)
WHERE scene_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_scenes_active ON scenes(is_active);
CREATE INDEX IF NOT EXISTS idx_scenes_sort ON scenes(sort_order);
CREATE INDEX IF NOT EXISTS idx_widget_positions_scene ON widget_positions(scene_id);