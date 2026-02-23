/**
 * Cloudflare WAF Integration Service
 * Handles blocking IPs by updating a specific WAF rule.
 */

const CF_API_BASE = 'https://api.cloudflare.com/client/v4';
const RULE_DESCRIPTION = 'Honeypot Blocklist';

interface CloudflareResponse<T> {
    success: boolean;
    errors: { code: number; message: string }[];
    messages: string[];
    result: T;
}

interface FirewallRule {
    id: string;
    filter: {
        id: string;
        expression: string;
        paused: boolean;
    };
    action: string;
    description: string;
}

interface FirewallFilter {
    id: string;
    expression: string;
}

/**
 * Block an IP address by adding it to the Honeypot WAF rule
 */
export async function blockIpInWaf(ip: string, env: any): Promise<void> {
    // Try to get credentials from KV first, then env vars
    let apiToken = await env.HONEYPOT_CONFIG?.get('CF_API_TOKEN');
    let zoneId = await env.HONEYPOT_CONFIG?.get('CF_ZONE_ID');

    if (!apiToken) apiToken = env.CF_API_TOKEN;
    if (!zoneId) zoneId = env.CF_ZONE_ID;

    if (!apiToken || !zoneId) {
        console.warn('Missing CF_API_TOKEN or CF_ZONE_ID, skipping WAF block');
        return;
    }

    try {
        // 1. Find the existing rule
        const rule = await findHoneypotRule(zoneId, apiToken);

        if (rule) {
            // 2. Update existing rule
            await updateRuleWithIp(zoneId, apiToken, rule, ip);
        } else {
            // 3. Create new rule
            await createHoneypotRule(zoneId, apiToken, ip);
        }
    } catch (error) {
        console.error('Failed to block IP in WAF:', error);
    }
}

async function findHoneypotRule(zoneId: string, token: string): Promise<FirewallRule | null> {
    const url = `${CF_API_BASE}/zones/${zoneId}/firewall/rules?description=${encodeURIComponent(RULE_DESCRIPTION)}`;
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    const data = await response.json() as CloudflareResponse<FirewallRule[]>;
    if (!data.success) {
        throw new Error(`Failed to list rules: ${JSON.stringify(data.errors)}`);
    }

    return data.result.length > 0 ? data.result[0] : null;
}

async function updateRuleWithIp(zoneId: string, token: string, rule: FirewallRule, ip: string): Promise<void> {
    const currentExpression = rule.filter.expression;

    // Check if IP is already in the expression
    if (currentExpression.includes(ip)) {
        console.log(`IP ${ip} is already blocked`);
        return;
    }

    // Parse expression to find the list of IPs
    // Assuming expression format: ip.src in { ... }
    let newExpression = '';
    if (currentExpression.includes('ip.src in {')) {
        const match = currentExpression.match(/ip\.src in \{(.*?)\}/);
        if (match) {
            const existingIps = match[1];
            newExpression = `ip.src in {${existingIps} ${ip}}`;
        } else {
            // Fallback if regex fails but structure looks right (shouldn't happen)
            newExpression = `${currentExpression} or ip.src eq ${ip}`;
        }
    } else if (currentExpression.includes('ip.src eq')) {
        // Convert single eq to list
        const match = currentExpression.match(/ip\.src eq ([\d\.]+)/);
        if (match) {
            newExpression = `ip.src in {${match[1]} ${ip}}`;
        } else {
            newExpression = `${currentExpression} or ip.src eq ${ip}`;
        }
    } else {
        // Complex or unknown expression, append with OR
        newExpression = `(${currentExpression}) or ip.src eq ${ip}`;
    }

    // Update the filter
    const filterUrl = `${CF_API_BASE}/zones/${zoneId}/firewall/filters/${rule.filter.id}`;
    const response = await fetch(filterUrl, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: rule.filter.id,
            expression: newExpression,
        }),
    });

    const data = await response.json() as CloudflareResponse<FirewallFilter>;
    if (!data.success) {
        throw new Error(`Failed to update filter: ${JSON.stringify(data.errors)}`);
    }

    console.log(`Added IP ${ip} to WAF rule`);
}

async function createHoneypotRule(zoneId: string, token: string, ip: string): Promise<void> {
    // 1. Create Filter
    const filterExpression = `ip.src in {${ip}}`;
    const filterUrl = `${CF_API_BASE}/zones/${zoneId}/firewall/filters`;

    const filterResponse = await fetch(filterUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify([{
            expression: filterExpression,
            description: `${RULE_DESCRIPTION} Filter`,
        }]),
    });

    const filterData = await filterResponse.json() as CloudflareResponse<FirewallFilter[]>;
    if (!filterData.success) {
        throw new Error(`Failed to create filter: ${JSON.stringify(filterData.errors)}`);
    }

    const filterId = filterData.result[0].id;

    // 2. Create Rule linked to Filter
    const ruleUrl = `${CF_API_BASE}/zones/${zoneId}/firewall/rules`;
    const ruleResponse = await fetch(ruleUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify([{
            filter: { id: filterId },
            action: 'block',
            description: RULE_DESCRIPTION,
        }]),
    });

    const ruleData = await ruleResponse.json() as CloudflareResponse<FirewallRule[]>;
    if (!ruleData.success) {
        throw new Error(`Failed to create rule: ${JSON.stringify(ruleData.errors)}`);
    }

    console.log(`Created WAF rule for IP ${ip}`);
}
