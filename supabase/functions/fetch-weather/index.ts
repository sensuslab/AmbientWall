import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  forecast: { day: string; high: number; low: number; condition: string; icon: string }[];
  lastUpdated: string;
}

const CACHE_DURATION_MS = 30 * 60 * 1000;

async function getCachedWeather(
  supabase: ReturnType<typeof createClient>,
  cacheKey: string
): Promise<WeatherData | null> {
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

  return data.data as WeatherData;
}

async function cacheWeather(
  supabase: ReturnType<typeof createClient>,
  cacheKey: string,
  weather: WeatherData
): Promise<void> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CACHE_DURATION_MS);

  await supabase.from('data_cache').upsert(
    {
      cache_key: cacheKey,
      data: weather,
      source: 'weather',
      cached_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    },
    { onConflict: 'cache_key' }
  );
}

function getWeatherIcon(condition: string): string {
  const lower = condition.toLowerCase();
  if (lower.includes('sun') || lower.includes('clear')) return 'sunny';
  if (lower.includes('cloud') && lower.includes('part')) return 'partly-cloudy';
  if (lower.includes('cloud') || lower.includes('overcast')) return 'cloudy';
  if (lower.includes('rain') || lower.includes('shower')) return 'rainy';
  if (lower.includes('snow')) return 'snowy';
  if (lower.includes('thunder') || lower.includes('storm')) return 'stormy';
  if (lower.includes('fog') || lower.includes('mist')) return 'foggy';
  if (lower.includes('wind')) return 'windy';
  return 'sunny';
}

async function fetchWeatherFromSerper(
  location: string,
  serperApiKey: string
): Promise<WeatherData> {
  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': serperApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: `weather ${location}`,
      num: 1,
    }),
  });

  if (!response.ok) {
    throw new Error(`Serper API error: ${response.status}`);
  }

  const data = await response.json();
  const answerBox = data.answerBox || {};
  const knowledgeGraph = data.knowledgeGraph || {};

  let temperature = 72;
  let condition = 'Sunny';

  if (answerBox.temperature) {
    const tempMatch = answerBox.temperature.match(/(\d+)/);
    if (tempMatch) temperature = parseInt(tempMatch[1]);
  }

  if (answerBox.weather) {
    condition = answerBox.weather;
  } else if (knowledgeGraph.description) {
    condition = knowledgeGraph.description;
  }

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date().getDay();
  const forecast = [];
  for (let i = 1; i <= 3; i++) {
    const dayIndex = (today + i) % 7;
    const variance = Math.floor(Math.random() * 8) - 4;
    forecast.push({
      day: days[dayIndex],
      high: temperature + variance + 2,
      low: temperature + variance - 8,
      condition: condition,
      icon: getWeatherIcon(condition),
    });
  }

  return {
    location: location,
    temperature: temperature,
    feelsLike: temperature - 2,
    condition: condition,
    humidity: 45,
    windSpeed: 8,
    icon: getWeatherIcon(condition),
    forecast: forecast,
    lastUpdated: new Date().toISOString(),
  };
}

function generateFallbackWeather(location: string): WeatherData {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date().getDay();
  const baseTemp = 72;

  return {
    location: location,
    temperature: baseTemp,
    feelsLike: baseTemp - 2,
    condition: 'Partly Cloudy',
    humidity: 45,
    windSpeed: 8,
    icon: 'partly-cloudy',
    forecast: [
      { day: days[(today + 1) % 7], high: 74, low: 62, condition: 'Sunny', icon: 'sunny' },
      { day: days[(today + 2) % 7], high: 71, low: 59, condition: 'Cloudy', icon: 'cloudy' },
      { day: days[(today + 3) % 7], high: 68, low: 56, condition: 'Rainy', icon: 'rainy' },
    ],
    lastUpdated: new Date().toISOString(),
  };
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
    const location = url.searchParams.get('location') || 'San Francisco';
    const cacheKey = `weather:${location.toLowerCase().replace(/\s+/g, '-')}`;

    const cached = await getCachedWeather(supabase, cacheKey);
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

    if (!serperApiKey) {
      const fallbackWeather = generateFallbackWeather(location);
      await cacheWeather(supabase, cacheKey, fallbackWeather);

      return new Response(
        JSON.stringify({
          success: true,
          data: fallbackWeather,
          cached: false,
          fallback: true,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const weather = await fetchWeatherFromSerper(location, serperApiKey);
    await cacheWeather(supabase, cacheKey, weather);

    return new Response(
      JSON.stringify({
        success: true,
        data: weather,
        cached: false,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching weather:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
