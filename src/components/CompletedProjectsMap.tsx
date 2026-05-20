'use client';

import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map,
  Pin,
  useAdvancedMarkerRef,
} from '@vis.gl/react-google-maps';
import { memo, useState } from 'react';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };

// interface Location {
//   lat: number;
//   lng: number;
// }

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

const MarkerWithInfoWindow = memo(function MarkerWithInfoWindow({
  project,
  onProjectClick,
}: {
  project: Project;
  onProjectClick: (project: Project) => void;
}) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [open, setOpen] = useState(false);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: project.lat, lng: project.lng }}
        onClick={() => setOpen(true)}
      >
        <Pin background="#1a2744" borderColor="#c9a84c" glyphColor="#c9a84c" />
      </AdvancedMarker>
      {open && (
        <InfoWindow anchor={marker} onCloseClick={() => setOpen(false)}>
          <div className="max-w-xs p-2 font-sans">
            <div className="mb-1 font-bold text-gray-900">{project.title}</div>
            <div className="mb-2 text-xs text-gray-500">{project.location}</div>
            <img
              src={project.img}
              alt={project.title}
              loading="lazy"
              decoding="async"
              className="mb-2 h-24 w-full rounded-sm object-cover"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase">{project.type}</span>
              <button
                onClick={() => onProjectClick(project)}
                className="rounded-sm border border-[#1a2744] bg-[#1a2744] px-3 py-1 text-xs font-bold tracking-wider text-[#c9a84c] uppercase transition-colors hover:bg-[#c9a84c] hover:text-[#1a2744]"
              >
                Details
              </button>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
});

export default function CompletedProjectsMap({ projects, onProjectClick }: Props) {
  if (!hasValidKey) {
    return (
      <div className="flex h-96 flex-col items-center justify-center border border-gray-200 bg-gray-100 p-8 text-center dark:border-gray-700 dark:bg-gray-800">
        <h3 className="text-brand-navy mb-4 font-serif text-xl dark:text-gray-100">
          Interactive Map Unavailable
        </h3>
        <p className="mx-auto mb-4 max-w-md text-sm text-gray-600 dark:text-gray-400">
          Google Maps API Key is required to view project locations on the map.
        </p>
        <div className="w-full max-w-md rounded border border-gray-200 bg-white p-4 text-left text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
          <p className="mb-2">
            <strong>To setup mapping:</strong>
          </p>
          <ol className="list-inside list-decimal space-y-1">
            <li>Open Settings (⚙️ top-right)</li>
            <li>Go to Secrets</li>
            <li>
              Add{' '}
              <code className="bg-gray-100 px-1 dark:bg-gray-800">GOOGLE_MAPS_PLATFORM_KEY</code>
            </li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[500px] w-full border border-gray-200 shadow-md dark:border-gray-700">
      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
          defaultCenter={{ lat: 26.9124, lng: 75.7873 }}
          defaultZoom={9}
          mapId="SVI_PROJECTS_MAP"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={MAP_CONTAINER_STYLE}
          gestureHandling="greedy"
        >
          {projects.map((project) => (
            <MarkerWithInfoWindow
              key={project.id}
              project={project}
              onProjectClick={onProjectClick}
            />
          ))}
        </Map>
      </APIProvider>
    </div>
  );
}
