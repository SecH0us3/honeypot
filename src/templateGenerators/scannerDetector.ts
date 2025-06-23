// Scanner detection and random generator selection

import { BaseTemplateGenerator, RandomDataContext, TemplateGenerator } from './types';
import { GitConfigGenerator, GitHeadGenerator, GitRefGenerator, GitIndexGenerator } from './gitGenerator';
import { AdminPanelGenerator, PhpMyAdminGenerator } from './adminGenerator';
import { WordPressLoginGenerator } from './wordpressGenerator';
import {
	BackupFileGenerator,
	DatabaseFileGenerator,
	EnvironmentFileGenerator,
	CloudStorageFileGenerator,
	DataLeakGenerator,
} from './fileGenerators';
import {
	PhpInfoGenerator,
	ComposerJsonGenerator,
	PackageJsonGenerator,
	HtaccessGenerator,
	WebConfigGenerator,
	SwaggerJsonGenerator,
	DockerfileGenerator,
	KubernetesConfigGenerator,
	AwsConfigGenerator,
	RobotsTxtGenerator,
	SecurityTxtGenerator,
} from './specializedGenerators';

export class ScannerDetector {
	private static readonly SCANNER_PATTERNS = [
		// Modern web scanners and fuzzers
		/ffuf/i,
		/feroxbuster/i,
		/gobuster/i,
		/dirb/i,
		/dirbuster/i,
		/wfuzz/i,
		/nikto/i,
		/nmap/i,
		/masscan/i,
		/zap/i,
		/burpsuite/i,
		/sqlmap/i,
		/nuclei/i,
		/httpx/i,
		/subfinder/i,
		/amass/i,
		/waybackurls/i,
		/gau/i,
		/katana/i,
		/aquatone/i,
		/dirsearch/i,
		/dirmap/i,
		/wpscan/i,
		/joomscan/i,
		/droopescan/i,
		/cmseek/i,
		/whatweb/i,
		/sublist3r/i,
		/knock/i,
		/dnsrecon/i,
		/fierce/i,
		/theharvester/i,
		/shodan/i,
		/censys/i,
		/masscan/i,
		/rustscan/i,
		/naabu/i,
		/testssl/i,
		/sslscan/i,
		/sslyze/i,

		// AI-powered and modern tools
		/openai/i,
		/chatgpt/i,
		/gpt-/i,
		/claude/i,
		/anthropic/i,
		/ai.*scanner/i,
		/ml.*scanner/i,
		/neural/i,

		// Cloud and container scanners
		/docker.*scan/i,
		/trivy/i,
		/clair/i,
		/anchore/i,
		/snyk/i,
		/aqua.*scan/i,
		/twistlock/i,
		/qualys/i,
		/rapid7/i,
		/nessus/i,
		/openvas/i,
		/greenbone/i,

		// API testing tools
		/postman/i,
		/insomnia/i,
		/swagger.*ui/i,
		/api.*test/i,
		/rest.*client/i,
		/graphql.*playground/i,
		/altair/i,
		/apollo.*studio/i,

		// DevOps and CI/CD scanners
		/jenkins/i,
		/gitlab.*scanner/i,
		/github.*scanner/i,
		/sonarqube/i,
		/sonar.*scanner/i,
		/checkmarx/i,
		/veracode/i,
		/fortify/i,
		/blackduck/i,
		/whitesource/i,

		// Penetration testing frameworks
		/metasploit/i,
		/msfconsole/i,
		/meterpreter/i,
		/cobalt.*strike/i,
		/empire/i,
		/covenant/i,
		/silver/i,
		/havoc/i,
		/sliver/i,
		/poshc2/i,

		// OSINT tools
		/maltego/i,
		/spiderfoot/i,
		/recon-ng/i,
		/osintgram/i,
		/social.*analyzer/i,
		/sherlock/i,
		/maigret/i,

		// Traditional patterns
		/crawler/i,
		/spider/i,
		/scanner/i,
		/pentest/i,
		/hack/i,
		/exploit/i,
		/vulnerability/i,
		/security/i,
		/recon/i,
		/enum/i,
		/bruteforce/i,
		/brute.?force/i,
		/hydra/i,
		/medusa/i,
		/john/i,
		/hashcat/i,
		/kali/i,
		/parrot/i,
		/blackarch/i,
		/pentoo/i,

		// Automated tools and scripts
		/curl.*script/i,
		/wget.*script/i,
		/python.*requests/i,
		/python.*urllib/i,
		/python.*http/i,
		/python.*aiohttp/i,
		/golang/i,
		/go-http-client/i,
		/rust/i,
		/node.*fetch/i,
		/axios/i,
		/httpie/i,
		/powershell/i,
		/invoke-webrequest/i,
		/invoke-restmethod/i,

		// Bot and automation patterns
		/bot/i,
		/crawl/i,
		/scraper/i,
		/harvest/i,
		/extract/i,
		/monitor/i,
		/check/i,
		/test/i,
		/probe/i,
		/audit/i,
		/scan/i,
		/validation/i,
		/compliance/i,

		// Suspicious automation indicators
		/automated/i,
		/script/i,
		/tool/i,
		/utility/i,
		/client/i,
		/agent/i,
		/library/i,
		/framework/i,
		/headless/i,
		/phantom/i,
		/selenium/i,
		/puppeteer/i,
		/playwright/i,
		/webdriver/i,

		// Programming language HTTP libraries
		/requests/i,
		/urllib/i,
		/http\.client/i,
		/aiohttp/i,
		/httplib/i,
		/okhttp/i,
		/apache.*httpclient/i,
		/jersey/i,
		/resttemplate/i,
		/webclient/i,
		/guzzle/i,
		/faraday/i,
		/httparty/i,
		/rest-client/i,
		/net::http/i,
		/lwp::useragent/i,
		/mechanize/i,
		/beautifulsoup/i,
		/scrapy/i,
		/chrome.*headless/i,
		/firefox.*headless/i,

		// Mobile and IoT scanners
		/android.*scanner/i,
		/ios.*scanner/i,
		/mobile.*scanner/i,
		/iot.*scanner/i,
		/embedded.*scanner/i,

		// Blockchain and crypto scanners
		/ethereum.*scanner/i,
		/bitcoin.*scanner/i,
		/crypto.*scanner/i,
		/blockchain.*scanner/i,
		/web3.*scanner/i,

		// Version patterns that indicate tools
		/\/\d+\.\d+/,
		/v\d+\.\d+/,
		/version.*\d+/i,

		// Empty or minimal User-Agents (suspicious)
		/^$/,
		/^-$/,
		/^null$/i,
		/^undefined$/i,
		/^test$/i,
		/^scanner$/i,
		/^tool$/i,
		/^script$/i,
	];

