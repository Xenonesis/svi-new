"use client";

import { memo, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };

interface Location {
  lat: number;
  lng: number;
}

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

const MarkerWithInfoWindow = memo(function MarkerWithInfoWindow({ project, onProjectClick }: { project: Project, onProjectClick: (project: Project) => void }) {
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
          <div className="p-2 max-w-xs font-sans">
             <div className="font-bold text-gray-900 mb-1">{project.title}</div>
             <div className="text-xs text-gray-500 mb-2">{project.location}</div>
             <img src={project.img + '&fm=webp'} alt={project.title} loading="lazy" decoding="async" className="w-full h-24 object-cover rounded-sm mb-2" />
             <div className="flex justify-between items-center mt-2">
                <span className="text-[10px] uppercase font-bold text-gray-400">{project.type}</span>
                <button
                  onClick={() => onProjectClick(project)}
                  className="text-xs bg-[#1a2744] hover:bg-[#c9a84c] text-[#c9a84c] hover:text-[#1a2744] px-3 py-1 transition-colors uppercase tracking-wider font-bold rounded-sm border border-[#1a2744]"
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
      <div className="flex flex-col items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center p-8">
        <h3 className="text-xl font-serif text-brand-navy dark:text-gray-100 mb-4">Interactive Map Unavailable</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md mx-auto mb-4">
          Google Maps API Key is required to view project locations on the map.
        </p>
        <div className="bg-white dark:bg-gray-900 p-4 rounded text-left text-xs text-gray-600 dark:text-gray-400 max-w-md w-full border border-gray-200 dark:border-gray-700">
           <p className="mb-2"><strong>To setup mapping:</strong></p>
           <ol className="list-decimal list-inside space-y-1">
             <li>Open Settings (⚙️ top-right)</li>
             <li>Go to Secrets</li>
             <li>Add <code className="bg-gray-100 dark:bg-gray-800 px-1">GOOGLE_MAPS_PLATFORM_KEY</code></li>
           </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[500px] w-full border border-gray-200 dark:border-gray-700 shadow-md">
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
