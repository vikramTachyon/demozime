const express = require('express');
const crypto  = require('crypto');

const app  = express();
const PORT = process.env.PORT || 3000;

const CONSUMER_SECRET = process.env.CANVAS_CONSUMER_SECRET || 'DEMO_SECRET_REPLACE_ME';

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ─────────────────────────────────────────────────────
// BLOCKED PAGE HTML
// ─────────────────────────────────────────────────────
function getBlockedHTML() {
  return `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Inter', sans-serif;
      background: #060F1E;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      flex-direction: column;
      gap: 16px;
    }
    .icon { font-size: 48px; }
    h1 { font-size: 22px; font-weight: 700; }
    p {
      font-size: 14px;
      color: rgba(255,255,255,0.45);
      text-align: center;
      max-width: 340px;
      line-height: 1.6;
    }
    .badge {
      background: rgba(248,113,113,0.1);
      border: 1px solid rgba(248,113,113,0.3);
      color: #FCA5A5;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="icon">🔒</div>
  <div class="badge">Access Restricted</div>
  <h1>Canvas Integration Required</h1>
  <p>This dashboard is only accessible through Salesforce Canvas. Direct access is not permitted.</p>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────
// DASHBOARD HTML
// ─────────────────────────────────────────────────────
function getDashboardHTML(recordId, objectName, recordName, userName) {
  recordId   = recordId   || 'DEMO001';
  objectName = objectName || 'Account';
  recordName = recordName || 'Acme Corp';
  userName   = userName   || 'John Smith';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Zime</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
:root{
  --bg:#060F1E;--surface:#0D1B2E;--surface2:#112236;
  --border:rgba(255,255,255,.07);--border2:rgba(255,255,255,.14);
  --text:#F0F4FF;--muted:rgba(255,255,255,.45);
  --green:#00C896;--blue:#3B82F6;--yellow:#F59E0B;--red:#F87171;--coral:#E8470A;
}
html,body{height:100%;overflow:hidden;}
body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);font-size:13px;display:flex;flex-direction:column;}
@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.topbar{height:50px;background:var(--surface);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 18px;gap:12px;flex-shrink:0;}
.logo{display:flex;align-items:center;gap:8px;font-size:16px;font-weight:800;letter-spacing:-.03em;}
.logo-mark{width:28px;height:28px;border-radius:7px;background:linear-gradient(135deg,#E8470A,#FF8C42);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;color:white;}
.nav{display:flex;align-items:center;gap:2px;margin-left:10px;}
.nav-item{padding:5px 11px;border-radius:5px;font-size:12px;font-weight:500;color:var(--muted);cursor:pointer;transition:all .2s;}
.nav-item:hover,.nav-item.active{color:var(--text);background:rgba(255,255,255,.08);}
.ctx{margin-left:auto;display:flex;align-items:center;gap:6px;background:rgba(0,200,150,.08);border:1px solid rgba(0,200,150,.2);border-radius:20px;padding:4px 12px;font-size:11px;color:var(--green);font-weight:600;}
.ctx-dot{width:6px;height:6px;border-radius:50%;background:var(--green);animation:pulse 1.5s infinite;}
.auth{display:flex;align-items:center;gap:5px;background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.2);border-radius:20px;padding:4px 10px;font-size:11px;color:#93C5FD;font-weight:500;}
.user{display:flex;align-items:center;gap:6px;}
.avatar{width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#7C3AED,#3B82F6);display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:700;}
.uname{font-size:11px;color:var(--muted);}
.metrics{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid var(--border);flex-shrink:0;}
.metric{padding:14px 18px;border-right:1px solid var(--border);animation:fadeUp .4s ease both;}
.metric:last-child{border-right:none;}
.metric:nth-child(1){animation-delay:.05s}.metric:nth-child(2){animation-delay:.1s}.metric:nth-child(3){animation-delay:.15s}.metric:nth-child(4){animation-delay:.2s}
.mlabel{font-size:10px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px;}
.mvalue{font-size:24px;font-weight:800;letter-spacing:-.02em;line-height:1;margin-bottom:3px;}
.mchange{font-size:11px;font-weight:500;}
.up{color:var(--green);}.dn{color:var(--red);}.nt{color:var(--muted);}
.grid{display:grid;grid-template-columns:1fr 290px;flex:1;overflow:hidden;}
.lcol{display:flex;flex-direction:column;border-right:1px solid var(--border);overflow:hidden;}
.rcol{display:flex;flex-direction:column;overflow-y:auto;}
.panel{background:var(--surface);border-bottom:1px solid var(--border);padding:14px 18px;animation:fadeUp .5s ease both;}
.ptitle{font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;}
.ptitle-r{font-size:10px;color:rgba(255,255,255,.2);font-weight:400;text-transform:none;letter-spacing:0;}
.score-sec{display:flex;align-items:center;gap:18px;}
.ring{width:78px;height:78px;border-radius:50%;display:flex;align-items:center;justify-content:center;position:relative;flex-shrink:0;}
.ring::before{content:'';position:absolute;inset:0;border-radius:50%;background:conic-gradient(var(--green) 0% var(--pct,78%),rgba(255,255,255,.06) var(--pct,78%) 100%);}
.ring-inner{width:58px;height:58px;border-radius:50%;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;z-index:1;}
.ring-num{font-size:19px;font-weight:800;line-height:1;}
.ring-lbl{font-size:9px;color:var(--muted);}
.sdetails{flex:1;}
.stitle{font-size:13px;font-weight:700;margin-bottom:2px;}
.ssub{font-size:11px;color:var(--green);margin-bottom:7px;}
.bars{display:flex;flex-direction:column;gap:4px;}
.bar-row{display:flex;align-items:center;gap:7px;}
.bar-lbl{font-size:10px;color:var(--muted);width:80px;flex-shrink:0;}
.bar-track{flex:1;height:4px;border-radius:2px;background:rgba(255,255,255,.07);overflow:hidden;}
.bar-fill{heig
