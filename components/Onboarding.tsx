
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowRight, Crosshair, FastForward, Activity, Radio, Target } from 'lucide-react';

interface Props {
  onComplete: () => void;
  images: string[];
}

const slides = [
  {
    tag: "PROTOCOL_01",
    title: "AI GUARDIAN OVERWATCH",
    desc: "SafeStep isn't just a map. It's an active AI Guardian that tracks your progress through high-risk urban environments with 360° awareness.",
    icon: Shield,
    color: "text-safety",
    image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=1200&auto=format&fit=crop" // Runner in city with dramatic scale
  },
  {
    tag: "PROTOCOL_02",
    title: "TACTICAL VOICE COACHING",
    desc: "Receive elite performance and safety instructions in your ear. Real-time pathfinding adapted to your intensity and surroundings.",
    icon: Radio,
    color: "text-vitality",
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1200&auto=format&fit=crop" // Focused sprint / technical focus
  },
  {
    tag: "PROTOCOL_03",
    title: "MISSION PERFORMANCE",
    desc: "Integrated biometrics and environmental data feeds. SafeStep synchronizes your vitals with the city's pulse for peak performance.",
    icon: Target,
    color: "text-alert",
    image: "https://images.unsplash.com/photo-1594882645126-14020914d58d?q=80&w=1200&auto=format&fit=crop" // Close-up grit / sprinting
  }
];

const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const next = () => {
    if (step < slides.length - 1) setStep(step + 1);
    else onComplete();
  };

  const current = slides[step];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-obsidian flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Dynamic Background Image Layer */}
      <AnimatePresence mode="wait">
        <motion.div 
            key={step}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.3, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 bg-cover bg-center grayscale brightness-75 contrast-125"
            style={{ backgroundImage: `url(${current.image})` }}
        />
      </AnimatePresence>

      {/* Global HUD Layer */}
      <div className="absolute inset-0 hud-grid opacity-20 pointer-events-none" />
      <div className="scan-line" />
      <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/5 pointer-events-none" />
      <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/5 pointer-events-none" />

      {/* Top Brand Header */}
      <div className="absolute top-10 left-0 right-0 px-10 flex justify-between items-center z-50">
        <div className="flex flex-col">
            <span className="text-display text-4xl font-black tracking-tighter italic-slant text-white leading-none">SAFESTEP</span>
            <span className="text-[10px] font-mono text-safety tracking-[0.5em] font-bold">TACTICAL_OS_V2.5</span>
        </div>
        <button 
          onClick={onComplete}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-all text-[11px] font-mono uppercase tracking-[0.2em] bg-white/5 px-5 py-2.5 rounded-full border border-white/10"
        >
          Skip Mission Setup <FastForward size={14} />
        </button>
      </div>

      {/* Main Content Carousel */}
      <div className="relative z-10 w-full max-w-7xl px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="hidden lg:block">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="aspect-[4/5] rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl relative"
                >
                    <img src={current.image} className="w-full h-full object-cover grayscale brightness-110 contrast-125" />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian to-transparent opacity-80" />
                    <div className="absolute bottom-10 left-10 flex items-center gap-4">
                        <div className="w-2 h-2 bg-safety rounded-full animate-pulse" />
                        <span className="text-display text-2xl text-white tracking-widest italic-slant">OVERWATCH_ACTIVE</span>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>

        <div className="flex flex-col space-y-8">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    className="space-y-6"
                >
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
                        <Crosshair size={14} className={current.color} />
                        <span className={`text-[11px] font-mono font-bold tracking-widest ${current.color}`}>{current.tag}</span>
                    </div>
                    
                    <h2 className="text-display text-7xl md:text-9xl font-black italic-slant text-white leading-[0.8] tracking-tighter uppercase">
                        {current.title.split(' ').map((word, i) => (
                            <React.Fragment key={i}>
                                {word}<br/>
                            </React.Fragment>
                        ))}
                    </h2>
                    
                    <p className="text-slate-400 text-xl md:text-2xl font-medium leading-snug max-w-xl">
                        {current.desc}
                    </p>
                </motion.div>
            </AnimatePresence>

            {/* Navigation / Progress */}
            <div className="flex flex-col gap-10 mt-12">
                <div className="flex gap-4">
                    {slides.map((_, i) => (
                        <div 
                        key={i} 
                        className={`h-2 rounded-full transition-all duration-700 ${i === step ? 'w-32 bg-safety shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'w-6 bg-white/10'}`} 
                        />
                    ))}
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={next}
                    className="group relative w-full lg:w-96 h-24 bg-white text-black rounded-[2.5rem] overflow-hidden shadow-2xl transition-transform"
                >
                    <div className="absolute inset-0 bg-safety opacity-0 group-hover:opacity-10 transition-opacity" />
                    <div className="relative z-10 flex items-center justify-between px-10">
                        <span className="text-display text-4xl font-black italic-slant uppercase tracking-tight">
                            {step === slides.length - 1 ? "Start Mission" : "Next Protocol"}
                        </span>
                        <ArrowRight size={32} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
                    </div>
                </motion.button>
            </div>
        </div>
      </div>

      {/* Decorative Bottom Stats */}
      <div className="absolute bottom-10 left-10 hidden md:block">
        <div className="flex gap-10">
            <div className="space-y-1">
                <div className="text-[10px] font-mono text-slate-600 tracking-[0.3em] uppercase">Signal_Strength</div>
                <div className="text-white font-mono text-xs">98.4%_LINKED</div>
            </div>
            <div className="space-y-1">
                <div className="text-[10px] font-mono text-slate-600 tracking-[0.3em] uppercase">Active_Nodes</div>
                <div className="text-white font-mono text-xs">4,902_SENSORS</div>
            </div>
        </div>
      </div>

      <div className="absolute bottom-10 right-10 text-[10px] font-mono text-slate-700 uppercase tracking-[0.6em] font-black italic-slant">
        AUTHENTICATED_BY_SAFESTEP_CORE
      </div>
    </motion.div>
  );
};

export default Onboarding;
