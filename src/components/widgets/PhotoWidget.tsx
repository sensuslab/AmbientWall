import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Camera, Loader2, Upload, Trash2, Heart, X, Image } from 'lucide-react';
import { useLivePhotos } from '../../hooks/useLivePhotos';
import { useUserPhotos, type UserPhoto } from '../../hooks/useUserPhotos';
import type { WidgetComponentProps, PhotoData } from '../../types';

const SLIDESHOW_INTERVAL = 30000;

type PhotoSource = 'pexels' | 'user';

interface CombinedPhoto {
  id: string;
  url: string;
  photographer: string;
  photographerUrl?: string;
  avgColor: string;
  alt: string;
  source: PhotoSource;
  isFavorite?: boolean;
}

function mapPexelsPhoto(photo: PhotoData): CombinedPhoto {
  return {
    id: photo.id,
    url: photo.url,
    photographer: photo.photographer,
    photographerUrl: photo.photographerUrl,
    avgColor: photo.avgColor,
    alt: photo.alt,
    source: 'pexels',
  };
}

function mapUserPhoto(photo: UserPhoto): CombinedPhoto {
  return {
    id: photo.id,
    url: photo.url,
    photographer: photo.photographer,
    avgColor: photo.avg_color,
    alt: photo.alt,
    source: 'user',
    isFavorite: photo.is_favorite,
  };
}

