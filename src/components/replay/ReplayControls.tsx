'use client';

import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Scissors, 
  RotateCcw, 
  Gauge, 
  Compass, 
  Sliders, 
  HelpCircle,
  Calendar,
  Zap,
  ChevronDown
} from 'lucide-react';
import { SpeedMultiplier, SessionJumpPoint } from '../../types/replay';

interface ReplayControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepForward: () => void;
  speed: SpeedMultiplier;
  onChangeSpeed: (speed: SpeedMultiplier) => void;
  isScissorsActive: boolean;
  onToggleScissors: () => void;
  onReset: () => void;
  visibleIndex: number;
  totalCandles: number;
  onScrub: (index: number) => void;
  jumpPoints: SessionJumpPoint[];
  onJumpToSession: (index: number) => void;
}

export default function ReplayControls({
  isPlaying,
  onTogglePlay,
  onStepForward,
  speed,
  onChangeSpeed,
  isScissorsActive,
  onToggleScissors,
  onReset,
  visibleIndex,
  totalCandles,
  onScrub,
  jumpPoints,
  onJumpToSession
}: ReplayControlsProps) {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showJumpMenu, setShowJumpMenu] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const speeds: SpeedMultiplier[] = [0.5, 1, 2, 3, 5, 10];
  const progressPct = totalCandles > 0 ? ((visibleIndex + 1) / totalCandles) * 100 : 0;

  return (
    <div className="relative z-30">
      {/* Floating Glassmorphic Replay Dock */}
      <div className="bg-white/95 dark:bg-[#1A1A1A]/95 backdrop-blur-xl border border-gray-200 dark:border-[#2A2A2A] rounded-2xl p-3 sm:px-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-gray-900 dark:text-neutral-100 transition-colors">
        
        {/* Left Section: Playback Controls (Play, Step, Speed, Cut Tool) */}
        <div className="flex items-center gap-2">
          
          {/* Play / Pause Primary Button */}
          <button
            type="button"
            onClick={onTogglePlay}
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all cursor-pointer font-bold ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-xs animate-pulse'
                : 'bg-[#2563EB] hover:bg-blue-600 text-white shadow-xs'
            }`}
            title={isPlaying ? 'Pause Replay (Space)' : 'Play Replay (Space)'}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          {/* Step 1 Bar Forward */}
          <button
            type="button"
            onClick={onStepForward}
            disabled={isPlaying || visibleIndex >= totalCandles - 1}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-gray-50 dark:bg-neutral-800/80 hover:bg-gray-100 dark:hover:bg-neutral-700 disabled:opacity-40 disabled:hover:bg-gray-50 dark:disabled:hover:bg-neutral-800/80 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white transition-all cursor-pointer"
            title="Step Forward 1 Bar (Right Arrow)"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <div className="h-6 w-[1px] bg-gray-200 dark:bg-neutral-700 mx-1 hidden sm:block" />

          {/* Speed Multiplier Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowSpeedMenu(!showSpeedMenu);
                setShowJumpMenu(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gray-50 dark:bg-neutral-800/80 hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-200 dark:border-neutral-700 text-xs font-mono font-bold text-gray-700 dark:text-neutral-300 transition-all cursor-pointer"
              title="Replay Speed"
            >
              <Gauge className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{speed}x</span>
              <ChevronDown className="w-3 h-3 text-gray-500 dark:text-neutral-400" />
            </button>

            {/* Speed Selector Dropdown */}
            {showSpeedMenu && (
              <div className="absolute left-0 bottom-full mb-2 w-28 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-700 rounded-xl p-1 shadow-xl z-50 flex flex-col gap-0.5 font-mono text-xs animate-in fade-in slide-in-from-bottom-2">
                <div className="px-2 py-1 text-[10px] text-gray-400 dark:text-neutral-500 font-sans capitalize font-bold">Speed</div>
                {speeds.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      onChangeSpeed(s);
                      setShowSpeedMenu(false);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                      speed === s ? 'bg-blue-600 text-white font-bold' : 'text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <span>{s}x</span>
                    {speed === s && <span className="text-[10px]">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Scissors Cut Tool Toggle */}
          <button
            type="button"
            onClick={onToggleScissors}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
              isScissorsActive
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 shadow-2xs'
                : 'bg-gray-50 dark:bg-neutral-800/80 hover:bg-gray-100 dark:hover:bg-neutral-700 border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white'
            }`}
            title="Scissors / Cut Tool: Click bar to truncate history (C)"
          >
            <Scissors className={`w-3.5 h-3.5 ${isScissorsActive ? 'text-amber-600 dark:text-amber-400 rotate-90 animate-pulse' : 'text-gray-500 dark:text-neutral-400'}`} />
            <span className="hidden md:inline">{isScissorsActive ? 'Cut Active' : 'Cut Bar'}</span>
          </button>

          {/* Jump to Setup / Session Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowJumpMenu(!showJumpMenu);
                setShowSpeedMenu(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gray-50 dark:bg-neutral-800/80 hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-200 dark:border-neutral-700 text-xs font-mono text-gray-700 dark:text-neutral-300 transition-all cursor-pointer"
              title="Jump to Session / High Volatility Anchor"
            >
              <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden lg:inline">Jump Session</span>
              <ChevronDown className="w-3 h-3 text-gray-500 dark:text-neutral-400" />
            </button>

            {/* Jump Menu Dropdown */}
            {showJumpMenu && (
              <div className="absolute left-0 bottom-full mb-2 w-72 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-700 rounded-xl p-2 shadow-xl z-50 flex flex-col gap-1 text-xs animate-in fade-in slide-in-from-bottom-2">
                <div className="px-2 py-1 text-[10px] text-gray-400 dark:text-neutral-500 font-sans capitalize font-bold border-b border-gray-100 dark:border-neutral-800 mb-1">
                  Institutional Setup Anchors
                </div>
                {jumpPoints.map((jp) => (
                  <button
                    key={jp.id}
                    type="button"
                    onClick={() => {
                      onJumpToSession(jp.index);
                      setShowJumpMenu(false);
                    }}
                    className="flex flex-col text-left p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between font-bold text-gray-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      <span>{jp.title}</span>
                      <span className="text-[10px] font-mono text-gray-400 dark:text-neutral-500">{jp.timeStr}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-neutral-400 line-clamp-1 mt-0.5">{jp.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center Section: Progress Scrubber Slider */}
        <div className="flex-1 min-w-[200px] max-w-xl mx-2 flex items-center gap-3">
          <span className="text-[11px] font-mono text-gray-500 dark:text-neutral-400 whitespace-nowrap">
            Bar {visibleIndex + 1}/{totalCandles}
          </span>
          <div className="flex-1 relative flex items-center">
            <input
              type="range"
              min={0}
              max={Math.max(0, totalCandles - 1)}
              value={visibleIndex}
              onChange={(e) => onScrub(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-gray-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
            />
          </div>
          <span className="text-[10px] font-mono text-[#2563EB] dark:text-blue-400 font-bold">
            {progressPct.toFixed(0)}%
          </span>
        </div>

        {/* Right Section: Reset Replay & Keyboard Shortcuts Helper */}
        <div className="flex items-center gap-2">
          
          {/* Reset Live Replay */}
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-neutral-800/80 hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-200 dark:border-neutral-700 text-xs font-mono text-gray-700 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white transition-all cursor-pointer"
            title="Restore back to live end of chart (R)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span className="hidden sm:inline">Reset Live</span>
          </button>

          {/* Keyboard Shortcuts Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowShortcuts(!showShortcuts)}
              className="p-1.5 rounded-xl bg-gray-50 dark:bg-neutral-800/80 hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-200 dark:border-neutral-700 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-all cursor-pointer"
              title="Keyboard Shortcuts"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Shortcuts Modal Popover */}
            {showShortcuts && (
              <div className="absolute right-0 bottom-full mb-2 w-64 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-700 rounded-2xl p-3 shadow-xl z-50 text-xs font-mono space-y-2 animate-in fade-in slide-in-from-bottom-2">
                <div className="text-[11px] font-bold text-gray-900 dark:text-white font-sans capitalize pb-1 border-b border-gray-100 dark:border-neutral-800">
                  Keyboard Shortcuts
                </div>
                <div className="flex items-center justify-between text-gray-700 dark:text-neutral-300">
                  <span className="text-gray-500 dark:text-neutral-400">Play / Pause:</span>
                  <kbd className="px-2 py-0.5 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded text-[10px] text-blue-600 dark:text-blue-400 font-bold">Space</kbd>
                </div>
                <div className="flex items-center justify-between text-gray-700 dark:text-neutral-300">
                  <span className="text-gray-500 dark:text-neutral-400">Step 1 Bar:</span>
                  <kbd className="px-2 py-0.5 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded text-[10px] text-blue-600 dark:text-blue-400 font-bold">→</kbd>
                </div>
                <div className="flex items-center justify-between text-gray-700 dark:text-neutral-300">
                  <span className="text-gray-500 dark:text-neutral-400">Cut Tool:</span>
                  <kbd className="px-2 py-0.5 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded text-[10px] text-amber-600 dark:text-amber-400 font-bold">C</kbd>
                </div>
                <div className="flex items-center justify-between text-gray-700 dark:text-neutral-300">
                  <span className="text-gray-500 dark:text-neutral-400">Reset Replay:</span>
                  <kbd className="px-2 py-0.5 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded text-[10px] text-rose-600 dark:text-rose-400 font-bold">R</kbd>
                </div>
                <div className="flex items-center justify-between text-gray-700 dark:text-neutral-300">
                  <span className="text-gray-500 dark:text-neutral-400">Quick Buy:</span>
                  <kbd className="px-2 py-0.5 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">B</kbd>
                </div>
                <div className="flex items-center justify-between text-gray-700 dark:text-neutral-300">
                  <span className="text-gray-500 dark:text-neutral-400">Quick Sell:</span>
                  <kbd className="px-2 py-0.5 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded text-[10px] text-rose-600 dark:text-rose-400 font-bold">S</kbd>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
