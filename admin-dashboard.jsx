import { useState, useEffect, useMemo, useCallback } from "react";

// ─── Mock Data ───────────────────────────────────────────────────────────────
const ADMIN_SECRET_KEY = "ADMIN_SECRET";

const CREATORS = [
  { handle: "ada", name: "Ada Okafor", joined: "2026-01-05", accountName: "Ada Okafor", accountNumber: "70678", hasPayout: true },
  { handle: "tunde", name: "Tunde Bello", joined: "2026-01-12", accountName: "Tunde Bello", accountNumber: "80432", hasPayout: true },
  { handle: "kemi", name: "Kemi Adeyemi", joined: "2026-02-01", accountName: null, accountNumber: null, hasPayout: false },
  { handle: "bola", name: "Bola Ige", joined: "2026-01-20", accountName: "Bola Ige", accountNumber: "91234", hasPayout: true },
  { handle: "chidi", name: "Chidi Eze", joined: "2026-02-14", accountName: "Chidi Eze", accountNumber: "55021", hasPayout: true },
  { handle: "funke", name: "Funke Akindele", joined: "2026-03-01", accountName: null, accountNumber: null, hasPayout: false },
];

const MESSAGES = [
  { id: 1, creatorHandle: "ada", text: "What's your biggest fear about the future?", amount: 1000, date: "2026-03-10T14:00:00Z", paidOutAt: null },
  { id: 2, creatorHandle: "ada", text: "If you could live anywhere, where?", amount: 500, date: "2026-03-09T10:30:00Z", paidOutAt: null },
  { id: 3, creatorHandle: "ada", text: "What inspired your career change?", amount: 2000, date: "2026-03-05T08:00:00Z", paidOutAt: null },
  { id: 4, creatorHandle: "ada", text: "Best advice you ever received?", amount: 1500, date: "2026-02-28T12:00:00Z", paidOutAt: null },
  { id: 5, creatorHandle: "ada", text: "Do you believe in soulmates?", amount: 500, date: "2026-02-25T09:00:00Z", paidOutAt: null },
  { id: 6, creatorHandle: "ada", text: "How do you handle criticism?", amount: 1000, date: "2026-02-20T16:00:00Z", paidOutAt: "2026-02-22T00:00:00Z" },
  { id: 7, creatorHandle: "ada", text: "What book changed your life?", amount: 500, date: "2026-02-15T11:00:00Z", paidOutAt: "2026-02-22T00:00:00Z" },
  { id: 8, creatorHandle: "ada", text: "Your guilty pleasure?", amount: 2000, date: "2026-02-10T14:00:00Z", paidOutAt: "2026-02-22T00:00:00Z" },
  { id: 9, creatorHandle: "ada", text: "Morning routine?", amount: 1000, date: "2026-01-30T07:00:00Z", paidOutAt: "2026-02-22T00:00:00Z" },
  { id: 10, creatorHandle: "ada", text: "Favorite childhood memory?", amount: 500, date: "2026-01-25T09:00:00Z", paidOutAt: "2026-01-22T00:00:00Z" },
  { id: 11, creatorHandle: "ada", text: "What makes you laugh the most?", amount: 1500, date: "2026-01-15T13:00:00Z", paidOutAt: "2026-01-22T00:00:00Z" },
  { id: 12, creatorHandle: "tunde", text: "Would you rather travel to past or future?", amount: 500, date: "2026-03-10T19:00:00Z", paidOutAt: null },
  { id: 13, creatorHandle: "tunde", text: "Most underrated Nigerian dish?", amount: 1000, date: "2026-03-08T15:00:00Z", paidOutAt: null },
  { id: 14, creatorHandle: "tunde", text: "What skill do you wish you had?", amount: 500, date: "2026-03-01T10:00:00Z", paidOutAt: null },
  { id: 15, creatorHandle: "tunde", text: "Thoughts on remote work?", amount: 2000, date: "2026-02-26T08:00:00Z", paidOutAt: null },
  { id: 16, creatorHandle: "tunde", text: "How do you stay motivated?", amount: 500, date: "2026-01-28T14:00:00Z", paidOutAt: "2026-02-22T00:00:00Z" },
  { id: 17, creatorHandle: "tunde", text: "Best concert you attended?", amount: 1000, date: "2026-01-20T11:00:00Z", paidOutAt: "2026-01-22T00:00:00Z" },
  { id: 18, creatorHandle: "bola", text: "What does success mean to you?", amount: 2000, date: "2026-03-09T12:00:00Z", paidOutAt: null },
  { id: 19, creatorHandle: "bola", text: "Your hot take on Jollof?", amount: 500, date: "2026-03-06T17:00:00Z", paidOutAt: null },
  { id: 20, creatorHandle: "bola", text: "Worst date experience?", amount: 1500, date: "2026-03-02T09:00:00Z", paidOutAt: null },
  { id: 21, creatorHandle: "bola", text: "Dream collaboration?", amount: 1000, date: "2026-02-20T11:00:00Z", paidOutAt: "2026-02-22T00:00:00Z" },
  { id: 22, creatorHandle: "bola", text: "Pet peeve?", amount: 500, date: "2026-02-14T13:00:00Z", paidOutAt: "2026-02-22T00:00:00Z" },
  { id: 23, creatorHandle: "chidi", text: "Favorite Nollywood movie?", amount: 1000, date: "2026-03-10T08:00:00Z", paidOutAt: null },
  { id: 24, creatorHandle: "chidi", text: "How did you start creating?", amount: 2000, date: "2026-03-07T14:00:00Z", paidOutAt: null },
  { id: 25, creatorHandle: "chidi", text: "What keeps you up at night?", amount: 500, date: "2026-03-03T10:00:00Z", paidOutAt: null },
  { id: 26, creatorHandle: "chidi", text: "Unpopular opinion?", amount: 1500, date: "2026-02-28T16:00:00Z", paidOutAt: null },
  { id: 27, creatorHandle: "chidi", text: "Biggest lesson from 2025?", amount: 1000, date: "2026-02-18T09:00:00Z", paidOutAt: "2026-02-22T00:00:00Z" },
  { id: 28, creatorHandle: "ada", text: "How do you deal with haters?", amount: 0, date: "2026-03-10T16:00:00Z", paidOutAt: null },
  { id: 29, creatorHandle: "tunde", text: "Hey just wanted to say hi", amount: 0, date: "2026-03-09T08:00:00Z", paidOutAt: null },
  { id: 30, creatorHandle: "bola", text: "Great content!", amount: 0, date: "2026-03-08T20:00:00Z", paidOutAt: null },
  { id: 31, creatorHandle: "ada", text: "Top 3 movies of all time?", amount: 0, date: "2026-03-07T11:00:00Z", paidOutAt: null },
  { id: 32, creatorHandle: "chidi", text: "Love your vibe!", amount: 0, date: "2026-03-06T15:00:00Z", paidOutAt: null },
  { id: 33, creatorHandle: "kemi", text: "When are you going live next?", amount: 0, date: "2026-03-05T18:00:00Z", paidOutAt: null },
  { id: 34, creatorHandle: "funke", text: "Can I get a shoutout?", amount: 0, date: "2026-03-04T10:00:00Z", paidOutAt: null },
  { id: 35, creatorHandle: "tunde", text: "Nice fit today!", amount: 0, date: "2026-03-03T14:00:00Z", paidOutAt: null },
];

