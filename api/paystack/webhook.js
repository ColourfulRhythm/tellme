/**
 * Paystack Webhook - verifies payment and creates message
 * Configure URL in Paystack Dashboard: Settings → Webhooks
 */
import crypto from 'crypto';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }
  if (!PAYSTACK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).end();
  }

  const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(body).digest('hex');
  if (hash !== (req.headers['x-paystack-signature'] || '')) {
    return res.status(401).end();
  }

  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return res.status(400).end();
  }

  if (event.event !== 'charge.success') {
    return res.status(200).json({ received: true });
  }

  const ref = event.data?.reference;
  const metadata = event.data?.metadata || {};
  const handle = (metadata.handle || '').toLowerCase();
  const text = (metadata.text || '').trim();
  const amountNgn = parseInt(metadata.amount_ngn, 10) || 0;

  if (!ref || !handle || !text) {
    return res.status(200).json({ received: true });
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const { data: existing } = await supabase.from('messages').select('id').eq('paystack_ref', ref).single();
  if (existing) {
    return res.status(200).json({ received: true });
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
    console.error('Webhook insert error:', error);
    return res.status(500).end();
  }
  return res.status(200).json({ received: true });
}
