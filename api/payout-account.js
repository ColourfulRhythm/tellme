/**
 * Save creator OPay payout account (one-time, cannot change)
 * POST body: { handle, pin, account_number, account_name }
 */
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const OPAY_BANK_CODE = '999992';
const OPAY_BANK_NAME = 'OPay';

function hashPin(p) {
  let h = 5381;
  for (let i = 0; i < p.length; i++) h = ((h << 5) + h) + p.charCodeAt(i);
  return (h >>> 0).toString(36);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Not configured' });
  }

  const { handle, pin, account_number, account_name } = req.body || {};
  const normalizedHandle = (handle || '').toLowerCase().trim();
  const accNum = String(account_number || '').replace(/\D/g, '');
  const accName = String(account_name || '').trim();

  if (!normalizedHandle || !pin || pin.length !== 4) {
    return res.status(400).json({ error: 'Handle and 4-digit PIN required' });
  }
  if (accNum.length !== 10) {
    return res.status(400).json({ error: 'OPay account number must be 10 digits' });
  }
  if (accName.length < 2) {
    return res.status(400).json({ error: 'Account name required' });
  }

  const pinHash = hashPin(pin);

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

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

  const { data: existing } = await supabase.from('payout_accounts').select('handle').eq('handle', normalizedHandle).single();
  if (existing) {
    return res.status(400).json({ error: 'Payout account already set. It cannot be changed.' });
  }

  const { error: insertErr } = await supabase.from('payout_accounts').insert({
    handle: normalizedHandle,
    bank_code: OPAY_BANK_CODE,
    bank_name: OPAY_BANK_NAME,
    account_number: accNum,
    account_name: accName,
    created_at: Date.now(),
  });

  if (insertErr) {
    if (insertErr.code === '23505') {
      return res.status(400).json({ error: 'Payout account already set.' });
    }
    return res.status(500).json({ error: 'Failed to save' });
  }
  return res.status(200).json({ success: true });
}
