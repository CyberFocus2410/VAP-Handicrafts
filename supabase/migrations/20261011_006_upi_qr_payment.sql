-- Migration: 20261011_006_upi_qr_payment.sql
-- Description: Add payment_proof_url, payment_utr, and 'payment_proof_submitted' status to orders.

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_proof_url TEXT,
ADD COLUMN IF NOT EXISTS payment_utr TEXT,
ADD COLUMN IF NOT EXISTS payment_proof_submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMPTZ;

-- Update status check constraint to include 'payment_proof_submitted' and 'shipped'
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'payment_initiated', 'payment_proof_submitted', 'paid', 'shipped', 'failed', 'cancelled', 'expired', 'fulfilled'));

-- Allow 'upi_qr' in payments provider check constraint if present
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_provider_check;
ALTER TABLE public.payments ADD CONSTRAINT payments_provider_check 
CHECK (provider IN ('paytm', 'simulator', 'upi_qr'));
