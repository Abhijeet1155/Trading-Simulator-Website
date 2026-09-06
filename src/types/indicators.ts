export interface FVGZone {
  id: string;
  type: 'BULLISH' | 'BEARISH';
  startBarIndex: number;
  endBarIndex: number;
  topPrice: number;
  bottomPrice: number;
  midPrice: number; // 50% Consequent Encroachment (CE)
  isMitigated: boolean;
  mitigatedBarIndex?: number;
}

export interface OrderBlockZone {
  id: string;
  type: 'BULLISH' | 'BEARISH'; // +OB (Demand) or -OB (Supply)
  barIndex: number;
  endBarIndex: number;
  topPrice: number;
  bottomPrice: number;
  meanThreshold: number; // 50% Mean Threshold
  isMitigated: boolean;
  mitigatedBarIndex?: number;
}

export interface LiquidityLevel {
  id: string;
  name: string; // e.g., 'Asia High (BSL)', 'Asia Low (SSL)', 'London High'
  price: number;
  startBarIndex: number;
  endBarIndex: number;
  type: 'BSL' | 'SSL';
  isSwept: boolean;
  sweptBarIndex?: number;
  sweptPrice?: number;
}

export interface KillzoneBand {
  id: string;
  name: string;
  startBarIndex: number;
  endBarIndex: number;
  color: string;
  label: string;
}

export interface EMAData {
  period: number;
  color: string;
  values: (number | null)[];
}

export interface IndicatorSettings {
  fvg: {
    enabled: boolean;
    showUnmitigatedOnly: boolean;
    bullishColor: string;
    bearishColor: string;
    opacity: number;
    showCE: boolean;
  };
  orderBlocks: {
    enabled: boolean;
    showUnmitigatedOnly: boolean;
    bullishColor: string;
    bearishColor: string;
    opacity: number;
    showMeanThreshold: boolean;
  };
  liquiditySweeps: {
    enabled: boolean;
    showAsia: boolean;
    showLondon: boolean;
    showNY: boolean;
    showSweptLabels: boolean;
  };
  killzones: {
    enabled: boolean;
    showAsia: boolean;
    showLondon: boolean;
    showNY: boolean;
    opacity: number;
  };
  emaRibbon: {
    enabled: boolean;
    ema20: boolean;
    ema50: boolean;
    ema200: boolean;
    ema20Color: string;
    ema50Color: string;
    ema200Color: string;
  };
}

export const DEFAULT_INDICATOR_SETTINGS: IndicatorSettings = {
  fvg: {
    enabled: true,
    showUnmitigatedOnly: true,
    bullishColor: '#10b981', // Emerald Green
    bearishColor: '#f43f5e', // Rose Red
    opacity: 0.18,
    showCE: true,
  },
  orderBlocks: {
    enabled: true,
    showUnmitigatedOnly: true,
    bullishColor: '#3b82f6', // Royal Blue
    bearishColor: '#f97316', // Amber Orange
    opacity: 0.22,
    showMeanThreshold: true,
  },
  liquiditySweeps: {
    enabled: true,
    showAsia: true,
    showLondon: true,
    showNY: true,
    showSweptLabels: true,
  },
  killzones: {
    enabled: true,
    showAsia: true,
    showLondon: true,
    showNY: true,
    opacity: 0.05,
  },
  emaRibbon: {
    enabled: false,
    ema20: true,
    ema50: true,
    ema200: true,
    ema20Color: '#38bdf8', // Light Blue
    ema50Color: '#fbbf24', // Amber Yellow
    ema200Color: '#a855f7', // Purple
  },
};
