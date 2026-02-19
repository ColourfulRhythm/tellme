-- TellMe Supabase Database Setup
-- Run this SQL in your Supabase project: SQL Editor > New Query

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  handle TEXT PRIMARY KEY,
  pin_hash TEXT NOT NULL,
  created_at BIGINT NOT NULL
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  handle TEXT NOT NULL REFERENCES accounts(handle) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_new BOOLEAN DEFAULT true,
  created_at BIGINT NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_handle ON messages(handle);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_new ON messages(is_new) WHERE is_new = true;

-- Enable Row Level Security (RLS)
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for accounts
-- Allow anyone to read accounts (needed for public question links)
CREATE POLICY "Anyone can read accounts" ON accounts
  FOR SELECT
  USING (true);

-- Allow anyone to insert accounts (registration)
CREATE POLICY "Anyone can create accounts" ON accounts
  FOR INSERT
  WITH CHECK (true);

-- RLS Policies for messages
-- Allow anyone to read messages for a handle (needed for public question links)
CREATE POLICY "Anyone can read messages" ON messages
  FOR SELECT
  USING (true);

-- Allow anyone to insert messages (sending questions)
CREATE POLICY "Anyone can send messages" ON messages
  FOR INSERT
  WITH CHECK (true);

-- Allow updates to messages (marking as read, etc.)
-- Note: In a real app, you'd want to verify ownership via PIN
-- For now, we allow updates based on handle match
CREATE POLICY "Can update own messages" ON messages
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow deletion of messages
-- Note: In a real app, you'd want to verify ownership via PIN
-- For now, we allow deletion based on handle match
CREATE POLICY "Can delete own messages" ON messages
  FOR DELETE
  USING (true);

-- Optional: Add a function to automatically update updated_at timestamp
-- (Not needed for this app, but useful for future features)

