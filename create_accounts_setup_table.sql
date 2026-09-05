-- Migration: Setup accounts_setup table and update wallets table with Exness-style multi-account fields
-- Run this in your Supabase SQL Editor

-- 1. Create accounts_setup table
CREATE TABLE IF NOT EXISTS public.accounts_setup (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_number TEXT UNIQUE,
    account_type TEXT NOT NULL DEFAULT 'standard',
    nickname TEXT,
    leverage INTEGER NOT NULL DEFAULT 100,
    starting_balance NUMERIC(14, 2) NOT NULL DEFAULT 10000.00,
    currency TEXT NOT NULL DEFAULT 'USD',
    execution_type TEXT NOT NULL DEFAULT 'Market',
    platform TEXT NOT NULL DEFAULT 'MT5',
    is_demo BOOLEAN NOT NULL DEFAULT true,
    balance NUMERIC(14, 2) NOT NULL DEFAULT 10000.00,
    equity NUMERIC(14, 2) NOT NULL DEFAULT 10000.00,
    margin NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on accounts_setup
ALTER TABLE public.accounts_setup ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own accounts_setup" ON public.accounts_setup;
CREATE POLICY "Users can view their own accounts_setup" ON public.accounts_setup
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own accounts_setup" ON public.accounts_setup;
CREATE POLICY "Users can insert their own accounts_setup" ON public.accounts_setup
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own accounts_setup" ON public.accounts_setup;
CREATE POLICY "Users can update their own accounts_setup" ON public.accounts_setup
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own accounts_setup" ON public.accounts_setup;
CREATE POLICY "Users can delete their own accounts_setup" ON public.accounts_setup
    FOR DELETE USING (auth.uid() = user_id);

-- 2. Update wallets table to support all new fields
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS nickname TEXT;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS account_setup_id UUID REFERENCES public.accounts_setup(id) ON DELETE SET NULL;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT true;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS execution_type TEXT DEFAULT 'Market';
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'MT5';
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'standard';
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS leverage INTEGER DEFAULT 100;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS equity NUMERIC(14, 2);
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS margin NUMERIC(14, 2) DEFAULT 0.00;

-- 3. Upsert standard account types in account_types table
INSERT INTO public.account_types (id, name, description, min_deposit, min_spread, max_leverage, commission)
VALUES 
    ('standard', 'Standard', 'Ultra-low spreads with zero commission. Ideal for all traders.', 10.00, 0.20, 500, 'No commission'),
    ('standard_cent', 'Standard Cent', 'Trade micro lots with micro risk. Great for beginners.', 1.00, 0.30, 500, 'No commission'),
    ('pro', 'Pro', 'Raw spreads with institutional execution for experienced traders.', 500.00, 0.00, 500, '$3.50 / lot'),
    ('raw_spread', 'Raw Spread', 'Lowest raw spreads with fixed low commission per lot.', 500.00, 0.00, 500, '$3.50 / lot'),
    ('zero', 'Zero', 'Zero spread on top 30 instruments with ultra-low commission.', 500.00, 0.00, 500, '$0.05 / lot')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    min_deposit = EXCLUDED.min_deposit,
    min_spread = EXCLUDED.min_spread,
    max_leverage = EXCLUDED.max_leverage,
    commission = EXCLUDED.commission;
