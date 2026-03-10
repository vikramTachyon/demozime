const express = require('express');
const crypto  = require('crypto');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── YOUR SALESFORCE CONNECTED APP CONSUMER SECRET ───
// Set this as an environment variable on Render:
//   CANVAS_CONSUMER_SECRET = <your secret from Salesforce Connected App>
const CONSUMER_SECRET = process.env.CANVAS_CONSUMER_SECRET || 'DEMO_SECRET_REPLACE_ME';

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─────────────────────────────────────────────────────
// CANVAS ENDPOINT
// Salesforce POSTs to this URL with a signed_request
// ─────────────────────────────────────────────────────
app.post('/canvas', (req, res) => {
  const signedRequest = req.body.signed_request;

  // ── DEMO MODE: no signed_request → show demo dashboard ──
  if (!signedRequest || CONSUMER_SECRET === 'DEMO_SECRET_REPLACE_ME') {
    return res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
  }

  // ── PRODUCTION MODE: verify HMAC-SHA256 signature ──
  try {
    const parts     = signedRequest.split('.');
    const signature = Buffer.from(parts[0], 'base64');
    const payload   = parts[1];

    const expected  = crypto
      .createHmac('sha256', CONSUMER_SECRET)
      .update(payload)
      .digest();

    if (!crypto.timingSafeEqual(signature, expected)) {
      return res.status(403).send('Invalid Canvas signature');
    }

    const context = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));

    // Pass context to dashboard via query params
    const userId     = encodeURIComponent(context.client?.userId     || '');
    const userName   = encodeURIComponent(context.context?.user?.fullName || '');
    const recordId   = encodeURIComponent(context.parameters?.recordId   || '');
    const objectName = encodeURIComponent(context.parameters?.objectName || '');
    const recordName = encodeURIComponent(context.parameters?.recordName || '');

    res.redirect(`/dashboard?userId=${userId}&userName=${userName}&recordId=${recordId}&objectName=${objectName}&recordName=${recordName}`);

  } catch (err) {
    console.error('Canvas verification error:', err);
    res.status(500).send('Canvas error: ' + err.message);
  }
});

// ─────────────────────────────────────────────────────
// DASHBOARD ROUTE (GET — direct/demo access)
// ─────────────────────────────────────────────────────
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// ─────────────────────────────────────────────────────
// ROOT — health check / landing
// ─────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send(`
    <html><head>
      <style>
        body{font-family:sans-serif;background:#032D60;color:white;display:flex;
             align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;gap:12px;}
        h1{font-size:28px;} p{color:rgba(255,255,255,.6);font-size:14px;}
        a{color:#00C896;} code{background:rgba(255,255,255,.1);padding:2px 8px;border-radius:4px;}
      </style>
    </head><body>
      <h1>⚡ Zime Canvas Server is Running</h1>
      <p>Canvas endpoint: <code>POST /canvas</code></p>
      <p>Demo dashboard: <a href="/dashboard">/dashboard</a></p>
      <p>Status: <span style="color:#4ADE80">● Live</span></p>
    </body></html>
  `);
});

app.listen(PORT, () => {
  console.log(`✅ Zime Canvas server running on port ${PORT}`);
  console.log(`   Canvas endpoint : POST /canvas`);
  console.log(`   Dashboard       : GET  /dashboard`);
  console.log(`   Consumer Secret : ${CONSUMER_SECRET === 'DEMO_SECRET_REPLACE_ME' ? '⚠ DEMO MODE (no verification)' : '✅ Set'}`);
});
