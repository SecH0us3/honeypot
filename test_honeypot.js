#!/usr/bin/env node

/**
 * Simple test script for honeypot functionality
 * Tests various attack vectors and verifies responses
 */

const testUrls = [
	// Git files
	'/.git/config',
	'/.git/HEAD',
	'/.git/refs/heads/main',
	'/.git/index',

	// Admin panels
	'/admin/',
	'/administrator/',
	'/wp-admin/',
	'/phpmyadmin/',
	'/manage/',
	'/control/',
	'/panel/',

	// WordPress
	'/wp-login.php',
	'/wp-config.php',

	// Configuration files
	'/.env',
	'/config.php',
	'/settings.php',
	'/database.php',
	'/.htaccess',
	'/web.config',

	// Backup files
	'/backup.bak',
	'/config.old',
	'/database.sql',
	'/dump.sql',
	'/backup.zip',

	// Development files
	'/composer.json',
	'/package.json',
	'/yarn.lock',

	// Server info
	'/phpinfo.php',
	'/info.php',
	'/test.php',

	// Log files
	'/error.log',
	'/access.log',
	'/debug.log',

	// Non-matching paths (should return 404)
	'/legitimate-page',
	'/api/users',
	'/about.html',
];

const postTestData = [
	// API endpoints that might receive POST requests
	{ url: '/api/login', data: { username: 'admin', password: 'password' }, contentType: 'application/json' },
	{ url: '/api/upload', data: { file: 'malicious.php' }, contentType: 'application/json' },
	{ url: '/wp-admin/admin-ajax.php', data: 'action=test&data=value', contentType: 'application/x-www-form-urlencoded' },
	{ url: '/admin/login', data: { user: 'root', pass: '123456' }, contentType: 'application/json' },
	{ url: '/contact', data: { name: 'Test', email: 'test@evil.com', message: 'Script injection test' }, contentType: 'application/json' },
	{ url: '/search', data: 'q=<script>alert(1)</script>', contentType: 'application/x-www-form-urlencoded' },
	{ url: '/submit', data: '<?xml version="1.0"?><root><test>data</test></root>', contentType: 'application/xml' },
	{ url: '/webhook', data: { event: 'test', payload: { malicious: 'data' } }, contentType: 'application/json' },
];

const WORKER_URL = process.env.WORKER_URL || 'http://localhost:8787';
const COLORS = {
	green: '\x1b[32m',
	red: '\x1b[31m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	reset: '\x1b[0m',
};

async function testUrl(url) {
	try {
		console.log(`${COLORS.blue}Testing GET:${COLORS.reset} ${url}`);

		const response = await fetch(`${WORKER_URL}${url}`, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
				'X-Forwarded-For': '192.168.1.100',
			},
		});

		const contentType = response.headers.get('content-type') || 'unknown';
		const server = response.headers.get('server') || 'unknown';
		const poweredBy = response.headers.get('x-powered-by') || 'none';
		const responseTime = response.headers.get('x-response-time') || 'unknown';

		let bodyPreview = '';
		try {
			const text = await response.text();
			bodyPreview = text.substring(0, 200) + (text.length > 200 ? '...' : '');
		} catch (e) {
			bodyPreview = '[Binary content]';
		}

		const status = response.status;
		const statusColor = status === 200 ? COLORS.green : status === 404 ? COLORS.yellow : COLORS.red;

		console.log(`  ${statusColor}Status:${COLORS.reset} ${status}`);
		console.log(`  ${COLORS.blue}Content-Type:${COLORS.reset} ${contentType}`);
		console.log(`  ${COLORS.blue}Server:${COLORS.reset} ${server}`);
		console.log(`  ${COLORS.blue}X-Powered-By:${COLORS.reset} ${poweredBy}`);
		console.log(`  ${COLORS.blue}Response-Time:${COLORS.reset} ${responseTime}`);
		console.log(`  ${COLORS.blue}Body Preview:${COLORS.reset} ${bodyPreview.replace(/\n/g, '\\n')}`);
		console.log('');

		return {
			url,
			method: 'GET',
			status,
			contentType,
			server,
			poweredBy,
			responseTime,
			bodyLength: bodyPreview.length,
			isHoneypot: status === 200,
		};
	} catch (error) {
		console.log(`  ${COLORS.red}Error:${COLORS.reset} ${error.message}`);
		console.log('');
		return {
			url,
			method: 'GET',
			status: 'error',
			error: error.message,
		};
	}
}

