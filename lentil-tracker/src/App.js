import { useState, useRef, useCallback } from "react";

const SHEET_ID = "1YlGe_7zQcG0vTIkLmLQc9nEobLThDYvzSi3lW5kFbYE";
const DEFAULT_PRICE = 8;

const MARKETS = [
  { name: "Grove St — Monday",       day: "Monday"    },
  { name: "Maplewood FM",            day: "Monday"    },
  { name: "Riverdale FM",            day: "Tuesday"   },
  { name: "Hamilton Park FM",        day: "Wednesday" },
  { name: "South Orange FM",         day: "Wednesday" },
  { name: "Grove St — Thursday",     day: "Thursday"  },
  { name: "67th Street Flea Market", day: "Saturday"  },
  { name: "Roosevelt Island FM",     day: "Saturday"  },
  { name: "Hell's Kitchen FM",       day: "Saturday"  },
  { name: "Morris Plains FM",        day: "Saturday"  },
  { name: "Metuchen FM",             day: "Saturday"  },
  { name: "Stamford FM",             day: "Saturday"  },
  { name: "Columbus / Grand Bazaar", day: "Sunday"    },
  { name: "Murray Hill FM",          day: "Sunday"    },
  { name: "Nutley FM",               day: "Sunday"    },
];

const DAY_COLORS = {
  Monday: "#4A90D9", Tuesday: "#E67E3A", Wednesday: "#7CB87A",
  Thursday: "#C06BBF", Saturday: "#E8B84B", Sunday: "#E05C5C",
};
const DAYS_ORDER = ["Monday","Tuesday","Wednesday","Thursday","Saturday","Sunday"];
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

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Sans+3:wght@300;400;600&family=Inconsolata:wght@400;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0F1117; --surface: #181C27; --surface2: #1E2433;
    --border: #2A2F42; --accent: #E8A44A; --accent2: #5B8FD4;
    --text: #E8E4DC; --muted: #6B7080; --green: #5CB87A;
    --red: #E05C5C; --purple: #C06BBF;
  }
  body { background: var(--bg); color: var(--text); font-family: 'Source Sans 3', sans-serif; }
  .app { min-height: 100vh; background: var(--bg); padding-bottom: 60px; }
  .hero { background: linear-gradient(135deg, #0F1117 0%, #1A1F30 50%, #0F1117 100%);
    border-bottom: 1px solid var(--border); padding: 28px 20px 20px; text-align: center; position: relative; overflow: hidden; }
  .hero::before { content:''; position:absolute; top:-40px; left:50%; transform:translateX(-50%);
    width:300px; height:300px; background:radial-gradient(circle, rgba(232,164,74,0.08) 0%, transparent 70%); pointer-events:none; }
  .hero-eyebrow { font-family:'Inconsolata',monospace; font-size:0.7rem; letter-spacing:0.2em; color:var(--accent); text-transform:uppercase; margin-bottom:6px; }
  .hero h1 { font-family:'Playfair Display',serif; font-size:2rem; font-weight:900; color:var(--text); line-height:1.1; margin-bottom:4px; }
  .hero h1 span { color:var(--accent); }
  .hero-sub { font-size:0.82rem; color:var(--muted); font-weight:300; }
  .sheet-pill { display:inline-flex; align-items:center; gap:6px; margin-top:12px; padding:5px 14px;
    background:rgba(91,143,212,0.12); border:1px solid rgba(91,143,212,0.3); border-radius:20px;
    font-family:'Inconsolata',monospace; font-size:0.72rem; color:var(--accent2); text-decoration:none; transition:background 0.2s; }
  .sheet-pill:hover { background:rgba(91,143,212,0.2); }
  .tabs { display:flex; max-width:680px; margin:18px auto 0; padding:0 16px; gap:8px; }
  .tab { flex:1; padding:10px; border-radius:10px; border:1px solid var(--border);
    background:var(--surface); color:var(--muted); font-family:'Source Sans 3',sans-serif;
    font-size:0.85rem; font-weight:600; cursor:pointer; transition:all 0.2s; text-align:center; }
  .tab.active { background:var(--accent); color:#0F1117; border-color:var(--accent); }
  .tab:not(.active):hover { border-color:var(--accent); color:var(--accent); }
  .controls { max-width:680px; margin:12px auto 0; padding:0 16px; display:flex; flex-wrap:wrap; gap:10px; align-items:center; }
  .ctrl-group { display:flex; align-items:center; gap:8px; }
  .ctrl-label { font-family:'Inconsolata',monospace; font-size:0.7rem; color:var(--muted); letter-spacing:0.1em; white-space:nowrap; }
  .ctrl-input { background:var(--surface); border:1px solid var(--border); border-radius:8px;
    padding:8px 12px; color:var(--text); font-family:'Inconsolata',monospace; font-size:0.88rem; outline:none; transition:border-color 0.2s; }
  .ctrl-input:focus { border-color:var(--accent); }
  .price-input { width:90px; color:var(--accent); font-weight:600; text-align:center; }
  .content { max-width:680px; margin:0 auto; padding:20px 16px 0; }
  .drop-zone { border:2px dashed var(--border); border-radius:12px; padding:40px 20px;
    text-align:center; cursor:pointer; transition:all 0.2s; background:var(--surface); position:relative; }
  .drop-zone:hover, .drop-zone.drag-over { border-color:var(--accent); background:rgba(232,164,74,0.05); }
  .drop-zone input { position:absolute; inset:0; opacity:0; cursor:pointer; width:100%; height:100%; }
  .drop-icon { font-size:2.6rem; margin-bottom:10px; display:block; }
  .drop-text { font-size:0.95rem; color:var(--text); margin-bottom:4px; font-weight:600; }
  .drop-sub { font-size:0.78rem; color:var(--muted); font-family:'Inconsolata',monospace; }
  .preview-img { width:100%; max-height:260px; object-fit:contain; border-radius:10px; border:1px solid var(--border); margin-bottom:14px; }
  .btn { display:inline-flex; align-items:center; justify-content:center; gap:8px;
    padding:11px 24px; border-radius:9px; font-family:'Source Sans 3',sans-serif;
    font-size:0.9rem; font-weight:600; cursor:pointer; transition:all 0.18s; border:none; }
  .btn-accent { background:var(--accent); color:#0F1117; width:100%; }
  .btn-accent:hover { background:#F0B85A; }
  .btn-accent:disabled { background:#5A4A2A; color:#8A7A5A; cursor:not-allowed; }
  .btn-outline { background:transparent; border:1px solid var(--border); color:var(--muted); }
  .btn-outline:hover { border-color:var(--red); color:var(--red); }
  .btn-green { background:var(--green); color:#0F1117; width:100%; }
  .btn-green:hover { background:#70D490; }
  .btn-green:disabled { background:#2A5A3A; color:#5A8A6A; cursor:not-allowed; }
  .btn-sm { padding:7px 14px; font-size:0.82rem; }
  .action-row { display:flex; gap:10px; align-items:center; }
  .flex1 { flex:1; }
  .status { padding:10px 14px; border-radius:8px; font-family:'Inconsolata',monospace; font-size:0.82rem; margin-bottom:12px; }
  .status.ok    { background:rgba(92,184,122,0.1);  border:1px solid rgba(92,184,122,0.25);  color:var(--green); }
  .status.error { background:rgba(224,92,92,0.1);   border:1px solid rgba(224,92,92,0.25);   color:var(--red); }
  .status.info  { background:rgba(91,143,212,0.1);  border:1px solid rgba(91,143,212,0.25);  color:var(--accent2); }
  .raw-note { background:var(--surface2); border:1px solid var(--border); border-radius:8px;
    padding:14px; font-family:'Inconsolata',monospace; font-size:0.8rem; color:var(--muted);
    white-space:pre-wrap; line-height:1.6; margin-bottom:14px; }
  .micro-label { font-family:'Inconsolata',monospace; font-size:0.65rem; color:var(--muted); letter-spacing:0.1em; text-transform:uppercase; margin-bottom:6px; }
  .scan-table { width:100%; border-collapse:collapse; margin-bottom:14px; font-size:0.88rem; }
  .scan-table th { background:var(--surface2); color:var(--muted); padding:9px 10px;
    text-align:left; font-family:'Inconsolata',monospace; font-size:0.68rem; letter-spacing:0.08em; border-bottom:1px solid var(--border); }
  .scan-table td { padding:8px 10px; border-bottom:1px solid var(--border); vertical-align:middle; }
  .scan-table tr:last-child td { border-bottom:none; }
  .scan-table input, .scan-table select { background:var(--surface2); border:1px solid var(--border);
    border-radius:6px; padding:5px 8px; font-family:'Inconsolata',monospace; font-size:0.82rem;
    color:var(--text); width:100%; outline:none; }
  .scan-table input:focus, .scan-table select:focus { border-color:var(--accent); }
  .del-btn { background:none; border:none; color:var(--muted); cursor:pointer; font-size:1rem; padding:2px 6px; border-radius:4px; transition:color 0.15s; }
  .del-btn:hover { color:var(--red); }
  .add-row { background:none; border:1px dashed var(--border); border-radius:7px; color:var(--muted);
    padding:7px; font-size:0.82rem; cursor:pointer; width:100%; margin-bottom:14px;
    font-family:'Source Sans 3',sans-serif; transition:all 0.15s; }
  .add-row:hover { border-color:var(--accent); color:var(--accent); }
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
    padding:8px 10px; color:var(--text); font-family:'Inconsolata',monospace; font-size:0.95rem; outline:none; transition:border-color 0.2s; width:100%; }
  .market-input:focus { border-color:var(--accent); }
  .tip-input:focus { border-color:var(--purple); }
  .market-rev { font-family:'Inconsolata',monospace; font-size:0.85rem; color:var(--green);
    font-weight:600; padding:8px 10px; background:rgba(92,184,122,0.07); border:1px solid rgba(92,184,122,0.15); border-radius:7px; display:flex; align-items:center; }
  .summary-card { background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:20px; margin-top:24px; }
  .summary-title { font-family:'Playfair Display',serif; font-size:1.1rem; font-weight:700; margin-bottom:16px; color:var(--accent); }
  .summary-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:16px; }
  .summary-box { border-radius:10px; padding:14px 12px; text-align:center; }
  .summary-box.week  { background:rgba(91,143,212,0.1);  border:1px solid rgba(91,143,212,0.2); }
  .summary-box.month { background:rgba(232,164,74,0.1);  border:1px solid rgba(232,164,74,0.2); }
  .summary-box.year  { background:rgba(224,92,92,0.08);  border:1px solid rgba(224,92,92,0.15); }
  .summary-period { font-family:'Inconsolata',monospace; font-size:0.65rem; letter-spacing:0.12em; text-transform:uppercase; color:var(--muted); margin-bottom:6px; }
  .summary-amount { font-family:'Playfair Display',serif; font-size:1.3rem; font-weight:700; color:var(--text); line-height:1; margin-bottom:2px; }
  .summary-sub { font-size:0.7rem; color:var(--muted); font-family:'Inconsolata',monospace; }
  .totals-row { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; padding-top:14px; border-top:1px solid var(--border); }
  .total-item { text-align:center; }
  .total-label { font-family:'Inconsolata',monospace; font-size:0.65rem; color:var(--muted); letter-spacing:0.08em; text-transform:uppercase; margin-bottom:4px; }
  .total-value { font-family:'Inconsolata',monospace; font-size:1rem; font-weight:600; }
  .tv-boxes { color:var(--text); } .tv-rev { color:var(--green); } .tv-tips { color:var(--purple); } .tv-total { color:var(--accent); }
  .save-btn { width:100%; margin-top:16px; padding:14px; background:var(--accent); color:#0F1117;
    border:none; border-radius:10px; font-family:'Playfair Display',serif; font-size:1rem;
    font-weight:700; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:8px; }
  .save-btn:hover { background:#F0B85A; transform:translateY(-1px); }
  .save-btn:disabled { background:#5A4A2A; color:#8A7A5A; cursor:not-allowed; transform:none; }
  .success-box { background:rgba(92,184,122,0.1); border:1px solid rgba(92,184,122,0.3); border-radius:10px; padding:14px; text-align:center; margin-top:12px; }
  .success-box p { color:var(--green); font-size:0.88rem; margin-bottom:8px; }
  .success-box a { color:var(--accent2); font-size:0.82rem; }
  .reset-btn { background:none; border:1px solid var(--border); border-radius:8px; color:var(--muted);
    padding:8px 16px; font-family:'Source Sans 3',sans-serif; font-size:0.82rem; cursor:pointer; width:100%; margin-top:8px; transition:all 0.2s; }
  .reset-btn:hover { border-color:var(--red); color:var(--red); }
  .spinner { width:16px; height:16px; border:2px solid rgba(15,17,23,0.3); border-top-color:#0F1117; border-radius:50%; animation:spin 0.7s linear infinite; display:inline-block; }
  @keyframes spin { to { transform:rotate(360deg); } }
`;

export default function App() {
  const [mode, setMode] = useState("manual");
  const [weekDate, setWeekDate] = useState(getMonday());
  const [price, setPrice] = useState(DEFAULT_PRICE);

  const [manualData, setManualData] = useState(emptyData());
  const [manualSaved, setManualSaved] = useState(false);
  const [manualSaving, setManualSaving] = useState(false);
  const [manualStatus, setManualStatus] = useState(null);

  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [rawText, setRawText] = useState(null);
  const [scanRows, setScanRows] = useState([]);
  const [scanSaved, setScanSaved] = useState(false);
  const [scanSaving, setScanSaving] = useState(false);
  const [scanStatus, setScanStatus] = useState(null);
  const fileRef = useRef();

  const updateManual = (market, field, val) => {
    setManualSaved(false);
    setManualData(prev => ({ ...prev, [market]: { ...prev[market], [field]: Number(val)||0 } }));
  };

  const totalContainers = MARKETS.reduce((s,m)=>s+(manualData[m.name].containers||0),0);
  const totalRevenue = totalContainers * price;
  const totalTips = MARKETS.reduce((s,m)=>s+(manualData[m.name].tips||0),0);
  const totalCombined = totalRevenue + totalTips;

  const callAPI = async (content) => {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        model:"claude-sonnet-4-20250514", max_tokens:1000,
        messages:[{role:"user",content}],
        mcp_servers:[{type:"url",url:"https://drivemcp.googleapis.com/mcp/v1",name:"gdrive"}]
      })
    });
    const d = await res.json();
    const txt = d.content.filter(i=>i.type==="text").map(i=>i.text).join(" ").toLowerCase();
    const tool = d.content.filter(i=>i.type==="mcp_tool_result");
    return tool.length>0||txt.includes("success")||txt.includes("upload");
  };

  const saveManual = async () => {
    setManualSaving(true); setManualSaved(false); setManualStatus(null);
    const scannedOn = new Date().toLocaleString();
    const rows = MARKETS
      .filter(m=>manualData[m.name].containers>0||manualData[m.name].tips>0)
      .map(m=>{
        const c=manualData[m.name].containers, t=manualData[m.name].tips, rev=c*price;
        return `${weekDate},"${m.name}","${m.day}",${c},$${rev.toFixed(2)},$${t.toFixed(2)},$${(rev+t).toFixed(2)},"${scannedOn}"`;
      }).join("\n");
    if (!rows) { setManualStatus({msg:"No data entered yet.",type:"error"}); setManualSaving(false); return; }
    try {
      const ok = await callAPI(`Append to Google Sheet ID ${SHEET_ID}. Download CSV, add rows at bottom, re-upload. No headers.\nColumns: Week Starting, Market, Day, Containers, Revenue, Tips, Total, Saved On\nRows:\n${rows}`);
      if (ok) setManualSaved(true);
      else setManualStatus({msg:"Something went wrong. Try again.",type:"error"});
    } catch { setManualStatus({msg:"Could not connect. Try again.",type:"error"}); }
    setManualSaving(false);
  };

  const resetManual = () => { setManualData(emptyData()); setManualSaved(false); setManualStatus(null); setWeekDate(getMonday()); };

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
    setScanning(true); setScanStatus({msg:"Reading your note...",type:"info"});
    const prompt = `Extract sales data from this handwritten sticky note. Known markets: ${MARKETS.map(m=>m.name).join(", ")}. Each entry has date, market, containers sold, and possibly tips. Return ONLY valid JSON no markdown: {"raw_text":"verbatim","entries":[{"date":"YYYY-MM-DD","location":"matched market","containers":12,"tips":0}],"notes":"issues"}. Match locations loosely. Assume current year if missing.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          messages:[{role:"user",content:[
            {type:"image",source:{type:"base64",media_type:"image/jpeg",data:imageBase64}},
            {type:"text",text:prompt}
          ]}]
        })
      });
      const d = await res.json();
      const parsed = JSON.parse(d.content.map(i=>i.text||"").join("").replace(/```json|```/g,"").trim());
      setRawText(parsed.raw_text||"");
      setScanRows((parsed.entries||[]).map((e,i)=>({id:Date.now()+i,date:e.date||weekDate,location:e.location||"",containers:e.containers??0,tips:e.tips??0})));
      const hasNote = parsed.notes&&parsed.notes.toLowerCase()!=="none";
      setScanStatus({msg:hasNote?`Found ${parsed.entries?.length||0} entries. Note: ${parsed.notes}`:`Found ${parsed.entries?.length||0} entries — review and save.`,type:hasNote?"error":"ok"});
    } catch { setScanStatus({msg:"Couldn't read the image. Try a clearer photo.",type:"error"}); }
    setScanning(false);
  };

  const updateScanRow = (id,field,val) => setScanRows(prev=>prev.map(r=>r.id===id?{...r,[field]:["containers","tips"].includes(field)?Number(val)||0:val}:r));
  const deleteScanRow = (id) => setScanRows(prev=>prev.filter(r=>r.id!==id));
  const addScanRow = () => setScanRows(prev=>[...prev,{id:Date.now(),date:weekDate,location:"",containers:0,tips:0}]);

  const saveScan = async () => {
    setScanSaving(true); setScanSaved(false);
    const scannedOn = new Date().toLocaleString();
    const rows = scanRows.map(r=>{const rev=(r.containers||0)*price;return `${r.date},"${r.location}","",${r.containers||0},$${rev.toFixed(2)},$${(r.tips||0).toFixed(2)},$${(rev+(r.tips||0)).toFixed(2)},"${scannedOn}"`;}).join("\n");
    try {
      const ok = await callAPI(`Append to Google Sheet ID ${SHEET_ID}. Download CSV, add rows at bottom, re-upload. No headers.\nColumns: Week Starting, Market, Day, Containers, Revenue, Tips, Total, Saved On\nRows:\n${rows}`);
      if (ok) { setScanSaved(true); setScanStatus({msg:`${scanRows.length} rows saved!`,type:"ok"}); }
      else setScanStatus({msg:"Something went wrong. Try again.",type:"error"});
    } catch { setScanStatus({msg:"Could not connect. Try again.",type:"error"}); }
    setScanSaving(false);
  };

  const resetPhoto = () => { setImage(null); setImageBase64(null); setScanRows([]); setRawText(null); setScanSaved(false); setScanStatus(null); };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="hero">
          <div className="hero-eyebrow">The Lentil Ball</div>
          <h1>Sales <span>&amp;</span> Tips</h1>
          <div className="hero-sub">Weekly market tracker</div>
          <a className="sheet-pill" href={`https://docs.google.com/spreadsheets/d/${SHEET_ID}`} target="_blank" rel="noreferrer">📊 Live Google Sheet</a>
        </div>

        <div className="tabs">
          <button className={`tab${mode==="manual"?" active":""}`} onClick={()=>setMode("manual")}>✏️ Enter Manually</button>
          <button className={`tab${mode==="photo"?" active":""}`} onClick={()=>setMode("photo")}>📸 Scan a Photo</button>
        </div>

        <div className="controls">
          <div className="ctrl-group">
            <span className="ctrl-label">WEEK OF</span>
            <input type="date" className="ctrl-input" value={weekDate} onChange={e=>setWeekDate(e.target.value)} />
          </div>
          <div className="ctrl-group">
            <span className="ctrl-label">$/BOX</span>
            <input type="number" className="ctrl-input price-input" value={price} min={1} step={0.5} onChange={e=>setPrice(Number(e.target.value)||DEFAULT_PRICE)} />
          </div>
        </div>

        <div className="content">
          {mode==="manual"&&(
            <>
              {DAYS_ORDER.map(day=>(
                <div className="day-section" key={day}>
                  <div className="day-header">
                    <div className="day-dot" style={{background:DAY_COLORS[day]}}/>
                    <div className="day-name">{day}</div>
                    <div className="day-line"/>
                  </div>
                  {byDay[day].map(market=>{
                    const c=manualData[market.name].containers||0,t=manualData[market.name].tips||0,rev=c*price;
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
              <div className="summary-card">
                <div className="summary-title">Revenue Summary</div>
                <div className="summary-grid">
                  <div className="summary-box week"><div className="summary-period">This Week</div><div className="summary-amount">{fmt(totalCombined)}</div><div className="summary-sub">{totalContainers} boxes</div></div>
                  <div className="summary-box month"><div className="summary-period">Est. Month</div><div className="summary-amount">{fmt(totalCombined*4)}</div><div className="summary-sub">×4 weeks</div></div>
                  <div className="summary-box year"><div className="summary-period">Est. Year</div><div className="summary-amount">{fmt(totalCombined*52)}</div><div className="summary-sub">×52 weeks</div></div>
                </div>
                <div className="totals-row">
                  <div className="total-item"><div className="total-label">Boxes</div><div className="total-value tv-boxes">{totalContainers}</div></div>
                  <div className="total-item"><div className="total-label">Sales</div><div className="total-value tv-rev">{fmt(totalRevenue)}</div></div>
                  <div className="total-item"><div className="total-label">Tips</div><div className="total-value tv-tips">{fmt(totalTips)}</div></div>
                  <div className="total-item"><div className="total-label">Combined</div><div className="total-value tv-total">{fmt(totalCombined)}</div></div>
                </div>
                {!manualSaved
                  ?<button className="save-btn" onClick={saveManual} disabled={manualSaving}>{manualSaving?<><span className="spinner"/>Saving...</>:"💾 Save to Google Sheets"}</button>
                  :<div className="success-box"><p>✓ Saved to your live sheet!</p><a href={`https://docs.google.com/spreadsheets/d/${SHEET_ID}`} target="_blank" rel="noreferrer">Open Google Sheet →</a></div>
                }
                {manualStatus&&<div className={`status ${manualStatus.type}`} style={{marginTop:10}}>{manualStatus.msg}</div>}
                <button className="reset-btn" onClick={resetManual}>Clear &amp; start a new week</button>
              </div>
            </>
          )}

          {mode==="photo"&&(
            <>
              {!image
                ?<div className={`drop-zone${dragging?" drag-over":""}`}
                    onDragOver={e=>{e.preventDefault();setDragging(true);}}
                    onDragLeave={()=>setDragging(false)}
                    onDrop={e=>{e.preventDefault();setDragging(false);handleFile(e.dataTransfer.files[0]);}}
                    onClick={()=>fileRef.current.click()}>
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
              {rawText&&<><div style={{marginTop:14}}><div className="micro-label">What I read from the note</div><div className="raw-note">{rawText}</div></div></>}
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
                          <td><input type="number" value={row.containers} min={0} onChange={e=>updateScanRow(row.id,"containers",e.target.value)}/></td>
                          <td><input type="number" value={row.tips} min={0} step={0.5} onChange={e=>updateScanRow(row.id,"tips",e.target.value)}/></td>
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
        </div>
      </div>
    </>
  );
}
