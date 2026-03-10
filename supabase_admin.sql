-- TellMe Admin: Run this in Supabase SQL Editor AFTER supabase_setup.sql and supabase_payments.sql

-- Track payout status per message
ALTER TABLE messages ADD COLUMN IF NOT EXISTS paid_out_at BIGINT DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_paid_out ON messages(paid_out_at) WHERE paid_out_at IS NULL;

-- Payout batches log
CREATE TABLE IF NOT EXISTS payouts (
  id BIGSERIAL PRIMARY KEY,
  handle TEXT NOT NULL REFERENCES accounts(handle) ON DELETE CASCADE,
  amount_ngn INT NOT NULL,
  fee_ngn INT NOT NULL,
  net_ngn INT NOT NULL,
  batch_ref TEXT NOT NULL,
  created_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payouts_handle ON payouts(handle);
CREATE INDEX IF NOT EXISTS idx_payouts_created ON payouts(created_at DESC);

ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write payouts (no public access)
CREATE POLICY "Service role only on payouts" ON payouts
  USING (false);
