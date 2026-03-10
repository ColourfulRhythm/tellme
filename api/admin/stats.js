/**
 * GET /api/admin/stats
 * Returns full platform stats for admin dashboard.
 * Requires header: x-admin-secret
 */
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_SECRET = process.env.ADMIN_SECRET;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'x-admin-secret, content-type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  if (!ADMIN_SECRET || req.headers['x-admin-secret'] !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Not configured' });
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Run all queries in parallel
  const [
    { count: totalUsers },
    { count: totalMessages },
    { data: allMessages },
    { data: accounts },
    { data: payoutAccounts },
    { data: payoutHistory },
    { data: recentPaid },
  ] = await Promise.all([
    supabase.from('accounts').select('*', { count: 'exact', head: true }),
    supabase.from('messages').select('*', { count: 'exact', head: true }),
    supabase.from('messages').select('id,handle,text,amount_ngn,paid_out_at,created_at').order('created_at', { ascending: false }),
    supabase.from('accounts').select('handle,created_at').order('created_at', { ascending: false }),
    supabase.from('payout_accounts').select('handle,account_number,account_name'),
    supabase.from('payouts').select('*').order('created_at', { ascending: false }),
    supabase.from('messages').select('id,handle,text,amount_ngn,created_at').gt('amount_ngn', 0).order('created_at', { ascending: false }).limit(50),
  ]);

  const msgs = allMessages || [];
  const paidMsgs = msgs.filter(m => (m.amount_ngn || 0) > 0);
  const totalRevenue = paidMsgs.reduce((s, m) => s + (m.amount_ngn || 0), 0);
  const totalPaidOut = (payoutHistory || []).reduce((s, p) => s + (p.net_ngn || 0), 0);
  const pendingPool = Math.round(paidMsgs.filter(m => !m.paid_out_at).reduce((s, m) => s + (m.amount_ngn || 0), 0) * 0.9);

  // Payout period: last 22nd → next 22nd
  const now = new Date();
  let periodStart = new Date(now.getFullYear(), now.getMonth(), 22);
  if (now.getDate() < 22) periodStart.setMonth(periodStart.getMonth() - 1);
  let periodEnd = new Date(periodStart);
  periodEnd.setMonth(periodEnd.getMonth() + 1);
  const periodStartMs = periodStart.getTime();
  const periodEndMs = periodEnd.getTime();

  // Unpaid paid messages in current period
  const periodMsgs = paidMsgs.filter(m =>
    !m.paid_out_at &&
    (m.created_at >= periodStartMs) &&
    (m.created_at < periodEndMs)
  );

  // Build payout account map
  const paMap = {};
  (payoutAccounts || []).forEach(pa => { paMap[pa.handle] = pa; });

  // Group period messages by creator
  const payoutMap = {};
  periodMsgs.forEach(m => {
    payoutMap[m.handle] = (payoutMap[m.handle] || 0) + (m.amount_ngn || 0);
  });

  const payoutCreators = Object.entries(payoutMap).map(([handle, gross]) => {
    const fee = Math.round(gross * 0.1);
    const net = gross - fee;
    const pa = paMap[handle];
    let status = 'Ready';
    if (!pa) status = 'No account';
    else if (net < 5000) status = 'Below min';
    return { handle, accountName: pa?.account_name || null, accountNumber: pa?.account_number || null, gross, fee, net, status };
  }).sort((a, b) => b.gross - a.gross);

  // Build creator stats
  const msgsByHandle = {};
  msgs.forEach(m => {
    if (!msgsByHandle[m.handle]) msgsByHandle[m.handle] = [];
    msgsByHandle[m.handle].push(m);
  });

  const creators = (accounts || []).map(a => {
    const hMsgs = msgsByHandle[a.handle] || [];
    const hPaid = hMsgs.filter(m => (m.amount_ngn || 0) > 0);
    const allTimeEarned = hPaid.reduce((s, m) => s + (m.amount_ngn || 0), 0);
    const unpaidBalance = Math.round(hPaid.filter(m => !m.paid_out_at).reduce((s, m) => s + (m.amount_ngn || 0), 0) * 0.9);
    const pa = paMap[a.handle];
    return {
      handle: a.handle,
      joined: a.created_at,
      totalMessages: hMsgs.length,
      paidCount: hPaid.length,
      allTimeEarned,
      unpaidBalance,
      accountName: pa?.account_name || null,
      accountNumber: pa?.account_number || null,
      hasPayout: !!pa,
      paidMsgs: hPaid.map(m => ({ id: m.id, text: m.text, amount: m.amount_ngn, date: m.created_at, paidOutAt: m.paid_out_at })),
    };
  });

  // Format payout history — group by batch_ref
  const batchMap = {};
  (payoutHistory || []).forEach(p => {
    if (!batchMap[p.batch_ref]) {
      batchMap[p.batch_ref] = { date: p.created_at, reference: p.batch_ref, items: [] };
    }
    batchMap[p.batch_ref].items.push({ handle: p.handle, amount: p.net_ngn });
  });
  const payoutsGrouped = Object.values(batchMap).sort((a, b) => b.date - a.date);

  return res.status(200).json({
    overview: {
      totalUsers: totalUsers || 0,
      totalMessages: totalMessages || 0,
      paidMessages: paidMsgs.length,
      totalRevenue,
      platformFee: Math.round(totalRevenue * 0.1),
      totalPaidOut,
      pendingPool,
    },
    payoutPeriod: {
      start: periodStartMs,
      end: periodEndMs,
      creators: payoutCreators,
    },
    creators,
    payouts: payoutsGrouped,
    recentActivity: (recentPaid || []).map(m => ({
      id: m.id, handle: m.handle, text: m.text, amount: m.amount_ngn, date: m.created_at,
    })),
  });
}
