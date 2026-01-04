
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
/* Added missing ArrowRight icon import */
import { MapPin, Navigation, Loader2, Heart, Shield, Radar, Trophy, Flame, Crosshair, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { RouteDetails, AppState, GuardianStyle } from '../types';

interface Props {
  onRouteFound: (details: RouteDetails) => void;
  appState: AppState;
}

const PROGRAMS: { id: GuardianStyle; label: string; icon: React.ElementType; desc: string; voice: string; accent: string }[] = [
    { id: 'REASSURING', label: 'THE GUARDIAN', icon: Heart, desc: 'Maximum comfort & wellness focused coaching.', voice: 'Kore', accent: 'border-vitality bg-vitality/5 text-vitality' },
    { id: 'SCOUT', label: 'URBAN SCOUT', icon: Radar, desc: 'Tactical navigation for complex city routes.', voice: 'Puck', accent: 'border-safety bg-safety/5 text-safety' },
    { id: 'TACTICAL', label: 'OVERWATCH', icon: Shield, desc: 'High-alert protocols for night journeys.', voice: 'Charon', accent: 'border-alert bg-alert/5 text-alert' },
    { id: 'LOCAL', label: 'THE PACER', icon: Trophy, desc: 'Street-wise guide with fitness pace targets.', voice: 'Fenrir', accent: 'border-amber-500 bg-amber-500/5 text-amber-500' },
];

const RoutePlanner: React.FC<Props> = ({ onRouteFound, appState }) => {
  const [startQuery, setStartQuery] = useState('');
  const [endQuery, setEndQuery] = useState('');
  const [selectedGuardian, setSelectedGuardian] = useState<GuardianStyle>('REASSURING');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    if (!startQuery || !endQuery) { setError("DESTINATION_PARAMS_REQUIRED"); return; }
    setIsLoading(true);
    setError(null);
    try {
        const geocode = async (q: string) => {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`);
            const json = await res.json();
            return json[0] ? { lat: json[0].lat, lon: json[0].lon, display_name: json[0].display_name } : null;
        };
        const start = await geocode(startQuery);
        const end = await geocode(endQuery);
        if (!start || !end) {
            setError("LOCATION_RESOLUTION_FAILURE");
            setIsLoading(false);
            return;
        }
        const routeRes = await fetch(`https://router.project-osrm.org/route/v1/walking/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full`);
        const routeData = await routeRes.json();
        if (routeData.routes?.[0]) {
            const route = routeData.routes[0];
            const program = PROGRAMS.find(g => g.id === selectedGuardian)!;
            onRouteFound({
                startAddress: start.display_name,
                endAddress: end.display_name,
                distance: `${(route.distance / 1000).toFixed(1)} km`,
                duration: `${Math.ceil(route.duration / 60)} min`,
                durationSeconds: Math.ceil(route.duration),
                travelMode: 'WALKING',
                voiceName: program.voice,
                guardianStyle: selectedGuardian
            });
        } else {
            setError("MISSION_DISTANCE_OUT_OF_BOUNDS");
        }
    } catch (e) {
        setError("UPLINK_COMMUNICATION_ERROR");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0A1118]/90 backdrop-blur-3xl p-8 md:p-14 rounded-[4rem] shadow-2xl border border-white/5 space-y-12"
    >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
                <h2 className="text-display text-6xl md:text-8xl font-black italic-slant uppercase tracking-tight text-white leading-none">INITIALIZE MISSION</h2>
                <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.4em] font-bold">Configure_Deployment_Parameters</p>
            </div>
            <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 rounded-full border border-white/10 text-[10px] font-mono text-vitality uppercase tracking-widest font-black">
                <Flame size={14} className="animate-pulse" /> CORE_READY
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5 space-y-8">
                <label className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-[0.5em]">NAV_TARGETS</label>
                <div className="space-y-4">
                    <div className="relative group">
                        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-safety transition-colors" size={20} />
                        <input 
                            value={startQuery}
                            onChange={(e) => setStartQuery(e.target.value)}
                            className="w-full h-20 bg-white/5 border border-white/10 rounded-3xl pl-16 pr-6 outline-none text-white placeholder-slate-800 font-bold focus:border-safety transition-all text-lg" 
                            placeholder="MISSION_ORIGIN" 
                        />
                    </div>
                    <div className="relative group">
                        <Navigation className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-safety transition-colors" size={20} />
                        <input 
                            value={endQuery}
                            onChange={(e) => setEndQuery(e.target.value)}
                            className="w-full h-20 bg-white/5 border border-white/10 rounded-3xl pl-16 pr-6 outline-none text-white placeholder-slate-800 font-bold focus:border-safety transition-all text-lg" 
                            placeholder="FINAL_OBJECTIVE" 
                        />
                    </div>
                </div>
            </div>

            <div className="lg:col-span-7 space-y-8">
                <label className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-[0.5em]">GUARDIAN_SELECTION</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {PROGRAMS.map(g => (
                        <button 
                          key={g.id} 
                          onClick={() => setSelectedGuardian(g.id)} 
                          className={`flex flex-col gap-4 p-6 rounded-[2rem] border-2 transition-all text-left ${selectedGuardian === g.id ? g.accent : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${selectedGuardian === g.id ? 'bg-current text-black' : 'bg-white/10 text-slate-500'}`}>
                                <g.icon size={24} />
                            </div>
                            <div>
                                <div className="text-display text-2xl font-black italic-slant uppercase tracking-tight">{g.label}</div>
                                <div className="text-[11px] font-medium opacity-60 leading-snug mt-1">{g.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {error && (
            <div className="bg-alert/10 text-alert p-6 rounded-3xl text-sm font-black border border-alert/20 flex items-center gap-4">
                <Crosshair size={20} /> ERROR: {error}
            </div>
        )}

        <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStart} 
            disabled={isLoading} 
            className="group relative w-full h-24 bg-white text-black rounded-[2.5rem] overflow-hidden shadow-2xl transition-all disabled:opacity-50"
        >
            <div className="absolute inset-0 bg-safety opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="relative z-10 flex items-center justify-center gap-4">
                {isLoading ? <Loader2 className="animate-spin" size={32} /> : (
                    <>
                        <span className="text-display text-5xl font-black italic-slant uppercase tracking-tighter">INITIATE MISSION PROTOCOL</span>
                        <ArrowRight size={32} strokeWidth={3} className="group-hover:translate-x-3 transition-transform" />
                    </>
                )}
            </div>
        </motion.button>
    </motion.div>
  );
};

export default RoutePlanner;