async function testPost(testCase) {
	try {
		console.log(`${COLORS.blue}Testing POST:${COLORS.reset} ${testCase.url}`);

		let body = '';
		if (testCase.contentType === 'application/json') {
			body = JSON.stringify(testCase.data);
		} else if (testCase.contentType === 'application/x-www-form-urlencoded') {
			body = typeof testCase.data === 'string' ? testCase.data : new URLSearchParams(testCase.data).toString();
		} else {
			body = typeof testCase.data === 'string' ? testCase.data : JSON.stringify(testCase.data);
		}

		const response = await fetch(`${WORKER_URL}${testCase.url}`, {
			method: 'POST',
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
				'X-Forwarded-For': '192.168.1.100',
				'Content-Type': testCase.contentType,
				Accept:
					testCase.contentType === 'application/json'
						? 'application/json'
						: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
			},
			body: body,
		});

		const contentType = response.headers.get('content-type') || 'unknown';
		const server = response.headers.get('server') || 'unknown';
		const poweredBy = response.headers.get('x-powered-by') || 'none';
		const requestId = response.headers.get('x-request-id') || 'none';
		const errorSource = response.headers.get('x-error-source') || 'none';

		let bodyPreview = '';
		try {
			const text = await response.text();
			bodyPreview = text.substring(0, 300) + (text.length > 300 ? '...' : '');
		} catch (e) {
			bodyPreview = '[Binary content]';
		}

		const status = response.status;
		const isErrorStatus = status >= 400 && status <= 561;
		const statusColor = isErrorStatus ? COLORS.red : status === 200 ? COLORS.green : COLORS.yellow;

		console.log(`  ${statusColor}Status:${COLORS.reset} ${status} ${isErrorStatus ? '(Random Error)' : ''}`);
		console.log(`  ${COLORS.blue}Content-Type:${COLORS.reset} ${contentType}`);
		console.log(`  ${COLORS.blue}Server:${COLORS.reset} ${server}`);
		console.log(`  ${COLORS.blue}X-Powered-By:${COLORS.reset} ${poweredBy}`);
		console.log(`  ${COLORS.blue}X-Request-ID:${COLORS.reset} ${requestId}`);
		console.log(`  ${COLORS.blue}X-Error-Source:${COLORS.reset} ${errorSource}`);
		console.log(`  ${COLORS.blue}Request Body:${COLORS.reset} ${body.substring(0, 100)}${body.length > 100 ? '...' : ''}`);
		console.log(`  ${COLORS.blue}Response Preview:${COLORS.reset} ${bodyPreview.replace(/\n/g, '\\n')}`);
		console.log('');

		return {
			url: testCase.url,
			method: 'POST',
			status,
			contentType,
			server,
			poweredBy,
			requestId,
			errorSource,
			bodyLength: bodyPreview.length,
			isRandomError: isErrorStatus,
			requestBody: body,
		};
	} catch (error) {
		console.log(`  ${COLORS.red}Error:${COLORS.reset} ${error.message}`);
		console.log('');
		return {
			url: testCase.url,
			method: 'POST',
			status: 'error',
			error: error.message,
		};
	}
}

