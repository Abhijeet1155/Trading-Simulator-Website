'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, TrendingDown, User, AlertCircle, Info, CheckCircle2, Search,
  Settings, HelpCircle, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Maximize2, Plus, Minus, Lock, Unlock,
  Eye, EyeOff, Trash2, RefreshCw, Sliders, X, Menu, RotateCcw, Pencil, Wallet, ShieldAlert,
  ArrowDownCircle, Check, Star, PanelLeftClose, PanelRightClose, PanelBottomClose
} from 'lucide-react';
import UserDropdown from '../dashboard/UserDropdown';
import Navbar from '@/components/Navbar';
import { useTheme } from '@/context/ThemeContext';
import { formatLotSize } from '../../lib/account';
import { DEFAULT_ACCOUNT_TYPES, ALLOWED_LEVERAGES } from '../../lib/accountTypes';

const FOREX_SYMBOLS = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'AUD/CAD', 'USD/CAD', 'USD/CHF'];

const getAssetColor = (symbol) => {
  switch (symbol) {
    case 'BTC': return '#F0B90B';
    case 'ETH': return '#627EEA';
    case 'SOL': return '#00FFA3';
    case 'BNB': return '#F3BA2F';
    case 'XRP': return '#23292F';
    case 'ADA': return '#0033AD';
    case 'DOGE': return '#C2A633';
    case 'EUR/USD': return '#003399';
    case 'GBP/USD': return '#C8102E';
    case 'USD/JPY': return '#BC002D';
    case 'AUD/USD': return '#00008B';
    case 'AUD/CAD': return '#0055A5';
    case 'USD/CAD': return '#FF0000';
    case 'USD/CHF': return '#D52B1E';
    case 'XAU/USD': return '#D4AF37';
    case 'AAPL': return '#A3AAAE';
    case 'TSLA': return '#CC0000';
    case 'NVDA': return '#76B900';
    case 'MSFT': return '#F25022';
    case 'AMZN': return '#FF9900';
    case 'GOOGL': return '#4285F4';
    case 'META': return '#0668E1';
    default: return '#2563EB';
  }
};

const getTradingViewSymbol = (sym) => {
  const mapping = {
    // Crypto
    'BTC': 'BINANCE:BTCUSDT',
    'ETH': 'BINANCE:ETHUSDT',
    'SOL': 'BINANCE:SOLUSDT',
    'BNB': 'BINANCE:BNBUSDT',
    'XRP': 'BINANCE:XRPUSDT',
    'ADA': 'BINANCE:ADAUSDT',
    'DOGE': 'BINANCE:DOGEUSDT',
    // Forex & Commodities
    'EUR/USD': 'FX:EURUSD',
    'GBP/USD': 'FX:GBPUSD',
    'USD/JPY': 'FX:USDJPY',
    'AUD/USD': 'FX:AUDUSD',
    'AUD/CAD': 'FX:AUDCAD',
    'USD/CAD': 'FX:USDCAD',
    'USD/CHF': 'FX:USDCHF',
    'XAU/USD': 'OANDA:XAUUSD',
    // Stocks
    'AAPL': 'NASDAQ:AAPL',
    'TSLA': 'NASDAQ:TSLA',
    'NVDA': 'NASDAQ:NVDA',
    'MSFT': 'NASDAQ:MSFT',
    'AMZN': 'NASDAQ:AMZN',
    'GOOGL': 'NASDAQ:GOOGL',
    'META': 'NASDAQ:META'
  };
  if (mapping[sym]) return mapping[sym];
  if (sym && sym.includes('/')) {
    const cleanPair = sym.replace('/', '');
    if (sym.startsWith('XAU')) return `OANDA:${cleanPair}`;
    return `FX:${cleanPair}`;
  }
  return `BINANCE:${sym}USDT`;
};

const ASSETS = {
  'BTC': {
    symbol: 'BTC',
    pair: 'BTC/USDT',
    name: 'Bitcoin',
    price: 80100.00,
    high24h: 80200.00,
    low24h: 79440.00,
    volume24h: '18.4K BTC',
    change24h: '+0.60%',
    type: 'Crypto',
    unit: 'BTC',
    iconColor: 'text-[#F0B90B] bg-[#F0B90B]/10'
  },
  'ETH': {
    symbol: 'ETH',
    pair: 'ETH/USDT',
    name: 'Ethereum',
    price: 2512.00,
    high24h: 2515.00,
    low24h: 2445.00,
    volume24h: '142K ETH',
    change24h: '+2.40%',
    type: 'Crypto',
    unit: 'ETH',
    iconColor: 'text-[#627EEA] bg-[#627EEA]/10'
  },
  'SOL': {
    symbol: 'SOL',
    pair: 'SOL/USDT',
    name: 'Solana',
    price: 106.50,
    high24h: 107.00,
    low24h: 101.60,
    volume24h: '840K SOL',
    change24h: '+4.50%',
    type: 'Crypto',
    unit: 'SOL',
    iconColor: 'text-[#00FFA3] bg-[#00FFA3]/10'
  },
  'BNB': {
    symbol: 'BNB',
    pair: 'BNB/USDT',
    name: 'BNB',
    price: 765.00,
    high24h: 780.00,
    low24h: 720.00,
    volume24h: '120K BNB',
    change24h: '+5.60%',
    type: 'Crypto',
    unit: 'BNB',
    iconColor: 'text-[#F3BA2F] bg-[#F3BA2F]/10'
  },
  'XRP': {
    symbol: 'XRP',
    pair: 'XRP/USDT',
    name: 'Ripple',
    price: 1.4290,
    high24h: 1.4330,
    low24h: 1.3950,
    volume24h: '45M XRP',
    change24h: '+2.05%',
    type: 'Crypto',
    unit: 'XRP',
    iconColor: 'text-[#23292F] bg-[#23292F]/10'
  },
  'ADA': {
    symbol: 'ADA',
    pair: 'ADA/USDT',
    name: 'Cardano',
    price: 0.2230,
    high24h: 0.2240,
    low24h: 0.2100,
    volume24h: '22M ADA',
    change24h: '+5.70%',
    type: 'Crypto',
    unit: 'ADA',
    iconColor: 'text-[#0033AD] bg-[#0033AD]/10'
  },
  'DOGE': {
    symbol: 'DOGE',
    pair: 'DOGE/USDT',
    name: 'Dogecoin',
    price: 0.0915,
    high24h: 0.0950,
    low24h: 0.0845,
    volume24h: '180M DOGE',
    change24h: '+8.10%',
    type: 'Crypto',
    unit: 'DOGE',
    iconColor: 'text-[#C2A633] bg-[#C2A633]/10'
  },
  'EUR/USD': {
    symbol: 'EUR/USD',
    pair: 'EUR/USD',
    name: 'Euro / US Dollar',
    price: 1.0845,
    high24h: 1.0890,
    low24h: 1.0812,
    volume24h: '85K Lots',
    change24h: '+0.12%',
    type: 'Forex',
    unit: 'EUR',
    iconColor: 'text-[#003399] bg-[#003399]/10'
  },
  'GBP/USD': {
    symbol: 'GBP/USD',
    pair: 'GBP/USD',
    name: 'British Pound / US Dollar',
    price: 1.2825,
    high24h: 1.2910,
    low24h: 1.2780,
    volume24h: '62K Lots',
    change24h: '+0.18%',
    type: 'Forex',
    unit: 'GBP',
    iconColor: 'text-[#C8102E] bg-[#C8102E]/10'
  },
  'USD/JPY': {
    symbol: 'USD/JPY',
    pair: 'USD/JPY',
    name: 'US Dollar / Japanese Yen',
    price: 155.60,
    high24h: 156.40,
    low24h: 154.80,
    volume24h: '98K Lots',
    change24h: '-0.22%',
    type: 'Forex',
    unit: 'JPY',
    iconColor: 'text-[#BC002D] bg-[#BC002D]/10'
  },
  'AUD/USD': {
    symbol: 'AUD/USD',
    pair: 'AUD/USD',
    name: 'Australian Dollar / US Dollar',
    price: 0.6650,
    high24h: 0.6690,
    low24h: 0.6610,
    volume24h: '44K Lots',
    change24h: '+0.05%',
    type: 'Forex',
    unit: 'AUD',
    iconColor: 'text-[#00008B] bg-[#00008B]/10'
  },
  'AUD/CAD': {
    symbol: 'AUD/CAD',
    pair: 'AUD/CAD',
    name: 'Australian Dollar / Canadian Dollar',
    price: 0.9125,
    high24h: 0.9180,
    low24h: 0.9080,
    volume24h: '28K Lots',
    change24h: '+0.10%',
    type: 'Forex',
    unit: 'AUD',
    iconColor: 'text-[#0055A5] bg-[#0055A5]/10'
  },
  'USD/CAD': {
    symbol: 'USD/CAD',
    pair: 'USD/CAD',
    name: 'US Dollar / Canadian Dollar',
    price: 1.3720,
    high24h: 1.3780,
    low24h: 1.3680,
    volume24h: '38K Lots',
    change24h: '+0.15%',
    type: 'Forex',
    unit: 'CAD',
    iconColor: 'text-[#FF0000] bg-[#FF0000]/10'
  },
  'USD/CHF': {
    symbol: 'USD/CHF',
    pair: 'USD/CHF',
    name: 'US Dollar / Swiss Franc',
    price: 0.9020,
    high24h: 0.9065,
    low24h: 0.8980,
    volume24h: '31K Lots',
    change24h: '-0.10%',
    type: 'Forex',
    unit: 'CHF',
    iconColor: 'text-[#D52B1E] bg-[#D52B1E]/10'
  },
  'XAU/USD': {
    symbol: 'XAU/USD',
    pair: 'XAU/USD',
    name: 'Gold / US Dollar',
    price: 2380.50,
    high24h: 2405.00,
    low24h: 2368.00,
    volume24h: '38K Lots',
    change24h: '+0.79%',
    type: 'Forex',
    unit: 'XAU',
    iconColor: 'text-[#D4AF37] bg-[#D4AF37]/10'
  },
  'AAPL': {
    symbol: 'AAPL',
    pair: 'AAPL/USD',
    name: 'Apple Inc.',
    price: 189.84,
    high24h: 191.20,
    low24h: 188.10,
    volume24h: '42.5M Shares',
    change24h: '+1.85%',
    type: 'Stocks',
    unit: 'AAPL',
    iconColor: 'text-[#A3AAAE] bg-[#A3AAAE]/10'
  },
  'TSLA': {
    symbol: 'TSLA',
    pair: 'TSLA/USD',
    name: 'Tesla Inc.',
    price: 180.20,
    high24h: 184.50,
    low24h: 178.10,
    volume24h: '88M Shares',
    change24h: '-0.85%',
    type: 'Stocks',
    unit: 'TSLA',
    iconColor: 'text-[#CC0000] bg-[#CC0000]/10'
  },
  'NVDA': {
    symbol: 'NVDA',
    pair: 'NVDA/USD',
    name: 'NVIDIA Corp.',
    price: 125.50,
    high24h: 128.90,
    low24h: 122.10,
    volume24h: '145M Shares',
    change24h: '+4.25%',
    type: 'Stocks',
    unit: 'NVDA',
    iconColor: 'text-[#76B900] bg-[#76B900]/10'
  },
  'MSFT': {
    symbol: 'MSFT',
    pair: 'MSFT/USD',
    name: 'Microsoft Corp.',
    price: 420.10,
    high24h: 423.80,
    low24h: 417.20,
    volume24h: '22M Shares',
    change24h: '+0.65%',
    type: 'Stocks',
    unit: 'MSFT',
    iconColor: 'text-[#F25022] bg-[#F25022]/10'
  },
  'AMZN': {
    symbol: 'AMZN',
    pair: 'AMZN/USD',
    name: 'Amazon.com Inc.',
    price: 185.30,
    high24h: 188.40,
    low24h: 183.10,
    volume24h: '35M Shares',
    change24h: '+1.15%',
    type: 'Stocks',
    unit: 'AMZN',
    iconColor: 'text-[#FF9900] bg-[#FF9900]/10'
  },
  'GOOGL': {
    symbol: 'GOOGL',
    pair: 'GOOGL/USD',
    name: 'Alphabet Inc.',
    price: 175.40,
    high24h: 177.80,
    low24h: 174.10,
    volume24h: '28M Shares',
    change24h: '-0.32%',
    type: 'Stocks',
    unit: 'GOOGL',
    iconColor: 'text-[#4285F4] bg-[#4285F4]/10'
  },
  'META': {
    symbol: 'META',
    pair: 'META/USD',
    name: 'Meta Platforms Inc.',
    price: 475.20,
    high24h: 482.50,
    low24h: 468.90,
    volume24h: '18M Shares',
    change24h: '+2.18%',
    type: 'Stocks',
    unit: 'META',
    iconColor: 'text-[#0668E1] bg-[#0668E1]/10'
  }
};

const parseTradingViewSymbol = (raw) => {
  if (!raw || typeof raw !== 'string') return null;
  const clean = raw.includes(':') ? raw.split(':')[1] : raw;
  const upper = clean.toUpperCase().trim();

  // Match against known ASSETS
  for (const sym of Object.keys(ASSETS)) {
    if (upper === sym.toUpperCase()) return sym;
    const noSlash = sym.replace('/', '').toUpperCase();
    if (upper === noSlash) return sym;
    if (upper === `${sym}USDT`.toUpperCase()) return sym;
    if (upper === `${noSlash}USDT`.toUpperCase()) return sym;
  }

  // Fallback heuristic: 6-letter Forex pair (e.g. AUDCAD -> AUD/CAD)
  if (upper.length === 6 && !upper.endsWith('USDT')) {
    const pair = `${upper.slice(0, 3)}/${upper.slice(3, 6)}`;
    if (ASSETS[pair]) return pair;
  }
  if (upper.endsWith('USDT') && upper.length > 4) {
    const base = upper.slice(0, -4);
    if (ASSETS[base]) return base;
  }

  return null;
};

// Generates dynamic candlesticks based on base price
function generateMockCandles(basePrice, timeframe = '1H', count = 45) {
  const data = [];
  let current = basePrice * 0.985;
  const nowSec = Math.floor(Date.now() / 1000);
  
  let interval = 3600;
  if (timeframe === '1m') interval = 60;
  if (timeframe === '15m') interval = 900;
  if (timeframe === '4H') interval = 14400;
  if (timeframe === '1D') interval = 86400;

  let startTime = nowSec - (count * interval);

  for (let i = 0; i < count; i++) {
    const trend = (Math.random() - 0.46) * 0.009;
    const open = current;
    const close = current * (1 + trend);
    const high = Math.max(open, close) * (1 + Math.random() * 0.0035);
    const low = Math.min(open, close) * (1 - Math.random() * 0.0035);

    data.push({
      time: startTime + (i * interval),
      open: parseFloat(open.toFixed(basePrice < 5 ? 4 : 2)),
      high: parseFloat(high.toFixed(basePrice < 5 ? 4 : 2)),
      low: parseFloat(low.toFixed(basePrice < 5 ? 4 : 2)),
      close: parseFloat(close.toFixed(basePrice < 5 ? 4 : 2))
    });
    current = close;
  }
  return data;
}

