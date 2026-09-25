'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { 
  Gift, Trophy, Clock, Check, Sparkles, 
  ExternalLink, ArrowRight, ShieldCheck, 
  Flame, Award, DollarSign, Star
} from 'lucide-react';

export default function GiveawayPage() {
  const [enteredGiveaways, setEnteredGiveaways] = useState({});

  const giveaways = [
    {
      id: 'gw_1',
      title: 'Free $100K Funded Challenge Account',
      prize: '$100,000 Evaluation Account',
      sponsor: 'PaperPulse Prop Partner',
      timeLeft: '2 Days : 14 Hours',
      entriesCount: 1482,
      maxWinners: 3,
      tag: 'HOT GIVEAWAY',
      requirements: ['Complete 5 Simulator Trades', 'Follow @PaperPulseApp on X']
    },
    {
      id: 'gw_2',
      title: '1-Year PaperPulse Elite Membership',
      prize: 'Annual Elite License ($499 Value)',
      sponsor: 'PaperPulse Foundation',
      timeLeft: '5 Days : 08 Hours',
      entriesCount: 890,
      maxWinners: 5,
      tag: 'COMMUNITY',
      requirements: ['Reach 60%+ Win Rate on 10 Replay Bars', 'Join Official Discord']
    },
    {
      id: 'gw_3',
      title: '$500 Crypto Trading Bonus',
      prize: '$500 USDT Direct Wallet Transfer',
      sponsor: 'Crypto Syndicate',
      timeLeft: '8 Days : 12 Hours',
      entriesCount: 2310,
      maxWinners: 2,
      tag: 'EXCLUSIVE',
      requirements: ['Log 3 Replay Trades to Journal', 'Verify Email']
    }
  ];

  const handleEnter = (id) => {
    setEnteredGiveaways(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="min-h-screen bg-[#F0F3FA] dark:bg-[#0B0E14] text-gray-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-700 text-white p-6 sm:p-10 shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-emerald-100">
              <Gift className="w-3.5 h-3.5 text-yellow-300" />
              <span>Official PaperPulse Giveaways & Rewards</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold">
              Win Funded Accounts, Cash Prizes & Elite Perks
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              Enter risk-free giveaways every week by practicing your trading strategies on the Replay Engine and engaging in community challenges.
            </p>
          </div>
          
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none">
            <Trophy className="w-80 h-80 text-white" />
          </div>
        </div>

        {/* Giveaways Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {giveaways.map((item) => {
            const hasEntered = enteredGiveaways[item.id];

            return (
              <div 
                key={item.id}
                className="bg-white dark:bg-[#111722] rounded-xl border border-gray-200 dark:border-white/[0.08] shadow-xs flex flex-col justify-between overflow-hidden hover:shadow-md transition-all"
              >
                <div>
                  {/* Card Header Tag */}
                  <div className="p-5 pb-3 flex items-center justify-between border-b border-gray-100 dark:border-white/[0.04]">
                    <span className="text-[10px] font-extrabold capitalize px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-1">
                      <Flame className="w-3 h-3" /> {item.tag}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-neutral-400 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#2563EB]" /> {item.timeLeft}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug">{item.title}</h3>
                      <p className="text-xs text-[#2563EB] dark:text-blue-400 font-semibold mt-1 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" /> Prize: {item.prize}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-white/[0.04]">
                      <span className="text-[11px] font-bold text-gray-700 dark:text-neutral-300">Entry Steps:</span>
                      <div className="space-y-1.5">
                        {item.requirements.map((req, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-gray-600 dark:text-neutral-400">
                            <span className="w-4 h-4 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span>{req}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-5 pt-3 bg-gray-50 dark:bg-[#161D2A] border-t border-gray-200 dark:border-white/[0.08] flex items-center justify-between">
                  <div className="text-[11px] text-gray-500 dark:text-neutral-400 font-mono">
                    <span className="font-bold text-gray-800 dark:text-neutral-200">{item.entriesCount + (hasEntered ? 1 : 0)}</span> total entries
                  </div>

                  <button
                    type="button"
                    disabled={hasEntered}
                    onClick={() => handleEnter(item.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      hasEntered
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-[#2563EB] hover:bg-blue-700 text-white shadow-xs'
                    }`}
                  >
                    {hasEntered ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Entered!</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Enter Giveaway</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Previous Winners Spotlight */}
        <div className="bg-white dark:bg-[#111722] rounded-xl border border-gray-200 dark:border-white/[0.08] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Recent Giveaway Winners</h2>
              <p className="text-xs text-gray-500 dark:text-neutral-400">All winner draws are provably fair and verified on-chain / public ledger.</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40">
              Verified Transparency
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {[
              { winner: '@alex_trades99', prize: '$50K Evaluation Account', date: 'Sep 01, 2026' },
              { winner: '@sarah_fx', prize: '1-Year Elite License', date: 'Aug 28, 2026' },
              { winner: '@crypto_king44', prize: '$250 USDT Reward', date: 'Aug 24, 2026' },
            ].map((w, i) => (
              <div key={i} className="p-3.5 rounded-lg bg-gray-50 dark:bg-[#161D2A] border border-gray-200 dark:border-white/[0.08] space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-900 dark:text-white">{w.winner}</span>
                  <span className="text-[10px] text-gray-400">{w.date}</span>
                </div>
                <p className="text-xs font-semibold text-[#2563EB] dark:text-blue-400">{w.prize}</p>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
