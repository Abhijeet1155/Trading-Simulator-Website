'use client';

import React, { useState } from 'react';
import { 
  IndicatorSettings, 
  DEFAULT_INDICATOR_SETTINGS 
} from '../../types/indicators';
import { 
  X, 
  Layers, 
  Eye, 
  EyeOff, 
  Settings2, 
  RotateCcw, 
  Save, 
  Sparkles, 
  Activity, 
  TrendingUp, 
  Clock, 
  Zap, 
  ChevronRight, 
  Sliders 
} from 'lucide-react';

interface IndicatorManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: IndicatorSettings;
  onSave: (newSettings: IndicatorSettings) => void;
  onReset: () => void;
}

type TabType = 'fvg' | 'ob' | 'liquidity' | 'killzones' | 'ema';

export default function IndicatorManagerModal({
  isOpen,
  onClose,
  settings,
  onSave,
  onReset
}: IndicatorManagerModalProps) {
  const [localSettings, setLocalSettings] = useState<IndicatorSettings>(settings);
  const [activeTab, setActiveTab] = useState<TabType>('fvg');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync with prop changes when opened
  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 600);
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_INDICATOR_SETTINGS);
    onReset();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in select-none">
      <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-sans text-gray-900 dark:text-neutral-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-neutral-800 bg-gray-50/80 dark:bg-neutral-900/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center text-[#2563EB] dark:text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Institutional Indicators Suite</h3>
              <p className="text-[11px] text-gray-500 dark:text-neutral-400">Configure ICT / SMC algorithmic overlays & dynamic technical models</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Left Sidebar Tabs + Right Config View */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Navigation Sidebar */}
          <div className="w-56 border-r border-gray-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-900/40 p-2.5 space-y-1 overflow-y-auto">
            
            {/* Tab 1: FVG */}
            <button
              type="button"
              onClick={() => setActiveTab('fvg')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'fvg'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 shadow-xs'
                  : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/70 dark:hover:bg-neutral-800/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${localSettings.fvg.enabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-neutral-600'}`} />
                <span>ICT Fair Value Gaps</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            {/* Tab 2: Order Blocks */}
            <button
              type="button"
              onClick={() => setActiveTab('ob')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'ob'
                  ? 'bg-blue-50 text-[#2563EB] border border-blue-200 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${localSettings.orderBlocks.enabled ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <span>SMC Order Blocks</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            {/* Tab 3: Liquidity Sweeps */}
            <button
              type="button"
              onClick={() => setActiveTab('liquidity')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'liquidity'
                  ? 'bg-blue-50 text-[#2563EB] border border-blue-200 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${localSettings.liquiditySweeps.enabled ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <span>Liquidity Sweeps</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            {/* Tab 4: Killzones */}
            <button
              type="button"
              onClick={() => setActiveTab('killzones')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'killzones'
                  ? 'bg-blue-50 text-[#2563EB] border border-blue-200 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${localSettings.killzones.enabled ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <span>ICT Killzones</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            {/* Tab 5: EMA Ribbon */}
            <button
              type="button"
              onClick={() => setActiveTab('ema')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'ema'
                  ? 'bg-blue-50 text-[#2563EB] border border-blue-200 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${localSettings.emaRibbon.enabled ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <span>EMA Ribbon (20/50/200)</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>
          </div>

          {/* Right Configuration Panel */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5 text-xs">
            
            {/* 1. FVG CONFIGURATION */}
            {activeTab === 'fvg' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">ICT Fair Value Gaps (FVG)</h4>
                    <p className="text-[11px] text-gray-500">3-bar imbalance zones showing institutional delivery</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.fvg.enabled}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        fvg: { ...prev.fvg, enabled: e.target.checked }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
                  </label>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <span className="text-gray-700 font-medium">Show Unmitigated Only</span>
                    <input
                      type="checkbox"
                      checked={localSettings.fvg.showUnmitigatedOnly}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        fvg: { ...prev.fvg, showUnmitigatedOnly: e.target.checked }
                      }))}
                      className="w-4 h-4 rounded bg-white border-gray-300 text-[#2563EB] focus:ring-blue-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <span className="text-gray-700 font-medium">50% Consequent Encroachment (CE) Line</span>
                    <input
                      type="checkbox"
                      checked={localSettings.fvg.showCE}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        fvg: { ...prev.fvg, showCE: e.target.checked }
                      }))}
                      className="w-4 h-4 rounded bg-white border-gray-300 text-[#2563EB] focus:ring-blue-500 cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 font-mono">
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <span className="text-gray-500 block text-[10px] mb-1 font-sans">Bullish FVG Color</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={localSettings.fvg.bullishColor}
                          onChange={(e) => setLocalSettings(prev => ({
                            ...prev,
                            fvg: { ...prev.fvg, bullishColor: e.target.value }
                          }))}
                          className="w-7 h-7 rounded border border-gray-300 bg-transparent cursor-pointer"
                        />
                        <span className="text-gray-700 text-xs">{localSettings.fvg.bullishColor}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <span className="text-gray-500 block text-[10px] mb-1 font-sans">Bearish FVG Color</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={localSettings.fvg.bearishColor}
                          onChange={(e) => setLocalSettings(prev => ({
                            ...prev,
                            fvg: { ...prev.fvg, bearishColor: e.target.value }
                          }))}
                          className="w-7 h-7 rounded border border-gray-300 bg-transparent cursor-pointer"
                        />
                        <span className="text-gray-700 text-xs">{localSettings.fvg.bearishColor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1">
                    <div className="flex justify-between text-gray-700 font-medium">
                      <span>Box Fill Opacity</span>
                      <span className="font-mono">{Math.round(localSettings.fvg.opacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="0.5"
                      step="0.01"
                      value={localSettings.fvg.opacity}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        fvg: { ...prev.fvg, opacity: parseFloat(e.target.value) }
                      }))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. ORDER BLOCKS CONFIGURATION */}
            {activeTab === 'ob' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">SMC Institutional Order Blocks</h4>
                    <p className="text-[11px] text-gray-500">High volume supply/demand zones before impulse displacement</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.orderBlocks.enabled}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        orderBlocks: { ...prev.orderBlocks, enabled: e.target.checked }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
                  </label>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <span className="text-gray-700 font-medium">Show Unmitigated Only</span>
                    <input
                      type="checkbox"
                      checked={localSettings.orderBlocks.showUnmitigatedOnly}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        orderBlocks: { ...prev.orderBlocks, showUnmitigatedOnly: e.target.checked }
                      }))}
                      className="w-4 h-4 rounded bg-white border-gray-300 text-[#2563EB] focus:ring-blue-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <span className="text-gray-700 font-medium">50% Mean Threshold (MT) Midline</span>
                    <input
                      type="checkbox"
                      checked={localSettings.orderBlocks.showMeanThreshold}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        orderBlocks: { ...prev.orderBlocks, showMeanThreshold: e.target.checked }
                      }))}
                      className="w-4 h-4 rounded bg-white border-gray-300 text-[#2563EB] focus:ring-blue-500 cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 font-mono">
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <span className="text-gray-500 block text-[10px] mb-1 font-sans">Bullish (+OB) Color</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={localSettings.orderBlocks.bullishColor}
                          onChange={(e) => setLocalSettings(prev => ({
                            ...prev,
                            orderBlocks: { ...prev.orderBlocks, bullishColor: e.target.value }
                          }))}
                          className="w-7 h-7 rounded border border-gray-300 bg-transparent cursor-pointer"
                        />
                        <span className="text-gray-700 text-xs">{localSettings.orderBlocks.bullishColor}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <span className="text-gray-500 block text-[10px] mb-1 font-sans">Bearish (-OB) Color</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={localSettings.orderBlocks.bearishColor}
                          onChange={(e) => setLocalSettings(prev => ({
                            ...prev,
                            orderBlocks: { ...prev.orderBlocks, bearishColor: e.target.value }
                          }))}
                          className="w-7 h-7 rounded border border-gray-300 bg-transparent cursor-pointer"
                        />
                        <span className="text-gray-700 text-xs">{localSettings.orderBlocks.bearishColor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. LIQUIDITY SWEEPS */}
            {activeTab === 'liquidity' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">Session Liquidity Sweeps</h4>
                    <p className="text-[11px] text-gray-500">Tracks Buy-Side (BSL) and Sell-Side (SSL) session extremes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.liquiditySweeps.enabled}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        liquiditySweeps: { ...prev.liquiditySweeps, enabled: e.target.checked }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
                  </label>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <span className="text-gray-700 font-medium">Asian Session High & Low (00:00 - 07:00 UTC)</span>
                    <input
                      type="checkbox"
                      checked={localSettings.liquiditySweeps.showAsia}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        liquiditySweeps: { ...prev.liquiditySweeps, showAsia: e.target.checked }
                      }))}
                      className="w-4 h-4 rounded bg-white border-gray-300 text-[#2563EB] focus:ring-blue-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <span className="text-gray-700 font-medium">Highlight Liquidity Sweep Tags</span>
                    <input
                      type="checkbox"
                      checked={localSettings.liquiditySweeps.showSweptLabels}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        liquiditySweeps: { ...prev.liquiditySweeps, showSweptLabels: e.target.checked }
                      }))}
                      className="w-4 h-4 rounded bg-white border-gray-300 text-[#2563EB] focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. KILLZONES */}
            {activeTab === 'killzones' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">ICT Killzones Bands</h4>
                    <p className="text-[11px] text-gray-500">Vertical shaded ribbons indicating peak algorithmic volume windows</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.killzones.enabled}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        killzones: { ...prev.killzones, enabled: e.target.checked }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
                  </label>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <span className="text-gray-700 font-medium">London Open Killzone (07:00 - 10:00 UTC)</span>
                    <input
                      type="checkbox"
                      checked={localSettings.killzones.showLondon}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        killzones: { ...prev.killzones, showLondon: e.target.checked }
                      }))}
                      className="w-4 h-4 rounded bg-white border-gray-300 text-[#2563EB] focus:ring-blue-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <span className="text-gray-700 font-medium">New York AM Silver Bullet (13:30 - 16:00 UTC)</span>
                    <input
                      type="checkbox"
                      checked={localSettings.killzones.showNY}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        killzones: { ...prev.killzones, showNY: e.target.checked }
                      }))}
                      className="w-4 h-4 rounded bg-white border-gray-300 text-[#2563EB] focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. EMA RIBBON */}
            {activeTab === 'ema' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">Exponential Moving Averages</h4>
                    <p className="text-[11px] text-gray-500">Trend direction and dynamic institutional support/resistance</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.emaRibbon.enabled}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        emaRibbon: { ...prev.emaRibbon, enabled: e.target.checked }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
                  </label>
                </div>

                <div className="space-y-3 pt-2">
                  {/* EMA 20 */}
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={localSettings.emaRibbon.ema20}
                        onChange={(e) => setLocalSettings(prev => ({
                          ...prev,
                          emaRibbon: { ...prev.emaRibbon, ema20: e.target.checked }
                        }))}
                        className="w-4 h-4 rounded bg-white border-gray-300 text-[#2563EB] focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-gray-800 font-semibold">20 EMA (Short-term momentum)</span>
                    </div>
                    <input
                      type="color"
                      value={localSettings.emaRibbon.ema20Color}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        emaRibbon: { ...prev.emaRibbon, ema20Color: e.target.value }
                      }))}
                      className="w-6 h-6 rounded border border-gray-300 bg-transparent cursor-pointer"
                    />
                  </div>

                  {/* EMA 50 */}
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={localSettings.emaRibbon.ema50}
                        onChange={(e) => setLocalSettings(prev => ({
                          ...prev,
                          emaRibbon: { ...prev.emaRibbon, ema50: e.target.checked }
                        }))}
                        className="w-4 h-4 rounded bg-white border-gray-300 text-[#2563EB] focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-gray-800 font-semibold">50 EMA (Intermediate trend)</span>
                    </div>
                    <input
                      type="color"
                      value={localSettings.emaRibbon.ema50Color}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        emaRibbon: { ...prev.emaRibbon, ema50Color: e.target.value }
                      }))}
                      className="w-6 h-6 rounded border border-gray-300 bg-transparent cursor-pointer"
                    />
                  </div>

                  {/* EMA 200 */}
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={localSettings.emaRibbon.ema200}
                        onChange={(e) => setLocalSettings(prev => ({
                          ...prev,
                          emaRibbon: { ...prev.emaRibbon, ema200: e.target.checked }
                        }))}
                        className="w-4 h-4 rounded bg-white border-gray-300 text-[#2563EB] focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-gray-800 font-semibold">200 EMA (Macro trend baseline)</span>
                    </div>
                    <input
                      type="color"
                      value={localSettings.emaRibbon.ema200Color}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        emaRibbon: { ...prev.emaRibbon, ema200Color: e.target.value }
                      }))}
                      className="w-6 h-6 rounded border border-gray-300 bg-transparent cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900/80 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors cursor-pointer text-xs font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300 transition-colors cursor-pointer text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold transition-all cursor-pointer text-xs shadow-xs active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saveSuccess ? 'Saved!' : 'Save Layout'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
