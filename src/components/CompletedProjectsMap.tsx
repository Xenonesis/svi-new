'use client';

import { memo, useEffect, useRef, useState, useCallback } from 'react';
import maplibregl, { NavigationControl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  fetchNearbyPlaces,
  getCategoryInfo,
  type NearbyPlace,
  type PlaceCategory,
  PLACE_CATEGORIES,
} from '@/src/lib/nearby-places';
import {
  Layers,
  X,
  UtensilsCrossed,
  HeartPulse,
  GraduationCap,
  Landmark,
  ShoppingBag,
  Train,
  Building2,
  TreePine,
} from 'lucide-react';

const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };

interface Project {
  id: string;
  title: string;
  location: string;
  lat: number;
  lng: number;
  type: string;
  description: string;
  status: string;
  img: string;
  fullDescription?: string;
  gallery?: string[];
  pdf?: boolean;
}

interface Props {
  projects: Project[];
  onProjectClick: (project: Project) => void;
}

// ─── Lucide icon map for categories ──────────────────────────────────────────

const CATEGORY_ICONS: Record<PlaceCategory, string> = {
  food: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.88 4h-2.18a2.15 2.15 0 0 0-1.49.63L3 15.13a2.15 2.15 0 0 0 0 3l3.77 3.77a2.15 2.15 0 0 0 3 0L20.22 9.69a2.15 2.15 0 0 0 .63-1.49V5.88a1.88 1.88 0 0 0-1.88-1.88Z"/><path d="M16.88 4h-2.18a2.15 2.15 0 0 0-1.49.63L3 15.13"/><path d="m13.5 6.5 4 4"/></svg>`,
  health: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
  education: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5Z"/><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"/></svg>`,
  bank: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="4" rx="1"/><path d="M4 10v8"/><path d="M8 10v8"/><path d="M12 10v8"/><path d="M16 10v8"/><path d="M20 10v8"/><path d="M3 20h18"/></svg>`,
  shopping: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  transport: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M15 3v18"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>`,
  tourism: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a6 6 0 0 0-6 6v14"/><path d="M5 16h1a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5"/><path d="M5 22h14"/><path d="M12 6v.01"/></svg>`,
  leisure: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
};

// ─── Lucide React components for legend ──────────────────────────────────────

const LEGEND_ICONS: Record<
  PlaceCategory,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  food: UtensilsCrossed,
  health: HeartPulse,
  education: GraduationCap,
  bank: Landmark,
  shopping: ShoppingBag,
  transport: Train,
  tourism: Building2,
  leisure: TreePine,
};

// ─── Project Marker ──────────────────────────────────────────────────────────

const ProjectMarker = memo(function ProjectMarker({
  project,
  onProjectClick,
  mapInstance,
}: {
  project: Project;
  onProjectClick: (project: Project) => void;
  mapInstance: maplibregl.Map;
}) {
  const markerRef = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    const marker = new maplibregl.Marker({
      color: '#1a2744',
      rotation: 0,
      scale: 1.2,
    })
      .setLngLat([project.lng, project.lat])
      .addTo(mapInstance);

    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 25,
      maxWidth: '280px',
    }).setDOMContent(
      (() => {
        const wrapper = document.createElement('div');
        wrapper.className = 'max-w-xs p-2 font-sans';
        wrapper.innerHTML = `
          <div class="mb-1 font-bold text-gray-900">${project.title}</div>
          <div class="mb-2 text-xs text-gray-500">${project.location}</div>
          ${
            project.img
              ? `<img src="${project.img}" alt="${project.title}" loading="lazy" decoding="async" class="mb-2 h-24 w-full rounded-sm object-cover" />`
              : ''
          }
          <div class="mt-2 flex items-center justify-between">
            <span class="text-[10px] font-bold text-gray-400 uppercase">${project.type}</span>
            <button class="rounded-sm border border-[#1a2744] bg-[#1a2744] px-3 py-1 text-xs font-bold tracking-wider text-[#c9a84c] uppercase transition-colors hover:bg-[#c9a84c] hover:text-[#1a2744]" id="details-btn-${project.id}">
              Details
            </button>
          </div>
        `;
        wrapper
          .querySelector(`#details-btn-${project.id}`)
          ?.addEventListener('click', () => onProjectClick(project));
        return wrapper;
      })()
    );

    marker.setPopup(popup);
    markerRef.current = marker;

    return () => {
      marker.remove();
    };
  }, [project, onProjectClick, mapInstance]);

  return null;
});

// ─── Nearby Place Marker ─────────────────────────────────────────────────────

const NearbyPlaceMarker = memo(function NearbyPlaceMarker({
  place,
  mapInstance,
}: {
  place: NearbyPlace;
  mapInstance: maplibregl.Map;
}) {
  useEffect(() => {
    const cat = getCategoryInfo(place.category);
    const catIconSvg = CATEGORY_ICONS[place.category];

    // Create custom marker element – colored dot
    const el = document.createElement('div');
    el.className = 'nearby-poi-marker';
    el.style.cssText = `
      width: 12px;
      height: 12px;
      background: ${cat.color};
      border: 2px solid white;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 1px 4px rgba(0,0,0,0.3);
      transition: transform 0.15s;
    `;
    el.title = place.name;

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([place.lng, place.lat])
      .addTo(mapInstance);

    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 15,
      maxWidth: '240px',
    }).setDOMContent(
      (() => {
        const w = document.createElement('div');
        w.className = 'p-2 font-sans';
        w.innerHTML = `
          <div class="flex items-center gap-1.5 mb-1.5">
            <span style="display:inline-flex;color:${cat.color}">${catIconSvg}</span>
            <span class="text-[10px] font-bold tracking-wider text-gray-400 uppercase">${cat.label}</span>
          </div>
          <div class="font-semibold text-sm text-gray-900">${place.name}</div>
          <div class="mt-1 text-[11px] text-gray-500 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/></svg>
            ${place.distance ? `${place.distance}m` : ''}
          </div>
        `;
        return w;
      })()
    );

    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.4)';
      marker.setPopup(popup);
      popup.addTo(mapInstance);
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
      popup.remove();
    });

    return () => {
      marker.remove();
    };
  }, [place, mapInstance]);

  return null;
});

