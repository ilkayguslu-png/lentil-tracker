import { useState, useRef, useCallback } from "react";

const SHEET_ID = "17_Em_JGAvpkxiQvzm0TKS6gXaNk7rjVlx4LEt2FrZT4";

const DEFAULT_SALARY = 200; // per day for Sat & Sun

const MARKETS = [
  { name: "Grove St — Monday",             day: "Monday"    },
  { name: "Maplewood FM",                  day: "Monday"    },
  { name: "Riverdale FM",                  day: "Tuesday"   },
  { name: "Grove St — Wednesday",          day: "Wednesday" },
  { name: "Hamilton Park FM",              day: "Wednesday" },
  { name: "South Orange FM",               day: "Wednesday" },
  { name: "Grove St — Thursday",           day: "Thursday"  },
  { name: "67th Street Flea Market",       day: "Saturday"  },
  { name: "Roosevelt Island FM",           day: "Saturday"  },
  { name: "Hell's Kitchen FM",             day: "Saturday"  },
  { name: "Morris Plains FM",              day: "Saturday"  },
  { name: "Metuchen FM",                   day: "Saturday"  },
  { name: "Stamford FM",                   day: "Saturday"  },
  { name: "Columbus / Grand Bazaar",       day: "Sunday"    },
  { name: "Murray Hill FM",                day: "Sunday"    },
  { name: "Nutley FM",                     day: "Sunday"    },
  { name: "Pickles & Olives Etc. (Store)", day: "Store"     },
];

const DAY_COLORS = {
  Monday: "#4A90D9", Tuesday: "#E67E3A", Wednesday: "#7CB87A",
  Thursday: "#C06BBF", Saturday: "#E8B84B", Sunday: "#E05C5C",
  Store: "#48A999",
};
const DAYS_ORDER = ["Monday","Tuesday","Wednesday","Thursday","Saturday","Sunday","Store"];
const byDay = DAYS_ORDER.reduce((acc, day) => {
  acc[day] = MARKETS.filter(m => m.day === day); return acc;
}, {});