async function runTests() {
	console.log(`${COLORS.green}🍯 Honeypot Test Suite${COLORS.reset}`);
	console.log(`${COLORS.blue}Testing Worker URL:${COLORS.reset} ${WORKER_URL}`);
	console.log(`${COLORS.blue}Total GET URLs to test:${COLORS.reset} ${testUrls.length}`);
	console.log(`${COLORS.blue}Total POST endpoints to test:${COLORS.reset} ${postTestData.length}`);
	console.log('');

	// Test GET requests
	console.log(`${COLORS.green}🔍 Testing GET Requests${COLORS.reset}`);
	console.log('='.repeat(50));

	const getResults = [];
	let honeypotTriggered = 0;
	let notFoundReturned = 0;
	let getErrors = 0;

	for (const url of testUrls) {
		const result = await testUrl(url);
		getResults.push(result);

		if (result.status === 200) {
			honeypotTriggered++;
		} else if (result.status === 404) {
			notFoundReturned++;
		} else if (result.status === 'error') {
			getErrors++;
		}

		// Small delay between requests
		await new Promise((resolve) => setTimeout(resolve, 100));
	}

	// Test POST requests
	console.log(`${COLORS.green}📮 Testing POST Requests${COLORS.reset}`);
	console.log('='.repeat(50));

	const postResults = [];
	let randomErrorsGenerated = 0;
	let postErrors = 0;
	const statusCodes = new Set();

	for (const testCase of postTestData) {
		const result = await testPost(testCase);
		postResults.push(result);

		if (result.isRandomError) {
			randomErrorsGenerated++;
			statusCodes.add(result.status);
		} else if (result.status === 'error') {
			postErrors++;
		}

		// Small delay between requests
		await new Promise((resolve) => setTimeout(resolve, 150));
	}

	// Combined results
	const allResults = [...getResults, ...postResults];
	const totalErrors = getErrors + postErrors;

	console.log(`${COLORS.green}📊 Test Results Summary${COLORS.reset}`);
	console.log('='.repeat(50));
	console.log(`${COLORS.blue}GET Requests:${COLORS.reset}`);
	console.log(`  ${COLORS.green}Honeypot Triggered:${COLORS.reset} ${honeypotTriggered}`);
	console.log(`  ${COLORS.yellow}404 Not Found:${COLORS.reset} ${notFoundReturned}`);
	console.log(`  ${COLORS.red}Errors:${COLORS.reset} ${getErrors}`);
	console.log('');
	console.log(`${COLORS.blue}POST Requests:${COLORS.reset}`);
	console.log(`  ${COLORS.red}Random Errors Generated:${COLORS.reset} ${randomErrorsGenerated}`);
	console.log(
		`  ${COLORS.blue}Unique Status Codes:${COLORS.reset} ${Array.from(statusCodes)
			.sort((a, b) => a - b)
			.join(', ')}`,
	);
	console.log(`  ${COLORS.red}Request Errors:${COLORS.reset} ${postErrors}`);
	console.log('');
	console.log(`${COLORS.blue}Overall:${COLORS.reset}`);
	console.log(`  ${COLORS.blue}Total Tested:${COLORS.reset} ${allResults.length}`);
	console.log(`  ${COLORS.red}Total Errors:${COLORS.reset} ${totalErrors}`);
	console.log('');

	// Show honeypot triggers
	const honeypotUrls = getResults.filter((r) => r.status === 200);
	if (honeypotUrls.length > 0) {
		console.log(`${COLORS.green}🎯 GET Honeypot Triggers:${COLORS.reset}`);
		honeypotUrls.forEach((result) => {
			console.log(`  ${COLORS.green}✓${COLORS.reset} ${result.url} (${result.contentType})`);
		});
		console.log('');
	}

	// Show POST random errors
	const postRandomErrors = postResults.filter((r) => r.isRandomError);
	if (postRandomErrors.length > 0) {
		console.log(`${COLORS.red}🎲 POST Random Errors:${COLORS.reset}`);
		postRandomErrors.forEach((result) => {
			console.log(`  ${COLORS.red}✓${COLORS.reset} ${result.url} → ${result.status} (${result.contentType})`);
		});
		console.log('');
	}

	// Show legitimate 404s
	const notFoundUrls = getResults.filter((r) => r.status === 404);
	if (notFoundUrls.length > 0) {
		console.log(`${COLORS.yellow}📝 Legitimate 404s:${COLORS.reset}`);
		notFoundUrls.forEach((result) => {
			console.log(`  ${COLORS.yellow}-${COLORS.reset} ${result.url}`);
		});
		console.log('');
	}

	// Show errors
	const errorResults = allResults.filter((r) => r.status === 'error');
	if (errorResults.length > 0) {
		console.log(`${COLORS.red}❌ Errors:${COLORS.reset}`);
		errorResults.forEach((result) => {
			console.log(`  ${COLORS.red}✗${COLORS.reset} ${result.method} ${result.url}: ${result.error}`);
		});
		console.log('');
	}

	// Success rates
	const getSuccessRate = (((honeypotTriggered + notFoundReturned) / getResults.length) * 100).toFixed(1);
	const postSuccessRate = ((randomErrorsGenerated / postResults.length) * 100).toFixed(1);

	console.log(`${COLORS.blue}Success Rates:${COLORS.reset}`);
	console.log(
		`  ${COLORS.blue}GET Requests:${COLORS.reset} ${getSuccessRate}% (${honeypotTriggered + notFoundReturned}/${getResults.length})`,
	);
	console.log(`  ${COLORS.blue}POST Requests:${COLORS.reset} ${postSuccessRate}% (${randomErrorsGenerated}/${postResults.length})`);

	// Recommendations
	console.log('');
	console.log(`${COLORS.green}📋 Recommendations:${COLORS.reset}`);
	if (honeypotTriggered === 0) {
		console.log(`  ${COLORS.red}⚠️  No GET honeypot triggers detected. Check your patterns and generators.${COLORS.reset}`);
	} else {
		console.log(`  ${COLORS.green}✅ GET Honeypot is working correctly!${COLORS.reset}`);
	}

	if (randomErrorsGenerated === 0) {
		console.log(`  ${COLORS.red}⚠️  No POST random errors generated. Check POST handling logic.${COLORS.reset}`);
	} else {
		console.log(`  ${COLORS.green}✅ POST Random Error Generator is working correctly!${COLORS.reset}`);
	}

	if (statusCodes.size > 0) {
		console.log(
			`  ${COLORS.blue}💡 Generated ${statusCodes.size} different HTTP status codes: ${Array.from(statusCodes)
				.sort((a, b) => a - b)
				.join(', ')}${COLORS.reset}`,
		);
	}

	if (totalErrors > 0) {
		console.log(`  ${COLORS.red}⚠️  ${totalErrors} errors occurred. Check worker deployment and network connectivity.${COLORS.reset}`);
	}

	if (honeypotTriggered > 0 || randomErrorsGenerated > 0) {
		console.log(`  ${COLORS.blue}💡 Monitor your logs for real attack attempts using: wrangler tail${COLORS.reset}`);
	}
}

// Run tests if called directly
if (require.main === module) {
	runTests().catch(console.error);
}

module.exports = { testUrl, testPost, runTests, testUrls, postTestData };
