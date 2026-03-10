/**
 * Paystack Verify Transaction - for callback after payment
 * GET ?reference=xxx
 * Creates message if payment success and not already created
 */
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }
  const ref = req.query?.reference;
  if (!ref) {
    return res.status(400).json({ error: 'Missing reference' });
  }
  if (!PAYSTACK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Payment not configured' });
  }

  try {
    const r = await fetch('https://api.paystack.co/transaction/verify/' + encodeURIComponent(ref), {
      headers: { 'Authorization': 'Bearer ' + PAYSTACK_SECRET },
    });
    const data = await r.json();
    if (!data.status || data.data?.status !== 'success') {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    const metadata = data.data?.metadata || {};
    const handle = (metadata.handle || '').toLowerCase();
    const text = (metadata.text || '').trim();
    const amountNgn = parseInt(metadata.amount_ngn, 10) || 0;

    if (!handle || !text) {
      return res.status(400).json({ error: 'Invalid payment metadata' });
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { data: existing } = await supabase.from('messages').select('id').eq('paystack_ref', ref).single();
    if (existing) {
      return res.status(200).json({ success: true, already_created: true });
    }

    const { error } = await supabase.from('messages').insert({
      handle,
      text,
      is_new: true,
      created_at: Date.now(),
      amount_ngn: amountNgn,
      is_priority: true,
      paystack_ref: ref,
    });

    if (error) {
      console.error('Verify insert error:', error);
      return res.status(500).json({ error: 'Failed to save question' });
    }
    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('Verify error:', e);
    return res.status(500).json({ error: 'Verification failed' });
  }
}
