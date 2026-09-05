-- Migration: Add leverage column to public.trades table
-- Run this script in your Supabase SQL Editor

ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS leverage NUMERIC(8, 2) DEFAULT 100.00;

-- Backfill existing trades with default 100 leverage if null
UPDATE public.trades
SET leverage = 100.00
WHERE leverage IS NULL;
