'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Mail, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = () => {
    if (!email.trim()) {
      setError('Email Address is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail()) return;

    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Failed to send reset link. Please try again.');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Logo */}
      <div className="flex justify-center mb-6">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <TrendingUp className="text-white w-4.5 h-4.5" />
          </div>
          <span className="font-semibold text-lg  text-[#111111]">PaperPulse</span>
        </Link>
      </div>

      {/* Main card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-[420px] bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-8">
        {!submitted ? (
          <>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-semibold  text-[#111111]">Reset password</h2>
              <p className="text-sm text-[#6B7280] mt-1">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-5 flex items-start gap-2.5 text-sm font-semibold text-[#DC2626] bg-[#DC2626]/10 px-4 py-3 rounded-lg border border-[#DC2626]/20 animate-fade-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-[#DC2626]" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#6B7280] capitalize ">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-[#6B7280]" />
                  <input
                    type="email"
                    placeholder="e.g. johndoe@gmail.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    className={`w-full pl-11 pr-4 py-3 bg-white border ${
                      error ? 'border-[#DC2626]' : 'border-[#E5E7EB]'
                    } rounded-lg focus:border-[#2563EB] focus:outline-none transition-all text-sm`}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all text-base mt-2 flex items-center justify-center disabled:opacity-50 gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending Reset Link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            {/* Back to Login Link */}
            <div className="mt-6 text-center border-t border-[#E5E7EB] pt-5">
              <Link href="/login" className="inline-flex items-center gap-1.5 font-semibold text-sm text-[#2563EB] hover:underline">
                <ArrowLeft className="w-4 h-4" /> Back to Log In
              </Link>
            </div>
          </>
        ) : (
          /* Confirmation Success State */
          <div className="text-center py-2">
            <div className="w-12 h-12 rounded-full bg-[#16A34A]/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6 text-[#16A34A]" />
            </div>
            <h2 className="text-xl font-semibold text-[#111111] mb-2">Check your email</h2>
            <p className="text-sm text-[#6B7280] leading-relaxed mb-6">
              If an account exists with <span className="font-semibold text-[#111111]">{email}</span>, we've sent a password reset link to your inbox.
            </p>
            <p className="text-xs text-[#9CA3AF] mb-6">
              The link is valid for 30 minutes. Be sure to check your spam or junk folder if you don't see it.
            </p>
            <Link
              href="/login"
              className="inline-flex justify-center items-center w-full py-3.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all text-sm cursor-pointer"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>

      {/* Footer copyright */}
      <div className="text-center text-xs text-[#9CA3AF] mt-8">
        &copy; {new Date().getFullYear()} PaperPulse. All rights reserved.
      </div>
    </div>
  );
}
