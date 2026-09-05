'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Check, X as CloseIcon, Crown, Sparkles, Shield, Zap, 
  HelpCircle, ArrowRight, ArrowLeft, Wallet, Trophy, CheckCircle2, ChevronDown
} from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function PricingClientPage({ user, displayName, planType = 'free' }) {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const isCurrentPlanFree = !user || planType === 'free';
  const isCurrentPlanPremium = user && planType === 'premium';

  const monthlyPrice = 19;
  const yearlyPricePerMonth = 15;
  const yearlyTotal = 180;
  const yearlySavingsPercent = 21;

  const faqs = [
    {
      q: 'Do I risk any real money when using PaperPulse?',
      a: 'No. PaperPulse is 100% simulated trading. You trade with virtual capital using live latency-matched market rates so you can learn and test strategies risk-free.'
    },
    {
      q: 'What is the difference between Free and Pro demo accounts?',
      a: 'Free users can hold up to 2 concurrent demo accounts with preset starting balances between $1,000 and $10,000. Pro users can hold up to 5 concurrent demo accounts with custom starting balances ranging from $100 up to $1,000,000.'
    },
    {
      q: 'What are Pro Exclusive Competitions?',
      a: 'Certain tournaments on PaperPulse are marked Pro Exclusive. These competitions feature higher prize pools, specialized tournament rules, and are restricted to Pro subscribers to ensure competitive fairness.'
    },
    {
      q: 'How will billing and payment work when Pro launches?',
      a: 'We are rolling out seamless payment gateways supporting Credit/Debit Cards, Google Pay/Apple Pay, and major Cryptocurrencies (via NOWPayments). Subscriptions can be canceled at any time.'
    },
    {
      q: 'Can I reset my account balance if I lose virtual funds?',
      a: 'Yes! Both Free and Pro users can reset their active demo account back to its initial configured balance at any time from Account Settings.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between">
      <Navbar userName={displayName} />

      <main className="max-w-6xl mx-auto px-6 py-12 flex-grow w-full">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#2563EB] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#2563EB]/10 text-[#2563EB] mb-4 border border-[#2563EB]/20">
            <Sparkles className="w-3.5 h-3.5" />
            Simple & Transparent Pricing
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">
            Choose the Perfect Plan for Your Trading Strategy
          </h1>
          <p className="text-sm md:text-base text-gray-600 font-normal leading-relaxed">
            Practice risk-free with live simulated market conditions, unlock custom capital limits, and compete in high-stakes trading tournaments.
          </p>

          {/* Monthly / Yearly Billing Toggle */}
          <div className="mt-8 inline-flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly Billing
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Save {yearlySavingsPercent}%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16 items-stretch">
          
          {/* FREE PLAN */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-gray-300 transition-all">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Practice Plan</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Free forever for beginner traders
                  </p>
                </div>
                {isCurrentPlanFree && user && (
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-[11px] font-semibold rounded-full border border-gray-200">
                    Your Current Plan
                  </span>
                )}
              </div>

              <div className="my-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900 font-mono">$0</span>
                  <span className="text-xs font-semibold text-gray-500">/ forever</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  No credit card required. Start trading in seconds.
                </p>
              </div>

              <div className="pt-6 border-t border-gray-100 space-y-3.5">
                <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">What's included:</p>
                
                <div className="flex items-start gap-2.5 text-xs text-gray-700 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>2 Demo Accounts</strong> concurrent limit</span>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-gray-700 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>$1,000 � $10,000</strong> starting balance presets</span>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-gray-700 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Access to <strong>Standard Competitions</strong></span>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-gray-700 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Live simulated Crypto, Stocks & Forex rates</span>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-gray-700 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Standard Take Profit & Stop Loss tools</span>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-gray-700 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Unlimited balance resets</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              {user ? (
                <button
                  disabled
                  className="w-full py-3 bg-gray-100 text-gray-500 font-semibold text-xs rounded-xl cursor-default"
                >
                  {isCurrentPlanFree ? 'Active Plan' : 'Free Tier'}
                </button>
              ) : (
                <Link
                  href="/signup"
                  className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  Get Started Free
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>

          {/* PRO PLAN */}
          <div className="relative bg-white border-2 border-[#2563EB] rounded-2xl p-8 flex flex-col justify-between shadow-[0_8px_30px_rgba(37,99,235,0.12)]">
            {/* Top Banner Tag */}
            <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Crown className="w-3 h-3 text-amber-300 fill-amber-300" />
              Most Popular
            </div>

            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-gray-900">Pro Trader</h3>
                    <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold rounded-md">
                      PRO
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Unrestricted capital & exclusive tournaments
                  </p>
                </div>
                {isCurrentPlanPremium && (
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[11px] font-bold rounded-full border border-amber-200">
                    Your Current Plan
                  </span>
                )}
              </div>

              <div className="my-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900 font-mono">
                    ${billingCycle === 'monthly' ? monthlyPrice : yearlyPricePerMonth}
                  </span>
                  <span className="text-xs font-semibold text-gray-500">/ month</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {billingCycle === 'yearly' 
                    ? `Billed annually at $${yearlyTotal}/year (Save $48/year)`
                    : 'Billed monthly. Cancel anytime with one click.'}
                </p>
              </div>

              <div className="pt-6 border-t border-gray-100 space-y-3.5">
                <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">Everything in Free, plus:</p>
                
                <div className="flex items-start gap-2.5 text-xs text-gray-900 font-semibold">
                  <Check className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                  <span><strong>Up to 5 Demo Accounts</strong> with custom names</span>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-gray-900 font-semibold">
                  <Check className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                  <span><strong>$100 � $1,000,000</strong> custom starting balance</span>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-gray-900 font-semibold">
                  <Check className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                  <span>Access to <strong>Pro Exclusive Tournaments</strong></span>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-gray-900 font-semibold">
                  <Check className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                  <span>Priority Leaderboard standing & verification badge</span>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-gray-900 font-semibold">
                  <Check className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                  <span>Multiple account rapid switching in Terminal</span>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-gray-900 font-semibold">
                  <Check className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                  <span>Priority support & early access to new features</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              {isCurrentPlanPremium ? (
                <button
                  disabled
                  className="w-full py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-default"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Current Active Plan
                </button>
              ) : (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="w-full py-3 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold text-xs rounded-xl shadow-[0_2px_4px_rgba(37,99,235,0.2)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <Crown className="w-4 h-4 text-amber-300 fill-amber-300" />
                  Upgrade to Pro
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Feature Breakdown Comparison */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-4xl mx-auto mb-16 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">
            Compare Features Side-by-Side
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-4">Feature</th>
                  <th className="py-3 px-4 text-center">Practice (Free)</th>
                  <th className="py-3 px-4 text-center text-[#2563EB]">Pro Trader</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                <tr>
                  <td className="py-3.5 px-4 text-gray-900 font-semibold">Active Demo Accounts</td>
                  <td className="py-3.5 px-4 text-center text-gray-600">2 Accounts</td>
                  <td className="py-3.5 px-4 text-center text-[#2563EB] font-bold">5 Accounts</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-gray-900 font-semibold">Starting Balance Selection</td>
                  <td className="py-3.5 px-4 text-center text-gray-600">$1K, $5K, $10K Presets</td>
                  <td className="py-3.5 px-4 text-center text-[#2563EB] font-bold">$100 � $1,000,000 + Custom</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-gray-900 font-semibold">Tournaments & Competitions</td>
                  <td className="py-3.5 px-4 text-center text-gray-600">Standard Community</td>
                  <td className="py-3.5 px-4 text-center text-[#2563EB] font-bold">All + Pro Exclusive</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-gray-900 font-semibold">Live Market Rates (Crypto/Forex/Stocks)</td>
                  <td className="py-3.5 px-4 text-center text-emerald-600">Included</td>
                  <td className="py-3.5 px-4 text-center text-emerald-600 font-bold">Included</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-gray-900 font-semibold">Balance Reset Capability</td>
                  <td className="py-3.5 px-4 text-center text-emerald-600">Unlimited</td>
                  <td className="py-3.5 px-4 text-center text-emerald-600 font-bold">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-gray-900 font-semibold">Support Tier</td>
                  <td className="py-3.5 px-4 text-center text-gray-600">Community</td>
                  <td className="py-3.5 px-4 text-center text-[#2563EB] font-bold">Priority 24/7</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto mb-12">
          <h3 className="text-xl font-bold text-gray-900 text-center mb-6">
            Frequently Asked Questions
          </h3>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs md:text-sm text-gray-900 hover:text-[#2563EB] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#2563EB]' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Upgrade Modal (Coming Soon Notice) */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-gray-200 w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <CloseIcon className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 border border-amber-500/20">
              <Crown className="w-6 h-6 fill-amber-400" />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Pro Upgrades Coming Soon!
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-5">
              We are finalizing our seamless payment integration. Automated Pro checkout with instant activation will go live in the upcoming release.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 space-y-2 text-xs text-gray-700">
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Early Access Perks
              </div>
              <p className="text-[11px] text-gray-500">
                Your interest has been registered. You will receive an exclusive early-bird discount when Pro subscriptions open.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="w-full py-2.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                Got It, Thank You
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200/60 bg-white py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-gray-500">
          <p>� {new Date().getFullYear()} PaperPulse. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
