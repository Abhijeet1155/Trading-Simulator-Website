'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CandleData, 
  ReplayPosition, 
  ReplayAccountStats, 
  SpeedMultiplier,
  OrderDirection,
  SessionJumpPoint
} from '../../types/replay';
import { 
  DrawingToolType, 
  DrawingItem,
  IndicatorSettings
} from '../../types/indicators';
import { 
  generateReplayDataset, 
  AVAILABLE_SYMBOLS, 
  AVAILABLE_TIMEFRAMES 
} from '../../data/mockReplayCandles';
import { useICTIndicators } from '../../hooks/useICTIndicators';
import ReplayChartCanvas from './ReplayChartCanvas';
import IndicatorManagerModal from './IndicatorManagerModal';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  RotateCcw, 
  RefreshCw, 
  Sliders, 
  CheckCircle2, 
  AlertCircle,
  Settings2,
  Eye, 
  EyeOff,
  ChevronLeft,
  ChevronRight,
  MousePointer,
  Minus,
  TrendingUp,
  Square,
  Type,
  Activity,
  Layers,
  Clock,
  Scissors,
  Compass,
  Zap,
  Maximize2,
  Trophy,
  Gift,
  Radio,
  Newspaper,
  BookOpen,
  Share2,
  User,
  Settings,
  ChevronDown,
  ChevronUp,
  Calendar as CalendarIcon,
  Sparkles,
  Link as LinkIcon,
  HelpCircle,
  Pencil,
  Image as ImageIcon,
  MessageSquare,
  Check,
  Flame,
  Camera,
  X,
  Plus,
  Info
} from 'lucide-react';

interface JournalEntry {
  id: string;
  tradeId?: string;
  dateTime: string;
  symbol: string;
  type: OrderDirection;
  entryPrice: number;
  exitPrice?: number;
  pnl: number;
  pnlPips: number;
  status: 'OPEN' | 'CLOSED';
  notes: string;
  screenshot?: string;
  barIndex: number;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function BarReplayEngine() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Left sidebar active tab / nav
  const [leftNavActive, setLeftNavActive] = useState<'charts' | 'journal' | 'news' | 'affiliate' | 'giveaway' | 'compete' | 'accounts' | 'settings'>('charts');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Symbol & Timeframe
  const [selectedSymbol, setSelectedSymbol] = useState('XAUUSD');
  const [selectedTimeframe, setSelectedTimeframe] = useState('15m');

  // Drawing Tools State
  const [activeDrawingTool, setActiveDrawingTool] = useState<DrawingToolType>('cursor');
  const [drawings, setDrawings] = useState<DrawingItem[]>([]);

  // Candle Data & Replay State
  const [dataset, setDataset] = useState<{ candles: CandleData[]; jumpPoints: SessionJumpPoint[] }>(() => 
    generateReplayDataset('XAUUSD', '15m', 300)
  );

  // Visible bars = 65% of dataset
  const [visibleIndex, setVisibleIndex] = useState(() => Math.floor(300 * 0.65));
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<SpeedMultiplier>(1);
  const [isScissorsActive, setIsScissorsActive] = useState(false);
  const [isIndicatorModalOpen, setIsIndicatorModalOpen] = useState(false);

