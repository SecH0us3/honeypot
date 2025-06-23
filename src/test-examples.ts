// Test examples for honeypot scanner detection and specialized generators

import { ScannerDetector, EnhancedScannerResponseGenerator, RandomScannerResponseGenerator } from './templateGenerators/scannerDetector';
import {
	PhpInfoGenerator,
	ComposerJsonGenerator,
	PackageJsonGenerator,
	HtaccessGenerator,
	WebConfigGenerator,
} from './templateGenerators/specializedGenerators';
import { matchRule, createGenerator } from './config';
import { RandomDataContext } from './templateGenerators/types';

// Test data
const testContext: RandomDataContext = {
	companyName: 'TestCorp',
	companyDomain: 'testcorp.com',
	adminEmail: 'admin@testcorp.com',
	userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
	clientIp: '192.168.1.100',
	timestamp: new Date('2024-01-15T10:30:00.000Z'),
	timezone: 'UTC',
	locale: 'en_US',
};

const scannerUserAgents = [
	'ffuf/1.5.0',
	'feroxbuster/2.7.1',
	'gobuster/3.1.0',
	'Mozilla/5.0 (compatible; Nuclei - Open-source project)',
	'sqlmap/1.6.12#stable',
	'python-requests/2.28.1',
	'dirb/2.22',
	'nikto/2.1.6',
	'nmap/7.92',
	'wfuzz/3.1.0',
	'burpsuite/2022.12.7',
	'curl/7.68.0 (scanning script)',
	'python-urllib/3.9',
	'go-http-client/1.1',
	'axios/0.27.2',
];

const legitimateUserAgents = [
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
	'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
];

// Test functions
function testScannerDetection() {
	console.log('=== Testing Scanner Detection ===');

	// Test scanner user agents
	console.log('\nScanner User-Agents:');
	for (const ua of scannerUserAgents) {
		const isScanner = ScannerDetector.isScannerUserAgent(ua);
		const score = ScannerDetector.getScannerScore(ua);
		console.log(`${ua.padEnd(50)} | Scanner: ${isScanner} | Score: ${score}`);
	}

	// Test legitimate user agents
	console.log('\nLegitimate User-Agents:');
	for (const ua of legitimateUserAgents) {
		const isScanner = ScannerDetector.isScannerUserAgent(ua);
		const score = ScannerDetector.getScannerScore(ua);
		console.log(`${ua.substring(0, 50).padEnd(50)} | Scanner: ${isScanner} | Score: ${score}`);
	}
}

function testSpecializedGenerators() {
	console.log('\n=== Testing Specialized Generators ===');

	const generators = [
		{ name: 'PhpInfoGenerator', class: PhpInfoGenerator },
		{ name: 'ComposerJsonGenerator', class: ComposerJsonGenerator },
		{ name: 'PackageJsonGenerator', class: PackageJsonGenerator },
		{ name: 'HtaccessGenerator', class: HtaccessGenerator },
		{ name: 'WebConfigGenerator', class: WebConfigGenerator },
	];

	for (const gen of generators) {
		console.log(`\n--- ${gen.name} ---`);
		const generator = new gen.class(testContext);
		const content = generator.generate();

		console.log(`Description: ${generator.getDescription()}`);
		console.log(`Content-Type: ${generator.getContentType()}`);
		console.log(`Content Length: ${content.length} characters`);
		console.log(`Preview: ${content.substring(0, 100)}...`);
	}
}

function testScannerResponseGenerators() {
	console.log('\n=== Testing Scanner Response Generators ===');

	// Test with different scanner user agents
	const testCases = [
		{ ua: 'ffuf/1.5.0', expectedScore: 'high' },
		{ ua: 'python-requests/2.28.1', expectedScore: 'medium' },
		{ ua: 'curl/7.68.0', expectedScore: 'low' },
		{ ua: 'Mozilla/5.0 (legitimate browser)', expectedScore: 'none' },
	];

	for (const testCase of testCases) {
		console.log(`\n--- Testing with: ${testCase.ua} ---`);

		const contextWithUA = { ...testContext, userAgent: testCase.ua };

		// Test Random Scanner Response
		const randomGen = new RandomScannerResponseGenerator(contextWithUA);
		console.log(`Random Generator: ${randomGen.getDescription()}`);

		// Test Enhanced Scanner Response
		const enhancedGen = new EnhancedScannerResponseGenerator(contextWithUA);
		console.log(`Enhanced Generator: ${enhancedGen.getDescription()}`);

		const score = ScannerDetector.getScannerScore(testCase.ua);
		console.log(`Actual Score: ${score}`);
	}
}

