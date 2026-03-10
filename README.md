# Zime × Salesforce Canvas — POC Deployment Guide

## What This Does
A self-hosted Node.js server that acts as a Canvas-enabled endpoint.
Salesforce embeds it inside a tab on Account & Opportunity records.
No iframes of external sites = zero blocking issues.

---

## STEP 1 — Upload to GitHub (2 minutes)

1. Go to https://github.com/new
2. Create a new repo called `zime-canvas-demo` (private is fine)
3. Upload ALL these files as-is:
   ```
   server.js
   package.json
   render.yaml
   views/dashboard.html
   ```
4. Click "Commit changes"

---

## STEP 2 — Deploy to Render (3 minutes)

1. Go to https://render.com → Sign up (free)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub → Select `zime-canvas-demo`
4. Render auto-detects Node.js. Settings:
   - **Name**: zime-canvas-demo
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
5. Click **"Deploy Web Service"**
6. Wait ~2 min → You get a URL like:
   ```
   https://zime-canvas-demo.onrender.com
   ```
7. Test it: open `https://zime-canvas-demo.onrender.com/dashboard`
   ✅ You should see the Zime dashboard

---

## STEP 3 — Create Salesforce Connected App (5 minutes)

1. In Salesforce → Setup → search **"App Manager"**
2. Click **"New Connected App"** (top right)
3. Fill in:
   - Connected App Name: `Zime`
   - API Name: `Zime`
   - Contact Email: your email
   - ✅ Check **"Enable OAuth Settings"**
     - Callback URL: `https://zime-canvas-demo.onrender.com/callback`
     - Selected OAuth Scopes: `Full access (full)`
4. Scroll to **"Canvas App Settings"**:
   - ✅ Check **"Force.com Canvas"**
   - Canvas App URL: `https://zime-canvas-demo.onrender.com/canvas`
   - Access Method: **Signed Request (POST)**  ← IMPORTANT
   - Locations: check **"Visualforce Page"** AND **"Lightning Component"**
5. Click **Save** → wait 2-10 min for SF to activate it
6. After saving → click **"Manage Consumer Details"**
7. Copy the **Consumer Secret** → save it somewhere safe

---

## STEP 4 — Add Consumer Secret to Render (1 minute)

1. In Render dashboard → your service → **"Environment"**
2. Add environment variable:
   - Key:   `CANVAS_CONSUMER_SECRET`
   - Value: (paste the Consumer Secret from step 3)
3. Click **Save** → Render auto-redeploys

---

## STEP 5 — Add Zime Tab to Salesforce Record Pages (5 minutes)

### Option A: Visualforce Page + LWC (Recommended)

Create this Visualforce page in Setup → Visualforce Pages → New:

```html
<apex:page>
    <apex:canvasApp
        developerName="Zime"
        width="100%"
        height="700px"
        parameters="{'recordId':'{!$CurrentPage.parameters.recordId}',
                     'objectName':'{!$CurrentPage.parameters.objectName}',
                     'recordName':'{!$CurrentPage.parameters.recordName}'}"
    />
</apex:page>
```
Name it: `ZimeDashboard`

### Then create LWC: zimeTab

**zimeTab.html**
```html
<template>
  <lightning-card>
    <iframe
      src={vfUrl}
      width="100%"
      height="700px"
      frameborder="0"
      scrolling="auto"
      title="Zime Dashboard">
    </iframe>
  </lightning-card>
</template>
```

**zimeTab.js**
```javascript
import { LightningElement, api } from 'lwc';
export default class ZimeTab extends LightningElement {
  @api recordId;
  @api objectApiName;
  get vfUrl() {
    return `/apex/ZimeDashboard?recordId=${this.recordId}&objectName=${this.objectApiName}`;
  }
}
```

**zimeTab.js-meta.xml**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
  <apiVersion>59.0</apiVersion>
  <isExposed>true</isExposed>
  <targets>
    <target>lightning__RecordPage</target>
  </targets>
  <targetConfigs>
    <targetConfig targets="lightning__RecordPage">
      <objects>
        <object>Account</object>
        <object>Opportunity</object>
      </objects>
    </targetConfig>
  </targetConfigs>
</LightningComponentBundle>
```

### Option B: Direct Visualforce Tab (Quickest for demo)

1. Setup → Tabs → New (Visualforce Tab)
2. Select `ZimeDashboard`
3. Add to your app

---

## STEP 6 — Add Tab to Record Pages

1. Open any **Account** record
2. Click ⚙️ Setup gear → **"Edit Page"**
3. In Lightning App Builder:
   - Drag a **"Tab"** component onto the page
   - Name the tab: **Zime**
   - Inside it, drag your **zimeTab** LWC
4. **Save → Activate**
5. Repeat for **Opportunity** record page

---

## Testing the Full Flow

1. Open any Account or Opportunity in Salesforce
2. Click the **Zime** tab
3. Salesforce Canvas POSTs a signed request to your Render server
4. Server verifies signature → renders dashboard with record context
5. ✅ Dashboard shows — NO login screen, fully authenticated

---

## Switching to Production Later

When Zime's real Canvas endpoint is ready, just:
1. Change the Canvas App URL in Connected App settings
2. Point it to `https://app.zime.ai/canvas` (or wherever)
3. Done — everything else stays the same

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Invalid Canvas signature" | Double-check Consumer Secret in Render env vars |
| Tab shows blank | Check Canvas App URL matches your Render URL exactly |
| "App not found" | Wait 10 min after creating Connected App |
| Render URL not working | Check deploy logs in Render dashboard |