	static isScannerUserAgent(userAgent: string): boolean {
		if (!userAgent) return false;

		return this.SCANNER_PATTERNS.some((pattern) => pattern.test(userAgent));
	}

	static getScannerScore(userAgent: string): number {
		if (!userAgent) return 0;

		let score = 0;
		for (const pattern of this.SCANNER_PATTERNS) {
			if (pattern.test(userAgent)) {
				score++;
			}
		}
		return score;
	}

	static getRandomGenerator(context: RandomDataContext): new (context?: RandomDataContext) => TemplateGenerator {
		const generators = [
			GitConfigGenerator,
			GitHeadGenerator,
			GitRefGenerator,
			GitIndexGenerator,
			AdminPanelGenerator,
			PhpMyAdminGenerator,
			WordPressLoginGenerator,
			BackupFileGenerator,
			DatabaseFileGenerator,
			EnvironmentFileGenerator,
			PhpInfoGenerator,
			ComposerJsonGenerator,
			PackageJsonGenerator,
			HtaccessGenerator,
			WebConfigGenerator,
			SwaggerJsonGenerator,
			DockerfileGenerator,
			KubernetesConfigGenerator,
			AwsConfigGenerator,
			RobotsTxtGenerator,
			SecurityTxtGenerator,
			CloudStorageFileGenerator,
			DataLeakGenerator,
		];

		const randomIndex = Math.floor(Math.random() * generators.length);
		return generators[randomIndex];
	}

