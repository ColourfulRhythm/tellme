/**
 * Paystack Initialize Transaction
 * POST body: { handle, text, amount_ngn }
 * Returns: { authorization_url } - redirect user to pay
 */
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const MIN_AMOUNT = 500;
const MAX_AMOUNT = 50000;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!PAYSTACK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Payment not configured' });
  }

  const { handle, text, amount_ngn } = req.body || {};
  const normalizedHandle = (handle || '').toLowerCase().trim();
  const trimmedText = (text || '').trim();
  const amount = parseInt(amount_ngn, 10);

  if (!normalizedHandle || !trimmedText) {
    return res.status(400).json({ error: 'Handle and question text required' });
  }
  if (trimmedText.length > 280) {
    return res.status(400).json({ error: 'Question max 280 characters' });
  }
  if (isNaN(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
    return res.status(400).json({ error: `Amount must be ₦${MIN_AMOUNT}-${MAX_AMOUNT}` });
  }

  const ref = 'tm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
  const amountKobo = amount * 100;

  const payload = {
    email: 'anon@tellme.ng',
    amount: amountKobo,
    reference: ref,
    currency: 'NGN',
    metadata: {
      handle: normalizedHandle,
      text: trimmedText,
      amount_ngn: amount,
    },
    callback_url: getCallbackUrl(req),
  };

  try {
    const r = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + PAYSTACK_SECRET,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await r.json();
    if (!data.status || !data.data?.authorization_url) {
      return res.status(400).json({ error: data.message || 'Paystack error' });
    }
    return res.status(200).json({
      authorization_url: data.data.authorization_url,
      reference: ref,
    });
  } catch (e) {
    console.error('Paystack initialize error:', e);
    return res.status(500).json({ error: 'Payment initialization failed' });
  }
}

function getCallbackUrl(req) {
  const host = req.headers['x-forwarded-host'] || req.headers['host'] || 'localhost:3000';
  const proto = req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const base = `${proto}://${host}`.replace(/\/$/, '');
  return base + '/tellme.html#/callback';
}
