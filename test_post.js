#!/usr/bin/env node

/**
 * Quick POST request tester for honeypot
 * Tests POST endpoints and verifies random error responses
 */

const WORKER_URL = process.env.WORKER_URL || 'http://localhost:8787';
const COLORS = {
	green: '\x1b[32m',
	red: '\x1b[31m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
	reset: '\x1b[0m',
};

const postTests = [
	{ url: '/api/login', data: { username: 'admin', password: 'password123' }, contentType: 'application/json' },
	{ url: '/api/auth', data: { user: 'root', pass: 'toor' }, contentType: 'application/json' },
	{ url: '/wp-admin/admin-ajax.php', data: 'action=heartbeat&_nonce=test123', contentType: 'application/x-www-form-urlencoded' },
	{ url: '/admin/login', data: { email: 'admin@test.com', password: '123456' }, contentType: 'application/json' },
	{ url: '/contact', data: { name: 'Hacker', email: 'evil@darkweb.com', message: '<script>alert(1)</script>' }, contentType: 'application/json' },
	{ url: '/search', data: 'q=<script>document.cookie</script>', contentType: 'application/x-www-form-urlencoded' },
	{ url: '/upload', data: { file: 'shell.php', content: '<?php system($_GET["cmd"]); ?>' }, contentType: 'application/json' },
	{ url: '/webhook', data: '<?xml version="1.0"?><payload><cmd>whoami</cmd></payload>', contentType: 'application/xml' },
	{ url: '/api/users', data: { action: 'create', role: 'admin' }, contentType: 'application/json' },
	{ url: '/submit', data: 'email=test@test.com&password=123&confirm=123', contentType: 'application/x-www-form-urlencoded' },
];

async function testPost(testCase, index) {
	try {
		console.log(`${COLORS.cyan}[${index + 1}/${postTests.length}] Testing POST:${COLORS.reset} ${testCase.url}`);

		let body = '';
		if (testCase.contentType === 'application/json') {
			body = JSON.stringify(testCase.data);
		} else if (testCase.contentType === 'application/x-www-form-urlencoded') {
			body = typeof testCase.data === 'string' ? testCase.data : new URLSearchParams(testCase.data).toString();
		} else {
			body = typeof testCase.data === 'string' ? testCase.data : JSON.stringify(testCase.data);
		}

		const startTime = Date.now();
		const response = await fetch(`${WORKER_URL}${testCase.url}`, {
			method: 'POST',
			headers: {
				'User-Agent': 'PostBot/1.0 (Attack Scanner)',
				'X-Forwarded-For': '10.0.0.100',
				'Content-Type': testCase.contentType,
				Accept: testCase.contentType === 'application/json' ? 'application/json' : 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
				'X-Real-IP': '192.168.1.50',
				'CF-Connecting-IP': '203.0.113.100',
			},
			body: body,
		});
		const responseTime = Date.now() - startTime;

		const status = response.status;
		const contentType = response.headers.get('content-type') || 'unknown';
		const server = response.headers.get('server') || 'unknown';
		const poweredBy = response.headers.get('x-powered-by') || 'none';
		const requestId = response.headers.get('x-request-id') || 'none';
		const errorSource = response.headers.get('x-error-source') || 'none';

		let responseBody = '';
		try {
			responseBody = await response.text();
		} catch (e) {
			responseBody = '[Unable to read response body]';
		}

		// Determine if this is a random error (400-561 range)
		const isRandomError = status >= 400 && status <= 561;
		const statusColor = isRandomError ? COLORS.red : status === 200 ? COLORS.green : COLORS.yellow;

		console.log(`  ${statusColor}Status:${COLORS.reset} ${status} ${isRandomError ? '(Random Error ✓)' : '(Unexpected)'}`);
		console.log(`  ${COLORS.blue}Response Time:${COLORS.reset} ${responseTime}ms`);
		console.log(`  ${COLORS.blue}Content-Type:${COLORS.reset} ${contentType}`);
		console.log(`  ${COLORS.blue}Server:${COLORS.reset} ${server}`);
		console.log(`  ${COLORS.blue}X-Powered-By:${COLORS.reset} ${poweredBy}`);
		console.log(`  ${COLORS.blue}X-Request-ID:${COLORS.reset} ${requestId}`);
		console.log(`  ${COLORS.blue}X-Error-Source:${COLORS.reset} ${errorSource}`);

		// Show request details
		console.log(`  ${COLORS.magenta}Request Body:${COLORS.reset} ${body.substring(0, 100)}${body.length > 100 ? '...' : ''}`);

		// Show response body based on content type
		let responsePreview = '';
		if (contentType.includes('application/json')) {
			try {
				const jsonResponse = JSON.parse(responseBody);
				responsePreview = JSON.stringify(jsonResponse, null, 2);
			} catch (e) {
				responsePreview = responseBody;
			}
		} else {
			responsePreview = responseBody;
		}

		console.log(`  ${COLORS.green}Response:${COLORS.reset}`);
		// Limit response preview to avoid cluttering
		const lines = responsePreview.split('\n').slice(0, 5);
		lines.forEach((line, i) => {
			if (i < 4 || lines.length <= 5) {
				console.log(`    ${line}`);
			} else {
				console.log(`    ... (${responsePreview.split('\n').length - 4} more lines)`);
			}
		});

		console.log('');

		return {
			url: testCase.url,
			status,
			isRandomError,
			responseTime,
			contentType,
			server,
			poweredBy,
			requestId,
			responseBody: responseBody.substring(0, 500),
		};
	} catch (error) {
		console.log(`  ${COLORS.red}❌ Request failed:${COLORS.reset} ${error.message}`);
		console.log('');
		return {
			url: testCase.url,
			status: 'error',
			error: error.message,
		};
	}
}

