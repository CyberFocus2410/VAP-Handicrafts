-- Migration: 20261011_003_orders_and_payments.sql
-- Description: Core tables for orders, order items, payment records, audit events, and ADR-005 stock reservations.

-- 1. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_reference TEXT NOT NULL UNIQUE, -- e.g. VAP-20261011-ABCD
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    shipping_street TEXT NOT NULL,
    shipping_city TEXT NOT NULL,
    shipping_state TEXT NOT NULL,
    shipping_pincode TEXT NOT NULL,
    shipping_country TEXT NOT NULL DEFAULT 'India',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'payment_initiated', 'paid', 'failed', 'cancelled', 'expired', 'fulfilled')),
    subtotal_minor BIGINT NOT NULL CHECK (subtotal_minor >= 0),
    shipping_minor BIGINT NOT NULL CHECK (shipping_minor >= 0),
    discount_minor BIGINT NOT NULL DEFAULT 0 CHECK (discount_minor >= 0),
    total_minor BIGINT NOT NULL CHECK (total_minor >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    access_token_hash TEXT NOT NULL, -- SHA-256 hash of random access token for guest order status lookup
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    variant_id UUID NOT NULL REFERENCES public.product_variants(id),
    product_title TEXT NOT NULL,
    variant_title TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_minor BIGINT NOT NULL CHECK (price_minor >= 0),
    subtotal_minor BIGINT NOT NULL CHECK (subtotal_minor >= 0),
    customization JSONB, -- Holds templateId, photoUploadId, licenseHolder, caption, message, etc.
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('paytm', 'simulator')),
    provider_txn_id TEXT UNIQUE,
    idempotency_key TEXT NOT NULL UNIQUE,
    amount_minor BIGINT NOT NULL CHECK (amount_minor >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'pending', 'success', 'failed', 'cancelled', 'expired')),
    raw_response JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Payment Events Table (Immutable Audit Log)
CREATE TABLE IF NOT EXISTS public.payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- e.g. 'callback_received', 'status_verified', 'amount_mismatch'
    event_payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Stock Reservations Table (ADR-005 Option A: 15-minute temporary hold)
CREATE TABLE IF NOT EXISTS public.stock_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.product_variants(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    expires_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'consumed', 'released')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_reference ON public.orders(order_reference);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_variant ON public.stock_reservations(variant_id, status);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_expiry ON public.stock_reservations(expires_at) WHERE status = 'active';

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_reservations ENABLE ROW LEVEL SECURITY;

-- Deny public access by default (all mutations happen server-side through Service Role)
DROP POLICY IF EXISTS deny_public_orders ON public.orders;
CREATE POLICY deny_public_orders ON public.orders FOR ALL USING (false);

DROP POLICY IF EXISTS deny_public_order_items ON public.order_items;
CREATE POLICY deny_public_order_items ON public.order_items FOR ALL USING (false);

DROP POLICY IF EXISTS deny_public_payments ON public.payments;
CREATE POLICY deny_public_payments ON public.payments FOR ALL USING (false);

DROP POLICY IF EXISTS deny_public_payment_events ON public.payment_events;
CREATE POLICY deny_public_payment_events ON public.payment_events FOR ALL USING (false);

DROP POLICY IF EXISTS deny_public_stock_reservations ON public.stock_reservations;
CREATE POLICY deny_public_stock_reservations ON public.stock_reservations FOR ALL USING (false);
