import { BadGatewayException, Injectable } from '@nestjs/common';

type TileProvider = {
  name: string;
  template: string;
};

type TilePayload = {
  provider: string;
  body: Buffer;
  contentType: string;
  cacheControl: string | null;
};

const TILE_PROVIDERS: TileProvider[] = [
  {
    name: 'osm-main',
    template: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  },
  {
    name: 'osm-fr-hot-a',
    template: 'https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
  },
  {
    name: 'osm-fr-hot-b',
    template: 'https://b.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
  },
  {
    name: 'osm-fr-hot-c',
    template: 'https://c.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
  },
];

@Injectable()
export class MapTilesService {
  async fetchTile(z: number, x: number, y: number): Promise<TilePayload> {
    const startIndex = Math.abs((x * 17 + y * 31 + z) % TILE_PROVIDERS.length);
    const providers = TILE_PROVIDERS.slice(startIndex).concat(
      TILE_PROVIDERS.slice(0, startIndex),
    );

    for (const provider of providers) {
      const payload = await this.tryFetchFromProvider(provider, z, x, y);
      if (payload) {
        return payload;
      }
    }

    throw new BadGatewayException('Failed to fetch map tile');
  }

  private async tryFetchFromProvider(
    provider: TileProvider,
    z: number,
    x: number,
    y: number,
  ): Promise<TilePayload | null> {
    const url = provider.template
      .replace('{z}', String(z))
      .replace('{x}', String(x))
      .replace('{y}', String(y));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'user-agent': 'SpotWaveTileProxy/1.0 (+https://spotwave.local)',
          accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        },
      });

      if (!response.ok) {
        return null;
      }

      const contentType =
        response.headers.get('content-type')?.split(';')[0]?.trim() ||
        'image/png';
      if (!contentType.startsWith('image/')) {
        return null;
      }

      const body = Buffer.from(await response.arrayBuffer());
      const cacheControl = response.headers.get('cache-control');

      return {
        provider: provider.name,
        body,
        contentType,
        cacheControl,
      };
    } catch {
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
