
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Shield, Loader2, Heart, Radio, Zap, Wind, Navigation2, User, Crosshair } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SafetyAccompaniment, RouteDetails, GuardianSegment, VitalityStats } from '../types';
import InlineMap from './InlineMap';

interface Props {
  accompaniment: SafetyAccompaniment;
  route: RouteDetails;
  onSegmentChange: (index: number) => void;
  isGenerating: boolean;
  guardianImage: string | null;
}

const GuardianConsole: React.FC<Props> = ({ accompaniment, route, onSegmentChange, isGenerating, guardianImage }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [vitality, setVitality] = useState<VitalityStats>({ bpm: 72, steps: 0, pace: '0\'00"', safetyScore: 98 });
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef(0);
  const offsetRef = useRef(0);
  const indexRef = useRef(currentIdx);

  useEffect(() => { 
    indexRef.current = currentIdx; 
    onSegmentChange(currentIdx); 
  }, [currentIdx]);

  const stop = () => { 
    if (sourceRef.current) { 
      sourceRef.current.onended = null; 
      try { sourceRef.current.stop(); } catch (e) {} 
      sourceRef.current = null; 
    } 
  };

  const play = async (segment: GuardianSegment, offset: number = 0) => {
      if (!segment?.audioBuffer) { setIsBuffering(true); return; }
      try {
          if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
          stop();
          setIsBuffering(false);
          const s = audioContextRef.current.createBufferSource();
          s.buffer = segment.audioBuffer;
          s.connect(audioContextRef.current.destination);
          sourceRef.current = s;
          s.onended = () => {
              const elapsed = audioContextRef.current!.currentTime - startTimeRef.current;
              if (elapsed >= segment.audioBuffer!.duration - 0.5) {
                  const next = indexRef.current + 1;
                  if (accompaniment.segments[next]) { setCurrentIdx(next); play(accompaniment.segments[next], 0); }
                  else { setIsPlaying(false); }
              }
          };
          startTimeRef.current = audioContextRef.current.currentTime - offset;
          s.start(0, offset);
      } catch (err) { setIsPlaying(false); }
  };

  const toggle = () => {
      if (isPlaying) {
          if (audioContextRef.current) offsetRef.current = audioContextRef.current.currentTime - startTimeRef.current;
          stop();
          setIsPlaying(false);
      } else {
          setIsPlaying(true);
          const current = accompaniment.segments[currentIdx];
          if (current) play(current, offsetRef.current);
          else setIsBuffering(true);
      }
  };

  const progress = (currentIdx / accompaniment.totalSegmentsEstimate) * 100;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Heart} label="BPM" value={`${75 + Math.floor(Math.random() * 15)}`} color="text-red-500" />
        <StatCard icon={Zap} label="MISSION_STEPS" value="4,291" color="text-vitality" />
        <StatCard icon={Wind} label="AVG_PACE" value="5'12\" color="text-blue-400" />
        <StatCard icon={Shield} label="THREAT_INDEX" value="SECURE" color="text-safety" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 aspect-[16/10] bg-[#0A1118] rounded-[3rem] overflow-hidden shadow-2xl relative border border-white/10 group">
          <div className="scan-line" />
          <InlineMap route={route} currentSegmentIndex={currentIdx} totalSegments={accompaniment.totalSegmentsEstimate} dark />
          <div className="absolute top-6 left-6 flex items-center gap-3 bg-obsidian/90 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10">
            <Navigation2 size={16} className="text-safety animate-pulse" />
            <span className="text-[10px] font-mono font-black text-white uppercase tracking-[0.3em]">GPS_LOCK_ALPHA</span>
          </div>
          <div className="absolute bottom-6 right-6 flex flex-col items-end">
            <span className="text-display text-4xl text-white/20 italic-slant tracking-tighter">SAFESTEP_HUD</span>
          </div>
        </div>

        <div className="lg:col-span-4 bg-[#0A1118] text-white rounded-[3rem] p-8 md:p-10 border border-white/10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
            <Shield size={160} />
          </div>

          <div className="flex flex-col items-center justify-center flex-1 relative py-10">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-[2rem] overflow-hidden border-2 border-safety/30 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                {guardianImage ? (
                    <img src={guardianImage} className="w-full h-full object-cover grayscale brightness-125" alt="Guardian" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700 bg-white/5">
                        <User size={32} />
                    </div>
                )}
            </div>

            <div className="relative group">
                <svg className="w-56 h-56 -rotate-90">
                    <circle cx="112" cy="112" r="104" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                    <motion.circle 
                        cx="112" cy="112" r="104" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="653.45" 
                        initial={{ strokeDashoffset: 653.45 }}
                        animate={{ strokeDashoffset: 653.45 - (653.45 * progress) / 100 }}
                        className="text-safety"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggle} 
                        className="w-32 h-32 bg-safety rounded-full flex items-center justify-center shadow-[0_0_80px_rgba(59,130,246,0.5)] z-10 transition-transform"
                    >
                        {isPlaying ? <Pause size={48} fill="white" /> : <Play size={48} fill="white" className="ml-2" />}
                    </motion.button>
                </div>
            </div>
          </div>

          <div className="space-y-6">
              <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-vitality animate-pulse shadow-[0_0_10px_#10B981]' : 'bg-slate-700'}`} />
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black">MISSION_OS_ONLINE</span>
                  </div>
                  <h3 className="text-display text-5xl font-black tracking-tighter uppercase italic-slant text-white leading-none">AUDIO_OVERWATCH</h3>
              </div>

              <div className="bg-white/5 rounded-3xl p-6 border border-white/5 min-h-[140px] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-safety opacity-50" />
                <p className="text-sm md:text-base font-medium leading-relaxed text-slate-300 italic">
                    {isBuffering ? (
                        <span className="flex items-center gap-3 text-safety animate-pulse">
                            <Loader2 size={18} className="animate-spin" /> RE-SYNCHRONIZING_SIGNAL...
                        </span>
                    ) : (
                        `"${accompaniment.segments[currentIdx]?.text || "Guardian protocol standby. Stand by for environment ping."}"`
                    )}
                </p>
                <div className="mt-4 flex justify-between items-center text-[9px] font-mono text-slate-600 font-bold tracking-widest">
                    <span>SECTOR_0{currentIdx + 1}</span>
                    <span>PKT_RCV_STABLE</span>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) => (
  <div className="bg-[#0A1118] border border-white/5 p-6 rounded-[2rem] flex flex-col gap-4 relative overflow-hidden group">
    <div className="absolute top-0 right-0 w-12 h-12 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-bl-3xl">
        <Crosshair size={12} className="text-slate-700" />
    </div>
    <div className={`w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={20} />
    </div>
    <div className="space-y-1">
      <p className="text-[10px] text-slate-500 uppercase font-mono tracking-[0.3em] font-black leading-none">{label}</p>
      <p className="text-display text-4xl font-black text-white italic-slant tracking-tighter">{value}</p>
    </div>
  </div>
);

export default GuardianConsole;
