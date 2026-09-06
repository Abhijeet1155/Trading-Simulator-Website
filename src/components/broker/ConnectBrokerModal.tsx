'use client';

import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  KeyRound, 
  Search, 
  Info,
  ChevronDown,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';
import { POPULAR_SERVERS, BrokerServerOption, ConnectedBrokerAccount } from '@/data/mockBrokerData';

interface ConnectBrokerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: (newAccount: ConnectedBrokerAccount) => void;
}

type HandshakeStep = 'idle' | 'resolving' | 'authenticating' | 'fetching' | 'success' | 'failed';

export default function ConnectBrokerModal({ isOpen, onClose, onConnected }: ConnectBrokerModalProps) {
  // Form Fields
  const [selectedServer, setSelectedServer] = useState<BrokerServerOption>(POPULAR_SERVERS[0]);
  const [serverSearch, setServerSearch] = useState('');
  const [isServerDropdownOpen, setIsServerDropdownOpen] = useState(false);
  const [accountNumber, setAccountNumber] = useState('8829104');
  const [investorPassword, setInvestorPassword] = useState('INV_8A9C2F');
  const [showPassword, setShowPassword] = useState(false);
  const [nickname, setNickname] = useState('100K Funded Challenge #2');
  const [accountType, setAccountType] = useState<'Live' | 'Demo' | 'Prop Firm'>('Prop Firm');
  const [leverage, setLeverage] = useState<number>(100);

  // Validation / Handshake Simulation state
  const [handshakeStep, setHandshakeStep] = useState<HandshakeStep>('idle');
  const [statusText, setStatusText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const filteredServers = POPULAR_SERVERS.filter(
    s => s.name.toLowerCase().includes(serverSearch.toLowerCase()) || 
         s.broker.toLowerCase().includes(serverSearch.toLowerCase())
  );

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!accountNumber.trim()) {
      setErrorMessage('Please provide a valid MT5 Account Number / Login ID.');
      return;
    }
    if (!investorPassword.trim()) {
      setErrorMessage('Investor read-only password is required.');
      return;
    }

    // Step 1: Resolving Server
    setHandshakeStep('resolving');
    setStatusText(`Connecting to broker gateway: ${selectedServer.name}...`);

    await new Promise(r => setTimeout(r, 1000));

    // Step 2: Authenticating with read-only investor key
    setHandshakeStep('authenticating');
    setStatusText('Validating 256-bit encrypted Investor Key (Read-Only)...');

    await new Promise(r => setTimeout(r, 1200));

    // Step 3: Fetching historical fills and live balance
    setHandshakeStep('fetching');
    setStatusText('Syncing open positions & historical fills...');

    await new Promise(r => setTimeout(r, 1100));

    // Step 4: Success
    setHandshakeStep('success');
    setStatusText('Connection Established! Initializing Live Webhook Stream.');

    const newAcc: ConnectedBrokerAccount = {
      id: `mt5-acc-${accountNumber}`,
      brokerName: selectedServer.broker,
      server: selectedServer.name,
      accountNumber: accountNumber.trim(),
      nickname: nickname.trim() || `${selectedServer.broker} #${accountNumber}`,
      accountType: accountType,
      platform: 'MT5',
      balance: 100000.00,
      equity: 100420.50,
      margin: 950.00,
      freeMargin: 99470.50,
      marginLevel: 10570.5,
      currency: 'USD',
      leverage: leverage,
      status: 'connected',
      lastSyncedAt: 'Just now',
      autoSyncInterval: '15m',
      totalSyncedTrades: 12,
      winRate: 66.7,
      netProfit: 420.50,
    };

    setTimeout(() => {
      onConnected(newAcc);
      setHandshakeStep('idle');
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in select-none">
      <div className="bg-[#111726] border border-gray-800 rounded-3xl w-full max-w-xl flex flex-col shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden font-sans text-white max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/90 bg-[#0b0f17]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                Connect MetaTrader 5 Account
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  MT5 Bridge
                </span>
              </h3>
              <p className="text-[11px] text-gray-400">Connect via 100% read-only investor credentials for zero risk sync</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={handshakeStep !== 'idle'}
            className="p-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          
          {/* Institutional Security Notice Callout */}
          <div className="p-3.5 rounded-2xl bg-[#0b0f17] border border-cyan-500/20 flex items-start gap-3 shadow-inner">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 mt-0.5 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <span className="font-bold text-cyan-300 text-xs block">Bank-Grade 256-Bit Read-Only Sync</span>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                We only require your <strong className="text-gray-200">Investor Password</strong>. The PaperPulse MetaTrader Bridge has <strong>ZERO trading or withdrawal permissions</strong>. Your capital cannot be touched or placed at risk.
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleConnect} className="space-y-4">
            
            {/* Broker & Server Selection Combobox */}
            <div className="space-y-1.5 relative">
              <label className="text-[11px] font-semibold text-gray-300 flex items-center justify-between">
                <span>Broker & Server Host</span>
                <span className="text-[10px] text-gray-500 font-mono">Select or search server</span>
              </label>

              <button
                type="button"
                onClick={() => setIsServerDropdownOpen(!isServerDropdownOpen)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#0b0f17] border border-gray-800 hover:border-gray-700 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: selectedServer.logoColor }}
                  />
                  <div>
                    <span className="font-bold text-gray-200 block text-xs">{selectedServer.name}</span>
                    <span className="text-[10px] text-gray-400">{selectedServer.broker} • {selectedServer.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    {selectedServer.pingMs}ms
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </button>

              {/* Dropdown Menu */}
              {isServerDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0b0f17] border border-gray-700 rounded-2xl shadow-2xl p-2 z-20 space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search broker server (e.g., FTMO, Exness, IC)..."
                      value={serverSearch}
                      onChange={(e) => setServerSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-[#111726] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                    {filteredServers.map((server) => (
                      <button
                        key={server.id}
                        type="button"
                        onClick={() => {
                          setSelectedServer(server);
                          setIsServerDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                          selectedServer.id === server.id 
                            ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300' 
                            : 'hover:bg-gray-800/60 text-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: server.logoColor }} />
                          <span className="font-semibold text-xs">{server.name}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">{server.pingMs}ms</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Account ID and Account Type */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-300">Account Number / Login ID</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g., 8829104"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0b0f17] border border-gray-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-300">Account Type</label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-[#0b0f17] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="Prop Firm">Prop Firm (Evaluation / Funded)</option>
                  <option value="Live">Live Broker Account</option>
                  <option value="Demo">Demo Simulator</option>
                </select>
              </div>
            </div>

            {/* Investor Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-gray-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Investor Password (Read-Only)</span>
                </label>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">
                  Zero Execution Risk
                </span>
              </div>
              
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter investor read-only password"
                  value={investorPassword}
                  onChange={(e) => setInvestorPassword(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 bg-[#0b0f17] border border-gray-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Account Nickname & Leverage */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-300">Account Nickname (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 100k Phase 1"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#0b0f17] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-300">Account Leverage</label>
                <select
                  value={leverage}
                  onChange={(e) => setLeverage(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-[#0b0f17] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer font-mono"
                >
                  <option value={30}>1:30 (Strict Prop)</option>
                  <option value={50}>1:50 (Standard)</option>
                  <option value={100}>1:100 (Default)</option>
                  <option value={200}>1:200 (Aggressive)</option>
                  <option value={500}>1:500 (High Leverage)</option>
                </select>
              </div>
            </div>

            {/* Handshake Progress Indicator Box (When connecting) */}
            {handshakeStep !== 'idle' && (
              <div className="p-4 rounded-2xl bg-[#070a10] border border-cyan-500/30 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-semibold text-cyan-300">
                    {handshakeStep === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    )}
                    <span>{statusText}</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">
                    {handshakeStep === 'resolving' && 'Step 1/3'}
                    {handshakeStep === 'authenticating' && 'Step 2/3'}
                    {handshakeStep === 'fetching' && 'Step 3/3'}
                    {handshakeStep === 'success' && 'Ready'}
                  </span>
                </div>

                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-linear-to-r from-cyan-500 to-blue-600 h-full transition-all duration-500 ease-out"
                    style={{
                      width: 
                        handshakeStep === 'resolving' ? '33%' :
                        handshakeStep === 'authenticating' ? '66%' :
                        handshakeStep === 'fetching' ? '90%' : '100%'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-800/80">
              <button
                type="button"
                onClick={onClose}
                disabled={handshakeStep !== 'idle'}
                className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer text-xs font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={handshakeStep !== 'idle'}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold transition-all cursor-pointer text-xs shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50"
              >
                {handshakeStep === 'idle' ? (
                  <>
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Authorize & Link MT5</span>
                  </>
                ) : (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting Bridge...</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}
