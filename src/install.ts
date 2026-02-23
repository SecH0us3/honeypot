/**
 * Install Page Handler
 * Manages the initial configuration of the honeypot via a web interface.
 */

export async function handleInstallRequest(request: Request, env: any): Promise<Response> {
    if (request.method === 'GET') {
        return await renderInstallPage(request, env);
    } else if (request.method === 'POST') {
        return await handleInstallSubmit(request, env);
    }
    return new Response('Method not allowed', { status: 405 });
}

async function renderInstallPage(request: Request, env: any): Promise<Response> {
    // Check if already configured
    const storedToken = await env.HONEYPOT_CONFIG.get('CF_API_TOKEN');
    const storedZoneId = await env.HONEYPOT_CONFIG.get('CF_ZONE_ID');

    const url = new URL(request.url);
    const reinstallKey = url.searchParams.get('reinstall');
    const secretKey = env.REINSTALL_KEY;
    const forceReinstall = secretKey && reinstallKey === secretKey;

    if (storedToken && storedZoneId && !forceReinstall) {
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
        `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
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
                    <p>To enable automated WAF blocking via IP Lists, this worker needs access to your Cloudflare account.</p>
                </div>

                <form method="POST">
                    <div class="form-group">
                        <label for="token">Cloudflare API Token</label>
                        <input type="password" id="token" name="token" required placeholder="Enter your API Token">
                        <div class="help-text">
                            Create a token with <strong>Account: Account WAF: Edit</strong>, <strong>Account: Account Filter Lists: Edit</strong>, and <strong>Zone: Zone: Read</strong> permissions.
                            <a href="https://dash.cloudflare.com/profile/api-tokens" target="_blank">Create Token &rarr;</a>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="zoneId">Zone ID</label>
                        <input type="text" id="zoneId" name="zoneId" required placeholder="Enter your Zone ID">
                        <div class="help-text">Found on the Overview page of your domain in Cloudflare dashboard.</div>
                    </div>

                    <div class="form-group">
                        <label for="behavior">Honeypot Behavior</label>
                        <select id="behavior" name="behavior" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 4px; box-sizing: border-box;">
                            <option value="fake_data">Generate Fake Data</option>
                            <option value="empty_page">Return Empty Page</option>
                        </select>
                        <div class="help-text">Choose what the attacker sees. They will be added to the IP List regardless.</div>
                    </div>

                    <button type="submit">Save Configuration</button>
                </form>
            </div>
        </body>
        </html>
    `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

async function handleInstallSubmit(request: Request, env: any): Promise<Response> {
    try {
        const formData = await request.formData();
        const token = formData.get('token') as string;
        const zoneId = formData.get('zoneId') as string;
        const behavior = formData.get('behavior') as string || 'fake_data';

        if (!token || !zoneId) {
            return new Response('Missing required fields', { status: 400 });
        }

        // Validate Token and get Account ID
        const { valid, accountId } = await verifyAndGetAccount(token, zoneId);
        if (!valid || !accountId) {
            return new Response(`
                <!DOCTYPE html>
                <html>
                <body style="font-family: system-ui; padding: 40px; text-align: center;">
                    <h1 style="color: #ef4444;">Validation Failed</h1>
                    <p>The provided API Token or Zone ID is invalid or lacks necessary permissions.</p>
                    <button onclick="history.back()" style="padding: 10px 20px; margin-top: 20px;">Go Back</button>
                </body>
                </html>
            `, { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        }

        // Setup the IP List
        const listId = await setupIpList(accountId, token);
        if (!listId) {
            return new Response(`
                <!DOCTYPE html>
                <html>
                <body style="font-family: system-ui; padding: 40px; text-align: center;">
                    <h1 style="color: #ef4444;">IP List Creation Failed</h1>
                    <p>Failed to find or create the Cloudflare IP List. Ensure your token has 'Account Filter Lists: Edit' permissions.</p>
                    <button onclick="history.back()" style="padding: 10px 20px; margin-top: 20px;">Go Back</button>
                </body>
                </html>
            `, { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        }

        // Setup the WAF Rule
        const wafSuccess = await setupWafRule(zoneId, token);
        if (!wafSuccess) {
            console.warn('WAF Rule automation failed, but continuing with list setup...');
        }

        // Save to KV
        await env.HONEYPOT_CONFIG.put('CF_API_TOKEN', token);
        await env.HONEYPOT_CONFIG.put('CF_ZONE_ID', zoneId);
        await env.HONEYPOT_CONFIG.put('CF_ACCOUNT_ID', accountId);
        await env.HONEYPOT_CONFIG.put('CF_LIST_ID', listId);
        await env.HONEYPOT_CONFIG.put('BEHAVIOR_MODE', behavior);

        return new Response(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta http-equiv="refresh" content="3;url=/" />
                <style>body { font-family: system-ui; padding: 40px; text-align: center; }</style>
            </head>
            <body>
                <h1 style="color: #10b981;">Configuration Saved!</h1>
                <p>IP List configured successfully. Redirecting to homepage...</p>
            </body>
            </html>
        `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });

    } catch (error) {
        return new Response(`Error: ${error}`, { status: 500 });
    }
}

async function verifyAndGetAccount(token: string, zoneId: string): Promise<{ valid: boolean, accountId?: string }> {
    try {
        const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json() as any;
        console.log('Data: ', data);

        if (data.success === true && data.result?.account?.id) {
            return { valid: true, accountId: data.result.account.id };
        }
        return { valid: false };
    } catch (e) {
        console.error('Token verification failed:', e);
        return { valid: false };
    }
}

async function setupIpList(accountId: string, token: string): Promise<string | null> {
    try {
        // Find existing list
        const listsResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/rules/lists`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const listsData = await listsResponse.json() as any;

        if (listsData.success && listsData.result) {
            const list = listsData.result.find((l: any) => l.name === 'honeypot_ips');
            if (list) return list.id;
        }

        // Create new list
        const createResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/rules/lists`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'honeypot_ips',
                description: 'Automatically managed list of scanning/malicious IPs',
                kind: 'ip'
            })
        });
        const createData = await createResponse.json() as any;
        if (createData.success && createData.result?.id) {
            return createData.result.id;
        } else {
            console.error('List creation failed:', createData.errors);
        }
    } catch (e) {
        console.error('Failed to setup IP list:', e);
    }
    return null;
}

async function setupWafRule(zoneId: string, token: string): Promise<boolean> {
    try {
        const rulesetPhase = 'http_request_firewall_custom';
        const ruleDescription = 'Honeypot IP Block Rule';

        // 1. Get existing rulesets for the zone
        const rulesetsResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/rulesets`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const rulesetsData = await rulesetsResponse.json() as any;

        if (!rulesetsData.success) {
            console.error('Failed to fetch rulesets:', rulesetsData.errors);
            return false;
        }

        let customRuleset = rulesetsData.result.find((r: any) => r.phase === rulesetPhase);

        if (customRuleset) {
            // 2. Check if rule already exists in this ruleset
            const detailResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/rulesets/${customRuleset.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const detailData = await detailResponse.json() as any;

            if (detailData.success && detailData.result.rules) {
                const existingRule = detailData.result.rules.find((r: any) => r.description === ruleDescription);
                if (existingRule) {
                    console.log('WAF rule already exists.');
                    return true;
                }
            }

            // 3. Add rule to existing ruleset
            const addRuleResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/rulesets/${customRuleset.id}/rules`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'block',
                    description: ruleDescription,
                    expression: 'ip.src in $honeypot_ips',
                    enabled: true
                })
            });
            const addRuleData = await addRuleResponse.json() as any;
            return addRuleData.success;

        } else {
            // 4. Create new ruleset for the phase
            const createRulesetResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/rulesets`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Honeypot WAF Ruleset',
                    kind: 'zone',
                    phase: rulesetPhase,
                    description: 'Custom WAF rules for Honeypot',
                    rules: [{
                        action: 'block',
                        description: ruleDescription,
                        expression: 'ip.src in $honeypot_ips',
                        enabled: true
                    }]
                })
            });
            const createRulesetData = await createRulesetResponse.json() as any;
            return createRulesetData.success;
        }
    } catch (e) {
        console.error('WAF setup error:', e);
        return false;
    }
}
