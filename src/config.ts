// Honeypot configuration using template generators

import { GitConfigGenerator, GitHeadGenerator, GitRefGenerator, GitIndexGenerator } from './templateGenerators/gitGenerator';
import { AdminPanelGenerator, PhpMyAdminGenerator } from './templateGenerators/adminGenerator';
import { WordPressLoginGenerator } from './templateGenerators/wordpressGenerator';
import { BackupFileGenerator, DatabaseFileGenerator, EnvironmentFileGenerator } from './templateGenerators/fileGenerators';
import {
	PhpInfoGenerator,
	ComposerJsonGenerator,
	PackageJsonGenerator,
	HtaccessGenerator,
	WebConfigGenerator,
} from './templateGenerators/specializedGenerators';
import { RandomScannerResponseGenerator, EnhancedScannerResponseGenerator, ScannerDetector } from './templateGenerators/scannerDetector';
import { TemplateGenerator, RandomDataContext } from './templateGenerators/types';

export interface HoneypotRule {
	pattern: string;
	generatorClass: new (context?: RandomDataContext) => TemplateGenerator;
	description: string;
}

export const HONEYPOT_RULES: HoneypotRule[] = [
	// User-Agent based scanner detection (highest priority)
	{
		pattern: '.*', // Matches any path
		generatorClass: EnhancedScannerResponseGenerator,
		description: 'Scanner detection based on User-Agent',
	},

	// Git files
	{
		pattern: '\\.git/config$',
		generatorClass: GitConfigGenerator,
		description: 'Git configuration file',
	},
	{
		pattern: '\\.git/HEAD$',
		generatorClass: GitHeadGenerator,
		description: 'Git HEAD reference',
	},
	{
		pattern: '\\.git/refs/heads/(main|master|develop)$',
		generatorClass: GitRefGenerator,
		description: 'Git branch reference',
	},
	{
		pattern: '\\.git/index$',
		generatorClass: GitIndexGenerator,
		description: 'Git index file',
	},

	// Admin panels
	{
		pattern: '(admin|administrator|wp-admin)/?$',
		generatorClass: AdminPanelGenerator,
		description: 'Admin panel login page',
	},
	{
		pattern: 'phpmyadmin/?$',
		generatorClass: PhpMyAdminGenerator,
		description: 'phpMyAdmin login page',
	},

	// WordPress
	{
		pattern: 'wp-login\\.php$',
		generatorClass: WordPressLoginGenerator,
		description: 'WordPress login page',
	},
	{
		pattern: 'wp-admin/?$',
		generatorClass: WordPressLoginGenerator,
		description: 'WordPress admin login',
	},

	// Backup files
	{
		pattern: '\\.(bak|backup|old|orig|tmp)$',
		generatorClass: BackupFileGenerator,
		description: 'Backup file',
	},

	// Database files
	{
		pattern: '\\.(sql|db|sqlite|mdb)$',
		generatorClass: DatabaseFileGenerator,
		description: 'Database dump file',
	},

	// Environment files
	{
		pattern: '\\.(env|config|ini|conf)$',
		generatorClass: EnvironmentFileGenerator,
		description: 'Environment configuration file',
	},

	// Additional common attack vectors
	{
		pattern: 'config\\.php$',
		generatorClass: EnvironmentFileGenerator,
		description: 'PHP configuration file',
	},
	{
		pattern: 'settings\\.php$',
		generatorClass: EnvironmentFileGenerator,
		description: 'PHP settings file',
	},
	{
		pattern: 'database\\.php$',
		generatorClass: EnvironmentFileGenerator,
		description: 'Database configuration file',
	},
	{
		pattern: 'wp-config\\.php$',
		generatorClass: EnvironmentFileGenerator,
		description: 'WordPress configuration file',
	},
	{
		pattern: '\\.htaccess$',
		generatorClass: HtaccessGenerator,
		description: 'Apache configuration file',
	},
	{
		pattern: 'web\\.config$',
		generatorClass: WebConfigGenerator,
		description: 'IIS configuration file',
	},

	// Common admin paths
	{
		pattern: 'admin\\.php$',
		generatorClass: AdminPanelGenerator,
		description: 'Admin PHP script',
	},
	{
		pattern: 'login\\.php$',
		generatorClass: AdminPanelGenerator,
		description: 'Login PHP script',
	},
	{
		pattern: 'manage/?$',
		generatorClass: AdminPanelGenerator,
		description: 'Management interface',
	},
	{
		pattern: 'control/?$',
		generatorClass: AdminPanelGenerator,
		description: 'Control panel',
	},
	{
		pattern: 'panel/?$',
		generatorClass: AdminPanelGenerator,
		description: 'Admin panel',
	},

	// Development files
	{
		pattern: 'composer\\.json$',
		generatorClass: ComposerJsonGenerator,
		description: 'Composer configuration',
	},
	{
		pattern: 'package\\.json$',
		generatorClass: PackageJsonGenerator,
		description: 'NPM package configuration',
	},
	{
		pattern: 'yarn\\.lock$',
		generatorClass: BackupFileGenerator,
		description: 'Yarn lock file',
	},
	{
		pattern: 'composer\\.lock$',
		generatorClass: BackupFileGenerator,
		description: 'Composer lock file',
	},

	// Server info files
	{
		pattern: 'phpinfo\\.php$',
		generatorClass: PhpInfoGenerator,
		description: 'PHP info page',
	},
	{
		pattern: 'info\\.php$',
		generatorClass: PhpInfoGenerator,
		description: 'Server info page',
	},
	{
		pattern: 'test\\.php$',
		generatorClass: AdminPanelGenerator,
		description: 'Test PHP script',
	},

	// Logs and debug files
	{
		pattern: '\\.(log|debug|trace)$',
		generatorClass: BackupFileGenerator,
		description: 'Log file',
	},
	{
		pattern: 'error_log$',
		generatorClass: BackupFileGenerator,
		description: 'Error log file',
	},
	{
		pattern: 'access_log$',
		generatorClass: BackupFileGenerator,
		description: 'Access log file',
	},

	// Archives and compressed files
	{
		pattern: '\\.(zip|tar|gz|rar|7z)$',
		generatorClass: BackupFileGenerator,
		description: 'Archive file',
	},
];

// Helper function to create generator with context
export function createGenerator(
	generatorClass: new (context?: RandomDataContext) => TemplateGenerator,
	request: Request,
	env?: any,
): TemplateGenerator {
	const context: RandomDataContext = {
		companyName: env?.COMPANY_NAME,
		companyDomain: env?.COMPANY_DOMAIN,
		adminEmail: env?.ADMIN_EMAIL,
		userAgent: request.headers.get('User-Agent') || undefined,
		clientIp: request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || undefined,
		timestamp: new Date(),
		timezone: env?.TIMEZONE || 'UTC',
		locale: env?.LOCALE || 'en_US',
	};

	return new generatorClass(context);
}

// Helper function to match request against rules
export function matchRule(url: string, userAgent: string): HoneypotRule | null {
	for (const rule of HONEYPOT_RULES) {
		// Special handling for scanner detection rule
		if (rule.generatorClass === EnhancedScannerResponseGenerator) {
			if (ScannerDetector.isScannerUserAgent(userAgent)) {
				return rule;
			}
			continue; // Skip this rule if not a scanner
		}

		// Regular pattern matching
		const regex = new RegExp(rule.pattern);
		if (regex.test(url)) {
			return rule;
		}
	}
	return null;
}
