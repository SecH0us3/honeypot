/**
 * Install Page Handler
 * Manages the initial configuration of the honeypot via a web interface.
 */

export async function handleInstallRequest(request: Request, env: any): Promise<Response> {
    if (request.method === 'GET') {
        return await renderInstallPage(env);
    } else if (request.method === 'POST') {
        return await handleInstallSubmit(request, env);
    }
    return new Response('Method not allowed', { status: 405 });
}

async function renderInstallPage(env: any): Promise<Response> {
    // Check if already configured
    const storedToken = await env.HONEYPOT_CONFIG.get('CF_API_TOKEN');
    const storedZoneId = await env.HONEYPOT_CONFIG.get('CF_ZONE_ID');

    if (storedToken && storedZoneId) {
        return new Response(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Honeypot Configured</title>
                <style>
                    body { font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; text-align: center; }
                    .success { color: #10b981; font-size: 48px; margin-bottom: 20px; }
                    h1 { color: #1f2937; }
                    p { color: #4b5563; }
                    .btn { display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="success">✓</div>
                <h1>System Configured</h1>
                <p>The honeypot is successfully configured and running.</p>
                <p>To reconfigure, you must clear the KV namespace or update the values manually.</p>
                <a href="/" class="btn">Go to Homepage</a>
            </body>
            </html>
        `, { headers: { 'Content-Type': 'text/html' } });
    }

    // Render form
    return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Honeypot Installation</title>
            <style>
                body { font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; background: #f9fafb; }
                .card { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                h1 { margin-top: 0; color: #1f2937; }
                .form-group { margin-bottom: 20px; }
                label { display: block; margin-bottom: 5px; font-weight: 500; color: #374151; }
                input[type="text"], input[type="password"] { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 4px; box-sizing: border-box; }
                .help-text { font-size: 12px; color: #6b7280; margin-top: 5px; }
                button { background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; font-weight: 500; width: 100%; }
                button:hover { background: #1d4ed8; }
                .info-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 20px; border-radius: 0 4px 4px 0; }
                .info-box h3 { margin-top: 0; font-size: 16px; color: #1e40af; }
                .info-box p { margin: 5px 0 0; font-size: 14px; color: #1e3a8a; }
                code { background: #e5e7eb; padding: 2px 4px; border-radius: 3px; font-family: monospace; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>Honeypot Setup</h1>
                
                <div class="info-box">
                    <h3>Configuration Required</h3>
                    <p>To enable automated WAF blocking, this worker needs access to your Cloudflare account.</p>
                </div>

                <form method="POST">
                    <div class="form-group">
                        <label for="token">Cloudflare API Token</label>
                        <input type="password" id="token" name="token" required placeholder="Enter your API Token">
                        <div class="help-text">
                            Create a token with <strong>Zone.Firewall:Edit</strong> and <strong>Zone.Zone:Read</strong> permissions.
                            <a href="https://dash.cloudflare.com/profile/api-tokens" target="_blank">Create Token &rarr;</a>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="zoneId">Zone ID</label>
                        <input type="text" id="zoneId" name="zoneId" required placeholder="Enter your Zone ID">
                        <div class="help-text">Found on the Overview page of your domain in Cloudflare dashboard.</div>
                    </div>

                    <button type="submit">Save Configuration</button>
                </form>
            </div>
        </body>
        </html>
    `, { headers: { 'Content-Type': 'text/html' } });
}

async function handleInstallSubmit(request: Request, env: any): Promise<Response> {
    try {
        const formData = await request.formData();
        const token = formData.get('token') as string;
        const zoneId = formData.get('zoneId') as string;

        if (!token || !zoneId) {
            return new Response('Missing required fields', { status: 400 });
        }

        // Validate Token
        const isValid = await verifyToken(token, zoneId);
        if (!isValid) {
            return new Response(`
                <!DOCTYPE html>
                <html>
                <body style="font-family: system-ui; padding: 40px; text-align: center;">
                    <h1 style="color: #ef4444;">Validation Failed</h1>
                    <p>The provided API Token or Zone ID is invalid or lacks necessary permissions.</p>
                    <button onclick="history.back()" style="padding: 10px 20px; margin-top: 20px;">Go Back</button>
                </body>
                </html>
            `, { status: 400, headers: { 'Content-Type': 'text/html' } });
        }

        // Save to KV
        await env.HONEYPOT_CONFIG.put('CF_API_TOKEN', token);
        await env.HONEYPOT_CONFIG.put('CF_ZONE_ID', zoneId);

        return new Response(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta http-equiv="refresh" content="3;url=/" />
                <style>body { font-family: system-ui; padding: 40px; text-align: center; }</style>
            </head>
            <body>
                <h1 style="color: #10b981;">Configuration Saved!</h1>
                <p>Redirecting to homepage...</p>
            </body>
            </html>
        `, { headers: { 'Content-Type': 'text/html' } });

    } catch (error) {
        return new Response(`Error: ${error}`, { status: 500 });
    }
}

async function verifyToken(token: string, zoneId: string): Promise<boolean> {
    try {
        const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json() as any;
        return data.success === true;
    } catch (e) {
        console.error('Token verification failed:', e);
        return false;
    }
}
