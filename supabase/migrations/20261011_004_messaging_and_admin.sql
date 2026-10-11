-- Migration: 20261011_004_messaging_and_admin.sql
-- Description: Transactional email outbox and admin order fulfillment fields for Phase 6.

-- 1. Email Outbox Table
CREATE TABLE IF NOT EXISTS public.email_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    recipient_email TEXT NOT NULL,
    template_type TEXT NOT NULL CHECK (template_type IN ('order_confirmation_buyer', 'order_notification_admin', 'order_shipped_buyer')),
    subject TEXT NOT NULL,
    html_body TEXT NOT NULL,
    text_body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    provider_message_id TEXT,
    retry_count INTEGER DEFAULT 0 NOT NULL,
    last_error TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_email_outbox_status ON public.email_outbox(status);
CREATE INDEX IF NOT EXISTS idx_email_outbox_order ON public.email_outbox(order_id);

-- Enable RLS
ALTER TABLE public.email_outbox ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS deny_public_email_outbox ON public.email_outbox;
CREATE POLICY deny_public_email_outbox ON public.email_outbox FOR ALL USING (false);

-- 2. Add tracking number and courier fields to orders if not present
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'tracking_number') THEN
        ALTER TABLE public.orders ADD COLUMN tracking_number TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'courier_name') THEN
        ALTER TABLE public.orders ADD COLUMN courier_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipped_at') THEN
        ALTER TABLE public.orders ADD COLUMN shipped_at TIMESTAMPTZ;
    END IF;
END $$;