	static getScannerType(userAgent: string): string {
		if (!userAgent) return 'unknown';

		const lowercaseUA = userAgent.toLowerCase();

		// AI/ML tools
		if (/openai|chatgpt|gpt-|claude|anthropic/.test(lowercaseUA)) return 'ai-powered';

		// Professional security tools
		if (/burpsuite|nessus|qualys|rapid7|checkmarx|veracode/.test(lowercaseUA)) return 'professional';

		// Cloud/container scanners
		if (/docker|trivy|snyk|aqua/.test(lowercaseUA)) return 'container';

		// API testing tools
		if (/postman|insomnia|swagger|graphql/.test(lowercaseUA)) return 'api-testing';

		// Penetration testing frameworks
		if (/metasploit|cobalt|empire|covenant/.test(lowercaseUA)) return 'pentest-framework';

		// Web application scanners
		if (/nikto|wpscan|nuclei|sqlmap/.test(lowercaseUA)) return 'webapp-scanner';

		// Directory/file fuzzers
		if (/ffuf|feroxbuster|gobuster|dirb|wfuzz/.test(lowercaseUA)) return 'fuzzer';

		// OSINT tools
		if (/maltego|spiderfoot|recon-ng|sherlock/.test(lowercaseUA)) return 'osint';

		// Programming libraries
		if (/requests|urllib|axios|okhttp|guzzle/.test(lowercaseUA)) return 'http-library';

		// Headless browsers
		if (/headless|phantom|selenium|puppeteer|playwright/.test(lowercaseUA)) return 'headless-browser';

		// Generic scanners
		if (/scan|crawl|spider|bot/.test(lowercaseUA)) return 'generic-scanner';

		return 'unknown';
	}

	static getScannerSophistication(userAgent: string): 'low' | 'medium' | 'high' {
		const scannerType = this.getScannerType(userAgent);
		const score = this.getScannerScore(userAgent);

		// High sophistication
		if (['ai-powered', 'professional', 'pentest-framework'].includes(scannerType) || score >= 5) {
			return 'high';
		}

		// Medium sophistication
		if (['container', 'api-testing', 'webapp-scanner', 'osint'].includes(scannerType) || score >= 2) {
			return 'medium';
		}

		// Low sophistication
		return 'low';
	}
}

export class RandomScannerResponseGenerator extends BaseTemplateGenerator {
	private selectedGenerator: TemplateGenerator;

	constructor(context: RandomDataContext = {}) {
		super(context);
		const GeneratorClass = ScannerDetector.getRandomGenerator(context);
		this.selectedGenerator = new GeneratorClass(context);
	}

	protected initializeVariables(): void {
		// Variables are handled by the selected generator
		this.variables = {};
	}

	generate(): string {
		return this.selectedGenerator.generate();
	}

	getContentType(): string {
		return this.selectedGenerator.getContentType();
	}

	getDescription(): string {
		return `Random response for scanner (${this.selectedGenerator.getDescription()})`;
	}
}

export class EnhancedScannerResponseGenerator extends BaseTemplateGenerator {
	private selectedGenerator: TemplateGenerator;
	private scannerScore: number = 0;