async function runPostTests() {
	console.log(`${COLORS.green}🍯 Honeypot POST Request Tester${COLORS.reset}`);
	console.log(`${COLORS.blue}Worker URL:${COLORS.reset} ${WORKER_URL}`);
	console.log(`${COLORS.blue}Total POST tests:${COLORS.reset} ${postTests.length}`);
	console.log('='.repeat(60));
	console.log('');

	const results = [];
	const statusCodes = new Set();
	let randomErrors = 0;
	let requestErrors = 0;
	let unexpectedResponses = 0;
	const responseTimes = [];

	for (let i = 0; i < postTests.length; i++) {
		const result = await testPost(postTests[i], i);
		results.push(result);

		if (result.status === 'error') {
			requestErrors++;
		} else if (result.isRandomError) {
			randomErrors++;
			statusCodes.add(result.status);
			if (result.responseTime) responseTimes.push(result.responseTime);
		} else {
			unexpectedResponses++;
		}

		// Small delay between requests to avoid overwhelming
		await new Promise((resolve) => setTimeout(resolve, 200));
	}

	// Calculate statistics
	const avgResponseTime = responseTimes.length > 0 ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0;
	const minResponseTime = responseTimes.length > 0 ? Math.min(...responseTimes) : 0;
	const maxResponseTime = responseTimes.length > 0 ? Math.max(...responseTimes) : 0;

	console.log(`${COLORS.green}📊 POST Test Results Summary${COLORS.reset}`);
	console.log('='.repeat(60));
	console.log(`${COLORS.green}✅ Random Errors Generated:${COLORS.reset} ${randomErrors}/${postTests.length} (${((randomErrors / postTests.length) * 100).toFixed(1)}%)`);
	console.log(`${COLORS.red}❌ Request Errors:${COLORS.reset} ${requestErrors}`);
	console.log(`${COLORS.yellow}⚠️  Unexpected Responses:${COLORS.reset} ${unexpectedResponses}`);
	console.log('');

	if (statusCodes.size > 0) {
		console.log(`${COLORS.blue}📈 Status Code Distribution:${COLORS.reset}`);
		const sortedCodes = Array.from(statusCodes).sort((a, b) => a - b);
		const codeGroups = {
			'4xx Client Errors': sortedCodes.filter((code) => code >= 400 && code < 500),
			'5xx Server Errors': sortedCodes.filter((code) => code >= 500 && code <= 561),
		};

		Object.entries(codeGroups).forEach(([group, codes]) => {
			if (codes.length > 0) {
				console.log(`  ${COLORS.cyan}${group}:${COLORS.reset} ${codes.join(', ')}`);
			}
		});
		console.log('');
	}

	if (responseTimes.length > 0) {
		console.log(`${COLORS.blue}⏱️  Response Time Statistics:${COLORS.reset}`);
		console.log(`  ${COLORS.cyan}Average:${COLORS.reset} ${avgResponseTime}ms`);
		console.log(`  ${COLORS.cyan}Minimum:${COLORS.reset} ${minResponseTime}ms`);
		console.log(`  ${COLORS.cyan}Maximum:${COLORS.reset} ${maxResponseTime}ms`);
		console.log('');
	}

	// Show successful random errors
	const successfulErrors = results.filter((r) => r.isRandomError);
	if (successfulErrors.length > 0) {
		console.log(`${COLORS.green}🎲 Successful Random Errors:${COLORS.reset}`);
		successfulErrors.forEach((result, index) => {
			console.log(`  ${COLORS.green}${index + 1}.${COLORS.reset} ${result.url} → ${COLORS.red}${result.status}${COLORS.reset} (${result.contentType})`);
		});
		console.log('');
	}

	// Show any request errors
	const errorResults = results.filter((r) => r.status === 'error');
	if (errorResults.length > 0) {
		console.log(`${COLORS.red}❌ Request Errors:${COLORS.reset}`);
		errorResults.forEach((result, index) => {
			console.log(`  ${COLORS.red}${index + 1}.${COLORS.reset} ${result.url}: ${result.error}`);
		});
		console.log('');
	}

	// Show unexpected responses
	const unexpectedResults = results.filter((r) => r.status !== 'error' && !r.isRandomError);
	if (unexpectedResults.length > 0) {
		console.log(`${COLORS.yellow}⚠️  Unexpected Responses:${COLORS.reset}`);
		unexpectedResults.forEach((result, index) => {
			console.log(`  ${COLORS.yellow}${index + 1}.${COLORS.reset} ${result.url} → ${result.status} (Expected: 400-561)`);
		});
		console.log('');
	}

	// Final assessment
	console.log(`${COLORS.green}🎯 Assessment:${COLORS.reset}`);
	if (randomErrors === postTests.length && requestErrors === 0) {
		console.log(`  ${COLORS.green}🟢 EXCELLENT:${COLORS.reset} All POST requests returned random errors as expected!`);
	} else if (randomErrors > 0 && randomErrors >= postTests.length * 0.8) {
		console.log(`  ${COLORS.green}🟡 GOOD:${COLORS.reset} Most POST requests returned random errors. Success rate: ${((randomErrors / postTests.length) * 100).toFixed(1)}%`);
	} else if (randomErrors > 0) {
		console.log(`  ${COLORS.yellow}🟠 PARTIAL:${COLORS.reset} Some POST requests returned random errors. Success rate: ${((randomErrors / postTests.length) * 100).toFixed(1)}%`);
	} else {
		console.log(`  ${COLORS.red}🔴 FAILED:${COLORS.reset} No POST requests returned random errors. Check the implementation.`);
	}

	if (requestErrors > 0) {
		console.log(`  ${COLORS.red}⚠️  ${requestErrors} request(s) failed completely. Check network connectivity.${COLORS.reset}`);
	}

	if (statusCodes.size >= 10) {
		console.log(`  ${COLORS.cyan}💡 Good variety:${COLORS.reset} Generated ${statusCodes.size} different status codes.`);
	} else if (statusCodes.size > 0) {
		console.log(`  ${COLORS.yellow}💡 Limited variety:${COLORS.reset} Only ${statusCodes.size} different status codes generated.`);
	}

	console.log('');
	console.log(`${COLORS.blue}💡 Tips:${COLORS.reset}`);
	console.log(`  • Use ${COLORS.cyan}wrangler tail${COLORS.reset} to see live logs`);
	console.log(`  • Set ${COLORS.cyan}WORKER_URL=https://your-worker.your-subdomain.workers.dev${COLORS.reset} for production testing`);
	console.log(`  • Check Cloudflare dashboard for request analytics`);
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
	console.log(`${COLORS.green}🍯 Honeypot POST Tester${COLORS.reset}`);
	console.log('');
	console.log('Usage:');
	console.log('  node test_post.js                    # Test localhost:8787');
	console.log('  WORKER_URL=https://... node test_post.js  # Test production worker');
	console.log('');
	console.log('Options:');
	console.log('  -h, --help                          # Show this help');
	console.log('');
	console.log('Environment Variables:');
	console.log('  WORKER_URL                          # Worker URL (default: http://localhost:8787)');
	process.exit(0);
}

// Run the tests
if (require.main === module) {
	runPostTests().catch((error) => {
		console.error(`${COLORS.red}❌ Test runner failed:${COLORS.reset} ${error.message}`);
		process.exit(1);
	});
}

module.exports = { testPost, runPostTests, postTests };
