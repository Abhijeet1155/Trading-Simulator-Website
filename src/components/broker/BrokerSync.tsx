'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ConnectBrokerModal from '@/components/broker/ConnectBrokerModal';
import SyncHistoryTable from '@/components/broker/SyncHistoryTable';
import { 
  ConnectedBrokerAccount, 
  SyncedTradeFill, 
  INITIAL_CONNECTED_ACCOUNT, 
  INITIAL_SYNCED_TRADES,
  generateRandomTrade 
} from '@/data/mockBrokerData';
import { 
  RefreshCw, 
  Plus, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Clock, 
  AlertTriangle, 
  Power, 
  Zap, 
  Radio, 
  Server, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Lock,
  ArrowUpRight,
  Database,
  Cpu
} from 'lucide-react';
import Link from 'next/link';

interface BrokerSyncProps {
  userName?: string;
  userId?: string;
}

export default function BrokerSync({ userName = 'Trader', userId }: BrokerSyncProps) {
  // State
  const [account, setAccount] = useState<ConnectedBrokerAccount | null>(INITIAL_CONNECTED_ACCOUNT);
  const [trades, setTrades] = useState<SyncedTradeFill[]>(INITIAL_SYNCED_TRADES);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessToast, setSyncSuccessToast] = useState<string | null>(null);
  const [autoSyncSetting, setAutoSyncSetting] = useState<'15m' | '1h' | 'realtime' | 'off'>('15m');
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  // Trigger manual sync
  const handleManualSync = async () => {
    if (!account || isSyncing) return;
    setIsSyncing(true);

    // Simulate 1.5s network round-trip with MT5 bridge
    await new Promise(r => setTimeout(r, 1500));

    // Simulate newly closed fill fetched from MT5
    const existingTickets = trades.map(t => t.ticket);
    const newTrade = generateRandomTrade(existingTickets);
    
    setTrades(prev => [newTrade, ...prev]);
    setAccount(prev => {
      if (!prev) return null;
      const updatedBalance = +(prev.balance + newTrade.pnl).toFixed(2);
      const updatedEquity = +(prev.equity + newTrade.pnl).toFixed(2);
      const updatedProfit = +(prev.netProfit + newTrade.pnl).toFixed(2);
      return {
        ...prev,
        balance: updatedBalance,
        equity: updatedEquity,
        netProfit: updatedProfit,
        lastSyncedAt: 'Just now',
        totalSyncedTrades: prev.totalSyncedTrades + 1
      };
    });

    setIsSyncing(false);
    setSyncSuccessToast(`Synced 1 new execution (${newTrade.symbol} ${newTrade.type} ${newTrade.pnl >= 0 ? '+' : ''}$${newTrade.pnl.toFixed(2)})`);
    setTimeout(() => setSyncSuccessToast(null), 4000);
  };

  // Disconnect account confirmation
  const handleConfirmDisconnect = () => {
    setAccount(null);
    setShowDisconnectModal(false);
    setSyncSuccessToast('MetaTrader 5 Account disconnected safely.');
    setTimeout(() => setSyncSuccessToast(null), 3000);
  };

  // Connected from modal
  const handleAccountConnected = (newAcc: ConnectedBrokerAccount) => {
    setAccount(newAcc);
    setSyncSuccessToast(`Successfully linked ${newAcc.brokerName} #${newAcc.accountNumber}!`);
    setTimeout(() => setSyncSuccessToast(null), 4000);
  };

  // Send to Journal action
  const handleSendToJournal = (trade: SyncedTradeFill) => {
    setTrades(prev => prev.map(t => t.ticket === trade.ticket ? { ...t, journalStatus: 'Sent' } : t));
    setSyncSuccessToast(`Trade ${trade.ticket} logged to Trading Journal with ICT/SMC tags.`);
    setTimeout(() => setSyncSuccessToast(null), 3500);
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-white flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar userName={userName} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
        
        {/* Toast Notification */}
        {syncSuccessToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#111726] border border-cyan-500/40 text-cyan-300 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 text-xs">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-medium">{syncSuccessToast}</span>
          </div>
        )}

        {/* Top Header & Quick Action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                Institutional Bridge
              </span>
              <span className="text-gray-500 text-xs">•</span>
              <span className="text-gray-400 text-xs flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Read-Only Investor Security
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
              Broker Sync & MT5 Gateway
            </h1>
            <p className="text-xs md:text-sm text-gray-400 mt-1 max-w-2xl">
              Connect external MT5 accounts to auto-import historical and live closed trades into your Journal and Analytics suites.
            </p>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-3">
            {account ? (
              <>
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing MT5...' : 'Sync Now'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowDisconnectModal(true)}
                  className="p-2 rounded-xl bg-gray-900/80 border border-gray-800 text-gray-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors cursor-pointer"
                  title="Disconnect MT5 Account"
                >
                  <Power className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsConnectModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Connect MT5 Account</span>
              </button>
            )}
          </div>
        </div>

        {/* 1. CONNECTION STATUS BANNER */}
        <div className="bg-[#111726] border border-gray-800 rounded-3xl p-4 md:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                account 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-gray-800/50 border-gray-700 text-gray-500'
              }`}>
                {account ? <Radio className="w-6 h-6 animate-pulse" /> : <Server className="w-6 h-6" />}
              </div>
              {account && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#111726] rounded-full" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-bold text-base text-white">
                  {account ? `${account.brokerName} (${account.server})` : 'No Broker Account Connected'}
                </h2>
                {account && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Live Heartbeat
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {account ? (
                  <span>Connected • Last successful sync: <strong className="text-gray-200 font-mono">{account.lastSyncedAt}</strong></span>
                ) : (
                  <span>Link your MetaTrader 5 account via read-only investor key to stream trade executions.</span>
                )}
              </p>
            </div>
          </div>

          {/* Auto-Sync Configuration Dropdown */}
          {account && (
            <div className="flex items-center gap-3 bg-[#0b0f17] p-1.5 rounded-2xl border border-gray-800 self-start md:self-auto">
              <div className="flex items-center gap-1.5 px-2 text-xs text-gray-400 font-medium">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Auto-Sync:</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                {(['15m', '1h', 'realtime', 'off'] as const).map((interval) => (
                  <button
                    key={interval}
                    type="button"
                    onClick={() => {
                      setAutoSyncSetting(interval);
                      setSyncSuccessToast(`Auto-sync interval set to ${interval.toUpperCase()}`);
                      setTimeout(() => setSyncSuccessToast(null), 2500);
                    }}
                    className={`px-2.5 py-1 rounded-xl font-mono text-[11px] transition-all cursor-pointer ${
                      autoSyncSetting === interval
                        ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {interval === 'realtime' ? 'Webhook' : interval.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. ACCOUNT OVERVIEW & METRICS (If connected) */}
        {account ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Card 1: Balance & Equity */}
            <div className="bg-[#111726] border border-gray-800 rounded-3xl p-5 shadow-xl relative overflow-hidden space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="font-semibold capitalize text-[10px]">Balance / Equity</span>
                <DollarSign className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-white font-mono">
                  ${account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                  <span>Equity: ${account.equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-500 font-mono">
                <span>Free Margin</span>
                <span className="text-gray-300">${account.freeMargin.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Card 2: Account Specifications */}
            <div className="bg-[#111726] border border-gray-800 rounded-3xl p-5 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="font-semibold capitalize text-[10px]">Account Profile</span>
                <Cpu className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <div className="text-base font-bold text-white truncate" title={account.nickname}>
                  {account.nickname}
                </div>
                <div className="text-xs text-gray-400 font-mono mt-0.5">
                  Login ID: #{account.accountNumber}
                </div>
              </div>
              <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-[11px] font-mono">
                <span className="text-gray-500">Tier / Lev</span>
                <span className="text-cyan-300 font-bold">{account.accountType} • 1:{account.leverage}</span>
              </div>
            </div>

            {/* Card 3: Net Synced Profit */}
            <div className="bg-[#111726] border border-gray-800 rounded-3xl p-5 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="font-semibold capitalize text-[10px]">Bridge Net PnL</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className={`text-2xl font-extrabold font-mono ${account.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {account.netProfit >= 0 ? '+' : ''}${account.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-gray-400 font-mono mt-0.5">
                  Win Rate: <strong className="text-white">{account.winRate}%</strong>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-500 font-mono">
                <span>Total Fills</span>
                <span className="text-gray-300">{account.totalSyncedTrades} Trades</span>
              </div>
            </div>

            {/* Card 4: Navigation Quick Links */}
            <div className="bg-[#111726] border border-gray-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
              <div className="space-y-1">
                <span className="font-semibold capitalize text-[10px] text-gray-400 block">Ecosystem Integrations</span>
                <p className="text-xs text-gray-400">Jump directly to your synced analytics or journal view.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/journal"
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-semibold text-gray-200 transition-colors"
                >
                  <span>Journal</span>
                  <ArrowUpRight className="w-3 h-3 text-cyan-400" />
                </Link>
                <Link
                  href="/analytics"
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-semibold text-gray-200 transition-colors"
                >
                  <span>Analytics</span>
                  <ArrowUpRight className="w-3 h-3 text-cyan-400" />
                </Link>
              </div>
            </div>

          </div>
        ) : (
          /* Empty State Promo Banner */
          <div className="bg-linear-to-b from-[#111726] to-[#0b0f17] border border-gray-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
              <Database className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="font-extrabold text-lg text-white">No Broker Connected Yet</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Connect your MetaTrader 5 account from brokers like FTMO, Exness, IC Markets, or Pepperstone to automatically pull in trade logs with 0 manual typing.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsConnectModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Connect MetaTrader 5</span>
            </button>
          </div>
        )}

        {/* 3. AUTO-IMPORTED TRADES LOG */}
        <SyncHistoryTable 
          trades={trades} 
          onSendToJournal={handleSendToJournal} 
        />

      </main>

      {/* Connect MT5 Account Modal */}
      <ConnectBrokerModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnected={handleAccountConnected}
      />

      {/* Safety Disconnect Confirmation Modal */}
      {showDisconnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in select-none">
          <div className="bg-[#111726] border border-gray-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Disconnect Broker Account?</h3>
                <p className="text-xs text-gray-400">Auto-sync webhook stream will be terminated.</p>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed bg-[#0b0f17] p-3.5 rounded-2xl border border-gray-800">
              Your previously imported journal notes and saved trade statistics will remain intact, but future trades executed on MT5 will no longer sync automatically.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDisconnectModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white transition-colors cursor-pointer text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDisconnect}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all cursor-pointer text-xs shadow-md shadow-rose-600/20"
              >
                Confirm Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
