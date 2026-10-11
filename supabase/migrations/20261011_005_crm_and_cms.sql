-- Migration: 20261011_005_crm_and_cms.sql
-- Description: Schema for CRM (Customer Notes, Inquiries/Leads) and CMS (Site Content, Category configurations).

-- 1. Customer Profiles & Notes Table
CREATE TABLE IF NOT EXISTS public.customer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_key TEXT UNIQUE NOT NULL, -- normalized email or phone
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    tags TEXT[] DEFAULT '{}'::TEXT[],
    internal_notes TEXT DEFAULT '',
    total_spend_minor BIGINT DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_customer_profiles_key ON public.customer_profiles(customer_key);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_tags ON public.customer_profiles USING GIN(tags);

-- Enable RLS
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS deny_public_customer_profiles ON public.customer_profiles;
CREATE POLICY deny_public_customer_profiles ON public.customer_profiles FOR ALL USING (false);

-- 2. Customer Inquiries & Custom Gifting Leads Table
CREATE TABLE IF NOT EXISTS public.customer_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    occasion TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_discussion', 'quote_sent', 'converted', 'closed')),
    assigned_to TEXT DEFAULT 'Unassigned',
    quote_minor BIGINT,
    internal_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_customer_inquiries_status ON public.customer_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_customer_inquiries_created ON public.customer_inquiries(created_at DESC);

-- Enable RLS
ALTER TABLE public.customer_inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS deny_public_customer_inquiries ON public.customer_inquiries;
CREATE POLICY deny_public_customer_inquiries ON public.customer_inquiries FOR ALL USING (false);

-- 3. CMS Site Content & Dynamic Settings Table
CREATE TABLE IF NOT EXISTS public.site_content_settings (
    key TEXT PRIMARY KEY,
    content_json JSONB NOT NULL,
    updated_by TEXT DEFAULT 'admin',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.site_content_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS deny_public_site_content ON public.site_content_settings;
CREATE POLICY deny_public_site_content ON public.site_content_settings FOR ALL USING (false);