export default function TradeClientPage({ 
  userName, 
  initialBalance, 
  initialPositions, 
  accountNumber, 
  activeAccountId,
  initialAccountType = 'standard',
  initialLeverage = 100,
  accountTypes = []
}) {
  const { resolvedTheme } = useTheme();
  const [selectedAsset, setSelectedAsset] = useState('BTC');

  useEffect(() => {
    console.log("State updated:", selectedAsset);
  }, [selectedAsset]);

  const [timeframe, setTimeframe] = useState('1H');
  const [chartType, setChartType] = useState('candles'); // 'candles' or 'line'
  const [orderType, setOrderType] = useState('buy'); // 'buy' or 'sell'
  const [orderSubtype, setOrderSubtype] = useState('Market'); // 'Limit', 'Market', 'Stop-Limit'
  
  // Form mode: 'regular' | 'quick' | 'risk'
  const [orderFormMode, setOrderFormMode] = useState('regular');
  const [formModeDropdownOpen, setFormModeDropdownOpen] = useState(false);
  const formModeRef = useRef(null);

  // Risk calculator state
  const [riskPct, setRiskPct] = useState('1');
  const [calcEntryPrice, setCalcEntryPrice] = useState('');
  const [calcTpPrice, setCalcTpPrice] = useState('');

  // Input fields volume & prices
  const [vol, setVol] = useState('0.10');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [totalUSDT, setTotalUSDT] = useState('');
  
  // Account Type & Leverage states
  const [accountTypesList, setAccountTypesList] = useState(
    accountTypes && accountTypes.length > 0 ? accountTypes : DEFAULT_ACCOUNT_TYPES
  );
  const [accountType, setAccountType] = useState(initialAccountType || 'standard');
  const [leverage, setLeverage] = useState(initialLeverage || 100);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  // Checkbox TP/SL configuration
  const [tpslChecked, setTpslChecked] = useState(false);
  const [tpPrice, setTpPrice] = useState('');
  const [slPrice, setSlPrice] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [searchQuery, setSearchQuery] = useState('');
  const [watchlistTab, setWatchlistTab] = useState('All');
  const [watchlistSearchQuery, setWatchlistSearchQuery] = useState('');
  const [favoriteSymbols, setFavoriteSymbols] = useState(['BTC', 'ETH', 'SOL', 'XAU/USD']);
  const [rightPanelTab, setRightPanelTab] = useState('ticket'); // 'ticket' | 'orderbook'
  const [orderbookViewMode, setOrderbookViewMode] = useState('default'); // 'default' | 'asks' | 'bids'
  const [tableTab, setTableTab] = useState('positions'); // 'positions' | 'pending' | 'history'

  const toggleFavoriteSymbol = (sym, e) => {
    e.stopPropagation();
    setFavoriteSymbols(prev => 
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  // Search dialog visibility
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isLiveData, setIsLiveData] = useState(true);

  // TP/SL Edit modal state
  const [isTPSLModalOpen, setIsTPSLModalOpen] = useState(false);
  const [tpslEditingPos, setTpslEditingPos] = useState(null);
  const [modalEditTP, setModalEditTP] = useState('');
  const [modalEditSL, setModalEditSL] = useState('');

  const openTPSLEditModal = (pos) => {
    setTpslEditingPos(pos);
    setModalEditTP(pos.take_profit ? pos.take_profit.toString() : '');
    setModalEditSL(pos.stop_loss ? pos.stop_loss.toString() : '');
    setIsTPSLModalOpen(true);
  };

  const handleUpdateTPSLSubmit = async (e) => {
    e.preventDefault();
    if (!tpslEditingPos) return;
    const tpNum = modalEditTP.trim() ? parseFloat(modalEditTP) : null;
    const slNum = modalEditSL.trim() ? parseFloat(modalEditSL) : null;
    const success = await updateTradeTPSL(tpslEditingPos.id, tpNum, slNum);
    if (success) {
      setIsTPSLModalOpen(false);
      setTpslEditingPos(null);
    }
  };

  // Account Details Dropdown state and click outside handler
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const accountDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
        setIsAccountDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Drawing toolbar states
  const [activeDrawingTool, setActiveDrawingTool] = useState('cursor'); // cursor, trend, fib, brush, text
  const [drawingsLocked, setDrawingsLocked] = useState(false);
  const [drawingsHidden, setDrawingsHidden] = useState(false);
  const [magnetMode, setMagnetMode] = useState(false);

  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volSeriesRef = useRef(null);
  const lastBarRef = useRef(null);

  const asset = ASSETS[selectedAsset];
  const isForex = FOREX_SYMBOLS.includes(selectedAsset);
  const [balance, setBalance] = useState(initialBalance);
  
  // Multiple accounts state
  const [accountData, setAccountData] = useState(null);

  // Renaming states
  const [renamingWalletId, setRenamingWalletId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameError, setRenameError] = useState('');

  // Balance setting states
  const [isBalanceSettingsOpen, setIsBalanceSettingsOpen] = useState(false);
  const [selectedAdjustPreset, setSelectedAdjustPreset] = useState(10000);
  const [customAdjustAmount, setCustomAdjustAmount] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [adjustError, setAdjustError] = useState('');

  // Chart Quick Trading Modal state
  const [isChartTradeModalOpen, setIsChartTradeModalOpen] = useState(false);
  const [modalSide, setModalSide] = useState('buy'); // 'buy' | 'sell'
  const [modalExecType, setModalExecType] = useState('Market'); // 'Market' | 'Buy limit' | 'Sell limit' | 'Buy stop' | 'Sell stop' | 'Buy stop limit' | 'Sell stop limit'
  const [modalVolume, setModalVolume] = useState('0.10');
  const [modalPrice, setModalPrice] = useState('');
  const [modalTakeProfit, setModalTakeProfit] = useState('');
  const [modalStopLoss, setModalStopLoss] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const openChartTradeModal = (side) => {
    setModalSide(side);
    setModalExecType('Market');
    setModalVolume(vol || '0.10');
    setModalPrice('');
    setModalTakeProfit(tpPrice || '');
    setModalStopLoss(slPrice || '');
    setModalError('');
    setIsChartTradeModalOpen(true);
  };

  const handleModalOrderSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    const parsedVol = parseFloat(modalVolume);
    if (isNaN(parsedVol) || parsedVol <= 0) {
      setModalError('Please enter a valid lot size/volume greater than 0.');
      return;
    }

    const needsPrice = modalExecType !== 'Market';
    let execPrice = livePrice;
    if (needsPrice) {
      const parsedPrice = parseFloat(modalPrice);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        setModalError('Please specify a valid trigger/order price.');
        return;
      }
      execPrice = parsedPrice;
    }

    const lotMultiplier = getLotMultiplier();
    const fullOrderValue = parsedVol * execPrice * lotMultiplier;
    const marginRequired = fullOrderValue / leverage;

    if (marginRequired > freeMargin) {
      setModalError(`Required margin ($${marginRequired.toFixed(2)}) exceeds available free margin ($${freeMargin.toFixed(2)}).`);
      return;
    }

    setModalSubmitting(true);
    try {
      const response = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: accountData?.activeAccount?.id || activeAccountId,
          wallet_id: accountData?.activeAccount?.id || activeAccountId,
          symbol: selectedAsset,
          side: modalSide,
          quantity: parsedVol,
          entry_price: execPrice,
          leverage: leverage,
          usd_amount: marginRequired,
          take_profit: modalTakeProfit ? parseFloat(modalTakeProfit) : null,
          stop_loss: modalStopLoss ? parseFloat(modalStopLoss) : null
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setModalError(data.error || 'Failed to place order.');
        showToast(data.error || 'Failed to place order.', 'info');
        return;
      }

      showToast(`Successfully executed ${modalSide.toUpperCase()} ${parsedVol} lots ${selectedAsset}`, 'success');
      setBalance(data.newBalance);
      refreshOpenTrades();
      setIsChartTradeModalOpen(false);
    } catch (err) {
      console.error('Failed to submit modal order:', err);
      setModalError('A network error occurred while executing order.');
      showToast('Failed to execute trade.', 'info');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleAdjustBalanceSubmit = async (e) => {
    e.preventDefault();
    setAdjustError('');

    let amount = selectedAdjustPreset;
    if (customAdjustAmount) {
      const parsed = parseFloat(customAdjustAmount);
      if (isNaN(parsed) || parsed < 100 || parsed > 1000000) {
        setAdjustError('Please enter an amount between $100 and $1,000,000.');
        return;
      }
      amount = parsed;
    }

    setAdjusting(true);
    try {
      const res = await fetch('/api/wallets/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, name: accountData?.accountName || '' }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsBalanceSettingsOpen(false);
        window.location.reload();
      } else {
        setAdjustError(data.error || 'Failed to update balance.');
      }
    } catch (err) {
      console.error(err);
      setAdjustError('A network error occurred. Please try again.');
    } finally {
      setAdjusting(false);
    }
  };

  const submitRenameAccount = async (e) => {
    if (e) e.preventDefault();
    setRenameError('');

    const trimmed = renameValue.trim();
    if (!trimmed) {
      setRenameError('Account name cannot be empty.');
      return;
    }
    if (trimmed.length > 30) {
      setRenameError('Account name cannot exceed 30 characters.');
      return;
    }

    if (!renamingWalletId) return;

    try {
      const res = await fetch('/api/user/account/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletId: renamingWalletId, name: trimmed })
      });
      if (res.ok) {
        setIsRenameModalOpen(false);
        window.location.reload();
      } else {
        const data = await res.json();
        setRenameError(data.error || 'Failed to rename account.');
      }
    } catch (err) {
      console.error('Error renaming account:', err);
      setRenameError('Failed to rename account.');
    }
  };

  const fetchAccountDetails = async () => {
    try {
      const res = await fetch('/api/user/account');
      if (res.ok) {
        const data = await res.json();
        setAccountData(data);
        if (data.activeAccount?.account_type) {
          setAccountType(data.activeAccount.account_type);
        }
        if (data.activeAccount?.leverage) {
          setLeverage(parseInt(data.activeAccount.leverage, 10));
        }
      }
    } catch (err) {
      console.error('Failed to fetch account info in trade page:', err);
    }
  };

  useEffect(() => {
    fetchAccountDetails();
  }, []);

  const handleAccountTypeChange = async (newType) => {
    if (isUpdatingSettings || newType === accountType) return;
    const targetWalletId = accountData?.activeAccount?.id || activeAccountId;
    const matchedType = accountTypesList.find(t => t.id === newType);
    let nextLeverage = leverage;
    if (matchedType && leverage > matchedType.max_leverage) {
      nextLeverage = matchedType.max_leverage;
      setLeverage(nextLeverage);
    }

    setAccountType(newType);
    setIsUpdatingSettings(true);

    try {
      const res = await fetch('/api/user/account/update-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletId: targetWalletId,
          accountType: newType,
          leverage: nextLeverage
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Switched account type to ${matchedType?.name || newType}`, 'success');
      } else {
        showToast(data.error || 'Failed to update account type', 'info');
      }
    } catch (e) {
      console.error('Failed to update account type:', e);
      showToast('Network error while updating account type', 'info');
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleLeverageChange = async (newLev) => {
    const numLev = parseInt(newLev, 10);
    if (isUpdatingSettings || numLev === leverage) return;
    const targetWalletId = accountData?.activeAccount?.id || activeAccountId;

    setLeverage(numLev);
    syncTotalFromVol(parseFloat(vol) || 0, limitPrice);
    setIsUpdatingSettings(true);

    try {
      const res = await fetch('/api/user/account/update-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletId: targetWalletId,
          accountType: accountType,
          leverage: numLev
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Leverage updated to 1:${numLev}`, 'success');
      } else {
        showToast(data.error || 'Failed to update leverage', 'info');
      }
    } catch (e) {
      console.error('Failed to update leverage:', e);
      showToast('Network error while updating leverage', 'info');
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleSwitchAccount = async (walletId) => {
    try {
      const res = await fetch('/api/user/account/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletId })
      });
      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to switch account.', 'info');
      }
    } catch (err) {
      console.error('Error switching account:', err);
      showToast('Failed to switch account.', 'info');
    }
  };

  const handleResetBalance = async () => {
    const confirmed = window.confirm(
      "This will reset your balance and clear all open positions for this demo account. History will be kept. Continue?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch('/api/settings/reset', { method: 'POST' });
      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to reset balance.', 'info');
      }
    } catch (err) {
      console.error('Error resetting balance:', err);
      showToast('Failed to reset balance.', 'info');
    }
  };

  // Create account states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newAccountPreset, setNewAccountPreset] = useState(10000);
  const [customAmount, setCustomAmount] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreateAccountSubmit = async (e) => {
    if (e) e.preventDefault();
    setCreateError('');

    let amount = newAccountPreset;
    if (customAmount) {
      const parsed = parseFloat(customAmount);
      if (isNaN(parsed) || parsed < 100 || parsed > 1000000) {
        setCreateError('Please enter an amount between $100 and $1,000,000.');
        return;
      }
      amount = parsed;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/user/account/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, name: newAccountName })
      });
      const data = await res.json();

      if (res.ok) {
        setIsCreateModalOpen(false);
        setNewAccountName('');
        window.location.reload();
      } else {
        setCreateError(data.error || 'Failed to create new demo account.');
      }
    } catch (err) {
      console.error(err);
      setCreateError('A network error occurred. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  // Real-time price states
  const [prices, setPrices] = useState(() => {
    const initial = {};
    Object.keys(ASSETS).forEach(key => {
      initial[key] = ASSETS[key].price;
    });
    return initial;
  });

  const [directions, setDirections] = useState(() => {
    const initial = {};
    Object.keys(ASSETS).forEach(key => {
      initial[key] = 'up';
    });
    return initial;
  });

  const livePrice = prices[selectedAsset] || ASSETS[selectedAsset]?.price || 100;
  const priceDirection = directions[selectedAsset];

  // Flashing indicator for real-time tick changes
  const [prevPrice, setPrevPrice] = useState(livePrice);
  const [priceFlash, setPriceFlash] = useState(null); // 'up' | 'down' | null

  // Live prices, percents and 24h stats
  const [changePercents, setChangePercents] = useState(() => {
    const initial = {};
    Object.keys(ASSETS).forEach(key => {
      initial[key] = parseFloat(ASSETS[key].change24h);
    });
    return initial;
  });

  const [stats, setStats] = useState(() => {
    const initial = {};
    Object.keys(ASSETS).forEach(key => {
      initial[key] = { 
        high24h: ASSETS[key].high24h, 
        low24h: ASSETS[key].low24h, 
        volume24h: ASSETS[key].volume24h 
      };
    });
    return initial;
  });

  // Dynamic positions calculations from Supabase
  const [positions, setPositions] = useState(initialPositions || []);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isClosingId, setIsClosingId] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Resizable & Collapsible panels states
  const [leftWidth, setLeftWidth] = useState(220);
  const [rightWidth, setRightWidth] = useState(325);
  const [terminalHeight, setTerminalHeight] = useState(210);
  const [isDesktop, setIsDesktop] = useState(false);

  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);

  // Load persisted panel states from localStorage if present
  useEffect(() => {
    try {
      const savedLeft = localStorage.getItem('panel_left_collapsed');
      const savedRight = localStorage.getItem('panel_right_collapsed');
      const savedBottom = localStorage.getItem('panel_bottom_collapsed');
      if (savedLeft !== null) setIsLeftCollapsed(savedLeft === 'true');
      if (savedRight !== null) setIsRightCollapsed(savedRight === 'true');
      if (savedBottom !== null) setIsBottomCollapsed(savedBottom === 'true');
    } catch (e) {
      console.warn('Could not read panel collapse state from localStorage:', e);
    }
  }, []);

  const toggleLeftCollapse = () => {
    setIsLeftCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('panel_left_collapsed', String(next)); } catch (e) {}
      return next;
    });
  };

  const toggleRightCollapse = () => {
    setIsRightCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('panel_right_collapsed', String(next)); } catch (e) {}
      return next;
    });
  };

  const toggleBottomCollapse = () => {
    setIsBottomCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('panel_bottom_collapsed', String(next)); } catch (e) {}
      return next;
    });
  };

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const startResizeLeft = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftWidth;
    const doResize = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(180, Math.min(400, startWidth + deltaX));
      setLeftWidth(newWidth);
    };
    const stopResize = () => {
      document.removeEventListener('mousemove', doResize);
      document.removeEventListener('mouseup', stopResize);
    };
    document.addEventListener('mousemove', doResize);
    document.addEventListener('mouseup', stopResize);
  };

  const startResizeRight = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = rightWidth;
    const doResize = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(260, Math.min(500, startWidth - deltaX));
      setRightWidth(newWidth);
    };
    const stopResize = () => {
      document.removeEventListener('mousemove', doResize);
      document.removeEventListener('mouseup', stopResize);
    };
    document.addEventListener('mousemove', doResize);
    document.addEventListener('mouseup', stopResize);
  };

  const startResizeTerminal = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = terminalHeight;
    const doResize = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newHeight = Math.max(120, Math.min(500, startHeight - deltaY));
      setTerminalHeight(newHeight);
    };
    const stopResize = () => {
      document.removeEventListener('mousemove', doResize);
      document.removeEventListener('mouseup', stopResize);
    };
    document.addEventListener('mousemove', doResize);
    document.addEventListener('mouseup', stopResize);
  };

  // Calculate dynamic P&Ls based on live prices
  const getLotMultiplier = (sym = selectedAsset) => {
    const clean = (sym || '').toUpperCase().replace('/', '').trim();
    if (FOREX_SYMBOLS.some(f => f.replace('/', '') === clean) || ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'AUDCAD', 'USDCAD', 'USDCHF', 'NZDUSD', 'EURGBP', 'EURJPY', 'GBPJPY'].includes(clean)) {
      return 100000;
    }
    if (clean === 'XAUUSD' || clean === 'GOLD' || clean.startsWith('XAU')) return 100;
    if (['NQ1!', 'NAS100', 'NDX', 'USTEC'].includes(clean)) return 20;
    if (['ES1!', 'US500', 'SPX'].includes(clean)) return 50;
    return 1;
  };

  // Calculate dynamic P&Ls based on live prices
  const getPositionPnL = (pos) => {
    const currentPrice = prices[pos.symbol] || pos.entry;
    const lotMultiplier = getLotMultiplier(pos.symbol);
    const parsedSize = parseFloat(pos.quantity || pos.size || pos.lot_size || 0);
    const side = (pos.side || 'buy').toLowerCase();
    const isLong = side === 'buy' || side === 'long' || pos.direction === 'LONG';
    
    if (isLong) {
      return (currentPrice - pos.entry) * lotMultiplier * parsedSize;
    } else {
      return (pos.entry - currentPrice) * lotMultiplier * parsedSize;
    }
  };

  const totalFloatingPnL = positions.reduce((sum, pos) => sum + getPositionPnL(pos), 0);
  const activeMargin = positions.reduce((sum, pos) => sum + (pos.usd_amount || 0), 0);
  const activeEquity = balance + activeMargin + totalFloatingPnL;
  const freeMargin = activeEquity - activeMargin;

  // Track selected price ticking flash effect
  useEffect(() => {
    let flashTimer;
    if (livePrice > prevPrice) {
      flashTimer = setTimeout(() => setPriceFlash('up'), 0);
    } else if (livePrice < prevPrice) {
      flashTimer = setTimeout(() => setPriceFlash('down'), 0);
    }
    const prevTimer = setTimeout(() => setPrevPrice(livePrice), 0);

    const clearTimer = setTimeout(() => setPriceFlash(null), 300);
    return () => {
      if (flashTimer) clearTimeout(flashTimer);
      clearTimeout(prevTimer);
      clearTimeout(clearTimer);
    };
  }, [livePrice, prevPrice]);

  const getExecutionPrice = (side = orderType, subtype = orderSubtype, customRate = limitPrice) => {
    if (subtype === 'Market') {
      if (side === 'buy') return livePrice;
      const isForex = FOREX_SYMBOLS.includes(selectedAsset);
      return isForex ? parseFloat((livePrice - 0.0001).toFixed(4)) : parseFloat((livePrice * 0.9999).toFixed(2));
    }
    return parseFloat(customRate) || livePrice;
  };

  // Sync Price defaults and calculate initial Total USDT
  useEffect(() => {
    if (!livePrice) return;
    const timer = setTimeout(() => {
      const defaultPriceStr = (livePrice || 0).toString();
      setLimitPrice(defaultPriceStr);
      setStopPrice(((livePrice || 0) * 1.01).toFixed(FOREX_SYMBOLS.includes(selectedAsset) ? 4 : 2));
      
      const initialVol = parseFloat(vol) || 0;
      const lotMultiplier = getLotMultiplier();
      const execPrice = getExecutionPrice();
      setTotalUSDT((initialVol * execPrice * lotMultiplier).toFixed(2));
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedAsset, livePrice, vol, orderType, orderSubtype]);

  // Re-calculate Total USDT when price ticks if in Market mode
  useEffect(() => {
    if (orderSubtype === 'Market' && livePrice) {
      const timer = setTimeout(() => {
        const currentVol = parseFloat(vol) || 0;
        const lotMultiplier = getLotMultiplier();
        const execPrice = getExecutionPrice();
        setTotalUSDT((currentVol * execPrice * lotMultiplier).toFixed(2));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [livePrice, orderSubtype, selectedAsset, vol, orderType]);

  // Helper to read 24h change percentage from state
  const getChangePercent = (symbol) => {
    return changePercents[symbol] || 0;
  };

  const selectedChangePct = getChangePercent(selectedAsset);
  const selectedIsUp = selectedChangePct >= 0;

  // Intraday values (high/low bounds for chart calculations & draggable overlays)
  const highVal = stats[selectedAsset]?.high24h || livePrice * 1.01;
  const lowVal = stats[selectedAsset]?.low24h || livePrice * 0.99;
  const openVal = livePrice * (1 - selectedChangePct / 100);
  const closeVal = livePrice;

  // Poll real-time prices from the backend API every 3 seconds
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('/api/prices');
        const data = await res.json();

        if (data._meta && typeof data._meta.isLiveData === 'boolean') {
          setIsLiveData(data._meta.isLiveData);
        }
        
        setPrices(prev => {
          const next = {};
          const newDirs = { ...directions };
          Object.keys(data).forEach(sym => {
            if (sym.startsWith('_')) return;
            next[sym] = data[sym].price;
            newDirs[sym] = data[sym].price >= (prev[sym] || data[sym].price) ? 'up' : 'down';
          });
          setDirections(newDirs);
          return next;
        });

        setChangePercents(prev => {
          const next = { ...prev };
          Object.keys(data).forEach(sym => {
            if (sym.startsWith('_')) return;
            if (data[sym]) next[sym] = data[sym].change;
          });
          return next;
        });

        setStats(prev => {
          const next = { ...prev };
          Object.keys(data).forEach(sym => {
            if (sym.startsWith('_')) return;
            if (data[sym]) {
              next[sym] = { 
                high24h: data[sym].high, 
                low24h: data[sym].low, 
                volume24h: data[sym].volume 
              };
            }
          });
          return next;
        });
      } catch (err) {
        console.error('Failed to fetch live prices:', err);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 3000);
    return () => clearInterval(interval);
  }, [directions]);

  // Steppers for volume & prices
  const adjustVol = (increment) => {
    const step = 0.01;
    const current = parseFloat(vol) || 0;
    const next = increment ? current + step : Math.max(step, current - step);
    setVol(next.toFixed(2));
    syncTotalFromVol(next, limitPrice);
  };

  const adjustPrice = (type, increment) => {
    const step = FOREX_SYMBOLS.includes(selectedAsset) ? 0.0001 : selectedAsset === 'XAU/USD' ? 0.10 : selectedAsset === 'BTC' ? 10 : selectedAsset === 'ETH' ? 0.50 : 0.50;
    const val = type === 'limit' ? limitPrice : stopPrice;
    const current = parseFloat(val) || livePrice;
    const next = increment ? current + step : Math.max(0.0001, current - step);
    const formatted = next.toFixed(FOREX_SYMBOLS.includes(selectedAsset) ? 4 : 2);
    if (type === 'limit') {
      setLimitPrice(formatted);
      syncTotalFromVol(parseFloat(vol), next);
    } else {
      setStopPrice(formatted);
    }
  };

  const adjustTp = (increment) => {
    const step = FOREX_SYMBOLS.includes(selectedAsset) ? 0.0001 : selectedAsset === 'XAU/USD' ? 0.10 : selectedAsset === 'BTC' ? 10 : selectedAsset === 'ETH' ? 0.50 : 0.50;
    const current = parseFloat(tpPrice) || livePrice;
    const next = increment ? current + step : Math.max(0, current - step);
    setTpPrice(next.toFixed(FOREX_SYMBOLS.includes(selectedAsset) ? 4 : 2));
  };

  const adjustSl = (increment) => {
    const step = FOREX_SYMBOLS.includes(selectedAsset) ? 0.0001 : selectedAsset === 'XAU/USD' ? 0.10 : selectedAsset === 'BTC' ? 10 : selectedAsset === 'ETH' ? 0.50 : 0.50;
    const current = parseFloat(slPrice) || livePrice;
    const next = increment ? current + step : Math.max(0, current - step);
    setSlPrice(next.toFixed(FOREX_SYMBOLS.includes(selectedAsset) ? 4 : 2));
  };


  // Sync Total USDT from Vol quantity
  const syncTotalFromVol = (quantity, rate) => {
    const lotMultiplier = getLotMultiplier();
    const priceVal = orderSubtype === 'Market' ? getExecutionPrice() : (parseFloat(rate) || livePrice);
    const total = quantity * priceVal * lotMultiplier;
    setTotalUSDT(total.toFixed(2));
    validateLimit(total);
  };

  // Sync Vol quantity from Total USDT
  const syncVolFromTotal = (totalAmount, rate) => {
    const lotMultiplier = getLotMultiplier();
    const priceVal = orderSubtype === 'Market' ? getExecutionPrice() : (parseFloat(rate) || livePrice);
    const quantity = totalAmount / (priceVal * lotMultiplier);
    setVol(quantity.toFixed(2));
    validateLimit(totalAmount);
  };

  const validateLimit = (totalUSD) => {
    const marginRequired = totalUSD / leverage;
    if (marginRequired > freeMargin) {
      setErrorMsg(`Required margin exceeds available free margin.`);
    } else {
      setErrorMsg('');
    }
  };

  // Handle manual input updates
  const handleVolInput = (val) => {
    // Strip non-numeric characters except the first dot
    const clean = val.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    // Block more than 2 decimal places
    const dotIndex = clean.indexOf('.');
    if (dotIndex !== -1 && clean.length - dotIndex - 1 > 2) return;
    setVol(clean);
    syncTotalFromVol(parseFloat(clean) || 0, limitPrice);
  };

  const handleTotalInput = (val) => {
    const clean = val.replace(/[^0-9.]/g, '');
    setTotalUSDT(clean);
    syncVolFromTotal(parseFloat(clean) || 0, limitPrice);
  };

  const handlePriceInput = (val) => {
    const clean = val.replace(/[^0-9.]/g, '');
    setLimitPrice(clean);
    syncTotalFromVol(parseFloat(vol) || 0, clean);
  };

  // Slider changes
  const handleSliderChange = (percent) => {
    const totalUSD = (balance * (percent / 100)) * leverage;
    setTotalUSDT(totalUSD.toFixed(2));
    syncVolFromTotal(totalUSD, limitPrice);
  };

  // Convert volume lots to USD Order Value
  const getOrderValueUSD = () => {
    const lotMultiplier = getLotMultiplier();
    const numVol = parseFloat(vol) || 0;
    const execPrice = getExecutionPrice();
    return numVol * execPrice * lotMultiplier;
  };

  // Show status notification toast
  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast({ visible: false, message: '', type: 'success' });
    }, 4000);
  };

  // Closed trades history state
  const [historyTrades, setHistoryTrades] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch active open trades from database
  const refreshOpenTrades = async () => {
    try {
      const res = await fetch('/api/trades?status=open');
      if (res.ok) {
        const data = await res.json();
        setPositions(data);
      }
    } catch (err) {
      console.error('Failed to refresh open trades:', err);
    }
  };

  // Fetch closed order history from database
  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await fetch('/api/trades?status=closed');
      if (res.ok) {
        const data = await res.json();
        setHistoryTrades(data);
      }
    } catch (err) {
      console.error('Failed to fetch closed history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Trigger history fetch when switching to Order History tab
  useEffect(() => {
    if (tableTab === 'history') {
      const timer = setTimeout(() => {
        fetchHistory();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [tableTab]);

  const handlePlaceOrder = async () => {
    if (isPlacingOrder) return;
    setIsPlacingOrder(true);
    setErrorMsg('');
    const lotMultiplier = getLotMultiplier();
    const entryPrice = getExecutionPrice();
    const parsedVol = parseFloat(vol);
    
    if (!parsedVol || parsedVol <= 0 || isNaN(parsedVol)) {
      setErrorMsg('Please enter a valid volume.');
      setIsPlacingOrder(false);
      return;
    }

    if (!entryPrice || entryPrice <= 0 || isNaN(entryPrice)) {
      setErrorMsg('Market price is not available yet. Please wait a moment.');
      setIsPlacingOrder(false);
      return;
    }

    const fullOrderValue = parsedVol * entryPrice * lotMultiplier;
    const marginRequired = fullOrderValue / (leverage || 100);

    if (marginRequired > freeMargin) {
      setErrorMsg(`Required margin ($${marginRequired.toFixed(2)}) exceeds available free margin ($${freeMargin.toFixed(2)}).`);
      setIsPlacingOrder(false);
      return;
    }

    try {
      const response = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: accountData?.activeAccount?.id || activeAccountId,
          wallet_id: accountData?.activeAccount?.id || activeAccountId,
          symbol: selectedAsset,
          side: orderType, // 'buy' or 'sell'
          quantity: parsedVol,
          entry_price: entryPrice,
          leverage: leverage,
          usd_amount: marginRequired,
          take_profit: tpPrice ? parseFloat(tpPrice) : null,
          stop_loss: slPrice ? parseFloat(slPrice) : null
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMsg(data.error || 'Failed to place order.');
        showToast(data.error || 'Failed to place order.', 'info');
        return;
      }

      showToast(`Order placed: ${orderType.toUpperCase()} ${parsedVol} ${selectedAsset}`, 'success');
      if (data.newBalance !== undefined) {
        setBalance(data.newBalance);
      }
      refreshOpenTrades();
      
      // Reset limit inputs
      setLimitPrice('');
      setStopPrice('');
      setTpPrice('');
      setSlPrice('');
    } catch (err) {
      console.error('Failed to place trade order:', err);
      setErrorMsg('Failed to execute trade.');
      showToast('Failed to execute trade.', 'info');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Close open position
  const handleClosePosition = async (tradeId, symbol, entryPrice, autoCloseReason = null) => {
    if (isClosingId) return;
    setIsClosingId(tradeId);
    const exitPrice = prices[symbol] || entryPrice;
    try {
      const response = await fetch('/api/trades', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tradeId,
          exitPrice
        })
      });

      const data = await response.json();
      if (!response.ok) {
        showToast(data.error || 'Failed to close position.', 'info');
        return;
      }

      showToast(autoCloseReason || 'Position closed successfully', 'success');
      setBalance(data.newBalance);
      refreshOpenTrades();
      
      // If we are on history tab, refresh history
      if (tableTab === 'history') {
        fetchHistory();
      }
    } catch (err) {
      console.error('Failed to close position:', err);
      showToast('Failed to close position.', 'info');
    } finally {
      setIsClosingId(null);
    }
  };

  // Update TP and SL for an open trade
  const updateTradeTPSL = async (tradeId, newTP, newSL) => {
    try {
      const response = await fetch('/api/trades', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tradeId,
          take_profit: newTP,
          stop_loss: newSL
        })
      });

      const data = await response.json();
      if (!response.ok) {
        showToast(data.error || 'Failed to update TP/SL.', 'info');
        return false;
      }

      showToast('TP / SL levels updated successfully', 'success');
      refreshOpenTrades();
      return true;
    } catch (err) {
      console.error('Failed to update TP/SL:', err);
      showToast('Failed to update TP/SL.', 'info');
      return false;
    }
  };

  const closingTradesRef = useRef(new Set());

  // Clean up closingTradesRef if positions change
  useEffect(() => {
    if (positions) {
      const openIds = new Set(positions.map(p => p.id));
      closingTradesRef.current.forEach(id => {
        if (!openIds.has(id)) {
          closingTradesRef.current.delete(id);
        }
      });
    }
  }, [positions]);

  // Client-side TP/SL Auto-Execution Check
  useEffect(() => {
    // NOTE: Client-side check running on each price tick. A proper production version would need a server-side cron/trigger for this.
    if (!positions || positions.length === 0) return;

    positions.forEach(pos => {
      const currentPrice = prices[pos.symbol];
      if (!currentPrice) return;

      const tp = pos.take_profit ? parseFloat(pos.take_profit) : null;
      const sl = pos.stop_loss ? parseFloat(pos.stop_loss) : null;

      let shouldClose = false;
      let reason = '';

      if (pos.side?.toLowerCase() === 'buy') {
        if (tp && currentPrice >= tp) {
          shouldClose = true;
          reason = `Position auto-closed: Take Profit hit`;
        } else if (sl && currentPrice <= sl) {
          shouldClose = true;
          reason = `Position auto-closed: Stop Loss hit`;
        }
      } else if (pos.side?.toLowerCase() === 'sell') {
        if (tp && currentPrice <= tp) {
          shouldClose = true;
          reason = `Position auto-closed: Take Profit hit`;
        } else if (sl && currentPrice >= sl) {
          shouldClose = true;
          reason = `Position auto-closed: Stop Loss hit`;
        }
      }

      if (shouldClose) {
        if (closingTradesRef.current.has(pos.id)) return;
        closingTradesRef.current.add(pos.id);
        handleClosePosition(pos.id, pos.symbol, pos.entry, reason);
      }
    });
  }, [prices, positions]);


  const handleAssetChange = (sym) => {
    console.log("Selected asset changing to:", sym);
    if (!sym) return;
    setSelectedAsset(sym);
    setErrorMsg('');
    setVol('0.10');
    setTpslChecked(false);
    setTpPrice('');
    setSlPrice('');
    setIsSearchOpen(false);
  };

  const formatAssetPrice = (val, sym = selectedAsset) => {
    const num = typeof val === 'number' && !isNaN(val) ? val : 0;
    return FOREX_SYMBOLS.includes(sym) 
      ? num.toFixed(4) 
      : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Dynamic script loader for TradingView tv.js
  useEffect(() => {
    if (window.TradingView) {
      const timer = setTimeout(() => setScriptLoaded(true), 0);
      return () => clearTimeout(timer);
    }
    const existingScript = document.getElementById('tradingview-widget-script');
    if (existingScript) {
      const handleLoad = () => setScriptLoaded(true);
      existingScript.addEventListener('load', handleLoad);
      return () => existingScript.removeEventListener('load', handleLoad);
    }
    const script = document.createElement('script');
    script.id = 'tradingview-widget-script';
    script.src = 'https://s3.tradingview.com/tv.js';
    script.type = 'text/javascript';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  // TradingView widget initialization
  useEffect(() => {
    if (!scriptLoaded || !window.TradingView || !chartContainerRef.current) return;

    const tvSymbol = getTradingViewSymbol(selectedAsset);

    const tvIntervals = {
      '1m': '1',
      '15m': '15',
      '1H': '60',
      '4H': '240',
      '1D': 'D'
    };
    const tvInterval = tvIntervals[timeframe] || '60';

    const tvStyles = {
      'candles': 1,
      'line': 2
    };
    const tvStyle = tvStyles[chartType] || 1;

    // Clear previous containers to avoid duplicate instances
    chartContainerRef.current.innerHTML = '';

    const safeSymId = (selectedAsset || 'BTC').replace(/[^a-zA-Z0-9]/g, '_');
    const widgetId = `tradingview_chart_${safeSymId}_${Date.now()}`;
    const widgetDiv = document.createElement('div');
    widgetDiv.id = widgetId;
    widgetDiv.style.width = '100%';
    widgetDiv.style.height = '100%';
    chartContainerRef.current.appendChild(widgetDiv);

    try {
      new window.TradingView.widget({
        autosize: true,
        symbol: tvSymbol,
        interval: tvInterval,
        timezone: "Etc/UTC",
        theme: resolvedTheme === 'dark' ? 'dark' : 'light',
        style: tvStyle,
        locale: "en",
        enable_publishing: false,
        hide_top_toolbar: true,
        hide_side_toolbar: false,
        allow_symbol_change: false,
        container_id: widgetId,
        studies: [],
        show_popup_button: false
      });
    } catch (err) {
      console.error('Failed to create TradingView widget:', err);
    }
  }, [scriptLoaded, selectedAsset, timeframe, chartType, resolvedTheme]);

  // Listen for TradingView iframe postMessage events & search modal shortcuts
  useEffect(() => {
    const handleWindowMessage = (event) => {
      try {
        if (!event.data) return;
        let data = event.data;
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch {
            return;
          }
        }

        if (data.name === 'tv-widget-symbol-change' || data.name === 'symbol-change' || data.type === 'symbol-change' || data.event === 'symbol_change') {
          const rawSymbol = data.data?.symbol || data.data?.name || data.symbol || data.name;
          if (rawSymbol && typeof rawSymbol === 'string') {
            const matched = parseTradingViewSymbol(rawSymbol);
            if (matched && matched !== selectedAsset) {
              console.log('[PaperPulse] TradingView postMessage symbol change detected:', rawSymbol, '->', matched);
              handleAssetChange(matched);
            }
          }
        }
      } catch (err) {
        // ignore parsing errors
      }
    };

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };

    window.addEventListener('message', handleWindowMessage);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('message', handleWindowMessage);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedAsset]);

  const renderWatchlist = () => {
    const filteredAssets = Object.values(ASSETS).filter(item => {
      // Tab Category Filter
      if (watchlistTab === 'Favorites' && !favoriteSymbols.includes(item.symbol)) return false;
      if (watchlistTab === 'Forex' && item.type !== 'Forex') return false;
      if (watchlistTab === 'Crypto' && item.type !== 'Crypto') return false;
      if (watchlistTab === 'Stocks' && item.type !== 'Stocks') return false;

      // Watchlist search text filter
      if (watchlistSearchQuery) {
        const q = watchlistSearchQuery.toLowerCase().trim();
        const matchesSymbol = item.symbol.toLowerCase().includes(q);
        const matchesName = item.name.toLowerCase().includes(q);
        return matchesSymbol || matchesName;
      }
      return true;
    });

    return (
      <div className="flex flex-col h-full overflow-hidden select-none bg-white dark:bg-[#111722] font-sans">
        {/* Watchlist Main Header */}
        <div className="px-3 py-2 bg-[#FAFAFA] dark:bg-[#161D2A] border-b border-gray-100 dark:border-white/[0.08] flex flex-col gap-1.5 shrink-0 select-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs text-gray-900 dark:text-neutral-100 capitalize">Watchlist</span>
              <span className="text-[9px] text-gray-400 dark:text-neutral-500 font-semibold">({filteredAssets.length})</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="p-1 hover:bg-gray-200/70 dark:hover:bg-white/[0.08] rounded text-gray-400 dark:text-neutral-400 hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors cursor-pointer"
                title="Search Symbols (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={toggleLeftCollapse}
                className="p-1 hover:bg-gray-200/70 dark:hover:bg-white/[0.08] rounded text-gray-400 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                title="Collapse Watchlist panel (<)"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="text-[9.5px] font-semibold flex gap-2 text-gray-400 dark:text-neutral-400 pt-1 border-t border-gray-100 dark:border-white/[0.08] overflow-x-auto select-none no-scrollbar">
            {['All', 'Crypto', 'Forex', 'Stocks', 'Favorites'].map(tab => (
              <button
                key={tab}
                onClick={() => setWatchlistTab(tab)}
                className={`cursor-pointer transition-all capitalize whitespace-nowrap px-1 py-0.5 rounded ${
                  watchlistTab === tab ? 'text-[#2563EB] dark:text-blue-400 font-semibold bg-blue-50/80 dark:bg-blue-500/15' : 'hover:text-gray-600 dark:hover:text-neutral-200'
                }`}
              >
                {tab === 'Favorites' ? '⭐ Favs' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Watchlist Search Bar input */}
        <div className="px-3 py-1.5 border-b border-gray-100 dark:border-white/[0.08] bg-[#FAFAFA]/40 dark:bg-[#161D2A]/40 shrink-0 flex items-center gap-1.5 relative select-none">
          <Search className="w-3.5 h-3.5 text-gray-400 dark:text-neutral-500 shrink-0" />
          <input
            type="text"
            placeholder="Search market pair..."
            value={watchlistSearchQuery}
            onChange={(e) => setWatchlistSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none text-[10.5px] font-semibold text-gray-700 dark:text-neutral-200 placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-0 p-0"
          />
          {watchlistSearchQuery && (
            <button 
              onClick={() => setWatchlistSearchQuery('')}
              className="absolute right-3 text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300 transition-colors p-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Watchlist Table */}
        <div className="flex-grow overflow-y-auto px-2">
          <table className="w-full text-left border-collapse text-[10px] font-sans">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/[0.08] text-[#9CA3AF] dark:text-neutral-500 font-semibold capitalize text-[7.5px] sticky top-0 bg-white dark:bg-[#111722] z-10 py-1">
                <th className="py-1 w-5"></th>
                <th className="py-1">Pair</th>
                <th className="py-1 text-right">Price</th>
                <th className="py-1 text-right">24h</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400 dark:text-neutral-500 font-semibold text-[10px]">
                    No markets found
                  </td>
                </tr>
              ) : (
                filteredAssets.map((item) => {
                  const buyPrice = prices[item.symbol] || item.price;
                  const changePct = getChangePercent(item.symbol);
                  const isUp = changePct >= 0;
                  const isSelected = selectedAsset === item.symbol;
                  const isFav = favoriteSymbols.includes(item.symbol);

                  return (
                    <tr
                      key={item.symbol}
                      onClick={() => handleAssetChange(item.symbol)}
                      className={`cursor-pointer border-b border-gray-50 dark:border-white/[0.04] hover:bg-blue-50/50 dark:hover:bg-white/[0.03] transition-colors select-none group ${
                        isSelected ? 'bg-blue-50/80 dark:bg-blue-500/15 font-bold border-l-2 border-l-[#2563EB] dark:border-l-blue-400' : ''
                      }`}
                    >
                      <td className="py-1.5 pl-1 text-gray-300 dark:text-neutral-600">
                        <button
                          type="button"
                          onClick={(e) => toggleFavoriteSymbol(item.symbol, e)}
                          className="hover:text-amber-400 cursor-pointer p-0.5"
                          title={isFav ? "Remove favorite" : "Add favorite"}
                        >
                          <Star className={`w-3 h-3 ${isFav ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-neutral-600 group-hover:text-gray-400 dark:group-hover:text-neutral-400'}`} />
                        </button>
                      </td>
                      <td className="py-1.5 font-semibold text-gray-900 dark:text-neutral-100">
                        <div className={`text-[10px] ${isSelected ? 'text-[#2563EB] dark:text-blue-400 font-bold' : 'text-gray-900 dark:text-neutral-100'}`}>
                          {item.pair || (item.symbol.includes('/') ? item.symbol : `${item.symbol}/USDT`)}
                        </div>
                        <div className="text-[8px] text-gray-400 dark:text-neutral-500 font-normal leading-none truncate max-w-[80px]">
                          {item.name}
                        </div>
                      </td>
                      <td className="py-1.5 text-right font-mono text-gray-700 dark:text-neutral-300 tabular-nums">
                        {formatAssetPrice(buyPrice, item.symbol)}
                      </td>
                      <td className={`py-1.5 pr-1 text-right font-mono font-semibold tabular-nums ${
                        isUp ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}>
                        {isUp ? '+' : ''}{changePct.toFixed(2)}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderOrderBook = () => {
    const isForex = FOREX_SYMBOLS.includes(selectedAsset);
    const pxStep = isForex ? 0.0004 : livePrice > 1000 ? 12.5 : livePrice > 100 ? 0.25 : 0.05;
    
    // Generate 6 level 2 ask rows (above live price)
    const asks = Array.from({ length: 6 }).map((_, i) => {
      const price = livePrice + (6 - i) * pxStep;
      const size = (0.15 + (i * 0.28) + (Math.sin(i * 1.5) * 0.1)).toFixed(2);
      const depthPct = Math.min(90, Math.max(15, Math.floor((parseFloat(size) / 2.0) * 100)));
      return { price, size, depthPct };
    });

    // Generate 6 level 2 bid rows (below live price)
    const bids = Array.from({ length: 6 }).map((_, i) => {
      const price = livePrice - (i + 1) * pxStep;
      const size = (0.20 + (i * 0.35) + (Math.cos(i * 1.2) * 0.12)).toFixed(2);
      const depthPct = Math.min(90, Math.max(15, Math.floor((parseFloat(size) / 2.5) * 100)));
      return { price, size, depthPct };
    });

    return (
      <div className="flex flex-col h-full bg-white dark:bg-[#111722] text-gray-900 dark:text-neutral-100 font-sans text-xs select-none p-3 justify-between overflow-y-auto scrollbar-thin">
        <div className="flex flex-col gap-2">
          {/* Order Book Header Controls */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/[0.08]">
            <span className="font-semibold text-xs text-gray-900 dark:text-neutral-100 capitalize">Level 2 Order Book</span>
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#161D2A] p-0.5 rounded-md">
              <button
                type="button"
                onClick={() => setOrderbookViewMode('default')}
                title="Default (Asks & Bids)"
                className={`px-1.5 py-0.5 rounded text-[9px] font-semibold cursor-pointer ${orderbookViewMode === 'default' ? 'bg-white dark:bg-[#1E293B] text-gray-900 dark:text-neutral-100 shadow-xs' : 'text-gray-400 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200'}`}
              >
                Both
              </button>
              <button
                type="button"
                onClick={() => setOrderbookViewMode('asks')}
                title="Asks Only (Sells)"
                className={`px-1.5 py-0.5 rounded text-[9px] font-semibold cursor-pointer ${orderbookViewMode === 'asks' ? 'bg-white dark:bg-[#1E293B] text-[#f23645] shadow-xs' : 'text-gray-400 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200'}`}
              >
                Asks
              </button>
              <button
                type="button"
                onClick={() => setOrderbookViewMode('bids')}
                title="Bids Only (Buys)"
                className={`px-1.5 py-0.5 rounded text-[9px] font-semibold cursor-pointer ${orderbookViewMode === 'bids' ? 'bg-white dark:bg-[#1E293B] text-[#089981] shadow-xs' : 'text-gray-400 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200'}`}
              >
                Bids
              </button>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-3 text-[9px] font-semibold text-gray-400 dark:text-neutral-500 pb-1 border-b border-gray-100 dark:border-white/[0.08]">
            <span>Price ({selectedAsset.includes('/') ? 'Quote' : 'USDT'})</span>
            <span className="text-right">Size ({selectedAsset})</span>
            <span className="text-right">Total</span>
          </div>

          {/* Asks (Sell Orders) */}
          {(orderbookViewMode === 'default' || orderbookViewMode === 'asks') && (
            <div className="flex flex-col gap-0.5">
              {asks.map((ask, idx) => (
                <div
                  key={idx}
                  onClick={() => { setLimitPrice(ask.price.toFixed(isForex ? 4 : 2)); setOrderSubtype('Limit'); setRightPanelTab('ticket'); showToast(`Price set to ${ask.price.toFixed(isForex ? 4 : 2)}`, 'info'); }}
                  className="grid grid-cols-3 text-[10.5px] font-mono py-0.5 px-1 rounded relative overflow-hidden cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                  style={{ background: `linear-gradient(270deg, rgba(242, 54, 69, 0.12) ${ask.depthPct}%, transparent ${ask.depthPct}%)` }}
                >
                  <span className="text-[#f23645] font-semibold">{formatAssetPrice(ask.price, selectedAsset)}</span>
                  <span className="text-right text-gray-700 dark:text-neutral-200 font-semibold">{ask.size}</span>
                  <span className="text-right text-gray-400 dark:text-neutral-500 font-semibold">${(ask.price * parseFloat(ask.size)).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                </div>
              ))}
            </div>
          )}

          {/* Mid Price / Spread Bar */}
          <div className="py-1.5 px-2 my-1 border-y border-gray-100 dark:border-white/[0.08] bg-gray-50 dark:bg-[#161D2A] flex items-center justify-between font-mono">
            <div className="flex items-center gap-1.5">
              <span className={`font-semibold text-xs ${selectedIsUp ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                {formatAssetPrice(livePrice, selectedAsset)}
              </span>
              <span className={`text-[10px] font-semibold ${selectedIsUp ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                {selectedIsUp ? '↗' : '↘'}
              </span>
            </div>
            <span className="text-[9px] text-gray-400 dark:text-neutral-400 font-semibold">Spread: {isForex ? '0.0001' : '0.01'}</span>
          </div>

          {/* Bids (Buy Orders) */}
          {(orderbookViewMode === 'default' || orderbookViewMode === 'bids') && (
            <div className="flex flex-col gap-0.5">
              {bids.map((bid, idx) => (
                <div
                  key={idx}
                  onClick={() => { setLimitPrice(bid.price.toFixed(isForex ? 4 : 2)); setOrderSubtype('Limit'); setRightPanelTab('ticket'); showToast(`Price set to ${bid.price.toFixed(isForex ? 4 : 2)}`, 'info'); }}
                  className="grid grid-cols-3 text-[10.5px] font-mono py-0.5 px-1 rounded relative overflow-hidden cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                  style={{ background: `linear-gradient(270deg, rgba(8, 153, 129, 0.12) ${bid.depthPct}%, transparent ${bid.depthPct}%)` }}
                >
                  <span className="text-[#089981] font-semibold">{formatAssetPrice(bid.price, selectedAsset)}</span>
                  <span className="text-right text-gray-700 dark:text-neutral-200 font-semibold">{bid.size}</span>
                  <span className="text-right text-gray-400 dark:text-neutral-500 font-semibold">${(bid.price * parseFloat(bid.size)).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-3 pt-2 border-t border-gray-100 dark:border-white/[0.08] text-[9.5px] text-gray-400 dark:text-neutral-500 text-center font-semibold">
          Click any price row to copy price into Order Form
        </div>
      </div>
    );
  };

  const renderOrderPanel = () => {
    const isForex = FOREX_SYMBOLS.includes(selectedAsset);
    const buyPrice = livePrice;
    const sellPrice = isForex ? parseFloat((buyPrice - 0.0001).toFixed(4)) : parseFloat((buyPrice * 0.9999).toFixed(2));
    const rawSpread = Math.abs(buyPrice - sellPrice);
    const spreadStr = isForex ? rawSpread.toFixed(4) : rawSpread.toFixed(2);
    
    const marginRequired = getOrderValueUSD() / leverage;
    const isInsufficientMargin = marginRequired > freeMargin;

    return (
      <div className="flex flex-col h-full bg-white dark:bg-[#111722] text-gray-900 dark:text-neutral-100 border-t lg:border-t-0 border-[#E0E3EB] dark:border-white/[0.08] overflow-hidden select-none">
        {/* Right Panel Header Switcher Tabs */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/[0.08] bg-[#FAFAFA] dark:bg-[#161D2A] text-[10.5px] font-semibold shrink-0 select-none pr-1.5">
          <div className="flex flex-1">
            <button
              type="button"
              onClick={() => setRightPanelTab('ticket')}
              className={`flex-1 py-2 text-center border-b-2 cursor-pointer transition-colors ${
                rightPanelTab === 'ticket' ? 'border-[#2563EB] text-[#2563EB] dark:text-blue-400 bg-white dark:bg-[#111722] font-semibold' : 'border-transparent text-gray-400 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200'
              }`}
            >
              Spot Ticket
            </button>
            <button
              type="button"
              onClick={() => setRightPanelTab('orderbook')}
              className={`flex-1 py-2 text-center border-b-2 cursor-pointer transition-colors ${
                rightPanelTab === 'orderbook' ? 'border-[#2563EB] text-[#2563EB] dark:text-blue-400 bg-white dark:bg-[#111722] font-semibold' : 'border-transparent text-gray-400 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200'
              }`}
            >
              Level 2 Book
            </button>
          </div>
          <button
            type="button"
            onClick={toggleRightCollapse}
            className="p-1 hover:bg-gray-200/70 dark:hover:bg-white/[0.08] rounded text-gray-400 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 transition-colors cursor-pointer ml-1"
            title="Collapse Spot Ticket panel (>)"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {rightPanelTab === 'orderbook' ? (
          renderOrderBook()
        ) : (
          <div className="flex-grow overflow-y-auto p-3 space-y-3.5 scrollbar-thin select-none">
            {/* HEADER & ASSET INFO ROW */}
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-white/[0.08] select-none">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold text-white shrink-0" style={{ backgroundColor: getAssetColor(selectedAsset) }}>
                  {selectedAsset[0]}
                </span>
                <span className="font-semibold text-xs text-gray-900 dark:text-neutral-100">{selectedAsset}</span>
              </div>
              <button 
                type="button"
                className="text-gray-400 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 transition-colors p-1 rounded hover:bg-gray-100 dark:hover:bg-white/[0.08] cursor-pointer" 
                title="Collapse Panel" 
                onClick={toggleRightCollapse}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Volume Sentiment Indicator */}
            <div className="select-none">
              <div className="h-1 w-full bg-gray-100 dark:bg-white/[0.08] rounded-full overflow-hidden flex">
                <div className="bg-[#f23645]" style={{ width: '62%' }} />
                <div className="bg-[#2563EB]" style={{ width: '38%' }} />
              </div>
              <div className="flex justify-between text-[8px] font-semibold text-gray-400 dark:text-neutral-500 mt-1 font-mono">
                <span className="text-[#f23645]">SELL 62%</span>
                <span className="text-[#2563EB] dark:text-blue-400">BUY 38%</span>
              </div>
            </div>

            {/* ── FORM MODE SWITCHER DROPDOWN ── */}
            <div className="relative select-none" ref={formModeRef}>
              <button
                type="button"
                onClick={() => setFormModeDropdownOpen(o => !o)}
                className="w-full bg-[#FAFAFA] dark:bg-[#161D2A] border border-[#E0E3EB] dark:border-white/[0.08] rounded-md py-1.5 px-3 flex items-center justify-between text-xs text-gray-700 dark:text-neutral-200 font-semibold hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                <span>
                  {orderFormMode === 'regular' && 'Regular Form'}
                  {orderFormMode === 'quick'   && 'Quick Trade'}
                  {orderFormMode === 'risk'    && 'Risk Calculator'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 dark:text-neutral-500 transition-transform duration-150 ${formModeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {formModeDropdownOpen && (
                <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white dark:bg-[#161D2A] border border-[#E0E3EB] dark:border-white/[0.08] rounded-md shadow-lg overflow-hidden">
                  {[['regular','Regular Form','Standard inputs — volume, price, TP/SL'],['quick','Quick Trade','One-click execution with preset lots'],['risk','Risk Calculator','Auto lot size from risk % and SL distance']].map(([mode, label, desc]) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => { setOrderFormMode(mode); setFormModeDropdownOpen(false); setErrorMsg(''); }}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors border-b border-gray-50 dark:border-white/[0.04] last:border-0 ${ orderFormMode === mode ? 'bg-blue-50 dark:bg-blue-500/10' : '' }`}
                    >
                      <div className={`text-[10px] font-semibold ${orderFormMode === mode ? 'text-[#2563EB] dark:text-blue-400' : 'text-gray-800 dark:text-neutral-100'}`}>{label}</div>
                      <div className="text-[9px] text-gray-400 dark:text-neutral-400 mt-0.5">{desc}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ════════════════════════════════════════ */}
            {/* MODE 1 — REGULAR FORM                   */}
            {/* ════════════════════════════════════════ */}
            {orderFormMode === 'regular' && (
              <div className="flex flex-col gap-3">
                {/* ORDER TYPE TABS */}
                <div className="bg-gray-100 dark:bg-[#161D2A] p-0.5 rounded-lg flex select-none">
                  <button type="button" onClick={() => setOrderSubtype('Market')} className={`w-1/2 py-1 rounded-md text-center font-semibold text-[9.5px] capitalize cursor-pointer transition-all ${orderSubtype === 'Market' ? 'bg-white dark:bg-[#1E293B] text-gray-800 dark:text-neutral-100 shadow-sm' : 'text-gray-400 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200'}`}>Market</button>
                  <button type="button" onClick={() => { if (orderSubtype === 'Market') setOrderSubtype('Limit'); }} className={`w-1/2 py-1 rounded-md text-center font-semibold text-[9.5px] capitalize cursor-pointer transition-all ${orderSubtype !== 'Market' ? 'bg-white dark:bg-[#1E293B] text-gray-800 dark:text-neutral-100 shadow-sm' : 'text-gray-400 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200'}`}>Pending</button>
                </div>

                {orderSubtype !== 'Market' && (
                  <div className="flex gap-2 items-center justify-between select-none">
                    <span className="text-[9px] font-semibold text-gray-400 dark:text-neutral-400 capitalize">Pending Type</span>
                    <select value={orderSubtype} onChange={(e) => setOrderSubtype(e.target.value)} className="bg-[#FAFAFA] dark:bg-[#161D2A] border border-[#E0E3EB] dark:border-white/[0.08] text-gray-700 dark:text-neutral-200 text-[10px] font-semibold rounded-md px-2 py-0.5 focus:outline-none focus:border-[#2563EB] cursor-pointer">
                      <option value="Limit">Limit Order</option>
                      <option value="Stop-Limit">Stop-Limit Order</option>
                    </select>
                  </div>
                )}
                {orderSubtype !== 'Market' && (
                  <div className="flex flex-col gap-1">
                    <label className="block text-[9px] text-gray-400 dark:text-neutral-400 capitalize font-semibold">Price (USDT)</label>
                    <div className="flex items-center bg-[#FAFAFA] dark:bg-[#161D2A] border border-[#E0E3EB] dark:border-white/[0.08] rounded-md px-3 h-8 focus-within:border-[#2563EB] transition-colors">
                      <input type="text" value={limitPrice} onChange={(e) => handlePriceInput(e.target.value)} className="w-full bg-transparent border-none text-xs font-semibold font-mono text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-0 p-0" />
                      <div className="flex items-center gap-2 select-none">
                        <button type="button" onClick={() => adjustPrice('limit', false)} className="text-gray-400 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 font-semibold p-1 transition-colors cursor-pointer"><Minus className="w-3 h-3" /></button>
                        <button type="button" onClick={() => adjustPrice('limit', true)}  className="text-gray-400 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 font-semibold p-1 transition-colors cursor-pointer"><Plus  className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                )}
                {orderSubtype === 'Stop-Limit' && (
                  <div className="flex flex-col gap-1">
                    <label className="block text-[9px] text-gray-400 dark:text-neutral-400 capitalize font-semibold">Stop Price (USDT)</label>
                    <div className="flex items-center bg-[#FAFAFA] dark:bg-[#161D2A] border border-[#E0E3EB] dark:border-white/[0.08] rounded-md px-3 h-8 focus-within:border-[#2563EB] transition-colors">
                      <input type="text" value={stopPrice} onChange={(e) => setStopPrice(e.target.value.replace(/[^0-9.]/g, ''))} className="w-full bg-transparent border-none text-xs font-semibold font-mono text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-0 p-0" />
                      <div className="flex items-center gap-2 select-none">
                        <button type="button" onClick={() => adjustPrice('stop', false)} className="text-gray-400 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 font-semibold p-1 transition-colors cursor-pointer"><Minus className="w-3 h-3" /></button>
                        <button type="button" onClick={() => adjustPrice('stop', true)}  className="text-gray-400 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 font-semibold p-1 transition-colors cursor-pointer"><Plus  className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Volume */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[9px] text-gray-400 dark:text-neutral-400 capitalize font-semibold"><span>Volume</span></div>
                  <div className="flex items-center bg-[#FAFAFA] dark:bg-[#161D2A] border border-[#E0E3EB] dark:border-white/[0.08] rounded-md px-3 h-8 focus-within:border-[#2563EB] transition-colors">
                    <input type="text" value={vol} onChange={(e) => handleVolInput(e.target.value)} className="w-full bg-transparent border-none text-xs font-semibold font-mono text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-0 p-0" />
                    <span className="text-[10px] font-semibold text-gray-400 dark:text-neutral-400 mr-2 select-none">Lots</span>
                    <div className="flex items-center gap-2 select-none">
                      <button type="button" onClick={() => adjustVol(false)} className="text-gray-400 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 font-semibold p-1 transition-colors cursor-pointer"><Minus className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={() => adjustVol(true)}  className="text-gray-400 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 font-semibold p-1 transition-colors cursor-pointer"><Plus  className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>

                {/* TP */}
                <div className="flex flex-col gap-1 border-t border-gray-100 dark:border-white/[0.08] pt-2.5">
                  <div className="flex justify-between items-center text-[9px] text-gray-400 dark:text-neutral-400 capitalize font-semibold">
                    <span className="flex items-center gap-1">Take Profit <button type="button" onClick={() => showToast('Take Profit triggers automatically to lock gains.','info')} className="text-gray-400 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"><HelpCircle className="w-3 h-3" /></button></span>
                  </div>
                  <div className="flex items-center bg-[#FAFAFA] dark:bg-[#161D2A] border border-[#E0E3EB] dark:border-white/[0.08] rounded-md px-3 h-8 focus-within:border-[#2563EB] transition-colors">
                    <input type="text" value={tpPrice} placeholder="Not set" onChange={(e) => setTpPrice(e.target.value.replace(/[^0-9.]/g, ''))} className="w-full bg-transparent border-none text-xs font-semibold font-mono text-gray-900 dark:text-neutral-100 placeholder-gray-300 dark:placeholder-neutral-600 focus:outline-none focus:ring-0 p-0" />
                    <div className="flex items-center gap-2 select-none">
                      <button type="button" onClick={() => adjustTp(false)} className="text-gray-400 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 font-semibold p-1 transition-colors cursor-pointer"><Minus className="w-3 h-3" /></button>
                      <button type="button" onClick={() => adjustTp(true)}  className="text-gray-400 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 font-semibold p-1 transition-colors cursor-pointer"><Plus  className="w-3 h-3" /></button>
                    </div>
                  </div>
                </div>

                {/* SL */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[9px] text-gray-400 dark:text-neutral-400 capitalize font-semibold">
                    <span className="flex items-center gap-1">Stop Loss <button type="button" onClick={() => showToast('Stop Loss triggers automatically to protect your capital.','info')} className="text-gray-400 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"><HelpCircle className="w-3 h-3" /></button></span>
                  </div>
                  <div className="flex items-center bg-[#FAFAFA] dark:bg-[#161D2A] border border-[#E0E3EB] dark:border-white/[0.08] rounded-md px-3 h-8 focus-within:border-[#2563EB] transition-colors">
                    <input type="text" value={slPrice} placeholder="Not set" onChange={(e) => setSlPrice(e.target.value.replace(/[^0-9.]/g, ''))} className="w-full bg-transparent border-none text-xs font-semibold font-mono text-gray-900 dark:text-neutral-100 placeholder-gray-300 dark:placeholder-neutral-600 focus:outline-none focus:ring-0 p-0" />
                    <div className="flex items-center gap-2 select-none">
                      <button type="button" onClick={() => adjustSl(false)} className="text-gray-400 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 font-semibold p-1 transition-colors cursor-pointer"><Minus className="w-3 h-3" /></button>
                      <button type="button" onClick={() => adjustSl(true)}  className="text-gray-400 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 font-semibold p-1 transition-colors cursor-pointer"><Plus  className="w-3 h-3" /></button>
                    </div>
                  </div>
                </div>

                {errorMsg && (<div className="flex items-center gap-1 text-[9px] text-[#f23645] font-semibold mt-0.5"><AlertCircle className="w-3.5 h-3.5 shrink-0" /><span>{errorMsg}</span></div>)}
              </div>
            )}

            {/* ════════════════════════════════════════ */}
            {/* MODE 2 — QUICK TRADE                    */}
            {/* ════════════════════════════════════════ */}
            {orderFormMode === 'quick' && (
              <div className="flex flex-col gap-3">
                <p className="text-[9px] text-gray-400 dark:text-neutral-500 font-semibold leading-relaxed">Select a preset lot size and execute instantly at market price. No extra inputs required.</p>

                {/* Preset lot buttons */}
                <div className="grid grid-cols-3 gap-1.5">
                  {['0.01','0.05','0.10','0.25','0.50','1.00'].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => { setVol(preset); syncTotalFromVol(parseFloat(preset), limitPrice); setOrderSubtype('Market'); }}
                      className={`py-2 rounded-md border text-[10px] font-semibold transition-all cursor-pointer ${
                        vol === preset
                          ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-sm'
                          : 'bg-[#FAFAFA] dark:bg-[#161D2A] border-[#E0E3EB] dark:border-white/[0.08] text-gray-600 dark:text-neutral-300 hover:border-[#2563EB] hover:text-[#2563EB]'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <div className="text-[9px] text-gray-400 dark:text-neutral-500 font-semibold text-center select-none">lots</div>

                {/* Custom vol */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-gray-400 dark:text-neutral-400 capitalize font-semibold">Custom Volume</label>
                  <div className="flex items-center bg-[#FAFAFA] dark:bg-[#161D2A] border border-[#E0E3EB] dark:border-white/[0.08] rounded-md px-3 h-8 focus-within:border-[#2563EB] transition-colors">
                    <input type="text" value={vol} onChange={(e) => handleVolInput(e.target.value)} className="w-full bg-transparent border-none text-xs font-semibold font-mono text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-0 p-0" />
                    <span className="text-[10px] font-semibold text-gray-400 dark:text-neutral-400 mr-2 select-none">Lots</span>
                    <div className="flex items-center gap-2 select-none">
                      <button type="button" onClick={() => adjustVol(false)} className="text-gray-400 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 font-semibold p-1 transition-colors cursor-pointer"><Minus className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={() => adjustVol(true)}  className="text-gray-400 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 font-semibold p-1 transition-colors cursor-pointer"><Plus  className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 dark:bg-[#161D2A]/60 border border-gray-100 dark:border-white/[0.08] rounded-md p-2.5 space-y-1.5">
                  <div className="flex justify-between text-[9px] font-semibold">
                    <span className="text-gray-400 dark:text-neutral-400">Order Value</span>
                    <span className="text-gray-800 dark:text-neutral-200 font-mono">${getOrderValueUSD().toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
                  </div>
                  <div className="flex justify-between text-[9px] font-semibold">
                    <span className="text-gray-400 dark:text-neutral-400">Margin Required</span>
                    <span className="text-gray-800 dark:text-neutral-200 font-mono">${(getOrderValueUSD()/leverage).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
                  </div>
                  <div className="flex justify-between text-[9px] font-semibold">
                    <span className="text-gray-400 dark:text-neutral-400">Leverage</span>
                    <span className="text-[#2563EB] dark:text-blue-400 font-mono">{leverage}x</span>
                  </div>
                </div>

                {errorMsg && (<div className="flex items-center gap-1 text-[9px] text-[#f23645] font-semibold mt-0.5"><AlertCircle className="w-3.5 h-3.5 shrink-0" /><span>{errorMsg}</span></div>)}
              </div>
            )}

            {/* ════════════════════════════════════════ */}
            {/* MODE 3 — RISK CALCULATOR                */}
            {/* ════════════════════════════════════════ */}
            {orderFormMode === 'risk' && (() => {
              const isForex   = FOREX_SYMBOLS.includes(selectedAsset);
              const isGold    = selectedAsset === 'XAU/USD';
              const pipSize        = isForex ? 0.0001 : isGold ? 0.10 : 1;
              const pipValuePerLot = isForex ? 10 : isGold ? 10 : 1;
              const unitLabel      = isForex ? 'pips' : isGold ? 'pips' : 'pts';

              const entryPx  = parseFloat(calcEntryPrice) || livePrice;
              const slPx     = parseFloat(slPrice);
              const tpPx     = parseFloat(calcTpPrice);
              const riskPctN = parseFloat(riskPct) || 0;

              const riskAmt      = (riskPctN / 100) * (balance + activeMargin);
              const slValid      = slPx > 0 && slPx !== entryPx;
              const slDistRaw    = slValid ? Math.abs(entryPx - slPx) : 0;
              const slDistPips   = pipSize > 0 ? slDistRaw / pipSize : 0;
              const tpValid      = tpPx > 0 && tpPx !== entryPx;
              const tpDistRaw    = tpValid ? Math.abs(tpPx - entryPx) : 0;
              const tpDistPips   = pipSize > 0 ? tpDistRaw / pipSize : 0;

              const rawLots    = (slDistPips > 0 && pipValuePerLot > 0 && riskAmt > 0)
                                   ? riskAmt / (slDistPips * pipValuePerLot)
                                   : 0;
              const calcLots   = Math.floor(rawLots * 100) / 100;

              const potLoss    = calcLots * slDistPips * pipValuePerLot;
              const potProfit  = tpValid ? calcLots * tpDistPips * pipValuePerLot : 0;
              const rrRatio    = slDistPips > 0 && tpDistPips > 0
                                   ? (tpDistPips / slDistPips).toFixed(2)
                                   : null;

              const inputH = 'h-8';
              const fieldCls = `flex items-center bg-[#FAFAFA] dark:bg-[#161D2A] border border-[#E0E3EB] dark:border-white/[0.08] rounded-md px-3 ${inputH} focus-within:border-[#2563EB] transition-colors`;
              const rowCls  = 'flex justify-between text-[9px] font-semibold py-1';

              return (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-gray-700 dark:text-neutral-200">Risk-Based Position Sizing</span>
                    <span className="text-[8px] bg-blue-50 dark:bg-blue-500/10 text-[#2563EB] dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded px-1 font-mono">1 Lot = {isForex ? '100k' : isGold ? '100oz' : '1 unit'}</span>
                  </div>

                  <div className="bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-md p-2 flex justify-between items-center text-[9.5px]">
                    <span className="text-gray-500 dark:text-neutral-400">Equity Base</span>
                    <span className="font-mono font-semibold text-gray-800 dark:text-neutral-200">${(balance + activeMargin).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[9px] text-gray-400 dark:text-neutral-400 font-semibold">
                      <span>Risk per Trade</span>
                      <span className="font-mono text-[#2563EB] dark:text-blue-400 font-semibold">${riskAmt.toFixed(2)} ({riskPct}%)</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {['0.5','1','2','3'].map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setRiskPct(p)}
                          className={`py-1 rounded text-[9.5px] font-semibold font-mono border transition-all cursor-pointer ${
                            riskPct === p
                              ? 'bg-[#2563EB] border-[#2563EB] text-white'
                              : 'bg-[#FAFAFA] dark:bg-[#161D2A] border-[#E0E3EB] dark:border-white/[0.08] text-gray-600 dark:text-neutral-300 hover:border-[#2563EB]'
                          }`}
                        >
                          {p}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[9px] text-gray-400 dark:text-neutral-400 font-semibold">
                      <span>Entry Price</span>
                      <button type="button" onClick={() => setCalcEntryPrice(livePrice.toString())} className="text-[#2563EB] dark:text-blue-400 hover:underline cursor-pointer">Use Live ({formatAssetPrice(livePrice)})</button>
                    </div>
                    <div className={fieldCls}>
                      <input
                        type="text"
                        value={calcEntryPrice}
                        placeholder={formatAssetPrice(livePrice)}
                        onChange={(e) => setCalcEntryPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                        className="w-full bg-transparent border-none text-xs font-semibold font-mono text-gray-900 dark:text-neutral-100 placeholder-gray-300 dark:placeholder-neutral-600 focus:outline-none focus:ring-0 p-0"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[9px] text-gray-400 dark:text-neutral-400 font-semibold">
                      <span className="text-[#f23645]">Stop-Loss Price *</span>
                      {slDistPips > 0 && <span className="font-mono text-gray-500 dark:text-neutral-400 font-semibold">{slDistPips.toFixed(1)} {unitLabel}</span>}
                    </div>
                    <div className={`${fieldCls} ${!slValid && slPrice ? 'border-[#f23645]' : ''}`}>
                      <input
                        type="text"
                        value={slPrice}
                        placeholder="Required for calculation"
                        onChange={(e) => setSlPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                        className="w-full bg-transparent border-none text-xs font-semibold font-mono text-gray-900 dark:text-neutral-100 placeholder-gray-300 dark:placeholder-neutral-600 focus:outline-none focus:ring-0 p-0"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[9px] text-gray-400 dark:text-neutral-400 font-semibold">
                      <span className="text-green-600 dark:text-green-400">Take-Profit Price (Optional)</span>
                      {tpDistPips > 0 && <span className="font-mono text-gray-500 dark:text-neutral-400 font-semibold">{tpDistPips.toFixed(1)} {unitLabel}</span>}
                    </div>
                    <div className={fieldCls}>
                      <input
                        type="text"
                        value={calcTpPrice}
                        placeholder="Optional target"
                        onChange={(e) => setCalcTpPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                        className="w-full bg-transparent border-none text-xs font-semibold font-mono text-gray-900 dark:text-neutral-100 placeholder-gray-300 dark:placeholder-neutral-600 focus:outline-none focus:ring-0 p-0"
                      />
                    </div>
                  </div>

                  {slValid && calcLots > 0 ? (
                    <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/50 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-900/40 rounded-md p-2.5 space-y-1">
                      <div className="text-[9px] font-semibold text-gray-500 dark:text-neutral-400 pb-1 border-b border-blue-100 dark:border-blue-900/40 flex justify-between items-center">
                        <span>Calculated Position</span>
                        <span className="text-[#2563EB] dark:text-blue-400 font-mono">1 pip = ${pipValuePerLot} / lot</span>
                      </div>
                      <div className="divide-y divide-blue-50/80 dark:divide-blue-900/20">
                        <div className={`${rowCls} pt-1`}>
                          <span className="text-gray-500 dark:text-neutral-400">Suggested Lots</span>
                          <span className={`font-mono font-semibold text-[10px] ${calcLots > 0 ? 'text-[#2563EB] dark:text-blue-400' : 'text-gray-300 dark:text-neutral-600'}`}>{calcLots > 0 ? calcLots.toFixed(2) : '< 0.01'}</span>
                        </div>
                        <div className={`${rowCls} border-b border-blue-50 dark:border-blue-900/20`}>
                          <span className="text-gray-500 dark:text-neutral-400">Max Loss</span>
                          <span className="text-[#f23645] font-mono">-${potLoss.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
                        </div>
                        {tpValid && (
                          <>
                            <div className={`${rowCls} border-b border-blue-50 dark:border-blue-900/20`}>
                              <span className="text-gray-500 dark:text-neutral-400">Potential Profit</span>
                              <span className="text-green-600 dark:text-green-400 font-mono">+${potProfit.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
                            </div>
                            <div className={rowCls}>
                              <span className="text-gray-500 dark:text-neutral-400">Risk : Reward</span>
                              <span className={`font-mono font-semibold text-[10px] ${parseFloat(rrRatio) >= 2 ? 'text-green-600 dark:text-green-400' : parseFloat(rrRatio) >= 1 ? 'text-yellow-600 dark:text-yellow-400' : 'text-[#f23645]'}`}>1 : {rrRatio}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-[#161D2A]/40 border border-dashed border-gray-200 dark:border-white/[0.08] rounded-md p-3 text-center">
                      <div className="text-[9px] text-gray-400 dark:text-neutral-500 font-semibold">Enter a stop-loss price above to calculate your position size</div>
                    </div>
                  )}

                  {calcLots > 0 && (
                    <button type="button"
                      onClick={() => { const lots = calcLots.toFixed(2); setVol(lots); syncTotalFromVol(parseFloat(lots), limitPrice); setOrderSubtype('Market'); showToast(`Lot size set to ${lots} (${riskPct}% risk · ${rrRatio ? `1:${rrRatio} R:R` : 'no TP set'})`, 'success'); }}
                      className="w-full py-2 bg-gradient-to-r from-[#2563EB] to-indigo-600 text-white text-[10px] font-semibold rounded-md hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer capitalize shadow-sm"
                    >
                      ✓ Apply {calcLots.toFixed(2)} Lots &amp; Go to Order
                    </button>
                  )}
                  {errorMsg && (<div className="flex items-center gap-1 text-[9px] text-[#f23645] font-semibold mt-0.5"><AlertCircle className="w-3.5 h-3.5 shrink-0" /><span>{errorMsg}</span></div>)}
                </div>
              );
            })()}

            {/* SUBMIT BUTTON & FOOTER STATS */}
            <div className="pt-2.5 border-t border-gray-100 dark:border-white/[0.08] font-semibold bg-[#FAFAFA] dark:bg-[#161D2A] p-3 rounded-lg flex flex-col gap-2.5">
              {/* Active Account Indicator */}
              <div className="flex justify-between items-center text-[10px] font-semibold text-gray-400 dark:text-neutral-400 pb-2 border-b border-gray-100 dark:border-white/[0.08] select-none">
                <span>Trading Account</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-900 dark:text-neutral-100 font-mono font-semibold">Demo #{accountNumber}</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-semibold capitalize bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/40 select-none">Active</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || isInsufficientMargin || !parseFloat(vol) || parseFloat(vol) <= 0}
                className="w-full text-white py-2 rounded-md font-semibold transition-colors cursor-pointer text-xs disabled:opacity-50 disabled:cursor-not-allowed capitalize min-h-[44px] flex items-center justify-center animate-fade-in"
                style={{
                  backgroundColor: isInsufficientMargin ? '#9CA3AF' : (orderType === 'buy' ? '#2563EB' : '#f23645')
                }}
              >
                {isPlacingOrder ? 'Executing...' : isInsufficientMargin ? 'Insufficient Margin' : (orderType === 'buy' ? `Buy ${selectedAsset}` : `Sell ${selectedAsset}`)}
              </button>
              
              {/* Account/Margin details */}
              <div className="text-[10px] space-y-1 text-gray-400 dark:text-neutral-400 font-semibold">
                <div className="flex justify-between">
                  <span>Available Balance:</span>
                  <span className="text-gray-700 dark:text-neutral-200 font-mono">{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
                </div>
                <div className="flex justify-between">
                  <span>Margin Required:</span>
                  <span className="text-gray-700 dark:text-neutral-200 font-mono">{marginRequired.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
                </div>
                <div className="flex justify-between">
                  <span>Free Margin:</span>
                  <span className="text-gray-700 dark:text-neutral-200 font-mono">{freeMargin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
                </div>
                <div className="flex justify-between">
                  <span>Account Equity:</span>
                  <span className="text-gray-700 dark:text-neutral-200 font-mono">{activeEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };


  // Tick last candle in real time with live prices
  useEffect(() => {
    if (!candleSeriesRef.current || !livePrice || !lastBarRef.current) return;
    
    const bar = { ...lastBarRef.current };
    bar.close = livePrice;
    bar.high = Math.max(bar.high, livePrice);
    bar.low = Math.min(bar.low, livePrice);
    
    if (chartType === 'candles') {
      candleSeriesRef.current.update(bar);
    } else {
      candleSeriesRef.current.update({
        time: bar.time,
        value: livePrice
      });
    }
  }, [livePrice, chartType]);

  console.log("Button reading asset:", selectedAsset);

  return (
    <div className="h-screen bg-[#F0F3FA] dark:bg-[#0B0E14] flex flex-col justify-between font-sans overflow-hidden text-[#111111] dark:text-neutral-100 select-none">
      {/* Toast Alert */}
      {toast.visible && (
        <div className="fixed top-20 right-6 z-50 animate-fade-in">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[#e0e0e0] dark:border-white/[0.08] shadow-sm bg-white dark:bg-[#161D2A] text-gray-800 dark:text-neutral-200">
            {toast.type === 'info' ? <Info className="w-5 h-5 text-[#2563EB] dark:text-blue-400 shrink-0" /> : <CheckCircle2 className="w-5 h-5 text-[#089981] shrink-0" />}
            <span className="text-xs font-semibold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Symbol Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111722] w-full max-w-[500px] rounded-brand border border-gray-200 dark:border-white/[0.08] shadow-xl flex flex-col overflow-hidden animate-fade-in max-h-[80vh]">
            <div className="p-4 border-b border-gray-100 dark:border-white/[0.08] flex items-center justify-between">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-neutral-100">Search Symbols</h3>
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-white/[0.08] rounded-md text-gray-400 dark:text-neutral-400 hover:text-gray-600 dark:hover:text-neutral-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 border-b border-gray-100 dark:border-white/[0.08] relative">
              <Search className="w-4 h-4 text-gray-400 dark:text-neutral-500 absolute left-7 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                autoFocus
                placeholder="Search instrument by name or symbol (Press Enter to select)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const filtered = Object.values(ASSETS).filter(item => {
                      return item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             item.type.toLowerCase().includes(searchQuery.toLowerCase());
                    });
                    if (filtered.length > 0) {
                      handleAssetChange(filtered[0].symbol);
                    }
                  } else if (e.key === 'Escape') {
                    setIsSearchOpen(false);
                  }
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-white/[0.08] bg-gray-50/50 dark:bg-[#161D2A] text-gray-900 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-neutral-500 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#2563EB] focus:bg-white dark:focus:bg-[#161D2A] transition-all"
              />
            </div>
            
            <div className="flex-grow overflow-y-auto p-2">
              <div className="space-y-1">
                {Object.values(ASSETS)
                  .filter(item => {
                    return item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.type.toLowerCase().includes(searchQuery.toLowerCase());
                  })
                  .map(item => {
                    const buyPrice = prices[item.symbol];
                    const changePct = getChangePercent(item.symbol);
                    const isUp = changePct >= 0;
                    
                    return (
                      <button
                        key={item.symbol}
                        onClick={() => handleAssetChange(item.symbol)}
                        className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.03] flex items-center justify-between transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${isUp ? 'bg-[#089981]' : 'bg-[#f23645]'}`} />
                          <div>
                            <div className="font-semibold text-xs text-gray-900 dark:text-neutral-100 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors">
                              {item.pair || (item.symbol.includes('/') ? item.symbol : `${item.symbol}/USDT`)}
                            </div>
                            <div className="text-[10px] text-gray-400 dark:text-neutral-500 font-medium">{item.name} • {item.type}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-xs font-mono text-gray-900 dark:text-neutral-100">{formatAssetPrice(buyPrice, item.symbol)}</div>
                          <div className={`text-[10px] font-semibold font-mono ${isUp ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                            {isUp ? '+' : ''}{changePct.toFixed(2)}%
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shared Navbar */}
      <Navbar userName={userName} onAccountSwitch={fetchAccountDetails} />

      {/* TOP TICKER STRIP */}
      <div className="bg-white dark:bg-[#111722] border-b border-[#E0E3EB] dark:border-white/[0.08] h-7 overflow-hidden relative flex items-center w-full select-none shrink-0">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-12 text-[10px] font-sans py-0.5">
          {[...Object.values(ASSETS), ...Object.values(ASSETS), ...Object.values(ASSETS)].map((item, idx) => {
            const currentPrice = prices[item.symbol] || item.price;
            const changePct = getChangePercent(item.symbol);
            const isUp = changePct >= 0;

            return (
              <button 
                key={idx} 
                onClick={() => handleAssetChange(item.symbol)}
                className="flex items-center gap-1.5 shrink-0 hover:opacity-80 transition-opacity cursor-pointer text-left"
              >
                <span className="font-semibold text-[#111111] dark:text-neutral-100">{item.symbol}</span>
                <span className="text-gray-500 dark:text-neutral-400 font-semibold tabular-nums">
                  {FOREX_SYMBOLS.includes(item.symbol) 
                    ? currentPrice.toFixed(4) 
                    : currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })
                  }
                </span>
                <span className={`text-[9px] font-semibold tabular-nums flex items-center gap-0.5 ${isUp ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                  {isUp ? '▲' : '▼'} {isUp ? '+' : ''}{changePct.toFixed(2)}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Trading Platform Outer Container */}
      <div className="flex-grow flex flex-col w-full h-full min-h-0 overflow-hidden relative">
        
        {/* ROW 1: Top Trading Workspace (Watchlist | Chart | Order Panel) */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden w-full relative">
        
        {/* Far Left Drawing Toolbar (TradingView Style) */}
        <aside className="hidden lg:flex w-11 bg-white dark:bg-[#111722] border-r border-[#E0E3EB] dark:border-white/[0.08] flex-col items-center py-2 justify-between shrink-0 select-none">
          <div className="flex flex-col items-center gap-2 w-full px-1">
            <button 
              title="Crosshair Cursor" 
              onClick={() => { setActiveDrawingTool('cursor'); showToast('Crosshair active', 'info'); }}
              className={`p-1.5 rounded-md transition-colors cursor-pointer w-8 h-8 flex items-center justify-center ${activeDrawingTool === 'cursor' ? 'bg-[#2563EB]/10 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400 font-semibold' : 'text-gray-400 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 hover:bg-gray-50 dark:hover:bg-white/[0.04]'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 2v20M2 12h20"/></svg>
            </button>
            
            <button 
              title="Trend Line" 
              onClick={() => { setActiveDrawingTool('trend'); showToast('Trend line tool selected. Click on chart to draw.', 'info'); }}
              className={`p-1.5 rounded-md transition-colors cursor-pointer w-8 h-8 flex items-center justify-center ${activeDrawingTool === 'trend' ? 'bg-[#2563EB]/10 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400 font-semibold' : 'text-gray-400 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 hover:bg-gray-50 dark:hover:bg-white/[0.04]'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="4" y1="20" x2="20" y2="4"/><circle cx="4" cy="20" r="1"/><circle cx="20" cy="4" r="1"/></svg>
            </button>
            
            <button 
              title="Fibonacci Retracement" 
              onClick={() => { setActiveDrawingTool('fib'); showToast('Fibonacci Retracement tool selected.', 'info'); }}
              className={`p-1.5 rounded-md transition-colors cursor-pointer w-8 h-8 flex items-center justify-center ${activeDrawingTool === 'fib' ? 'bg-[#2563EB]/10 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400 font-semibold' : 'text-gray-400 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 hover:bg-gray-50 dark:hover:bg-white/[0.04]'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            
            <button 
              title="Brush Tool" 
              onClick={() => { setActiveDrawingTool('brush'); showToast('Brush tool selected. Click and drag to draw.', 'info'); }}
              className={`p-1.5 rounded-md transition-colors cursor-pointer w-8 h-8 flex items-center justify-center ${activeDrawingTool === 'brush' ? 'bg-[#2563EB]/10 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400 font-semibold' : 'text-gray-400 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 hover:bg-gray-50 dark:hover:bg-white/[0.04]'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </button>
            
            <button 
              title="Text Annotation" 
              onClick={() => { setActiveDrawingTool('text'); showToast('Text tool selected. Click on chart to place text.', 'info'); }}
              className={`p-1.5 rounded-md transition-colors cursor-pointer w-8 h-8 flex items-center justify-center ${activeDrawingTool === 'text' ? 'bg-[#2563EB]/10 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400 font-semibold' : 'text-gray-400 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 hover:bg-gray-50 dark:hover:bg-white/[0.04]'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>
            </button>

            <button 
              title="Measure (Ruler)" 
              onClick={() => showToast('Measure tool activated. Click two points on the chart to measure distance & percent.', 'info')}
              className="p-1.5 rounded-md text-gray-400 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer w-8 h-8 flex items-center justify-center"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M22 12h-4M2 12h4M12 2v4M12 18v4M7 7l3 3M17 17l-3-3"/></svg>
            </button>

            <div className="w-6 h-[1px] bg-gray-100 dark:bg-white/[0.08] my-1" />

            <button 
              title={magnetMode ? "Magnet Mode (ON)" : "Magnet Mode (OFF)"}
              onClick={() => { setMagnetMode(!magnetMode); showToast(magnetMode ? "Magnet mode disabled" : "Magnet mode enabled: snap to price points", 'info'); }}
              className={`p-1.5 rounded-md transition-colors cursor-pointer w-8 h-8 flex items-center justify-center ${magnetMode ? 'bg-[#2563EB] text-white' : 'text-gray-400 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 hover:bg-gray-50 dark:hover:bg-white/[0.04]'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 5H7a4 4 0 0 0-4 4v5a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4V9a4 4 0 0 0-4-4z"/><path d="M7 11h2M15 11h2"/></svg>
            </button>
          </div>

          <div className="flex flex-col items-center gap-2 w-full px-1">
            <button 
              title={drawingsLocked ? "Unlock Drawings" : "Lock All Drawing Tools"}
              onClick={() => { setDrawingsLocked(!drawingsLocked); showToast(drawingsLocked ? "Drawing tools unlocked" : "All drawing tools locked in place", 'info'); }}
              className={`p-1.5 rounded-md transition-colors cursor-pointer w-8 h-8 flex items-center justify-center ${drawingsLocked ? 'bg-[#2563EB]/10 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400' : 'text-gray-400 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 hover:bg-gray-50 dark:hover:bg-white/[0.04]'}`}
            >
              {drawingsLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>

            <button 
              title={drawingsHidden ? "Show Drawings" : "Hide All Drawings"}
              onClick={() => { setDrawingsHidden(!drawingsHidden); showToast(drawingsHidden ? "Drawings visible" : "All drawings hidden from view", 'info'); }}
              className={`p-1.5 rounded-md transition-colors cursor-pointer w-8 h-8 flex items-center justify-center ${drawingsHidden ? 'bg-[#2563EB]/10 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400' : 'text-gray-400 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 hover:bg-gray-50 dark:hover:bg-white/[0.04]'}`}
            >
              {drawingsHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>

            <button 
              title="Remove Drawings & Indicators" 
              onClick={() => showToast('All drawings deleted from chart.', 'success')}
              className="p-1.5 rounded-md text-gray-400 dark:text-neutral-400 hover:text-[#f23645] hover:bg-[#f23645]/5 transition-colors cursor-pointer w-8 h-8 flex items-center justify-center"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* LEFT Column: Watchlist Panel */}
        {isLeftCollapsed ? (
          <aside 
            onClick={toggleLeftCollapse}
            className="hidden lg:flex w-9 bg-[#FAFAFA] dark:bg-[#161D2A] hover:bg-gray-100/80 dark:hover:bg-white/[0.04] border-r border-[#E0E3EB] dark:border-white/[0.08] flex-col items-center py-3 cursor-pointer select-none transition-all group shrink-0"
            title="Expand Watchlist panel"
          >
            <button
              type="button"
              onClick={toggleLeftCollapse}
              className="p-1 rounded bg-white dark:bg-[#111722] border border-gray-200 dark:border-white/[0.08] shadow-2xs text-gray-500 dark:text-neutral-400 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <div className="mt-6 [writing-mode:vertical-rl] rotate-180 text-[10.5px] font-bold text-gray-500 dark:text-neutral-400 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 capitalize flex items-center gap-1.5">
              <span>Watchlist</span>
              <span className="text-[9px] font-mono text-gray-400 dark:text-neutral-500">({Object.keys(ASSETS).length})</span>
            </div>
          </aside>
        ) : (
          <aside style={{ width: `${leftWidth}px` }} className="hidden lg:flex bg-white dark:bg-[#111722] flex-col overflow-hidden h-full shrink-0 transition-all border-r border-[#E0E3EB] dark:border-white/[0.08]">
            {renderWatchlist()}
          </aside>
        )}

        {/* Center and Left Work Area (Chart & Bottom Terminal) */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white dark:bg-[#0B0E14]">
          
          {/* Chart Section */}
          <div className="h-[420px] lg:h-0 lg:flex-grow flex flex-col overflow-hidden relative shrink-0 lg:min-h-0 bg-white dark:bg-[#0B0E14]">
            {/* Chart Top Header Toolbar: [SELL] [BUY] [Timeframes] [Chart Types] [Indicators/Tools] */}
            <div className="h-10 bg-white dark:bg-[#111722] border-b border-[#E0E3EB] dark:border-white/[0.08] flex items-center justify-between px-2.5 shrink-0 select-none z-20">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {/* SELL / BUY Quick Action Group */}
                <div className="flex items-center gap-1 bg-[#FAFAFA] dark:bg-[#161D2A] p-0.5 rounded-lg border border-gray-200/90 dark:border-white/[0.08] shadow-2xs shrink-0">
                  {/* SELL BUTTON (Red) */}
                  <button
                    type="button"
                    onClick={() => openChartTradeModal('sell')}
                    className="px-2.5 py-1 bg-[#f23645] hover:bg-[#d92332] active:scale-95 text-white rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                    title="Open Sell Order Modal"
                  >
                    <span className="capitalize text-[9px] opacity-90">Sell</span>
                    <span className="font-mono font-bold tabular-nums text-[10.5px]">
                      {formatAssetPrice(isForex ? parseFloat((livePrice - 0.0001).toFixed(4)) : parseFloat((livePrice * 0.9999).toFixed(2)))}
                    </span>
                  </button>

                  <div className="px-1 text-[8px] font-mono font-semibold text-gray-400 dark:text-neutral-500">
                    {isForex ? '0.0001' : '0.01'}
                  </div>

                  {/* BUY BUTTON (Blue) */}
                  <button
                    type="button"
                    onClick={() => openChartTradeModal('buy')}
                    className="px-2.5 py-1 bg-[#2563EB] hover:bg-[#1d4ed8] active:scale-95 text-white rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                    title="Open Buy Order Modal"
                  >
                    <span className="capitalize text-[9px] opacity-90">Buy</span>
                    <span className="font-mono font-bold tabular-nums text-[10.5px]">
                      {formatAssetPrice(livePrice)}
                    </span>
                  </button>
                </div>

                {/* Vertical Divider */}
                <div className="h-4 w-[1px] bg-gray-200 dark:bg-white/[0.08] mx-1 shrink-0" />

                {/* Timeframes: 1m, 15m, 1H, 4H, 1D */}
                <div className="flex items-center gap-0.5 bg-gray-100/70 dark:bg-[#161D2A] p-0.5 rounded-lg shrink-0 text-[10px] font-semibold">
                  {['1m', '15m', '1H', '4H', '1D'].map((tf) => (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setTimeframe(tf)}
                      className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                        timeframe === tf
                          ? 'bg-white dark:bg-[#1E293B] text-[#2563EB] dark:text-blue-400 font-bold shadow-2xs'
                          : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 hover:bg-white/60 dark:hover:bg-white/[0.04]'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>

                {/* Vertical Divider */}
                <div className="h-4 w-[1px] bg-gray-200 dark:bg-white/[0.08] mx-1 shrink-0" />

                {/* Chart Style (Candles / Line) */}
                <div className="flex items-center gap-0.5 bg-gray-100/70 dark:bg-[#161D2A] p-0.5 rounded-lg shrink-0 text-[10px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setChartType('candles')}
                    className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                      chartType === 'candles'
                        ? 'bg-white dark:bg-[#1E293B] text-[#2563EB] dark:text-blue-400 font-bold shadow-2xs'
                        : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 hover:bg-white/60 dark:hover:bg-white/[0.04]'
                    }`}
                    title="Candlestick Chart"
                  >
                    Candles
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartType('line')}
                    className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                      chartType === 'line'
                        ? 'bg-white dark:bg-[#1E293B] text-[#2563EB] dark:text-blue-400 font-bold shadow-2xs'
                        : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 hover:bg-white/60 dark:hover:bg-white/[0.04]'
                    }`}
                    title="Line Chart"
                  >
                    Line
                  </button>
                </div>

                {/* Indicators Button */}
                <button
                  type="button"
                  onClick={() => showToast('Technical indicators loaded on chart.', 'info')}
                  className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-gray-600 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-neutral-100 bg-gray-50 dark:bg-[#161D2A] hover:bg-gray-100 dark:hover:bg-[#1E293B] border border-gray-200 dark:border-white/[0.08] rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  <Sliders className="w-3 h-3 text-[#2563EB] dark:text-blue-400" />
                  <span>Indicators</span>
                </button>
              </div>

              {/* Right Side Tools */}
              <div className="flex items-center gap-1 shrink-0 pl-2">
                <button
                  type="button"
                  onClick={() => {
                    if (chartContainerRef.current) {
                      if (!document.fullscreenElement) {
                        chartContainerRef.current.requestFullscreen?.();
                      } else {
                        document.exitFullscreen?.();
                      }
                    }
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-white/[0.08] rounded text-gray-400 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                  title="Toggle Fullscreen"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Chart Canvas Area */}
            <div className="flex-grow w-full h-full bg-white dark:bg-[#0B0E14] relative overflow-hidden">
              {/* TradingView Chart Container */}
              <div ref={chartContainerRef} className="w-full h-full" />
            </div>
          </div>
        </main>

        {/* Right Sidebar (Spot Order Panel & Level 2 Order Book) */}
        {isRightCollapsed ? (
          <aside
            onClick={toggleRightCollapse}
            className="hidden lg:flex w-9 bg-[#FAFAFA] dark:bg-[#161D2A] hover:bg-gray-100/80 dark:hover:bg-white/[0.04] border-l border-[#E0E3EB] dark:border-white/[0.08] flex-col items-center py-3 cursor-pointer select-none transition-all group shrink-0"
            title="Expand Spot Ticket panel"
          >
            <button
              type="button"
              onClick={toggleRightCollapse}
              className="p-1 rounded bg-white dark:bg-[#111722] border border-gray-200 dark:border-white/[0.08] shadow-2xs text-gray-500 dark:text-neutral-400 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div className="mt-6 [writing-mode:vertical-rl] text-[10.5px] font-bold text-gray-500 dark:text-neutral-400 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 capitalize flex items-center gap-1.5">
              <span>{rightPanelTab === 'ticket' ? 'Spot Ticket' : 'Level 2 Book'}</span>
            </div>
          </aside>
        ) : (
          <>
            {/* Right Resize Handle */}
            <div 
              onMouseDown={startResizeRight}
              className="hidden lg:block w-[4px] hover:bg-[#2563EB]/40 active:bg-[#2563EB] bg-transparent border-l border-[#E0E3EB] dark:border-white/[0.08] hover:border-transparent cursor-col-resize transition-all duration-150 shrink-0 select-none z-10"
            />
            <aside style={{ width: isDesktop ? `${rightWidth}px` : '100%' }} className="w-full lg:w-auto bg-white dark:bg-[#111722] border-t lg:border-t-0 flex flex-col shrink-0 overflow-y-auto lg:overflow-hidden h-auto lg:h-full transition-all">
              {renderOrderPanel()}
            </aside>
          </>
        )}

        </div>

        {/* Terminal Horizontal Resize Handle (Full Width Bar) - hidden if collapsed */}
        {!isBottomCollapsed && (
          <div 
            onMouseDown={startResizeTerminal}
            className="h-[5px] hover:bg-[#2563EB]/40 active:bg-[#2563EB] bg-[#FAFAFA] dark:bg-[#161D2A] border-t border-b border-[#E0E3EB] dark:border-white/[0.08] hover:border-transparent cursor-row-resize transition-all duration-150 shrink-0 select-none z-10 w-full"
          />
        )}

        {/* ROW 2: Bottom Terminal (Positions / Pending Orders / Order History) — Full Width */}
        <div 
          style={{ height: isBottomCollapsed ? '32px' : `${terminalHeight}px` }} 
          className="bg-white dark:bg-[#111722] overflow-hidden flex flex-col shrink-0 w-full border-t border-gray-200 dark:border-white/[0.08] transition-[height] duration-200 ease-in-out"
        >
          {/* Header Tabs */}
          <div className="text-[11px] font-semibold border-b border-gray-100 dark:border-white/[0.08] bg-[#FAFAFA] dark:bg-[#161D2A] text-gray-400 dark:text-neutral-400 shrink-0 flex justify-between items-center px-2 py-0.5 h-8 select-none">
            <div className="flex items-center gap-2 select-none">
              {/* Bottom Panel Collapse / Expand Button */}
              <button
                type="button"
                onClick={toggleBottomCollapse}
                className="p-1 hover:bg-gray-200/80 dark:hover:bg-white/[0.08] rounded text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-semibold mr-1"
                title={isBottomCollapsed ? "Expand Terminal Panel (▲)" : "Collapse Terminal Panel (▼)"}
              >
                {isBottomCollapsed ? <ChevronUp className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span className="text-[9.5px] text-gray-600 dark:text-neutral-300 hidden sm:inline">{isBottomCollapsed ? "Expand" : "Collapse"}</span>
              </button>

              <div className="h-3.5 w-[1px] bg-gray-200 dark:bg-white/[0.08] mr-1" />

              {['positions', 'pending', 'history'].map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    setTableTab(tab);
                    if (isBottomCollapsed) setIsBottomCollapsed(false);
                  }}
                  className={`cursor-pointer transition-all py-1 px-1.5 relative capitalize text-[10px] ${
                    tableTab === tab && !isBottomCollapsed ? 'text-[#2563EB] dark:text-blue-400 font-bold border-b-2 border-[#2563EB] dark:border-blue-400' : 'text-gray-400 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200'
                  }`}
                >
                  {tab === 'positions' ? `Positions (${positions.length})` : tab === 'pending' ? 'Pending Orders (0)' : 'Order History'}
                </button>
              ))}
            </div>
            
            <div className="text-[9px] text-gray-400 dark:text-neutral-400 flex items-center gap-1 font-semibold pr-2">
              <span className="w-2 h-2 rounded-full bg-[#089981] animate-pulse" /> Live connection active
            </div>
          </div>

          {/* Terminal Table (Hidden when collapsed) */}
          {!isBottomCollapsed && (
            <div className="flex-grow overflow-auto p-2">
            {tableTab === 'positions' ? (
              positions.length > 0 ? (
                <table className="w-full text-left border-collapse text-xs min-w-[700px] font-sans">
                  <thead>
                    <tr className="border-b border-gray-200/60 dark:border-white/[0.08] bg-gray-50/50 dark:bg-[#161D2A] text-gray-400 dark:text-neutral-400 font-semibold capitalize text-[8px] sticky top-0">
                      <th className="px-3 py-1.5">Symbol</th>
                      <th className="px-3 py-1.5">Side</th>
                      <th className="px-3 py-1.5">Vol (Lots)</th>
                      <th className="px-3 py-1.5">Entry Price</th>
                      <th className="px-3 py-1.5">TP/SL</th>
                      <th className="px-3 py-1.5">Current Price</th>
                      <th className="px-3 py-1.5 text-right">P&L (USD)</th>
                      <th className="px-3 py-1.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/60 dark:divide-white/[0.04]">
                    {positions.map((pos) => {
                      const currentVal = prices[pos.symbol] || pos.entry;
                      const pnl = getPositionPnL(pos);
                      const isUp = pnl >= 0;

                      return (
                        <tr key={pos.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] text-gray-800 dark:text-neutral-200 text-[11px]">
                          <td className="px-3 py-1.5 font-semibold text-gray-900 dark:text-neutral-100">{pos.symbol?.includes('/') ? pos.symbol : `${pos.symbol}/USDT`}</td>
                          <td className="px-3 py-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold capitalize  ${
                              pos.side?.toLowerCase() === 'buy' ? 'bg-[#089981]/10 text-[#089981]' : 'bg-[#f23645]/10 text-[#f23645]'
                            }`}>
                              {pos.side ? pos.side.charAt(0).toUpperCase() + pos.side.slice(1) : 'Buy'}
                            </span>
                          </td>
                          <td className="px-3 py-1.5 font-mono tabular-nums">{formatLotSize(pos.size)}</td>
                          <td className="px-3 py-1.5 font-mono tabular-nums">
                            {FOREX_SYMBOLS.includes(pos.symbol) ? (pos.entry || 0).toFixed(4) : `$${(pos.entry || 0).toLocaleString()}`}
                          </td>
                          <td className="px-3 py-1.5 font-mono tabular-nums text-gray-500 dark:text-neutral-400">
                            {(() => {
                              const tpText = pos.take_profit ? (FOREX_SYMBOLS.includes(pos.symbol) ? pos.take_profit.toFixed(4) : pos.take_profit.toLocaleString()) : '--';
                              const slText = pos.stop_loss ? (FOREX_SYMBOLS.includes(pos.symbol) ? pos.stop_loss.toFixed(4) : pos.stop_loss.toLocaleString()) : '--';
                              return (
                                <button
                                  type="button"
                                  onClick={() => openTPSLEditModal(pos)}
                                  className="hover:text-[#2563EB] dark:hover:text-blue-400 hover:underline cursor-pointer flex items-center gap-1 font-mono text-[10.5px]"
                                  title="Click to adjust TP / SL"
                                >
                                  <span className={pos.take_profit ? 'text-[#089981] font-semibold' : ''}>{tpText}</span>
                                  <span>/</span>
                                  <span className={pos.stop_loss ? 'text-[#f23645] font-semibold' : ''}>{slText}</span>
                                  <Pencil className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                                </button>
                              );
                            })()}
                          </td>
                          <td className="px-3 py-1.5 font-mono tabular-nums text-gray-900 dark:text-neutral-100">
                            {FOREX_SYMBOLS.includes(pos.symbol) ? (currentVal || 0).toFixed(4) : `$${(currentVal || 0).toLocaleString()}`}
                          </td>
                          <td className={`px-3 py-1.5 text-right font-mono font-semibold tabular-nums ${isUp ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                            {isUp ? '+' : ''}{pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                          </td>
                          <td className="px-3 py-1.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => showToast('Close By execution is not available on this instrument.', 'info')}
                                className="px-1.5 py-0.5 border border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-white/[0.04] rounded text-[9px] font-semibold text-gray-500 dark:text-neutral-400 cursor-pointer"
                              >
                                Close By
                              </button>
                              <button
                                type="button"
                                onClick={() => showToast('Reverse position execution requested', 'info')}
                                className="px-1.5 py-0.5 border border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-white/[0.04] rounded text-[9px] font-semibold text-gray-500 dark:text-neutral-400 cursor-pointer"
                              >
                                Reverse
                              </button>
                              <button
                                type="button"
                                disabled={isClosingId !== null}
                                onClick={() => handleClosePosition(pos.id, pos.symbol, pos.entry)}
                                className="px-2 py-0.5 bg-black dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded text-[9px] font-semibold capitalize transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isClosingId === pos.id ? 'Closing...' : 'Close'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center select-none animate-fade-in">
                  <div className="w-12 h-12 bg-gray-50 dark:bg-[#161D2A] border border-gray-100 dark:border-white/[0.08] rounded-full flex items-center justify-center mb-3 text-gray-400 dark:text-neutral-400 shadow-sm">
                    <svg className="w-6 h-6 text-gray-400 dark:text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-xs text-gray-700 dark:text-neutral-200">No open positions</h3>
                  <p className="text-[10px] text-gray-400 dark:text-neutral-500 mt-1 max-w-xs leading-relaxed font-semibold">
                    Your trades will appear here once you place an order.
                  </p>
                </div>
              )
            ) : tableTab === 'history' ? (
              loadingHistory ? (
                <div className="text-center py-8 text-gray-400 dark:text-neutral-400 text-xs font-semibold select-none animate-pulse">
                  Loading order history...
                </div>
              ) : historyTrades.length > 0 ? (
                <table className="w-full text-left border-collapse text-xs min-w-[700px] font-sans">
                  <thead>
                    <tr className="border-b border-gray-200/60 dark:border-white/[0.08] bg-gray-50/50 dark:bg-[#161D2A] text-gray-400 dark:text-neutral-400 font-semibold capitalize text-[8px] sticky top-0">
                      <th className="px-3 py-1.5">Symbol</th>
                      <th className="px-3 py-1.5">Side</th>
                      <th className="px-3 py-1.5">Vol (Lots)</th>
                      <th className="px-3 py-1.5">Entry Price</th>
                      <th className="px-3 py-1.5">Close Price</th>
                      <th className="px-3 py-1.5 text-right">P&L (USD)</th>
                      <th className="px-3 py-1.5 text-right">Close Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/60 dark:divide-white/[0.04]">
                    {historyTrades.map((pos) => {
                      const isUp = pos.pnl >= 0;
                      return (
                        <tr key={pos.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] text-gray-800 dark:text-neutral-200 text-[11px]">
                          <td className="px-3 py-1.5 font-semibold text-gray-900 dark:text-neutral-100">{pos.symbol}/USDT</td>
                          <td className="px-3 py-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold capitalize  ${
                              pos.side?.toLowerCase() === 'buy' ? 'bg-[#089981]/10 text-[#089981]' : 'bg-[#f23645]/10 text-[#f23645]'
                            }`}>
                              {pos.side?.charAt(0).toUpperCase() + pos.side?.slice(1)}
                            </span>
                          </td>
                          <td className="px-3 py-1.5 font-mono tabular-nums">{formatLotSize(pos.size)}</td>
                          <td className="px-3 py-1.5 font-mono tabular-nums">
                            {FOREX_SYMBOLS.includes(pos.symbol) ? pos.entry.toFixed(4) : `$${pos.entry.toLocaleString()}`}
                          </td>
                          <td className="px-3 py-1.5 font-mono tabular-nums text-gray-900 dark:text-neutral-100">
                            {FOREX_SYMBOLS.includes(pos.symbol) ? pos.exit?.toFixed(4) : `$${pos.exit?.toLocaleString()}`}
                          </td>
                          <td className={`px-3 py-1.5 text-right font-mono font-semibold tabular-nums ${isUp ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                            {isUp ? '+' : ''}{pos.pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                          </td>
                          <td className="px-3 py-1.5 text-right text-gray-500 dark:text-neutral-400 font-semibold">{pos.closed_time}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center select-none animate-fade-in">
                  <div className="w-12 h-12 bg-gray-50 dark:bg-[#161D2A] border border-gray-100 dark:border-white/[0.08] rounded-full flex items-center justify-center mb-3 text-gray-400 dark:text-neutral-400 shadow-sm">
                    <svg className="w-6 h-6 text-gray-400 dark:text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-xs text-gray-700 dark:text-neutral-200">No closed orders yet</h3>
                  <p className="text-[10px] text-gray-400 dark:text-neutral-500 mt-1 max-w-xs leading-relaxed font-semibold">
                    Your completed trades will be logged here for tracking.
                  </p>
                </div>
              )
            ) : (
              <div className="text-center py-8 text-gray-400 dark:text-neutral-400 text-xs font-semibold">
                No pending orders found.
              </div>
            )}
          </div>
        )}
      </div>

      </div>

      {/* Modal for TP / SL adjustments */}
      {isTPSLModalOpen && tpslEditingPos && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111722] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-6 max-w-sm w-full shadow-2xl select-none animate-in scale-in duration-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-neutral-100">Adjust Take Profit &amp; Stop Loss</h3>
              <button 
                onClick={() => setIsTPSLModalOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-white/[0.08] rounded-lg text-gray-400 dark:text-neutral-400 hover:text-gray-600 dark:hover:text-neutral-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-neutral-500 font-semibold mb-4">
              {tpslEditingPos.symbol} • {tpslEditingPos.side?.toUpperCase()} {formatLotSize(tpslEditingPos.size)} Lots @ {tpslEditingPos.entry}
            </p>
            <form onSubmit={handleUpdateTPSLSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 capitalize block">Take Profit Price</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 105000"
                  value={modalEditTP}
                  onChange={(e) => setModalEditTP(e.target.value)}
                  className="w-full bg-white dark:bg-[#161D2A] border border-gray-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-900 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:border-[#2563EB] transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-red-600 dark:text-red-400 capitalize block">Stop Loss Price</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 98000"
                  value={modalEditSL}
                  onChange={(e) => setModalEditSL(e.target.value)}
                  className="w-full bg-white dark:bg-[#161D2A] border border-gray-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-900 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:border-[#2563EB] transition-colors"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsTPSLModalOpen(false)}
                  className="px-4 py-2 bg-gray-50 dark:bg-[#161D2A] hover:bg-gray-100 dark:hover:bg-[#1E293B] border border-gray-200 dark:border-white/[0.08] rounded-lg text-xs font-semibold text-gray-600 dark:text-neutral-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer"
                >
                  Save Levels
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for renaming an account */}
      {isRenameModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111722] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-6 max-w-sm w-full shadow-2xl select-none animate-in scale-in duration-200">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-neutral-100 mb-3">Rename Account</h3>
            <form onSubmit={submitRenameAccount} className="space-y-4">
              {renameError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 rounded-lg text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 animate-bounce" />
                  {renameError}
                </div>
              )}
              <input
                type="text"
                maxLength="30"
                placeholder="e.g. Gold Strategy Test"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="w-full bg-white dark:bg-[#161D2A] border border-gray-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-900 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
                autoFocus
              />
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsRenameModalOpen(false)}
                  className="px-4 py-2 bg-gray-50 dark:bg-[#161D2A] hover:bg-gray-100 dark:hover:bg-[#1E293B] border border-gray-200 dark:border-white/[0.08] rounded-lg text-xs font-semibold text-gray-600 dark:text-neutral-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for creating a new demo account */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111722] border border-[#E5E7EB] dark:border-white/[0.08] rounded-2xl p-6 max-w-md w-full shadow-2xl select-none animate-in scale-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold text-[#111111] dark:text-neutral-100 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#2563EB] dark:text-blue-400" />
                New Practice Account
              </h2>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-white/[0.08] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleCreateAccountSubmit} className="space-y-4">
              {createError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 rounded-lg text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  {createError}
                </div>
              )}

              {/* Account Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-500 dark:text-neutral-400 capitalize block">Account Name (Optional)</label>
                <input
                  type="text"
                  maxLength="50"
                  placeholder="e.g. Scalping Practice, Gold Strategy"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  className="w-full bg-white dark:bg-[#161D2A] border border-gray-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-900 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
                />
              </div>

              {/* Preset Balances */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-500 dark:text-neutral-400 capitalize block">Starting Capital</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 1000, label: '$1,000' },
                    { value: 5000, label: '$5,000' },
                    { value: 10000, label: '$10,000' },
                    { value: 25000, label: '$25,000' },
                    { value: 50000, label: '$50,000' },
                    { value: 100000, label: '$100,000' }
                  ].map((preset) => {
                    const isSelected = newAccountPreset === preset.value && !customAmount;
                    return (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => {
                          setNewAccountPreset(preset.value);
                          setCustomAmount('');
                          setCreateError('');
                        }}
                        className={`py-1.5 px-2 border rounded-xl font-mono font-semibold text-[10px] transition-all cursor-pointer text-center ${
                          isSelected
                            ? 'border-[#2563EB] bg-[#2563EB]/5 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400 shadow-sm'
                            : 'border-gray-200 dark:border-white/[0.08] hover:border-gray-300 dark:hover:border-white/[0.2] text-gray-700 dark:text-neutral-200 bg-white dark:bg-[#161D2A]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Starting Capital */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-500 dark:text-neutral-400 capitalize block">Or Custom Amount (USD)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-neutral-500 font-mono font-semibold text-xs">$</span>
                  <input
                    type="number"
                    min="100"
                    max="1000000"
                    placeholder="Min $100 - Max $1,000,000"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setNewAccountPreset(0);
                      setCreateError('');
                    }}
                    className="w-full bg-white dark:bg-[#161D2A] border border-gray-200 dark:border-white/[0.08] rounded-xl pl-7 pr-3.5 py-2.5 text-xs font-semibold text-gray-900 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2 border border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-white/[0.04] text-gray-700 dark:text-neutral-300 font-semibold text-xs rounded-xl transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer text-center"
                >
                  {creating ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BALANCE SETTINGS MODAL */}
      {isBalanceSettingsOpen && accountData && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[300] p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111722] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 select-none">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-neutral-100 mb-3">Adjust Account Balance</h3>
            <p className="text-xs text-gray-400 dark:text-neutral-400 font-semibold mb-4">
              Set a new virtual capital for {accountData.accountName || `Demo #${accountData.accountNumber}`}.
            </p>
            <form onSubmit={handleAdjustBalanceSubmit} className="space-y-4">
              {adjustError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 rounded-lg text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 animate-bounce" />
                  {adjustError}
                </div>
              )}
              {/* Presets Grid */}
              <div className="grid grid-cols-3 gap-2">
                {[1000, 5000, 10000, 25000, 50000, 100000].map((presetVal) => {
                  const isSelected = selectedAdjustPreset === presetVal && !customAdjustAmount;
                  return (
                    <button
                      key={presetVal}
                      type="button"
                      onClick={() => {
                        setSelectedAdjustPreset(presetVal);
                        setCustomAdjustAmount('');
                      }}
                      className={`py-2 px-1 border rounded-lg font-mono font-semibold text-xs transition-all cursor-pointer text-center ${
                        isSelected
                          ? 'border-[#2563EB] bg-[#2563EB]/5 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400'
                          : 'border-gray-200 dark:border-white/[0.08] hover:border-gray-300 dark:hover:border-white/[0.2] text-gray-600 dark:text-neutral-300 bg-white dark:bg-[#161D2A]'
                      }`}
                    >
                      ${presetVal.toLocaleString()}
                    </button>
                  );
                })}
              </div>
              {/* Custom Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 dark:text-neutral-400 capitalize">Custom Amount</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-neutral-500 font-mono font-semibold text-xs">$</span>
                  <input
                    type="number"
                    min="100"
                    max="1000000"
                    placeholder="Min $100 - Max $1M"
                    value={customAdjustAmount}
                    onChange={(e) => {
                      setCustomAdjustAmount(e.target.value);
                      setSelectedAdjustPreset(0);
                    }}
                    className="w-full bg-white dark:bg-[#161D2A] border border-gray-200 dark:border-white/[0.08] rounded-lg pl-6 pr-3 py-2 text-xs font-semibold text-gray-900 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
                  />
                </div>
              </div>
              {/* Actions */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsBalanceSettingsOpen(false)}
                  className="px-4 py-2 bg-gray-50 dark:bg-[#161D2A] hover:bg-gray-100 dark:hover:bg-[#1E293B] border border-gray-200 dark:border-white/[0.08] rounded-lg text-xs font-semibold text-gray-600 dark:text-neutral-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="px-4 py-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {adjusting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK CHART TRADING MODAL */}
      {isChartTradeModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111722] border border-[#E5E7EB] dark:border-white/[0.08] rounded-2xl p-6 max-w-md w-full shadow-2xl select-none animate-in scale-in duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-gray-100 dark:border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold ${modalSide === 'buy' ? 'bg-[#2563EB]' : 'bg-[#f23645]'}`}>
                  {modalSide === 'buy' ? '▲' : '▼'}
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#111111] dark:text-neutral-100 capitalize">
                    {modalSide === 'buy' ? 'Buy Order' : 'Sell Order'} — {selectedAsset}
                  </h2>
                  <p className="text-[10px] text-gray-400 dark:text-neutral-500 font-semibold">Demo Account #{accountNumber}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsChartTradeModalOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-white/[0.08] rounded-lg text-gray-400 dark:text-neutral-400 hover:text-gray-600 dark:hover:text-neutral-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {modalError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2 mb-4 animate-in fade-in">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleModalOrderSubmit} className="space-y-4">
              {/* Order Side Selector Pill */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-[#161D2A] rounded-xl">
                <button
                  type="button"
                  onClick={() => setModalSide('buy')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    modalSide === 'buy'
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100'
                  }`}
                >
                  Buy
                </button>
                <button
                  type="button"
                  onClick={() => setModalSide('sell')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    modalSide === 'sell'
                      ? 'bg-[#f23645] text-white shadow-xs'
                      : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100'
                  }`}
                >
                  Sell
                </button>
              </div>

              {/* 1. Currency Pair & Live Market Price Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold capitalize text-gray-500 dark:text-neutral-400 mb-1">
                    Currency Pair
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={selectedAsset.includes('/') ? selectedAsset : `${selectedAsset}/USDT`}
                    className="w-full bg-gray-50 dark:bg-[#161D2A] border border-gray-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs font-bold text-gray-800 dark:text-neutral-200 cursor-not-allowed focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold capitalize text-gray-500 dark:text-neutral-400 mb-1">
                    Market Price (Live)
                  </label>
                  <div className="w-full bg-gray-50 dark:bg-[#161D2A] border border-gray-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#2563EB] dark:text-blue-400 flex items-center justify-between">
                    <span>${formatAssetPrice(livePrice)}</span>
                    <span className="w-2 h-2 rounded-full bg-[#089981] animate-pulse" />
                  </div>
                </div>
              </div>

              {/* 2. Execution Type */}
              <div>
                <label className="block text-[10px] font-bold capitalize text-gray-500 dark:text-neutral-400 mb-1">
                  Execution Type
                </label>
                <select
                  value={modalExecType}
                  onChange={(e) => setModalExecType(e.target.value)}
                  className="w-full bg-white dark:bg-[#161D2A] border border-gray-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 dark:text-neutral-100 focus:outline-none focus:border-[#2563EB] cursor-pointer"
                >
                  <option value="Market">Market execution</option>
                  <option value="Buy limit">Buy limit</option>
                  <option value="Sell limit">Sell limit</option>
                  <option value="Buy stop">Buy stop</option>
                  <option value="Sell stop">Sell stop</option>
                  <option value="Buy stop limit">Buy stop limit</option>
                  <option value="Sell stop limit">Sell stop limit</option>
                </select>
              </div>

              {/* 3. Volume / Lots */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold capitalize text-gray-500 dark:text-neutral-400">
                    Volume / Lots
                  </label>
                  <span className="text-[9.5px] font-mono text-gray-400 dark:text-neutral-500">1 lot = {isForex ? '100,000' : '1 unit'}</span>
                </div>
                <div className="flex items-center bg-[#FAFAFA] dark:bg-[#161D2A] border border-[#E0E3EB] dark:border-white/[0.08] rounded-xl px-3 h-10 focus-within:border-[#2563EB] transition-colors">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="100"
                    required
                    value={modalVolume}
                    onChange={(e) => setModalVolume(e.target.value)}
                    className="w-full bg-transparent border-none text-xs font-bold font-mono text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-0 p-0"
                    placeholder="0.10"
                  />
                  <div className="flex items-center gap-1.5 select-none pl-2">
                    <button
                      type="button"
                      onClick={() => {
                        const cur = parseFloat(modalVolume) || 0.10;
                        setModalVolume(Math.max(0.01, parseFloat((cur - 0.01).toFixed(2))).toString());
                      }}
                      className="text-gray-400 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 p-1 rounded hover:bg-gray-200/50 dark:hover:bg-white/[0.08] cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = parseFloat(modalVolume) || 0.10;
                        setModalVolume(parseFloat((cur + 0.01).toFixed(2)).toString());
                      }}
                      className="text-gray-400 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 p-1 rounded hover:bg-gray-200/50 dark:hover:bg-white/[0.08] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. Conditional Trigger Price (Hidden if Market execution) */}
              {modalExecType !== 'Market' && (
                <div className="animate-in fade-in duration-150">
                  <label className="block text-[10px] font-bold capitalize text-gray-500 dark:text-neutral-400 mb-1">
                    Order Price ({selectedAsset.includes('/') ? 'Quote' : 'USDT'}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={modalPrice}
                    onChange={(e) => setModalPrice(e.target.value)}
                    placeholder={formatAssetPrice(livePrice)}
                    className="w-full bg-[#FAFAFA] dark:bg-[#161D2A] border border-[#E0E3EB] dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs font-bold font-mono text-gray-900 dark:text-neutral-100 focus:outline-none focus:border-[#2563EB] transition-colors"
                  />
                </div>
              )}

              {/* 5. Take Profit & Stop Loss Row */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-bold capitalize text-emerald-600 dark:text-emerald-400 mb-1">
                    Take Profit (optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={modalTakeProfit}
                    onChange={(e) => setModalTakeProfit(e.target.value)}
                    placeholder="Not set"
                    className="w-full bg-[#FAFAFA] dark:bg-[#161D2A] border border-[#E0E3EB] dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs font-semibold font-mono text-gray-900 dark:text-neutral-100 placeholder-gray-300 dark:placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold capitalize text-red-600 dark:text-red-400 mb-1">
                    Stop Loss (optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={modalStopLoss}
                    onChange={(e) => setModalStopLoss(e.target.value)}
                    placeholder="Not set"
                    className="w-full bg-[#FAFAFA] dark:bg-[#161D2A] border border-[#E0E3EB] dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs font-semibold font-mono text-gray-900 dark:text-neutral-100 placeholder-gray-300 dark:placeholder-neutral-600 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              {/* Margin / Account Summary Strip */}
              <div className="p-3 bg-gray-50 dark:bg-[#161D2A] rounded-xl border border-gray-100 dark:border-white/[0.08] text-[10px] font-mono text-gray-500 dark:text-neutral-400 flex justify-between items-center">
                <span>Free Margin: ${freeMargin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span>Lev: 1:{leverage}</span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsChartTradeModalOpen(false)}
                  className="flex-1 py-2.5 border border-[#E0E3EB] dark:border-white/[0.08] rounded-xl text-xs font-bold text-gray-600 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer capitalize"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className={`flex-1 py-2.5 text-white rounded-xl text-xs font-bold transition-all cursor-pointer capitalize disabled:opacity-50 shadow-sm ${
                    modalSide === 'buy' ? 'bg-[#2563EB] hover:bg-[#1d4ed8]' : 'bg-[#f23645] hover:bg-[#d92332]'
                  }`}
                >
                  {modalSubmitting ? 'Placing Order...' : `Place ${modalSide.toUpperCase()} Order`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-[9px] text-[#9CA3AF] dark:text-neutral-500 py-1 bg-white dark:bg-[#111722] border-t border-[#E0E3EB] dark:border-white/[0.08] shrink-0 select-none font-medium">
        &copy; {new Date().getFullYear()} PaperPulse. Virtual trading educational simulator. No real money trades are processed.
      </footer>
    </div>
  );
}