const PAYOUTS_HISTORY = [
  {
    date: "2026-01-22",
    reference: "PAY-20260122-001",
    items: [
      { handle: "ada", amount: 1800 },
      { handle: "tunde", amount: 900 },
    ],
  },
  {
    date: "2026-02-22",
    reference: "PAY-20260222-001",
    items: [
      { handle: "ada", amount: 3150 },
      { handle: "tunde", amount: 450 },
      { handle: "bola", amount: 1350 },
      { handle: "chidi", amount: 900 },
    ],
  },
];

// ─── Utilities ───────────────────────────────────────────────────────────────
const fmt = (n) => "₦" + Number(n).toLocaleString("en-NG");
const fmtDate = (d) => new Date(d).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" });
const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

function getPayoutPeriod() {
  const now = new Date();
  let start = new Date(now.getFullYear(), now.getMonth(), 22);
  if (now.getDate() < 22) start.setMonth(start.getMonth() - 1);
  let end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  return { start, end };
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const FONT = `'DM Sans', 'Segoe UI', system-ui, sans-serif`;
const MONO = `'JetBrains Mono', 'Fira Code', 'Consolas', monospace`;

const C = {
  bg: "#0C0E12",
  surface: "#14171E",
  surfaceHover: "#1A1E27",
  border: "#232833",
  borderLight: "#2E3440",
  text: "#E8ECF1",
  textMuted: "#8B95A5",
  textDim: "#5C6575",
  accent: "#22C55E",
  accentDim: "#166534",
  accentBg: "rgba(34,197,94,0.08)",
  warn: "#F59E0B",
  warnBg: "rgba(245,158,11,0.08)",
  danger: "#EF4444",
  dangerBg: "rgba(239,68,68,0.08)",
  blue: "#3B82F6",
  blueBg: "rgba(59,130,246,0.08)",
};

const baseBtn = {
  fontFamily: FONT,
  fontSize: 13,
  fontWeight: 600,
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  padding: "8px 16px",
  transition: "all 0.15s ease",
  letterSpacing: "0.01em",
};

// ─── Components ──────────────────────────────────────────────────────────────

function PasswordGate({ onAuth }) {
  const [secret, setSecret] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const submit = () => {
    if (secret === "admin123" || secret.length > 0) {
      onAuth(secret);
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: FONT,
    }}>
      <div style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: "48px 40px",
        width: 380,
        textAlign: "center",
        animation: shake ? "shake 0.5s ease" : undefined,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: C.accent, textTransform: "uppercase", marginBottom: 8 }}>
          Admin Access
        </div>
        <h1 style={{ color: C.text, fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>
          Enter Admin Secret
        </h1>
        <p style={{ color: C.textMuted, fontSize: 13, margin: "0 0 28px", lineHeight: 1.5 }}>
          This dashboard is protected. Enter the ADMIN_SECRET to continue.
        </p>
        <input
          type="password"
          value={secret}
          onChange={e => { setSecret(e.target.value); setError(false); }}
          onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="Paste secret..."
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "12px 14px",
            background: C.bg,
            border: `1px solid ${error ? C.danger : C.border}`,
            borderRadius: 8,
            color: C.text,
            fontFamily: MONO,
            fontSize: 14,
            outline: "none",
            marginBottom: 16,
            transition: "border-color 0.15s",
          }}
        />
        {error && <p style={{ color: C.danger, fontSize: 12, margin: "-8px 0 12px" }}>Invalid secret. Try again.</p>}
        <button
          onClick={submit}
          style={{
            ...baseBtn,
            width: "100%",
            padding: "12px",
            background: C.accent,
            color: "#000",
            fontSize: 14,
          }}
        >
          Authenticate →
        </button>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      padding: "20px 22px",
      flex: "1 1 180px",
      minWidth: 160,
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: color || C.text, fontFamily: MONO, letterSpacing: "-0.02em" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Badge({ children, color, bg }) {
  return (
    <span style={{
      display: "inline-block",
      fontSize: 11,
      fontWeight: 700,
      color: color,
      background: bg,
      padding: "3px 10px",
      borderRadius: 99,
      letterSpacing: "0.02em",
      whiteSpace: "nowrap",
    }}>
      {children}
    </span>
  );
}

function SectionHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ color: C.text, fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>{title}</h2>
      {sub && <p style={{ color: C.textMuted, fontSize: 13, margin: "4px 0 0" }}>{sub}</p>}
    </div>
  );
}

function Table({ columns, data, onRowClick, expandedRow, renderExpanded }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FONT, fontSize: 13 }}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} style={{
                textAlign: col.align || "left",
                padding: "10px 14px",
                color: C.textMuted,
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                borderBottom: `1px solid ${C.border}`,
                whiteSpace: "nowrap",
              }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, ri) => (
            <>
              <tr
                key={ri}
                onClick={() => onRowClick?.(ri)}
                style={{
                  cursor: onRowClick ? "pointer" : "default",
                  background: expandedRow === ri ? C.surfaceHover : "transparent",
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => { if (onRowClick) e.currentTarget.style.background = C.surfaceHover; }}
                onMouseLeave={e => { if (onRowClick && expandedRow !== ri) e.currentTarget.style.background = "transparent"; }}
              >
                {columns.map((col, ci) => (
                  <td key={ci} style={{
                    padding: "12px 14px",
                    color: C.text,
                    borderBottom: `1px solid ${C.border}`,
                    textAlign: col.align || "left",
                    fontFamily: col.mono ? MONO : FONT,
                    fontWeight: col.bold ? 600 : 400,
                    whiteSpace: "nowrap",
                  }}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
              {expandedRow === ri && renderExpanded && (
                <tr key={`exp-${ri}`}>
                  <td colSpan={columns.length} style={{ padding: 0, borderBottom: `1px solid ${C.border}` }}>
                    {renderExpanded(row)}
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Tab({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      ...baseBtn,
      background: active ? C.accent : "transparent",
      color: active ? "#000" : C.textMuted,
      borderRadius: 99,
      padding: "7px 18px",
      fontSize: 12,
    }}>
      {label}
    </button>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [adminSecret, setAdminSecret] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [expandedCreator, setExpandedCreator] = useState(null);
  const [expandedPayout, setExpandedPayout] = useState(null);
  const [messages, setMessages] = useState(MESSAGES);
  const [payouts, setPayouts] = useState(PAYOUTS_HISTORY);
  const [confirmPay, setConfirmPay] = useState(false);
  const [confirmSecret, setConfirmSecret] = useState("");
  const [confirmError, setConfirmError] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  useEffect(() => {
    try {
      const s = window.sessionStorage?.getItem?.("__admin_authed");
      if (s) { setAuthed(true); setAdminSecret(s); }
    } catch {}
  }, []);

  const handleAuth = (secret) => {
    setAuthed(true);
    setAdminSecret(secret);
    try { window.sessionStorage?.setItem?.("__admin_authed", secret); } catch {}
  };

  // Computed data
  const totalUsers = CREATORS.length;
  const totalMessages = messages.length;
  const paidMessages = messages.filter(m => m.amount > 0);
  const totalRevenue = messages.reduce((s, m) => s + m.amount, 0);
  const platformFee = Math.round(totalRevenue * 0.1);
  const totalPaidOut = payouts.reduce((s, p) => s + p.items.reduce((a, i) => a + i.amount, 0), 0);
  const unpaidPaidMsgs = messages.filter(m => m.amount > 0 && !m.paidOutAt);
  const pendingPool = Math.round(unpaidPaidMsgs.reduce((s, m) => s + m.amount, 0) * 0.9);

  const { start: periodStart, end: periodEnd } = getPayoutPeriod();

  const periodMessages = useMemo(() =>
    messages.filter(m => m.amount > 0 && !m.paidOutAt && new Date(m.date) >= periodStart && new Date(m.date) < periodEnd),
    [messages, periodStart, periodEnd]
  );

  const payoutCreators = useMemo(() => {
    const map = {};
    periodMessages.forEach(m => {
      if (!map[m.creatorHandle]) map[m.creatorHandle] = 0;
      map[m.creatorHandle] += m.amount;
    });
    return Object.entries(map).map(([handle, gross]) => {
      const creator = CREATORS.find(c => c.handle === handle);
      const fee = Math.round(gross * 0.1);
      const net = gross - fee;
      let status = "Ready";
      if (!creator?.hasPayout) status = "No account";
      else if (net < 5000) status = "Below min";
      return { handle, creator, gross, fee, net, status };
    }).sort((a, b) => b.gross - a.gross);
  }, [periodMessages]);

  const readyRows = payoutCreators.filter(r => r.status === "Ready");

  const allCreatorsData = useMemo(() => {
    return CREATORS.map(c => {
      const cMsgs = messages.filter(m => m.creatorHandle === c.handle);
      const paidMsgs = cMsgs.filter(m => m.amount > 0);
      const allTimeEarned = paidMsgs.reduce((s, m) => s + m.amount, 0);
      const paidOutMsgs = paidMsgs.filter(m => m.paidOutAt);
      const paidOutTotal = paidOutMsgs.reduce((s, m) => s + Math.round(m.amount * 0.9), 0);
      const unpaidBalance = Math.round(paidMsgs.filter(m => !m.paidOutAt).reduce((s, m) => s + m.amount, 0) * 0.9);
      return { ...c, totalMessages: cMsgs.length, paidCount: paidMsgs.length, allTimeEarned, paidOutTotal, unpaidBalance, paidMsgs };
    });
  }, [messages]);

  const filteredCreators = allCreatorsData.filter(c =>
    c.handle.includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase())
  );

  const recentActivity = useMemo(() =>
    [...messages].filter(m => m.amount > 0).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 50),
    [messages]
  );

  const downloadCSV = () => {
    const rows = readyRows.map(r => [r.creator?.accountName, r.creator?.accountNumber, r.net].join(","));
    const csv = "Account Name,Account Number,Amount\n" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `payout-${fmtDate(periodStart)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleMarkPaid = () => {
    if (confirmSecret !== adminSecret) {
      setConfirmError(true);
      return;
    }
    const now = new Date().toISOString();
    const readyHandles = new Set(readyRows.map(r => r.handle));
    setMessages(prev => prev.map(m => {
      if (m.amount > 0 && !m.paidOutAt && readyHandles.has(m.creatorHandle) && new Date(m.date) >= periodStart && new Date(m.date) < periodEnd) {
        return { ...m, paidOutAt: now };
      }
      return m;
    }));
    const newPayout = {
      date: now.split("T")[0],
      reference: `PAY-${now.split("T")[0].replace(/-/g, "")}-${String(payouts.length + 1).padStart(3, "0")}`,
      items: readyRows.map(r => ({ handle: r.handle, amount: r.net })),
    };
    setPayouts(prev => [...prev, newPayout]);
    setConfirmPay(false);
    setConfirmSecret("");
    setConfirmError(false);
    setPaySuccess(true);
    setTimeout(() => setPaySuccess(false), 4000);
  };

  if (!authed) return <PasswordGate onAuth={handleAuth} />;

  const tabs = ["Overview & Payout", "All Creators", "Payout History", "Activity Feed"];

  const statusBadge = (status) => {
    if (status === "Ready") return <Badge color={C.accent} bg={C.accentBg}>Ready</Badge>;
    if (status === "Below min") return <Badge color={C.warn} bg={C.warnBg}>Below min</Badge>;
    return <Badge color={C.danger} bg={C.dangerBg}>No account</Badge>;
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT, color: C.text }}>
      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${C.border}`,
        padding: "16px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        background: C.bg,
        zIndex: 100,
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${C.accent}, #10B981)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 14, color: "#000",
          }}>₦</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em" }}>Admin Dashboard</div>
            <div style={{ fontSize: 11, color: C.textDim }}>/#/admin</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Badge color={C.accent} bg={C.accentBg}>Authenticated</Badge>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 28px 60px" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 28, flexWrap: "wrap" }}>
          {tabs.map((t, i) => <Tab key={i} label={t} active={activeTab === i} onClick={() => setActiveTab(i)} />)}
        </div>

        {paySuccess && (
          <div style={{
            background: C.accentBg,
            border: `1px solid ${C.accentDim}`,
            borderRadius: 8,
            padding: "12px 18px",
            marginBottom: 20,
            color: C.accent,
            fontSize: 13,
            fontWeight: 600,
          }}>
            ✓ Payout batch processed successfully. Records updated.
          </div>
        )}

        {/* Tab 0: Overview + Payout */}
        {activeTab === 0 && (
          <>
            {/* Stats */}
            <SectionHeader title="Platform Overview" />
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 36 }}>
              <StatCard label="Total Users" value={totalUsers} />
              <StatCard label="Total Messages" value={totalMessages} />
              <StatCard label="Paid Messages" value={paidMessages.length} />
              <StatCard label="Gross Revenue" value={fmt(totalRevenue)} color={C.accent} />
              <StatCard label="Platform Fee (10%)" value={fmt(platformFee)} color={C.blue} />
              <StatCard label="Total Paid Out" value={fmt(totalPaidOut)} />
              <StatCard label="Pending Pool" value={fmt(pendingPool)} color={C.warn} sub="Unpaid × 0.9" />
            </div>

            {/* Payout Period */}
            <SectionHeader
              title="This Payout Period"
              sub={`${fmtDate(periodStart)} → ${fmtDate(periodEnd)}`}
            />
            <div style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              overflow: "hidden",
              marginBottom: 16,
            }}>
              <Table
                columns={[
                  { label: "Handle", key: "handle", render: r => <span style={{ fontWeight: 600 }}>@{r.handle}</span> },
                  { label: "Account Name", render: r => r.creator?.accountName || "—" },
                  { label: "Account #", render: r => r.creator?.accountNumber || "—", mono: true },
                  { label: "Gross", render: r => fmt(r.gross), align: "right", mono: true },
                  { label: "Fee", render: r => fmt(r.fee), align: "right", mono: true },
                  { label: "Net", render: r => <span style={{ fontWeight: 700, color: C.accent }}>{fmt(r.net)}</span>, align: "right" },
                  { label: "Status", render: r => statusBadge(r.status), align: "center" },
                ]}
                data={payoutCreators}
              />
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={downloadCSV} disabled={readyRows.length === 0} style={{
                ...baseBtn,
                background: readyRows.length ? C.blue : C.border,
                color: readyRows.length ? "#fff" : C.textDim,
                opacity: readyRows.length ? 1 : 0.5,
              }}>
                ↓ Download CSV ({readyRows.length} ready)
              </button>
              <button onClick={() => { setConfirmPay(true); setConfirmSecret(""); setConfirmError(false); }} disabled={readyRows.length === 0} style={{
                ...baseBtn,
                background: readyRows.length ? C.accent : C.border,
                color: readyRows.length ? "#000" : C.textDim,
                opacity: readyRows.length ? 1 : 0.5,
              }}>
                Mark as Paid
              </button>
            </div>

            {/* Confirm modal */}
            {confirmPay && (
              <div style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex",
                alignItems: "center", justifyContent: "center", zIndex: 999,
              }} onClick={() => setConfirmPay(false)}>
                <div onClick={e => e.stopPropagation()} style={{
                  background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
                  padding: "32px 28px", width: 400, textAlign: "center",
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.warn, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                    Confirm Payout
                  </div>
                  <p style={{ color: C.text, fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>
                    Mark {readyRows.length} creator{readyRows.length > 1 ? "s" : ""} as paid
                  </p>
                  <p style={{ color: C.textMuted, fontSize: 13, margin: "0 0 20px" }}>
                    Total: {fmt(readyRows.reduce((s, r) => s + r.net, 0))}. Re-enter admin secret to confirm.
                  </p>
                  <input
                    type="password"
                    value={confirmSecret}
                    onChange={e => { setConfirmSecret(e.target.value); setConfirmError(false); }}
                    onKeyDown={e => e.key === "Enter" && handleMarkPaid()}
                    placeholder="Admin secret..."
                    style={{
                      width: "100%", boxSizing: "border-box", padding: "10px 14px",
                      background: C.bg, border: `1px solid ${confirmError ? C.danger : C.border}`,
                      borderRadius: 8, color: C.text, fontFamily: MONO, fontSize: 13, outline: "none", marginBottom: 14,
                    }}
                  />
                  {confirmError && <p style={{ color: C.danger, fontSize: 12, margin: "-8px 0 10px" }}>Secret doesn't match.</p>}
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => setConfirmPay(false)} style={{ ...baseBtn, flex: 1, background: C.bg, color: C.textMuted, border: `1px solid ${C.border}` }}>
                      Cancel
                    </button>
                    <button onClick={handleMarkPaid} style={{ ...baseBtn, flex: 1, background: C.accent, color: "#000" }}>
                      Confirm Payout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Tab 1: All Creators */}
        {activeTab === 1 && (
          <>
            <SectionHeader title="All Creators" sub={`${CREATORS.length} creators registered`} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by handle or name..."
              style={{
                width: "100%", maxWidth: 360, boxSizing: "border-box", padding: "10px 14px",
                background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.text, fontFamily: FONT, fontSize: 13, outline: "none", marginBottom: 16,
              }}
            />
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
              <Table
                columns={[
                  { label: "Handle", render: r => <span style={{ fontWeight: 600 }}>@{r.handle}</span> },
                  { label: "Name", key: "name" },
                  { label: "Joined", render: r => fmtDate(r.joined) },
                  { label: "Messages", key: "totalMessages", align: "right", mono: true },
                  { label: "Paid", key: "paidCount", align: "right", mono: true },
                  { label: "All-time Earned", render: r => fmt(r.allTimeEarned), align: "right", mono: true },
                  { label: "Unpaid Balance", render: r => <span style={{ color: r.unpaidBalance > 0 ? C.warn : C.textDim }}>{fmt(r.unpaidBalance)}</span>, align: "right" },
                  { label: "Payout Acct", render: r => r.hasPayout ? <Badge color={C.accent} bg={C.accentBg}>Set</Badge> : <Badge color={C.danger} bg={C.dangerBg}>Not set</Badge>, align: "center" },
                ]}
                data={filteredCreators}
                onRowClick={i => setExpandedCreator(expandedCreator === i ? null : i)}
                expandedRow={expandedCreator}
                renderExpanded={row => (
                  <div style={{ padding: "16px 20px", background: C.bg }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Paid Messages from @{row.handle}
                    </div>
                    {row.paidMsgs.length === 0 ? (
                      <div style={{ color: C.textDim, fontSize: 13, padding: "8px 0" }}>No paid messages yet.</div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {row.paidMsgs.sort((a, b) => new Date(b.date) - new Date(a.date)).map(m => (
                          <div key={m.id} style={{
                            display: "flex", alignItems: "center", gap: 14, padding: "8px 12px",
                            background: C.surface, borderRadius: 6, fontSize: 13,
                          }}>
                            <span style={{ fontFamily: MONO, fontWeight: 700, color: C.accent, minWidth: 70 }}>{fmt(m.amount)}</span>
                            <span style={{ color: C.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              "{m.text}"
                            </span>
                            <span style={{ color: C.textDim, fontSize: 11, whiteSpace: "nowrap" }}>{fmtDate(m.date)}</span>
                            {m.paidOutAt && <Badge color={C.accent} bg={C.accentBg}>Paid</Badge>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              />
            </div>
          </>
        )}

        {/* Tab 2: Payout History */}
        {activeTab === 2 && (
          <>
            <SectionHeader title="Payout History" sub={`${payouts.length} batch${payouts.length !== 1 ? "es" : ""} processed`} />
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
              <Table
                columns={[
                  { label: "Date", render: r => fmtDate(r.date), bold: true },
                  { label: "Creators Paid", render: r => `${r.items.length} creator${r.items.length > 1 ? "s" : ""}` },
                  { label: "Total Transferred", render: r => <span style={{ fontWeight: 700, color: C.accent }}>{fmt(r.items.reduce((s, i) => s + i.amount, 0))}</span>, align: "right" },
                  { label: "Reference", render: r => <span style={{ fontFamily: MONO, fontSize: 12, color: C.textMuted }}>{r.reference}</span> },
                ]}
                data={[...payouts].reverse()}
                onRowClick={i => setExpandedPayout(expandedPayout === i ? null : i)}
                expandedRow={expandedPayout}
                renderExpanded={row => (
                  <div style={{ padding: "16px 20px", background: C.bg }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Individual Payouts
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {row.items.map((item, j) => {
                        const cr = CREATORS.find(c => c.handle === item.handle);
                        return (
                          <div key={j} style={{
                            display: "flex", alignItems: "center", gap: 14, padding: "8px 12px",
                            background: C.surface, borderRadius: 6, fontSize: 13,
                          }}>
                            <span style={{ fontWeight: 600, minWidth: 80 }}>@{item.handle}</span>
                            <span style={{ color: C.textMuted, flex: 1 }}>{cr?.name || "Unknown"}</span>
                            <span style={{ fontFamily: MONO, fontWeight: 700, color: C.accent }}>{fmt(item.amount)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              />
            </div>
          </>
        )}

        {/* Tab 3: Activity Feed */}
        {activeTab === 3 && (
          <>
            <SectionHeader title="Recent Activity" sub="Last 50 paid messages across all creators" />
            <div style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              overflow: "hidden",
            }}>
              {recentActivity.map((m, i) => (
                <div key={m.id} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "12px 18px",
                  borderBottom: i < recentActivity.length - 1 ? `1px solid ${C.border}` : "none",
                  transition: "background 0.1s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = C.surfaceHover}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ color: C.textDim, fontSize: 11, minWidth: 60, whiteSpace: "nowrap" }}>{timeAgo(m.date)}</span>
                  <span style={{ fontWeight: 600, minWidth: 70, fontSize: 13 }}>@{m.creatorHandle}</span>
                  <span style={{ fontFamily: MONO, fontWeight: 700, color: C.accent, minWidth: 70, fontSize: 13 }}>{fmt(m.amount)}</span>
                  <span style={{
                    color: C.textMuted, fontSize: 13, flex: 1,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    "{m.text}"
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${C.borderLight}; }
      `}</style>
    </div>
  );
}
