/**
 * Cloudflare IP List Integration Service
 * Handles adding IPs to the Cloudflare List and cleaning up old entries.
 */

const CF_API_BASE = 'https://api.cloudflare.com/client/v4';

// In-memory cache for the current worker isolate to reduce redundant API calls
const addedIpsCache = new Set<string>();

interface CloudflareResponse<T> {
    success: boolean;
    errors: { code: number; message: string }[];
    messages: string[];
    result: T;
}

interface ListItem {
    id: string;
    ip: string;
    comment: string;
    created_on: string;
}

/**
 * Add an IP address to the Honeypot IP List
 */
export async function addIpToList(ip: string, reason: string, env: any): Promise<void> {
    // Check local cache first to avoid redundant API calls
    if (addedIpsCache.has(ip)) {
        return;
    }

    let apiToken = await env.HONEYPOT_CONFIG?.get('CF_API_TOKEN');
    let accountId = await env.HONEYPOT_CONFIG?.get('CF_ACCOUNT_ID');
    let listId = await env.HONEYPOT_CONFIG?.get('CF_LIST_ID');

    if (!apiToken) apiToken = env.CF_API_TOKEN;
    if (!accountId) accountId = env.CF_ACCOUNT_ID;
    if (!listId) listId = env.CF_LIST_ID;

    if (!apiToken || !accountId || !listId) {
        console.warn('Missing Cloudflare configuration for IP List, skipping IP block');
        return;
    }

    try {
        const url = `${CF_API_BASE}/accounts/${accountId}/rules/lists/${listId}/items`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify([{
                ip: ip,
                comment: `[${reason}] - ${new Date().toISOString()} - Added by Honeypot`
            }]),
        });

        const data = await response.json() as CloudflareResponse<any>;
        
        if (data.success) {
            console.log(`Added IP ${ip} to Cloudflare List`);
            addedIpsCache.add(ip);
        } else {
            // Check if error is because IP already exists (Cloudflare Error 10022 or similar message)
            const isDuplicate = data.errors.some(e => e.message.includes('already exists') || e.code === 10022);
            if (isDuplicate) {
                addedIpsCache.add(ip);
            } else {
                console.log(`Failed to add IP to list:`, data.errors);
            }
        }
    } catch (error) {
        console.error('Failed to add IP to Cloudflare List:', error);
    }
}

/**
 * Clean up IPs older than 3 hours from the list
 */
export async function cleanupOldIps(env: any): Promise<void> {
    let apiToken = await env.HONEYPOT_CONFIG?.get('CF_API_TOKEN');
    let accountId = await env.HONEYPOT_CONFIG?.get('CF_ACCOUNT_ID');
    let listId = await env.HONEYPOT_CONFIG?.get('CF_LIST_ID');

    if (!apiToken) apiToken = env.CF_API_TOKEN;
    if (!accountId) accountId = env.CF_ACCOUNT_ID;
    if (!listId) listId = env.CF_LIST_ID;

    if (!apiToken || !accountId || !listId) {
        console.warn('Missing Cloudflare configuration for IP List, skipping cleanup');
        return;
    }

    try {
        // Fetch up to 1000 items (assuming list isn't astronomically huge. For production might need pagination)
        const url = `${CF_API_BASE}/accounts/${accountId}/rules/lists/${listId}/items?limit=1000`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json() as CloudflareResponse<ListItem[]>;
        if (!data.success) {
            throw new Error(`Failed to fetch list items: ${JSON.stringify(data.errors)}`);
        }

        const items = data.result;
        if (!items || items.length === 0) return;

        const threeHoursAgo = new Date();
        threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);

        const itemsToDelete = items.filter(item => {
            const created = new Date(item.created_on);
            return created < threeHoursAgo;
        });

        if (itemsToDelete.length > 0) {
            const deleteUrl = `${CF_API_BASE}/accounts/${accountId}/rules/lists/${listId}/items`;

            // The API requires {"items":[{"id":"..."}]} or similar body depending on the exact list type,
            // but for custom lists the standard is an items array with ids.
            const payload = {
                items: itemsToDelete.map(i => ({ id: i.id }))
            };

            const deleteResponse = await fetch(deleteUrl, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const deleteData = await deleteResponse.json() as CloudflareResponse<any>;
            if (deleteData.success) {
                console.log(`Cleaned up ${itemsToDelete.length} old IPs from Cloudflare List`);
            } else {
                console.error(`Failed to delete old IPs:`, deleteData.errors);
            }
        } else {
            console.log('No old IPs found to clean up.');
        }
    } catch (error) {
        console.error('Failed to cleanup old IPs:', error);
    }
}