function testConfigMatching() {
	console.log('\n=== Testing Configuration Matching ===');

	const testUrls = [
		'/.git/config',
		'/admin',
		'/wp-login.php',
		'/phpinfo.php',
		'/composer.json',
		'/package.json',
		'/.htaccess',
		'/web.config',
		'/backup.sql',
		'/config.php',
	];

	const testUserAgent = 'ffuf/1.5.0';

	for (const url of testUrls) {
		console.log(`\n--- Testing URL: ${url} ---`);

		// Test with scanner user agent
		const rule = matchRule(url, testUserAgent);
		if (rule) {
			console.log(`Matched Rule: ${rule.description}`);
			console.log(`Generator: ${rule.generatorClass.name}`);
		} else {
			console.log('No rule matched');
		}

		// Test with legitimate user agent
		const legitimateRule = matchRule(url, legitimateUserAgents[0]);
		if (legitimateRule && legitimateRule.generatorClass.name !== 'EnhancedScannerResponseGenerator') {
			console.log(`Legitimate Match: ${legitimateRule.description}`);
		}
	}
}

function testContentGeneration() {
	console.log('\n=== Testing Content Generation ===');

	// Mock request object
	const mockRequest = {
		headers: {
			get: (header: string) => {
				if (header === 'User-Agent') return 'ffuf/1.5.0';
				if (header === 'CF-Connecting-IP') return '192.168.1.100';
				return null;
			},
		},
	} as any;

	const mockEnv = {
		COMPANY_NAME: 'TestCorp',
		COMPANY_DOMAIN: 'testcorp.com',
		ADMIN_EMAIL: 'admin@testcorp.com',
		TIMEZONE: 'UTC',
		LOCALE: 'en_US',
	};

	// Test creating generators with real context
	const testGenerators = [PhpInfoGenerator, ComposerJsonGenerator, HtaccessGenerator];

	for (const GeneratorClass of testGenerators) {
		console.log(`\n--- Testing ${GeneratorClass.name} with full context ---`);

		const generator = createGenerator(GeneratorClass, mockRequest, mockEnv);
		const content = generator.generate();

		console.log(`Generated ${content.length} characters`);
		console.log(`Content-Type: ${generator.getContentType()}`);

		// Check if context variables were used
		if (content.includes('testcorp.com')) {
			console.log('✓ Company domain used correctly');
		}
		if (content.includes('admin@testcorp.com')) {
			console.log('✓ Admin email used correctly');
		}
		if (content.includes('192.168.1.100')) {
			console.log('✓ Client IP used correctly');
		}
		if (content.includes('ffuf')) {
			console.log('✓ User-Agent detected correctly');
		}
	}
}

function testRandomness() {
	console.log('\n=== Testing Randomness ===');

	// Test that random generators produce different outputs
	const generator1 = new RandomScannerResponseGenerator(testContext);
	const generator2 = new RandomScannerResponseGenerator(testContext);

	console.log(`Generator 1: ${generator1.getDescription()}`);
	console.log(`Generator 2: ${generator2.getDescription()}`);

	if (generator1.getDescription() !== generator2.getDescription()) {
		console.log('✓ Random generator selection working');
	} else {
		console.log('! Random generators might be the same (could be coincidence)');
	}

	// Test random data generation
	const phpGen1 = new PhpInfoGenerator(testContext);
	const phpGen2 = new PhpInfoGenerator(testContext);

	const content1 = phpGen1.generate();
	const content2 = phpGen2.generate();

	if (content1 !== content2) {
		console.log('✓ Random data generation working');
	} else {
		console.log('! Generated content is identical (unexpected)');
	}
}

// Run all tests
function runAllTests() {
	console.log('🚀 Starting Honeypot Tests\n');

	try {
		testScannerDetection();
		testSpecializedGenerators();
		testScannerResponseGenerators();
		testConfigMatching();
		testContentGeneration();
		testRandomness();

		console.log('\n✅ All tests completed successfully!');
	} catch (error) {
		console.error('\n❌ Test failed:', error);
	}
}

// Export test functions for individual testing
export {
	testScannerDetection,
	testSpecializedGenerators,
	testScannerResponseGenerators,
	testConfigMatching,
	testContentGeneration,
	testRandomness,
	runAllTests,
};

// Run tests if this file is executed directly (for Node.js environments)
// This check is commented out to avoid TypeScript errors in Cloudflare Workers
// if (typeof require !== 'undefined' && require.main === module) {
// 	runAllTests();
// }
