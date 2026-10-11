import * as maplibregl from 'maplibre-gl';

if (typeof window !== 'undefined' && typeof maplibregl.setWorkerUrl === 'function') {
  maplibregl.setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');
}

export default maplibregl;
export * from 'maplibre-gl';
