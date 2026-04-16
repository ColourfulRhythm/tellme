-- TellMe Supabase Database Setup
-- Run this SQL in your Supabase project: SQL Editor > New Query
-- Safe to re-run: uses IF NOT EXISTS / DROP POLICY IF EXISTS / CREATE OR REPLACE where needed.

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
  is_deleted BOOLEAN DEFAULT false,
  created_at BIGINT NOT NULL
);

-- Migration: add is_deleted to existing databases
-- Run this if the table already exists:
-- ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_handle ON messages(handle);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_new ON messages(is_new) WHERE is_new = true;

-- Enable Row Level Security (RLS)
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for accounts
DROP POLICY IF EXISTS "Anyone can read accounts" ON accounts;
CREATE POLICY "Anyone can read accounts" ON accounts
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can create accounts" ON accounts;
CREATE POLICY "Anyone can create accounts" ON accounts
  FOR INSERT
  WITH CHECK (true);

-- RLS Policies for messages
DROP POLICY IF EXISTS "Anyone can read messages" ON messages;
CREATE POLICY "Anyone can read messages" ON messages
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can send messages" ON messages;
CREATE POLICY "Anyone can send messages" ON messages
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Can update own messages" ON messages;
CREATE POLICY "Can update own messages" ON messages
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Can delete own messages" ON messages;
CREATE POLICY "Can delete own messages" ON messages
  FOR DELETE
  USING (true);

-- Optional: Add a function to automatically update updated_at timestamp
-- (Not needed for this app, but useful for future features)

-- ========== Random anonymous chat (dashboard tab) ==========
-- Pair logged-in users by handle; messages never show the other person's handle in the UI.
-- Access is only through SECURITY DEFINER RPCs (RLS enabled, no policies for anon).

CREATE TABLE IF NOT EXISTS random_chat_queue (
  handle TEXT PRIMARY KEY REFERENCES accounts(handle) ON DELETE CASCADE,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS random_chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_handle TEXT NOT NULL REFERENCES accounts(handle) ON DELETE CASCADE,
  user_b_handle TEXT NOT NULL REFERENCES accounts(handle) ON DELETE CASCADE,
  created_at BIGINT NOT NULL,
  closed_at BIGINT,
  CONSTRAINT random_chat_distinct CHECK (user_a_handle <> user_b_handle)
);

CREATE INDEX IF NOT EXISTS idx_random_chat_rooms_open
  ON random_chat_rooms (user_a_handle, user_b_handle)
  WHERE closed_at IS NULL;

CREATE TABLE IF NOT EXISTS random_chat_messages (
  id BIGSERIAL PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES random_chat_rooms(id) ON DELETE CASCADE,
  sender_handle TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_random_chat_messages_room ON random_chat_messages (room_id, created_at);

ALTER TABLE random_chat_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE random_chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE random_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.tm_match_random_chat(p_handle TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  h TEXT := lower(trim(p_handle));
  r RECORD;
  peer TEXT;
  new_id UUID;
  now_ms BIGINT;
BEGIN
  IF h IS NULL OR length(h) < 2 THEN
    RETURN jsonb_build_object('error', 'invalid_handle');
  END IF;

  now_ms := (EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT;

  SELECT id, user_a_handle, user_b_handle INTO r
  FROM random_chat_rooms
  WHERE closed_at IS NULL AND (user_a_handle = h OR user_b_handle = h)
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'status', 'matched',
      'room_id', r.id,
      'slot', CASE WHEN r.user_a_handle = h THEN 1 ELSE 2 END
    );
  END IF;

  DELETE FROM random_chat_queue WHERE created_at < now_ms - 120000;
  DELETE FROM random_chat_queue WHERE handle = h;

  SELECT q.handle INTO peer
  FROM random_chat_queue q
  WHERE q.handle <> h
  ORDER BY q.created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF peer IS NOT NULL THEN
    DELETE FROM random_chat_queue WHERE handle = peer;
    new_id := gen_random_uuid();
    INSERT INTO random_chat_rooms (id, user_a_handle, user_b_handle, created_at)
    VALUES (new_id, peer, h, now_ms);
    RETURN jsonb_build_object('status', 'matched', 'room_id', new_id, 'slot', 2);
  END IF;

  INSERT INTO random_chat_queue (handle, created_at)
  VALUES (h, now_ms)
  ON CONFLICT (handle) DO UPDATE SET created_at = EXCLUDED.created_at;

  RETURN jsonb_build_object('status', 'waiting');
END;
$$;

CREATE OR REPLACE FUNCTION public.tm_leave_random_chat(p_handle TEXT, p_room UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  h TEXT := lower(trim(p_handle));
BEGIN
  DELETE FROM random_chat_queue WHERE handle = h;
  IF p_room IS NOT NULL THEN
    UPDATE random_chat_rooms
    SET closed_at = (EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT
    WHERE id = p_room AND closed_at IS NULL
      AND (user_a_handle = h OR user_b_handle = h);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.tm_random_chat_fetch(p_handle TEXT, p_room UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  h TEXT := lower(trim(p_handle));
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM random_chat_rooms
    WHERE id = p_room AND closed_at IS NULL
      AND (user_a_handle = h OR user_b_handle = h)
  ) THEN
    IF EXISTS (
      SELECT 1 FROM random_chat_rooms
      WHERE id = p_room AND (user_a_handle = h OR user_b_handle = h)
    ) THEN
      RETURN jsonb_build_object('ok', false, 'closed', true);
    END IF;
    RETURN jsonb_build_object('ok', false, 'closed', true, 'gone', true);
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'closed', false,
    'messages', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', sub.id,
          'sender_handle', sub.sender_handle,
          'body', sub.body,
          'created_at', sub.created_at
        ) ORDER BY sub.created_at
      )
      FROM (
        SELECT id, sender_handle, body, created_at
        FROM random_chat_messages
        WHERE room_id = p_room
        ORDER BY created_at ASC
        LIMIT 200
      ) sub
    ), '[]'::jsonb)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.tm_random_chat_send(p_handle TEXT, p_room UUID, p_body TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  h TEXT := lower(trim(p_handle));
  b TEXT := trim(p_body);
  now_ms BIGINT;
BEGIN
  now_ms := (EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT;
  IF length(b) < 1 OR length(b) > 2000 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'bad_body');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM random_chat_rooms
    WHERE id = p_room AND closed_at IS NULL
      AND (user_a_handle = h OR user_b_handle = h)
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_in_room');
  END IF;

  INSERT INTO random_chat_messages (room_id, sender_handle, body, created_at)
  VALUES (p_room, h, b, now_ms);

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.tm_match_random_chat(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tm_leave_random_chat(TEXT, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tm_random_chat_fetch(TEXT, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tm_random_chat_send(TEXT, UUID, TEXT) TO anon, authenticated;

