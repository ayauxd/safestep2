
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useRef } from 'react';
import { RouteDetails } from '../types';

declare const L: any;

interface Props {
  route: RouteDetails | null;
}

const MapBackground: React.FC<Props> = ({ route }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Initialize Leaflet Map
    mapInstanceRef.current = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false
    }).setView([34.0522, -118.2437], 13);

    // Use CartoDB Dark Matter tiles for a tactical obsidian look
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(mapInstanceRef.current);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (route && mapInstanceRef.current) {
        // In a background map, we just pan to center or fit bounds if we have the route
        // For the background, we'll just keep it subtle.
        // We could fetch the route here, but mostly we want it to look tactical.
    }
  }, [route]);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full opacity-40 scale-105" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050A10] via-transparent to-[#050A10]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050A10] via-transparent to-[#050A10]" />
    </div>
  );
};

export default MapBackground;