export function PhotoWidget({ isAmbient, settings }: WidgetComponentProps) {
  const query = (settings?.query as string) || 'nature landscape';
  const defaultSource = (settings?.source as PhotoSource) || 'pexels';

  const { photos: pexelsPhotos, loading: pexelsLoading } = useLivePhotos(query);
  const { photos: userPhotos, loading: userLoading, uploading, uploadPhoto, deletePhoto, toggleFavorite } = useUserPhotos();

  const [source, setSource] = useState<PhotoSource>(defaultSource);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const photos: CombinedPhoto[] = source === 'pexels'
    ? pexelsPhotos.map(mapPexelsPhoto)
    : userPhotos.map(mapUserPhoto);

  const loading = source === 'pexels' ? pexelsLoading : userLoading;
  const currentPhoto = photos[currentIndex];

  const nextPhoto = useCallback(() => {
    if (photos.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  const prevPhoto = useCallback(() => {
    if (photos.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  useEffect(() => {
    if (photos.length <= 1 || !isAmbient) return;
    const interval = setInterval(nextPhoto, SLIDESHOW_INTERVAL);
    return () => clearInterval(interval);
  }, [photos.length, nextPhoto, isAmbient]);

  useEffect(() => {
    setImageLoaded(false);
  }, [currentPhoto?.id]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [source]);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      await uploadPhoto(file);
    }
    setShowUploadModal(false);
    setSource('user');
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    await handleFileSelect(e.dataTransfer.files);
  };

  const handleDeletePhoto = async () => {
    if (!currentPhoto || currentPhoto.source !== 'user') return;
    await deletePhoto(currentPhoto.id);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleToggleFavorite = async () => {
    if (!currentPhoto || currentPhoto.source !== 'user') return;
    await toggleFavorite(currentPhoto.id);
  };

  if (loading) {
    return (
      <div className="relative w-80 h-52 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-white/25 backdrop-blur-glass border border-white/40" style={{
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 8px 32px rgba(0, 0, 0, 0.06)'
        }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (!currentPhoto && source === 'user') {
    return (
      <div className="relative w-80 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-white/25 backdrop-blur-glass border border-white/40 rounded-2xl" style={{
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 8px 32px rgba(0, 0, 0, 0.06)'
        }} />

        <div className="relative aspect-[16/10] flex flex-col items-center justify-center p-6">
          <div
            className={`w-full h-full rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center cursor-pointer ${
              isDragging ? 'border-teal-500 bg-teal-50/30' : 'border-gray-300/50 hover:border-gray-400/50'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 text-gray-400 mb-2" strokeWidth={1.5} />
            <p className="text-sm text-gray-500 font-light">Drop photos here</p>
            <p className="text-xs text-gray-400 mt-1">or click to browse</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>

        <div className="relative p-4 pt-0">
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setSource('pexels')}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                source === 'pexels'
                  ? 'bg-teal-500/20 text-teal-700'
                  : 'bg-white/30 text-gray-500 hover:bg-white/50'
              }`}
            >
              Pexels
            </button>
            <button
              onClick={() => setSource('user')}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                source === 'user'
                  ? 'bg-teal-500/20 text-teal-700'
                  : 'bg-white/30 text-gray-500 hover:bg-white/50'
              }`}
            >
              My Photos
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentPhoto) {
    return (
      <div className="relative w-80 h-52 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-white/25 backdrop-blur-glass border border-white/40 flex items-center justify-center" style={{
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 8px 32px rgba(0, 0, 0, 0.06)'
        }}>
          <Image className="w-8 h-8 text-gray-300" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-80 rounded-2xl overflow-hidden group">
      <div className="absolute inset-0 bg-white/25 backdrop-blur-glass border border-white/40 rounded-2xl" style={{
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 8px 32px rgba(0, 0, 0, 0.06)'
      }} />

      <div className="relative aspect-[16/10] overflow-hidden rounded-t-2xl">
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            backgroundColor: currentPhoto.avgColor || '#e5e7eb',
            opacity: imageLoaded ? 0 : 1,
          }}
        />
        <img
          src={currentPhoto.url}
          alt={currentPhoto.alt}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />

        {!isAmbient && (
          <>
            <button
              onClick={prevPhoto}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 backdrop-blur-sm text-white/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 backdrop-blur-sm text-white/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {source === 'user' && (
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleToggleFavorite}
                  className={`p-1.5 rounded-full backdrop-blur-sm transition-colors ${
                    currentPhoto.isFavorite
                      ? 'bg-rose-500/80 text-white'
                      : 'bg-black/20 text-white/80 hover:bg-black/30'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" fill={currentPhoto.isFavorite ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={handleDeletePhoto}
                  className="p-1.5 rounded-full bg-black/20 backdrop-blur-sm text-white/80 hover:bg-rose-500/80 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={() => setShowUploadModal(true)}
              className="absolute top-2 left-2 p-1.5 rounded-full bg-black/20 backdrop-blur-sm text-white/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/30"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      <div className="relative p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-3.5 h-3.5 text-gray-400/70" strokeWidth={1.5} />
            {currentPhoto.photographerUrl ? (
              <a
                href={currentPhoto.photographerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-light text-gray-500/70 hover:text-gray-700 transition-colors"
              >
                {currentPhoto.photographer}
              </a>
            ) : (
              <span className="text-xs font-light text-gray-500/70">
                {currentPhoto.photographer}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isAmbient && (
              <div className="flex gap-1">
                <button
                  onClick={() => setSource('pexels')}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    source === 'pexels' ? 'bg-teal-500/60 w-3' : 'bg-gray-300/50'
                  }`}
                  title="Pexels"
                />
                <button
                  onClick={() => setSource('user')}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    source === 'user' ? 'bg-teal-500/60 w-3' : 'bg-gray-300/50'
                  }`}
                  title="My Photos"
                />
              </div>
            )}
            <span className="text-xs text-gray-400/50 mx-1">|</span>
            <div className="flex gap-1">
              {photos.slice(0, 5).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? 'bg-teal-500/60 w-3'
                      : 'bg-gray-300/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {showUploadModal && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-xs flex items-center justify-center z-50"
          onClick={() => setShowUploadModal(false)}
        >
          <div
            className="relative p-6 w-96 rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-white/80 backdrop-blur-heavy rounded-2xl border border-white/60" style={{
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.15)'
            }} />

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-light text-gray-700">Upload Photos</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div
                className={`w-full h-48 rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center cursor-pointer ${
                  isDragging ? 'border-teal-500 bg-teal-50/50' : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-gray-400 mb-3" strokeWidth={1.5} />
                    <p className="text-sm text-gray-600">Drop photos here</p>
                    <p className="text-xs text-gray-400 mt-1">or click to browse</p>
                  </>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
              />

              <p className="text-xs text-gray-400 mt-3 text-center">
                Supports JPG, PNG, GIF, WebP
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