const fmt = (n) => `$${Number(n).toFixed(2)}`;
const getMonday = () => {
  const d = new Date(), day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().slice(0,10);
};
const emptyData = () => Object.fromEntries(MARKETS.map(m => [m.name, { containers: 0, tips: 0 }]));
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Sans+3:wght@300;400;600&family=Inconsolata:wght@400;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0F1117; --surface: #181C27; --surface2: #1E2433;
    --border: #2A2F42; --accent: #E8A44A; --accent2: #5B8FD4;
    --text: #E8E4DC; --muted: #6B7080; --green: #5CB87A;
    --red: #E05C5C; --purple: #C06BBF; --teal: #48A999;
  }
  body { background: var(--bg); color: var(--text); font-family: 'Source Sans 3', sans-serif; }
  .app { min-height: 100vh; background: var(--bg); padding-bottom: 60px; }

  /* Hero */
  .hero { background: linear-gradient(135deg, #0F1117 0%, #1A1F30 50%, #0F1117 100%);
    border-bottom: 1px solid var(--border); padding: 24px 20px 16px; text-align: center; }
  .hero-eyebrow { font-family:'Inconsolata',monospace; font-size:0.7rem; letter-spacing:0.2em; color:var(--accent); text-transform:uppercase; margin-bottom:4px; }
  .hero h1 { font-family:'Playfair Display',serif; font-size:1.8rem; font-weight:900; color:var(--text); line-height:1.1; margin-bottom:2px; }
  .hero h1 span { color:var(--accent); }
  .hero-sub { font-size:0.78rem; color:var(--muted); }
  .sheet-pill { display:inline-flex; align-items:center; gap:6px; margin-top:10px; padding:4px 12px;
    background:rgba(91,143,212,0.12); border:1px solid rgba(91,143,212,0.3); border-radius:20px;
    font-family:'Inconsolata',monospace; font-size:0.7rem; color:var(--accent2); text-decoration:none; }

  /* Main nav tabs */
  .main-nav { display:flex; max-width:720px; margin:0 auto; border-bottom:1px solid var(--border); overflow-x:auto; }
  .main-nav::-webkit-scrollbar { display:none; }
  .nav-tab { flex:none; padding:12px 18px; font-family:'Inconsolata',monospace; font-size:0.75rem;
    letter-spacing:0.08em; text-transform:uppercase; color:var(--muted); cursor:pointer;
    border-bottom:2px solid transparent; background:none; border-top:none; border-left:none; border-right:none;
    white-space:nowrap; transition:all 0.2s; }
  .nav-tab.active { color:var(--accent); border-bottom-color:var(--accent); }
  .nav-tab:hover:not(.active) { color:var(--text); }

  .content { max-width:720px; margin:0 auto; padding:20px 16px; }

  /* ── SETTINGS TAB ── */
  .settings-card { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:20px; margin-bottom:16px; }
  .settings-title { font-family:'Playfair Display',serif; font-size:1rem; font-weight:700; color:var(--accent); margin-bottom:14px; }
  .setting-row { display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--border); }
  .setting-row:last-child { border-bottom:none; }
  .setting-label { font-size:0.88rem; color:var(--text); }
  .setting-note { font-size:0.72rem; color:var(--muted); margin-top:2px; font-family:'Inconsolata',monospace; }
  .setting-input { background:var(--surface2); border:1px solid var(--border); border-radius:7px;
    padding:7px 12px; color:var(--accent); font-family:'Inconsolata',monospace; font-size:1rem;
    font-weight:600; outline:none; width:100px; text-align:center; }
  .setting-input:focus { border-color:var(--accent); }
  .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:14px; }
  .info-box { background:var(--surface2); border:1px solid var(--border); border-radius:8px; padding:12px; }
  .info-box-label { font-family:'Inconsolata',monospace; font-size:0.65rem; color:var(--muted); letter-spacing:0.1em; text-transform:uppercase; margin-bottom:4px; }
  .info-box-value { font-size:0.9rem; font-weight:600; color:var(--text); }

  /* ── ENTRY FORM TAB ── */
  .week-bar { display:flex; align-items:center; gap:10px; margin-bottom:18px; flex-wrap:wrap; }
  .week-label { font-family:'Inconsolata',monospace; font-size:0.7rem; color:var(--muted); letter-spacing:0.1em; white-space:nowrap; }
  .week-input { background:var(--surface); border:1px solid var(--border); border-radius:8px;
    padding:8px 12px; color:var(--text); font-family:'Inconsolata',monospace; font-size:0.88rem; outline:none; }
  .week-input:focus { border-color:var(--accent); }
  .photo-tab-bar { display:flex; gap:8px; margin-bottom:16px; }
  .photo-tab { flex:1; padding:9px; border-radius:9px; border:1px solid var(--border);
    background:var(--surface); color:var(--muted); font-family:'Source Sans 3',sans-serif;
    font-size:0.82rem; font-weight:600; cursor:pointer; transition:all 0.2s; text-align:center; }
  .photo-tab.active { background:var(--accent); color:#0F1117; border-color:var(--accent); }
  .day-section { margin-bottom:14px; }
  .day-header { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
  .day-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .day-name { font-family:'Playfair Display',serif; font-size:1rem; font-weight:700; color:var(--text); }
  .day-line { flex:1; height:1px; background:var(--border); }
  .market-card { background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:12px 14px; margin-bottom:8px; transition:border-color 0.2s; }
  .market-card:focus-within { border-color:rgba(232,164,74,0.35); }
  .market-name { font-size:0.88rem; font-weight:600; color:var(--text); margin-bottom:10px; }
  .market-inputs { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .input-group { display:flex; flex-direction:column; gap:4px; }
  .input-label { font-family:'Inconsolata',monospace; font-size:0.65rem; color:var(--muted); letter-spacing:0.1em; text-transform:uppercase; }
  .market-input { background:var(--surface2); border:1px solid var(--border); border-radius:7px;
    padding:8px 10px; color:var(--text); font-family:'Inconsolata',monospace; font-size:0.95rem; outline:none; width:100%; }
  .market-input:focus { border-color:var(--accent); }
  .tip-input:focus { border-color:var(--purple); }
  .market-rev { font-family:'Inconsolata',monospace; font-size:0.85rem; color:var(--green);
    font-weight:600; padding:8px 10px; background:rgba(92,184,122,0.07); border:1px solid rgba(92,184,122,0.15); border-radius:7px; display:flex; align-items:center; }
  .bonus-row { background:rgba(72,169,153,0.08); border:1px solid rgba(72,169,153,0.2); border-radius:10px; padding:12px 16px; display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
  .bonus-label { font-family:'Inconsolata',monospace; font-size:0.75rem; color:var(--teal); letter-spacing:0.1em; text-transform:uppercase; }
  .bonus-input { background:var(--surface2); border:1px solid rgba(72,169,153,0.3); border-radius:7px; padding:8px 12px; color:var(--teal); font-family:'Inconsolata',monospace; font-size:1rem; font-weight:600; outline:none; width:110px; text-align:center; }
  .bonus-input:focus { border-color:var(--teal); }
  .save-btn { width:100%; padding:13px; background:var(--accent); color:#0F1117;
    border:none; border-radius:10px; font-family:'Playfair Display',serif; font-size:1rem;
    font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:all 0.2s; }
  .save-btn:hover { background:#F0B85A; }
  .save-btn:disabled { background:#5A4A2A; color:#8A7A5A; cursor:not-allowed; }
  .reset-btn { background:none; border:1px solid var(--border); border-radius:8px; color:var(--muted);
    padding:8px; font-family:'Source Sans 3',sans-serif; font-size:0.82rem; cursor:pointer; width:100%; margin-top:8px; }
  .reset-btn:hover { border-color:var(--red); color:var(--red); }
  .success-box { background:rgba(92,184,122,0.1); border:1px solid rgba(92,184,122,0.3); border-radius:10px; padding:14px; text-align:center; margin-top:12px; }
  .success-box p { color:var(--green); font-size:0.88rem; margin-bottom:6px; }
  .success-box a { color:var(--accent2); font-size:0.82rem; }

  /* ── SUMMARY SECTION ── */
  .summary-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:16px; }
  .summary-box { border-radius:10px; padding:14px 10px; text-align:center; }
  .summary-box.week  { background:rgba(91,143,212,0.1);  border:1px solid rgba(91,143,212,0.2); }
  .summary-box.month { background:rgba(232,164,74,0.1);  border:1px solid rgba(232,164,74,0.2); }
  .summary-box.year  { background:rgba(224,92,92,0.08);  border:1px solid rgba(224,92,92,0.15); }
  .summary-period { font-family:'Inconsolata',monospace; font-size:0.6rem; letter-spacing:0.12em; text-transform:uppercase; color:var(--muted); margin-bottom:4px; }
  .summary-amount { font-family:'Playfair Display',serif; font-size:1.2rem; font-weight:700; color:var(--text); line-height:1; margin-bottom:2px; }
  .summary-sub { font-size:0.68rem; color:var(--muted); font-family:'Inconsolata',monospace; }
  .totals-row { display:grid; grid-template-columns:repeat(5,1fr); gap:8px; padding:14px 0; border-top:1px solid var(--border); border-bottom:1px solid var(--border); margin-bottom:16px; }
  .total-item { text-align:center; }
  .total-lbl { font-family:'Inconsolata',monospace; font-size:0.58rem; color:var(--muted); letter-spacing:0.08em; text-transform:uppercase; margin-bottom:3px; }
  .total-val { font-family:'Inconsolata',monospace; font-size:0.88rem; font-weight:600; }
  .tv-b { color:var(--text); } .tv-r { color:var(--green); } .tv-t { color:var(--purple); } .tv-bo { color:var(--teal); } .tv-to { color:var(--accent); }

  /* ── DAILY LOG TAB ── */
  .log-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; flex-wrap:wrap; gap:8px; }
  .log-title { font-family:'Playfair Display',serif; font-size:1rem; font-weight:700; color:var(--accent); }
  .log-empty { text-align:center; padding:40px 20px; color:var(--muted); font-size:0.88rem; font-family:'Inconsolata',monospace; }
  .log-table { width:100%; border-collapse:collapse; font-size:0.8rem; }
  .log-table th { background:var(--surface2); color:var(--muted); padding:8px 10px; text-align:left;
    font-family:'Inconsolata',monospace; font-size:0.65rem; letter-spacing:0.08em; border-bottom:1px solid var(--border); white-space:nowrap; }
  .log-table td { padding:8px 10px; border-bottom:1px solid var(--border); vertical-align:middle; }
  .log-table tr:last-child td { border-bottom:none; }
  .log-table tr:nth-child(even) td { background:rgba(255,255,255,0.02); }
  .badge { display:inline-block; padding:2px 8px; border-radius:20px; font-family:'Inconsolata',monospace; font-size:0.65rem; font-weight:600; }
  .badge-mon { background:rgba(74,144,217,0.15); color:#4A90D9; }
  .badge-tue { background:rgba(230,126,58,0.15); color:#E67E3A; }
  .badge-wed { background:rgba(124,184,122,0.15); color:#7CB87A; }
  .badge-thu { background:rgba(192,107,191,0.15); color:#C06BBF; }
  .badge-sat { background:rgba(232,184,75,0.15); color:#E8B84B; }
  .badge-sun { background:rgba(224,92,92,0.15); color:#E05C5C; }
  .badge-store { background:rgba(72,169,153,0.15); color:#48A999; }
  .badge-bonus { background:rgba(72,169,153,0.15); color:#48A999; }
  .log-summary { background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:14px; margin-top:14px; }
  .log-sum-row { display:flex; justify-content:space-between; padding:5px 0; font-size:0.85rem; border-bottom:1px solid var(--border); }
  .log-sum-row:last-child { border-bottom:none; font-weight:600; color:var(--accent); }

  /* ── PHOTO MODE ── */
  .drop-zone { border:2px dashed var(--border); border-radius:12px; padding:36px 20px;
    text-align:center; cursor:pointer; transition:all 0.2s; background:var(--surface); position:relative; }
  .drop-zone:hover { border-color:var(--accent); background:rgba(232,164,74,0.04); }
  .drop-zone input { position:absolute; inset:0; opacity:0; cursor:pointer; width:100%; height:100%; }
  .drop-icon { font-size:2.4rem; margin-bottom:8px; display:block; }
  .drop-text { font-size:0.92rem; color:var(--text); margin-bottom:3px; font-weight:600; }
  .drop-sub { font-size:0.75rem; color:var(--muted); font-family:'Inconsolata',monospace; }
  .preview-img { width:100%; max-height:240px; object-fit:contain; border-radius:10px; border:1px solid var(--border); margin-bottom:12px; }
  .btn { display:inline-flex; align-items:center; justify-content:center; gap:8px;
    padding:10px 20px; border-radius:9px; font-family:'Source Sans 3',sans-serif;
    font-size:0.88rem; font-weight:600; cursor:pointer; transition:all 0.18s; border:none; }
  .btn-accent { background:var(--accent); color:#0F1117; width:100%; }
  .btn-accent:disabled { background:#5A4A2A; color:#8A7A5A; cursor:not-allowed; }
  .btn-outline { background:transparent; border:1px solid var(--border); color:var(--muted); }
  .btn-green { background:var(--green); color:#0F1117; width:100%; }
  .btn-green:disabled { background:#2A5A3A; color:#5A8A6A; cursor:not-allowed; }
  .btn-sm { padding:6px 12px; font-size:0.8rem; }
  .action-row { display:flex; gap:8px; align-items:center; }
  .flex1 { flex:1; }
  .status { padding:9px 13px; border-radius:8px; font-family:'Inconsolata',monospace; font-size:0.8rem; margin-bottom:12px; }
  .status.ok    { background:rgba(92,184,122,0.1); border:1px solid rgba(92,184,122,0.25); color:var(--green); }
  .status.error { background:rgba(224,92,92,0.1);  border:1px solid rgba(224,92,92,0.25);  color:var(--red); }
  .status.info  { background:rgba(91,143,212,0.1); border:1px solid rgba(91,143,212,0.25); color:var(--accent2); }
  .raw-note { background:var(--surface2); border:1px solid var(--border); border-radius:8px;
    padding:12px; font-family:'Inconsolata',monospace; font-size:0.78rem; color:var(--muted);
    white-space:pre-wrap; line-height:1.6; margin-bottom:12px; }
  .micro-label { font-family:'Inconsolata',monospace; font-size:0.63rem; color:var(--muted); letter-spacing:0.1em; text-transform:uppercase; margin-bottom:5px; }
  .scan-table { width:100%; border-collapse:collapse; margin-bottom:12px; font-size:0.85rem; }
  .scan-table th { background:var(--surface2); color:var(--muted); padding:8px 10px;
    text-align:left; font-family:'Inconsolata',monospace; font-size:0.65rem; letter-spacing:0.08em; border-bottom:1px solid var(--border); }
  .scan-table td { padding:7px 10px; border-bottom:1px solid var(--border); vertical-align:middle; }
  .scan-table tr:last-child td { border-bottom:none; }
  .scan-table input, .scan-table select { background:var(--surface2); border:1px solid var(--border);
    border-radius:6px; padding:5px 7px; font-family:'Inconsolata',monospace; font-size:0.8rem;
    color:var(--text); width:100%; outline:none; }
  .del-btn { background:none; border:none; color:var(--muted); cursor:pointer; font-size:0.95rem; padding:2px 5px; }
  .del-btn:hover { color:var(--red); }
  .add-row { background:none; border:1px dashed var(--border); border-radius:7px; color:var(--muted);
    padding:6px; font-size:0.8rem; cursor:pointer; width:100%; margin-bottom:12px; font-family:'Source Sans 3',sans-serif; }
  .spinner { width:15px; height:15px; border:2px solid rgba(15,17,23,0.3); border-top-color:#0F1117; border-radius:50%; animation:spin 0.7s linear infinite; display:inline-block; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .section-card { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:18px; margin-bottom:14px; }
  .section-title { font-family:'Playfair Display',serif; font-size:0.95rem; font-weight:700; color:var(--accent); margin-bottom:14px; }
  .divider { border:none; border-top:1px solid var(--border); margin:16px 0; }
`;

export default function App() {
  const [tab, setTab] = useState("entry");
  const [price, setPrice] = useState(8);
  const [entryMode, setEntryMode] = useState("manual");
  const [weekDate, setWeekDate] = useState(getMonday());
  const [weekBonus, setWeekBonus] = useState(0);
  const [salaryRate, setSalaryRate] = useState(DEFAULT_SALARY);
  const [manualSalary, setManualSalary] = useState(0); // manual salary entry (June-Dec)
  const [manualData, setManualData] = useState(emptyData());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState(null);
  const [log, setLog] = useState([]); // local session log

  // Photo state
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [rawText, setRawText] = useState(null);
  const [scanRows, setScanRows] = useState([]);
  const [scanSaved, setScanSaved] = useState(false);
  const [scanSaving, setScanSaving] = useState(false);
  const [scanStatus, setScanStatus] = useState(null);
  const fileRef = useRef();

  const updateManual = (market, field, val) => {
    setSaved(false);
    setManualData(prev => ({ ...prev, [market]: { ...prev[market], [field]: val===""?0:Number(val)||0 } }));
  };

  const totalContainers = MARKETS.reduce((s,m)=>s+(manualData[m.name]?.containers||0),0);
  const totalRevenue    = totalContainers * price;
  const totalTips       = MARKETS.reduce((s,m)=>s+(manualData[m.name]?.tips||0),0);
  const totalBonus      = Number(weekBonus)||0;
  const totalCombined   = totalRevenue + totalTips + totalBonus;

  const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbx9gT3MsqATaCCus40G-tCWgp2LfVe1JhCHIEmfu0we6XpNjE708zmqQUiIXc6fKZ9yCw/exec";

  const saveToSheets = async (csvRows) => {
    // Parse CSV rows into arrays for the webhook
    const rows = csvRows.split("\n").map(row => {
      const result = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < row.length; i++) {
        if (row[i] === '"') { inQuotes = !inQuotes; }
        else if (row[i] === "," && !inQuotes) { result.push(current); current = ""; }
        else { current += row[i]; }
      }
      result.push(current);
      return result;
    });
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ rows })
    });
    const d = await res.json();
    return d.status === "success";
  };

  const saveManual = async () => {
    setSaving(true); setSaved(false); setStatus(null);
    const scannedOn = new Date().toLocaleString();
    const active = MARKETS.filter(m=>(manualData[m.name]?.containers||0)>0||(manualData[m.name]?.tips||0)>0);
    if (!active.length) { setStatus({msg:"No data entered yet.",type:"error"}); setSaving(false); return; }

    const marketRows = active.map(m => {
      const c=manualData[m.name].containers||0, t=manualData[m.name].tips||0, rev=c*price;
      return `${weekDate},"${m.name}","${m.day}",${c},$${rev.toFixed(2)},$${t.toFixed(2)},$0.00,$${(rev+t).toFixed(2)},"${scannedOn}"`;
    });
    if (totalBonus>0) marketRows.push(`${weekDate},"Weekly Bonus","—",0,$0.00,$0.00,$${totalBonus.toFixed(2)},$${totalBonus.toFixed(2)},"${scannedOn}"`);
    if (autoSalary>0) marketRows.push(`${weekDate},"Salary — Sat & Sun (Auto)","—",0,$0.00,$0.00,$${autoSalary.toFixed(2)},$${autoSalary.toFixed(2)},"${scannedOn}"`);
    if ((Number(manualSalary)||0)>0) marketRows.push(`${weekDate},"Salary — Manual Entry","—",0,$0.00,$0.00,$${(Number(manualSalary)).toFixed(2)},$${(Number(manualSalary)).toFixed(2)},"${scannedOn}"`);

    try {
      const ok = await saveToSheets(marketRows.join("\n"));
      if (ok) {
        setSaved(true);
        // Add to local log
        const newEntries = active.map(m => ({
          date: weekDate, market: m.name, day: m.day,
          containers: manualData[m.name].containers||0,
          revenue: (manualData[m.name].containers||0)*price,
          tips: manualData[m.name].tips||0,
          bonus: 0, savedOn: scannedOn
        }));
        if (totalBonus>0) newEntries[0].bonus = totalBonus;
        setLog(prev => [...newEntries, ...prev]);
      } else setStatus({msg:"Something went wrong. Try again.",type:"error"});
    } catch { setStatus({msg:"Could not connect. Try again.",type:"error"}); }
    setSaving(false);
  };

  const resetManual = () => { setManualData(emptyData()); setSaved(false); setStatus(null); setWeekDate(getMonday()); setWeekBonus(0); };

  const handleFile = useCallback((file) => {
    if (!file||!file.type.startsWith("image/")) return;
    setImage(URL.createObjectURL(file)); setImageBase64(null);
    setScanRows([]); setRawText(null); setScanSaved(false); setScanStatus(null);
    const r = new FileReader();
    r.onload = e => setImageBase64(e.target.result.split(",")[1]);
    r.readAsDataURL(file);
  },[]);

  const scan = async () => {
    if (!imageBase64) return;
    setScanning(true); setScanStatus({msg:"Reading your husband's note...",type:"info"});
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":process.env.REACT_APP_ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body: JSON.stringify({
          model:"claude-3-5-sonnet-20241022", max_tokens:1000,
          messages:[{role:"user",content:[
            {type:"image",source:{type:"base64",media_type:"image/jpeg",data:imageBase64}},
            {type:"text",text:`Extract sales data from this handwritten sticky note. Known markets: ${MARKETS.map(m=>m.name).join(", ")}. Return ONLY valid JSON: {"raw_text":"verbatim","entries":[{"date":"YYYY-MM-DD","location":"matched market","containers":12,"tips":0}],"notes":"issues"}. Match locations loosely. Assume current year if missing.`}
          ]}]
        })
      });
      const d = await res.json();
      const txtResponse = d.content.find(i=>i.type==="text")?.text||"{}";
      const parsed = JSON.parse(txtResponse.replace(/```json|```/g,"").trim());
      setRawText(parsed.raw_text||"");
      setScanRows((parsed.entries||[]).map((e,i)=>({id:Date.now()+i,date:e.date||weekDate,location:e.location||"",containers:e.containers??0,tips:e.tips??0})));
      const hasNote = parsed.notes&&parsed.notes.toLowerCase()!=="none";
      setScanStatus({msg:hasNote?`Found ${parsed.entries?.length||0} entries. Note: ${parsed.notes}`:`Found ${parsed.entries?.length||0} entries — review and save.`,type:hasNote?"error":"ok"});
    } catch { setScanStatus({msg:"Couldn't read the image. Try a clearer photo.",type:"error"}); }
    setScanning(false);
  };

  const updateScanRow = (id,field,val) => setScanRows(prev=>prev.map(r=>r.id===id?{...r,[field]:["containers","tips"].includes(field)?(val===""?0:Number(val)||0):val}:r));
  const deleteScanRow = (id) => setScanRows(prev=>prev.filter(r=>r.id!==id));
  const addScanRow = () => setScanRows(prev=>[...prev,{id:Date.now(),date:weekDate,location:"",containers:0,tips:0}]);

  const saveScan = async () => {
    setScanSaving(true); setScanSaved(false);
    const scannedOn = new Date().toLocaleString();
    const rows = scanRows.map(r=>{
      const rev=(r.containers||0)*price;
      return `${r.date},"${r.location}","",${r.containers||0},$${rev.toFixed(2)},$${(r.tips||0).toFixed(2)},$0.00,$${(rev+(r.tips||0)).toFixed(2)},"${scannedOn}"`;
    }).join("\n");
    try {
      const ok = await saveToSheets(rows);
      if (ok) {
        setScanSaved(true); setScanStatus({msg:`${scanRows.length} rows saved!`,type:"ok"});
        setLog(prev => [...scanRows.map(r=>({date:r.date,market:r.location,day:"",containers:r.containers||0,revenue:(r.containers||0)*price,tips:r.tips||0,bonus:0,savedOn:scannedOn})),...prev]);
      } else setScanStatus({msg:"Something went wrong. Try again.",type:"error"});
    } catch { setScanStatus({msg:"Could not connect. Try again.",type:"error"}); }
    setScanSaving(false);
  };

  const resetPhoto = () => { setImage(null); setImageBase64(null); setScanRows([]); setRawText(null); setScanSaved(false); setScanStatus(null); };

  const dayBadgeClass = (day) => {
    const map = {Monday:"mon",Tuesday:"tue",Wednesday:"wed",Thursday:"thu",Saturday:"sat",Sunday:"sun",Store:"store","—":"bonus"};
    return `badge badge-${map[day]||"mon"}`;
  };

  // Log totals
  const logTotal = log.reduce((s,r)=>s+(r.revenue||0)+(r.tips||0)+(r.bonus||0),0);
  const logContainers = log.reduce((s,r)=>s+(r.containers||0),0);
  const logTips = log.reduce((s,r)=>s+(r.tips||0),0);
  const logBonus = log.reduce((s,r)=>s+(r.bonus||0),0);

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {/* Hero */}
        <div className="hero">
          <div className="hero-eyebrow">The Lentil Ball</div>
          <h1>Sales <span>&amp;</span> Tips</h1>
          <div className="hero-sub">Weekly market tracker</div>
          <a className="sheet-pill" href={`https://docs.google.com/spreadsheets/d/${SHEET_ID}`} target="_blank" rel="noreferrer">📊 Live Google Sheet</a>
        </div>

        {/* Main Nav */}
        <div className="main-nav">
          {[["entry","✏️ Entry Form"],["log","📋 Sales Log"],["summary","📊 Summary"],["settings","⚙️ Settings"]].map(([key,label])=>(
            <button key={key} className={`nav-tab${tab===key?" active":""}`} onClick={()=>setTab(key)}>{label}</button>
          ))}
        </div>

        <div className="content">

          {/* ══ SETTINGS ══════════════════════════════════════════════════════ */}
          {tab==="settings"&&(
            <>
              <div className="settings-card">
                <div className="settings-title">Price & Configuration</div>
                <div className="setting-row">
                  <div>
                    <div className="setting-label">Price Per Container</div>
                    <div className="setting-note">Change anytime — all revenue updates instantly</div>
                  </div>
                  <input type="number" className="setting-input" value={price} min={1} step={0.5}
                    onChange={e=>setPrice(e.target.value===""?8:Number(e.target.value))}/>
                </div>
                <div className="setting-row">
                  <div>
                    <div className="setting-label">Daily Salary (Sat & Sun)</div>
                    <div className="setting-note">Auto-added every week — $200 × 2 days</div>
                  </div>
                  <input type="number" className="setting-input" value={salaryRate} min={0} step={10}
                    onChange={e=>setSalaryRate(e.target.value===""?200:Number(e.target.value))}/>
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-title">Markets ({MARKETS.length})</div>
                {DAYS_ORDER.map(day=>(
                  <div key={day} style={{marginBottom:10}}>
                    <div style={{fontSize:"0.72rem",fontFamily:"Inconsolata,monospace",color:"var(--muted)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4,display:"flex",alignItems:"center",gap:8}}>
                      <span style={{width:6,height:6,borderRadius:"50%",background:DAY_COLORS[day],display:"inline-block"}}/>
                      {day==="Store"?"🏪 Store":day}
                    </div>
                    {byDay[day].map(m=>(
                      <div key={m.name} style={{fontSize:"0.85rem",color:"var(--text)",padding:"4px 14px",borderLeft:`2px solid ${DAY_COLORS[day]}33`}}>{m.name}</div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="settings-card">
                <div className="settings-title">Google Sheet</div>
                <div style={{fontSize:"0.85rem",color:"var(--muted)",marginBottom:10}}>All data saves to your live Google Sheet automatically.</div>
                <a href={`https://docs.google.com/spreadsheets/d/${SHEET_ID}`} target="_blank" rel="noreferrer"
                  style={{display:"inline-flex",alignItems:"center",gap:6,color:"var(--accent2)",fontSize:"0.85rem",textDecoration:"none",fontFamily:"Inconsolata,monospace"}}>
                  📊 Open Google Sheet →
                </a>
              </div>
            </>
          )}

          {/* ══ ENTRY FORM ════════════════════════════════════════════════════ */}
          {tab==="entry"&&(
            <>
              <div className="week-bar">
                <span className="week-label">WEEK OF</span>
                <input type="date" className="week-input" value={weekDate} onChange={e=>setWeekDate(e.target.value)}/>
                <span className="week-label" style={{marginLeft:8}}>$/BOX</span>
                <input type="number" className="week-input" style={{width:70,color:"var(--accent)",fontWeight:600,textAlign:"center"}} value={price} min={1} step={0.5} onChange={e=>setPrice(e.target.value===""?8:Number(e.target.value))}/>
              </div>

              <div className="photo-tab-bar">
                <button className={`photo-tab${entryMode==="manual"?" active":""}`} onClick={()=>setEntryMode("manual")}>✏️ Manual Entry</button>
                <button className={`photo-tab${entryMode==="photo"?" active":""}`} onClick={()=>setEntryMode("photo")}>📸 Scan Photo</button>
              </div>

              {entryMode==="manual"&&(
                <>
                  {DAYS_ORDER.map(day=>(
                    <div className="day-section" key={day}>
                      <div className="day-header">
                        <div className="day-dot" style={{background:DAY_COLORS[day]}}/>
                        <div className="day-name">{day==="Store"?"🏪 Store":day}</div>
                        <div className="day-line"/>
                      </div>
                      {byDay[day].map(market=>{
                        const c=manualData[market.name]?.containers||0,t=manualData[market.name]?.tips||0,rev=c*price;
                        return (
                          <div className="market-card" key={market.name}>
                            <div className="market-name">{market.name}</div>
                            <div className="market-inputs">
                              <div className="input-group"><span className="input-label">Containers</span>
                                <input type="number" className="market-input" min={0} value={c||""} placeholder="0" onChange={e=>updateManual(market.name,"containers",e.target.value)}/>
                              </div>
                              <div className="input-group"><span className="input-label">Revenue</span>
                                <div className="market-rev">{fmt(rev)}</div>
                              </div>
                              <div className="input-group"><span className="input-label">Tips ($)</span>
                                <input type="number" className="market-input tip-input" min={0} step={0.5} value={t||""} placeholder="0.00" onChange={e=>updateManual(market.name,"tips",e.target.value)}/>
                              </div>
                              <div className="input-group"><span className="input-label">Total</span>
                                <div className="market-rev" style={{color:"var(--accent)"}}>{fmt(rev+t)}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}

                  <div className="bonus-row">
                    <span className="bonus-label">⭐ Weekly Bonus</span>
                    <input type="number" className="bonus-input" min={0} step={0.5} value={weekBonus||""} placeholder="$0.00" onChange={e=>setWeekBonus(e.target.value===""?0:Number(e.target.value))}/>
                  </div>

                  <div className="totals-row" style={{gridTemplateColumns:"repeat(6,1fr)"}}>
                    <div className="total-item"><div className="total-lbl">Boxes</div><div className="total-val tv-b">{totalContainers}</div></div>
                    <div className="total-item"><div className="total-lbl">Sales</div><div className="total-val tv-r">{fmt(totalRevenue)}</div></div>
                    <div className="total-item"><div className="total-lbl">Tips</div><div className="total-val tv-t">{fmt(totalTips)}</div></div>
                    <div className="total-item"><div className="total-lbl">Bonus</div><div className="total-val tv-bo">{fmt(totalBonus)}</div></div>
                    <div className="total-item"><div className="total-lbl">Salary</div><div className="total-val" style={{color:"var(--accent2)"}}>{fmt(totalSalary)}</div></div>
                    <div className="total-item"><div className="total-lbl">Total</div><div className="total-val tv-to">{fmt(totalCombined)}</div></div>
                  </div>

                  {!saved
                    ?<button className="save-btn" onClick={saveManual} disabled={saving}>{saving?<><span className="spinner"/>Saving...</>:"💾 Save to Google Sheets"}</button>
                    :<div className="success-box"><p>✓ Saved to your live sheet!</p><a href={`https://docs.google.com/spreadsheets/d/${SHEET_ID}`} target="_blank" rel="noreferrer">Open Google Sheet →</a></div>
                  }
                  {status&&<div className={`status ${status.type}`} style={{marginTop:10}}>{status.msg}</div>}
                  <button className="reset-btn" onClick={resetManual}>Clear &amp; start a new week</button>
                </>
              )}

              {entryMode==="photo"&&(
                <>
                  {!image
                    ?<div className="drop-zone" onClick={()=>fileRef.current.click()}
                        onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();handleFile(e.dataTransfer.files[0]);}}>
                        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={e=>handleFile(e.target.files[0])}/>
                        <span className="drop-icon">📸</span>
                        <div className="drop-text">Tap to take a photo or upload</div>
                        <div className="drop-sub">Photo of your husband's sticky note</div>
                      </div>
                    :<>
                        <img src={image} alt="Note" className="preview-img"/>
                        <div className="action-row">
                          <button className="btn btn-outline btn-sm" onClick={resetPhoto}>↩ Different photo</button>
                          <button className="btn btn-accent flex1" onClick={scan} disabled={scanning}>{scanning?<><span className="spinner"/>Reading...</>:"Extract Data →"}</button>
                        </div>
                      </>
                  }
                  {scanStatus&&<div className={`status ${scanStatus.type}`} style={{marginTop:12}}>{scanStatus.msg}</div>}
                  {rawText&&<div style={{marginTop:12}}><div className="micro-label">What I read from the note</div><div className="raw-note">{rawText}</div></div>}
                  {scanRows.length>0&&(
                    <>
                      <div style={{height:8}}/><div className="micro-label">Review &amp; edit before saving</div>
                      <table className="scan-table">
                        <thead><tr><th>Date</th><th>Market</th><th>Boxes</th><th>Tips</th><th></th></tr></thead>
                        <tbody>
                          {scanRows.map(row=>(
                            <tr key={row.id}>
                              <td><input type="text" value={row.date} onChange={e=>updateScanRow(row.id,"date",e.target.value)} placeholder="YYYY-MM-DD"/></td>
                              <td><select value={row.location} onChange={e=>updateScanRow(row.id,"location",e.target.value)}><option value="">— select —</option>{MARKETS.map(m=><option key={m.name} value={m.name}>{m.name}</option>)}</select></td>
                              <td><input type="number" value={row.containers||""} placeholder="0" min={0} onChange={e=>updateScanRow(row.id,"containers",e.target.value)}/></td>
                              <td><input type="number" value={row.tips||""} placeholder="0.00" min={0} step={0.5} onChange={e=>updateScanRow(row.id,"tips",e.target.value)}/></td>
                              <td><button className="del-btn" onClick={()=>deleteScanRow(row.id)}>✕</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <button className="add-row" onClick={addScanRow}>+ Add row manually</button>
                      {!scanSaved
                        ?<button className="btn btn-green" onClick={saveScan} disabled={scanSaving}>{scanSaving?<><span className="spinner"/>Saving...</>:"💾 Save to Google Sheets"}</button>
                        :<div className="success-box"><p>✓ {scanRows.length} rows saved!</p><a href={`https://docs.google.com/spreadsheets/d/${SHEET_ID}`} target="_blank" rel="noreferrer">Open Google Sheet →</a></div>
                      }
                      <button className="reset-btn" onClick={resetPhoto} style={{marginTop:8}}>Scan another note</button>
                    </>
                  )}
                </>
              )}
            </>
          )}

          {/* ══ SALES LOG ═════════════════════════════════════════════════════ */}
          {tab==="log"&&(
            <>
              <div className="log-header">
                <div className="log-title">Sales Log — This Session</div>
                <a href={`https://docs.google.com/spreadsheets/d/${SHEET_ID}`} target="_blank" rel="noreferrer"
                  style={{fontSize:"0.75rem",color:"var(--accent2)",fontFamily:"Inconsolata,monospace",textDecoration:"none"}}>Full history in Google Sheet →</a>
              </div>
              {log.length===0
                ?<div className="log-empty">No entries yet this session.<br/>Save some data from the Entry Form to see it here.</div>
                :<>
                  <div style={{overflowX:"auto"}}>
                    <table className="log-table">
                      <thead><tr><th>Date</th><th>Market</th><th>Day</th><th>Boxes</th><th>Revenue</th><th>Tips</th><th>Bonus</th><th>Total</th></tr></thead>
                      <tbody>
                        {log.map((r,i)=>(
                          <tr key={i}>
                            <td style={{fontFamily:"Inconsolata,monospace",fontSize:"0.78rem"}}>{fmtDate(r.date)}</td>
                            <td style={{maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:"0.8rem"}}>{r.market}</td>
                            <td><span className={dayBadgeClass(r.day)}>{r.day||"—"}</span></td>
                            <td style={{textAlign:"center",fontFamily:"Inconsolata,monospace"}}>{r.containers}</td>
                            <td style={{fontFamily:"Inconsolata,monospace",color:"var(--green)"}}>{fmt(r.revenue)}</td>
                            <td style={{fontFamily:"Inconsolata,monospace",color:"var(--purple)"}}>{fmt(r.tips)}</td>
                            <td style={{fontFamily:"Inconsolata,monospace",color:"var(--teal)"}}>{r.bonus>0?fmt(r.bonus):"—"}</td>
                            <td style={{fontFamily:"Inconsolata,monospace",color:"var(--accent)",fontWeight:600}}>{fmt((r.revenue||0)+(r.tips||0)+(r.bonus||0))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="log-summary">
                    <div className="log-sum-row"><span>Total Containers</span><span style={{fontFamily:"Inconsolata,monospace"}}>{logContainers}</span></div>
                    <div className="log-sum-row"><span>Sales Revenue</span><span style={{fontFamily:"Inconsolata,monospace",color:"var(--green)"}}>{fmt(log.reduce((s,r)=>s+(r.revenue||0),0))}</span></div>
                    <div className="log-sum-row"><span>Tips</span><span style={{fontFamily:"Inconsolata,monospace",color:"var(--purple)"}}>{fmt(logTips)}</span></div>
                    <div className="log-sum-row"><span>Bonus</span><span style={{fontFamily:"Inconsolata,monospace",color:"var(--teal)"}}>{fmt(logBonus)}</span></div>
                    <div className="log-sum-row"><span>Session Total</span><span style={{fontFamily:"Inconsolata,monospace"}}>{fmt(logTotal)}</span></div>
                  </div>
                </>
              }
            </>
          )}

          {/* ══ SUMMARY ═══════════════════════════════════════════════════════ */}
          {tab==="summary"&&(
            <>
              <div className="section-card">
                <div className="section-title">This Week's Estimate</div>
                <div className="totals-row" style={{marginBottom:0,borderBottom:"none",paddingBottom:0}}>
                  <div className="total-item"><div className="total-lbl">Boxes</div><div className="total-val tv-b">{totalContainers}</div></div>
                  <div className="total-item"><div className="total-lbl">Sales</div><div className="total-val tv-r">{fmt(totalRevenue)}</div></div>
                  <div className="total-item"><div className="total-lbl">Tips</div><div className="total-val tv-t">{fmt(totalTips)}</div></div>
                  <div className="total-item"><div className="total-lbl">Bonus</div><div className="total-val tv-bo">{fmt(totalBonus)}</div></div>
                  <div className="total-item"><div className="total-lbl">Total</div><div className="total-val tv-to">{fmt(totalCombined)}</div></div>
                </div>
              </div>

              <div className="section-card">
                <div className="section-title">Revenue Projection</div>
                <div className="summary-grid">
                  <div className="summary-box week"><div className="summary-period">This Week</div><div className="summary-amount">{fmt(totalCombined)}</div><div className="summary-sub">{totalContainers} boxes</div></div>
                  <div className="summary-box month"><div className="summary-period">Est. Month</div><div className="summary-amount">{fmt(totalCombined*4)}</div><div className="summary-sub">×4 weeks</div></div>
                  <div className="summary-box year"><div className="summary-period">Est. Year</div><div className="summary-amount">{fmt(totalCombined*52)}</div><div className="summary-sub">×52 weeks</div></div>
                </div>
                <div style={{fontSize:"0.72rem",color:"var(--muted)",fontFamily:"Inconsolata,monospace",textAlign:"center"}}>
                  * Monthly and yearly figures are estimates based on this week's numbers
                </div>
              </div>

              <div className="section-card">
                <div className="section-title">Session Log Summary</div>
                {log.length===0
                  ?<div style={{fontSize:"0.85rem",color:"var(--muted)",textAlign:"center",padding:"16px 0"}}>No data saved yet this session.</div>
                  :<>
                    <div className="log-sum-row" style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:"0.85rem",borderBottom:"1px solid var(--border)"}}><span>Entries Saved</span><span style={{fontFamily:"Inconsolata,monospace"}}>{log.length}</span></div>
                    <div className="log-sum-row" style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:"0.85rem",borderBottom:"1px solid var(--border)"}}><span>Total Containers</span><span style={{fontFamily:"Inconsolata,monospace"}}>{logContainers}</span></div>
                    <div className="log-sum-row" style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:"0.85rem",borderBottom:"1px solid var(--border)"}}><span>Total Revenue</span><span style={{fontFamily:"Inconsolata,monospace",color:"var(--green)"}}>{fmt(log.reduce((s,r)=>s+(r.revenue||0),0))}</span></div>
                    <div className="log-sum-row" style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:"0.85rem",borderBottom:"1px solid var(--border)"}}><span>Total Tips</span><span style={{fontFamily:"Inconsolata,monospace",color:"var(--purple)"}}>{fmt(logTips)}</span></div>
                    <div className="log-sum-row" style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:"0.85rem",fontWeight:600,color:"var(--accent)"}}><span>Session Total</span><span style={{fontFamily:"Inconsolata,monospace"}}>{fmt(logTotal)}</span></div>
                  </>
                }
                <div style={{marginTop:12}}>
                  <a href={`https://docs.google.com/spreadsheets/d/${SHEET_ID}`} target="_blank" rel="noreferrer"
                    style={{fontSize:"0.8rem",color:"var(--accent2)",fontFamily:"Inconsolata,monospace",textDecoration:"none"}}>
                    📊 See full history in Google Sheet →
                  </a>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}
