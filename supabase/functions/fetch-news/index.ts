import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SerperNewsResult {
  title: string;
  link: string;
  snippet: string;
  date?: string;
  source: string;
  imageUrl?: string;
}

interface CacheEntry {
  data: SerperNewsResult[];
  cached_at: string;
  expires_at: string;
}

const CACHE_DURATION_MS = 15 * 60 * 1000;
const RATE_LIMIT_REQUESTS = 100;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

async function checkRateLimit(supabase: ReturnType<typeof createClient>): Promise<boolean> {
  const { data: limit } = await supabase
    .from('api_rate_limits')
    .select('*')
    .eq('api_name', 'serper')
    .maybeSingle();

  const now = new Date();

  if (!limit) {
    await supabase.from('api_rate_limits').insert({
      api_name: 'serper',
      requests_count: 1,
      window_start: now.toISOString(),
      max_requests: RATE_LIMIT_REQUESTS,
      window_duration_ms: RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  const windowStart = new Date(limit.window_start);
  const windowEnd = new Date(windowStart.getTime() + limit.window_duration_ms);

  if (now > windowEnd) {
    await supabase
      .from('api_rate_limits')
      .update({
        requests_count: 1,
        window_start: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('api_name', 'serper');
    return true;
  }

  if (limit.requests_count >= limit.max_requests) {
    return false;
  }

  await supabase
    .from('api_rate_limits')
    .update({
      requests_count: limit.requests_count + 1,
      updated_at: now.toISOString(),
    })
    .eq('api_name', 'serper');

  return true;
}

async function getCachedNews(
  supabase: ReturnType<typeof createClient>,
  cacheKey: string
): Promise<CacheEntry | null> {
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

  return {
    data: data.data as SerperNewsResult[],
    cached_at: data.cached_at,
    expires_at: data.expires_at,
  };
}

async function cacheNews(
  supabase: ReturnType<typeof createClient>,
  cacheKey: string,
  news: SerperNewsResult[]
): Promise<void> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CACHE_DURATION_MS);

  await supabase.from('data_cache').upsert(
    {
      cache_key: cacheKey,
      data: news,
      source: 'serper',
      cached_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    },
    { onConflict: 'cache_key' }
  );
}

async function fetchFromSerper(
  query: string,
  serperApiKey: string
): Promise<SerperNewsResult[]> {
  const response = await fetch('https://google.serper.dev/news', {
    method: 'POST',
    headers: {
      'X-API-KEY': serperApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: query,
      num: 10,
    }),
  });

  if (!response.ok) {
    throw new Error(`Serper API error: ${response.status}`);
  }

  const data = await response.json();

  return (data.news || []).map((item: Record<string, string>) => ({
    title: item.title || '',
    link: item.link || '',
    snippet: item.snippet || '',
    date: item.date || '',
    source: item.source || '',
    imageUrl: item.imageUrl || null,
  }));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const serperApiKey = Deno.env.get('SERPER_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const query = url.searchParams.get('q') || 'latest news';
    const cacheKey = `news:${query.toLowerCase().replace(/\s+/g, '-')}`;

    const cached = await getCachedNews(supabase, cacheKey);
    if (cached) {
      return new Response(
        JSON.stringify({
          success: true,
          data: cached.data,
          cached: true,
          cachedAt: cached.cached_at,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!serperApiKey) {
      const fallbackNews = [
        { title: 'Technology advances reshape daily life', link: '#', snippet: 'New innovations continue to transform how we work and live.', source: 'Tech News', date: 'Today' },
        { title: 'Global markets show steady growth', link: '#', snippet: 'Economic indicators point to continued expansion.', source: 'Finance Daily', date: 'Today' },
        { title: 'Climate initiatives gain momentum', link: '#', snippet: 'Countries commit to new sustainability goals.', source: 'Environment Watch', date: 'Today' },
        { title: 'Space exploration reaches new milestones', link: '#', snippet: 'Recent missions expand our understanding of the universe.', source: 'Space Today', date: 'Today' },
        { title: 'Healthcare innovations improve outcomes', link: '#', snippet: 'Medical breakthroughs offer hope for patients worldwide.', source: 'Health Report', date: 'Today' },
      ];

      await cacheNews(supabase, cacheKey, fallbackNews);

      return new Response(
        JSON.stringify({
          success: true,
          data: fallbackNews,
          cached: false,
          fallback: true,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const canProceed = await checkRateLimit(supabase);
    if (!canProceed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const news = await fetchFromSerper(query, serperApiKey);
    await cacheNews(supabase, cacheKey, news);

    return new Response(
      JSON.stringify({
        success: true,
        data: news,
        cached: false,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching news:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
