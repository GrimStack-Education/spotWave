import { NextRequest } from 'next/server';

type TileProvider = {
  name: string;
  template: string;
};

const TILE_PROVIDERS: TileProvider[] = [
  { name: 'osm-main', template: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' },
  { name: 'osm-fr-hot-a', template: 'https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png' },
  { name: 'osm-fr-hot-b', template: 'https://b.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png' },
  { name: 'osm-fr-hot-c', template: 'https://c.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png' },
];

export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ z: string; x: string; y: string }> },
) {
  const params = await context.params;
  const z = parseTileCoordinate(params.z, 'z');
  const x = parseTileCoordinate(params.x, 'x');
  const y = parseTileCoordinate(params.y, 'y');

  if (z === null || x === null || y === null || z > 22) {
    return new Response('Invalid tile coordinates', { status: 400 });
  }

  const providers = rotateProviders(z, x, y);

  for (const provider of providers) {
    const response = await tryFetchTile(provider, z, x, y);
    if (!response) {
      continue;
    }

    const body = await response.arrayBuffer();
    const headers = new Headers();
    headers.set(
      'Content-Type',
      response.headers.get('content-type')?.split(';')[0] ?? 'image/png',
    );
    headers.set(
      'Cache-Control',
      response.headers.get('cache-control') ??
        'public, max-age=300, stale-while-revalidate=600',
    );
    headers.set('X-Spotwave-Tile-Provider', provider.name);

    return new Response(body, {
      status: 200,
      headers,
    });
  }

  return new Response('Tile provider unavailable', { status: 502 });
}

function parseTileCoordinate(value: string, key: string) {
  if (!/^\d+$/.test(value)) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    return null;
  }

  if (key !== 'z' && parsed > 1_000_000_000) {
    return null;
  }

  return parsed;
}

function rotateProviders(z: number, x: number, y: number) {
  const shift = Math.abs((x * 17 + y * 31 + z) % TILE_PROVIDERS.length);
  return TILE_PROVIDERS.slice(shift).concat(TILE_PROVIDERS.slice(0, shift));
}

async function tryFetchTile(provider: TileProvider, z: number, x: number, y: number) {
  const url = provider.template
    .replace('{z}', String(z))
    .replace('{x}', String(x))
    .replace('{y}', String(y));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6500);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': 'SpotWaveFrontendTileProxy/1.0 (+https://spotwave.local)',
        accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.startsWith('image/')) {
      return null;
    }

    return response;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
