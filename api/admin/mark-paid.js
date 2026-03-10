/**
 * POST /api/admin/mark-paid
 * Marks all qualifying messages in a period as paid, inserts payout batch records.
 * Body: { handles: string[], periodStart: number, periodEnd: number }
 * Requires header: x-admin-secret
 */
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_SECRET = process.env.ADMIN_SECRET;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'x-admin-secret, content-type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  if (!ADMIN_SECRET || req.headers['x-admin-secret'] !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Not configured' });
  }

  const { handles, periodStart, periodEnd } = req.body || {};
  if (!Array.isArray(handles) || handles.length === 0) {
    return res.status(400).json({ error: 'handles array required' });
  }
  if (!periodStart || !periodEnd) {
    return res.status(400).json({ error: 'periodStart and periodEnd required' });
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const now = Date.now();
  const batchRef = 'PAY-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();

  // Fetch messages to mark paid (to calculate per-handle totals)
  const { data: msgs, error: fetchErr } = await supabase
    .from('messages')
    .select('id, handle, amount_ngn')
    .in('handle', handles)
    .gt('amount_ngn', 0)
    .is('paid_out_at', null)
    .gte('created_at', periodStart)
    .lt('created_at', periodEnd);

  if (fetchErr) return res.status(500).json({ error: 'Failed to fetch messages' });
  if (!msgs || msgs.length === 0) return res.status(400).json({ error: 'No qualifying messages found' });

  // Mark messages as paid
  const { error: updateErr } = await supabase
    .from('messages')
    .update({ paid_out_at: now })
    .in('handle', handles)
    .gt('amount_ngn', 0)
    .is('paid_out_at', null)
    .gte('created_at', periodStart)
    .lt('created_at', periodEnd);

  if (updateErr) return res.status(500).json({ error: 'Failed to mark messages paid' });

  // Aggregate per handle
  const handleTotals = {};
  msgs.forEach(m => {
    handleTotals[m.handle] = (handleTotals[m.handle] || 0) + (m.amount_ngn || 0);
  });

  // Insert one payout record per creator
  const payoutRecords = Object.entries(handleTotals).map(([handle, gross]) => ({
    handle,
    amount_ngn: gross,
    fee_ngn: Math.round(gross * 0.1),
    net_ngn: Math.round(gross * 0.9),
    batch_ref: batchRef,
    created_at: now,
  }));

  const { error: insertErr } = await supabase.from('payouts').insert(payoutRecords);
  if (insertErr) return res.status(500).json({ error: 'Failed to insert payout records' });

  return res.status(200).json({
    success: true,
    batchRef,
    creatorsCount: payoutRecords.length,
    totalNet: payoutRecords.reduce((s, p) => s + p.net_ngn, 0),
  });
}
