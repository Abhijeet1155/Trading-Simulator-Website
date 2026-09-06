-- Create mt_bridge table for MetaTrader sync metadata & conflict resolution
CREATE TABLE IF NOT EXISTS public.mt_bridge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE,
    account_number TEXT NOT NULL UNIQUE,
    mt4_account TEXT,
    mt5_account TEXT,
    server TEXT DEFAULT 'PaperPulse-Demo-MT5',
    balance NUMERIC(15, 2) DEFAULT 10000.00,
    equity NUMERIC(15, 2) DEFAULT 10000.00,
    margin NUMERIC(15, 2) DEFAULT 0.00,
    free_margin NUMERIC(15, 2) DEFAULT 10000.00,
    status TEXT DEFAULT 'active',
    last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.mt_bridge ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY Users can view own mt_bridge links
    ON public.mt_bridge FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY Users can update own mt_bridge links
    ON public.mt_bridge FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY Users can insert own mt_bridge links
    ON public.mt_bridge FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
