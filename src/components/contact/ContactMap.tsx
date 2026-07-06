'use client';

import { useEffect, useRef, useState } from 'react';
import { Layers } from 'lucide-react';
import { fetchNearbyPlaces, getCategoryInfo, type NearbyPlace } from '@/src/lib/nearby-places';

const OFFICE_LOCATION = { lat: 28.6112, lng: 77.382 };

export default function ContactMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const maplibreglRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [showNearby, setShowNearby] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    let cancelled = false;

    (async () => {
      const maplibregl = await import('maplibre-gl');
      await import('maplibre-gl/dist/maplibre-gl.css');
      if (cancelled || !mapContainerRef.current) return;

      maplibreglRef.current = maplibregl;

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              // Route through our server-side proxy to avoid CORS and cap zoom at 19
              tiles: ['/api/map-tiles/{z}/{x}/{y}'],
              tileSize: 256,
              maxzoom: 19,
              attribution:
                '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            },
          },
          layers: [
            {
              id: 'osm',
              type: 'raster',
              source: 'osm',
            },
          ],
        },
        center: [OFFICE_LOCATION.lng, OFFICE_LOCATION.lat],
        zoom: 14,
      });

      map.addControl(new maplibregl.NavigationControl(), 'top-right');

      new maplibregl.Marker({ color: '#d4af37', scale: 1.3 })
        .setLngLat([OFFICE_LOCATION.lng, OFFICE_LOCATION.lat])
        .addTo(map);

      map.on('load', () => {
        if (!cancelled) setMapLoaded(true);
      });

      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      maplibreglRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !showNearby) {
      markersRef.current.forEach((m: any) => m.remove());
      markersRef.current = [];
      if (!showNearby) setNearbyPlaces([]);
      return;
    }

    setLoadingPlaces(true);
    const controller = new AbortController();

    fetchNearbyPlaces(OFFICE_LOCATION.lat, OFFICE_LOCATION.lng, 1000, controller.signal)
      .then((places) => {
        setNearbyPlaces(places);
        markersRef.current.forEach((m: any) => m.remove());
        markersRef.current = [];

        if (!mapRef.current) return;

        const maplibregl = maplibreglRef.current;
        if (!maplibregl) return;

        places.forEach((place) => {
          const cat = getCategoryInfo(place.category);
          const el = document.createElement('div');
          el.style.cssText = `
            width: 10px; height: 10px;
            background: ${cat.color};
            border: 2px solid white;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          `;
          el.title = place.name;

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([place.lng, place.lat])
            .addTo(mapRef.current!);

          const popup = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 12,
            maxWidth: '220px',
          }).setDOMContent(
            (() => {
              const w = document.createElement('div');
              w.className = 'p-1.5 font-sans';
              w.innerHTML = `
                <div class="flex items-center gap-1 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                  <span style="display:inline-flex;color:${cat.color}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/></svg>
                  </span>
                  ${cat.label}
                </div>
                <div class="font-semibold text-sm text-gray-900 mt-0.5">${place.name}</div>
                ${
                  place.distance
                    ? `<div class="text-[11px] text-gray-500 flex items-center gap-1 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/></svg>
                  ${place.distance}m
                </div>`
                    : ''
                }
              `;
              return w;
            })()
          );

          el.addEventListener('mouseenter', () => {
            el.style.transform = 'scale(1.5)';
            marker.setPopup(popup);
            popup.addTo(mapRef.current!);
          });
          el.addEventListener('mouseleave', () => {
            el.style.transform = 'scale(1)';
            popup.remove();
          });

          markersRef.current.push(marker);
        });
      })
      .catch((err) => {
        if (err.name !== 'AbortError') console.error('Failed to fetch nearby places:', err);
      })
      .finally(() => setLoadingPlaces(false));

    return () => controller.abort();
  }, [mapLoaded, showNearby]);

  return (
    <div className="relative h-[280px] overflow-hidden rounded border border-gray-200 bg-white shadow-sm md:h-[400px] dark:border-gray-700 dark:bg-gray-800">
      <div ref={mapContainerRef} className="h-full w-full" />

      <button
        onClick={() => setShowNearby((v) => !v)}
        className={`absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow backdrop-blur transition-colors ${
          showNearby
            ? 'bg-brand-navy text-brand-gold'
            : 'bg-white/90 text-gray-600 hover:bg-white dark:bg-gray-900/90 dark:text-gray-300'
        }`}
      >
        <Layers size={14} />
        {showNearby ? 'Hide Nearby' : 'Nearby Places'}
      </button>

      {loadingPlaces && (
        <div className="absolute top-12 right-3 z-10 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[10px] text-gray-500 shadow backdrop-blur dark:bg-gray-900/90 dark:text-gray-400">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
          Loading...
        </div>
      )}

      {showNearby && !loadingPlaces && nearbyPlaces.length > 0 && (
        <div className="absolute bottom-3 left-3 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[10px] text-gray-500 shadow backdrop-blur dark:bg-gray-900/90 dark:text-gray-400">
          {nearbyPlaces.length} places nearby
        </div>
      )}
    </div>
  );
}
