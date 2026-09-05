-- Migration: Add is_premium_only column to public.competitions
-- Run this in the Supabase SQL Editor

ALTER TABLE public.competitions 
ADD COLUMN IF NOT EXISTS is_premium_only BOOLEAN DEFAULT false NOT NULL;

