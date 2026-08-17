'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  TrendingUp, 
  Menu, 
  X, 
  RotateCcw, 
  Plus, 
  Wallet, 
  ShieldAlert, 
  Pencil,
  ArrowDownCircle,
  Sliders,
  Check,
  HelpCircle
} from 'lucide-react';
import UserDropdown from '@/app/dashboard/UserDropdown';

export default function Navbar({ userName, onAccountSwitch }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [accountData, setAccountData] = useState(null);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newAccountPreset, setNewAccountPreset] = useState(10000);
  const [customAmount, setCustomAmount] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

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

  const accountDropdownRef = useRef(null);

  async function fetchAccountDetails() {
    try {
      const res = await fetch('/api/user/account');
      if (res.ok) {
        const data = await res.json();
        setAccountData(data);
      }
    } catch (err) {
      console.error('Failed to fetch account info in navbar:', err);
    }
  }

  useEffect(() => {
    fetchAccountDetails();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
        setIsAccountDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchAccount = async (walletId) => {
    try {
      const res = await fetch('/api/user/account/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletId })
      });
      if (res.ok) {
        if (onAccountSwitch) {
          onAccountSwitch(walletId);
          fetchAccountDetails();
        } else {
          window.location.reload();
        }
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to switch account.');
      }
    } catch (err) {
      console.error('Error switching account:', err);
      alert('Failed to switch account.');
    }
  };

  const submitRenameAccount = async (e) => {
    e.preventDefault();
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
        fetchAccountDetails();
      } else {
        const data = await res.json();
        setRenameError(data.error || 'Failed to rename account.');
      }
    } catch (err) {
      console.error('Error renaming account:', err);
      setRenameError('Failed to rename account.');
    }
  };

  const handleResetBalance = async () => {
    const confirmed = window.confirm(
      "This will reset your balance to $10,000 and clear all open positions for this demo account. Continue?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch('/api/settings/reset', { method: 'POST' });
      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to reset balance.');
      }
    } catch (err) {
      console.error('Error resetting balance:', err);
      alert('Failed to reset balance.');
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

  const handleCreateAccountSubmit = async (e) => {
    e.preventDefault();
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

  const links = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Trade', href: '/trade' },
    { label: 'History', href: '/history' },
    { label: 'Leaderboard', href: '/leaderboard' },
    { label: 'Competitions', href: '/competitions' },
  ];

  return (
    <>
      <header className="border-b border-[#E0E3EB] bg-white sticky top-0 z-50 h-12 flex items-center shrink-0 select-none">
        <div className="w-full px-4 flex items-center justify-between">
          
          {/* Left Brand + Left-Aligned Navigation Links */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center shadow-sm">
                <TrendingUp className="text-white w-4 h-4" />
              </div>
              <span className="font-semibold text-base text-[#111111]">PaperPulse</span>
            </Link>
            
            <div className="h-5 w-[1px] bg-gray-200 hidden md:block" />

            <nav className="hidden md:flex items-center gap-5">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-xs font-semibold transition-colors capitalize ${
                      isActive ? 'text-[#2563EB]' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Icon Actions Bar */}
          <div className="flex items-center gap-2">
            
            {/* Wallet / Account Popover Menu Icon */}
            <div className="relative" ref={accountDropdownRef}>
              <button 
                onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                className={`p-1.5 rounded-md border transition-all cursor-pointer select-none flex items-center justify-center ${
                  isAccountDropdownOpen 
                    ? 'bg-[#2563EB]/10 border-[#2563EB]/30 text-[#2563EB]' 
                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900'
                }`}
                title="Account & Balance Menu"
              >
                <Wallet className="w-4 h-4" />
              </button>

              {isAccountDropdownOpen && accountData && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] p-4 z-[100] animate-in fade-in slide-in-from-top-2 duration-200 select-none">
                  
                  {/* Account Balance Summary */}
                  <div className="bg-gray-50 border border-gray-200/80 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                      <span className="font-semibold">{accountData.accountName || `Demo Account`} #{accountData.accountNumber}</span>
                      <span className="text-[10px] bg-[#2563EB]/10 text-[#2563EB] font-semibold px-2 py-0.5 rounded-full">Active</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900 font-mono">
                      ${accountData.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  {/* Quick Action Grid */}
                  <div className="grid grid-cols-3 gap-1.5 mb-3">
                    <button
                      onClick={() => {
                        setIsAccountDropdownOpen(false);
                        alert('Deposit feature coming soon!');
                      }}
                      className="flex flex-col items-center justify-center p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors cursor-pointer text-gray-700"
                    >
                      <ArrowDownCircle className="w-4 h-4 text-[#2563EB] mb-1" />
                      <span className="text-[10px] font-semibold">Deposit</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setIsAccountDropdownOpen(false);
                        const currentBal = accountData.balance || 10000;
                        if ([1000, 5000, 10000, 25000, 50000, 100000].includes(currentBal)) {
                          setSelectedAdjustPreset(currentBal);
                          setCustomAdjustAmount('');
                        } else {
                          setSelectedAdjustPreset(0);
                          setCustomAdjustAmount(String(currentBal));
                        }
                        setAdjustError('');
                        setIsBalanceSettingsOpen(true);
                      }}
                      className="flex flex-col items-center justify-center p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors cursor-pointer text-gray-700"
                    >
                      <Sliders className="w-4 h-4 text-[#2563EB] mb-1" />
                      <span className="text-[10px] font-semibold">Adjust</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsAccountDropdownOpen(false);
                        handleResetBalance();
                      }}
                      className="flex flex-col items-center justify-center p-2 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-lg transition-colors cursor-pointer text-gray-700 hover:text-[#DC2626]"
                    >
                      <RotateCcw className="w-4 h-4 text-[#DC2626] mb-1" />
                      <span className="text-[10px] font-semibold">Reset</span>
                    </button>
                  </div>

                  {/* Account Switcher Header */}
                  <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-gray-100">
                    <span className="text-[10px] font-semibold text-gray-400 capitalize">Trading Accounts</span>
                    <span className="text-[10px] font-semibold text-gray-500">{accountData.accounts?.length} / {accountData.maxLimit}</span>
                  </div>

                  {/* Accounts List */}
                  <div className="space-y-1 mb-3 max-h-36 overflow-y-auto pr-1">
                    {accountData.accounts?.map((acc) => (
                      <div
                        key={acc.id}
                        onClick={() => !acc.isActive && handleSwitchAccount(acc.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-left transition-all ${
                          acc.isActive
                            ? 'bg-[#2563EB]/5 border-[#2563EB]/25 text-[#2563EB]'
                            : 'hover:bg-gray-50 border-transparent text-gray-700 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {acc.isActive ? (
                            <Check className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                          ) : (
                            <div className="w-3.5 h-3.5 shrink-0" />
                          )}
                          <div className="flex flex-col">
                            <span className="text-[11px] font-semibold font-mono">
                              {acc.accountName ? `${acc.accountName} — ` : ''}Demo #{acc.accountNumber}
                            </span>
                            <span className={`text-[10px] font-semibold font-mono ${acc.isActive ? 'text-[#2563EB]/80' : 'text-gray-500'}`}>
                              ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsAccountDropdownOpen(false);
                            setRenamingWalletId(acc.id);
                            setRenameValue(acc.accountName || "");
                            setRenameError('');
                            setIsRenameModalOpen(true);
                          }}
                          className="p-1 hover:bg-gray-200/50 rounded text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                          title="Rename Account"
                        >
                          <Pencil className="w-3 h-3 pointer-events-none" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* New Account Action Button */}
                  <div className="pt-2 border-t border-gray-100">
                    {!accountData.limitReached ? (
                      <button
                        onClick={() => {
                          setIsAccountDropdownOpen(false);
                          setIsCreateModalOpen(true);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-[#2563EB]/10 hover:bg-[#2563EB]/15 border border-[#2563EB]/20 rounded-lg text-[11px] font-semibold text-[#2563EB] transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        New Demo Account
                      </button>
                    ) : (
                      <div className="text-[9px] font-semibold text-amber-600 bg-amber-50 border border-amber-200/50 rounded-lg p-1.5 text-center">
                        Account limit reached ({accountData.maxLimit})
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

            {/* User Profile dropdown */}
            <UserDropdown userName={userName} />
            
            <button 
              title="Support" 
              onClick={() => alert('Live support chat coming soon!')} 
              className="p-1.5 text-gray-400 hover:text-gray-900 rounded-md hover:bg-gray-100 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Mobile hamburger menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-[#E0E3EB] bg-white px-6 py-4 flex flex-col gap-4 shadow-lg z-50 fixed left-0 right-0 top-12 select-none">
          <nav className="flex flex-col gap-3">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                    isActive ? 'bg-[#2563EB]/10 text-[#2563EB]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Modal for creating a new demo account */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 max-w-md w-full shadow-2xl select-none animate-in scale-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[#111111] flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#2563EB]" />
                New Practice Account
              </h2>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreateAccountSubmit} className="space-y-4">
              {createError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  {createError}
                </div>
              )}

              {/* Account Name */}
              <div>
                <label className="block text-xs font-semibold text-[#4B5563] capitalize mb-1.5">
                  Account Label / Name <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Scalping Strategy, Forex Demo"
                  maxLength={30}
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-[#E0E3EB] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#2563EB] transition-colors"
                />
              </div>

              {/* Starting Balance Preset Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#4B5563] capitalize mb-2">
                  Starting Balance
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1000, 5000, 10000, 25000, 50000, 100000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setNewAccountPreset(amt);
                        setCustomAmount('');
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold font-mono transition-all cursor-pointer ${
                        newAccountPreset === amt && !customAmount
                          ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                          : 'bg-[#FAFAFA] text-gray-700 border-[#E0E3EB] hover:border-gray-300'
                      }`}
                    >
                      ${amt >= 1000 ? `${amt / 1000}k` : amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Starting Amount */}
              <div>
                <label className="block text-xs font-semibold text-[#4B5563] capitalize mb-1.5">
                  Or Custom Amount ($100 - $1,000,000)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">$</span>
                  <input
                    type="number"
                    min="100"
                    max="1000000"
                    placeholder="Enter custom starting balance"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setNewAccountPreset(0);
                    }}
                    className="w-full bg-[#FAFAFA] border border-[#E0E3EB] rounded-xl pl-7 pr-3.5 py-2.5 text-xs font-semibold font-mono text-gray-900 focus:outline-none focus:border-[#2563EB] transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2.5 border border-[#E0E3EB] rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer capitalize"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer capitalize disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for adjusting account balance */}
      {isBalanceSettingsOpen && (
        <div className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 max-w-md w-full shadow-2xl select-none animate-in scale-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[#111111] flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#2563EB]" />
                Adjust Practice Balance
              </h2>
              <button 
                onClick={() => setIsBalanceSettingsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAdjustBalanceSubmit} className="space-y-4">
              {adjustError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  {adjustError}
                </div>
              )}

              {/* Preset selector */}
              <div>
                <label className="block text-xs font-semibold text-[#4B5563] capitalize mb-2">
                  Select New Balance
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1000, 5000, 10000, 25000, 50000, 100000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAdjustPreset(amt);
                        setCustomAdjustAmount('');
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold font-mono transition-all cursor-pointer ${
                        selectedAdjustPreset === amt && !customAdjustAmount
                          ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                          : 'bg-[#FAFAFA] text-gray-700 border-[#E0E3EB] hover:border-gray-300'
                      }`}
                    >
                      ${amt >= 1000 ? `${amt / 1000}k` : amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom amount */}
              <div>
                <label className="block text-xs font-semibold text-[#4B5563] capitalize mb-1.5">
                  Or Custom Amount ($100 - $1,000,000)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">$</span>
                  <input
                    type="number"
                    min="100"
                    max="1000000"
                    placeholder="Enter custom balance"
                    value={customAdjustAmount}
                    onChange={(e) => {
                      setCustomAdjustAmount(e.target.value);
                      setSelectedAdjustPreset(0);
                    }}
                    className="w-full bg-[#FAFAFA] border border-[#E0E3EB] rounded-xl pl-7 pr-3.5 py-2.5 text-xs font-semibold font-mono text-gray-900 focus:outline-none focus:border-[#2563EB] transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsBalanceSettingsOpen(false)}
                  className="flex-1 py-2.5 border border-[#E0E3EB] rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer capitalize"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="flex-1 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer capitalize disabled:opacity-50"
                >
                  {adjusting ? 'Saving...' : 'Update Balance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for renaming account */}
      {isRenameModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 max-w-md w-full shadow-2xl select-none animate-in scale-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[#111111] flex items-center gap-2">
                <Pencil className="w-5 h-5 text-[#2563EB]" />
                Rename Practice Account
              </h2>
              <button 
                onClick={() => setIsRenameModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={submitRenameAccount} className="space-y-4">
              {renameError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  {renameError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#4B5563] capitalize mb-1.5">
                  Account Name / Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. Forex Practice Account"
                  maxLength={30}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-[#E0E3EB] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#2563EB] transition-colors"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsRenameModalOpen(false)}
                  className="flex-1 py-2.5 border border-[#E0E3EB] rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer capitalize"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer capitalize"
                >
                  Save Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
