/**
 * Honeypot Cloudflare Worker
 * Designed to deceive attackers by serving fake content for common attack vectors
 */

import { HONEYPOT_RULES, createGenerator, HoneypotRule } from './config';

// Environment variable helpers
function getEnvBool(env: any, key: string, defaultValue: boolean = false): boolean {
	const value = env?.[key];
	if (typeof value === 'string') {
		return value.toLowerCase() === 'true';
	}
	return defaultValue;
}

function getEnvNumber(env: any, key: string, defaultValue: number): number {
	const value = env?.[key];
	if (typeof value === 'string') {
		const parsed = parseInt(value, 10);
		return isNaN(parsed) ? defaultValue : parsed;
	}
	return defaultValue;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const path = url.pathname;

		// Check if the request matches any honeypot patterns
		const matchedRule = findMatchingRule(path);

		if (matchedRule) {
			// Log the suspicious request
			const clientIp = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
			const userAgent = request.headers.get('User-Agent') || 'unknown';
			const timestamp = new Date().toISOString();

			console.log(`Honeypot triggered: ${path} from ${clientIp} - ${matchedRule.description}`);
			console.log(`User Agent: ${userAgent}`);
			console.log(`Timestamp: ${timestamp}`);

			// Send webhook notification if configured
			if (env?.WEBHOOK_URL) {
				try {
					await sendWebhookNotification(env.WEBHOOK_URL, {
						path,
						clientIp,
						userAgent,
						timestamp,
						description: matchedRule.description,
						country: request.headers.get('CF-IPCountry') || 'unknown',
					});
				} catch (error) {
					console.error('Webhook notification failed:', error);
				}
			}

			try {
				// Create generator with context
				const generator = createGenerator(matchedRule.generatorClass, request, env);

				// Generate fake content
				const fakeContent = generator.generate();
				const contentType = generator.getContentType();

				// Add configurable delays to make responses more realistic
				const minDelay = getEnvNumber(env, 'MIN_RESPONSE_DELAY', 100);
				const maxDelay = getEnvNumber(env, 'MAX_RESPONSE_DELAY', 600);
				const delay = Math.floor(Math.random() * (maxDelay - minDelay)) + minDelay;
				await new Promise((resolve) => setTimeout(resolve, delay));

				return new Response(fakeContent, {
					status: 200,
					headers: {
						'Content-Type': contentType,
						Server: env?.SERVER_HEADER || getRandomServer(),
						'X-Powered-By': env?.POWERED_BY_HEADER || getRandomPoweredBy(),
						'Cache-Control': 'no-cache, no-store, must-revalidate',
						Pragma: 'no-cache',
						Expires: '0',
						'X-Frame-Options': 'SAMEORIGIN',
						'X-Content-Type-Options': 'nosniff',
						'Referrer-Policy': 'strict-origin-when-cross-origin',
						'Content-Security-Policy': "default-src 'self'",
						// Add some variation in response headers
						'X-Request-ID': generateRequestId(),
						'X-Response-Time': `${delay}ms`,
					},
				});
			} catch (error) {
				// Fallback response if generator fails
				console.error(`Generator error for ${path}:`, error);

				return new Response('Internal Server Error', {
					status: 500,
					headers: {
						'Content-Type': 'text/plain',
						Server: getRandomServer(),
					},
				});
			}
		}

		// Log non-honeypot requests if verbose logging is enabled
		if (getEnvBool(env, 'VERBOSE_LOGGING', false)) {
			const clientIp = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
			console.log(`Non-honeypot request: ${path} from ${clientIp}`);
		}

		// For non-matching requests, return various realistic 404 responses
		return generateNotFoundResponse(path, env);
	},
} satisfies ExportedHandler<Env>;

/**
 * Find the first honeypot rule that matches the given path
 */
function findMatchingRule(path: string): HoneypotRule | null {
	for (const rule of HONEYPOT_RULES) {
		const regex = new RegExp(rule.pattern, 'i');
		if (regex.test(path)) {
			return rule;
		}
	}
	return null;
}

/**
 * Send webhook notification for honeypot triggers
 */
async function sendWebhookNotification(webhookUrl: string, data: any): Promise<void> {
	await fetch(webhookUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'User-Agent': 'Honeypot-Worker/1.0',
		},
		body: JSON.stringify({
			type: 'honeypot_trigger',
			data,
			timestamp: new Date().toISOString(),
		}),
	});
}

/**
 * Generate various 404 responses to look more realistic
 */
function generateNotFoundResponse(path: string, env?: any): Response {
	const notFoundTemplates = [
		// Apache-style 404
		`<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
<html><head>
<title>404 Not Found</title>
</head><body>
<h1>Not Found</h1>
<p>The requested URL ${path} was not found on this server.</p>
<hr>
<address>Apache/2.4.41 (Ubuntu) Server at example.com Port 80</address>
</body></html>`,

		// Nginx-style 404
		`<html>
<head><title>404 Not Found</title></head>
<body>
<center><h1>404 Not Found</h1></center>
<hr><center>nginx/1.18.0</center>
</body>
</html>`,

		// Generic 404
		`<!DOCTYPE html>
<html>
<head>
    <title>Page Not Found</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #333; }
        p { color: #666; }
    </style>
</head>
<body>
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
    <p><a href="/">Go to Homepage</a></p>
</body>
</html>`,

		// Simple text 404
		'Not Found',

		// JSON 404 for API-like requests
		'{"error": "Not Found", "status": 404, "message": "The requested resource was not found"}',
	];

	let template: string;
	let contentType: string;

	// Choose response type based on path
	if (path.includes('api/') || path.endsWith('.json')) {
		template = notFoundTemplates[4]; // JSON response
		contentType = 'application/json';
	} else if (path.endsWith('.txt') || path.includes('robots.txt')) {
		template = notFoundTemplates[3]; // Simple text
		contentType = 'text/plain';
	} else {
		// Random HTML response
		template = notFoundTemplates[Math.floor(Math.random() * 3)];
		contentType = 'text/html';
	}

	return new Response(template, {
		status: 404,
		headers: {
			'Content-Type': contentType,
			Server: env?.SERVER_HEADER || getRandomServer(),
			'X-Powered-By': env?.POWERED_BY_HEADER || getRandomPoweredBy(),
		},
	});
}

/**
 * Generate a random server header
 */
function getRandomServer(): string {
	const servers = [
		'nginx/1.18.0',
		'nginx/1.20.2',
		'nginx/1.22.1',
		'Apache/2.4.41 (Ubuntu)',
		'Apache/2.4.52 (Ubuntu)',
		'Apache/2.4.46 (Win64)',
		'Microsoft-IIS/10.0',
		'Microsoft-IIS/8.5',
		'LiteSpeed/5.4.12',
		'Caddy/2.4.6',
		'OpenResty/1.19.9.1',
	];
	return servers[Math.floor(Math.random() * servers.length)];
}

/**
 * Generate a random X-Powered-By header
 */
function getRandomPoweredBy(): string {
	const poweredBy = [
		'PHP/7.4.3',
		'PHP/8.0.12',
		'PHP/8.1.2',
		'PHP/8.2.1',
		'ASP.NET',
		'Express',
		'Django/3.2.1',
		'Laravel/9.45.1',
		'Node.js/16.14.0',
		'Ruby/3.0.3',
		'Python/3.9.7',
	];
	return poweredBy[Math.floor(Math.random() * poweredBy.length)];
}

/**
 * Generate a random request ID for tracking
 */
function generateRequestId(): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < 12; i++) {
		result += chars[Math.floor(Math.random() * chars.length)];
	}
	return result;
}
