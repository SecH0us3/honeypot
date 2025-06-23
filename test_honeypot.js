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
    '/about.html'
];

const WORKER_URL = process.env.WORKER_URL || 'http://localhost:8787';
const COLORS = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

async function testUrl(url) {
    try {
        console.log(`${COLORS.blue}Testing:${COLORS.reset} ${url}`);

        const response = await fetch(`${WORKER_URL}${url}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'X-Forwarded-For': '192.168.1.100'
            }
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
            status,
            contentType,
            server,
            poweredBy,
            responseTime,
            bodyLength: bodyPreview.length,
            isHoneypot: status === 200
        };

    } catch (error) {
        console.log(`  ${COLORS.red}Error:${COLORS.reset} ${error.message}`);
        console.log('');
        return {
            url,
            status: 'error',
            error: error.message
        };
    }
}

async function runTests() {
    console.log(`${COLORS.green}🍯 Honeypot Test Suite${COLORS.reset}`);
    console.log(`${COLORS.blue}Testing Worker URL:${COLORS.reset} ${WORKER_URL}`);
    console.log(`${COLORS.blue}Total URLs to test:${COLORS.reset} ${testUrls.length}`);
    console.log('');

    const results = [];
    let honeypotTriggered = 0;
    let notFoundReturned = 0;
    let errors = 0;

    for (const url of testUrls) {
        const result = await testUrl(url);
        results.push(result);

        if (result.status === 200) {
            honeypotTriggered++;
        } else if (result.status === 404) {
            notFoundReturned++;
        } else if (result.status === 'error') {
            errors++;
        }

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`${COLORS.green}📊 Test Results Summary:${COLORS.reset}`);
    console.log(`  ${COLORS.green}Honeypot Triggered:${COLORS.reset} ${honeypotTriggered}`);
    console.log(`  ${COLORS.yellow}404 Not Found:${COLORS.reset} ${notFoundReturned}`);
    console.log(`  ${COLORS.red}Errors:${COLORS.reset} ${errors}`);
    console.log(`  ${COLORS.blue}Total Tested:${COLORS.reset} ${results.length}`);
    console.log('');

    // Show honeypot triggers
    const honeypotUrls = results.filter(r => r.status === 200);
    if (honeypotUrls.length > 0) {
        console.log(`${COLORS.green}🎯 Honeypot Triggers:${COLORS.reset}`);
        honeypotUrls.forEach(result => {
            console.log(`  ${COLORS.green}✓${COLORS.reset} ${result.url} (${result.contentType})`);
        });
        console.log('');
    }

    // Show legitimate 404s
    const notFoundUrls = results.filter(r => r.status === 404);
    if (notFoundUrls.length > 0) {
        console.log(`${COLORS.yellow}📝 Legitimate 404s:${COLORS.reset}`);
        notFoundUrls.forEach(result => {
            console.log(`  ${COLORS.yellow}-${COLORS.reset} ${result.url}`);
        });
        console.log('');
    }

    // Show errors
    const errorUrls = results.filter(r => r.status === 'error');
    if (errorUrls.length > 0) {
        console.log(`${COLORS.red}❌ Errors:${COLORS.reset}`);
        errorUrls.forEach(result => {
            console.log(`  ${COLORS.red}✗${COLORS.reset} ${result.url}: ${result.error}`);
        });
        console.log('');
    }

    // Success rate
    const successRate = ((honeypotTriggered + notFoundReturned) / results.length * 100).toFixed(1);
    console.log(`${COLORS.blue}Success Rate:${COLORS.reset} ${successRate}% (${honeypotTriggered + notFoundReturned}/${results.length})`);

    // Recommendations
    console.log('');
    console.log(`${COLORS.green}📋 Recommendations:${COLORS.reset}`);
    if (honeypotTriggered === 0) {
        console.log(`  ${COLORS.red}⚠️  No honeypot triggers detected. Check your patterns and generators.${COLORS.reset}`);
    } else {
        console.log(`  ${COLORS.green}✅ Honeypot is working correctly!${COLORS.reset}`);
    }

    if (errors > 0) {
        console.log(`  ${COLORS.red}⚠️  ${errors} errors occurred. Check worker deployment and network connectivity.${COLORS.reset}`);
    }

    if (honeypotTriggered > 0) {
        console.log(`  ${COLORS.blue}💡 Monitor your logs for real attack attempts using: wrangler tail${COLORS.reset}`);
    }
}

// Run tests if called directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { testUrl, runTests, testUrls };
