import type { StyleSpecification } from 'maplibre-gl';

export const ALMATY_CENTER = {
  lat: 43.238949,
  lng: 76.889709,
};

export const OSM_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['/api/map-tiles/{z}/{x}/{y}'],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
      paint: {
        'raster-saturation': -0.38,
        'raster-brightness-min': 0.08,
        'raster-brightness-max': 0.86,
        'raster-contrast': 0.18,
      },
    },
  ],
};
