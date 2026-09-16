'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { 
  Share2, Users, DollarSign, Award, Copy, Check, 
  ArrowRight, ExternalLink, Sparkles, TrendingUp,
  ShieldCheck, Gift, ChevronRight, Zap
} from 'lucide-react';

export default function AffiliatePage() {
  const [copied, setCopied] = useState(false);
  const referralLink = 'https://paperpulse.io/signup?ref=PULSE-VIP-881';

  const handleCopy = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const tiers = [
    { name: 'Bronze Affiliate', minUsers: '1 - 10 Traders', commission: '20%', active: true, badge: 'Current Tier' },
    { name: 'Silver Partner', minUsers: '11 - 50 Traders', commission: '30%', active: false, badge: 'Next Tier' },
    { name: 'Gold Elite', minUsers: '51 - 200 Traders', commission: '40%', active: false, badge: 'High Earner' },
    { name: 'Diamond VIP', minUsers: '200+ Traders', commission: '50%', active: false, badge: 'Custom Perks' }
  ];

  const recentReferrals = [
    { id: 'usr_8921', date: 'Today, 14:20', tier: 'Pro Monthly', commission: '+$19.80', status: 'Completed' },
    { id: 'usr_7814', date: 'Yesterday, 19:45', tier: 'Elite Annual', commission: '+$89.00', status: 'Completed' },
    { id: 'usr_6632', date: 'Sep 05, 2026', tier: 'Pro Monthly', commission: '+$19.80', status: 'Completed' },
    { id: 'usr_5510', date: 'Sep 02, 2026', tier: 'Starter Pack', commission: '+$9.90', status: 'Completed' },
  ];

  return (
    <div className="min-h-screen bg-[#F0F3FA] dark:bg-[#0B0E14] text-gray-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 text-white p-6 sm:p-10 shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-blue-100">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>PaperPulse Affiliate & Partner Program</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Earn up to 50% Lifetime Recurring Commission
            </h1>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Invite friends, traders, and communities to simulate with PaperPulse. Get paid on every active subscription and prop challenge entry.
            </p>
          </div>
          
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none">
            <Share2 className="w-80 h-80 text-white" />
          </div>
        </div>

        {/* Affiliate Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#111722] rounded-xl p-5 border border-gray-200 dark:border-white/[0.08] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">Total Earnings</span>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold font-mono text-gray-900 dark:text-white">$1,485.50</span>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +18.4% this month
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111722] rounded-xl p-5 border border-gray-200 dark:border-white/[0.08] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">Referred Traders</span>
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold font-mono text-gray-900 dark:text-white">42 Active</span>
              <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-0.5">8 signed up this week</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111722] rounded-xl p-5 border border-gray-200 dark:border-white/[0.08] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">Conversion Rate</span>
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold font-mono text-gray-900 dark:text-white">14.2%</span>
              <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-0.5">Across 296 link clicks</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111722] rounded-xl p-5 border border-gray-200 dark:border-white/[0.08] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">Available Payout</span>
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-2xl font-extrabold font-mono text-[#2563EB] dark:text-blue-400">$324.00</span>
              <button 
                type="button"
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#2563EB] text-white hover:bg-blue-700 shadow-xs cursor-pointer"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>

        {/* Share Referral Link Card */}
        <div className="bg-white dark:bg-[#111722] rounded-xl p-6 border border-gray-200 dark:border-white/[0.08] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Your Unique Referral Link</h2>
              <p className="text-xs text-gray-500 dark:text-neutral-400">Share this link with your audience or friends to automatically track signups and commissions.</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40">
              <ShieldCheck className="w-3.5 h-3.5" /> Active & Verified
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full flex-1 flex items-center bg-gray-50 dark:bg-[#161D2A] border border-gray-200 dark:border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs font-mono text-gray-800 dark:text-neutral-200">
              <span className="truncate flex-1">{referralLink}</span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Affiliate Commission Tiers */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Commission Tiers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiers.map((tier) => (
              <div 
                key={tier.name}
                className={`rounded-xl p-5 border transition-all flex flex-col justify-between space-y-4 ${
                  tier.active 
                    ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-500/50 ring-2 ring-blue-500/20' 
                    : 'bg-white dark:bg-[#111722] border-gray-200 dark:border-white/[0.08]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase">{tier.badge}</span>
                    {tier.active && <span className="w-2 h-2 rounded-full bg-[#2563EB]" />}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1">{tier.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">{tier.minUsers}</p>
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-white/[0.08]">
                  <span className="text-2xl font-extrabold font-mono text-[#2563EB] dark:text-blue-400">{tier.commission}</span>
                  <span className="text-xs text-gray-500 dark:text-neutral-400 ml-1">commission</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Referrals Table */}
        <div className="bg-white dark:bg-[#111722] rounded-xl border border-gray-200 dark:border-white/[0.08] shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-white/[0.08] flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">Recent Referral Activity</h2>
            <span className="text-xs text-gray-500 dark:text-neutral-400 font-mono">Live Tracking</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-[#161D2A] text-gray-500 dark:text-neutral-400 text-[10px] uppercase font-sans">
                  <th className="py-2.5 px-4">REFERRAL ID</th>
                  <th className="py-2.5 px-4">DATE & TIME</th>
                  <th className="py-2.5 px-4">PLAN / CHALLENGE</th>
                  <th className="py-2.5 px-4 text-right">COMMISSION</th>
                  <th className="py-2.5 px-4 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                {recentReferrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] text-gray-700 dark:text-neutral-300">
                    <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">{ref.id}</td>
                    <td className="py-3 px-4 text-gray-500 dark:text-neutral-400">{ref.date}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-sans font-semibold text-[11px]">
                        {ref.tier}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {ref.commission}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <Check className="w-3 h-3" /> {ref.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
