import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PhotoData {
  id: string;
  url: string;
  photographer: string;
  photographerUrl: string;
  avgColor: string;
  alt: string;
}

const CACHE_DURATION_MS = 60 * 60 * 1000;

const CURATED_PHOTOS: PhotoData[] = [
  {
    id: 'pexels-1',
    url: 'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=1920',
    photographer: 'Eberhard Grossgasteiger',
    photographerUrl: 'https://www.pexels.com/@eberhardgross',
    avgColor: '#5D7182',
    alt: 'Mountain landscape at sunset',
  },
  {
    id: 'pexels-2',
    url: 'https://images.pexels.com/photos/1166209/pexels-photo-1166209.jpeg?auto=compress&cs=tinysrgb&w=1920',
    photographer: 'Lukas Kloeppel',
    photographerUrl: 'https://www.pexels.com/@lkloeppel',
    avgColor: '#4A6B7C',
    alt: 'Calm ocean waves at dawn',
  },
  {
    id: 'pexels-3',
    url: 'https://images.pexels.com/photos/1421903/pexels-photo-1421903.jpeg?auto=compress&cs=tinysrgb&w=1920',
    photographer: 'Engin Akyurt',
    photographerUrl: 'https://www.pexels.com/@enginakyurt',
    avgColor: '#2C4A3E',
    alt: 'Misty forest morning',
  },
  {
    id: 'pexels-4',
    url: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=1920',
    photographer: 'Johannes Plenio',
    photographerUrl: 'https://www.pexels.com/@jplenio',
    avgColor: '#8B6D4A',
    alt: 'Golden hour in the forest',
  },
  {
    id: 'pexels-5',
    url: 'https://images.pexels.com/photos/1054218/pexels-photo-1054218.jpeg?auto=compress&cs=tinysrgb&w=1920',
    photographer: 'Trace Hudson',
    photographerUrl: 'https://www.pexels.com/@tracehudson',
    avgColor: '#3E5B6E',
    alt: 'Starry night sky',
  },
  {
    id: 'pexels-6',
    url: 'https://images.pexels.com/photos/1671324/pexels-photo-1671324.jpeg?auto=compress&cs=tinysrgb&w=1920',
    photographer: 'Engin Akyurt',
    photographerUrl: 'https://www.pexels.com/@enginakyurt',
    avgColor: '#B8A082',
    alt: 'Desert dunes at sunset',
  },
];

async function getCachedPhotos(
  supabase: ReturnType<typeof createClient>,
  cacheKey: string
): Promise<PhotoData[] | null> {
  const { data } = await supabase
    .from('data_cache')
    .select('*')
    .eq('cache_key', cacheKey)
    .maybeSingle();

  if (!data) return null;

  const now = new Date();
  const expiresAt = new Date(data.expires_at);

  if (now > expiresAt) {
    await supabase.from('data_cache').delete().eq('cache_key', cacheKey);
    return null;
  }

  return data.data as PhotoData[];
}

async function cachePhotos(
  supabase: ReturnType<typeof createClient>,
  cacheKey: string,
  photos: PhotoData[]
): Promise<void> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CACHE_DURATION_MS);

  await supabase.from('data_cache').upsert(
    {
      cache_key: cacheKey,
      data: photos,
      source: 'pexels',
      cached_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    },
    { onConflict: 'cache_key' }
  );
}

async function fetchFromPexels(
  query: string,
  pexelsApiKey: string
): Promise<PhotoData[]> {
  const response = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=10&orientation=landscape`,
    {
      headers: {
        Authorization: pexelsApiKey,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.status}`);
  }

  const data = await response.json();

  return (data.photos || []).map((photo: Record<string, unknown>) => ({
    id: String(photo.id),
    url: (photo.src as Record<string, string>)?.large2x || (photo.src as Record<string, string>)?.large,
    photographer: photo.photographer as string,
    photographerUrl: photo.photographer_url as string,
    avgColor: photo.avg_color as string,
    alt: photo.alt as string || 'Beautiful photograph',
  }));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const pexelsApiKey = Deno.env.get('PEXELS_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const query = url.searchParams.get('q') || 'nature landscape';
    const cacheKey = `photos:${query.toLowerCase().replace(/\s+/g, '-')}`;

    const cached = await getCachedPhotos(supabase, cacheKey);
    if (cached) {
      return new Response(
        JSON.stringify({
          success: true,
          data: cached,
          cached: true,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!pexelsApiKey) {
      await cachePhotos(supabase, cacheKey, CURATED_PHOTOS);

      return new Response(
        JSON.stringify({
          success: true,
          data: CURATED_PHOTOS,
          cached: false,
          fallback: true,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const photos = await fetchFromPexels(query, pexelsApiKey);
    await cachePhotos(supabase, cacheKey, photos.length > 0 ? photos : CURATED_PHOTOS);

    return new Response(
      JSON.stringify({
        success: true,
        data: photos.length > 0 ? photos : CURATED_PHOTOS,
        cached: false,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching photos:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: CURATED_PHOTOS,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
