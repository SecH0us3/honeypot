// Scanner detection and random generator selection

import { BaseTemplateGenerator, RandomDataContext, TemplateGenerator } from './types';
import { GitConfigGenerator, GitHeadGenerator, GitRefGenerator, GitIndexGenerator } from './gitGenerator';
import { AdminPanelGenerator, PhpMyAdminGenerator } from './adminGenerator';
import { WordPressLoginGenerator } from './wordpressGenerator';
import { BackupFileGenerator, DatabaseFileGenerator, EnvironmentFileGenerator } from './fileGenerators';
import {
	PhpInfoGenerator,
	ComposerJsonGenerator,
	PackageJsonGenerator,
	HtaccessGenerator,
	WebConfigGenerator,
} from './specializedGenerators';

export class ScannerDetector {
	private static readonly SCANNER_PATTERNS = [
		// Web scanners and fuzzers
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
		/metasploit/i,
		/msfconsole/i,
		/kali/i,
		/parrot/i,
		/blackarch/i,
		/pentoo/i,

		// Automated tools
		/curl.*script/i,
		/wget.*script/i,
		/python.*requests/i,
		/python.*urllib/i,
		/python.*http/i,
		/golang/i,
		/go-http-client/i,
		/rust/i,
		/node.*fetch/i,
		/axios/i,
		/httpie/i,
		/postman/i,
		/insomnia/i,

		// Bot patterns
		/bot/i,
		/crawl/i,
		/spider/i,
		/scraper/i,
		/harvest/i,
		/extract/i,
		/monitor/i,
		/check/i,
		/test/i,
		/probe/i,
		/audit/i,
		/scan/i,

		// Suspicious patterns
		/automated/i,
		/script/i,
		/tool/i,
		/utility/i,
		/client/i,
		/agent/i,
		/library/i,
		/framework/i,

		// Common scanner libraries
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
		/selenium/i,
		/phantomjs/i,
		/headless/i,
		/chrome.*headless/i,
		/firefox.*headless/i,
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
		];

		const randomIndex = Math.floor(Math.random() * generators.length);
		return generators[randomIndex];
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

		if (this.scannerScore >= 3) {
			// High-sophistication scanner - give them something complex
			GeneratorClass = this.getRandomItem([
				PhpInfoGenerator,
				ComposerJsonGenerator,
				PackageJsonGenerator,
				DatabaseFileGenerator,
				EnvironmentFileGenerator,
			]);
		} else if (this.scannerScore >= 1) {
			// Basic scanner - simple responses
			GeneratorClass = this.getRandomItem([AdminPanelGenerator, WordPressLoginGenerator, BackupFileGenerator, HtaccessGenerator]);
		} else {
			// Fallback to random
			GeneratorClass = ScannerDetector.getRandomGenerator(context);
		}

		this.selectedGenerator = new GeneratorClass(context);
	}

	protected initializeVariables(): void {
		// Calculate scanner score here to avoid initialization order issues
		const scannerScore = ScannerDetector.getScannerScore(this.context.userAgent || '');

		this.variables = {
			scannerScore: scannerScore.toString(),
			userAgent: this.context.userAgent || 'Unknown',
			detectedAt: this.context.timestamp?.toISOString() || new Date().toISOString(),
			clientIp: this.context.clientIp || 'Unknown',
		};
	}

	generate(): string {
		// Add scanner detection metadata as HTML comment for logging
		const metadata = `<!-- Scanner detected: ${this.context.userAgent} | Score: ${this.scannerScore} | IP: ${this.context.clientIp} | Time: ${this.context.timestamp?.toISOString()} -->
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
		return `Enhanced scanner response (score: ${this.scannerScore}) - ${this.selectedGenerator.getDescription()}`;
	}
}
