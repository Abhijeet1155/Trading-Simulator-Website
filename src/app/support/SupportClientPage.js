'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  HelpCircle, 
  Search, 
  MessageSquare, 
  Mail, 
  BookOpen, 
  ShieldCheck, 
  ChevronDown, 
  CheckCircle2, 
  Send, 
  Sparkles,
  ArrowLeft,
  LifeBuoy
} from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function SupportClientPage({ userName, userEmail }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const faqs = [
    {
      category: 'General & Simulator',
      question: 'How does PaperPulse simulated trading work?',
      answer: 'PaperPulse streams live real-time market data across Cryptocurrencies, Forex, and Stocks. You execute trades using simulated virtual cash with realistic fills, leverage options, margin mechanics, and take-profit/stop-loss triggers without risking real capital.'
    },
    {
      category: 'General & Simulator',
      question: 'Is real money required to trade on PaperPulse?',
      answer: 'No. All trading on PaperPulse uses practice balances. You can adjust your balance, test new strategies, or open multiple dedicated sub-accounts.'
    },
    {
      category: 'Accounts & Setup',
      question: 'How do I create multiple demo trading accounts?',
      answer: 'Navigate to Accounts from the top navigation bar. You can choose from standard, raw spread, zero, and standard cent account configurations with custom leverage up to 1:2000.'
    },
    {
      category: 'Accounts & Setup',
      question: 'Can I reset my balance if I run out of virtual funds?',
      answer: 'Yes! Go to the Accounts or Settings page and click "Reset Balance" to restore your starting balance to $10,000 and clear open positions.'
    },
    {
      category: 'Competitions & Leaderboards',
      question: 'How do competitions and tournaments work?',
      answer: 'Join any active tournament from the Competitions page. Your PnL percentage is ranked on the Leaderboard. Top rankers receive tournament badges, pro perks, and profile recognition.'
    },
    {
      category: 'Billing & Subscriptions',
      question: 'What is included in the Pro plan?',
      answer: 'Pro unlocks up to 5 concurrent trading accounts, higher custom balance limits up to $1,000,000, access to exclusive high-tier competitions, and priority live chat support.'
    }
  ];

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setContactSubject('');
      setContactMessage('');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between font-sans text-gray-800">
      <Navbar userName={userName} />

      <main className="max-w-5xl mx-auto px-6 py-10 flex-grow w-full">
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

        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#2563EB]/10 text-[#2563EB] mb-3 border border-[#2563EB]/20">
            <LifeBuoy className="w-3.5 h-3.5" />
            24/7 Help Center &amp; Support
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            How can we help you today?
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Search our knowledge base or get in touch with the PaperPulse team.
          </p>

          {/* Search Box */}
          <div className="relative max-w-xl mx-auto mt-6">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search guides, account questions, trading rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 shadow-xs transition-all"
            />
          </div>
        </div>

        {/* Quick Help Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">Trading Guides</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Learn order types, lot sizing, leverage calculation, and risk controls.
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">Account &amp; Security</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Configure account passwords, profile metadata, and multi-tier demo accounts.
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">Community &amp; FAQ</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Compete on the leaderboard and connect with fellow paper traders.
              </p>
            </div>
          </div>
        </div>

        {/* FAQs & Contact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* FAQ Accordion (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-4 h-4 text-[#2563EB]" />
              <h2 className="text-base font-bold text-gray-900">Frequently Asked Questions</h2>
            </div>

            {filteredFaqs.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-xs text-gray-500">
                No questions found matching "{searchQuery}". Try a different search term or message our support team directly.
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredFaqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all shadow-2xs"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full text-left px-5 py-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-gray-50/50"
                      >
                        <span className="text-xs font-bold text-gray-800">{faq.question}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#2563EB]' : ''}`} />
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-4 pt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-100 bg-[#FAFAFA]/50 animate-in fade-in duration-150">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Contact Support Form (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4 text-[#2563EB]" />
                <h2 className="text-base font-bold text-gray-900">Contact Support</h2>
              </div>
              <p className="text-xs text-gray-500 mb-5">
                Have an inquiry or issue? We typically reply within a few hours.
              </p>

              {submitted ? (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2 animate-in fade-in">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="text-xs font-bold text-emerald-900">Message Dispatched</h4>
                  <p className="text-[11px] text-emerald-700">
                    Thank you! Our support team has received your inquiry and will respond to {userEmail || 'your email'}.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-2 text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Your Email</label>
                    <input
                      type="email"
                      readOnly={Boolean(userEmail)}
                      defaultValue={userEmail || 'user@paperpulse.io'}
                      className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Question regarding trade execution"
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Message</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Describe your question or issue in detail..."
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Sending...' : 'Submit Support Request'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6 mt-12">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-gray-500">
          <p>© {new Date().getFullYear()} PaperPulse. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
