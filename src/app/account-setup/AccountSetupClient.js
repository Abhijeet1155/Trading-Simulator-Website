'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import {
  Wallet,
  Plus,
  Check,
  Pencil,
  Trash2,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Info,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
  Zap,
  Globe,
  Sliders,
  DollarSign,
  Monitor,
  RefreshCw,
  X,
  Key,
  Server,
  Copy,
  Eye,
  EyeOff,
  Smartphone,
  Laptop
} from 'lucide-react';
import { 
  DEFAULT_ACCOUNT_TYPES, 
  ALLOWED_LEVERAGES, 
  SUPPORTED_CURRENCIES, 
  SUPPORTED_PLATFORMS, 
  SUPPORTED_EXECUTION_TYPES,
  validateNickname,
  validateStartingBalance,
  validateLeverage
} from '@/lib/accountTypes';

export default function AccountSetupClient({ initialUserData, initialAccounts, initialAccountTypes }) {
  const router = useRouter();

  // Accounts state
  const [accounts, setAccounts] = useState(initialAccounts || []);
  const [activeAccount, setActiveAccount] = useState(
    initialAccounts?.find(a => a.isActive) || initialAccounts?.[0] || null
  );
  const [accountTypes, setAccountTypes] = useState(
    initialAccountTypes && initialAccountTypes.length > 0 ? initialAccountTypes : DEFAULT_ACCOUNT_TYPES
  );
  const [maxLimit, setMaxLimit] = useState(5);
  const [limitReached, setLimitReached] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Filter tab for account list: 'all' | 'demo' | 'real'
  const [accountFilter, setAccountFilter] = useState('all');

  // Account creation form state
  const [isDemo, setIsDemo] = useState(true);
  const [selectedAccountType, setSelectedAccountType] = useState('standard');
  const [selectedLeverage, setSelectedLeverage] = useState(100);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedPlatform, setSelectedPlatform] = useState('MT5');
  const [selectedExecType, setSelectedExecType] = useState('Market');
  const [startingBalance, setStartingBalance] = useState(10000);
  const [customBalance, setCustomBalance] = useState('');
  const [nickname, setNickname] = useState('');

  // Validation & feedback state
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(null);

  // MT4/MT5 Bridge Modal State
  const [mtBridgeModal, setMtBridgeModal] = useState(null);
  const [mtBridgeData, setMtBridgeData] = useState(null);
  const [mtBridgeLoading, setMtBridgeLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');
  const [customMtPassword, setCustomMtPassword] = useState('');
  const [isUpdatingMtPassword, setIsUpdatingMtPassword] = useState(false);
  const [mtPasswordSuccess, setMtPasswordSuccess] = useState('');
  const [testLoginStatus, setTestLoginStatus] = useState(null);
  const [isTestingLogin, setIsTestingLogin] = useState(false);

  // Rename modal state
  const [renamingAccount, setRenamingAccount] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameError, setRenameError] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  // Delete modal state
  const [deletingAccount, setDeletingAccount] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch / refresh accounts
  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/account');
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
        setActiveAccount(data.activeAccount || null);
        if (data.accountTypes) setAccountTypes(data.accountTypes);
        if (data.maxLimit) setMaxLimit(data.maxLimit);
        if (data.limitReached !== undefined) setLimitReached(data.limitReached);
      }
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Filtered accounts
  const filteredAccounts = accounts.filter(acc => {
    if (accountFilter === 'demo') return acc.isDemo !== false;
    if (accountFilter === 'real') return acc.isDemo === false;
    return true;
  });

  // Active configuration specs
  const activeTypeConfig = accountTypes.find(t => t.id === selectedAccountType) || accountTypes[0];

  // Starting balance presets
  const presetBalances = [1000, 5000, 10000, 25000, 50000, 100000];

  // Resolve current effective starting balance
  const currentEffectiveBalance = customBalance ? parseFloat(customBalance) : startingBalance;

  // Handle Account Switch
  const handleSwitchAccount = async (walletId) => {
    try {
      const res = await fetch('/api/user/account/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletId })
      });
      if (res.ok) {
        setAccounts(prev => prev.map(a => ({
          ...a,
          isActive: a.id === walletId
        })));
        const target = accounts.find(a => a.id === walletId);
        if (target) {
          setActiveAccount({ ...target, isActive: true });
        }
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to switch account.');
      }
    } catch (e) {
      console.error('Error switching account:', e);
    }
  };

  // Handle Rename Submit
  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (!renamingAccount) return;
    setRenameError('');

    const validation = validateNickname(renameValue);
    if (!validation.valid) {
      setRenameError(validation.error);
      return;
    }

    setIsRenaming(true);
    try {
      const res = await fetch('/api/user/account/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletId: renamingAccount.id,
          nickname: validation.nickname
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAccounts(prev => prev.map(a => {
          if (a.id === renamingAccount.id) {
            return { ...a, nickname: data.nickname, accountName: data.nickname };
          }
          return a;
        }));
        if (activeAccount?.id === renamingAccount.id) {
          setActiveAccount(prev => ({ ...prev, nickname: data.nickname, accountName: data.nickname }));
        }
        setRenamingAccount(null);
      } else {
        setRenameError(data.error || 'Failed to rename account.');
      }
    } catch (err) {
      setRenameError('Network error while renaming account.');
    } finally {
      setIsRenaming(false);
    }
  };

  // Handle Delete Submit
  const handleDeleteSubmit = async () => {
    if (!deletingAccount) return;
    setDeleteError('');
    setIsDeleting(true);

    try {
      const res = await fetch('/api/user/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletId: deletingAccount.id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const remaining = accounts.filter(a => a.id !== deletingAccount.id);
        setAccounts(remaining);
        if (data.activeWalletId) {
          const newActive = remaining.find(a => a.id === data.activeWalletId) || remaining[0];
          setActiveAccount(newActive ? { ...newActive, isActive: true } : null);
        }
        setDeletingAccount(null);
      } else {
        setDeleteError(data.error || 'Failed to delete account.');
      }
    } catch (err) {
      setDeleteError('Network error while deleting account.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Open MT4/MT5 Bridge Connection Modal
  const openMtBridgeModal = async (account) => {
    setMtBridgeModal(account);
    setMtBridgeLoading(true);
    setMtBridgeData(null);
    setTestLoginStatus(null);
    setMtPasswordSuccess('');
    setCustomMtPassword('');
    setShowPassword(false);

    try {
      const res = await fetch(`/api/mt-bridge?accountNumber=${account.accountNumber}&walletId=${account.id}`);
      if (res.ok) {
        const data = await res.json();
        setMtBridgeData(data);
      }
    } catch (e) {
      console.error('Failed to load MT Bridge credentials:', e);
    } finally {
      setMtBridgeLoading(false);
    }
  };

  // Copy to clipboard helper
  const copyToClipboard = (text, key) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(''), 2500);
    }
  };

  // Update MT4/MT5 Password
  const handleUpdateMtPassword = async (e) => {
    e.preventDefault();
    if (!customMtPassword || customMtPassword.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }
    setIsUpdatingMtPassword(true);
    setMtPasswordSuccess('');

    try {
      const res = await fetch('/api/mt-bridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_password',
          login: mtBridgeModal.accountNumber,
          newPassword: customMtPassword
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMtPasswordSuccess('Master Password updated! Use this to login in MT4/MT5.');
        setMtBridgeData(prev => prev ? {
          ...prev,
          credentials: {
            ...prev.credentials,
            masterPassword: customMtPassword
          }
        } : null);
        setCustomMtPassword('');
      } else {
        alert(data.error || 'Failed to update password');
      }
    } catch (err) {
      alert('Network error while updating MT password');
    } finally {
      setIsUpdatingMtPassword(false);
    }
  };

  // Test MT4/MT5 Bridge Connection
  const handleTestMtLogin = async () => {
    if (!mtBridgeData?.credentials) return;
    setIsTestingLogin(true);
    setTestLoginStatus(null);

    try {
      const res = await fetch('/api/mt-bridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_login',
          login: mtBridgeData.credentials.login,
          password: mtBridgeData.credentials.masterPassword,
          server: mtBridgeData.credentials.server
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestLoginStatus({ success: true, message: `Connected to ${mtBridgeData.credentials.server}! Balance: $${data.account.balance.toLocaleString()} ${data.account.currency}` });
      } else {
        setTestLoginStatus({ success: false, message: data.error || 'Authentication check failed.' });
      }
    } catch (e) {
      setTestLoginStatus({ success: false, message: 'Could not reach server bridge.' });
    } finally {
      setIsTestingLogin(false);
    }
  };

  // Handle Form Submission
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setFormError('');

    // 1. Validate Balance
    const balanceValidation = validateStartingBalance(currentEffectiveBalance, selectedAccountType, accountTypes);
    if (!balanceValidation.valid) {
      setFormError(balanceValidation.error);
      return;
    }

    // 2. Validate Nickname if provided
    if (nickname) {
      const nickValidation = validateNickname(nickname);
      if (!nickValidation.valid) {
        setFormError(nickValidation.error);
        return;
      }
    }

    // 3. Validate Leverage
    const levValidation = validateLeverage(selectedLeverage, selectedAccountType, accountTypes);
    if (!levValidation.valid) {
      setFormError(levValidation.error);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/user/account/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startingBalance: balanceValidation.amount,
          nickname: nickname.trim(),
          accountType: selectedAccountType,
          leverage: selectedLeverage,
          currency: selectedCurrency,
          platform: selectedPlatform,
          executionType: selectedExecType,
          isDemo: isDemo
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessModal(data.account);
        setNickname('');
        setCustomBalance('');
        setStartingBalance(10000);
        await fetchAccounts();
      } else {
        setFormError(data.error || 'Failed to create account.');
      }
    } catch (err) {
      console.error('Account creation error:', err);
      setFormError('Network error while creating account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Total balance sum
  const totalBalance = accounts.reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#121212] text-gray-900 dark:text-neutral-100 flex flex-col selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar userName={initialUserData?.name || 'Trader'} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* Page Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Layers className="w-4 h-4" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-neutral-100">
                Account Management &amp; Setup
              </h1>
            </div>
            <p className="text-xs md:text-sm text-gray-500 dark:text-neutral-400">
              Create and manage Exness-style multi-tier trading accounts with custom leverage, platforms, and spread types.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-800 rounded-xl px-4 py-2 flex items-center gap-3 shadow-xs">
              <div className="flex flex-col">
                <span className="text-[10px] capitalize font-semibold text-gray-400 dark:text-neutral-500">Total Portfolio</span>
                <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </span>
              </div>
            </div>

            <Link
              href="/broker-sync"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white dark:bg-[#1E1E1E] hover:bg-gray-50 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-200 text-xs font-semibold rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              <Server className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Broker Sync (MT5)</span>
            </Link>

            <Link
              href="/trade"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Go to Terminal</span>
            </Link>
          </div>
        </div>

        {/* Two-Column Grid: Left (Account Grid/List) & Right (Creation Setup Form) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* LEFT COLUMN: CREATED ACCOUNTS LIST (5 cols)                        */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Accounts Header & Filter Bar */}
            <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-800 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-sm font-bold text-gray-900 dark:text-neutral-100">Your Trading Accounts</h2>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 font-semibold border border-gray-200 dark:border-neutral-700">
                  {accounts.length} / {maxLimit} Max
                </span>
              </div>

              {/* Filter Tabs */}
              <div className="flex bg-gray-100 dark:bg-[#151515] p-1 rounded-xl border border-gray-200 dark:border-neutral-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setAccountFilter('all')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    accountFilter === 'all' 
                      ? 'bg-white dark:bg-[#252525] text-gray-900 dark:text-neutral-100 shadow-xs' 
                      : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100'
                  }`}
                >
                  All ({accounts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAccountFilter('demo')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    accountFilter === 'demo' 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100'
                  }`}
                >
                  Demo ({accounts.filter(a => a.isDemo !== false).length})
                </button>
                <button
                  type="button"
                  onClick={() => setAccountFilter('real')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    accountFilter === 'real' 
                      ? 'bg-amber-600 text-white shadow-xs' 
                      : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100'
                  }`}
                >
                  Real ({accounts.filter(a => a.isDemo === false).length})
                </button>
              </div>
            </div>

            {/* Account Cards Container */}
            <div className="space-y-3">
              {filteredAccounts.length === 0 ? (
                <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-800 rounded-2xl p-8 text-center space-y-2 shadow-xs">
                  <Info className="w-8 h-8 text-gray-400 dark:text-neutral-500 mx-auto" />
                  <p className="text-xs text-gray-500 dark:text-neutral-400">No accounts match the selected filter.</p>
                </div>
              ) : (
                filteredAccounts.map((acc) => {
                  const isCurrent = acc.isActive;
                  const typeDetails = acc.accountTypeDetails || accountTypes.find(t => t.id === acc.accountType) || accountTypes[0];

                  return (
                    <div
                      key={acc.id}
                      className={`relative bg-white dark:bg-[#1E1E1E] rounded-2xl p-4 transition-all border shadow-xs ${
                        isCurrent
                          ? 'border-blue-600 dark:border-blue-500 ring-2 ring-blue-600/20 dark:ring-blue-500/20 bg-blue-50/20 dark:bg-blue-950/20'
                          : 'border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700 hover:shadow-sm'
                      }`}
                    >
                      {/* Top Row: Badges & Account ID */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Demo / Real Badge */}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize  ${
                              acc.isDemo !== false
                                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60'
                                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
                            }`}
                          >
                            {acc.isDemo !== false ? 'Demo' : 'Real'}
                          </span>

                          {/* Account Type Badge */}
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 border border-gray-200 dark:border-neutral-700">
                            {typeDetails?.name || acc.accountType}
                          </span>

                          {/* Platform Badge */}
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-50 dark:bg-neutral-900 text-gray-600 dark:text-neutral-400 border border-gray-200 dark:border-neutral-800">
                            {acc.platform || 'MT5'}
                          </span>

                          {/* Leverage */}
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
                            1:{acc.leverage || 100}
                          </span>
                        </div>

                        {/* Active Status Indicator */}
                        {isCurrent ? (
                          <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                            <span>Active Terminal</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSwitchAccount(acc.id)}
                            className="text-[10px] font-semibold text-gray-600 dark:text-neutral-300 hover:text-blue-700 dark:hover:text-blue-400 bg-gray-100 dark:bg-neutral-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-gray-200 dark:border-neutral-700 hover:border-blue-200 dark:hover:border-blue-800 px-2.5 py-0.5 rounded-full transition-colors cursor-pointer"
                          >
                            Set Active
                          </button>
                        )}
                      </div>

                      {/* Middle: Nickname & Account Number */}
                      <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-gray-100 dark:border-neutral-800">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900 dark:text-neutral-100">
                            {acc.nickname || acc.accountName || `Demo Account`}
                          </span>
                          <span className="text-xs font-mono text-gray-400 dark:text-neutral-500">
                            #{acc.accountNumber}
                          </span>
                        </div>

                        {/* Edit & Delete Action Icons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setRenamingAccount(acc);
                              setRenameValue(acc.nickname || acc.accountName || '');
                              setRenameError('');
                            }}
                            title="Edit Nickname"
                            className="p-1.5 text-gray-400 dark:text-neutral-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {accounts.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setDeletingAccount(acc);
                                setDeleteError('');
                              }}
                              title="Delete Account"
                              className="p-1.5 text-gray-400 dark:text-neutral-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Financial Metrics Grid */}
                      <div className="grid grid-cols-3 gap-2 bg-gray-50/80 dark:bg-[#151515] p-2.5 rounded-xl border border-gray-200/70 dark:border-neutral-800/80 mb-3 font-mono">
                        <div>
                          <div className="text-[9px] capitalize font-semibold text-gray-400 dark:text-neutral-500">Balance</div>
                          <div className="text-xs font-bold text-gray-900 dark:text-neutral-100">
                            ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>

                        <div>
                          <div className="text-[9px] capitalize font-semibold text-gray-400 dark:text-neutral-500">Equity</div>
                          <div className="text-xs font-bold text-gray-700 dark:text-neutral-300">
                            ${(acc.equity || acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>

                        <div>
                          <div className="text-[9px] capitalize font-semibold text-gray-400 dark:text-neutral-500">Margin</div>
                          <div className="text-xs font-bold text-gray-600 dark:text-neutral-400">
                            ${(acc.margin || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Action Strip */}
                      <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                        <div className="text-[10px] text-gray-500 dark:text-neutral-400 font-mono">
                          Currency: <span className="text-gray-800 dark:text-neutral-200 font-semibold">{acc.currency || 'USD'}</span> · {acc.executionType || 'Market'}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openMtBridgeModal(acc)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 transition-all cursor-pointer shadow-2xs"
                            title="Connect to MetaTrader 4 / MetaTrader 5"
                          >
                            <Server className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>MT4/MT5 Link</span>
                          </button>

                          <Link
                            href="/trade"
                            onClick={() => {
                              if (!isCurrent) handleSwitchAccount(acc.id);
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                                : 'bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300'
                            }`}
                          >
                            <span>Trade</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Strategy Box */}
            <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-800 rounded-2xl p-4 text-xs space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Multi-Account Strategy</span>
              </div>
              <p className="text-gray-500 dark:text-neutral-400 text-[11px] leading-relaxed">
                Test different trading strategies, risk profiles, and leverage ratios across separate dedicated accounts simultaneously.
              </p>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* RIGHT COLUMN: EXNESS-STYLE ACCOUNT CREATION FORM (7 cols)          */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-6">
              
              {/* Form Title & Demo/Real Toggle Switch */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-200 dark:border-neutral-800">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-neutral-100 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Open New Trading Account
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-neutral-400">
                    Configure your execution rules, leverage limits, and account specifications.
                  </p>
                </div>

                {/* Demo / Real Segmented Toggle */}
                <div className="bg-gray-100 dark:bg-[#151515] p-1 rounded-xl border border-gray-200 dark:border-neutral-800 flex items-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsDemo(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isDemo
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100'
                    }`}
                  >
                    Demo Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDemo(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      !isDemo
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100'
                    }`}
                  >
                    Real Account
                  </button>
                </div>
              </div>

              {formError && (
                <div className="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateAccount} className="space-y-6">
                
                {/* 1. Account Type Selector Grid (5 Exness Types) */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold capitalize text-gray-700 dark:text-neutral-300">
                    1. Select Account Type
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {accountTypes.map((type) => {
                      const isSelected = selectedAccountType === type.id;
                      return (
                        <div
                          key={type.id}
                          onClick={() => {
                            setSelectedAccountType(type.id);
                            if (selectedLeverage > type.max_leverage) {
                              setSelectedLeverage(type.max_leverage);
                            }
                            if (currentEffectiveBalance < type.min_deposit) {
                              setStartingBalance(Math.max(1000, type.min_deposit));
                              setCustomBalance('');
                            }
                          }}
                          className={`relative p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-600 dark:border-blue-500 ring-1 ring-blue-600/30 dark:ring-blue-500/30 shadow-xs'
                              : 'bg-white dark:bg-[#181818] border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700 hover:bg-gray-50/60 dark:hover:bg-neutral-800/40'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-bold text-sm text-gray-900 dark:text-neutral-100">{type.name}</span>
                              {type.tag && (
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                  {type.tag}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-neutral-400 leading-snug mb-3">
                              {type.description}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-neutral-800 text-[10px] font-mono text-gray-500 dark:text-neutral-400">
                            <div>
                              Min Deposit: <span className="text-gray-900 dark:text-neutral-100 font-bold">${type.min_deposit}</span>
                            </div>
                            <div>
                              Spread: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{type.min_spread.toFixed(1)} pips</span>
                            </div>
                            <div>
                              Max Lev: <span className="text-blue-600 dark:text-blue-400 font-bold">1:{type.max_leverage}</span>
                            </div>
                            <div>
                              Comm: <span className="text-gray-700 dark:text-neutral-300 font-semibold">{type.commission}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Platform & Execution Type (Grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Platform */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold capitalize text-gray-700 dark:text-neutral-300">
                      2. Trading Platform
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {SUPPORTED_PLATFORMS.map((plat) => (
                        <button
                          key={plat}
                          type="button"
                          onClick={() => setSelectedPlatform(plat)}
                          className={`py-2 px-2.5 rounded-xl border text-xs font-bold font-mono transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                            selectedPlatform === plat
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white dark:bg-[#181818] border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700'
                          }`}
                        >
                          <Monitor className="w-3.5 h-3.5" />
                          <span>{plat}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Execution Type */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold capitalize text-gray-700 dark:text-neutral-300">
                      3. Execution Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {SUPPORTED_EXECUTION_TYPES.map((exec) => (
                        <button
                          key={exec}
                          type="button"
                          onClick={() => setSelectedExecType(exec)}
                          className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                            selectedExecType === exec
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white dark:bg-[#181818] border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700'
                          }`}
                        >
                          <span>{exec}</span>
                          <span className="text-[9px] font-normal opacity-80">
                            {exec === 'Market' ? 'Instant Fill' : 'Exact Price'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Max Leverage Selector & Account Currency */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Max Leverage */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold capitalize text-gray-700 dark:text-neutral-300">
                        4. Max Leverage
                      </label>
                      <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                        1:{selectedLeverage}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {ALLOWED_LEVERAGES.map((lev) => {
                        const disabled = lev > (activeTypeConfig?.max_leverage || 500);
                        return (
                          <button
                            key={lev}
                            type="button"
                            disabled={disabled}
                            onClick={() => setSelectedLeverage(lev)}
                            className={`py-1.5 px-2 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                              selectedLeverage === lev
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : disabled
                                ? 'bg-gray-100 dark:bg-neutral-900 text-gray-400 dark:text-neutral-600 border-gray-200 dark:border-neutral-800 cursor-not-allowed'
                                : 'bg-white dark:bg-[#181818] border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-200 hover:border-gray-300 dark:hover:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800'
                            }`}
                          >
                            1:{lev}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Currency Selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold capitalize text-gray-700 dark:text-neutral-300">
                      5. Account Currency
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {SUPPORTED_CURRENCIES.map((cur) => (
                        <button
                          key={cur}
                          type="button"
                          onClick={() => setSelectedCurrency(cur)}
                          className={`py-1.5 px-2 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                            selectedCurrency === cur
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white dark:bg-[#181818] border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-200 hover:border-gray-300 dark:hover:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800'
                          }`}
                        >
                          {cur}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. Starting Balance Input (Demo / Virtual Funds) */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold capitalize text-gray-700 dark:text-neutral-300">
                      6. Starting Balance ({selectedCurrency})
                    </label>
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      Min Deposit: ${activeTypeConfig?.min_deposit || 10}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {presetBalances.map((amt) => {
                      const isPresetActive = startingBalance === amt && !customBalance;
                      return (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => {
                            setStartingBalance(amt);
                            setCustomBalance('');
                          }}
                          className={`py-2 px-2 rounded-xl border text-xs font-bold font-mono transition-all cursor-pointer ${
                            isPresetActive
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white dark:bg-[#181818] border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-200 hover:border-gray-300 dark:hover:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800'
                          }`}
                        >
                          ${amt >= 1000 ? `${amt / 1000}k` : amt}
                        </button>
                      );
                    })}
                  </div>

                  <div className="relative mt-2">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 dark:text-neutral-500 font-mono">
                      $
                    </span>
                    <input
                      type="number"
                      min={activeTypeConfig?.min_deposit || 1}
                      max="1000000"
                      placeholder={`Or custom amount (Min: $${activeTypeConfig?.min_deposit || 10})`}
                      value={customBalance}
                      onChange={(e) => setCustomBalance(e.target.value)}
                      className="w-full bg-white dark:bg-[#181818] border border-gray-200 dark:border-neutral-800 rounded-xl pl-8 pr-4 py-2.5 text-xs font-mono font-bold text-gray-900 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 transition-colors"
                    />
                  </div>
                </div>

                {/* 5. Account Nickname */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold capitalize text-gray-700 dark:text-neutral-300">
                      7. Account Nickname
                    </label>
                    <span className="text-[11px] text-gray-400 dark:text-neutral-500 font-mono">
                      {nickname.length}/36 chars (no special characters)
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={36}
                    placeholder="e.g. Scalping Strategy MT5, Gold Swing Demo"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full bg-white dark:bg-[#181818] border border-gray-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-900 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 transition-colors"
                  />
                </div>

                {/* ════════════════════════════════════════════════════════════ */}
                {/* ACCOUNT SPECS STRIP (Bottom summary of chosen configuration) */}
                {/* ════════════════════════════════════════════════════════════ */}
                <div className="bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-neutral-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 dark:text-neutral-400 pb-2 border-b border-gray-200/80 dark:border-neutral-800 capitalize">
                    <span>Account Specifications Summary</span>
                    <span className="text-blue-600 dark:text-blue-400 font-mono">{activeTypeConfig?.name} · {selectedPlatform}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                    <div>
                      <span className="text-gray-400 dark:text-neutral-500 block text-[9px] capitalize">Min Deposit</span>
                      <span className="text-gray-900 dark:text-neutral-100 font-bold">${activeTypeConfig?.min_deposit}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 dark:text-neutral-500 block text-[9px] capitalize">Spread From</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{activeTypeConfig?.min_spread.toFixed(1)} pips</span>
                    </div>
                    <div>
                      <span className="text-gray-400 dark:text-neutral-500 block text-[9px] capitalize">Commission</span>
                      <span className="text-gray-700 dark:text-neutral-300 font-bold">{activeTypeConfig?.commission}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 dark:text-neutral-500 block text-[9px] capitalize">Max Leverage</span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">1:{selectedLeverage}</span>
                    </div>
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || (limitReached && accounts.length >= maxLimit)}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Creating Trading Account...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Create &amp; Activate Account</span>
                    </>
                  )}
                </button>
              </form>

            </div>
          </div>

        </div>
      </main>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SUCCESS CREATION MODAL                                                 */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {successModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <button
                type="button"
                onClick={() => setSuccessModal(null)}
                className="p-1 text-gray-400 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-neutral-100">Account Created Successfully!</h3>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
                Your new trading account is configured and set as your active terminal account.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-[#151515] rounded-xl p-4 border border-gray-200 dark:border-neutral-800 space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-neutral-400">Account Number:</span>
                <span className="text-gray-900 dark:text-neutral-100 font-bold">#{successModal.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-neutral-400">Nickname:</span>
                <span className="text-gray-700 dark:text-neutral-300 font-bold">{successModal.nickname}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-neutral-400">Type:</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">{successModal.accountType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-neutral-400">Balance:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  ${successModal.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} {successModal.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-neutral-400">Leverage:</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">1:{successModal.leverage}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSuccessModal(null)}
                className="flex-1 py-2.5 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
              <Link
                href="/trade"
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Trade Terminal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* RENAME ACCOUNT MODAL                                                   */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {renamingAccount && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-neutral-100 flex items-center gap-2">
                <Pencil className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Rename Account #{renamingAccount.accountNumber}
              </h3>
              <button
                type="button"
                onClick={() => setRenamingAccount(null)}
                className="p-1 text-gray-400 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {renameError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold">
                {renameError}
              </div>
            )}

            <form onSubmit={handleRenameSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-neutral-300 mb-1">
                  New Nickname (3-36 characters)
                </label>
                <input
                  type="text"
                  maxLength={36}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="w-full bg-white dark:bg-[#181818] border border-gray-200 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-900 dark:text-neutral-100 focus:outline-none focus:border-blue-600"
                  placeholder="e.g. Scalping Strategy"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRenamingAccount(null)}
                  className="flex-1 py-2 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRenaming}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isRenaming ? 'Saving...' : 'Save Nickname'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MT4 / MT5 BRIDGE CONNECTION & DATA SYNC MODAL                          */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {mtBridgeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-neutral-100 flex items-center gap-2">
                    <span>MetaTrader 4 / 5 Bridge</span>
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-full capitalize">
                      Live Sync
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-neutral-400">
                    Account #{mtBridgeModal.accountNumber} ({mtBridgeModal.nickname || 'Demo'})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMtBridgeModal(null)}
                className="p-1.5 text-gray-400 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {mtBridgeLoading ? (
              <div className="py-12 text-center text-xs font-semibold text-gray-500 dark:text-neutral-400 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 dark:text-emerald-400 mx-auto" />
                <p>Generating secure MT4/MT5 bridge handshake...</p>
              </div>
            ) : mtBridgeData ? (
              <div className="space-y-5 text-xs">
                
                {/* Protocol Info Banner */}
                <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 rounded-2xl p-3.5 flex items-start gap-3">
                  <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="font-bold text-emerald-900 dark:text-emerald-200 text-xs">Multi-Platform Real-Time Sync</div>
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
                      Enter these credentials in your <strong>MT4 or MT5 mobile / desktop app</strong>. Trades placed in MetaTrader will immediately reflect on the website dashboard and balance in real-time.
                    </div>
                  </div>
                </div>

                {/* Connection Credentials Card */}
                <div className="bg-gray-50 dark:bg-[#151515] rounded-2xl p-4 border border-gray-200 dark:border-neutral-800 space-y-3 font-mono">
                  
                  {/* Server */}
                  <div className="flex items-center justify-between py-1 border-b border-gray-200/60 dark:border-neutral-800">
                    <span className="text-gray-500 dark:text-neutral-400 text-[11px]">Broker / Server:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 dark:text-neutral-100">{mtBridgeData.credentials.server}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(mtBridgeData.credentials.server, 'server')}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100"
                        title="Copy Server"
                      >
                        {copiedKey === 'server' ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Server Host */}
                  <div className="flex items-center justify-between py-1 border-b border-gray-200/60 dark:border-neutral-800">
                    <span className="text-gray-500 dark:text-neutral-400 text-[11px]">Server Address / Host:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 dark:text-neutral-100">{mtBridgeData.credentials.serverHost}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(mtBridgeData.credentials.serverHost, 'host')}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100"
                        title="Copy Host"
                      >
                        {copiedKey === 'host' ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Account / Login ID */}
                  <div className="flex items-center justify-between py-1 border-b border-gray-200/60 dark:border-neutral-800">
                    <span className="text-gray-500 dark:text-neutral-400 text-[11px]">Login / Account ID:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">{mtBridgeData.credentials.login}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(mtBridgeData.credentials.login, 'login')}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100"
                        title="Copy Login"
                      >
                        {copiedKey === 'login' ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Master Password */}
                  <div className="flex items-center justify-between py-1 border-b border-gray-200/60 dark:border-neutral-800">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500 dark:text-neutral-400 text-[11px]">Master Password:</span>
                      <span className="text-[9px] bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded font-sans font-semibold">Trade Access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 dark:text-neutral-100 font-mono">
                        {showPassword ? mtBridgeData.credentials.masterPassword : '••••••••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100"
                        title={showPassword ? 'Hide Password' : 'Show Password'}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(mtBridgeData.credentials.masterPassword, 'master')}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100"
                        title="Copy Password"
                      >
                        {copiedKey === 'master' ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Investor Password */}
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500 dark:text-neutral-400 text-[11px]">Investor Password:</span>
                      <span className="text-[9px] bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 px-1.5 py-0.2 rounded font-sans font-semibold">Read Only</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-600 dark:text-neutral-400 font-mono">{mtBridgeData.credentials.investorPassword}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(mtBridgeData.credentials.investorPassword, 'investor')}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100"
                        title="Copy Investor Password"
                      >
                        {copiedKey === 'investor' ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Real-time Synchronized Metrics Preview */}
                <div className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-[#151515] p-3 rounded-2xl border border-gray-200 dark:border-neutral-800 font-mono text-center">
                  <div>
                    <span className="text-[9.5px] capitalize text-gray-400 dark:text-neutral-500 font-semibold block">Balance</span>
                    <span className="font-bold text-gray-900 dark:text-neutral-100 text-xs">${mtBridgeData.metrics.balance.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[9.5px] capitalize text-gray-400 dark:text-neutral-500 font-semibold block">Equity</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">${mtBridgeData.metrics.equity.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[9.5px] capitalize text-gray-400 dark:text-neutral-500 font-semibold block">Margin Level</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-xs">{mtBridgeData.metrics.marginLevel}</span>
                  </div>
                </div>

                {/* Connection Tester */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-700 dark:text-neutral-300 text-xs">Bridge Status & Verification</span>
                    <button
                      type="button"
                      onClick={handleTestMtLogin}
                      disabled={isTestingLogin}
                      className="px-3 py-1 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-800 dark:text-neutral-200 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isTestingLogin ? 'animate-spin text-emerald-600 dark:text-emerald-400' : ''}`} />
                      <span>{isTestingLogin ? 'Testing...' : 'Test MT4/5 Connection'}</span>
                    </button>
                  </div>

                  {testLoginStatus && (
                    <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
                      testLoginStatus.success ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300'
                    }`}>
                      {testLoginStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
                      <span>{testLoginStatus.message}</span>
                    </div>
                  )}
                </div>

                {/* Change MT Master Password */}
                <form onSubmit={handleUpdateMtPassword} className="pt-2 border-t border-gray-100 dark:border-neutral-800 space-y-2">
                  <span className="block font-bold text-gray-700 dark:text-neutral-300 text-xs">Set Custom MT Master Password</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="New MT4/MT5 Password (min 6 chars)"
                      value={customMtPassword}
                      onChange={(e) => setCustomMtPassword(e.target.value)}
                      className="flex-1 bg-white dark:bg-[#181818] border border-gray-200 dark:border-neutral-800 rounded-xl px-3 py-1.5 text-xs font-mono font-semibold text-gray-900 dark:text-neutral-100 focus:outline-none focus:border-blue-600"
                    />
                    <button
                      type="submit"
                      disabled={isUpdatingMtPassword || !customMtPassword}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isUpdatingMtPassword ? 'Updating...' : 'Update'}
                    </button>
                  </div>
                  {mtPasswordSuccess && (
                    <div className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>{mtPasswordSuccess}</span>
                    </div>
                  )}
                </form>

              </div>
            ) : (
              <div className="py-6 text-center text-xs text-red-500 dark:text-red-400">
                Failed to load MT credentials. Please try again.
              </div>
            )}

            <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setMtBridgeModal(null)}
                className="flex-1 py-2.5 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
              <Link
                href="/trade"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Web Trading Terminal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* DELETE ACCOUNT CONFIRMATION MODAL                                      */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {deletingAccount && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-neutral-100">Delete Trading Account?</h3>
                <p className="text-xs text-gray-500 dark:text-neutral-400">
                  Account #{deletingAccount.accountNumber} ({deletingAccount.nickname || 'Demo'})
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold">
                {deleteError}
              </div>
            )}

            <p className="text-xs text-gray-600 dark:text-neutral-300 bg-gray-50 dark:bg-[#151515] p-3 rounded-xl border border-gray-200 dark:border-neutral-800">
              Are you sure you want to delete this account? All associated open orders will be closed. This action cannot be undone.
            </p>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingAccount(null)}
                className="flex-1 py-2 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteSubmit}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
