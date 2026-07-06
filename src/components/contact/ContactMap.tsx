'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Layers, Navigation, X } from 'lucide-react';
import {
  fetchNearbyPlaces,
  getCategoryInfo,
  PLACE_CATEGORIES,
  type NearbyPlace,
} from '@/src/lib/nearby-places';

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
  const [showInfoCard, setShowInfoCard] = useState(true);

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
              tiles: ['/api/map-tiles/{z}/{x}/{y}'],
              tileSize: 256,
              maxzoom: 19,
              attribution:
                '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            },
          },
          layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
        },
        center: [OFFICE_LOCATION.lng, OFFICE_LOCATION.lat],
        zoom: 15,
      });

      // Custom styled navigation control
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

      // Premium pulse marker
      const el = document.createElement('div');
      el.innerHTML = `
        <div style="position:relative;width:48px;height:48px;display:flex;align-items:center;justify-content:center;">
          <div style="
            position:absolute;inset:0;border-radius:50%;
            background:rgba(212,175,55,0.2);
            animation:pulse-ring 2.5s cubic-bezier(0.4,0,0.6,1) infinite;
          "></div>
          <div style="
            position:absolute;inset:6px;border-radius:50%;
            background:rgba(212,175,55,0.12);
            animation:pulse-ring 2.5s cubic-bezier(0.4,0,0.6,1) infinite;
            animation-delay:0.4s;
          "></div>
          <div style="
            position:relative;width:20px;height:20px;border-radius:50%;
            background:#d4af37;
            border:3px solid white;
            box-shadow:0 2px 12px rgba(212,175,55,0.6);
          "></div>
        </div>
        <style>
          @keyframes pulse-ring{0%{transform:scale(0.85);opacity:0.8}70%{transform:scale(1.4);opacity:0}100%{transform:scale(1.4);opacity:0}}
        </style>
      `;
      el.style.cssText = 'width:48px;height:48px;cursor:pointer;';

      new maplibregl.Marker({ element: el })
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
            width:12px;height:12px;
            background:${cat.color};
            border:2.5px solid white;
            border-radius:50%;
            cursor:pointer;
            box-shadow:0 2px 6px rgba(0,0,0,0.25);
            transition:transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
          `;

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([place.lng, place.lat])
            .addTo(mapRef.current!);

          const popupEl = document.createElement('div');
          popupEl.style.cssText =
            'padding:10px 12px;font-family:system-ui,sans-serif;min-width:160px;';
          popupEl.innerHTML = `
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
              <span style="width:8px;height:8px;border-radius:50%;background:${cat.color};flex-shrink:0;"></span>
              <span style="font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#9ca3af;">${cat.label}</span>
            </div>
            <div style="font-size:13px;font-weight:600;color:#111827;line-height:1.3;">${place.name}</div>
            ${place.distance ? `<div style="font-size:11px;color:#6b7280;margin-top:4px;">${place.distance}m away</div>` : ''}
          `;

          const popup = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 14,
            maxWidth: '220px',
          }).setDOMContent(popupEl);

          el.addEventListener('mouseenter', () => {
            el.style.transform = 'scale(1.8)';
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

  const handleDirections = () => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${OFFICE_LOCATION.lat},${OFFICE_LOCATION.lng}`,
      '_blank'
    );
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white shadow-[0_4px_32px_rgba(0,0,0,0.08)] ring-1 ring-black/5 dark:bg-gray-900 dark:ring-white/10">
      {/* Map container */}
      <div
        ref={mapContainerRef}
        className="h-[360px] w-full md:h-[460px]"
        style={{ filter: 'contrast(1.02) saturate(0.95)' }}
      />

      {/* Top controls bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3 md:p-4">
        {/* Left: Nearby toggle */}
        <button
          onClick={() => setShowNearby((v) => !v)}
          className={`pointer-events-auto flex items-center gap-2 rounded-full px-3.5 py-2 text-[11px] font-bold tracking-wider uppercase shadow-lg backdrop-blur-md transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95 ${
            showNearby
              ? 'bg-[#1a2744] text-[#d4af37] shadow-[#1a2744]/30'
              : 'bg-white/90 text-gray-600 hover:bg-white hover:shadow-xl dark:bg-gray-900/90 dark:text-gray-300 dark:hover:bg-gray-900'
          }`}
        >
          <Layers size={13} strokeWidth={2} />
          {loadingPlaces ? (
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#d4af37]" />
              Loading…
            </span>
          ) : showNearby ? (
            'Hide Nearby'
          ) : (
            'Nearby Places'
          )}
        </button>

        {/* Right: Directions button */}
        <button
          onClick={handleDirections}
          className="pointer-events-auto flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-2 text-[11px] font-bold tracking-wider text-gray-600 uppercase shadow-lg backdrop-blur-md transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white hover:shadow-xl active:scale-95 dark:bg-gray-900/90 dark:text-gray-300 dark:hover:bg-gray-900"
        >
          <Navigation size={13} strokeWidth={2} />
          Directions
        </button>
      </div>

      {/* Bottom: Category legend when nearby active */}
      {showNearby && !loadingPlaces && nearbyPlaces.length > 0 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 px-3 py-3 md:px-4">
          <div className="pointer-events-auto flex flex-wrap items-center gap-2 rounded-xl bg-white/90 p-2.5 shadow-lg backdrop-blur-md dark:bg-gray-900/90">
            <span className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">
              {nearbyPlaces.length} places ·
            </span>
            {PLACE_CATEGORIES.filter((c) => nearbyPlaces.some((p) => p.category === c.id)).map(
              (c) => (
                <span
                  key={c.id}
                  className="flex items-center gap-1 text-[9px] font-semibold text-gray-500"
                >
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: c.color }}
                  />
                  {c.label}
                </span>
              )
            )}
          </div>
        </div>
      )}

      {/* Floating office info card */}
      {showInfoCard && (
        <div className="pointer-events-none absolute right-3 bottom-4 left-3 md:top-1/2 md:right-auto md:bottom-5 md:left-5 md:left-auto md:w-[230px] md:-translate-y-1/2">
          <div className="pointer-events-auto overflow-hidden rounded-xl bg-white/95 p-0.5 shadow-[0_8px_32px_rgba(0,0,0,0.18)] ring-1 ring-black/8 backdrop-blur-xl dark:bg-gray-900/95 dark:ring-white/10">
            <div className="rounded-[10px] bg-[#1a2744] p-3.5">
              {/* Close button */}
              <button
                onClick={() => setShowInfoCard(false)}
                className="absolute top-2.5 right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white/60 transition-colors hover:bg-white/20 hover:text-white"
                aria-label="Close info card"
              >
                <X size={10} strokeWidth={2.5} />
              </button>

              {/* Gold pin icon */}
              <div className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#d4af37]/15">
                <MapPin size={14} className="text-[#d4af37]" strokeWidth={2} />
              </div>

              <p className="mb-0.5 text-[9px] font-bold tracking-[0.2em] text-[#d4af37] uppercase">
                Our Office
              </p>
              <p className="text-sm leading-snug font-semibold text-white">SVI Infra Solutions</p>
              <p className="mt-1 text-[11px] leading-relaxed text-white/60">
                A-61 Sector 65, Noida
                <br />
                UP — 201309
              </p>

              <div className="mt-3 border-t border-white/10 pt-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold tracking-widest text-white/40 uppercase">
                    Status
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Open Now
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
