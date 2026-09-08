-- Migration: Add theme_preference column to public.users table
-- Supported values: 'light', 'dark', 'system'

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS theme_preference VARCHAR(20) DEFAULT 'light';

-- Comment on column
COMMENT ON COLUMN public.users.theme_preference IS 'User interface theme preference: light, dark, or system';
