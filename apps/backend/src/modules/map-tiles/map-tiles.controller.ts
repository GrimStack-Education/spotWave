import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Response } from 'express';
import { MapTilesService } from './map-tiles.service';

@Controller('map-tiles')
@SkipThrottle()
export class MapTilesController {
  constructor(private readonly mapTilesService: MapTilesService) {}

  @Get(':z/:x/:y.png')
  async getTile(
    @Param('z') zParam: string,
    @Param('x') xParam: string,
    @Param('y') yParam: string,
    @Res() response: Response,
  ) {
    const z = this.parseInteger(zParam, 'z');
    const x = this.parseInteger(xParam, 'x');
    const y = this.parseInteger(yParam, 'y');

    if (z < 0 || z > 22 || x < 0 || y < 0) {
      throw new BadRequestException('Tile coordinates are out of range');
    }

    const tile = await this.mapTilesService.fetchTile(z, x, y);

    response.setHeader('Content-Type', tile.contentType);
    response.setHeader(
      'Cache-Control',
      tile.cacheControl ?? 'public, max-age=300, stale-while-revalidate=600',
    );
    response.setHeader('X-Spotwave-Tile-Provider', tile.provider);
    response.status(200).send(tile.body);
  }

  private parseInteger(value: string, key: string) {
    if (!/^\d+$/.test(value)) {
      throw new BadRequestException(`Invalid tile parameter: ${key}`);
    }

    const parsed = Number.parseInt(value, 10);
    if (!Number.isSafeInteger(parsed)) {
      throw new BadRequestException(`Invalid tile parameter: ${key}`);
    }

    return parsed;
  }
}