// ─── Legend / Toggle Panel ───────────────────────────────────────────────────

function NearbyLegend({
  visibleCategories,
  onToggleCategory,
  onClose,
}: {
  visibleCategories: Set<PlaceCategory>;
  onToggleCategory: (cat: PlaceCategory) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute bottom-4 left-4 z-10 max-w-[200px] rounded-lg border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-gray-500 uppercase">
          <Layers size={14} /> Nearby Places
        </span>
        <button
          onClick={onClose}
          className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
        >
          <X size={14} />
        </button>
      </div>
      <div className="space-y-1">
        {PLACE_CATEGORIES.map((cat) => {
          const active = visibleCategories.has(cat.id);
          const Icon = LEGEND_ICONS[cat.id];
          return (
            <button
              key={cat.id}
              onClick={() => onToggleCategory(cat.id)}
              className={`flex w-full items-center gap-2 rounded px-2 py-1 text-xs transition-colors ${
                active
                  ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  : 'text-gray-400 opacity-50'
              }`}
            >
              <span
                className="flex h-4 w-4 items-center justify-center"
                style={{ color: cat.color }}
              >
                <Icon size={14} />
              </span>
              <span className="truncate">{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function CompletedProjectsMap({ projects, onProjectClick }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [visibleCategories, setVisibleCategories] = useState<Set<PlaceCategory>>(
    new Set(PLACE_CATEGORIES.map((c) => c.id))
  );
  const abortRef = useRef<AbortController | null>(null);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
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
      center: [75.7873, 26.9124],
      zoom: 9,
    });

    map.addControl(new NavigationControl(), 'top-right');

    map.on('load', () => {
      setMapLoaded(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Fetch nearby places for each project
  useEffect(() => {
    if (!mapLoaded || projects.length === 0) return;

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoadingPlaces(true);

    const fetchAll = async () => {
      try {
        const allPlaces: NearbyPlace[] = [];
        const locations = new Map<string, { lat: number; lng: number }>();
        projects.forEach((p) => {
          const key = `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`;
          if (!locations.has(key)) locations.set(key, { lat: p.lat, lng: p.lng });
        });

        for (const loc of locations.values()) {
          if (controller.signal.aborted) break;
          const places = await fetchNearbyPlaces(loc.lat, loc.lng, 2000, controller.signal);
          allPlaces.push(...places);
        }

        const seen = new Set<string>();
        const unique = allPlaces.filter((p) => {
          const key = `${p.name}|${p.lat.toFixed(4)}|${p.lng.toFixed(4)}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        setNearbyPlaces(unique.slice(0, 80));
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Failed to fetch nearby places:', err);
        }
      } finally {
        setLoadingPlaces(false);
      }
    };

    fetchAll();

    return () => controller.abort();
  }, [mapLoaded, projects]);

  const toggleCategory = useCallback((cat: PlaceCategory) => {
    setVisibleCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  const filteredPlaces = nearbyPlaces.filter((p) => visibleCategories.has(p.category));
  const mapInstance = mapRef.current;

  return (
    <div className="relative h-[560px] w-full border border-gray-200 shadow-md dark:border-gray-700">
      {/* Map Container */}
      <div ref={mapContainerRef} style={MAP_CONTAINER_STYLE} />

      {/* Loading indicator */}
      {loadingPlaces && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs text-gray-500 shadow backdrop-blur dark:bg-gray-900/90 dark:text-gray-400">
          <div className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
          Loading nearby places...
        </div>
      )}

      {/* Nearby Places Summary */}
      {!loadingPlaces && nearbyPlaces.length > 0 && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs text-gray-500 shadow backdrop-blur dark:bg-gray-900/90 dark:text-gray-400">
          <Layers size={12} />
          {nearbyPlaces.length} nearby places found
        </div>
      )}

      {/* Toggle Legend Button */}
      {!showLegend && (
        <button
          onClick={() => setShowLegend(true)}
          className="absolute bottom-4 left-4 z-10 rounded-lg border border-gray-200 bg-white/90 px-3 py-2 text-xs font-bold text-gray-600 shadow backdrop-blur hover:bg-white dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-300"
        >
          <Layers size={14} className="mr-1 inline" />
          Show Nearby Places
        </button>
      )}

      {/* Legend Panel */}
      {showLegend && (
        <NearbyLegend
          visibleCategories={visibleCategories}
          onToggleCategory={toggleCategory}
          onClose={() => setShowLegend(false)}
        />
      )}

      {/* Project Markers */}
      {mapInstance &&
        projects.map((project) => (
          <ProjectMarker
            key={project.id}
            project={project}
            onProjectClick={onProjectClick}
            mapInstance={mapInstance}
          />
        ))}

      {/* Nearby Place Markers */}
      {mapInstance &&
        filteredPlaces.map((place) => (
          <NearbyPlaceMarker key={place.id} place={place} mapInstance={mapInstance} />
        ))}
    </div>
  );
}
