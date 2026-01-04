
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { Shield, ArrowRight, Radar, Activity, Zap, Crosshair } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RoutePlanner from './components/RoutePlanner';
import GuardianConsole from './components/GuardianConsole';
import TacticalMap from './components/MapBackground';
import Onboarding from './components/Onboarding';
import { AppState, RouteDetails, SafetyAccompaniment } from './types';
import { generateSafetySegment, generateSegmentAudio, calculateTotalSegments, generateSafetyProtocol, generateTacticalImage } from './services/geminiService';

const ONBOARDING_ASSETS = [
  "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8",
  "https://images.unsplash.com/photo-1552674605-db6ffd4facb5",
  "https://images.unsplash.com/photo-1594882645126-14020914d58d"
];

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.ONBOARDING);
  const [route, setRoute] = useState<RouteDetails | null>(null);
  const [accompaniment, setAccompaniment] = useState<SafetyAccompaniment | null>(null);
  const [guardianImage, setGuardianImage] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const isGeneratingRef = useRef(false);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (!accompaniment || !route || appState < AppState.READY_TO_WALK) return;
    const total = accompaniment.segments.length;
    const bufferTo = currentIdx + 2;
    if (total < bufferTo && total < accompaniment.totalSegmentsEstimate && !isGeneratingRef.current) {
        generateNext(total + 1);
    }
  }, [accompaniment, currentIdx, appState]);

  const generateNext = async (idx: number) => {
    if (!route || !accompaniment || isGeneratingRef.current) return;
    try {
        isGeneratingRef.current = true;
        const beat = accompaniment.protocol[idx - 1] || "Maintain active monitoring.";
        const seg = await generateSafetySegment(route, idx, accompaniment.totalSegmentsEstimate, beat);
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audio = await generateSegmentAudio(seg.text, ctx, route.voiceName);
        await ctx.close();

        setAccompaniment(prev => {
            if (!prev) return null;
            return { 
                ...prev, 
                segments: [...prev.segments, { ...seg, audioBuffer: audio }].sort((a, b) => a.index - b.index) 
            };
        });
    } catch (e) { console.error("Segment generation failed", e); }
    finally { isGeneratingRef.current = false; }
  };

  const handleStart = async (details: RouteDetails) => {
    setRoute(details);
    try {
        setAppState(AppState.INITIALIZING_GUARDIAN);
        
        generateTacticalImage(`A hyper-realistic fitness portrait of a specialized urban running coach named ${details.voiceName}, elite tech gear, athletic intensity, high contrast.`, "1:1")
            .then(setGuardianImage);

        const total = calculateTotalSegments(details.durationSeconds);
        setLoadingMessage("Calibrating Spatial Awareness...");
        const protocol = await generateSafetyProtocol(details, total);
        
        setLoadingMessage("Syncing AI Guardian...");
        const seg1 = await generateSafetySegment(details, 1, total, protocol[0]);
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audio = await generateSegmentAudio(seg1.text, ctx, details.voiceName);
        await ctx.close();

        setAccompaniment({ 
          totalSegmentsEstimate: total, 
          protocol, 
          segments: [{ ...seg1, audioBuffer: audio }] 
        });
        setAppState(AppState.READY_TO_WALK);
    } catch (e) {
        setError("Tactical uplink failed. Please check network connection.");
        setAppState(AppState.PLANNING);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian text-slate-100 relative overflow-x-hidden selection:bg-safety/30 selection:text-white font-sans">
      <TacticalMap route={route} />

      <AnimatePresence mode="wait">
        {appState === AppState.ONBOARDING && (
          <Onboarding 
            images={ONBOARDING_ASSETS}
            onComplete={() => setAppState(AppState.PLANNING)} 
          />
        )}
      </AnimatePresence>

      <main className="relative z-10 max-w-6xl mx-auto px-4 md:px-12 py-12 md:py-24 flex flex-col min-h-screen">
        <AnimatePresence mode="wait">
          {appState === AppState.PLANNING && (
            <motion.header 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-12 md:mb-20"
            >
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-2 h-2 bg-safety rounded-full animate-pulse" />
                    <span className="text-[10px] font-mono font-bold tracking-[0.5em] text-safety uppercase">Uplink_Secure</span>
                </div>
                <h1 className="text-display text-8xl md:text-[12rem] font-black italic-slant tracking-tighter text-white uppercase leading-[0.75]">
                    SAFESTEP<br/><span className="text-safety">TACTICAL.</span>
                </h1>
                <p className="mt-8 text-xl md:text-3xl text-slate-400 max-w-2xl leading-tight font-medium">
                    The elite AI-driven guardian protocol for high-performance urban athletes.
                </p>
            </motion.header>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">
                {appState === AppState.PLANNING && (
                    <div key="planner" className="w-full">
                        <RoutePlanner onRouteFound={handleStart} appState={appState} />
                    </div>
                )}

                {appState === AppState.INITIALIZING_GUARDIAN && (
                    <motion.div 
                      key="loading" 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center space-y-16 text-center py-20"
                    >
                        <div className="relative group">
                          <div className="absolute inset-0 bg-safety/20 blur-[120px] rounded-full scale-150" />
                          <Radar size={160} className="text-safety animate-[spin_6s_linear_infinite] relative z-10" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Crosshair size={48} className="text-white animate-pulse" />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-display text-7xl font-black italic-slant uppercase tracking-tight text-white">{loadingMessage}</h3>
                          <div className="flex items-center justify-center gap-3">
                            <div className="w-1.5 h-1.5 bg-slate-700 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-1.5 h-1.5 bg-slate-700 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-1.5 h-1.5 bg-slate-700 rounded-full animate-bounce" />
                          </div>
                        </div>
                    </motion.div>
                )}

                {appState >= AppState.READY_TO_WALK && accompaniment && route && (
                    <motion.div 
                        key="console" 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full"
                    >
                        <GuardianConsole 
                            accompaniment={accompaniment} 
                            route={route} 
                            onSegmentChange={setCurrentIdx}
                            isGenerating={isGeneratingRef.current}
                            guardianImage={guardianImage}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </main>
      
      {/* HUD Accents */}
      <div className="fixed top-0 bottom-0 right-6 w-px bg-white/5 z-0" />
      <div className="fixed top-0 bottom-0 left-6 w-px bg-white/5 z-0" />
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/p6.png')] z-[999]" />
    </div>
  );
}

export default App;
