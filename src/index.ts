/**
 * Honeypot Cloudflare Worker
 * Designed to deceive attackers by serving fake content for common attack vectors
 */

import { HONEYPOT_RULES, createGenerator, matchRule, HoneypotRule } from './config';

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
		const method = request.method;

		// Handle POST requests with random errors
		if (method === 'POST') {
			return await generateRandomErrorResponse(request, env);
		}

		// Check if the request matches any honeypot patterns
		const userAgent = request.headers.get('User-Agent') || '';
		const matchedRule = matchRule(path, userAgent);

		if (matchedRule) {
			// Log the suspicious request
			const clientIp = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
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

				const fakeContentLength = getFakeContentLength();

				const headers = {
					'Content-Type': contentType,
					'Content-Length': fakeContentLength,
					Server: env?.SERVER_HEADER || getRandomServer(),
					'X-Powered-By': env?.POWERED_BY_HEADER || getRandomPoweredBy(),
					'Cache-Control': 'no-cache, no-store, must-revalidate',
					Pragma: 'no-cache',
					Expires: '0',
					'X-Frame-Options': 'SAMEORIGIN',
					'X-Content-Type-Options': 'nosniff',
					'Referrer-Policy': 'strict-origin-when-cross-origin',
					'Content-Security-Policy': "default-src 'self'",
					'X-Request-ID': generateRequestId(),
					'X-Response-Time': `${delay}ms`,
				};

				// Add random fake size headers (20% chance)
				addRandomFakeSizeHeaders(headers, fakeContentLength);

				return new Response(fakeContent, {
					status: 200,
					headers,
				});
			} catch (error) {
				// Fallback response if generator fails
				console.error(`Generator error for ${path}:`, error);

				const errorContent = 'Internal Server Error';
				const fakeSize = getFakeContentLength();

				const errorHeaders = {
					'Content-Type': 'text/plain',
					'Content-Length': fakeSize,
					Server: getRandomServer(),
				};

				// Add random fake size headers (20% chance)
				addRandomFakeSizeHeaders(errorHeaders, fakeSize);

				return new Response(errorContent, {
					status: 500,
					headers: errorHeaders,
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

	const fakeSize = getFakeContentLength();

	const notFoundHeaders = {
		'Content-Type': contentType,
		'Content-Length': fakeSize,
		Server: env?.SERVER_HEADER || getRandomServer(),
		'X-Powered-By': env?.POWERED_BY_HEADER || getRandomPoweredBy(),
	};

	// Add random fake size headers (20% chance)
	addRandomFakeSizeHeaders(notFoundHeaders, fakeSize);

	return new Response(template, {
		status: 404,
		headers: notFoundHeaders,
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

/**
 * Generate a fake Content-Length header with very large value
 */
function getFakeContentLength(): string {
	// Generate random large values between 100MB and 50GB
	const minSize = 100 * 1024 * 1024; // 100MB
	const maxSize = 50 * 1024 * 1024 * 1024; // 50GB
	const fakeSize = Math.floor(Math.random() * (maxSize - minSize)) + minSize;
	return fakeSize.toString();
}

/**
 * Add random fake size headers to confuse attackers
 * Only adds headers 20% of the time with random combinations
 */
function addRandomFakeSizeHeaders(headers: Record<string, string>, fakeSize: string): void {
	// 20% chance to add fake headers
	if (Math.random() > 0.2) {
		return;
	}

	// Available fake size headers
	const fakeSizeHeaders = [
		'X-Content-Length',
		'X-Uncompressed-Content-Length',
		'X-Original-Content-Length',
		'X-Decompressed-Size',
		'X-Raw-Content-Length',
		'X-Expected-Size',
		'X-File-Size',
		'X-Total-Size',
		'X-Download-Size',
		'X-Payload-Length',
		'Content-Range',
	];

	// Randomly select 1-4 headers to include
	const numHeaders = Math.floor(Math.random() * 4) + 1;
	const selectedHeaders = [...fakeSizeHeaders].sort(() => Math.random() - 0.5).slice(0, numHeaders);

	// Add selected headers
	selectedHeaders.forEach((headerName) => {
		if (headerName === 'Content-Range') {
			headers[headerName] = `bytes 0-${parseInt(fakeSize) - 1}/${fakeSize}`;
		} else {
			headers[headerName] = fakeSize;
		}
	});
}

/**
 * Generate random error response for POST requests
 */
async function generateRandomErrorResponse(request: Request, env?: any): Promise<Response> {
	// Generate random HTTP error status between 400 and 561
	const errorStatus = Math.floor(Math.random() * (561 - 400 + 1)) + 400;

	// Array of random error messages
	const errorMessages = [
		'Invalid request format',
		'Authentication failed',
		'Access denied',
		'Resource not found',
		'Server temporarily unavailable',
		'Bad request parameters',
		'Validation error occurred',
		'Internal processing error',
		'Service unavailable',
		'Request timeout',
		'Insufficient permissions',
		'Database connection failed',
		'Configuration error',
		'Network error',
		'File not found',
		'Method not allowed',
		'Content type not supported',
		'Rate limit exceeded',
		'Token expired',
		'Session invalid',
		'Malformed request body',
		'Required field missing',
		'Invalid JSON format',
		'Protocol error',
		'Gateway timeout',
		'Service overloaded',
		'Maintenance mode active',
		'Feature not implemented',
		'Version not supported',
		'Domain not authorized',
	];

	// Pick random error message
	const randomMessage = errorMessages[Math.floor(Math.random() * errorMessages.length)];

	// Log the POST request attempt
	const clientIp = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
	const userAgent = request.headers.get('User-Agent') || 'unknown';
	const timestamp = new Date().toISOString();

	console.log(`POST request honeypot triggered: ${request.url} from ${clientIp}`);
	console.log(`User Agent: ${userAgent}`);
	console.log(`Timestamp: ${timestamp}`);
	console.log(`Returning error ${errorStatus}: ${randomMessage}`);

	// Send webhook notification if configured
	if (env?.WEBHOOK_URL) {
		try {
			await sendWebhookNotification(env.WEBHOOK_URL, {
				path: new URL(request.url).pathname,
				clientIp,
				userAgent,
				timestamp,
				description: `POST request with random error ${errorStatus}`,
				country: request.headers.get('CF-IPCountry') || 'unknown',
				method: 'POST',
				errorStatus,
				errorMessage: randomMessage,
			});
		} catch (error) {
			console.error('Webhook notification failed:', error);
		}
	}

	// Choose response format based on content type or Accept header
	const acceptHeader = request.headers.get('Accept') || '';
	const contentType = request.headers.get('Content-Type') || '';

	let responseBody: string;
	let responseContentType: string;

	if (acceptHeader.includes('application/json') || contentType.includes('application/json')) {
		// JSON error response
		responseBody = JSON.stringify({
			error: randomMessage,
			status: errorStatus,
			timestamp: timestamp,
			path: new URL(request.url).pathname,
		});
		responseContentType = 'application/json';
	} else if (acceptHeader.includes('text/xml') || acceptHeader.includes('application/xml')) {
		// XML error response
		responseBody = `<?xml version="1.0" encoding="UTF-8"?>
<error>
	<message>${randomMessage}</message>
	<status>${errorStatus}</status>
	<timestamp>${timestamp}</timestamp>
</error>`;
		responseContentType = 'application/xml';
	} else {
		// HTML error response
		responseBody = `<!DOCTYPE html>
<html>
<head>
	<title>Error ${errorStatus}</title>
	<style>
		body { font-family: Arial, sans-serif; margin: 40px; background-color: #f5f5f5; }
		.error-container { background: white; padding: 30px; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
		h1 { color: #d32f2f; margin-bottom: 20px; }
		.error-code { color: #666; font-size: 14px; margin-top: 20px; }
		.timestamp { color: #999; font-size: 12px; margin-top: 10px; }
	</style>
</head>
<body>
	<div class="error-container">
		<h1>Error ${errorStatus}</h1>
		<p>${randomMessage}</p>
		<div class="error-code">Error Code: ${generateRequestId()}</div>
		<div class="timestamp">Timestamp: ${timestamp}</div>
	</div>
</body>
</html>`;
		responseContentType = 'text/html';
	}

	const fakeSize = getFakeContentLength();

	const postErrorHeaders = {
		'Content-Type': responseContentType,
		'Content-Length': fakeSize,
		Server: env?.SERVER_HEADER || getRandomServer(),
		'X-Powered-By': env?.POWERED_BY_HEADER || getRandomPoweredBy(),
		'Cache-Control': 'no-cache, no-store, must-revalidate',
		Pragma: 'no-cache',
		Expires: '0',
		'X-Request-ID': generateRequestId(),
		'X-Error-Source': 'application',
	};

	// Add random fake size headers (20% chance)
	addRandomFakeSizeHeaders(postErrorHeaders, fakeSize);

	return new Response(responseBody, {
		status: errorStatus,
		headers: postErrorHeaders,
	});
}
