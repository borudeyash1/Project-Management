## Webhook 401 Error - Quick Diagnostic Steps

The webhook is reaching your server but failing signature verification. Here's how to fix it:

### Option 1: Temporarily Disable Signature Verification (Quick Test)

On your VPS, edit the webhook handler:

```bash
cd ~/Project-Management/server/src/routes
nano githubWebhooks.ts
```

Find the line (around line 50):
```typescript
if (!verifyGitHubSignature(req)) {
```

Temporarily comment it out and add logging:
```typescript
console.log('[GitHub Webhook] Skipping signature verification for testing');
// if (!verifyGitHubSignature(req)) {
//     console.warn('Invalid GitHub webhook signature');
//     return res.status(401).json({
//         success: false,
//         message: 'Invalid signature'
//     });
// }
```

Then rebuild and restart:
```bash
cd ~/Project-Management/server
npm run build
pm2 restart proxima-server
```

Make a test commit and check if the webhook processes successfully.

### Option 2: Fix Body Parser Issue (Proper Fix)

The real issue is that Express body parser is consuming the raw body. We need to preserve it for signature verification.

Edit `server/src/server.ts` and find where body parser is configured. Add this BEFORE the JSON body parser:

```typescript
// Preserve raw body for webhook signature verification
app.use('/api/github/webhooks', express.raw({ type: 'application/json' }));

// Then your existing body parser
app.use(express.json());
```

This ensures the webhook endpoint gets the raw body while other endpoints get parsed JSON.

### What to Check in Logs

After deploying, you should see:
```
[GitHub Webhook] Verifying signature...
[GitHub Webhook] Signature header: Present
[GitHub Webhook] Secret configured: mR8UEZ7Vzn...
[GitHub Webhook] Signature valid: true
[GitHub Webhook] Received push event
[GitHub] Processing commit...
```

If you still don't see these logs, the new code isn't deployed. Run:
```bash
grep -A5 "Verifying signature" ~/Project-Management/server/dist/routes/githubWebhooks.js
```

This will show if the new logging code is in the compiled JavaScript.
