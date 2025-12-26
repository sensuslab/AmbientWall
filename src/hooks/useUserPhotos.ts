import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface UserPhoto {
  id: string;
  filename: string;
  storage_path: string;
  url: string;
  alt: string;
  photographer: string;
  avg_color: string;
  category: string;
  is_favorite: boolean;
  sort_order: number;
  created_at: string;
}

export function useUserPhotos() {
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPhotos = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from('user_photos')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setPhotos(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const uploadPhoto = useCallback(async (file: File): Promise<UserPhoto | null> => {
    setUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

      if (!fileExt || !allowedExts.includes(fileExt)) {
        throw new Error('Invalid file type. Please upload an image file.');
      }

      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const storagePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(storagePath);

      const { data: photoData, error: insertError } = await supabase
        .from('user_photos')
        .insert({
          filename: file.name,
          storage_path: storagePath,
          url: publicUrl,
          alt: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          photographer: 'User Upload',
          avg_color: '#e5e7eb',
          sort_order: photos.length,
        })
        .select()
        .maybeSingle();

      if (insertError) throw insertError;

      if (photoData) {
        setPhotos((prev) => [...prev, photoData]);
        return photoData;
      }

      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  }, [photos.length]);

  const deletePhoto = useCallback(async (id: string) => {
    const photo = photos.find((p) => p.id === id);
    if (!photo) return;

    await supabase.storage.from('photos').remove([photo.storage_path]);

    await supabase.from('user_photos').delete().eq('id', id);

    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }, [photos]);

  const toggleFavorite = useCallback(async (id: string) => {
    const photo = photos.find((p) => p.id === id);
    if (!photo) return;

    const newFavorite = !photo.is_favorite;

    await supabase
      .from('user_photos')
      .update({ is_favorite: newFavorite })
      .eq('id', id);

    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_favorite: newFavorite } : p))
    );
  }, [photos]);

  return {
    photos,
    loading,
    uploading,
    error,
    uploadPhoto,
    deletePhoto,
    toggleFavorite,
    refresh: loadPhotos,
  };
}