	constructor(context: RandomDataContext = {}) {
		super(context);

		this.scannerScore = ScannerDetector.getScannerScore(context.userAgent || '');

		// Choose generator based on scanner sophistication
		let GeneratorClass: new (context?: RandomDataContext) => TemplateGenerator;

		const sophistication = ScannerDetector.getScannerSophistication(context.userAgent || '');
		const scannerType = ScannerDetector.getScannerType(context.userAgent || '');

		if (sophistication === 'high') {
			// High-sophistication scanner - give them complex, realistic responses
			if (scannerType === 'ai-powered') {
				GeneratorClass = this.getRandomItem([DataLeakGenerator, SwaggerJsonGenerator, AwsConfigGenerator]);
			} else if (scannerType === 'professional') {
				GeneratorClass = this.getRandomItem([DatabaseFileGenerator, EnvironmentFileGenerator, CloudStorageFileGenerator]);
			} else if (scannerType === 'container') {
				GeneratorClass = this.getRandomItem([DockerfileGenerator, KubernetesConfigGenerator, AwsConfigGenerator]);
			} else {
				GeneratorClass = this.getRandomItem([
					PhpInfoGenerator,
					ComposerJsonGenerator,
					PackageJsonGenerator,
					DatabaseFileGenerator,
					EnvironmentFileGenerator,
					DataLeakGenerator,
				]);
			}
		} else if (sophistication === 'medium') {
			// Medium scanner - moderate complexity
			if (scannerType === 'api-testing') {
				GeneratorClass = this.getRandomItem([SwaggerJsonGenerator, ComposerJsonGenerator, PackageJsonGenerator]);
			} else if (scannerType === 'webapp-scanner') {
				GeneratorClass = this.getRandomItem([AdminPanelGenerator, WordPressLoginGenerator, PhpInfoGenerator]);
			} else if (scannerType === 'container') {
				GeneratorClass = this.getRandomItem([DockerfileGenerator, EnvironmentFileGenerator]);
			} else if (scannerType === 'osint') {
				GeneratorClass = this.getRandomItem([RobotsTxtGenerator, SecurityTxtGenerator, BackupFileGenerator]);
			} else {
				GeneratorClass = this.getRandomItem([
					AdminPanelGenerator,
					WordPressLoginGenerator,
					BackupFileGenerator,
					HtaccessGenerator,
					EnvironmentFileGenerator,
					SwaggerJsonGenerator,
				]);
			}
		} else {
			// Low sophistication or unknown - simple responses
			GeneratorClass = this.getRandomItem([
				AdminPanelGenerator,
				WordPressLoginGenerator,
				BackupFileGenerator,
				HtaccessGenerator,
				RobotsTxtGenerator,
			]);
		}

		this.selectedGenerator = new GeneratorClass(context);
	}

	protected initializeVariables(): void {
		// Calculate scanner score here to avoid initialization order issues
		const scannerScore = ScannerDetector.getScannerScore(this.context.userAgent || '');

		const scannerType = ScannerDetector.getScannerType(this.context.userAgent || '');
		const sophistication = ScannerDetector.getScannerSophistication(this.context.userAgent || '');

		this.variables = {
			scannerScore: scannerScore.toString(),
			scannerType: scannerType,
			sophistication: sophistication,
			userAgent: this.context.userAgent || 'Unknown',
			detectedAt: this.context.timestamp?.toISOString() || new Date().toISOString(),
			clientIp: this.context.clientIp || 'Unknown',
		};
	}

	generate(): string {
		// Add enhanced scanner detection metadata as HTML comment for logging
		const scannerType = ScannerDetector.getScannerType(this.context.userAgent || '');
		const sophistication = ScannerDetector.getScannerSophistication(this.context.userAgent || '');

		const metadata = `<!-- Scanner detected: ${this.context.userAgent} | Type: ${scannerType} | Sophistication: ${sophistication} | Score: ${this.scannerScore} | IP: ${this.context.clientIp} | Time: ${this.context.timestamp?.toISOString()} -->
`;

		const content = this.selectedGenerator.generate();

		// Only add metadata to HTML responses
		if (this.selectedGenerator.getContentType().includes('text/html')) {
			return metadata + content;
		}

		return content;
	}

	getContentType(): string {
		return this.selectedGenerator.getContentType();
	}

	getDescription(): string {
		const scannerType = ScannerDetector.getScannerType(this.context.userAgent || '');
		const sophistication = ScannerDetector.getScannerSophistication(this.context.userAgent || '');
		return `Enhanced scanner response (type: ${scannerType}, sophistication: ${sophistication}, score: ${this.scannerScore}) - ${this.selectedGenerator.getDescription()}`;
	}
}
