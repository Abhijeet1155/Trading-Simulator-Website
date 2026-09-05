-- Migration: Create public.account_types table and add leverage/account_type columns to wallets and trades
-- Run this in your Supabase SQL Editor

-- 1. Create account_types table
CREATE TABLE IF NOT EXISTS public.account_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    min_deposit NUMERIC(12, 2) NOT NULL DEFAULT 10.00,
    min_spread NUMERIC(5, 2) NOT NULL DEFAULT 0.20,
    max_leverage INTEGER NOT NULL DEFAULT 500,
    commission TEXT NOT NULL DEFAULT 'No commission',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on account_types
ALTER TABLE public.account_types ENABLE ROW LEVEL SECURITY;

-- Allow public read access to account_types
DROP POLICY IF EXISTS "Allow select for account_types" ON public.account_types;
CREATE POLICY "Allow select for account_types" ON public.account_types
    FOR SELECT USING (true);

-- 2. Insert standard account type definitions
INSERT INTO public.account_types (id, name, description, min_deposit, min_spread, max_leverage, commission)
VALUES 
    ('standard', 'Standard', 'Ultra-low spreads with zero commission. Ideal for all traders.', 10.00, 0.20, 500, 'No commission'),
    ('standard_micro', 'Standard Micro', 'Trade micro lots with micro risk. Great for beginners.', 1.00, 0.30, 500, 'No commission'),
    ('pro', 'Pro', 'Raw spreads with institutional execution for experienced traders.', 500.00, 0.00, 500, '$3.50 / lot')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    min_deposit = EXCLUDED.min_deposit,
    min_spread = EXCLUDED.min_spread,
    max_leverage = EXCLUDED.max_leverage,
    commission = EXCLUDED.commission;

-- 3. Add account_type and leverage columns to public.wallets
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'standard';
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS leverage INTEGER DEFAULT 100;

-- 4. Add leverage column to public.trades if not exists
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS leverage NUMERIC(8, 2) DEFAULT 100.00;
