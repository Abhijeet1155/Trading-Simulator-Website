'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, User, Wallet, Award, Settings, 
  Lock, AlertTriangle, ShieldAlert, CheckCircle2, 
  HelpCircle, Eye, EyeOff, Info, ArrowRight, ArrowLeft, Loader2, Pencil,
  Sun, Moon, Laptop, Palette, Check
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useTheme } from '@/context/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';
import { getAccountNumber } from '@/lib/account';

export default function SettingsClientPage({
  userId,
  initialName,
  initialEmail,
  initialCreatedAt,
  initialPlanType,
  initialBalance,
  initialConfiguredBalance = 10000.00,
  accountNumber,
  accountName,
  initialWallets = [],
  initialThemePreference = 'light'
}) {
  const { theme, resolvedTheme, setTheme, isDark } = useTheme();
  const [name, setName] = useState(initialName);
  const [balance, setBalance] = useState(initialBalance);
  
  // Settings preferences
  const [defaultOrderType, setDefaultOrderType] = useState('Market');
  const [showTpsl, setShowTpsl] = useState(false);

  // States for actions
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [resettingBalance, setResettingBalance] = useState(false);
  
  // Modal states
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Multiple accounts state
  const [wallets, setWallets] = useState(initialWallets);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renamingWalletId, setRenamingWalletId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameError, setRenameError] = useState('');
  const [renaming, setRenaming] = useState(false);

  // Switch and rename handlers
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
        showToast('Failed to switch account.', 'info');
      }
    } catch (err) {
      console.error('Error switching account:', err);
      showToast('Failed to switch account.', 'info');
    }
  };

  const handleRenameClick = (walletId, currentName) => {
    setRenamingWalletId(walletId);
    setRenameValue(currentName || '');
    setRenameError('');
    setIsRenameModalOpen(true);
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

    setRenaming(true);
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
      setRenameError('Failed to rename account due to a network error.');
    } finally {
      setRenaming(false);
    }
  };

  // Toast notifications
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast({ visible: false, message: '', type: 'success' });
    }, 4500);
  };

  // Format creation date deterministically to prevent hydration mismatch
  const getFormattedDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return `${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch (e) {
      return 'July 2026';
    }
  };

  // 1. Save Profile Changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty.', 'info');
      return;
    }
    setUpdatingProfile(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Profile updated', 'success');
      } else {
        showToast(data.error || 'Failed to update profile.', 'info');
      }
    } catch (err) {
      console.error(err);
      showToast('Error updating profile settings.', 'info');
    } finally {
      setUpdatingProfile(false);
    }
  };

  // 2. Reset Virtual Balance
  const handleResetBalance = async () => {
    setResettingBalance(true);
    setShowResetModal(false);
    try {
      const res = await fetch('/api/settings/reset', {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        setBalance(data.newBalance);
        showToast(`Virtual balance reset to $${data.newBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'success');
      } else {
        showToast(data.error || 'Failed to reset balance.', 'info');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to reset account balance.', 'info');
    } finally {
      setResettingBalance(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#121212] flex flex-col justify-between font-sans text-gray-800 dark:text-neutral-200 transition-colors duration-200">
      {/* Toast Alert */}
      {toast.visible && (
        <div className="fixed top-20 right-6 z-[200] animate-fade-in">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200/80 dark:border-neutral-700 shadow-[0_4px_12px_rgba(0,0,0,0.1)] bg-white dark:bg-[#1E1E1E] text-gray-800 dark:text-neutral-100">
            {toast.type === 'info' ? (
              <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-[#089981] shrink-0" />
            )}
            <span className="text-xs font-semibold">{toast.message}</span>
          </div>
        </div>
      )}

      <Navbar userName={name} />

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-6 py-10 flex-grow w-full">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-neutral-400 hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#111111] dark:text-white">
            Settings
          </h1>
          <p className="text-sm text-[#6B7280] dark:text-neutral-400 mt-1.5 font-medium">
            Manage your account, appearance theme, and trading preferences
          </p>
        </div>

        <div className="space-y-6">

          {/* 1. APPEARANCE & THEME CARD */}
          <div className="bg-white dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-colors duration-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-neutral-800">
              <h2 className="text-sm font-semibold text-[#111111] dark:text-white capitalize flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#2563EB] dark:text-blue-400" /> Appearance & Theme
              </h2>
              <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400">
                {theme === 'system' ? 'System Theme' : isDark ? 'Dark Theme' : 'Light Theme'}
              </span>
            </div>

            <p className="text-xs text-gray-500 dark:text-neutral-400 mb-5 leading-relaxed">
              Customize how PaperPulse looks on your device. Changes take effect across the entire website immediately and are saved to your account.
            </p>

            {/* Visual Theme Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {/* Light Mode Card */}
              <button
                type="button"
                onClick={() => {
                  setTheme('light');
                  showToast('Theme set to Light Mode', 'success');
                }}
                className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all cursor-pointer text-left relative ${
                  theme === 'light'
                    ? 'border-[#2563EB] bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-[#2563EB]/20 shadow-sm'
                    : 'border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700 bg-white dark:bg-[#1E1E1E]'
                }`}
              >
                {theme === 'light' && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                  <Sun className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">Light Mode</span>
                <span className="text-[11px] text-gray-500 dark:text-neutral-400">Crisp white institutional palette</span>
              </button>

              {/* Dark Mode Card */}
              <button
                type="button"
                onClick={() => {
                  setTheme('dark');
                  showToast('Theme set to Dark Mode', 'success');
                }}
                className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all cursor-pointer text-left relative ${
                  theme === 'dark'
                    ? 'border-[#2563EB] bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-[#2563EB]/20 shadow-sm'
                    : 'border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700 bg-white dark:bg-[#1E1E1E]'
                }`}
              >
                {theme === 'dark' && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
                <div className="w-8 h-8 rounded-lg bg-indigo-950 text-blue-400 flex items-center justify-center mb-3">
                  <Moon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">Dark Mode</span>
                <span className="text-[11px] text-gray-500 dark:text-neutral-400">High contrast Bloomberg dark</span>
              </button>

              {/* System Preference Card */}
              <button
                type="button"
                onClick={() => {
                  setTheme('system');
                  showToast('Theme synced with OS system settings', 'success');
                }}
                className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all cursor-pointer text-left relative ${
                  theme === 'system'
                    ? 'border-[#2563EB] bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-[#2563EB]/20 shadow-sm'
                    : 'border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700 bg-white dark:bg-[#1E1E1E]'
                }`}
              >
                {theme === 'system' && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 flex items-center justify-center mb-3">
                  <Laptop className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">System Default</span>
                <span className="text-[11px] text-gray-500 dark:text-neutral-400">Match your OS preference</span>
              </button>
            </div>

            {/* Quick Segmented Controller */}
            <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400">
                Quick Switcher:
              </span>
              <ThemeToggle variant="segmented" />
            </div>
          </div>

          {/* 2. PROFILE SECTION CARD */}
          <div className="bg-white dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-colors duration-200">
            <h2 className="text-sm font-semibold text-[#111111] dark:text-white capitalize mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-[#2563EB] dark:text-blue-400" /> Profile Settings
            </h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 dark:text-neutral-400 capitalize mb-1.5">
                  Full Name
                </label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 dark:border-neutral-700 bg-white dark:bg-[#1E1E1E] rounded-lg text-sm text-gray-800 dark:text-neutral-100 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] font-medium"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 dark:text-neutral-400 capitalize mb-1.5">
                  Email Address
                </label>
                <div className="relative group">
                  <input 
                    type="email" 
                    value={initialEmail}
                    readOnly
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm text-gray-400 dark:text-neutral-500 bg-gray-50/50 dark:bg-neutral-800/40 font-medium cursor-not-allowed pr-10"
                    title="Email cannot be changed"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center cursor-not-allowed" title="Email cannot be changed">
                    <Lock className="w-4 h-4 text-gray-300 dark:text-neutral-600" />
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-neutral-500 font-semibold mt-1 flex items-center gap-1 select-none">
                  Email is bound to your authentication and cannot be changed.
                </p>
              </div>

              <div className="pt-2 flex justify-between items-center border-t border-gray-100 dark:border-neutral-800">
                <span className="text-xs text-gray-500 dark:text-neutral-400 font-semibold">
                  Member since {getFormattedDate(initialCreatedAt)}
                </span>
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {updatingProfile ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* 3. ACCOUNT & PLAN SECTION CARD */}
          <div className="bg-white dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-colors duration-200">
            <h2 className="text-sm font-semibold text-[#111111] dark:text-white capitalize mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#2563EB] dark:text-blue-400" /> Account & Plan
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-neutral-800">
                <span className="text-xs font-semibold text-gray-400 dark:text-neutral-400 capitalize">Account Details</span>
                <span className="text-sm font-mono font-semibold text-gray-900 dark:text-neutral-100">
                  {accountName ? `${accountName} — ` : ''}Demo #{accountNumber}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-neutral-800">
                <span className="text-xs font-semibold text-gray-400 dark:text-neutral-400 capitalize">Current Plan</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 select-none">
                  {initialPlanType === 'free' ? 'Free User' : 'Premium'}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-neutral-800">
                <span className="text-xs font-semibold text-gray-400 dark:text-neutral-400 capitalize">Account Balance</span>
                <span className="text-sm font-mono font-semibold text-gray-900 dark:text-neutral-100">
                  ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                </span>
              </div>

              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={() => showToast('Premium plans coming soon', 'info')}
                  className="bg-white dark:bg-neutral-800 border border-[#2563EB] hover:bg-[#2563EB] text-[#2563EB] dark:text-blue-400 hover:text-white dark:hover:text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all cursor-pointer shadow-sm select-none"
                >
                  Upgrade to Premium
                </button>
              </div>
            </div>
          </div>

          {/* 4. MY ACCOUNTS SECTION CARD */}
          <div className="bg-white dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-colors duration-200">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-neutral-800">
              <h2 className="text-sm font-semibold text-[#111111] dark:text-white capitalize flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[#2563EB] dark:text-blue-400" /> My Practice Accounts
              </h2>
              <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400">
                {wallets.length} / {initialPlanType === 'free' ? 2 : 5}
              </span>
            </div>

            <div className="space-y-3">
              {wallets.map((w) => {
                const isCurrentActive = w.account_number === accountNumber;

                return (
                  <div 
                    key={w.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all ${
                      isCurrentActive 
                        ? 'border-[#2563EB]/40 bg-[#2563EB]/5 dark:bg-blue-950/20 text-[#111111] dark:text-white' 
                        : 'border-gray-100 dark:border-neutral-800 hover:border-gray-200 dark:hover:border-neutral-700 text-gray-700 dark:text-neutral-300 bg-white dark:bg-[#1E1E1E]'
                    }`}
                  >
                    <div className="flex flex-col mb-3 sm:mb-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {w.account_name || 'Primary Demo'}
                        </span>
                        {isCurrentActive && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold capitalize bg-[#2563EB]/10 dark:bg-blue-900/40 text-[#2563EB] dark:text-blue-300 border border-[#2563EB]/20 select-none">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-gray-400 dark:text-neutral-500 font-mono mt-0.5">
                        Demo #{w.account_number}
                      </span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <span className="text-sm font-mono font-semibold text-gray-900 dark:text-neutral-100">
                        ${parseFloat(w.virtual_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRenameClick(w.id, w.account_name)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg text-gray-400 dark:text-neutral-400 hover:text-gray-600 dark:hover:text-white transition-all cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-neutral-700"
                          title="Rename Account"
                        >
                          <Pencil className="w-3.5 h-3.5 pointer-events-none" />
                        </button>
                        
                        {!isCurrentActive && (
                          <button
                            onClick={() => handleSwitchAccount(w.id)}
                            className="px-3 py-1.5 bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 font-semibold text-xs rounded-lg transition-all cursor-pointer shadow-sm select-none"
                          >
                            Switch
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. TRADING PREFERENCES CARD */}
          <div className="bg-white dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-colors duration-200">
            <h2 className="text-sm font-semibold text-[#111111] dark:text-white capitalize mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#2563EB] dark:text-blue-400" /> Trading Preferences
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 dark:text-neutral-400 capitalize mb-1.5">
                  Default Order Type
                </label>
                <select
                  value={defaultOrderType}
                  onChange={(e) => setDefaultOrderType(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm text-gray-800 dark:text-neutral-100 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] bg-white dark:bg-[#1E1E1E] font-medium cursor-pointer"
                >
                  <option value="Market">Market (Execute instantly at current rate)</option>
                  <option value="Limit">Limit / Pending (Set a trigger threshold)</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5 pr-4">
                  <label className="text-xs font-semibold text-gray-700 dark:text-neutral-300 capitalize select-none cursor-pointer" htmlFor="tpsl-toggle">
                    Show TP/SL by default in trade panel
                  </label>
                  <p className="text-[10px] text-gray-400 dark:text-neutral-500 font-semibold select-none">
                    Automatically expand Take Profit and Stop Loss toggles when opening a new order panel.
                  </p>
                </div>
                <input 
                  type="checkbox"
                  id="tpsl-toggle"
                  checked={showTpsl}
                  onChange={(e) => setShowTpsl(e.target.checked)}
                  className="w-4 h-4 accent-[#2563EB] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 6. DANGER ZONE SECTION CARD */}
          <div className="bg-white dark:bg-[#1A1A1A] border border-red-200 dark:border-red-900/40 rounded-2xl p-6 shadow-[0_2px_8px_rgba(220,38,38,0.04)] select-none transition-colors duration-200">
            <h2 className="text-sm font-semibold text-red-600 dark:text-red-400 capitalize mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500 dark:text-red-400" /> Danger Zone
            </h2>
            <p className="text-xs text-gray-400 dark:text-neutral-400 font-semibold mb-4">
              Actions below are irreversible. Please perform them with caution.
            </p>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 py-3 border-b border-gray-50 dark:border-neutral-800">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-gray-900 dark:text-neutral-100 capitalize">Reset Virtual Balance</span>
                  <p className="text-[10px] text-gray-400 dark:text-neutral-500 font-semibold">
                    Set your account back to ${initialConfiguredBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} and close all open positions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  disabled={resettingBalance}
                  className="bg-white dark:bg-neutral-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 font-semibold text-xs px-4 py-2 rounded-lg transition-all cursor-pointer"
                >
                  {resettingBalance ? 'Resetting...' : 'Reset Balance'}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 py-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-gray-900 dark:text-neutral-100 capitalize">Delete Account</span>
                  <p className="text-[10px] text-gray-400 dark:text-neutral-500 font-semibold">
                    Permanently delete all your virtual trades, profile, and settings from PaperPulse.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] dark:border-neutral-800 bg-white dark:bg-[#141414] py-6 select-none transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 dark:text-neutral-500 font-semibold">
          <span>&copy; 2026 PaperPulse Trading Terminal. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/dashboard" className="hover:text-gray-600 dark:hover:text-neutral-300">Terminal</Link>
            <span>&bull;</span>
            <Link href="/dashboard" className="hover:text-gray-600 dark:hover:text-neutral-300">Privacy Policy</Link>
          </div>
        </div>
      </footer>

      {/* RESET BALANCE MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[300] p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1E1E1E] border border-[#E5E7EB] dark:border-neutral-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 select-none">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/40 rounded-full flex items-center justify-center text-amber-500 mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Reset Account?</h3>
            <p className="text-xs text-gray-500 dark:text-neutral-400 font-medium leading-relaxed mb-6">
              This will reset your balance to ${initialConfiguredBalance.toLocaleString('en-US')} and close all open positions. This cannot be undone. Are you sure?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs font-semibold text-gray-600 dark:text-neutral-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetBalance}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE ACCOUNT MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[300] p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1E1E1E] border border-[#E5E7EB] dark:border-neutral-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 select-none">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-950/40 rounded-full flex items-center justify-center text-red-500 mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Delete Account?</h3>
            <p className="text-xs text-gray-500 dark:text-neutral-400 font-medium leading-relaxed mb-6">
              Contact support to delete your account. To prevent accidental data loss, standard accounts cannot be deleted directly during this development stage.
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-black dark:bg-neutral-800 text-white hover:bg-gray-800 dark:hover:bg-neutral-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENAME ACCOUNT MODAL */}
      {isRenameModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[300] p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1E1E1E] border border-[#E5E7EB] dark:border-neutral-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl select-none animate-in zoom-in-95 duration-200">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Rename Account</h3>
            <form onSubmit={submitRenameAccount} className="space-y-4">
              {renameError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  {renameError}
                </div>
              )}
              <input
                type="text"
                maxLength="30"
                placeholder="e.g. Gold Strategy Test"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="w-full bg-white dark:bg-[#181818] border border-gray-200 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
                autoFocus
              />
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsRenameModalOpen(false)}
                  className="px-4 py-2 bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs font-semibold text-gray-600 dark:text-neutral-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={renaming}
                  className="px-4 py-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {renaming ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