  // Dropdown toggles
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isSpeedDropdownOpen, setIsSpeedDropdownOpen] = useState(false);
  const [isTimeframeDropdownOpen, setIsTimeframeDropdownOpen] = useState(false);
  const [isSymbolDropdownOpen, setIsSymbolDropdownOpen] = useState(false);

  // Date Picker State
  const [pickerYear, setPickerYear] = useState(2023);
  const [pickerMonth, setPickerMonth] = useState(10); // 0-indexed (10 = November)
  const [pickerDay, setPickerDay] = useState(12);
  const [pickerHour, setPickerHour] = useState('14');
  const [pickerMinute, setPickerMinute] = useState('00');

  // Right Panel Tabs: 'EXECUTION' | 'NEWS'
  const [rightPanelTab, setRightPanelTab] = useState<'EXECUTION' | 'NEWS'>('EXECUTION');

  // Bottom Terminal Tabs (Split: Left side & Right side)
  const [leftBottomTab, setLeftBottomTab] = useState<'Positions' | 'Pending Orders' | 'Order History'>('Positions');
  const [rightBottomTab, setRightBottomTab] = useState<'Trade Journal' | 'Calendar Heatmap' | 'Automated Logs'>('Trade Journal');
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);

  // Calendar navigation state
  const [selectedHeatmapDay, setSelectedHeatmapDay] = useState<number | null>(null);

  // Trade Execution Settings
  const [executionFormMode, setExecutionFormMode] = useState<'Risk calculator form' | 'One-click form' | 'Regular form'>('Risk calculator form');
  const [isFormDropdownOpen, setIsFormDropdownOpen] = useState(false);
  const [orderTab, setOrderTab] = useState<'Market' | 'Pending' | 'Limit'>('Market');
  const [orderDirection, setOrderDirection] = useState<OrderDirection>('SELL');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'STOP'>('MARKET');
  const [lotSize, setLotSize] = useState(0.01);
  const [riskAmount, setRiskAmount] = useState<string>('');
  const [riskUnit, setRiskUnit] = useState<'USD' | '%'>('USD');
  const [slUnit, setSlUnit] = useState<'Pips' | 'Price'>('Pips');
  const [tpUnit, setTpUnit] = useState<'Pips' | 'Price'>('Pips');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Journal note editing state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteInputText, setNoteInputText] = useState<string>('');

  const datePickerRef = useRef<HTMLDivElement | null>(null);
  const speedDropdownRef = useRef<HTMLDivElement | null>(null);
  const tfDropdownRef = useRef<HTMLDivElement | null>(null);
  const symbolDropdownRef = useRef<HTMLDivElement | null>(null);

  // Real User Account State (fetched from /api/user/account)
  const [realStartingBalance, setRealStartingBalance] = useState<number>(10000.00);
  const [accountInfo, setAccountInfo] = useState<{
    accountName: string;
    balance: number;
    leverage: number;
    isDemo: boolean;
    currency: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch user active account balance from /api/user/account
  useEffect(() => {
    let isSubscribed = true;
    async function fetchUserAccount() {
      try {
        const res = await fetch('/api/user/account');
        if (res.ok) {
          const data = await res.json();
          if (isSubscribed && data) {
            const active = data.activeAccount || data;
            const bal = parseFloat(active.balance ?? data.balance ?? 10000);
            const name = active.nickname || active.accountName || data.accountName || 'Primary Wallet';
            const lev = active.leverage || data.leverage || 100;
            const isDemo = active.isDemo !== undefined ? active.isDemo : (data.isDemo !== undefined ? data.isDemo : true);
            const curr = active.currency || data.currency || 'USD';

            setAccountInfo({
              accountName: name,
              balance: bal,
              leverage: lev,
              isDemo,
              currency: curr
            });
            setRealStartingBalance(bal);
          }
        }
      } catch (err) {
        console.warn('Unable to load real account balance, using default:', err);
      }
    }
    fetchUserAccount();
    return () => {
      isSubscribed = false;
    };
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setIsDatePickerOpen(false);
      }
      if (speedDropdownRef.current && !speedDropdownRef.current.contains(e.target as Node)) {
        setIsSpeedDropdownOpen(false);
      }
      if (tfDropdownRef.current && !tfDropdownRef.current.contains(e.target as Node)) {
        setIsTimeframeDropdownOpen(false);
      }
      if (symbolDropdownRef.current && !symbolDropdownRef.current.contains(e.target as Node)) {
        setIsSymbolDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Indicators Engine Hook
  const {
    settings: indicatorSettings,
    setSettings: setIndicatorSettings,
    saveSettings: saveIndicatorSettings,
    resetToDefaults: resetIndicatorDefaults,
    activeCount: activeIndicatorCount,
    fvgs,
    orderBlocks,
    liquidityLevels,
    killzones,
    emas,
    ma,
    rsi,
    macd,
    bollinger
  } = useICTIndicators(dataset.candles, visibleIndex);

  // Trading & Position State
  // Base Initial Pre-seeded Trades for the Replay Dataset (Chronological)
  const initialTimelineTrades: ReplayPosition[] = useMemo(() => [
    {
      id: 'trade-demo-1',
      symbol: selectedSymbol,
      type: 'BUY',
      lots: 0.10,
      entryPrice: 2416.80,
      sl: 2412.00,
      tp: 2422.00,
      status: 'CLOSED',
      openTime: '14:00',
      closeTime: '14:25',
      openBarIndex: 180,
      closeBarIndex: 185,
      closePrice: 2422.00,
      pnl: 52.00,
      pnlPips: 5.2,
      closeReason: 'TP'
    },
    {
      id: 'trade-demo-2',
      symbol: selectedSymbol,
      type: 'SELL',
      lots: 0.10,
      entryPrice: 2421.50,
      sl: 2424.00,
      tp: 2414.00,
      status: 'CLOSED',
      openTime: '14:30',
      closeTime: '14:55',
      openBarIndex: 186,
      closeBarIndex: 191,
      closePrice: 2414.00,
      pnl: 75.00,
      pnlPips: 7.5,
      closeReason: 'TP'
    },
    {
      id: 'trade-demo-3',
      symbol: selectedSymbol,
      type: 'BUY',
      lots: 0.10,
      entryPrice: 2415.20,
      sl: 2412.00,
      tp: 2420.00,
      status: 'CLOSED',
      openTime: '15:00',
      closeTime: '15:20',
      openBarIndex: 192,
      closeBarIndex: 196,
      closePrice: 2412.00,
      pnl: -32.00,
      pnlPips: -3.2,
      closeReason: 'SL'
    },
    {
      id: 'trade-demo-4',
      symbol: selectedSymbol,
      type: 'SELL',
      lots: 0.10,
      entryPrice: 2419.40,
      sl: 2422.00,
      tp: 2410.00,
      status: 'OPEN',
      openTime: '15:25',
      closeTime: '16:00',
      openBarIndex: 197,
      closeBarIndex: 204,
      closePrice: 2410.00,
      pnl: 94.00,
      pnlPips: 9.4,
      closeReason: 'TP'
    }
  ], [selectedSymbol]);

  // Dynamic user manual positions (executed via SIMULATE TRADE button)
  const [manualTrades, setManualTrades] = useState<ReplayPosition[]>([]);
  // Manual custom notes entered by user in journal
  const [customNotes, setCustomNotes] = useState<Record<string, string>>({
    'trade-demo-1': 'Clean Fair Value Gap fill on 15m. Disciplined execution targeting session high.',
    'trade-demo-2': 'London high liquidity swept; confirmed displacement lower.',
    'trade-demo-3': 'Re-entry on mitigation block with tight stop loss.',
    'trade-demo-4': 'NY session open distribution phase targeting sell-side liquidity.'
  });

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'danger' | 'info' } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const [isSeeking, setIsSeeking] = useState(false);

  const showToast = (text: string, type: 'success' | 'danger' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  };

  const [isLoadingBars, setIsLoadingBars] = useState(false);

  const loadBars = useCallback(async (sym: string, tf: string) => {
    setIsLoadingBars(true);
    try {
      const res = await fetch(`/api/replay/bars?symbol=${encodeURIComponent(sym)}&timeframe=${encodeURIComponent(tf)}&count=300`);
      if (res.ok) {
        const data = await res.json();
        const rawBars = Array.isArray(data) ? data : (Array.isArray(data?.bars) ? data.bars : []);
        if (rawBars.length > 0) {
          const formattedCandles: CandleData[] = rawBars.map((b: any) => {
            const d = new Date(b.time * 1000);
            const hh = d.getUTCHours().toString().padStart(2, '0');
            const mm = d.getUTCMinutes().toString().padStart(2, '0');
            return {
              time: `${hh}:${mm} UTC`,
              timestamp: b.time,
              open: b.open,
              high: b.high,
              low: b.low,
              close: b.close,
              volume: b.volume
            };
          });

          setDataset({
            candles: formattedCandles,
            jumpPoints: []
          });
          setVisibleIndex(Math.floor(formattedCandles.length * 0.65));
          setIsPlaying(false);
          setManualTrades([]);
          setIsLoadingBars(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Error fetching replay bars from /api/replay/bars:', err);
    } finally {
      setIsLoadingBars(false);
    }

    const fallback = generateReplayDataset(sym, tf, 300);
    setDataset(fallback);
    setVisibleIndex(Math.floor(fallback.candles.length * 0.65));
    setIsPlaying(false);
    setManualTrades([]);
  }, []);

  useEffect(() => {
    loadBars(selectedSymbol, selectedTimeframe);
  }, [selectedSymbol, selectedTimeframe, loadBars]);

  const handleSymbolChange = (sym: string) => {
    setSelectedSymbol(sym);
    loadBars(sym, selectedTimeframe);
    showToast(`Loaded ${sym} historical market feed`, 'info');
  };

  const handleTimeframeChange = (tf: string) => {
    setSelectedTimeframe(tf);
    loadBars(selectedSymbol, tf);
    setIsTimeframeDropdownOpen(false);
    showToast(`Switched to ${tf} timeframe`, 'info');
  };

  const toggleIndicatorSetting = (key: keyof IndicatorSettings) => {
    const current = indicatorSettings[key] as { enabled: boolean };
    const updated = {
      ...indicatorSettings,
      [key]: {
        ...current,
        enabled: !current.enabled
      }
    };
    saveIndicatorSettings(updated);
  };

  const handleAddDrawing = (drawing: DrawingItem) => {
    setDrawings(prev => [...prev, drawing]);
    showToast(`Added ${drawing.type} drawing to chart`, 'info');
  };

  const handleClearDrawings = () => {
    setDrawings([]);
    showToast('Cleared all chart drawings', 'info');
  };

  const currentBar = dataset.candles[visibleIndex] || dataset.candles[0];
  const firstBar = dataset.candles[0];
  const lastBar = dataset.candles[dataset.candles.length - 1];
  const symbolMeta = AVAILABLE_SYMBOLS.find(s => s.id === selectedSymbol) || AVAILABLE_SYMBOLS[0];

  // All trades combined (Pre-seeded timeline trades + User simulated trades)
  const allCandidateTrades = useMemo(() => {
    return [...initialTimelineTrades, ...manualTrades];
  }, [initialTimelineTrades, manualTrades]);

  // =========================================================================
  // REAL-TIME SYNC ENGINE: Replay Timeline ↔ All Components
  // =========================================================================
  
  // 1. Calculate Active Open Position at current visibleIndex
  const activePosition: ReplayPosition | null = useMemo(() => {
    const matching = allCandidateTrades.find(t => {
      const openIdx = t.openBarIndex ?? 0;
      const closeIdx = t.closeBarIndex ?? 999999;
      return visibleIndex >= openIdx && visibleIndex < closeIdx;
    });

    if (!matching) return null;

    const currentPrice = currentBar ? currentBar.close : matching.entryPrice;
    const isBuy = matching.type === 'BUY';
    const pointDiff = isBuy 
      ? (currentPrice - matching.entryPrice)
      : (matching.entryPrice - currentPrice);
    
    const pnlPips = pointDiff / symbolMeta.pipSize;
    const pnl = pnlPips * symbolMeta.pipValuePerLot * matching.lots;

    return {
      ...matching,
      status: 'OPEN',
      currentPrice,
      pnl,
      pnlPips
    };
  }, [allCandidateTrades, visibleIndex, currentBar, symbolMeta]);

  // 2. Closed Trades History (WHERE trade.closeBarIndex <= visibleIndex)
  const tradeHistory: ReplayPosition[] = useMemo(() => {
    return allCandidateTrades
      .filter(t => {
        const closeIdx = t.closeBarIndex ?? 999999;
        return visibleIndex >= closeIdx;
      })
      .map(t => {
        const closePrice = t.closePrice ?? t.entryPrice;
        const isBuy = t.type === 'BUY';
        const pointDiff = isBuy 
          ? (closePrice - t.entryPrice)
          : (t.entryPrice - closePrice);
        const pnlPips = pointDiff / symbolMeta.pipSize;
        const pnl = t.pnl !== undefined ? t.pnl : (pnlPips * symbolMeta.pipValuePerLot * t.lots);

        return {
          ...t,
          status: 'CLOSED' as const,
          currentPrice: closePrice,
          pnl,
          pnlPips
        };
      })
      .reverse();
  }, [allCandidateTrades, visibleIndex, symbolMeta]);

  // 3. Trade Journal Synced by Timeline (WHERE trade.openBarIndex <= visibleIndex)
  const journalEntries: JournalEntry[] = useMemo(() => {
    return allCandidateTrades
      .filter(t => {
        const openIdx = t.openBarIndex ?? 0;
        return visibleIndex >= openIdx;
      })
      .map(t => {
        const openIdx = t.openBarIndex ?? 0;
        const closeIdx = t.closeBarIndex ?? 999999;
        const isOpen = visibleIndex < closeIdx;
        const barAtOpen = dataset.candles[openIdx] || currentBar;
        const currentPrice = currentBar ? currentBar.close : t.entryPrice;
        
        let pnl = t.pnl;
        let pnlPips = t.pnlPips;
        let exitPrice = t.closePrice;

        if (isOpen) {
          const isBuy = t.type === 'BUY';
          const pointDiff = isBuy ? (currentPrice - t.entryPrice) : (t.entryPrice - currentPrice);
          pnlPips = pointDiff / symbolMeta.pipSize;
          pnl = pnlPips * symbolMeta.pipValuePerLot * t.lots;
          exitPrice = undefined;
        }

        const note = customNotes[t.id] || (isOpen ? `Active ${t.type} trade running at bar #${openIdx + 1}` : `Closed on setup #${openIdx + 1}`);

        return {
          id: `j-${t.id}`,
          tradeId: t.id,
          dateTime: `Nov 12, ${barAtOpen.time}`,
          symbol: t.symbol,
          type: t.type,
          entryPrice: t.entryPrice,
          exitPrice,
          pnl: pnl ?? 0,
          pnlPips: pnlPips ?? 0,
          status: (isOpen ? 'OPEN' : 'CLOSED') as 'OPEN' | 'CLOSED',
          notes: note,
          barIndex: openIdx
        };
      })
      .reverse();
  }, [allCandidateTrades, visibleIndex, dataset.candles, currentBar, symbolMeta, customNotes]);

  // 4. Live Synced P&L, Balance & Account Stats
  const stats: ReplayAccountStats = useMemo(() => {
    const startingBalance = realStartingBalance;
    const realizedPnl = tradeHistory.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const floatingPnl = activePosition ? activePosition.pnl : 0;
    
    // Calculate Margin for active open position
    const contractSize = selectedSymbol === 'BTCUSD' ? 1 : (selectedSymbol === 'XAUUSD' ? 100 : 100000);
    const leverage = accountInfo?.leverage || 100;
    const margin = activePosition 
      ? parseFloat(((activePosition.entryPrice * activePosition.lots * contractSize) / leverage).toFixed(2))
      : 0;

    // Real-time balance calculation:
    // currentBalance = startingBalance - openMargin + realizedP&L
    const currentBalance = parseFloat((startingBalance - margin + realizedPnl).toFixed(2));
    // Equity = startingBalance + realizedPnl + floatingPnl
    const equity = parseFloat((startingBalance + realizedPnl + floatingPnl).toFixed(2));
    const freeMargin = Math.max(0, parseFloat((equity - margin).toFixed(2)));

    const totalTrades = tradeHistory.length;
    const winTrades = tradeHistory.filter(t => (t.pnl || 0) > 0).length;
    const lossTrades = tradeHistory.filter(t => (t.pnl || 0) < 0).length;
    const winRate = totalTrades > 0 ? Math.round((winTrades / totalTrades) * 100) : 100;

    return {
      startingBalance,
      currentBalance,
      equity,
      floatingPnl,
      realizedPnl,
      margin,
      freeMargin,
      totalTrades,
      winTrades,
      lossTrades,
      winRate,
      accountName: accountInfo?.accountName,
      isDemo: accountInfo?.isDemo
    };
  }, [realStartingBalance, tradeHistory, activePosition, selectedSymbol, accountInfo]);

  // Apply selected date/time from calendar picker
  const handleApplyCalendarDate = () => {
    // Jump to proportional point in history based on selected day / hour
    const targetRatio = (pickerDay / 30) * 0.8;
    const newIdx = Math.max(0, Math.min(dataset.candles.length - 1, Math.floor(dataset.candles.length * targetRatio)));
    setVisibleIndex(newIdx);
    setIsDatePickerOpen(false);
    showToast(`Replay jump to ${MONTH_NAMES[pickerMonth].slice(0, 3)} ${pickerDay}, ${pickerYear} ${pickerHour}:${pickerMinute}`, 'success');
  };

  // Advance 1 Bar Logic
  const stepForward = useCallback(() => {
    setVisibleIndex((prevIndex) => {
      if (prevIndex >= dataset.candles.length - 1) {
        setIsPlaying(false);
        showToast('Reached end of candle dataset', 'info');
        return prevIndex;
      }
      return prevIndex + 1;
    });
  }, [dataset.candles.length]);

  // Step backward 1 bar
  const stepBackward = useCallback(() => {
    setVisibleIndex((prev) => Math.max(0, prev - 1));
  }, []);

  // Continuous Auto Playback Loop
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.max(100, Math.floor(1000 / speed));
      timerRef.current = setInterval(() => {
        stepForward();
      }, intervalMs);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, speed, stepForward]);

  // Jump via Scissors Cut
  const handleCutAt = (barIndex: number) => {
    if (barIndex < 0 || barIndex >= dataset.candles.length) return;
    setVisibleIndex(barIndex);
    setIsPlaying(false);
    setIsScissorsActive(false);
    showToast(`Jumped to candle #${barIndex + 1} (${dataset.candles[barIndex]?.time})`, 'info');
  };

  // Reset to live / start
  const handleReset = () => {
    setVisibleIndex(Math.floor(dataset.candles.length * 0.65));
    setIsPlaying(false);
    setIsScissorsActive(false);
    showToast('Reset chart back to session baseline', 'info');
  };

  // Progress Bar Seek logic
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = clickX / rect.width;
    const newIdx = Math.round(percentage * (dataset.candles.length - 1));
    setVisibleIndex(newIdx);
  };

  const handleProgressBarMouseDown = () => {
    setIsSeeking(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isSeeking || !progressBarRef.current) return;
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percentage = clickX / rect.width;
      const newIdx = Math.round(percentage * (dataset.candles.length - 1));
      setVisibleIndex(newIdx);
    };

    const handleMouseUp = () => {
      if (isSeeking) setIsSeeking(false);
    };

    if (isSeeking) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSeeking, dataset.candles.length]);

  // Execute Simulated Trade (Recorded into timeline at visibleIndex)
  const handleSimulateTrade = () => {
    if (activePosition && activePosition.status === 'OPEN') {
      showToast('You already have an active simulated position open', 'danger');
      return;
    }

    const slNum = stopLoss ? parseFloat(stopLoss) : undefined;
    const tpNum = takeProfit ? parseFloat(takeProfit) : undefined;
    const tradeId = `pos-user-${Date.now()}`;

    const newPos: ReplayPosition = {
      id: tradeId,
      symbol: selectedSymbol,
      type: orderDirection,
      lots: lotSize,
      entryPrice: currentBar.close,
      currentPrice: currentBar.close,
      sl: slNum,
      tp: tpNum,
      pnl: 0,
      pnlPips: 0,
      status: 'OPEN',
      openTime: currentBar.time,
      openBarIndex: visibleIndex,
      closeBarIndex: visibleIndex + 8 // Default target window
    };

    setManualTrades(prev => [...prev, newPos]);
    setCustomNotes(prev => ({
      ...prev,
      [tradeId]: `Executed ${orderDirection} ${lotSize} lots at ${currentBar.close.toFixed(symbolMeta.precision)}. SL: ${slNum || 'None'}, TP: ${tpNum || 'None'}.`
    }));

    showToast(`Simulated ${orderDirection} ${lotSize} lots on ${selectedSymbol} at ${currentBar.close.toFixed(symbolMeta.precision)}`, 'success');
  };

  const handleClosePosition = () => {
    if (!activePosition) return;
    
    // Close the position at current visibleIndex
    setManualTrades(prev => {
      return prev.map(t => {
        if (t.id === activePosition.id) {
          return {
            ...t,
            closeBarIndex: visibleIndex,
            closeTime: currentBar.time,
            closePrice: currentBar.close,
            pnl: activePosition.pnl,
            pnlPips: activePosition.pnlPips,
            closeReason: 'MANUAL'
          };
        }
        return t;
      });
    });

    showToast(`Closed position at ${currentBar.close.toFixed(symbolMeta.precision)} (${activePosition.pnl >= 0 ? '+' : ''}$${activePosition.pnl.toFixed(2)})`, 'info');
  };

  // Jump to specific bar from journal or heatmap
  const jumpToBar = (idx: number) => {
    if (idx >= 0 && idx < dataset.candles.length) {
      setVisibleIndex(idx);
      showToast(`Jumped chart to bar #${idx + 1} (${dataset.candles[idx]?.time})`, 'info');
    }
  };

  // Save updated journal note
  const handleSaveNote = (tradeId: string) => {
    const rawId = tradeId.startsWith('j-') ? tradeId.replace('j-', '') : tradeId;
    setCustomNotes(prev => ({
      ...prev,
      [rawId]: noteInputText
    }));
    setEditingNoteId(null);
    showToast('Saved trading journal note', 'success');
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        stepForward();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        stepBackward();
      } else if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setIsScissorsActive(prev => !prev);
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stepForward, stepBackward]);

  // Mock News Feed
  const newsItems = [
    { tag: 'FOREX', headline: 'Fed Interest Rate Decision Tomorrow', time: '14:15' },
    { tag: 'CRYPTO', headline: 'Bitcoin Reaches All-Time High', time: '14:50' },
    { tag: 'STOCK', headline: 'Nvidia Earnings Beat Estimates', time: '14:55' },
    { tag: 'FOREX', headline: 'Fed Interest Rate Decision Analysis', time: '14:35' },
    { tag: 'STOCK', headline: 'Nvidia Earnings Beat Estimates', time: '14:35' },
    { tag: 'CRYPTO', headline: 'Bitcoin Reaches All-Time High', time: '14:30' },
    { tag: 'STOCK', headline: 'Nvidia Earnings Beat Estimates', time: '14:25' }
  ];

  const currentPriceFormatted = currentBar ? currentBar.close.toFixed(symbolMeta.precision) : '2418.50';
  const progressPercent = Math.min(100, Math.max(0, (visibleIndex / (dataset.candles.length - 1)) * 100));

  // APEX TRADER Risk / Reward & Pip Calculations
  const riskRewardCalc = useMemo(() => {
    const entry = currentBar ? currentBar.close : 0;
    const slVal = stopLoss ? parseFloat(stopLoss) : null;
    const tpVal = takeProfit ? parseFloat(takeProfit) : null;

    let slPips = 0;
    let tpPips = 0;
    let riskDollar = 0;
    let rewardDollar = 0;
    let rrRatio = '1:0.0';

    if (entry > 0 && slVal && !isNaN(slVal)) {
      const slDiff = Math.abs(entry - slVal);
      slPips = slDiff / symbolMeta.pipSize;
      riskDollar = slPips * symbolMeta.pipValuePerLot * lotSize;
    }

    if (entry > 0 && tpVal && !isNaN(tpVal)) {
      const tpDiff = Math.abs(tpVal - entry);
      tpPips = tpDiff / symbolMeta.pipSize;
      rewardDollar = tpPips * symbolMeta.pipValuePerLot * lotSize;
    }

    if (riskDollar > 0 && rewardDollar > 0) {
      const ratio = rewardDollar / riskDollar;
      rrRatio = `1:${ratio.toFixed(1)}`;
    } else if (riskDollar === 0 && rewardDollar > 0) {
      rrRatio = '1:∞';
    }

    return {
      slPips,
      tpPips,
      riskDollar,
      rewardDollar,
      rrRatio
    };
  }, [currentBar, stopLoss, takeProfit, lotSize, symbolMeta]);

  // Calendar Heatmap daily aggregation (Synced progressively as replay reaches each day)
  const calendarDays = useMemo(() => {
    const days = [];
    const currentReplayDay = pickerDay; // Defaults to Day 12
    
    // Static historical past days before current replay date
    const historicalCompletedDays: Record<number, { pnl: number; trades: number }> = {
      2: { pnl: 140.00, trades: 3 },
      3: { pnl: 280.50, trades: 4 },
      6: { pnl: -110.00, trades: 2 },
      7: { pnl: 560.00, trades: 5 },
      8: { pnl: 95.00, trades: 1 },
      9: { pnl: 340.00, trades: 3 },
      10: { pnl: -45.00, trades: 1 },
    };

    for (let d = 1; d <= 30; d++) {
      let pnl = 0;
      let trades = 0;
      const isLiveDay = (d === currentReplayDay);

      if (d < currentReplayDay && historicalCompletedDays[d]) {
        pnl = historicalCompletedDays[d].pnl;
        trades = historicalCompletedDays[d].trades;
      } else if (isLiveDay) {
        // Live Day 12 PnL calculated purely from live replay timeline
        pnl = stats.realizedPnl + stats.floatingPnl;
        trades = stats.totalTrades + (activePosition ? 1 : 0);
      }

      days.push({
        day: d,
        pnl,
        trades,
        isLiveDay
      });
    }
    return days;
  }, [pickerDay, stats.realizedPnl, stats.floatingPnl, stats.totalTrades, activePosition]);

  // Days in month calculation for the calendar picker
  const pickerDaysInMonth = useMemo(() => {
    return new Date(pickerYear, pickerMonth + 1, 0).getDate();
  }, [pickerYear, pickerMonth]);

  const pickerFirstDayOffset = useMemo(() => {
    // 0 = Sunday, 1 = Monday ... convert to Monday=0
    const day = new Date(pickerYear, pickerMonth, 1).getDay();
    return (day + 6) % 7;
  }, [pickerYear, pickerMonth]);

  return (
    <div className="w-full h-full flex flex-col bg-[#F0F3FA] dark:bg-[#0B0E14] text-gray-900 dark:text-neutral-100 font-sans select-none overflow-hidden transition-colors duration-200">
      
      {/* 1. TOP HEADER BANNER (STATUS & BROKER CONNECT) */}
      <header className="bg-white dark:bg-[#111722] border-b border-gray-200 dark:border-white/[0.08] flex items-center justify-between px-3 py-1.5 shrink-0 z-30 select-none text-xs transition-colors duration-200">
        
        {/* Left: Competition & Giveaway Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-md text-[11px] font-medium">
              <Trophy className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>Competition &quot;PaperPulse&quot; Starts in 2 Days</span>
            </div>
            <div className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-purple-700 dark:text-purple-400 px-2.5 py-1 rounded-md text-[11px] font-medium">
              <Gift className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
              <span>New Giveaway Live!</span>
            </div>
          </div>
        </div>

        {/* Right: Real Account Balance + MT5 Broker Sync Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#161D2A] px-3 py-1 rounded-lg border border-gray-200 dark:border-white/[0.08]">
            <div className="text-right">
              <div className="text-[9px] capitalize text-gray-500 dark:text-neutral-400 font-semibold flex items-center justify-end gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${accountInfo?.isDemo ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
                <span>{accountInfo?.accountName || 'Account Balance'}</span>
              </div>
              <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                ${stats.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-[10px] text-gray-400 dark:text-neutral-500 font-normal">{accountInfo?.currency || 'USD'}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#2563EB] to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Connect MT5</span>
            <span className="text-[9px] font-normal opacity-80 hidden sm:inline">(Broker Sync)</span>
          </button>
        </div>

      </header>

      {/* 2. REPLAY CONTROLS TOOLBAR & INTEGRATED PROGRESS BAR */}
      <div className="bg-[#FAFAFA] dark:bg-[#161D2A] border-b border-gray-200 dark:border-white/[0.08] px-3 py-2 shrink-0 select-none z-20 transition-colors duration-200">
        
        {/* Main Flex Row with Progress Bar in the Middle */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Replay Title + Real Calendar Date Picker Dropdown + Speed Dropdown Toggle + Timeframe Dropdown */}
          <div className="flex items-center gap-2 overflow-x-visible">
            
            {/* BAR-BY-BAR REPLAY Button */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#2563EB]/10 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400 font-bold font-mono text-xs border border-blue-200 dark:border-blue-800/60 hover:bg-[#2563EB]/20 transition-all cursor-pointer shrink-0"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isPlaying ? 'animate-spin' : ''}`} />
              <span>Bar-By-Bar Replay</span>
            </button>

            {/* REAL CALENDAR / DATE / MONTH / YEAR / TIMING SELECTION DROPDOWN */}
            <div className="relative" ref={datePickerRef}>
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className="bg-white dark:bg-[#111722] px-2.5 py-1 rounded text-[11px] font-mono text-gray-700 dark:text-neutral-300 border border-gray-200 dark:border-white/[0.08] flex items-center gap-1.5 hover:border-[#2563EB] dark:hover:border-blue-500 transition-all cursor-pointer shadow-2xs"
                title="Select Replay Date, Month, Year & Time"
              >
                <CalendarIcon className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
                <span>{MONTH_NAMES[pickerMonth].slice(0, 3)} {pickerDay}, {pickerYear} {pickerHour}:{pickerMinute}</span>
                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isDatePickerOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Real Calendar Dropdown Menu */}
              {isDatePickerOpen && (
                <div className="dropdown-menu gt-leave-date-picker-calendar ng-star-inserted show absolute left-0 top-full mt-1.5 z-50 bg-white dark:bg-[#111722] border border-gray-200 dark:border-white/[0.12] rounded-xl shadow-2xl p-3.5 w-72 text-gray-900 dark:text-neutral-100 font-sans text-xs animate-in fade-in slide-in-from-top-2">
                  
                  {/* Calendar Header: Month/Year navigation */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200 dark:border-white/[0.08]">
                    <button
                      type="button"
                      onClick={() => {
                        if (pickerMonth === 0) {
                          setPickerMonth(11);
                          setPickerYear(pickerYear - 1);
                        } else {
                          setPickerMonth(pickerMonth - 1);
                        }
                      }}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-neutral-300"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1 font-bold text-xs">
                      <select
                        value={pickerMonth}
                        onChange={(e) => setPickerMonth(parseInt(e.target.value, 10))}
                        className="bg-transparent font-bold cursor-pointer focus:outline-none"
                      >
                        {MONTH_NAMES.map((m, idx) => (
                          <option key={m} value={idx} className="bg-white dark:bg-[#111722]">{m}</option>
                        ))}
                      </select>
                      <select
                        value={pickerYear}
                        onChange={(e) => setPickerYear(parseInt(e.target.value, 10))}
                        className="bg-transparent font-bold cursor-pointer focus:outline-none font-mono"
                      >
                        {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map((yr) => (
                          <option key={yr} value={yr} className="bg-white dark:bg-[#111722]">{yr}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (pickerMonth === 11) {
                          setPickerMonth(0);
                          setPickerYear(pickerYear + 1);
                        } else {
                          setPickerMonth(pickerMonth + 1);
                        }
                      }}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-neutral-300"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Day Names Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-gray-400 dark:text-neutral-500 mb-1">
                    {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
                      <div key={d}>{d}</div>
                    ))}
                  </div>

                  {/* Month Days Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] mb-3">
                    {[...Array(pickerFirstDayOffset)].map((_, i) => (
                      <div key={`offset-${i}`} className="p-1 text-transparent" />
                    ))}
                    {[...Array(pickerDaysInMonth)].map((_, i) => {
                      const dayNum = i + 1;
                      const isSelected = dayNum === pickerDay;
                      return (
                        <button
                          key={dayNum}
                          type="button"
                          onClick={() => setPickerDay(dayNum)}
                          className={`p-1 rounded-md transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#2563EB] text-white font-bold shadow-xs'
                              : 'hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-300'
                          }`}
                        >
                          {dayNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Time Selection Inputs */}
                  <div className="pt-2 border-t border-gray-200 dark:border-white/[0.08] flex items-center justify-between text-xs font-mono">
                    <span className="text-[10px] text-gray-500 dark:text-neutral-400 font-sans font-semibold">Time (UTC):</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={pickerHour}
                        onChange={(e) => setPickerHour(e.target.value.padStart(2, '0').slice(-2))}
                        className="w-10 bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-white/[0.08] rounded px-1 py-0.5 text-center text-xs font-bold"
                      />
                      <span>:</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        step="5"
                        value={pickerMinute}
                        onChange={(e) => setPickerMinute(e.target.value.padStart(2, '0').slice(-2))}
                        className="w-10 bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-white/[0.08] rounded px-1 py-0.5 text-center text-xs font-bold"
                      />
                    </div>
                  </div>

                  {/* Apply & Cancel Actions */}
                  <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-gray-200 dark:border-white/[0.08]">
                    <button
                      type="button"
                      onClick={() => setIsDatePickerOpen(false)}
                      className="px-2.5 py-1 rounded text-xs text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyCalendarDate}
                      className="px-3 py-1 rounded-md bg-[#2563EB] hover:bg-blue-600 text-white font-semibold text-xs shadow-xs"
                    >
                      Apply Replay Time
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* SPEED DROPDOWN TOGGLE */}
            <div className="relative" ref={speedDropdownRef}>
              <button
                type="button"
                onClick={() => setIsSpeedDropdownOpen(!isSpeedDropdownOpen)}
                className="flex items-center gap-1.5 bg-white dark:bg-[#111722] px-2.5 py-1 rounded border border-gray-200 dark:border-white/[0.08] text-xs font-mono text-gray-700 dark:text-neutral-300 hover:border-[#2563EB] transition-all cursor-pointer shadow-2xs"
                title="Select Playback Speed"
              >
                <span className="text-[10px] text-gray-400 font-sans">SPD:</span>
                <span className="font-bold text-[#2563EB] dark:text-blue-400">{speed}x</span>
                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isSpeedDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSpeedDropdownOpen && (
                <div className="dropdown-menu absolute left-0 top-full mt-1 z-50 bg-white dark:bg-[#111722] border border-gray-200 dark:border-white/[0.12] rounded-lg shadow-xl p-1 w-24 text-xs font-mono animate-in fade-in">
                  {([0.5, 1, 2, 3, 5, 10] as SpeedMultiplier[]).map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => {
                        setSpeed(spd);
                        setIsSpeedDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2 py-1 rounded flex items-center justify-between cursor-pointer ${
                        speed === spd
                          ? 'bg-[#2563EB] text-white font-bold'
                          : 'text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <span>{spd}x</span>
                      {speed === spd && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* TIMEFRAME DROPDOWN TOGGLE */}
            <div className="relative" ref={tfDropdownRef}>
              <button
                type="button"
                onClick={() => setIsTimeframeDropdownOpen(!isTimeframeDropdownOpen)}
                className="flex items-center gap-1.5 bg-white dark:bg-[#111722] px-2.5 py-1 rounded border border-gray-200 dark:border-white/[0.08] text-xs font-mono text-gray-700 dark:text-neutral-300 hover:border-[#2563EB] transition-all cursor-pointer shadow-2xs"
                title="Select Timeframe"
              >
                <span className="text-[10px] text-gray-400 font-sans">TF:</span>
                <span className="font-bold text-[#2563EB] dark:text-blue-400">{selectedTimeframe}</span>
                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isTimeframeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isTimeframeDropdownOpen && (
                <div className="dropdown-menu absolute left-0 top-full mt-1 z-50 bg-white dark:bg-[#111722] border border-gray-200 dark:border-white/[0.12] rounded-lg shadow-xl p-1 w-28 text-xs font-mono animate-in fade-in">
                  {AVAILABLE_TIMEFRAMES.map((tf) => (
                    <button
                      key={tf.id}
                      type="button"
                      onClick={() => handleTimeframeChange(tf.id)}
                      className={`w-full text-left px-2 py-1 rounded flex items-center justify-between cursor-pointer ${
                        selectedTimeframe === tf.id
                          ? 'bg-[#2563EB] text-white font-bold'
                          : 'text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <span>{tf.label}</span>
                      <span className="text-[9px] opacity-70">{tf.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Indicators Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsIndicatorModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-[#111722] border border-gray-200 dark:border-white/[0.08] text-xs text-gray-700 dark:text-neutral-300 hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors cursor-pointer shadow-2xs"
            >
              <span className="font-serif italic font-bold text-[#2563EB] dark:text-blue-400">fx</span>
              <span>Indicators</span>
            </button>

          </div>

          {/* DRAGGABLE & CLICKABLE PROGRESS SEEK BAR IN FRONT OF CONTROLS */}
          <div className="flex-1 min-w-[200px] max-w-xl flex items-center gap-2.5 px-2">
            <span className="text-[10px] font-mono text-gray-500 dark:text-neutral-400 shrink-0">
              {firstBar?.time || '14:00'}
            </span>

            <div
              ref={progressBarRef}
              onClick={handleProgressBarClick}
              onMouseDown={handleProgressBarMouseDown}
              className="flex-1 h-2.5 bg-gray-200 dark:bg-neutral-800 rounded-full cursor-pointer relative overflow-hidden group shadow-inner"
              title="Click or drag to seek replay position"
            >
              {/* Progress Fill Bar */}
              <div
                className="h-full bg-gradient-to-r from-[#2563EB] to-cyan-500 rounded-full transition-[width] duration-75 relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-[#2563EB] rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform" />
              </div>
            </div>

            <div className="flex items-center gap-1 text-[10px] font-mono text-gray-700 dark:text-neutral-300 shrink-0">
              <span className="font-bold text-[#2563EB] dark:text-blue-400">{currentBar?.time || '14:25'}</span>
              <span className="bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 text-[9px] px-1.5 py-0.2 rounded font-bold ml-1">
                {visibleIndex + 1}/{dataset.candles.length}
              </span>
            </div>
          </div>

          {/* Right: Step Backward / Play / Pause / Step Forward / Scissors Cut / Reset Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsScissorsActive(!isScissorsActive)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                isScissorsActive 
                  ? 'bg-amber-500 text-slate-950 shadow-md animate-pulse' 
                  : 'bg-white dark:bg-[#111722] hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-300 border border-gray-200 dark:border-white/[0.08]'
              }`}
              title="Scissors Cut: Click any candle to jump back (C)"
            >
              <Scissors className="w-3.5 h-3.5 rotate-90" />
              <span>Cut</span>
            </button>

            {/* Step Back Button */}
            <button
              type="button"
              onClick={stepBackward}
              disabled={visibleIndex <= 0}
              className="p-1 rounded bg-white dark:bg-[#111722] hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-neutral-300 disabled:opacity-30 transition-colors cursor-pointer border border-gray-200 dark:border-white/[0.08]"
              title="Step backward 1 bar (Left Arrow)"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            {/* Play / Pause Button */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                isPlaying 
                  ? 'bg-amber-500 text-slate-950 shadow-xs animate-pulse' 
                  : 'bg-[#2563EB] hover:bg-blue-600 text-white shadow-xs'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            {/* Step Forward Button */}
            <button
              type="button"
              onClick={stepForward}
              disabled={isPlaying || visibleIndex >= dataset.candles.length - 1}
              className="p-1 rounded bg-white dark:bg-[#111722] hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-neutral-300 disabled:opacity-30 transition-colors cursor-pointer border border-gray-200 dark:border-white/[0.08]"
              title="Step forward 1 bar (Right Arrow)"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleReset}
              className="p-1 rounded bg-white dark:bg-[#111722] hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-amber-500 transition-colors cursor-pointer border border-gray-200 dark:border-white/[0.08]"
              title="Reset baseline (R)"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* 3. MAIN WORKSPACE: LEFT NAV + CENTER CHART + RIGHT EXECUTION/NEWS PANEL */}
      <div className="flex-1 flex w-full overflow-hidden min-h-0">
        
        {/* LEFT VERTICAL NAVIGATION */}
        <nav className="hidden md:flex w-14 bg-white dark:bg-[#111722] border-r border-gray-200 dark:border-white/[0.08] flex flex-col justify-between items-center py-2 shrink-0 select-none z-10 transition-colors duration-200">
          
          <div className="space-y-3 w-full flex flex-col items-center">
            {[
              { id: 'charts', label: 'Charts', icon: TrendingUp },
              { id: 'journal', label: 'Journal', icon: BookOpen },
              { id: 'news', label: 'News', icon: Newspaper },
              { id: 'affiliate', label: 'Affiliate', icon: Share2, href: '/affiliate' },
              { id: 'giveaway', label: 'Giveaway', icon: Gift, href: '/giveaways' },
              { id: 'compete', label: 'Compete', icon: Trophy, href: '/competitions' },
              { id: 'accounts', label: 'Accounts', icon: Layers, href: '/accounts' }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = leftNavActive === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setLeftNavActive(item.id as any);
                    if (item.href) {
                      router.push(item.href);
                    } else if (item.id === 'journal') {
                      setRightBottomTab('Trade Journal');
                      setIsBottomCollapsed(false);
                    } else if (item.id === 'news') {
                      setRightPanelTab('NEWS');
                    }
                  }}
                  className={`w-11 py-1.5 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 font-bold' 
                      : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 hover:bg-gray-50 dark:hover:bg-white/[0.04]'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[8.5px] font-sans font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="w-full flex flex-col items-center">
            <button
              type="button"
              onClick={() => {
                setLeftNavActive('settings');
                router.push('/settings');
              }}
              className={`w-11 py-1.5 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                leftNavActive === 'settings' 
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 font-bold' 
                  : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 hover:bg-gray-50 dark:hover:bg-white/[0.04]'
              }`}
              title="Settings"
            >
              <Settings className="w-4 h-4" />
              <span className="text-[8.5px] font-sans font-medium">Settings</span>
            </button>
          </div>

        </nav>

        {/* CENTER MAIN WORKSPACE: CHART VIEW */}
        <div className="flex-1 flex flex-col overflow-hidden relative bg-white dark:bg-[#121212] transition-colors duration-200">
          
          {/* Chart Header Bar (Symbol Selector Dropdown, Quick Tabs, OHLC, Live Close Badge) */}
          <div className="h-9 bg-gray-50/90 dark:bg-[#161D2A] border-b border-gray-200 dark:border-white/[0.08] px-3 flex items-center justify-between text-xs font-mono shrink-0 select-none">
            <div className="flex items-center gap-2 overflow-x-auto">
              {/* Symbol Selector Dropdown Trigger */}
              <div className="relative" ref={symbolDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsSymbolDropdownOpen(!isSymbolDropdownOpen)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded bg-white dark:bg-[#111722] border border-gray-200 dark:border-white/[0.1] font-bold text-gray-900 dark:text-neutral-100 hover:border-[#2563EB] transition-colors cursor-pointer shadow-2xs"
                  title="Switch Symbol / Pair"
                >
                  <span className="text-[#2563EB] dark:text-blue-400 font-bold">{selectedSymbol}</span>
                  <span className="text-gray-400 dark:text-neutral-500 text-[10px] hidden sm:inline">({symbolMeta.category})</span>
                  <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isSymbolDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isSymbolDropdownOpen && (
                  <div className="dropdown-menu absolute left-0 top-full mt-1.5 z-50 bg-white dark:bg-[#111722] border border-gray-200 dark:border-white/[0.12] rounded-xl shadow-2xl p-1.5 w-64 text-xs font-sans animate-in fade-in slide-in-from-top-2">
                    <div className="px-2 py-1 text-[10px] capitalize font-bold text-gray-400 dark:text-neutral-500 border-b border-gray-100 dark:border-white/[0.06] mb-1">
                      Available Trading Instruments
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-0.5">
                      {AVAILABLE_SYMBOLS.map((sym) => (
                        <button
                          key={sym.id}
                          type="button"
                          onClick={() => {
                            handleSymbolChange(sym.id);
                            setIsSymbolDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                            selectedSymbol === sym.id
                              ? 'bg-[#2563EB] text-white font-bold'
                              : 'text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="font-bold font-mono">{sym.id}</span>
                            <span className={`text-[10px] ${selectedSymbol === sym.id ? 'text-white/80' : 'text-gray-400 dark:text-neutral-500'}`}>{sym.name}</span>
                          </div>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${selectedSymbol === sym.id ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-neutral-800 text-gray-500'}`}>
                            {sym.category}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Pair Tabs */}
              <div className="hidden md:flex items-center gap-1 border-l border-gray-200 dark:border-white/[0.08] pl-2">
                {['XAUUSD', 'EURUSD', 'BTCUSD', 'NAS100', 'US30'].map((symId) => (
                  <button
                    key={symId}
                    type="button"
                    onClick={() => handleSymbolChange(symId)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all cursor-pointer ${
                      selectedSymbol === symId
                        ? 'bg-[#2563EB]/15 text-[#2563EB] dark:text-blue-400 font-bold border border-blue-300/40 dark:border-blue-700/40'
                        : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800/60'
                    }`}
                  >
                    {symId}
                  </button>
                ))}
              </div>

              <span className="text-gray-300 dark:text-neutral-700 hidden lg:inline">•</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded text-[10px] border border-emerald-200 dark:border-emerald-800/40 shrink-0">
                Live {currentPriceFormatted}
              </span>
              <span className="text-gray-500 dark:text-neutral-400 text-[11px] hidden xl:inline">
                O: {currentBar?.open?.toFixed(symbolMeta.precision)}  H: {currentBar?.high?.toFixed(symbolMeta.precision)}  L: {currentBar?.low?.toFixed(symbolMeta.precision)}  C: {currentBar?.close?.toFixed(symbolMeta.precision)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-gray-500 dark:text-neutral-400 text-[10px] shrink-0">
              <span className="text-gray-400 font-mono hidden sm:inline">{isLoadingBars ? 'Loading feed...' : `${dataset.candles.length} bars`}</span>
            </div>
          </div>

          {/* Candle Canvas */}
          <div className="flex-1 relative overflow-hidden">
            <ReplayChartCanvas
              candles={dataset.candles}
              visibleIndex={visibleIndex}
              isScissorsActive={isScissorsActive}
              onCutAt={handleCutAt}
              activePosition={activePosition}
              tradeHistory={tradeHistory}
              symbol={selectedSymbol}
              timeframe={selectedTimeframe}
            />

            {/* In-Chart Toast */}
            {toastMessage && (
              <div className={`absolute bottom-4 left-4 z-40 px-3 py-1.5 rounded-lg text-xs font-mono font-bold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 ${
                toastMessage.type === 'success'
                  ? 'bg-emerald-600 text-white'
                  : toastMessage.type === 'danger'
                  ? 'bg-rose-600 text-white'
                  : 'bg-[#2563EB] text-white'
              }`}>
                {toastMessage.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                <span>{toastMessage.text}</span>
              </div>
            )}
          </div>

          {/* Chart Period Switcher Footer (1D | 5D | 1M | 3M | 6M | YTD | 1Y | All) */}
          <div className="h-6 bg-gray-50/90 dark:bg-[#161D2A] border-t border-gray-200 dark:border-white/[0.08] px-3 flex items-center justify-between text-[10px] font-mono text-gray-500 dark:text-neutral-400 shrink-0 select-none">
            <div className="flex items-center gap-1.5">
              {['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', 'All'].map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`px-1 py-0.5 rounded hover:text-[#2563EB] dark:hover:text-blue-400 cursor-pointer ${p === '1D' ? 'text-[#2563EB] dark:text-blue-400 font-bold' : ''}`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span>{currentBar?.time || '18:33:32'} (UTC)</span>
              <span className="text-gray-300 dark:text-neutral-700">|</span>
              <span className="hover:text-gray-800 dark:hover:text-neutral-200 cursor-pointer">%</span>
              <span className="hover:text-gray-800 dark:hover:text-neutral-200 cursor-pointer">log</span>
              <span className="text-[#2563EB] dark:text-blue-400 font-bold cursor-pointer">auto</span>
            </div>
          </div>

        </div>

        {/* RIGHT ORDER EXECUTION & NEWS PANEL */}
        <aside className="w-[280px] bg-white dark:bg-[#111722] border-l border-gray-200 dark:border-white/[0.08] flex flex-col shrink-0 select-none overflow-y-auto transition-colors duration-200">
          
          {/* Top Panel Tabs: EXECUTION | NEWS */}
          <div className="flex border-b border-gray-200 dark:border-white/[0.08] bg-[#FAFAFA] dark:bg-[#161D2A] text-xs font-bold font-mono">
            <button
              type="button"
              onClick={() => setRightPanelTab('EXECUTION')}
              className={`flex-1 py-2 text-center transition-colors cursor-pointer ${
                rightPanelTab === 'EXECUTION'
                  ? 'text-[#2563EB] dark:text-blue-400 border-b-2 border-[#2563EB] dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/30 font-bold'
                  : 'text-gray-500 dark:text-neutral-400 hover:text-gray-800 dark:hover:text-neutral-200'
              }`}
            >
              Execution
            </button>
            <button
              type="button"
              onClick={() => setRightPanelTab('NEWS')}
              className={`flex-1 py-2 text-center transition-colors cursor-pointer ${
                rightPanelTab === 'NEWS'
                  ? 'text-[#2563EB] dark:text-blue-400 border-b-2 border-[#2563EB] dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/30 font-bold'
                  : 'text-gray-500 dark:text-neutral-400 hover:text-gray-800 dark:hover:text-neutral-200'
              }`}
            >
              News
            </button>
          </div>

          {rightPanelTab === 'EXECUTION' ? (
            <div className="p-3.5 space-y-3 text-xs select-none bg-white dark:bg-[#111722] text-gray-900 dark:text-neutral-100">
              
              {/* Form Selector Dropdown Card */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsFormDropdownOpen(!isFormDropdownOpen)}
                  className="w-full bg-white dark:bg-[#161D2A] border border-gray-200 dark:border-white/[0.1] rounded-xl px-3.5 py-2.5 flex items-center justify-between shadow-2xs hover:border-gray-300 dark:hover:border-white/[0.2] transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-xs text-gray-800 dark:text-neutral-100">{executionFormMode}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isFormDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isFormDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white dark:bg-[#161D2A] border border-gray-200 dark:border-white/[0.1] rounded-xl shadow-xl overflow-hidden py-1">
                    {(['Regular form', 'One-click form', 'Risk calculator form'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          setExecutionFormMode(mode);
                          setIsFormDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs font-semibold cursor-pointer transition-colors ${
                          executionFormMode === mode
                            ? 'text-[#2563EB] bg-blue-50/60 dark:bg-blue-950/40 font-bold'
                            : 'text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ========================================================= */}
              {/* VIEW 1: ONE-CLICK FORM */}
              {/* ========================================================= */}
              {executionFormMode === 'One-click form' && (
                <div className="space-y-3">
                  {/* Segmented Pill Tabs: Market / Limit */}
                  <div className="bg-gray-100 dark:bg-[#161D2A] p-1 rounded-xl flex">
                    <button
                      type="button"
                      onClick={() => setOrderTab('Market')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        orderTab === 'Market'
                          ? 'bg-white dark:bg-[#1E293B] text-gray-900 dark:text-white shadow-xs font-bold'
                          : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Market
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderTab('Limit')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        orderTab === 'Limit'
                          ? 'bg-white dark:bg-[#1E293B] text-gray-900 dark:text-white shadow-xs font-bold'
                          : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Limit
                    </button>
                  </div>

                  {/* Volume Stepper Field */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-600 dark:text-neutral-400 block">
                      Volume
                    </label>
                    <div className="flex items-center bg-[#F8FAFC] dark:bg-[#161D2A] border border-gray-200 dark:border-white/[0.1] rounded-xl px-2.5 py-1">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={lotSize}
                        onChange={(e) => setLotSize(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                        className="flex-1 bg-transparent text-xs font-bold font-mono text-gray-900 dark:text-neutral-100 focus:outline-none py-1"
                      />
                      <span className="text-[11px] text-gray-400 dark:text-neutral-500 font-medium mr-2">Lots</span>
                      <div className="flex items-center gap-0.5 border-l border-gray-200 dark:border-white/[0.1] pl-2">
                        <button
                          type="button"
                          onClick={() => setLotSize((prev) => Math.max(0.01, parseFloat((prev - 0.01).toFixed(2))))}
                          className="w-6 h-6 flex items-center justify-center text-gray-500 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setLotSize((prev) => parseFloat((prev + 0.01).toFixed(2)))}
                          className="w-6 h-6 flex items-center justify-center text-gray-500 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Big Action Buttons: Sell / Buy */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOrderDirection('SELL');
                        handleSimulateTrade();
                      }}
                      className="py-3 px-2 rounded-xl bg-[#EF4444] hover:bg-red-600 text-white flex flex-col items-center justify-center shadow-md shadow-red-500/20 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <span className="text-[11px] font-semibold">Sell</span>
                      <span className="text-sm font-extrabold font-mono mt-0.5">
                        {currentPriceFormatted}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOrderDirection('BUY');
                        handleSimulateTrade();
                      }}
                      className="py-3 px-2 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white flex flex-col items-center justify-center shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <span className="text-[11px] font-semibold">Buy</span>
                      <span className="text-sm font-extrabold font-mono mt-0.5">
                        {(currentBar ? (currentBar.close + symbolMeta.pipSize * 2.6).toFixed(symbolMeta.precision) : '2418.76')}
                      </span>
                    </button>
                  </div>

                  {/* Sentiment Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-[#EF4444]">67%</span>
                      <span className="text-[#2563EB]">33%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 dark:bg-neutral-800 rounded-full flex overflow-hidden">
                      <div className="bg-[#EF4444] h-full rounded-l-full" style={{ width: '67%' }} />
                      <div className="bg-[#2563EB] h-full rounded-r-full" style={{ width: '33%' }} />
                    </div>
                  </div>

                  {/* Order Metrics & Fees */}
                  <div className="space-y-1.5 pt-1 text-[11px]">
                    <div className="flex justify-between items-center text-gray-500 dark:text-neutral-400">
                      <span>Fees:</span>
                      <div className="flex items-center gap-1 font-mono text-gray-800 dark:text-neutral-200">
                        <span>≈ 0.26 USD</span>
                        <Info className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-gray-500 dark:text-neutral-400">
                      <span>Leverage:</span>
                      <div className="flex items-center gap-1 font-mono text-gray-800 dark:text-neutral-200">
                        <span>1:{accountInfo?.leverage || 2000}</span>
                        <Info className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-gray-500 dark:text-neutral-400">
                      <span>Margin:</span>
                      <span className="font-mono font-bold text-gray-800 dark:text-neutral-200">
                        {((currentBar?.close || 2400) * lotSize * 0.05).toFixed(2)} USD
                      </span>
                    </div>

                    {/* More expandable */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setIsMoreOpen(!isMoreOpen)}
                        className="text-[11px] text-gray-500 hover:text-gray-800 dark:hover:text-neutral-200 flex items-center gap-1 cursor-pointer"
                      >
                        <span>More</span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isMoreOpen && (
                        <div className="mt-2 space-y-1 pl-1 text-[10px] text-gray-400 border-l border-gray-200 dark:border-white/[0.1]">
                          <div className="flex justify-between">
                            <span>Pip Value:</span>
                            <span>${(symbolMeta.pipValuePerLot * lotSize).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Execution:</span>
                            <span>Instant DMA</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* VIEW 2: RISK CALCULATOR FORM & REGULAR FORM */}
              {/* ========================================================= */}
              {executionFormMode !== 'One-click form' && (
                <div className="space-y-3">
                  
                  {/* Top Quote Container with Spread Pill in between */}
                  <div className="relative border border-gray-200 dark:border-white/[0.1] rounded-2xl p-1 bg-white dark:bg-[#161D2A] flex">
                    {/* Sell Half */}
                    <button
                      type="button"
                      onClick={() => setOrderDirection('SELL')}
                      className={`flex-1 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                        orderDirection === 'SELL'
                          ? 'bg-red-50/70 dark:bg-red-950/30'
                          : 'hover:bg-gray-50 dark:hover:bg-neutral-800/40'
                      }`}
                    >
                      <div className="text-[11px] font-semibold text-[#EF4444]">Sell</div>
                      <div className="text-sm font-extrabold font-mono text-[#EF4444] mt-0.5">
                        {currentPriceFormatted}
                      </div>
                    </button>

                    {/* Buy Half */}
                    <button
                      type="button"
                      onClick={() => setOrderDirection('BUY')}
                      className={`flex-1 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                        orderDirection === 'BUY'
                          ? 'bg-blue-50/70 dark:bg-blue-950/30'
                          : 'hover:bg-gray-50 dark:hover:bg-neutral-800/40'
                      }`}
                    >
                      <div className="text-[11px] font-semibold text-[#2563EB]">Buy</div>
                      <div className="text-sm font-extrabold font-mono text-[#2563EB] mt-0.5">
                        {(currentBar ? (currentBar.close + symbolMeta.pipSize * 2.6).toFixed(symbolMeta.precision) : '2418.76')}
                      </div>
                    </button>
                  </div>

                  {/* Sentiment Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-[#EF4444]">{executionFormMode === 'Regular form' ? '80%' : '67%'}</span>
                      <span className="text-[#2563EB]">{executionFormMode === 'Regular form' ? '20%' : '33%'}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 dark:bg-neutral-800 rounded-full flex overflow-hidden">
                      <div
                        className="bg-[#EF4444] h-full rounded-l-full"
                        style={{ width: executionFormMode === 'Regular form' ? '80%' : '67%' }}
                      />
                      <div
                        className="bg-[#2563EB] h-full rounded-r-full"
                        style={{ width: executionFormMode === 'Regular form' ? '20%' : '33%' }}
                      />
                    </div>
                  </div>

                  {/* Segmented Pill Tabs: Market / Pending */}
                  <div className="bg-gray-100 dark:bg-[#161D2A] p-1 rounded-xl flex">
                    <button
                      type="button"
                      onClick={() => setOrderTab('Market')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        orderTab === 'Market'
                          ? 'bg-white dark:bg-[#1E293B] text-gray-900 dark:text-white shadow-xs font-bold'
                          : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Market
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderTab('Pending')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        orderTab === 'Pending'
                          ? 'bg-white dark:bg-[#1E293B] text-gray-900 dark:text-white shadow-xs font-bold'
                          : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Pending
                    </button>
                  </div>

                  {/* Regular Form Volume Stepper */}
                  {executionFormMode === 'Regular form' && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-600 dark:text-neutral-400 block">
                        Volume
                      </label>
                      <div className="flex items-center bg-[#F8FAFC] dark:bg-[#161D2A] border border-gray-200 dark:border-white/[0.1] rounded-xl px-2.5 py-1">
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={lotSize}
                          onChange={(e) => setLotSize(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                          className="flex-1 bg-transparent text-xs font-bold font-mono text-gray-900 dark:text-neutral-100 focus:outline-none py-1"
                        />
                        <span className="text-[11px] text-gray-400 dark:text-neutral-500 font-medium mr-2">Lots</span>
                        <div className="flex items-center gap-0.5 border-l border-gray-200 dark:border-white/[0.1] pl-2">
                          <button
                            type="button"
                            onClick={() => setLotSize((prev) => Math.max(0.01, parseFloat((prev - 0.01).toFixed(2))))}
                            className="w-6 h-6 flex items-center justify-center text-gray-500 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setLotSize((prev) => parseFloat((prev + 0.01).toFixed(2)))}
                            className="w-6 h-6 flex items-center justify-center text-gray-500 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Risk Calculator Risk Row */}
                  {executionFormMode === 'Risk calculator form' && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-semibold text-gray-600 dark:text-neutral-400">Risk</label>
                        <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      <div className="flex items-center bg-[#F8FAFC] dark:bg-[#161D2A] border border-gray-200 dark:border-white/[0.1] rounded-xl px-2.5 py-1">
                        <input
                          type="text"
                          placeholder="Not set"
                          value={riskAmount}
                          onChange={(e) => setRiskAmount(e.target.value)}
                          className="flex-1 bg-transparent text-xs font-mono font-semibold text-gray-900 dark:text-neutral-100 placeholder-gray-400 focus:outline-none py-1"
                        />
                        <select
                          value={riskUnit}
                          onChange={(e) => setRiskUnit(e.target.value as 'USD' | '%')}
                          className="bg-transparent text-[11px] font-semibold text-gray-600 dark:text-neutral-300 mr-2 focus:outline-none cursor-pointer"
                        >
                          <option value="USD" className="dark:bg-[#161D2A]">USD</option>
                          <option value="%" className="dark:bg-[#161D2A]">%</option>
                        </select>
                        <div className="flex items-center gap-0.5 border-l border-gray-200 dark:border-white/[0.1] pl-2">
                          <button
                            type="button"
                            onClick={() => setRiskAmount((prev) => `${Math.max(0, (parseFloat(prev) || 0) - 10)}`)}
                            className="w-6 h-6 flex items-center justify-center text-gray-500 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setRiskAmount((prev) => `${(parseFloat(prev) || 0) + 10}`)}
                            className="w-6 h-6 flex items-center justify-center text-gray-500 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stop Loss Field */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-semibold text-gray-600 dark:text-neutral-400">Stop Loss</label>
                      <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <div className="flex items-center bg-[#F8FAFC] dark:bg-[#161D2A] border border-gray-200 dark:border-white/[0.1] rounded-xl px-2.5 py-1">
                      <input
                        type="text"
                        placeholder="Not set"
                        value={stopLoss}
                        onChange={(e) => setStopLoss(e.target.value)}
                        className="flex-1 bg-transparent text-xs font-mono font-semibold text-gray-900 dark:text-neutral-100 placeholder-gray-400 focus:outline-none py-1"
                      />
                      <select
                        value={slUnit}
                        onChange={(e) => setSlUnit(e.target.value as 'Pips' | 'Price')}
                        className="bg-transparent text-[11px] font-semibold text-gray-600 dark:text-neutral-300 mr-2 focus:outline-none cursor-pointer"
                      >
                        <option value="Pips" className="dark:bg-[#161D2A]">Pips</option>
                        <option value="Price" className="dark:bg-[#161D2A]">Price</option>
                      </select>
                      <div className="flex items-center gap-0.5 border-l border-gray-200 dark:border-white/[0.1] pl-2">
                        <button
                          type="button"
                          onClick={() => {
                            const val = parseFloat(stopLoss) || (currentBar ? currentBar.close : 2418);
                            setStopLoss((val - (slUnit === 'Pips' ? 5 : symbolMeta.pipSize * 5)).toFixed(symbolMeta.precision));
                          }}
                          className="w-6 h-6 flex items-center justify-center text-gray-500 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const val = parseFloat(stopLoss) || (currentBar ? currentBar.close : 2418);
                            setStopLoss((val + (slUnit === 'Pips' ? 5 : symbolMeta.pipSize * 5)).toFixed(symbolMeta.precision));
                          }}
                          className="w-6 h-6 flex items-center justify-center text-gray-500 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Take Profit Field */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-semibold text-gray-600 dark:text-neutral-400">Take Profit</label>
                      <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <div className="flex items-center bg-[#F8FAFC] dark:bg-[#161D2A] border border-gray-200 dark:border-white/[0.1] rounded-xl px-2.5 py-1">
                      <input
                        type="text"
                        placeholder="Not set"
                        value={takeProfit}
                        onChange={(e) => setTakeProfit(e.target.value)}
                        className="flex-1 bg-transparent text-xs font-mono font-semibold text-gray-900 dark:text-neutral-100 placeholder-gray-400 focus:outline-none py-1"
                      />
                      <select
                        value={tpUnit}
                        onChange={(e) => setTpUnit(e.target.value as 'Pips' | 'Price')}
                        className="bg-transparent text-[11px] font-semibold text-gray-600 dark:text-neutral-300 mr-2 focus:outline-none cursor-pointer"
                      >
                        <option value="Pips" className="dark:bg-[#161D2A]">Pips</option>
                        <option value="Price" className="dark:bg-[#161D2A]">Price</option>
                      </select>
                      <div className="flex items-center gap-0.5 border-l border-gray-200 dark:border-white/[0.1] pl-2">
                        <button
                          type="button"
                          onClick={() => {
                            const val = parseFloat(takeProfit) || (currentBar ? currentBar.close : 2418);
                            setTakeProfit((val - (tpUnit === 'Pips' ? 10 : symbolMeta.pipSize * 10)).toFixed(symbolMeta.precision));
                          }}
                          className="w-6 h-6 flex items-center justify-center text-gray-500 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const val = parseFloat(takeProfit) || (currentBar ? currentBar.close : 2418);
                            setTakeProfit((val + (tpUnit === 'Pips' ? 10 : symbolMeta.pipSize * 10)).toFixed(symbolMeta.precision));
                          }}
                          className="w-6 h-6 flex items-center justify-center text-gray-500 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Execute Button */}
                  <div className="pt-1">
                    {activePosition && activePosition.status === 'OPEN' ? (
                      <button
                        type="button"
                        onClick={handleClosePosition}
                        className="w-full py-3 rounded-xl font-bold text-xs capitalize shadow-md bg-[#EF4444] hover:bg-red-600 text-white transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>CLOSE POSITION (P&L: {activePosition.pnl >= 0 ? '+' : ''}${activePosition.pnl.toFixed(2)})</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSimulateTrade}
                        className={`w-full py-3 rounded-xl font-bold text-xs  shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] ${
                          orderDirection === 'BUY'
                            ? 'bg-[#2563EB] hover:bg-blue-600 text-white shadow-blue-500/20'
                            : 'bg-[#EF4444] hover:bg-red-600 text-white shadow-red-500/20'
                        }`}
                      >
                        <Zap className="w-4 h-4 fill-current" />
                        <span>Simulate {orderDirection} Order</span>
                      </button>
                    )}
                  </div>

                </div>
              )}

            </div>
          ) : (
            /* NEWS TAB CONTENT */
            <div className="p-2 space-y-1.5 font-mono text-xs overflow-y-auto">
              <div className="text-[10px] text-gray-500 dark:text-neutral-400 capitalize font-sans font-bold px-1 py-1">
                Market Headlines
              </div>
              {newsItems.map((item, idx) => (
                <div key={idx} className="p-2 rounded bg-gray-50 dark:bg-[#161D2A] border border-gray-200 dark:border-white/[0.08] space-y-1 hover:border-gray-300 dark:hover:border-white/[0.15] transition-colors">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className={`px-1 py-0.2 rounded font-bold ${
                      item.tag === 'CRYPTO' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400' :
                      item.tag === 'FOREX' ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400' : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                    }`}>
                      [{item.tag}]
                    </span>
                    <span className="text-gray-400 dark:text-neutral-500">{item.time}</span>
                  </div>
                  <div className="text-gray-800 dark:text-neutral-200 text-[11px] leading-snug font-sans">
                    {item.headline}
                  </div>
                </div>
              ))}
            </div>
          )}

        </aside>

      </div>

      {/* 4. BOTTOM DOCKED TERMINAL: SPLIT 50/50 VIEW (LEFT: POSITIONS/PENDING/HISTORY | RIGHT: JOURNAL/HEATMAP/LOGS) */}
      <footer 
        style={{ height: isBottomCollapsed ? '30px' : '175px' }} 
        className="bg-white dark:bg-[#111722] border-t border-gray-200 dark:border-white/[0.08] flex flex-col shrink-0 transition-[height] duration-200 ease-in-out select-none z-10 overflow-hidden"
      >
        {/* Unified Bottom Bar Header */}
        <div className="h-8 bg-[#FAFAFA] dark:bg-[#161D2A] border-b border-gray-200 dark:border-white/[0.08] px-3 flex items-center justify-between text-xs font-mono shrink-0 select-none gap-2">
          {/* Left Side Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setIsBottomCollapsed(!isBottomCollapsed)}
              className="p-1 text-gray-500 dark:text-neutral-400 hover:text-gray-800 dark:hover:text-neutral-200 mr-1 cursor-pointer"
              title={isBottomCollapsed ? 'Expand Terminal' : 'Collapse Terminal'}
            >
              {isBottomCollapsed ? <ChevronUp className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {[
              'Positions',
              'Pending Orders',
              'Order History'
            ].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setLeftBottomTab(tab as any);
                  if (isBottomCollapsed) setIsBottomCollapsed(false);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                  leftBottomTab === tab && !isBottomCollapsed
                    ? 'text-[#2563EB] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-b-2 border-[#2563EB] dark:border-blue-400'
                    : 'text-gray-500 dark:text-neutral-400 hover:text-gray-800 dark:hover:text-neutral-200 hover:bg-gray-100 dark:hover:bg-white/[0.04]'
                }`}
              >
                {tab === 'Positions' ? `Positions (${activePosition ? 1 : 0})` : 
                 tab === 'Order History' ? `Order History (${tradeHistory.length})` : tab}
              </button>
            ))}
          </div>

          {/* Right Side Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {[
              'Trade Journal',
              'Calendar Heatmap',
              'Automated Logs'
            ].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setRightBottomTab(tab as any);
                  if (isBottomCollapsed) setIsBottomCollapsed(false);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                  rightBottomTab === tab && !isBottomCollapsed
                    ? 'text-[#2563EB] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-b-2 border-[#2563EB] dark:border-blue-400'
                    : 'text-gray-500 dark:text-neutral-400 hover:text-gray-800 dark:hover:text-neutral-200 hover:bg-gray-100 dark:hover:bg-white/[0.04]'
                }`}
              >
                {tab === 'Trade Journal' ? `Trade Journal (${journalEntries.length})` : tab}
              </button>
            ))}

            <div className="text-[10px] text-gray-400 dark:text-neutral-400 hidden xl:flex items-center gap-1.5 ml-2 pl-2 border-l border-gray-200 dark:border-white/[0.08]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#089981] animate-pulse" />
              <span>Sync</span>
            </div>
          </div>
        </div>

        {/* 50/50 Split Terminal Content Area */}
        {!isBottomCollapsed && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-white/[0.08] bg-white dark:bg-[#111722]">
            
            {/* === LEFT HALF: POSITIONS / PENDING ORDERS / ORDER HISTORY === */}
            <div className="w-full md:w-1/2 flex-1 overflow-auto p-2 text-xs font-mono flex flex-col">
              {leftBottomTab === 'Positions' || leftBottomTab === 'Order History' ? (
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-neutral-400 text-[10px] capitalize font-sans">
                      <th className="py-1 px-1.5">Symbol</th>
                      <th className="py-1 px-1.5">Type</th>
                      <th className="py-1 px-1.5">Lots</th>
                      <th className="py-1 px-1.5">Entry</th>
                      <th className="py-1 px-1.5">Mark/Exit</th>
                      <th className="py-1 px-1.5 text-right">P&L</th>
                      <th className="py-1 px-1.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                    {/* Active Position */}
                    {leftBottomTab === 'Positions' && activePosition ? (
                      <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02] text-gray-800 dark:text-neutral-200">
                        <td className="py-1 px-1.5 font-bold text-[#2563EB] dark:text-blue-400">{activePosition.symbol}</td>
                        <td className="py-1 px-1.5">
                          <span className={`px-1 py-0.2 rounded text-[9px] font-bold ${activePosition.type === 'BUY' ? 'bg-[#089981]/10 text-[#089981]' : 'bg-[#f23645]/10 text-[#f23645]'}`}>
                            {activePosition.type}
                          </span>
                        </td>
                        <td className="py-1 px-1.5">{activePosition.lots.toFixed(2)}</td>
                        <td className="py-1 px-1.5">${activePosition.entryPrice.toFixed(2)}</td>
                        <td className="py-1 px-1.5 font-bold">${activePosition.currentPrice?.toFixed(2) || currentPriceFormatted}</td>
                        <td className={`py-1 px-1.5 text-right font-bold ${activePosition.pnl >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                          {activePosition.pnl >= 0 ? '+' : ''}${activePosition.pnl.toFixed(2)}
                        </td>
                        <td className="py-1 px-1.5 text-right">
                          <button
                            type="button"
                            onClick={handleClosePosition}
                            className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                          >
                            Close
                          </button>
                        </td>
                      </tr>
                    ) : leftBottomTab === 'Positions' && !activePosition ? (
                      <tr>
                        <td colSpan={7} className="text-center py-6 text-gray-400 dark:text-neutral-500 text-[11px]">
                          No open positions in current replay bar.
                        </td>
                      </tr>
                    ) : null}

                    {/* Trade History */}
                    {leftBottomTab === 'Order History' && tradeHistory.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-6 text-gray-400 dark:text-neutral-500 text-[11px]">
                          No closed trades recorded yet.
                        </td>
                      </tr>
                    ) : null}

                    {leftBottomTab === 'Order History' && tradeHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] text-gray-700 dark:text-neutral-300">
                        <td className="py-1 px-1.5 font-bold text-gray-900 dark:text-neutral-200">{item.symbol}</td>
                        <td className="py-1 px-1.5">
                          <span className={`px-1 py-0.2 rounded text-[9px] font-bold ${item.type === 'BUY' ? 'bg-[#089981]/10 text-[#089981]' : 'bg-[#f23645]/10 text-[#f23645]'}`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="py-1 px-1.5">{item.lots.toFixed(2)}</td>
                        <td className="py-1 px-1.5">${item.entryPrice.toFixed(2)}</td>
                        <td className="py-1 px-1.5">${item.closePrice?.toFixed(2) || item.currentPrice?.toFixed(2) || '--'}</td>
                        <td className={`py-1 px-1.5 text-right font-bold ${item.pnl >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                          {item.pnl >= 0 ? '+' : ''}${item.pnl.toFixed(2)}
                        </td>
                        <td className="py-1 px-1.5 text-right">
                          <button
                            type="button"
                            onClick={() => item.openBarIndex !== undefined && jumpToBar(item.openBarIndex)}
                            className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-[#2563EB] hover:text-white cursor-pointer"
                            title="Jump chart to trade entry"
                          >
                            Jump
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-gray-400 dark:text-neutral-500 text-center py-6 text-[11px]">
                  No pending limit orders active.
                </div>
              )}
            </div>

            {/* === RIGHT HALF: TRADE JOURNAL / CALENDAR HEATMAP / AUTOMATED LOGS === */}
            <div className="w-full md:w-1/2 flex-1 overflow-auto p-2 text-xs font-mono flex flex-col bg-gray-50/50 dark:bg-[#111722]">
              {rightBottomTab === 'Trade Journal' ? (
                /* TRADING JOURNAL */
                <div className="space-y-1.5">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-neutral-400 text-[10px] capitalize font-sans">
                        <th className="py-1 px-1.5">Time</th>
                        <th className="py-1 px-1.5">Pair</th>
                        <th className="py-1 px-1.5">P&L</th>
                        <th className="py-1 px-1.5">Notes</th>
                        <th className="py-1 px-1.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                      {journalEntries.map((j) => (
                        <tr key={j.id} className="hover:bg-gray-100/60 dark:hover:bg-white/[0.02] text-gray-700 dark:text-neutral-300">
                          <td className="py-1 px-1.5 text-gray-500 dark:text-neutral-400 whitespace-nowrap text-[10px]">{j.dateTime.split(', ')[1] || j.dateTime}</td>
                          <td className="py-1 px-1.5 font-bold text-gray-900 dark:text-neutral-200 text-[10px]">{j.symbol}</td>
                          <td className={`py-1 px-1.5 font-bold text-[10px] ${j.pnl >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                            {j.pnl >= 0 ? '+' : ''}${j.pnl.toFixed(2)}
                          </td>
                          <td className="py-1 px-1.5 max-w-[150px]">
                            {editingNoteId === j.id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={noteInputText}
                                  onChange={(e) => setNoteInputText(e.target.value)}
                                  className="flex-1 bg-white dark:bg-[#161D2A] border border-blue-500 rounded px-1 py-0.2 text-[10px] text-gray-900 dark:text-neutral-100"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveNote(j.id)}
                                  className="p-0.5 rounded bg-[#2563EB] text-white hover:bg-blue-700"
                                >
                                  <Check className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between group">
                                <span className="truncate text-gray-600 dark:text-neutral-300 text-[10px]">{j.notes}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingNoteId(j.id);
                                    setNoteInputText(j.notes);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-[#2563EB] text-gray-400"
                                  title="Edit note"
                                >
                                  <Pencil className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="py-1 px-1.5 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => jumpToBar(j.barIndex)}
                              className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-white dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-[#2563EB] hover:text-white cursor-pointer border border-gray-200 dark:border-white/[0.08]"
                              title="Jump chart to setup"
                            >
                              Jump
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : rightBottomTab === 'Calendar Heatmap' ? (
                /* CALENDAR HEATMAP */
                <div className="space-y-1">
                  <div className="flex items-center justify-between pb-0.5 border-b border-gray-200 dark:border-white/[0.08]">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
                      <span className="font-bold text-[10px] text-gray-900 dark:text-neutral-100">
                        Nov 2023 Heatmap
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[9px]">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded bg-emerald-500" />
                        <span className="text-gray-500 dark:text-neutral-400">Profit</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded bg-rose-500" />
                        <span className="text-gray-500 dark:text-neutral-400">Loss</span>
                      </div>
                    </div>
                  </div>

                  {/* Calendar Grid (Mon to Sun) */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dayName, idx) => (
                      <div key={`${dayName}-${idx}`} className="text-[9px] font-bold text-gray-400 dark:text-neutral-500 capitalize py-0.2">
                        {dayName}
                      </div>
                    ))}

                    {/* Offset empty days */}
                    {[...Array(2)].map((_, i) => (
                      <div key={`empty-${i}`} className="p-0.5 rounded bg-transparent opacity-0" />
                    ))}

                    {calendarDays.slice(0, 21).map((item) => {
                      const isProfit = item.pnl > 0;
                      const isLoss = item.pnl < 0;
                      const hasTrades = item.trades > 0;

                      return (
                        <div
                          key={item.day}
                          onClick={() => setSelectedHeatmapDay(item.day)}
                          className={`p-1 rounded border flex flex-col justify-between transition-all cursor-pointer min-h-[30px] ${
                            item.isLiveDay 
                              ? 'ring-2 ring-[#2563EB] shadow-xs' 
                              : ''
                          } ${
                            isProfit 
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300'
                              : isLoss 
                              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300'
                              : 'bg-white dark:bg-[#161D2A] border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-neutral-400'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[9px]">
                            <span className="font-bold">{item.day}</span>
                            {item.isLiveDay && <span className="text-[7px] font-bold bg-[#2563EB] text-white px-0.5 rounded">Now</span>}
                          </div>
                          <div className="text-[8px] font-bold font-mono text-right">
                            {hasTrades ? `${isProfit ? '+' : ''}$${item.pnl.toFixed(0)}` : '—'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* AUTOMATED LOGS */
                <div className="space-y-1 text-[10px] text-gray-500 dark:text-neutral-400">
                  <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/[0.08] pb-1 font-bold text-gray-700 dark:text-neutral-300">
                    <span>Replay Engine Diagnostics</span>
                    <span className="text-emerald-500 font-mono">STATUS: OK</span>
                  </div>
                  <div className="space-y-1 py-1 font-mono">
                    <p className="text-gray-600 dark:text-neutral-400">• Replay stream running at {speed}x speed.</p>
                    <p className="text-gray-600 dark:text-neutral-400">• Total recorded historical bars: {dataset.candles.length}.</p>
                    <p className="text-gray-600 dark:text-neutral-400">• Sync socket: ACTIVE (Latency 14ms).</p>
                    <p className="text-gray-600 dark:text-neutral-400">• P&L calculation pipeline initialized.</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

      </footer>

      {/* 5. Indicators Configuration Modal */}
      <IndicatorManagerModal
        isOpen={isIndicatorModalOpen}
        onClose={() => setIsIndicatorModalOpen(false)}
        settings={indicatorSettings}
        onSave={saveIndicatorSettings}
        onReset={resetIndicatorDefaults}
      />

    </div>
  );
}
