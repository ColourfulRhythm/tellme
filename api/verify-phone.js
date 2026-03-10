/**
 * Verify and save phone number (required before adding OPay payout account)
 * POST body: { handle, pin, phone }
 * Header: Authorization: Bearer <Supabase access_token from verifyOtp>
 * The token must be from Supabase Auth after successful phone OTP verification.
 */
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function hashPin(p) {
  let h = 5381;
  for (let i = 0; i < p.length; i++) h = ((h << 5) + h) + p.charCodeAt(i);
  return (h >>> 0).toString(36);
}

function normalizePhone(phone) {
  const s = String(phone || '').replace(/\D/g, '');
  if (s.length === 10 && s.startsWith('0')) return '+234' + s.slice(1);
  if (s.length === 11 && s.startsWith('0')) return '+234' + s.slice(1);
  if (s.length === 13 && s.startsWith('234')) return '+' + s;
  if (s.length === 10) return '+234' + s;
  return '+' + s;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Not configured' });
  }

  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) {
    return res.status(401).json({ error: 'Phone verification required. Complete OTP verification first.' });
  }

  const { handle, pin, phone } = req.body || {};
  const normalizedHandle = (handle || '').toLowerCase().trim();
  const normalizedPhone = normalizePhone(phone);

  if (!normalizedHandle || !pin || pin.length !== 4) {
    return res.status(400).json({ error: 'Handle and 4-digit PIN required' });
  }
  if (normalizedPhone.length < 10) {
    return res.status(400).json({ error: 'Valid phone number required (e.g. 08012345678 or +2348012345678)' });
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid or expired verification. Please request a new code.' });
  }
  const verifiedPhone = (user.phone || user.user_metadata?.phone || '').replace(/\D/g, '');
  const inputPhoneDigits = normalizedPhone.replace(/\D/g, '');
  const phoneMatch = verifiedPhone.endsWith(inputPhoneDigits.slice(-10)) || inputPhoneDigits.endsWith(verifiedPhone.slice(-10));
  if (!phoneMatch) {
    return res.status(401).json({ error: 'Phone number does not match verified number.' });
  }

  const pinHash = hashPin(pin);
  const { data: account, error: accErr } = await supabase
    .from('accounts')
    .select('handle, pin_hash')
    .eq('handle', normalizedHandle)
    .single();

  if (accErr || !account) {
    return res.status(404).json({ error: 'Account not found' });
  }
  if (account.pin_hash !== pinHash) {
    return res.status(401).json({ error: 'Wrong PIN' });
  }

  const { error: updateErr } = await supabase
    .from('accounts')
    .update({
      phone: normalizedPhone,
      phone_verified_at: Date.now(),
    })
    .eq('handle', normalizedHandle);

  if (updateErr) {
    return res.status(500).json({ error: 'Failed to save phone' });
  }
  return res.status(200).json({ success: true });
}
