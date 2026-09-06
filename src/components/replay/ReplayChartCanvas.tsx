'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CandleData, ReplayPosition } from '../../types/replay';
import { 
  FVGZone, 
  OrderBlockZone, 
  LiquidityLevel, 
  KillzoneBand, 
  EMAData, 
  IndicatorSettings 
} from '../../types/indicators';
import { Scissors, TrendingUp, TrendingDown, Target, ShieldAlert, Zap } from 'lucide-react';

interface ReplayChartCanvasProps {
  candles: CandleData[];
  visibleIndex: number;
  isScissorsActive: boolean;
  onCutAt: (index: number) => void;
  activePosition: ReplayPosition | null;
  symbol: string;
  timeframe: string;
  fvgs?: FVGZone[];
  orderBlocks?: OrderBlockZone[];
  liquidityLevels?: LiquidityLevel[];
  killzones?: KillzoneBand[];
  emas?: EMAData[];
  indicatorSettings?: IndicatorSettings;
}

export default function ReplayChartCanvas({
  candles,
  visibleIndex,
  isScissorsActive,
  onCutAt,
  activePosition,
  symbol,
  timeframe,
  fvgs = [],
  orderBlocks = [],
  liquidityLevels = [],
  killzones = [],
  emas = [],
  indicatorSettings
}: ReplayChartCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Viewport navigation state (Pan & Zoom)
  const [candleWidth, setCandleWidth] = useState(8); // pixel width per bar
  const [scrollOffset, setScrollOffset] = useState<number | null>(null); // offset from right edge
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartOffset, setDragStartOffset] = useState(0);

  // Sliced data (0 to visibleIndex)
  const visibleCandles = candles.slice(0, visibleIndex + 1);
  const currentLastBar = visibleCandles[visibleCandles.length - 1];

  // Auto-align scroll when visibleIndex changes and user is not manually scrolled back
  useEffect(() => {
    if (scrollOffset === null || scrollOffset <= 5) {
      setScrollOffset(0);
    }
  }, [visibleIndex]);

  // Main Canvas Rendering Loop
  const renderChart = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Resize canvas for sharp high-DPI displays
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // 1. Clear background (Clean Institutional White)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    if (visibleCandles.length === 0) {
      ctx.restore();
      return;
    }

    // Layout dimensions
    const priceScaleWidth = 72;
    const timeScaleHeight = 28;
    const chartWidth = width - priceScaleWidth;
    const chartHeight = height - timeScaleHeight;
    const volumeHeight = Math.min(65, chartHeight * 0.16);
    const mainChartHeight = chartHeight - volumeHeight;

    // Calculate visible bars in viewport
    const effectiveOffset = scrollOffset ?? 0;
    const barSpacing = candleWidth + 3; // gap between bars
    const maxBarsInView = Math.ceil(chartWidth / barSpacing) + 2;

    const rightMarginBars = 4; // empty space on right for forward price projection
    const endIndex = Math.min(
      visibleCandles.length - 1,
      Math.max(0, visibleCandles.length - 1 - Math.floor(effectiveOffset / barSpacing) + rightMarginBars)
    );
    const startIndex = Math.max(0, endIndex - maxBarsInView);

    const barsInView = visibleCandles.slice(startIndex, endIndex + 1);

    // Compute Min / Max Prices in Viewport
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;

    barsInView.forEach((b) => {
      if (b.low < minPrice) minPrice = b.low;
      if (b.high > maxPrice) maxPrice = b.high;
      if (b.volume > maxVolume) maxVolume = b.volume;
    });

    // Also factor in active order SL / TP levels so they don't clip off screen
    if (activePosition) {
      minPrice = Math.min(minPrice, activePosition.entryPrice);
      maxPrice = Math.max(maxPrice, activePosition.entryPrice);
      if (activePosition.sl) {
        minPrice = Math.min(minPrice, activePosition.sl);
        maxPrice = Math.max(maxPrice, activePosition.sl);
      }
      if (activePosition.tp) {
        minPrice = Math.min(minPrice, activePosition.tp);
        maxPrice = Math.max(maxPrice, activePosition.tp);
      }
    }

    if (minPrice === Infinity || maxPrice === -Infinity) {
      minPrice = 100;
      maxPrice = 101;
    }

    // Add 8% vertical padding to top & bottom of chart
    const priceRange = maxPrice - minPrice || 1;
    const paddedMinPrice = minPrice - priceRange * 0.08;
    const paddedMaxPrice = maxPrice + priceRange * 0.08;
    const paddedPriceRange = paddedMaxPrice - paddedMinPrice;

    // Price to Y conversion function
    const getY = (price: number) => {
      return mainChartHeight - ((price - paddedMinPrice) / paddedPriceRange) * mainChartHeight;
    };

    // Y to Price conversion function
    const getPrice = (y: number) => {
      return paddedMaxPrice - (y / mainChartHeight) * paddedPriceRange;
    };

    // Index to X coordinate conversion function
    const getX = (idx: number) => {
      const offsetFromEnd = visibleCandles.length - 1 - idx;
      return chartWidth - (offsetFromEnd + rightMarginBars) * barSpacing + effectiveOffset;
    };

    // 2. Draw Horizontal Grid Lines & Price Labels
    const gridStepCount = 7;
    const priceStep = paddedPriceRange / gridStepCount;
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= gridStepCount; i++) {
      const priceVal = paddedMinPrice + i * priceStep;
      const y = getY(priceVal);

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      // Right Price Scale Label
      const decimals = symbol === 'EURUSD' ? 5 : 2;
      ctx.fillText(priceVal.toFixed(decimals), chartWidth + 6, y);
    }

    // 3. Draw Vertical Session / Time Grids & Killzones Shading
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const timeStep = Math.max(1, Math.floor(barsInView.length / 6));

    barsInView.forEach((bar, viewIdx) => {
      const actualIdx = startIndex + viewIdx;
      if (actualIdx % timeStep === 0) {
        const x = getX(actualIdx);
        ctx.beginPath();
        ctx.strokeStyle = '#f1f5f9';
        ctx.moveTo(x, 0);
        ctx.lineTo(x, chartHeight);
        ctx.stroke();

        // Bottom Time Scale Label
        ctx.fillStyle = '#64748b';
        ctx.fillText(bar.time, x, chartHeight + 8);
      }
    });

    // 4. DRAW KILLZONE BACKGROUND BANDS (Institutional Shaded Windows)
    if (killzones.length > 0) {
      killzones.forEach((kz) => {
        const xStart = getX(kz.startBarIndex) - barSpacing / 2;
        const xEnd = getX(kz.endBarIndex) + barSpacing / 2;
        const kzWidth = Math.max(2, xEnd - xStart);

        if (xEnd >= 0 && xStart <= chartWidth) {
          ctx.fillStyle = kz.color === '#2563eb' 
            ? 'rgba(37, 99, 235, 0.08)' 
            : kz.color === '#f59e0b' 
            ? 'rgba(245, 158, 11, 0.08)' 
            : 'rgba(100, 116, 139, 0.05)';
          
          ctx.fillRect(Math.max(0, xStart), 0, Math.min(chartWidth, kzWidth), mainChartHeight);

          // Killzone Header Tag
          ctx.font = 'bold 9px monospace';
          ctx.fillStyle = kz.color === '#2563eb' ? '#2563eb' : kz.color === '#f59e0b' ? '#d97706' : '#64748b';
          ctx.textAlign = 'left';
          ctx.fillText(kz.label, Math.max(6, xStart + 4), 6);
        }
      });
    }

    // 5. DRAW FAIR VALUE GAPS (FVG) OVERLAYS
    if (fvgs.length > 0) {
      fvgs.forEach((fvg) => {
        const xStart = getX(fvg.startBarIndex);
        const xEnd = getX(fvg.endBarIndex) + barSpacing / 2;
        const fvgWidth = Math.max(4, xEnd - xStart);

        const yTop = getY(Math.max(fvg.topPrice, fvg.bottomPrice));
        const yBottom = getY(Math.min(fvg.topPrice, fvg.bottomPrice));
        const fvgHeight = Math.max(2, yBottom - yTop);

        if (xEnd >= 0 && xStart <= chartWidth) {
          const isBull = fvg.type === 'BULLISH';
          const baseColor = isBull ? (indicatorSettings?.fvg.bullishColor || '#10b981') : (indicatorSettings?.fvg.bearishColor || '#f43f5e');
          const opacity = indicatorSettings?.fvg.opacity || 0.18;

          // Box Fill
          ctx.fillStyle = isBull 
            ? `rgba(16, 185, 129, ${opacity})` 
            : `rgba(244, 63, 94, ${opacity})`;
          ctx.fillRect(xStart, yTop, fvgWidth, fvgHeight);

          // 1px Border Line
          ctx.strokeStyle = baseColor;
          ctx.lineWidth = 1;
          ctx.strokeRect(xStart, yTop, fvgWidth, fvgHeight);

          // 50% Consequent Encroachment (CE) dashed line
          if (indicatorSettings?.fvg.showCE) {
            const yMid = getY(fvg.midPrice);
            ctx.strokeStyle = baseColor;
            ctx.setLineDash([2, 2]);
            ctx.beginPath();
            ctx.moveTo(xStart, yMid);
            ctx.lineTo(xEnd, yMid);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          // FVG Label Tag
          ctx.fillStyle = baseColor;
          ctx.font = 'bold 8.5px monospace';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillText(`${isBull ? '+FVG' : '-FVG'}`, xStart + 2, yTop + 2);
        }
      });
    }

    // 6. DRAW SMC ORDER BLOCKS (OB) OVERLAYS
    if (orderBlocks.length > 0) {
      orderBlocks.forEach((ob) => {
        const xStart = getX(ob.barIndex);
        const xEnd = getX(ob.endBarIndex) + barSpacing / 2;
        const obWidth = Math.max(4, xEnd - xStart);

        const yTop = getY(Math.max(ob.topPrice, ob.bottomPrice));
        const yBottom = getY(Math.min(ob.topPrice, ob.bottomPrice));
        const obHeight = Math.max(2, yBottom - yTop);

        if (xEnd >= 0 && xStart <= chartWidth) {
          const isBull = ob.type === 'BULLISH';
          const baseColor = isBull ? (indicatorSettings?.orderBlocks.bullishColor || '#3b82f6') : (indicatorSettings?.orderBlocks.bearishColor || '#f97316');
          const opacity = indicatorSettings?.orderBlocks.opacity || 0.22;

          // Box Fill
          ctx.fillStyle = isBull 
            ? `rgba(59, 130, 246, ${opacity})` 
            : `rgba(249, 115, 22, ${opacity})`;
          ctx.fillRect(xStart, yTop, obWidth, obHeight);

          // Border Line
          ctx.strokeStyle = baseColor;
          ctx.lineWidth = 1.2;
          ctx.strokeRect(xStart, yTop, obWidth, obHeight);

          // 50% Mean Threshold (MT) Midline
          if (indicatorSettings?.orderBlocks.showMeanThreshold) {
            const yMid = getY(ob.meanThreshold);
            ctx.strokeStyle = baseColor;
            ctx.setLineDash([3, 2]);
            ctx.beginPath();
            ctx.moveTo(xStart, yMid);
            ctx.lineTo(xEnd, yMid);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          // OB Label Tag
          ctx.fillStyle = baseColor;
          ctx.font = 'bold 8.5px monospace';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillText(`${isBull ? '+OB' : '-OB'}`, xStart + 2, yTop + 2);
        }
      });
    }

    // 7. DRAW LIQUIDITY LEVELS & SWEEPS (BSL / SSL)
    if (liquidityLevels.length > 0) {
      liquidityLevels.forEach((liq) => {
        const xStart = getX(liq.startBarIndex);
        const xEnd = getX(liq.endBarIndex);
        const y = getY(liq.price);

        if (xEnd >= 0 && xStart <= chartWidth) {
          ctx.strokeStyle = liq.type === 'BSL' ? '#0284c7' : '#e11d48';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 3]);
          ctx.beginPath();
          ctx.moveTo(Math.max(0, xStart), y);
          ctx.lineTo(Math.min(chartWidth, xEnd), y);
          ctx.stroke();
          ctx.setLineDash([]);

          // Liquidity Level Label
          ctx.fillStyle = liq.type === 'BSL' ? '#0284c7' : '#e11d48';
          ctx.font = '9px monospace';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'bottom';
          ctx.fillText(`${liq.name}`, Math.max(6, xStart + 4), y - 2);

          // Sweep Marker if Swept
          if (liq.isSwept && liq.sweptBarIndex !== undefined && indicatorSettings?.liquiditySweeps.showSweptLabels) {
            const sweepX = getX(liq.sweptBarIndex);
            if (sweepX >= 0 && sweepX <= chartWidth) {
              ctx.fillStyle = '#d97706';
              ctx.beginPath();
              ctx.arc(sweepX, y, 3, 0, Math.PI * 2);
              ctx.fill();

              ctx.font = 'bold 8.5px sans-serif';
              ctx.fillText('⚡ SWEPT', sweepX - 14, y - 10);
            }
          }
        }
      });
    }

    // 8. Draw Volume Histogram Sub-Panel
    const volumeBaseY = chartHeight;
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, mainChartHeight, chartWidth, volumeHeight);
    ctx.strokeStyle = '#e2e8f0';
    ctx.strokeRect(0, mainChartHeight, chartWidth, 1);

    barsInView.forEach((bar, viewIdx) => {
      const actualIdx = startIndex + viewIdx;
      const x = getX(actualIdx);
      const isUp = bar.close >= bar.open;
      const volHeight = maxVolume > 0 ? (bar.volume / maxVolume) * (volumeHeight - 8) : 0;
      const volY = volumeBaseY - volHeight;

      ctx.fillStyle = isUp ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)';
      ctx.fillRect(x - candleWidth / 2, volY, candleWidth, volHeight);
    });

    // 9. DRAW EXPONENTIAL MOVING AVERAGES (EMA 20, 50, 200)
    if (emas.length > 0) {
      emas.forEach((ema) => {
        ctx.strokeStyle = ema.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        let hasStarted = false;

        barsInView.forEach((_, viewIdx) => {
          const actualIdx = startIndex + viewIdx;
          const val = ema.values[actualIdx];
          if (val !== null && val !== undefined) {
            const x = getX(actualIdx);
            const y = getY(val);
            if (!hasStarted) {
              ctx.moveTo(x, y);
              hasStarted = true;
            } else {
              ctx.lineTo(x, y);
            }
          }
        });

        ctx.stroke();
      });
    }

    // 10. Draw Candlesticks (Wicks + Bodies)
    barsInView.forEach((bar, viewIdx) => {
      const actualIdx = startIndex + viewIdx;
      const x = getX(actualIdx);
      const isUp = bar.close >= bar.open;

      const openY = getY(bar.open);
      const closeY = getY(bar.close);
      const highY = getY(bar.high);
      const lowY = getY(bar.low);

      const color = isUp ? '#10b981' : '#f43f5e';

      // Draw Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Draw Candle Body
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(1.5, Math.abs(closeY - openY));

      ctx.fillStyle = color;
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
    });

    // 11. Draw Current Live / Visible Bar Price Line
    if (currentLastBar) {
      const currentY = getY(currentLastBar.close);
      const isUp = currentLastBar.close >= currentLastBar.open;
      const color = isUp ? '#10b981' : '#f43f5e';

      ctx.strokeStyle = color;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, currentY);
      ctx.lineTo(chartWidth, currentY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Current Price Badge on Right Scale
      ctx.fillStyle = color;
      ctx.fillRect(chartWidth, currentY - 10, priceScaleWidth, 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10.5px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const decimals = symbol === 'EURUSD' ? 5 : 2;
      ctx.fillText(currentLastBar.close.toFixed(decimals), chartWidth + 5, currentY);
    }

    // 12. Draw Active Position Overlay (Entry, SL, TP Lines & Badges)
    if (activePosition && activePosition.status === 'OPEN') {
      const entryY = getY(activePosition.entryPrice);
      const isBuy = activePosition.type === 'BUY';

      // Entry Price Line (Blue)
      ctx.strokeStyle = '#2563EB';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 3]);
      ctx.beginPath();
      ctx.moveTo(0, entryY);
      ctx.lineTo(chartWidth, entryY);
      ctx.stroke();

      // Entry Label
      ctx.fillStyle = '#1d4ed8';
      ctx.fillRect(10, entryY - 11, 140, 22);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        `${activePosition.type} ${activePosition.lots}L @ ${activePosition.entryPrice.toFixed(symbol === 'EURUSD' ? 5 : 2)}`,
        16,
        entryY
      );

      // Stop Loss Line (Red)
      if (activePosition.sl) {
        const slY = getY(activePosition.sl);
        ctx.strokeStyle = '#f43f5e';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(0, slY);
        ctx.lineTo(chartWidth, slY);
        ctx.stroke();

        ctx.fillStyle = '#be123c';
        ctx.fillRect(10, slY - 9, 100, 18);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`SL: ${activePosition.sl.toFixed(symbol === 'EURUSD' ? 5 : 2)}`, 16, slY);
      }

      // Take Profit Line (Green)
      if (activePosition.tp) {
        const tpY = getY(activePosition.tp);
        ctx.strokeStyle = '#10b981';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(0, tpY);
        ctx.lineTo(chartWidth, tpY);
        ctx.stroke();

        ctx.fillStyle = '#047857';
        ctx.fillRect(10, tpY - 9, 100, 18);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`TP: ${activePosition.tp.toFixed(symbol === 'EURUSD' ? 5 : 2)}`, 16, tpY);
      }
      ctx.setLineDash([]);
    }

    // 13. Scissors Mode Cut Line OR Normal Crosshair
    if (mousePos && mousePos.x <= chartWidth && mousePos.y <= chartHeight) {
      if (isScissorsActive && hoveredBarIndex !== null) {
        // Draw Vivid Scissors Cut Line
        const cutX = getX(hoveredBarIndex);
        ctx.strokeStyle = '#d97706'; // Amber Gold
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cutX, 0);
        ctx.lineTo(cutX, chartHeight);
        ctx.stroke();
        ctx.setLineDash([]);

        // Cut badge at cursor
        const hoveredBar = visibleCandles[hoveredBarIndex];
        if (hoveredBar) {
          ctx.fillStyle = '#b45309';
          ctx.fillRect(cutX - 60, mousePos.y - 12, 120, 24);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`✂️ Cut at ${hoveredBar.time}`, cutX, mousePos.y);
        }
      } else {
        // Standard Trading Crosshair
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);

        // Horizontal line
        ctx.beginPath();
        ctx.moveTo(0, mousePos.y);
        ctx.lineTo(chartWidth, mousePos.y);
        ctx.stroke();

        // Vertical line
        ctx.beginPath();
        ctx.moveTo(mousePos.x, 0);
        ctx.lineTo(mousePos.x, chartHeight);
        ctx.stroke();
        ctx.setLineDash([]);

        // Crosshair Price Badge
        const hoveredPrice = getPrice(mousePos.y);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(chartWidth, mousePos.y - 10, priceScaleWidth, 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(hoveredPrice.toFixed(symbol === 'EURUSD' ? 5 : 2), chartWidth + 5, mousePos.y);
      }
    }

    // 14. Outer Border Lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.strokeRect(0, 0, chartWidth, chartHeight);
    ctx.strokeRect(chartWidth, 0, priceScaleWidth, chartHeight);
    ctx.strokeRect(0, chartHeight, width, timeScaleHeight);

    ctx.restore();
  }, [
    visibleCandles,
    scrollOffset,
    candleWidth,
    symbol,
    timeframe,
    activePosition,
    mousePos,
    isScissorsActive,
    hoveredBarIndex,
    fvgs,
    orderBlocks,
    liquidityLevels,
    killzones,
    emas,
    indicatorSettings
  ]);

  // Trigger re-render on dependency change
  useEffect(() => {
    renderChart();
  }, [renderChart]);

  // Window Resize Observer
  useEffect(() => {
    const handleResize = () => renderChart();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderChart]);

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey || Math.abs(e.deltaY) > 0) {
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
      setCandleWidth((prev) => Math.min(28, Math.max(3, prev * zoomFactor)));
    }
  };

  // Mouse Down for Pan Dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isScissorsActive) return; // In scissors mode, click cuts instead of drag
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartOffset(scrollOffset ?? 0);
  };

  // Mouse Move for Crosshair & Pan
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });

    // Find closest bar index to cursor
    const priceScaleWidth = 72;
    const chartWidth = container.clientWidth - priceScaleWidth;
    const barSpacing = candleWidth + 3;
    const rightMarginBars = 4;
    const effectiveOffset = scrollOffset ?? 0;

    const offsetFromRight = chartWidth - x + effectiveOffset;
    const barIndexFromRight = Math.round(offsetFromRight / barSpacing) - rightMarginBars;
    const computedIndex = visibleCandles.length - 1 - barIndexFromRight;

    if (computedIndex >= 0 && computedIndex < visibleCandles.length) {
      setHoveredBarIndex(computedIndex);
    } else {
      setHoveredBarIndex(null);
    }

    // Handle Drag Pan
    if (isDragging) {
      const deltaX = e.clientX - dragStartX;
      setScrollOffset(Math.max(0, dragStartOffset + deltaX));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setMousePos(null);
    setHoveredBarIndex(null);
  };

  // Handle Cut Tool Click
  const handleClick = () => {
    if (isScissorsActive && hoveredBarIndex !== null) {
      onCutAt(hoveredBarIndex);
    }
  };

  // Selected or hovered bar info for top header banner
  const activeBarInfo = hoveredBarIndex !== null && visibleCandles[hoveredBarIndex]
    ? visibleCandles[hoveredBarIndex]
    : currentLastBar;

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full select-none bg-white overflow-hidden ${
        isScissorsActive ? 'cursor-crosshair' : isDragging ? 'cursor-grabbing' : 'cursor-crosshair'
      }`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Top Bar OHLCV Live HUD */}
      {activeBarInfo && (
        <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200 text-[11px] font-mono shadow-xs">
          <div className="flex items-center gap-1.5 font-bold text-gray-900">
            <span className="text-[#2563EB]">{symbol}</span>
            <span className="text-gray-300">•</span>
            <span className="text-amber-600">{timeframe}</span>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <div><span className="text-gray-400">O:</span> <span className="text-gray-700 font-semibold">{activeBarInfo.open.toFixed(symbol === 'EURUSD' ? 5 : 2)}</span></div>
            <div><span className="text-gray-400">H:</span> <span className="text-emerald-600 font-semibold">{activeBarInfo.high.toFixed(symbol === 'EURUSD' ? 5 : 2)}</span></div>
            <div><span className="text-gray-400">L:</span> <span className="text-rose-600 font-semibold">{activeBarInfo.low.toFixed(symbol === 'EURUSD' ? 5 : 2)}</span></div>
            <div><span className="text-gray-400">C:</span> <span className={activeBarInfo.close >= activeBarInfo.open ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>{activeBarInfo.close.toFixed(symbol === 'EURUSD' ? 5 : 2)}</span></div>
            <div><span className="text-gray-400">Vol:</span> <span className="text-gray-600">{activeBarInfo.volume.toLocaleString()}</span></div>
          </div>

          {activeBarInfo.session && (
            <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase ${
              activeBarInfo.session === 'london' 
                ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                : activeBarInfo.session === 'ny'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {activeBarInfo.session} session
            </span>
          )}

          {/* Active EMA HUD Indicator */}
          {emas.length > 0 && (
            <div className="hidden md:flex items-center gap-2 border-l border-gray-200 pl-2">
              {emas.map((ema) => {
                const currentVal = ema.values[visibleCandles.length - 1];
                return (
                  <div key={ema.period} className="flex items-center gap-1 text-[10px]">
                    <span style={{ color: ema.color }} className="font-bold">EMA{ema.period}:</span>
                    <span className="text-gray-700 font-semibold">{currentVal !== null ? currentVal.toFixed(symbol === 'EURUSD' ? 5 : 2) : '—'}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Scissors Active Banner */}
      {isScissorsActive && (
        <div className="absolute top-3 right-20 z-20 flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-xl text-xs font-mono backdrop-blur-md shadow-xs animate-pulse">
          <Scissors className="w-3.5 h-3.5 rotate-90 text-amber-600" />
          <span>Click any candle on chart to cut history</span>
        </div>
      )}

      {/* Canvas Element */}
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}

