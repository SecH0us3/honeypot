# Honeypot Deployment Guide

This guide will walk you through deploying the honeypot Cloudflare Worker to production.

## Prerequisites

- [Cloudflare account](https://dash.cloudflare.com/sign-up)
- [Node.js](https://nodejs.org/) (version 16 or higher)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) installed globally

## Quick Start

1. **Install Wrangler globally:**
   ```bash
   npm install -g wrangler
   ```

2. **Authenticate with Cloudflare:**
   ```bash
   wrangler login
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Deploy to production:**
   ```bash
   npm run deploy
   ```

Your honeypot will be available at: `https://honeypot.your-subdomain.workers.dev`

## Custom Domain Setup

### 1. Add Custom Domain

```bash
wrangler domains add your-honeypot-domain.com
```

### 2. Configure DNS

In your Cloudflare dashboard:
- Add a CNAME record pointing to your worker
- Enable "Proxied" (orange cloud)

### 3. Update Worker Route

```bash
wrangler route add "your-honeypot-domain.com/*" honeypot
```

## Environment Variables

Set environment variables using Wrangler secrets:

### Required Variables

None - the honeypot works with defaults.

### Optional Variables

```bash
# Company branding
wrangler secret put COMPANY_NAME
# Enter: Your Company Name

wrangler secret put COMPANY_DOMAIN  
# Enter: yourcompany.com

wrangler secret put ADMIN_EMAIL
# Enter: admin@yourcompany.com

# Webhook notifications
wrangler secret put WEBHOOK_URL
# Enter: https://your-webhook-server.com/webhook/honeypot

# Server headers
wrangler secret put SERVER_HEADER
# Enter: nginx/1.20.2

wrangler secret put POWERED_BY_HEADER
# Enter: PHP/8.1.2
```

### Environment Variables Reference

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `COMPANY_NAME` | Company name for branding | Random | "Acme Corp" |
| `COMPANY_DOMAIN` | Company domain | Random | "acme.com" |
| `ADMIN_EMAIL` | Admin email for fake content | Random | "admin@acme.com" |
| `WEBHOOK_URL` | Webhook for notifications | None | "https://alerts.com/hook" |
| `SERVER_HEADER` | Custom Server header | Random | "nginx/1.20.2" |
| `POWERED_BY_HEADER` | Custom X-Powered-By header | Random | "PHP/8.1.2" |
| `MIN_RESPONSE_DELAY` | Minimum response delay (ms) | 100 | "50" |
| `MAX_RESPONSE_DELAY` | Maximum response delay (ms) | 600 | "1000" |
| `VERBOSE_LOGGING` | Log all requests | false | "true" |
| `TIMEZONE` | Timezone for timestamps | UTC | "America/New_York" |
| `LOCALE` | Locale for formatting | en_US | "en_GB" |

## Webhook Notifications Setup

### 1. Deploy Webhook Server

Use the included `webhook-example.js`:

```bash
# On your server
git clone <your-repo>
cd honeypot
npm install express
node webhook-example.js
```

### 2. Configure Webhook URL

```bash
wrangler secret put WEBHOOK_URL
# Enter: https://your-server.com:3000/webhook/honeypot
```

### 3. Secure Webhook (Production)

For production, secure your webhook endpoint:

```javascript
// Add authentication
app.post('/webhook/honeypot', authenticateRequest, (req, res) => {
    // Your webhook handler
});

function authenticateRequest(req, res, next) {
    const token = req.headers['authorization'];
    if (token !== 'Bearer your-secret-token') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}
```

## Monitoring & Logging

### Real-time Logs

```bash
# Watch live logs
wrangler tail

# Filter for honeypot triggers only
wrangler tail --format pretty | grep "Honeypot triggered"

# Save logs to file
wrangler tail > honeypot-logs.txt
```

### Cloudflare Analytics

1. Go to Cloudflare Dashboard
2. Select your Worker
3. View metrics in the "Analytics" tab

Key metrics to monitor:
- Request count
- Error rate
- Response time
- Geographic distribution

## Testing Production Deployment

### 1. Test GET Honeypots

```bash
# Test from your local machine
WORKER_URL=https://your-honeypot-domain.com node test_honeypot.js
```

### 2. Test POST Errors

```bash
# Test POST requests
WORKER_URL=https://your-honeypot-domain.com node test_post.js
```

### 3. Manual Testing

```bash
# Test a honeypot trigger
curl https://your-honeypot-domain.com/.git/config

# Test POST request
curl -X POST https://your-honeypot-domain.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"test"}'
```

## Security Considerations

### 1. Domain Isolation

- Use a dedicated domain for the honeypot
- Don't host real services on the same domain
- Consider using a subdomain: `honeypot.yourdomain.com`

### 2. Log Management

```bash
# Set up log rotation for webhook server
# Add to /etc/logrotate.d/honeypot
/var/log/honeypot/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 honeypot honeypot
    postrotate
        systemctl reload honeypot-webhook
    endscript
}
```

### 3. Rate Limiting

Consider adding rate limiting to your webhook server:

```javascript
const rateLimit = require('express-rate-limit');

const webhookLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: 'Too many webhook requests'
});

app.use('/webhook', webhookLimiter);
```

## Scaling & Performance

### 1. Cloudflare Worker Limits

- **Free Plan**: 100,000 requests/day
- **Paid Plan**: 10 million requests/month included

### 2. Optimization Tips

- Use `wrangler dev --remote` for testing to avoid local/remote differences
- Monitor CPU time usage (50ms limit per request)
- Keep environment variables minimal

### 3. Multiple Deployments

Deploy to multiple environments:

```bash
# Staging
wrangler deploy --env staging

# Production  
wrangler deploy --env production
```

Configure `wrangler.toml`:

```toml
name = "honeypot"
main = "src/index.ts"

[env.staging]
name = "honeypot-staging"

[env.production]
name = "honeypot-production"
route = "honeypot.yourdomain.com/*"
```

## Maintenance

### 1. Update Deployment

```bash
# Pull latest changes
git pull origin main

# Deploy updates
npm run deploy
```

### 2. Update Dependencies

```bash
# Update Wrangler
npm install -g wrangler@latest

# Update project dependencies
npm update
```

### 3. Monitor Resource Usage

```bash
# Check worker analytics
wrangler tail --format json | jq '.outcome'
```

## Troubleshooting

### Common Issues

1. **"Authentication failed"**
   ```bash
   wrangler logout
   wrangler login
   ```

2. **"Workers subdomain not configured"**
   ```bash
   wrangler subdomain set your-subdomain
   ```

3. **Environment variables not working**
   ```bash
   # List current secrets
   wrangler secret list
   
   # Delete and recreate secret
   wrangler secret delete VARIABLE_NAME
   wrangler secret put VARIABLE_NAME
   ```

4. **Webhook not receiving notifications**
   - Check webhook URL is accessible
   - Verify WEBHOOK_URL environment variable
   - Check webhook server logs

### Debug Mode

Enable verbose logging:

```bash
wrangler secret put VERBOSE_LOGGING
# Enter: true
```

Then monitor logs:

```bash
wrangler tail --format pretty
```

## Support

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [GitHub Issues](https://github.com/your-repo/issues)

## Security Disclosure

If you discover security vulnerabilities in the honeypot itself, please report them responsibly by emailing security@yourdomain.com