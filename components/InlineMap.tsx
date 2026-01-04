
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useRef, useState } from 'react';
import { RouteDetails } from '../types';

declare const L: any;

interface Props {
  route: RouteDetails;
  currentSegmentIndex: number;
  totalSegments: number;
  dark?: boolean;
}

const InlineMap: React.FC<Props> = ({ route, currentSegmentIndex, totalSegments, dark }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    mapInstanceRef.current = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([0, 0], 13);

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
    if (!route || !mapInstanceRef.current) return;

    const fetchRoute = async () => {
        try {
            // Geocode start and end using Nominatim
            const geocode = async (addr: string) => {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}&limit=1`);
                const json = await res.json();
                return json[0] ? [parseFloat(json[0].lat), parseFloat(json[0].lon)] : null;
            };

            const start = await geocode(route.startAddress);
            const end = await geocode(route.endAddress);

            if (start && end) {
                // Use OSRM for directions (Open Source Routing Machine)
                const res = await fetch(`https://router.project-osrm.org/route/v1/walking/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`);
                const data = await res.json();
                
                if (data.routes && data.routes[0]) {
                    const coords = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
                    setRouteCoordinates(coords);

                    if (polylineRef.current) polylineRef.current.remove();
                    polylineRef.current = L.polyline(coords, {
                        color: '#3B82F6',
                        weight: 6,
                        opacity: 0.8
                    }).addTo(mapInstanceRef.current);

                    mapInstanceRef.current.fitBounds(polylineRef.current.getBounds(), { padding: [40, 40] });

                    const tacticalIcon = L.divIcon({
                        className: 'tactical-marker-container',
                        html: '<div class="tactical-marker"></div>',
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    });

                    if (markerRef.current) markerRef.current.remove();
                    markerRef.current = L.marker(coords[0], { icon: tacticalIcon }).addTo(mapInstanceRef.current);
                }
            }
        } catch (e) {
            console.error("Leaflet routing failed", e);
        }
    };

    fetchRoute();
  }, [route]);

  useEffect(() => {
    if (!markerRef.current || routeCoordinates.length === 0) return;
    
    const progressRatio = currentSegmentIndex / Math.max(1, totalSegments);
    const coordIndex = Math.min(Math.floor(progressRatio * (routeCoordinates.length - 1)), routeCoordinates.length - 1);
    const newPos = routeCoordinates[coordIndex];
    
    if (newPos) {
        markerRef.current.setLatLng(newPos);
        mapInstanceRef.current.panTo(newPos, { animate: true });
    }
  }, [currentSegmentIndex, totalSegments, routeCoordinates]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
};

export default InlineMap;
