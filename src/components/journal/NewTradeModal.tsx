'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  Calculator, 
  Plus, 
  Trash2, 
  Upload, 
  Link as LinkIcon, 
  Star, 
  Sparkles,
  Layers,
  HelpCircle,
  Tag,
  CheckCircle2
} from 'lucide-react';
import { Trade, PartialExit, TradeDirection, TradingSession, TradeResult } from '../../types/journal';
import { 
  POPULAR_SYMBOLS, 
  PREDEFINED_SETUP_MODELS, 
  PREDEFINED_CONFLUENCES, 
  PSYCHOLOGY_TAGS, 
  MISTAKE_TAGS 
} from '../../data/mockJournalData';

interface NewTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTrade: (trade: Trade) => void;
  initialTrade?: Trade | null;
}

export default function NewTradeModal({
  isOpen,
  onClose,
  onSaveTrade,
  initialTrade,
}: NewTradeModalProps) {
  // Form State
  const [symbol, setSymbol] = useState('XAUUSD');
  const [customSymbol, setCustomSymbol] = useState('');
  const [assetClass, setAssetClass] = useState<'Forex' | 'Crypto' | 'Indices' | 'Commodities'>('Commodities');
  const [direction, setDirection] = useState<TradeDirection>('LONG');
  const [status, setStatus] = useState<'CLOSED' | 'OPEN'>('CLOSED');
  
  const [entryPrice, setEntryPrice] = useState<string>('2480.00');
  const [exitPrice, setExitPrice] = useState<string>('2510.00');
  const [stopLoss, setStopLoss] = useState<string>('2470.00');
  const [takeProfit, setTakeProfit] = useState<string>('2510.00');
  const [lotSize, setLotSize] = useState<string>('1.0');
  const [commission, setCommission] = useState<string>('10.00');
  
  // Custom manual PnL override
  const [isManualPnl, setIsManualPnl] = useState(false);
  const [manualNetPnl, setManualNetPnl] = useState<string>('');
  
  // Timing
  const [entryDate, setEntryDate] = useState<string>(new Date().toISOString().slice(0, 16));
  const [exitDate, setExitDate] = useState<string>(new Date().toISOString().slice(0, 16));
  const [session, setSession] = useState<TradingSession>('NEW_YORK');
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h' | '4h' | '1D'>('5m');
  
  // Setup & Tags
  const [setupModel, setSetupModel] = useState(PREDEFINED_SETUP_MODELS[0]);
  const [customSetupModel, setCustomSetupModel] = useState('');
  const [selectedConfluences, setSelectedConfluences] = useState<string[]>(['15m FVG', 'Clean Displacement Leg']);
  const [customConfluenceInput, setCustomConfluenceInput] = useState('');
  
  // Partials
  const [partials, setPartials] = useState<PartialExit[]>([]);
  
  // Notes & Psychology
  const [chartUrl, setChartUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedPsychology, setSelectedPsychology] = useState<string[]>(['Discipline 10/10']);
  const [selectedMistakes, setSelectedMistakes] = useState<string[]>(['None (Clean Execution)']);
  const [rating, setRating] = useState<number>(5);

  // Load initial trade when editing
  useEffect(() => {
    if (initialTrade) {
      setSymbol(initialTrade.symbol);
      setAssetClass(initialTrade.assetClass);
      setDirection(initialTrade.direction);
      setStatus(initialTrade.status);
      setEntryPrice(initialTrade.entryPrice?.toString() || '');
      setExitPrice(initialTrade.exitPrice?.toString() || '');
      setStopLoss(initialTrade.stopLoss?.toString() || '');
      setTakeProfit(initialTrade.takeProfit?.toString() || '');
      setLotSize(initialTrade.lotSize?.toString() || '1.0');
      setCommission(initialTrade.commission?.toString() || '0');
      setEntryDate(initialTrade.entryDate ? new Date(initialTrade.entryDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16));
      setExitDate(initialTrade.exitDate ? new Date(initialTrade.exitDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16));
      setSession(initialTrade.session || 'NEW_YORK');
      setTimeframe(initialTrade.timeframe || '5m');
      setSetupModel(initialTrade.setupModel || PREDEFINED_SETUP_MODELS[0]);
      setSelectedConfluences(initialTrade.confluences || []);
      setPartials(initialTrade.partials || []);
      setChartUrl(initialTrade.chartUrl || '');
      setNotes(initialTrade.notes || '');
      setSelectedPsychology(initialTrade.psychology || []);
      setSelectedMistakes(initialTrade.mistakes || []);
      setRating(initialTrade.rating || 5);
      if (initialTrade.netPnl !== undefined) {
        setIsManualPnl(true);
        setManualNetPnl(initialTrade.netPnl.toString());
      }
    } else {
      // Reset defaults for new trade
      setSymbol('XAUUSD');
      setDirection('LONG');
      setStatus('CLOSED');
      setEntryPrice('2480.00');
      setExitPrice('2510.00');
      setStopLoss('2470.00');
      setTakeProfit('2510.00');
      setLotSize('1.0');
      setCommission('10.00');
      setIsManualPnl(false);
      setManualNetPnl('');
      setPartials([]);
      setChartUrl('');
      setNotes('');
      setSelectedPsychology(['Discipline 10/10']);
      setSelectedMistakes(['None (Clean Execution)']);
      setRating(5);
    }
  }, [initialTrade, isOpen]);

  if (!isOpen) return null;

  // Real-time Calculator logic
  const entryNum = parseFloat(entryPrice) || 0;
  const exitNum = parseFloat(exitPrice) || 0;
  const slNum = parseFloat(stopLoss) || 0;
  const tpNum = parseFloat(takeProfit) || 0;
  const lotsNum = parseFloat(lotSize) || 0;
  const commNum = parseFloat(commission) || 0;

  // Contract multiplier determination
  const activeSymbolObj = POPULAR_SYMBOLS.find(s => s.symbol === symbol);
  const multiplier = activeSymbolObj?.defaultMultiplier || (assetClass === 'Forex' ? 100000 : assetClass === 'Indices' ? 20 : assetClass === 'Commodities' ? 100 : 1);

  // Auto-calculated PnL
  let calculatedGrossPnl = 0;
  if (entryNum > 0 && exitNum > 0 && lotsNum > 0) {
    if (direction === 'LONG') {
      calculatedGrossPnl = (exitNum - entryNum) * lotsNum * multiplier;
    } else {
      calculatedGrossPnl = (entryNum - exitNum) * lotsNum * multiplier;
    }
  }

  const netPnlValue = isManualPnl && manualNetPnl !== '' ? parseFloat(manualNetPnl) || 0 : calculatedGrossPnl - commNum;

  // Calculate R:R Planned & Realized
  let rrPlanned = 0;
  let rrRealized = 0;
  const riskPerUnit = Math.abs(entryNum - slNum);
  if (riskPerUnit > 0) {
    if (direction === 'LONG') {
      if (tpNum > 0) rrPlanned = (tpNum - entryNum) / riskPerUnit;
      if (exitNum > 0) rrRealized = (exitNum - entryNum) / riskPerUnit;
    } else {
      if (tpNum > 0) rrPlanned = (entryNum - tpNum) / riskPerUnit;
      if (exitNum > 0) rrRealized = (entryNum - exitNum) / riskPerUnit;
    }
  }

  const calculatedResult: TradeResult = netPnlValue > 15 ? 'WIN' : netPnlValue < -15 ? 'LOSS' : 'BE';

  // Partials handlers
  const handleAddPartial = () => {
    const defaultPerc = partials.length === 0 ? 50 : 25;
    const newPartial: PartialExit = {
      id: 'p-' + Date.now(),
      percentage: defaultPerc,
      exitPrice: exitNum || entryNum,
      lotSize: Number((lotsNum * (defaultPerc / 100)).toFixed(2)),
      pnl: Number(((direction === 'LONG' ? (exitNum - entryNum) : (entryNum - exitNum)) * (lotsNum * (defaultPerc / 100)) * multiplier).toFixed(2)),
      time: new Date().toISOString().slice(11, 16),
      note: `Partial ${partials.length + 1}`,
    };
    setPartials([...partials, newPartial]);
  };

  const handleUpdatePartial = (id: string, field: keyof PartialExit, val: any) => {
    setPartials(partials.map(p => p.id === id ? { ...p, [field]: val } : p));
  };

  const handleRemovePartial = (id: string) => {
    setPartials(partials.filter(p => p.id !== id));
  };

  // Confluence pill toggle
  const toggleConfluence = (item: string) => {
    if (selectedConfluences.includes(item)) {
      setSelectedConfluences(selectedConfluences.filter(c => c !== item));
    } else {
      setSelectedConfluences([...selectedConfluences, item]);
    }
  };

  const handleAddCustomConfluence = () => {
    if (customConfluenceInput.trim() && !selectedConfluences.includes(customConfluenceInput.trim())) {
      setSelectedConfluences([...selectedConfluences, customConfluenceInput.trim()]);
      setCustomConfluenceInput('');
    }
  };

  // Psychology tags toggle
  const togglePsychology = (tag: string) => {
    if (selectedPsychology.includes(tag)) {
      setSelectedPsychology(selectedPsychology.filter(t => t !== tag));
    } else {
      setSelectedPsychology([...selectedPsychology, tag]);
    }
  };

  const toggleMistake = (tag: string) => {
    if (selectedMistakes.includes(tag)) {
      setSelectedMistakes(selectedMistakes.filter(t => t !== tag));
    } else {
      setSelectedMistakes([...selectedMistakes, tag]);
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalSymbol = symbol === 'CUSTOM' ? (customSymbol.toUpperCase() || 'CUSTOM') : symbol;
    const finalSetupModel = setupModel === 'CUSTOM' ? (customSetupModel || 'Custom Setup') : setupModel;

    const savedTrade: Trade = {
      id: initialTrade?.id || 'TRD-' + Date.now().toString().slice(-6),
      symbol: finalSymbol,
      assetClass,
      direction,
      status,
      result: calculatedResult,
      entryPrice: entryNum,
      exitPrice: exitNum,
      stopLoss: slNum,
      takeProfit: tpNum || undefined,
      lotSize: lotsNum,
      contractMultiplier: multiplier,
      netPnl: Number(netPnlValue.toFixed(2)),
      grossPnl: Number(calculatedGrossPnl.toFixed(2)),
      commission: commNum,
      rrRealized: Number(rrRealized.toFixed(2)),
      rrPlanned: Number(rrPlanned.toFixed(2)),
      entryDate: new Date(entryDate).toISOString(),
      exitDate: exitDate ? new Date(exitDate).toISOString() : undefined,
      session,
      timeframe,
      setupModel: finalSetupModel,
      confluences: selectedConfluences,
      partials,
      chartUrl: chartUrl.trim() || undefined,
      chartThumbnail: chartUrl.trim() || undefined,
      notes,
      psychology: selectedPsychology,
      mistakes: selectedMistakes,
      rating,
    };

    onSaveTrade(savedTrade);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:px-6 py-3.5 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between bg-gray-50/80 dark:bg-[#151515] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-[#2563EB] dark:text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-neutral-100">
                {initialTrade ? 'Edit Trade Log' : 'Record New Trade'}
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                Capture execution data, partials, SMC confluences, and psychological review.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-200 hover:bg-gray-200/60 dark:hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1 text-xs text-gray-700 dark:text-neutral-300">
          
          {/* SECTION 1: Asset & Direction Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-gray-50/80 dark:bg-[#151515] p-4 rounded-xl border border-gray-200 dark:border-neutral-800">
            {/* Symbol */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 dark:text-neutral-400 capitalize mb-1.5">
                Asset / Symbol
              </label>
              <select
                value={symbol}
                onChange={(e) => {
                  const val = e.target.value;
                  setSymbol(val);
                  const matched = POPULAR_SYMBOLS.find(s => s.symbol === val);
                  if (matched) setAssetClass(matched.assetClass);
                }}
                className="w-full bg-white dark:bg-[#181818] border border-gray-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-gray-900 dark:text-neutral-100 font-mono font-bold focus:outline-none focus:border-[#2563EB] shadow-2xs"
              >
                {POPULAR_SYMBOLS.map((s) => (
                  <option key={s.symbol} value={s.symbol}>
                    {s.symbol} ({s.name})
                  </option>
                ))}
                <option value="CUSTOM">+ Custom Symbol...</option>
              </select>

              {symbol === 'CUSTOM' && (
                <input
                  type="text"
                  placeholder="e.g. SOLUSD"
                  value={customSymbol}
                  onChange={(e) => setCustomSymbol(e.target.value)}
                  className="mt-2 w-full bg-white dark:bg-[#181818] border border-gray-200 dark:border-neutral-800 rounded-xl px-3 py-1.5 text-gray-900 dark:text-neutral-100 font-mono capitalize focus:outline-none focus:border-[#2563EB] shadow-2xs"
                />
              )}
            </div>

            {/* Direction (Long / Short) */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 dark:text-neutral-400 capitalize mb-1.5">
                Direction
              </label>
              <div className="grid grid-cols-2 gap-1.5 bg-white dark:bg-[#181818] p-1 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setDirection('LONG')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-bold font-mono text-xs transition-all cursor-pointer ${
                    direction === 'LONG'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 hover:bg-gray-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Long</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('SHORT')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-bold font-mono text-xs transition-all cursor-pointer ${
                    direction === 'SHORT'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 hover:bg-gray-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Short</span>
                </button>
              </div>
            </div>

            {/* Session */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 dark:text-neutral-400 capitalize mb-1.5">
                Session
              </label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value as TradingSession)}
                className="w-full bg-white dark:bg-[#181818] border border-gray-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-gray-900 dark:text-neutral-100 font-mono focus:outline-none focus:border-[#2563EB] shadow-2xs"
              >
                <option value="NEW_YORK">🇺🇸 New York AM/PM</option>
                <option value="LONDON">🇬🇧 London Killzone</option>
                <option value="ASIA">🇯🇵 Asia Session</option>
                <option value="LONDON_CLOSE">🇬🇧 London Close</option>
                <option value="OVERNIGHT">🌙 Swing / Overnight</option>
              </select>
            </div>

            {/* Timeframe */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 dark:text-neutral-400 capitalize mb-1.5">
                Execution TF
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
                className="w-full bg-white dark:bg-[#181818] border border-gray-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-gray-900 dark:text-neutral-100 font-mono focus:outline-none focus:border-[#2563EB] shadow-2xs"
              >
                <option value="1m">1 Minute (1m)</option>
                <option value="5m">5 Minute (5m)</option>
                <option value="15m">15 Minute (15m)</option>
                <option value="1h">1 Hour (1h)</option>
                <option value="4h">4 Hour (4h)</option>
                <option value="1D">Daily (1D)</option>
              </select>
            </div>
          </div>

          {/* SECTION 2: Pricing & Execution & Calculator */}
          <div className="bg-gray-50/80 dark:bg-[#151515] p-4 rounded-xl border border-gray-200 dark:border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 dark:text-neutral-100 capitalize flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
                Execution Prices & PnL Calculator
              </span>
              
              {/* Manual Override Toggle */}
              <button
                type="button"
                onClick={() => setIsManualPnl(!isManualPnl)}
                className="text-[11px] text-gray-500 dark:text-neutral-400 hover:text-[#2563EB] dark:hover:text-blue-400 cursor-pointer underline font-medium"
              >
                {isManualPnl ? 'Switch to Auto-Calculate PnL' : 'Manual PnL Override'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Entry Price */}
              <div>
                <label className="block text-[10.5px] text-gray-600 dark:text-neutral-400 capitalize font-mono font-semibold mb-1">Entry Price *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white dark:bg-[#181818] border border-gray-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-gray-900 dark:text-neutral-100 font-mono font-bold focus:outline-none focus:border-[#2563EB] shadow-2xs"
                />
              </div>

              {/* Exit Price */}
              <div>
                <label className="block text-[10.5px] text-gray-600 dark:text-neutral-400 capitalize font-mono font-semibold mb-1">Exit Price *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={exitPrice}
                  onChange={(e) => setExitPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white dark:bg-[#181818] border border-gray-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-gray-900 dark:text-neutral-100 font-mono font-bold focus:outline-none focus:border-[#2563EB] shadow-2xs"
                />
              </div>

              {/* Stop Loss */}
              <div>
                <label className="block text-[10.5px] text-rose-700 dark:text-rose-400 capitalize font-mono font-semibold mb-1">Stop Loss *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white dark:bg-[#181818] border border-rose-300 dark:border-rose-900/60 rounded-xl px-3 py-2 text-rose-700 dark:text-rose-400 font-mono font-bold focus:outline-none focus:border-rose-500 shadow-2xs"
                />
              </div>

              {/* Take Profit */}
              <div>
                <label className="block text-[10.5px] text-emerald-700 dark:text-emerald-400 capitalize font-mono font-semibold mb-1">Take Profit</label>
                <input
                  type="number"
                  step="any"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white dark:bg-[#181818] border border-emerald-300 dark:border-emerald-900/60 rounded-xl px-3 py-2 text-emerald-700 dark:text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500 shadow-2xs"
                />
              </div>

              {/* Lot Size */}
              <div>
                <label className="block text-[10.5px] text-gray-600 dark:text-neutral-400 capitalize font-mono font-semibold mb-1">Lot Size *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={lotSize}
                  onChange={(e) => setLotSize(e.target.value)}
                  placeholder="1.0"
                  className="w-full bg-white dark:bg-[#181818] border border-gray-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-gray-900 dark:text-neutral-100 font-mono font-bold focus:outline-none focus:border-[#2563EB] shadow-2xs"
                />
              </div>

              {/* Commission */}
              <div>
                <label className="block text-[10.5px] text-gray-600 dark:text-neutral-400 capitalize font-mono font-semibold mb-1">Comm. ($)</label>
                <input
                  type="number"
                  step="any"
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white dark:bg-[#181818] border border-gray-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-gray-900 dark:text-neutral-100 font-mono focus:outline-none focus:border-[#2563EB] shadow-2xs"
                />
              </div>
            </div>

            {/* Manual PnL input when toggled */}
            {isManualPnl && (
              <div className="bg-blue-50/70 dark:bg-blue-950/30 p-3 rounded-xl border border-blue-200 dark:border-blue-800/60 flex items-center justify-between gap-4 animate-fade-in">
                <div>
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-300 block">Manual Net P&L Input</span>
                  <span className="text-[10px] text-blue-700 dark:text-blue-400">Directly specify final monetary profit or loss for custom broker rules.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-neutral-400 font-mono font-bold">$</span>
                  <input
                    type="number"
                    step="any"
                    value={manualNetPnl}
                    onChange={(e) => setManualNetPnl(e.target.value)}
                    placeholder="+250.00 or -150.00"
                    className="bg-white dark:bg-[#181818] border border-blue-300 dark:border-blue-700 rounded-lg px-3 py-1.5 text-gray-900 dark:text-neutral-100 font-mono font-bold text-sm w-44 focus:outline-none shadow-2xs"
                  />
                </div>
              </div>
            )}

            {/* Live Calculated Metric Pill */}
            <div className="bg-white dark:bg-[#181818] p-3 rounded-xl border border-gray-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 font-mono text-xs shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-neutral-400 font-sans font-medium">Est. Net P&L:</span>
                <span className={`text-base font-extrabold ${netPnlValue >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {netPnlValue >= 0 ? '+' : ''}${netPnlValue.toFixed(2)} USD
                </span>
              </div>

              <div className="flex items-center gap-4 text-gray-600 dark:text-neutral-400">
                <span>
                  Realized R:R: <strong className={rrRealized > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>{rrRealized.toFixed(2)}R</strong>
                </span>
                <span>
                  Planned R:R: <strong className="text-gray-900 dark:text-neutral-100">{rrPlanned.toFixed(2)}R</strong>
                </span>
                <span>
                  Outcome: <strong className={calculatedResult === 'WIN' ? 'text-emerald-600 dark:text-emerald-400' : calculatedResult === 'LOSS' ? 'text-rose-600 dark:text-rose-400' : 'text-gray-700 dark:text-neutral-300'}>{calculatedResult}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 3: Dynamic Partials Tracker */}
          <div className="bg-gray-50/80 dark:bg-[#151515] p-4 rounded-xl border border-gray-200 dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-900 dark:text-neutral-100 capitalize block">
                  Scale Outs & Partials Tracker
                </span>
                <span className="text-[10.5px] text-gray-500 dark:text-neutral-400">Record staggered profit taking at key targets / liquidity pools.</span>
              </div>
              <button
                type="button"
                onClick={handleAddPartial}
                className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950/40 hover:bg-[#2563EB] dark:hover:bg-blue-600 text-[#2563EB] dark:text-blue-400 hover:text-white border border-blue-200 dark:border-blue-800/60 hover:border-transparent px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Partial Row</span>
              </button>
            </div>

            {partials.length === 0 ? (
              <div className="text-center py-4 border border-dashed border-gray-300 dark:border-neutral-700 rounded-xl text-gray-500 dark:text-neutral-400 text-[11px] bg-white dark:bg-[#181818]">
                No partial scale-outs added. Click "Add Partial Row" to track multi-target profit booking.
              </div>
            ) : (
              <div className="space-y-2">
                {partials.map((p, idx) => (
                  <div key={p.id} className="grid grid-cols-12 gap-2 items-center bg-white dark:bg-[#181818] p-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 font-mono text-xs shadow-2xs">
                    <div className="col-span-1 text-gray-500 dark:text-neutral-400 font-bold">
                      #{idx + 1}
                    </div>
                    <div className="col-span-3">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={p.percentage}
                          onChange={(e) => handleUpdatePartial(p.id, 'percentage', parseFloat(e.target.value) || 0)}
                          className="w-14 bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-neutral-800 rounded px-2 py-1 text-gray-900 dark:text-neutral-100 text-center"
                        />
                        <span className="text-gray-500 dark:text-neutral-400">%</span>
                      </div>
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        step="any"
                        placeholder="Exit Price"
                        value={p.exitPrice}
                        onChange={(e) => handleUpdatePartial(p.id, 'exitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-neutral-800 rounded px-2 py-1 text-gray-900 dark:text-neutral-100"
                      />
                    </div>
                    <div className="col-span-4">
                      <input
                        type="text"
                        placeholder="Note (e.g. Asia High sweep)"
                        value={p.note || ''}
                        onChange={(e) => handleUpdatePartial(p.id, 'note', e.target.value)}
                        className="w-full bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-neutral-800 rounded px-2 py-1 text-gray-800 dark:text-neutral-200 font-sans"
                      />
                    </div>
                    <div className="col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemovePartial(p.id)}
                        className="p-1 text-gray-400 dark:text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 4: Setup Models & Confluences */}
          <div className="bg-gray-50/80 dark:bg-[#151515] p-4 rounded-xl border border-gray-200 dark:border-neutral-800 space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-900 dark:text-neutral-100 capitalize mb-1.5">
                Setup Model / Playbook
              </label>
              <select
                value={setupModel}
                onChange={(e) => setSetupModel(e.target.value)}
                className="w-full bg-white dark:bg-[#181818] border border-gray-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-gray-900 dark:text-neutral-100 font-medium focus:outline-none focus:border-[#2563EB] shadow-2xs"
              >
                {PREDEFINED_SETUP_MODELS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
                <option value="CUSTOM">+ Custom Playbook Model...</option>
              </select>

              {setupModel === 'CUSTOM' && (
                <input
                  type="text"
                  placeholder="Enter custom playbook model..."
                  value={customSetupModel}
                  onChange={(e) => setCustomSetupModel(e.target.value)}
                  className="mt-2 w-full bg-white dark:bg-[#181818] border border-gray-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-gray-900 dark:text-neutral-100 focus:outline-none focus:border-[#2563EB] shadow-2xs"
                />
              )}
            </div>

            {/* Confluences pills */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 dark:text-neutral-400 capitalize mb-2">
                Confluences & PD Arrays ({selectedConfluences.length} Selected)
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {PREDEFINED_CONFLUENCES.map((conf) => {
                  const isSelected = selectedConfluences.includes(conf);
                  return (
                    <button
                      key={conf}
                      type="button"
                      onClick={() => toggleConfluence(conf)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#2563EB] text-white border-blue-600 shadow-2xs'
                          : 'bg-white dark:bg-[#181818] text-gray-700 dark:text-neutral-200 border-gray-200 dark:border-neutral-800 hover:text-gray-900 dark:hover:text-neutral-100 hover:bg-gray-50 dark:hover:bg-neutral-800 shadow-2xs'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}{conf}
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Confluence */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add custom confluence tag (e.g. SMT Divergence)..."
                  value={customConfluenceInput}
                  onChange={(e) => setCustomConfluenceInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomConfluence();
                    }
                  }}
                  className="flex-1 bg-white dark:bg-[#181818] border border-gray-200 dark:border-neutral-800 rounded-xl px-3 py-1.5 text-gray-900 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:border-[#2563EB] text-xs shadow-2xs"
                />
                <button
                  type="button"
                  onClick={handleAddCustomConfluence}
                  className="bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-200 font-semibold px-3 py-1.5 rounded-xl transition-colors cursor-pointer border border-gray-200 dark:border-neutral-700 text-xs shadow-2xs"
                >
                  Add Tag
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 5: Chart Attachment & Screenshot */}
          <div className="bg-gray-50/80 dark:bg-[#151515] p-4 rounded-xl border border-gray-200 dark:border-neutral-800 space-y-3">
            <span className="text-xs font-bold text-gray-900 dark:text-neutral-100 capitalize block">
              Chart Snapshot / TradingView Link
            </span>
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-gray-400 dark:text-neutral-500 shrink-0" />
              <input
                type="url"
                placeholder="Paste TradingView snapshot URL or image link (e.g. https://www.tradingview.com/x/...)"
                value={chartUrl}
                onChange={(e) => setChartUrl(e.target.value)}
                className="w-full bg-white dark:bg-[#181818] border border-gray-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-gray-900 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:border-[#2563EB] text-xs shadow-2xs"
              />
            </div>

            {chartUrl && (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-neutral-800 max-h-48 bg-gray-100 dark:bg-neutral-900">
                <img src={chartUrl} alt="Chart snapshot preview" className="w-full h-48 object-cover" />
              </div>
            )}
          </div>

          {/* SECTION 6: Psychology, Rules & Execution Notes */}
          <div className="bg-gray-50/80 dark:bg-[#151515] p-4 rounded-xl border border-gray-200 dark:border-neutral-800 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-900 dark:text-neutral-100 capitalize mb-2">
                Psychology & Execution Discipline
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PSYCHOLOGY_TAGS.map((tag) => {
                  const isSelected = selectedPsychology.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => togglePsychology(tag)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/80 font-bold'
                          : 'bg-white dark:bg-[#181818] text-gray-700 dark:text-neutral-200 border-gray-200 dark:border-neutral-800 hover:text-gray-900 dark:hover:text-neutral-100 hover:bg-gray-50 dark:hover:bg-neutral-800 shadow-2xs'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-900 dark:text-neutral-100 capitalize mb-2">
                Mistakes / Rule Violations
              </label>
              <div className="flex flex-wrap gap-1.5">
                {MISTAKE_TAGS.map((tag) => {
                  const isSelected = selectedMistakes.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleMistake(tag)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${
                        isSelected
                          ? tag === 'None (Clean Execution)' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/80' 
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800/80 font-bold'
                          : 'bg-white dark:bg-[#181818] text-gray-700 dark:text-neutral-200 border-gray-200 dark:border-neutral-800 hover:text-gray-900 dark:hover:text-neutral-100 hover:bg-gray-50 dark:hover:bg-neutral-800 shadow-2xs'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Execution Notes / Markdown */}
            <div>
              <label className="block text-xs font-bold text-gray-900 dark:text-neutral-100 capitalize mb-1.5">
                Trade Analysis & Review Notes
              </label>
              <textarea
                rows={3}
                placeholder="Detail the market narrative, HTF draw on liquidity, liquidity sweeps, emotional state during the trade, and lessons learned..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white dark:bg-[#181818] border border-gray-200 dark:border-neutral-800 rounded-xl p-3 text-gray-900 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:border-[#2563EB] text-xs leading-relaxed shadow-2xs"
              />
            </div>

            {/* Rating */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold text-gray-600 dark:text-neutral-400 capitalize">
                Execution Quality Rating
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-neutral-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 sticky bottom-0 bg-white dark:bg-[#1E1E1E] py-3 border-t border-gray-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer border border-gray-200 dark:border-neutral-700 shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
            >
              {initialTrade ? 'Save Changes' : 'Record Trade'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
