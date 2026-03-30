// server.js on zime-canvas-demo.onrender.com
const express    = require('express');
const crypto     = require('crypto');
const app        = express();
 
app.use(express.urlencoded({ extended: true })); // needed for POST body
app.use(express.json());
 
const CONSUMER_SECRET = 'YOUR_CONNECTED_APP_SECRET'; // from Salesforce
 
app.post('/canvas', (req, res) => {
 
    // Salesforce sends signed_request in POST body
    const signedRequest = req.body.signed_request;
 
    if (!signedRequest) {
        return res.status(400).send('Missing signed_request');
    }
 
    // Verify the signature
    const [signature, encodedPayload] = signedRequest.split('.');
 
    const expectedSig = crypto
        .createHmac('sha256', CONSUMER_SECRET)
        .update(encodedPayload)
        .digest('base64');
 
    if (signature !== expectedSig) {
        return res.status(401).send('Invalid signature');
    }
 
    // Decode the payload
    const payload = JSON.parse(
        Buffer.from(encodedPayload, 'base64').toString('utf8')
    );
 
    // Extract SF context
    const userId  = payload.context.user.userId;
    const orgId   = payload.context.organization.organizationId;
    const recordId = payload.context.environment?.parameters?.recordId;
 
    // Render your app (respond with HTML)
    res.send(`
<!DOCTYPE html>
<html>
<body>
<h1>Hello from Zime!</h1>
<p>User: ${userId}</p>
<p>Record: ${recordId}</p>
<!-- Your actual app here -->
</body>
</html>
    `);
});
