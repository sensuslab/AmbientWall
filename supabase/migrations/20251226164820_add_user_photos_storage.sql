/*
  # Add User Photos Storage

  1. New Tables
    - `user_photos`
      - `id` (uuid, primary key)
      - `filename` (text) - Original filename
      - `storage_path` (text) - Path in storage bucket
      - `url` (text) - Public URL for the photo
      - `alt` (text) - Alt text for accessibility
      - `photographer` (text) - Credit/attribution
      - `avg_color` (text) - Dominant color for loading states
      - `category` (text) - Photo category for organization
      - `is_favorite` (boolean) - User favorited
      - `sort_order` (integer) - Display order
      - `created_at` (timestamptz)

  2. Storage
    - Creates 'photos' bucket for user uploads
    - Allows public access to photos

  3. Security
    - Enable RLS on user_photos table
    - Allow public access for personal dashboard use
*/

CREATE TABLE IF NOT EXISTS user_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  storage_path text NOT NULL,
  url text NOT NULL,
  alt text DEFAULT '',
  photographer text DEFAULT 'User Upload',
  avg_color text DEFAULT '#e5e7eb',
  category text DEFAULT 'general',
  is_favorite boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on user_photos"
  ON user_photos FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert on user_photos"
  ON user_photos FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update on user_photos"
  ON user_photos FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete on user_photos"
  ON user_photos FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_user_photos_category ON user_photos(category);
CREATE INDEX IF NOT EXISTS idx_user_photos_favorite ON user_photos(is_favorite);
CREATE INDEX IF NOT EXISTS idx_user_photos_sort ON user_photos(sort_order);

INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public read on photos bucket"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'photos');

CREATE POLICY "Allow public upload to photos bucket"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Allow public delete from photos bucket"
  ON storage.objects FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'photos');
