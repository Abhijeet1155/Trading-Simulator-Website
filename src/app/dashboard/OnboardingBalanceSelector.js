'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Wallet, Sparkles, CheckCircle, Lock, Crown } from 'lucide-react';

export default function OnboardingBalanceSelector({ onBalanceSet, planType = 'free' }) {
  const isPremium = planType === 'premium';

  const presets = [
    { value: 1000, label: '$1,000', proOnly: false },
    { value: 5000, label: '$5,000', proOnly: false },
    { value: 10000, label: '$10,000', proOnly: false },
    { value: 25000, label: '$25,000', proOnly: true },
    { value: 50000, label: '$50,000', proOnly: true },
    { value: 100000, label: '$100,000', proOnly: true }
  ];

  const [selectedPreset, setSelectedPreset] = useState(10000);
  const [customAmount, setCustomAmount] = useState('');
  const [accountName, setAccountName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    let amount = selectedPreset;
    if (customAmount) {
      if (!isPremium) {
        setError('Custom starting balance is a Premium feature. Please choose a free preset or upgrade to Pro.');
        return;
      }
      const parsed = parseFloat(customAmount);
      if (isNaN(parsed) || parsed < 100 || parsed > 1000000) {
        setError('Please enter an amount between $100 and $1,000,000.');
        return;
      }
      amount = parsed;
    } else {
      if (!isPremium && amount > 10000) {
        setError('Free plan starting balance is limited to a maximum of $10,000.');
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch('/api/wallets/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, name: accountName }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (onBalanceSet) {
          onBalanceSet(data.balance);
        } else {
          window.location.reload();
        }
      } else {
        setError(data.error || 'Failed to set starting balance.');
      }
    } catch (err) {
      console.error(err);
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 max-w-xl mx-auto shadow-[0_4px_20px_rgba(0,0,0,0.04)] mb-8 select-none animate-fade-in">
      <div className="flex items-center gap-3.5 mb-5">
        <div className="w-11 h-11 rounded-xl bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB]">
          <Wallet className="w-5.5 h-5.5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[#111111] flex items-center gap-1.5">
            Set Your Starting Balance
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
          </h2>
          <p className="text-xs font-semibold text-[#6B7280]">
            Choose how much virtual capital you want to practice with.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-[#DC2626]/10 border border-[#DC2626]/20 rounded-lg text-[#DC2626] text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Account Name */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500 capitalize block">Account Name (Optional)</label>
          <input
            type="text"
            maxLength="30"
            placeholder="e.g. Gold Strategy Test, Main Demo"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
          />
        </div>

        {/* Preset Selectors */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-500 capitalize block">Presets</label>
            {!isPremium && (
              <span className="text-[11px] font-semibold text-gray-400">
                Free plan cap: $10,000
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {presets.map((preset) => {
              const isLocked = !isPremium && preset.proOnly;
              const isSelected = selectedPreset === preset.value && !customAmount && !isLocked;

              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => {
                    if (isLocked) {
                      setError('Amounts above $10,000 are exclusive to Premium plans. Upgrade to unlock higher balances!');
                      return;
                    }
                    setSelectedPreset(preset.value);
                    setCustomAmount('');
                    setError('');
                  }}
                  className={`relative py-3 px-4 border rounded-xl font-mono font-semibold text-sm transition-all text-center ${
                    isLocked
                      ? 'border-gray-200/80 bg-gray-50/80 text-gray-400 cursor-not-allowed hover:border-amber-200'
                      : isSelected
                      ? 'border-[#2563EB] bg-[#2563EB]/5 text-[#2563EB] shadow-sm cursor-pointer'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    {preset.label}
                    {isLocked && <Lock className="w-3 h-3 text-amber-500 shrink-0" />}
                  </div>
                  {isLocked && (
                    <span className="absolute -top-2 right-2 px-1.5 py-0.2 bg-gradient-to-r from-amber-500 to-amber-600 text-[9px] font-bold text-white rounded-full uppercase tracking-wider shadow-xs">
                      Pro
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-500 capitalize block">Or Enter Custom Amount</label>
            {!isPremium && (
              <Link href="/pricing" className="text-[11px] font-semibold text-[#2563EB] hover:underline flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-500" /> Unlock Custom with Pro
              </Link>
            )}
          </div>
          
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 font-mono font-semibold">$</span>
            <input
              type="number"
              min="100"
              max="1000000"
              disabled={!isPremium}
              placeholder={isPremium ? "Min $100 - Max $1,000,000" : "Custom balances ($100 - $1M) available on Pro"}
              value={customAmount}
              onChange={(e) => {
                if (!isPremium) return;
                setCustomAmount(e.target.value);
                setSelectedPreset(0);
                setError('');
              }}
              className={`w-full border rounded-xl pl-8 pr-4 py-3 text-sm font-semibold transition-colors ${
                !isPremium 
                  ? 'bg-gray-50 text-gray-400 border-gray-200 placeholder-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-900 border-gray-200 placeholder-gray-400 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]'
              }`}
            />
            {!isPremium && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <span className="px-2 py-0.5 bg-amber-50 border border-amber-200/60 text-amber-700 text-[10px] font-bold rounded-md flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> PRO
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Confirm Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold text-sm rounded-xl shadow-[0_2px_4px_rgba(37,99,235,0.15)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.25)] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            'Configuring Balance...'
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Confirm starting balance
            </>
          )}
        </button>
      </form>
    </div>
  );
}
