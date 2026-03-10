-- TellMe Payments: Run this SQL in Supabase after supabase_setup.sql
-- Adds payment support: priority questions, creator earnings, OPay payout

-- Phone verification (required before adding payout account)
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS phone_verified_at BIGINT;

-- Add payment columns to messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS amount_ngn INT DEFAULT 0;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_priority BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS paystack_ref TEXT;

-- Payout accounts: OPay only, account number + name (locked after save)
CREATE TABLE IF NOT EXISTS payout_accounts (
  handle TEXT PRIMARY KEY REFERENCES accounts(handle) ON DELETE CASCADE,
  bank_code TEXT NOT NULL DEFAULT '999992',
  bank_name TEXT NOT NULL DEFAULT 'OPay',
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  created_at BIGINT NOT NULL
);

-- RLS for payout_accounts
ALTER TABLE payout_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read payout_accounts" ON payout_accounts
  FOR SELECT USING (true);

-- Only allow insert (no update - once set, can't change)
CREATE POLICY "Anyone can insert payout_account" ON payout_accounts
  FOR INSERT WITH CHECK (true);
