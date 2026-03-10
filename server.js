const express = require('express');
const crypto  = require('crypto');

const app  = express();
const PORT = process.env.PORT || 3000;

const CONSUMER_SECRET = process.env.CANVAS_CONSUMER_SECRET || 'DEMO_SECRET_REPLACE_ME';

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ─────────────────────────────────────────────────────
// DASHBOARD HTML — fully embedded, no external files
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
/* TOPBAR */
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
/* METRICS */
.metrics{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid var(--border);flex-shrink:0;}
.metric{padding:14px 18px;border-right:1px solid var(--border);animation:fadeUp .4s ease both;}
.metric:last-child{border-right:none;}
.metric:nth-child(1){animation-delay:.05s}.metric:nth-child(2){animation-delay:.1s}.metric:nth-child(3){animation-delay:.15s}.metric:nth-child(4){animation-delay:.2s}
.mlabel{font-size:10px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px;}
.mvalue{font-size:24px;font-weight:800;letter-spacing:-.02em;line-height:1;margin-bottom:3px;}
.mchange{font-size:11px;font-weight:500;}
.up{color:var(--green);}.dn{color:var(--red);}.nt{color:var(--muted);}
/* GRID */
.grid{display:grid;grid-template-columns:1fr 290px;flex:1;overflow:hidden;}
.lcol{display:flex;flex-direction:column;border-right:1px solid var(--border);overflow:hidden;}
.rcol{display:flex;flex-direction:column;overflow-y:auto;}
.panel{background:var(--surface);border-bottom:1px solid var(--border);padding:14px 18px;animation:fadeUp .5s ease both;}
.ptitle{font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;}
.ptitle-r{font-size:10px;color:rgba(255,255,255,.2);font-weight:400;text-transform:none;letter-spacing:0;}
/* SCORE */
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
.bar-fill{height:100%;border-radius:2px;background:var(--green);transition:width 1s cubic-bezier(.4,0,.2,1);}
.bar-fill.y{background:var(--yellow);}
.bar-val{font-size:10px;color:var(--muted);width:24px;text-align:right;}
/* TIMELINE */
.tl{display:flex;flex-direction:column;overflow-y:auto;flex:1;}
.tl-item{display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);animation:fadeUp .4s ease both;}
.tl-item:last-child{border-bottom:none;}
.tl-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:3px;}
.tl-dot.g{background:var(--green);}.tl-dot.b{background:var(--blue);}.tl-dot.y{background:var(--yellow);}.tl-dot.r{background:var(--red);}
.tl-t{font-size:12px;font-weight:500;margin-bottom:1px;}
.tl-m{font-size:10px;color:var(--muted);}
/* INSIGHTS */
.ins{display:flex;flex-direction:column;gap:7px;}
.ins-card{background:var(--surface2);border:1px solid var(--border);border-radius:7px;padding:9px 11px;display:flex;gap:9px;cursor:pointer;transition:border-color .2s;animation:fadeUp .5s ease both;}
.ins-card:hover{border-color:var(--border2);}
.ins-icon{font-size:15px;flex-shrink:0;margin-top:1px;}
.ins-title{font-size:12px;font-weight:600;margin-bottom:2px;}
.ins-desc{font-size:11px;color:var(--muted);line-height:1.5;}
.ins-tag{display:inline-block;font-size:10px;font-weight:600;padding:2px 6px;border-radius:8px;margin-top:4px;}
.tr{background:rgba(248,113,113,.12);color:#FCA5A5;}
.ta{background:rgba(0,200,150,.1);color:var(--green);}
.ti{background:rgba(59,130,246,.1);color:#93C5FD;}
/* TASKS */
.tasks{display:flex;flex-direction:column;gap:5px;}
.task{display:flex;align-items:flex-start;gap:8px;padding:7px 9px;background:var(--surface2);border:1px solid var(--border);border-radius:6px;cursor:pointer;transition:border-color .2s;animation:fadeUp .5s ease both;}
.task:hover{border-color:var(--border2);}
.tcheck{width:14px;height:14px;border-radius:3px;border:1.5px solid rgba(255,255,255,.2);flex-shrink:0;margin-top:1px;display:flex;align-items:center;justify-content:center;font-size:9px;}
.tcheck.done{background:var(--green);border-color:var(--green);color:white;}
.ttext{flex:1;font-size:12px;line-height:1.4;}
.ttext.done{text-decoration:line-through;color:var(--muted);}
.tdue{font-size:10px;color:var(--muted);white-space:nowrap;}
.tdue.ov{color:var(--red);}
/* TOAST */
.toast{position:fixed;bottom:18px;right:18px;background:rgba(0,200,150,.12);border:1px solid rgba(0,200,150,.3);border-radius:8px;padding:9px 14px;display:flex;align-items:center;gap:8px;font-size:12px;color:var(--green);font-weight:500;z-index:999;animation:fadeUp .4s ease;box-shadow:0 8px 32px rgba(0,0,0,.4);}
::-webkit-scrollbar{width:3px;height:3px;}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:2px;}
</style>
</head>
<body>
<div class="topbar">
  <div class="logo"><div class="logo-mark">Z</div>zime</div>
  <div class="nav">
    <div class="nav-item active">Dashboard</div>
    <div class="nav-item">Pipeline</div>
    <div class="nav-item">Coaching</div>
    <div class="nav-item">Analytics</div>
  </div>
  <div class="ctx"><span class="ctx-dot"></span><span id="ctxText"></span></div>
  <div class="auth">🔐 Canvas Authenticated</div>
  <div class="user"><div class="avatar" id="av"></div><span class="uname" id="un"></span></div>
</div>

<div class="metrics">
  <div class="metric"><div class="mlabel">Deal Health Score</div><div class="mvalue" id="m1"></div><div class="mchange up" id="m1c"></div></div>
  <div class="metric"><div class="mlabel">Engagement Rate</div><div class="mvalue" id="m2"></div><div class="mchange up" id="m2c"></div></div>
  <div class="metric"><div class="mlabel" id="m3l"></div><div class="mvalue" id="m3"></div><div class="mchange dn" id="m3c"></div></div>
  <div class="metric"><div class="mlabel" id="m4l"></div><div class="mvalue" id="m4" style="font-size:17px"></div><div class="mchange nt" id="m4c"></div></div>
</div>

<div class="grid">
  <div class="lcol">
    <div class="panel" style="animation-delay:.1s">
      <div class="ptitle">Relationship Score<span class="ptitle-r" id="rlabel"></span></div>
      <div class="score-sec">
        <div class="ring" id="ring" style="--pct:78%"><div class="ring-inner"><div class="ring-num" id="snum">78</div><div class="ring-lbl">/ 100</div></div></div>
        <div class="sdetails">
          <div class="stitle" id="stitle"></div><div class="ssub" id="ssub"></div>
          <div class="bars">
            <div class="bar-row"><div class="bar-lbl">Engagement</div><div class="bar-track"><div class="bar-fill" id="b1"></div></div><div class="bar-val" id="b1v"></div></div>
            <div class="bar-row"><div class="bar-lbl">Responsiveness</div><div class="bar-track"><div class="bar-fill" id="b2"></div></div><div class="bar-val" id="b2v"></div></div>
            <div class="bar-row"><div class="bar-lbl">Risk Level</div><div class="bar-track"><div class="bar-fill y" id="b3"></div></div><div class="bar-val" id="b3v"></div></div>
          </div>
        </div>
      </div>
    </div>
    <div class="panel" style="flex:1;animation-delay:.15s;overflow:hidden;display:flex;flex-direction:column;">
      <div class="ptitle">Activity Timeline<span class="ptitle-r" id="tlctx"></span></div>
      <div class="tl" id="tl"></div>
    </div>
  </div>
  <div class="rcol">
    <div class="panel" style="animation-delay:.2s"><div class="ptitle">🤖 AI Insights<span class="ptitle-r">Real-time</span></div><div class="ins" id="ins"></div></div>
    <div class="panel" style="animation-delay:.25s"><div class="ptitle">Next Best Actions<span class="ptitle-r">AI Suggested</span></div><div class="tasks" id="tasks"></div></div>
  </div>
</div>

<div class="toast" id="toast">✅ Salesforce Canvas verified — auto-authenticated, no login required</div>

<script>
const oN='${objectName}', rN='${recordName}', uN='${userName}';
const D={
  Account:{
    ctx:'Account: '+rN,
    m1:'78',m1c:'↑ +5 this week',m2:'64%',m2c:'↑ +12% vs last month',
    m3l:'Open Tasks',m3:'7',m3c:'⚠ 3 overdue',m4l:'Last Contact',m4:'2d ago',m4c:'Email · Opened',
    snum:'78',stitle:'Good Standing',ssub:'↑ Improving — keep momentum',
    pct:'78%',b1:'64%',b2:'80%',b3:'30%',b1v:'64%',b2v:'80%',b3v:'Low',
    tl:[
      {d:'g',t:'Email opened: Q4 Proposal sent',m:'2 days ago · '+uN},
      {d:'b',t:'Call: Discovery with Sarah Chen (CTO)',m:'5 days ago · 42 min'},
      {d:'y',t:'Meeting: Product Demo scheduled',m:'Tomorrow · 2:00 PM'},
      {d:'r',t:'Risk: No executive sponsor identified',m:'Flagged by Zime AI · High priority'},
      {d:'g',t:'Contract review started by legal',m:'1 week ago'},
    ],
    ins:[
      {i:'⚠️',t:'Missing Executive Sponsor',d:'No C-level contact identified. Deals without exec sponsors close 43% less often.',c:'tr',l:'Risk'},
      {i:'🎯',t:'High Intent Signal',d:'Sarah Chen opened your proposal 3 times in 24 hours — strong buying signal.',c:'ta',l:'Action'},
      {i:'📊',t:'MEDDIC Gap Detected',d:'Economic Buyer field is empty. Fill this before moving to Negotiation.',c:'ti',l:'Info'},
    ],
    tasks:[
      {done:true, t:'Send follow-up after demo call',due:'Done',ov:false},
      {done:false,t:'Identify executive sponsor',due:'Today',ov:true},
      {done:false,t:'Share ROI calculator with Sarah',due:'Tomorrow',ov:false},
      {done:false,t:'Schedule technical validation',due:'This week',ov:false},
    ]
  },
  Opportunity:{
    ctx:'Opportunity: '+rN,
    m1:'65',m1c:'⚠ -3 risk drop',m2:'51%',m2c:'↓ -8% this week',
    m3l:'Deal Stage',m3:'Proposal',m3c:'→ Negotiation next',m4l:'Close Date',m4:'52d',m4c:'Dec 31 · On track',
    snum:'65',stitle:'Needs Attention',ssub:'⚠ At risk — action required',
    pct:'65%',b1:'51%',b2:'60%',b3:'55%',b1v:'51%',b2v:'60%',b3v:'High',
    tl:[
      {d:'r',t:'Competitor Gong mentioned on last call',m:'1 day ago · AI detected'},
      {d:'b',t:'Pricing proposal sent ($245K)',m:'3 days ago · '+uN},
      {d:'y',t:'Legal review: MSA sent for signature',m:'5 days ago · Pending'},
      {d:'g',t:'Technical POC completed successfully',m:'2 weeks ago'},
      {d:'b',t:'Champion confirmed: Sarah Chen (CTO)',m:'3 weeks ago'},
    ],
    ins:[
      {i:'🔴',t:'Competitor Threat Detected',d:'Gong was mentioned on the last call. Prepare competitive battle card immediately.',c:'tr',l:'Urgent'},
      {i:'⏰',t:'Deal Velocity Slowing',d:'This deal has been in Proposal stage for 18 days vs avg 11. Intervene now.',c:'tr',l:'Risk'},
      {i:'✅',t:'Strong Technical Fit',d:'POC completed with 92% feature match. Use this in your negotiation.',c:'ta',l:'Leverage'},
    ],
    tasks:[
      {done:true, t:'Complete technical POC',due:'Done',ov:false},
      {done:true, t:'Send pricing proposal',due:'Done',ov:false},
      {done:false,t:'Prepare Gong competitive battle card',due:'Today',ov:true},
      {done:false,t:'Follow up on MSA signature',due:'Today',ov:true},
      {done:false,t:'Schedule executive alignment call',due:'This week',ov:false},
    ]
  }
};
const data=D[oN]||D.Account;
const ini=uN.split(' ').map(n=>n[0]).join('').toUpperCase().substr(0,2);
document.getElementById('ctxText').textContent='📌 '+data.ctx;
document.getElementById('av').textContent=ini;
document.getElementById('un').textContent=uN;
document.getElementById('m1').textContent=data.m1;document.getElementById('m1c').textContent=data.m1c;
document.getElementById('m2').textContent=data.m2;document.getElementById('m2c').textContent=data.m2c;
document.getElementById('m3l').textContent=data.m3l;document.getElementById('m3').textContent=data.m3;document.getElementById('m3c').textContent=data.m3c;
document.getElementById('m4l').textContent=data.m4l;document.getElementById('m4').textContent=data.m4;document.getElementById('m4c').textContent=data.m4c;
document.getElementById('snum').textContent=data.snum;
document.getElementById('stitle').textContent=data.stitle;
document.getElementById('ssub').textContent=data.ssub;
document.getElementById('ring').style.setProperty('--pct',data.pct);
document.getElementById('b1').style.width=data.b1;document.getElementById('b1v').textContent=data.b1v;
document.getElementById('b2').style.width=data.b2;document.getElementById('b2v').textContent=data.b2v;
document.getElementById('b3').style.width=data.b3;document.getElementById('b3v').textContent=data.b3v;
document.getElementById('rlabel').textContent=oN;
document.getElementById('tlctx').textContent=rN;
document.getElementById('tl').innerHTML=data.tl.map((t,i)=>\`<div class="tl-item" style="animation-delay:\${.05*i}s"><div class="tl-dot \${t.d}"></div><div><div class="tl-t">\${t.t}</div><div class="tl-m">\${t.m}</div></div></div>\`).join('');
document.getElementById('ins').innerHTML=data.ins.map((x,i)=>\`<div class="ins-card" style="animation-delay:\${.1+.05*i}s"><div class="ins-icon">\${x.i}</div><div><div class="ins-title">\${x.t}</div><div class="ins-desc">\${x.d}</div><span class="ins-tag \${x.c}">\${x.l}</span></div></div>\`).join('');
document.getElementById('tasks').innerHTML=data.tasks.map((t,i)=>\`<div class="task" style="animation-delay:\${.1+.05*i}s"><div class="tcheck \${t.done?'done':''}">\${t.done?'✓':''}</div><div class="ttext \${t.done?'done':''}">\${t.t}</div><div class="tdue \${t.ov?'ov':''}">\${t.due}</div></div>\`).join('');
setTimeout(()=>{const t=document.getElementById('toast');t.style.transition='opacity .3s';t.style.opacity='0';setTimeout(()=>t.remove(),300);},4000);
</script>
</body>
</html>`;
}

// ROOT
app.get('/', (req, res) => {
  res.send(`<html><head><style>body{font-family:sans-serif;background:#032D60;color:white;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;gap:12px;}h1{font-size:28px;}p{color:rgba(255,255,255,.6);font-size:14px;}a{color:#00C896;}code{background:rgba(255,255,255,.1);padding:2px 8px;border-radius:4px;}</style></head><body><h1>⚡ Zime Canvas Server Running</h1><p>Canvas endpoint: <code>POST /canvas</code></p><p>Demo: <a href="/dashboard">/dashboard</a></p><p>Status: <span style="color:#4ADE80">● Live</span></p></body></html>`);
});

// DASHBOARD — GET
// X-Frame-Options: DENY blocks any iframe embedding of this URL
// This proves the site blocks iframes — just like zime.ai does
app.get('/dashboard', (req, res) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
  const { recordId, objectName, recordName, userName } = req.query;
  res.send(getDashboardHTML(recordId, objectName, recordName, userName));
});

// CANVAS — POST (Salesforce sends signed_request here)
// NO X-Frame-Options here — Canvas uses POST not iframe, so it bypasses the block
app.post('/canvas', (req, res) => {
  const signedRequest = req.body.signed_request;

  if (!signedRequest || CONSUMER_SECRET === 'DEMO_SECRET_REPLACE_ME') {
    return res.send(getDashboardHTML('DEMO001', 'Account', 'Acme Corp', 'Demo User'));
  }

  try {
    const parts    = signedRequest.split('.');
    const sig      = Buffer.from(parts[0], 'base64');
    const payload  = parts[1];
    const expected = crypto.createHmac('sha256', CONSUMER_SECRET).update(payload).digest();

    if (!crypto.timingSafeEqual(sig, expected)) {
      return res.status(403).send('Invalid Canvas signature');
    }

    const ctx = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    res.send(getDashboardHTML(
      ctx.parameters?.recordId,
      ctx.parameters?.objectName,
      ctx.parameters?.recordName,
      ctx.context?.user?.fullName
    ));
  } catch (err) {
    console.error('Canvas error:', err);
    res.status(500).send('Error: ' + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`✅ Zime Canvas server on port ${PORT}`);
});
