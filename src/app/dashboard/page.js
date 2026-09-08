import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  TrendingUp, User, Wallet, Award, BarChart3, 
  ArrowRight 
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { getActiveWallet } from '@/lib/activeWallet';
import { formatLotSize } from '@/lib/account';
import Navbar from '@/components/Navbar';
import OnboardingBalanceSelector from './OnboardingBalanceSelector';

export default async function DashboardPage() {
  const supabase = await createClient();

  const formatPercent = (val) => {
    if (val === 0) return '0.00%';
    if (Math.abs(val) < 0.01) {
      return `${val > 0 ? '+' : ''}${val.toFixed(4)}%`;
    }
    return `${val > 0 ? '+' : ''}${val.toFixed(2)}%`;
  };

  // 1. Resolve authenticated user from Supabase Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // 2. Resolve user details from public.users table
  const { data: dbUser } = await supabase
    .from('users')
    .select('name, email, plan_type')
    .eq('id', user.id)
    .single();

  // Fallback to auth metadata if profile is not fully replicated yet
  const displayName = dbUser?.name || user.user_metadata?.name || 'User';
  const displayEmail = dbUser?.email || user.email;
  const planType = dbUser?.plan_type || 'free';

  // 3. Resolve active wallet details
  const { activeWallet, useLocalFallback } = await getActiveWallet(user.id);
  const balance = parseFloat(activeWallet.virtual_balance || 0);
  const balanceConfigured = activeWallet.balance_configured || false;
  const initialBalance = parseFloat(activeWallet.initial_balance || 0);

  // 4. Fetch trades (with fallback support) scoped by active wallet
  let openPositionsCount = 0;
  let totalClosedPnL = 0;
  let recentTrades = [];
  let hasTrades = false;

  if (useLocalFallback) {
    // Read local_db.json
    try {
      const fs = await import('fs');
      const path = await import('path');
      const dbPath = path.join(process.cwd(), 'local_db.json');
      if (fs.existsSync(dbPath)) {
        const fileContent = fs.readFileSync(dbPath, 'utf8');
        const db = JSON.parse(fileContent);
        // Filter trades for this user and this active wallet
        const allUserTrades = (db.trades || []).filter(t => t.user_id === user.id);
        const userTrades = allUserTrades.filter(t => {
          if (activeWallet.id && t.wallet_id) {
            return t.wallet_id === activeWallet.id;
          }
          return true;
        });

        if (userTrades.length > 0) {
          hasTrades = true;
          openPositionsCount = userTrades.filter(t => t.status === 'open').length;
          totalClosedPnL = userTrades.filter(t => t.status === 'closed').reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
          recentTrades = userTrades.slice(0, 5); // Take last 5 trades
        }
      }
    } catch (err) {
      console.error('Failed to read local trades for dashboard:', err);
    }
  } else {
    // Query Supabase directly scoped by wallet_id
    try {
      let query = supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id);
      
      if (activeWallet.id) {
        query = query.eq('wallet_id', activeWallet.id);
      }
      
      const { data: dbTrades, error: tradesError } = await query.order('created_at', { ascending: false });

      if (!tradesError && dbTrades && dbTrades.length > 0) {
        hasTrades = true;
        openPositionsCount = dbTrades.filter(t => t.status === 'open').length;
        totalClosedPnL = dbTrades.filter(t => t.status === 'closed').reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
        recentTrades = dbTrades.slice(0, 5); // Take last 5 trades
      }
    } catch (err) {
      console.error('Failed to fetch trades for dashboard:', err);
    }
  }

  const pnlPercent = balance > 0 ? (totalClosedPnL / balance) * 100 : 0.00;
  const pnlIsPositive = totalClosedPnL > 0;
  const pnlIsNegative = totalClosedPnL < 0;

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#121212] text-gray-900 dark:text-neutral-100 flex flex-col justify-between transition-colors duration-200">
      <Navbar userName={displayName} />

      {/* Main Dashboard Content */}
      <main className="max-w-6xl mx-auto px-6 py-10 flex-grow w-full">
        {/* Welcome Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-semibold text-[#111111] dark:text-white">
                Welcome back, {displayName}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#E8F5E9] dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-300 border border-[#C8E6C9] dark:border-emerald-800 select-none">
                🔥 5-day streak
              </span>
            </div>
            <p className="text-sm text-[#6B7280] dark:text-neutral-400 mt-1.5 font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Virtual Balance */}
          <div className="bg-white dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.08)] hover:-translate-y-0.5 transition-all">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-semibold text-[#6B7280] dark:text-neutral-400 capitalize">Virtual Balance</span>
              <div className="p-2 bg-[#2563EB]/10 rounded-lg text-[#2563EB] dark:text-blue-400">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-[#111111] dark:text-white font-mono">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] font-semibold text-[#6B7280] dark:text-neutral-400 mt-1">
              Currency: USD
            </p>
          </div>

          {/* Active Positions */}
          <div className="bg-white dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.08)] hover:-translate-y-0.5 transition-all">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-semibold text-[#6B7280] dark:text-neutral-400 capitalize">Active Trades</span>
              <div className="p-2 bg-[#10B981]/10 rounded-lg text-[#10B981] dark:text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-[#111111] dark:text-white">
              {openPositionsCount}
            </h3>
            <p className="text-[10px] font-semibold text-green-600 dark:text-emerald-400 mt-1 flex items-center gap-0.5">
              <span>●</span> Market active
            </p>
          </div>

          {/* Closed PnL */}
          <div className="bg-white dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.08)] hover:-translate-y-0.5 transition-all">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-semibold text-[#6B7280] dark:text-neutral-400 capitalize">Total PnL (Closed)</span>
              <div className={`p-2 rounded-lg ${pnlIsNegative ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400' : 'bg-green-50 dark:bg-emerald-950/60 text-green-600 dark:text-emerald-400'}`}>
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <h3 className={`text-2xl font-semibold font-mono ${
              pnlIsPositive ? 'text-green-600 dark:text-emerald-400' : pnlIsNegative ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-neutral-400'
            }`}>
              {pnlIsPositive ? '+' : ''}${totalClosedPnL.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h3>
            <p className={`text-[10px] font-semibold mt-1 ${
              pnlIsPositive ? 'text-green-600 dark:text-emerald-400' : pnlIsNegative ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-neutral-400'
            }`}>
              {formatPercent(pnlPercent)} of balance
            </p>
          </div>

          {/* Account Plan Status */}
          <div className="bg-white dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.08)] hover:-translate-y-0.5 transition-all">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-semibold text-[#6B7280] dark:text-neutral-400 capitalize">Practice Plan</span>
              <div className="p-2 bg-[#F59E0B]/10 rounded-lg text-[#F59E0B] dark:text-amber-400">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-[#111111] dark:text-white capitalize">
              {planType}
            </h3>
            {planType === 'free' ? (
              <Link 
                href="/pricing"
                className="text-[10px] font-semibold text-[#2563EB] dark:text-blue-400 hover:text-[#1d4ed8] mt-1 inline-flex items-center gap-1 hover:underline transition-colors"
              >
                Upgrade for higher limits
                <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            ) : (
              <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                Unrestricted practice limits
              </p>
            )}
          </div>
        </div>

        {!hasTrades ? (
          /* Empty State if no trades exist yet */
          <div className="bg-white dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-2xl p-12 text-center max-w-xl mx-auto shadow-[0_2px_8px_rgba(0,0,0,0.02)] mb-8 select-none animate-fade-in transition-colors">
            <div className="w-16 h-16 bg-[#2563EB]/5 dark:bg-blue-950/40 rounded-full flex items-center justify-center text-[#2563EB] dark:text-blue-400 mx-auto mb-5 shadow-sm border border-[#2563EB]/10 dark:border-blue-900/30">
              <TrendingUp className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Trades Recorded Yet</h2>
            <p className="text-sm font-semibold text-gray-500 dark:text-neutral-400 max-w-sm mx-auto mb-6 leading-relaxed">
              Open the Trade Terminal to start practicing trading. Execute orders on live simulated crypto, stock, or forex rates.
            </p>
            <Link
              href="/trade"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold text-sm rounded-xl shadow-[0_2px_4px_rgba(37,99,235,0.1)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.2)] transition-all group"
            >
              Start Trading Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        ) : (
          /* Recent Activity Section */
          <div className="bg-white dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-[#2A2A2A] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] mb-8 max-w-4xl mx-auto transition-colors">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[#111111] dark:text-white">Recent Activity</h2>
              <Link href="/trade" className="text-xs font-semibold text-[#2563EB] dark:text-blue-400 hover:underline">
                New Trade
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-sans min-w-[650px] md:min-w-0">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-neutral-800 text-gray-400 dark:text-neutral-500 font-semibold capitalize text-[9px]">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Symbol</th>
                    <th className="py-2.5 px-3">Side</th>
                    <th className="py-2.5 px-3 text-right">Size (Lots)</th>
                    <th className="py-2.5 px-3 text-right">Entry Price</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">P&L (USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-neutral-800/60 text-gray-700 dark:text-neutral-300">
                  {recentTrades.map((t) => {
                    const isClosed = t.status === 'closed';
                    const tradePnL = parseFloat(t.pnl || 0);
                    const isUp = tradePnL >= 0;
                    
                    return (
                      <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/40">
                        <td className="py-3 px-3 font-semibold text-gray-500 dark:text-neutral-400 font-mono">
                          {new Date(t.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 font-semibold text-gray-900 dark:text-white">{t.symbol}/USDT</td>
                        <td className="py-3 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold capitalize ${
                            t.side?.toLowerCase() === 'buy' ? 'bg-[#16A34A]/10 text-[#16A34A] dark:text-emerald-400' : 'bg-[#DC2626]/10 text-[#DC2626] dark:text-red-400'
                          }`}>
                            {t.side?.charAt(0).toUpperCase() + t.side?.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono tabular-nums text-right">
                          {formatLotSize(t.quantity || t.size)}
                        </td>
                        <td className="py-3 px-3 font-mono tabular-nums text-right">
                          ${parseFloat(t.entry_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold capitalize ${
                            isClosed ? 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 border border-gray-200 dark:border-neutral-700' : 'bg-green-50 dark:bg-emerald-950/60 text-green-600 dark:text-emerald-300 border border-green-200 dark:border-emerald-800'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className={`py-3 px-3 font-mono tabular-nums text-right font-semibold ${
                          !isClosed ? 'text-gray-500 dark:text-neutral-400' : isUp ? 'text-green-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {!isClosed ? '--' : `${isUp ? '+' : ''}${tradePnL.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* If balance is not configured, show onboarding modal overlay */}
        {!balanceConfigured && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[45] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1E1E1E] border border-[#E5E7EB] dark:border-neutral-700 rounded-2xl p-2 max-w-xl w-full shadow-2xl animate-in scale-in duration-200">
              <OnboardingBalanceSelector planType={planType} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/60 dark:border-neutral-800 bg-white dark:bg-[#141414] py-6 transition-colors">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-gray-500 dark:text-neutral-400">
          <p>© {new Date().getFullYear()} PaperPulse. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
