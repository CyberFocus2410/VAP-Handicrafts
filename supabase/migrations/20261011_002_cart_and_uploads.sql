-- Migration: 20261011_002_cart_and_uploads.sql
-- Description: Creates uploaded_assets table with strict RLS and status machine for personalized customer assets.

CREATE TABLE IF NOT EXISTS public.uploaded_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    byte_size BIGINT NOT NULL CHECK (byte_size > 0 AND byte_size <= 10485760), -- Max 10MB
    status TEXT NOT NULL CHECK (status IN ('pending', 'attached', 'archived', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for session-based lookup and orphaned upload cleanup
CREATE INDEX IF NOT EXISTS idx_uploaded_assets_session ON public.uploaded_assets(session_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_assets_status ON public.uploaded_assets(status);
CREATE INDEX IF NOT EXISTS idx_uploaded_assets_created ON public.uploaded_assets(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.uploaded_assets ENABLE ROW LEVEL SECURITY;

-- 1. Anonymous / Public users CANNOT view uploaded photos directly (prevents indexable private customer photos)
DROP POLICY IF EXISTS "Deny public select on uploaded_assets" ON public.uploaded_assets;
CREATE POLICY "Deny public select on uploaded_assets"
    ON public.uploaded_assets
    FOR SELECT
    USING (false);

-- 2. Staff / Admin users can view and manage all uploaded assets
DROP POLICY IF EXISTS "Staff full access on uploaded_assets" ON public.uploaded_assets;
CREATE POLICY "Staff full access on uploaded_assets"
    ON public.uploaded_assets
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.user_id = auth.uid()
            AND admin_users.is_active = true
        )
    );
