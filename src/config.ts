// Honeypot configuration using template generators

import { GitConfigGenerator, GitHeadGenerator, GitRefGenerator, GitIndexGenerator } from './templateGenerators/gitGenerator';
import { AdminPanelGenerator, PhpMyAdminGenerator } from './templateGenerators/adminGenerator';
import { WordPressLoginGenerator } from './templateGenerators/wordpressGenerator';
import {
	BackupFileGenerator,
	DatabaseFileGenerator,
	EnvironmentFileGenerator,
	CloudStorageFileGenerator,
	DataLeakGenerator,
} from './templateGenerators/fileGenerators';
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
	YarnLockGenerator,
	ComposerLockGenerator,
	DockerIgnoreGenerator,
	GitIgnoreGenerator,
	LogFileGenerator,
	ArchiveFileGenerator,
} from './templateGenerators/specializedGenerators';
import { RandomScannerResponseGenerator, EnhancedScannerResponseGenerator, ScannerDetector } from './templateGenerators/scannerDetector';
import { TemplateGenerator, RandomDataContext } from './templateGenerators/types';

export interface HoneypotRule {
	pattern: string;
	generatorClass: new (context?: RandomDataContext) => TemplateGenerator;
	description: string;
}

export const HONEYPOT_RULES: HoneypotRule[] = [
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
		generatorClass: YarnLockGenerator,
		description: 'Yarn lock file',
	},
	{
		pattern: 'composer\\.lock$',
		generatorClass: ComposerLockGenerator,
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
		generatorClass: LogFileGenerator,
		description: 'Log file',
	},
	{
		pattern: 'error_log$',
		generatorClass: LogFileGenerator,
		description: 'Error log file',
	},
	{
		pattern: 'access_log$',
		generatorClass: LogFileGenerator,
		description: 'Access log file',
	},

	// Archives and compressed files
	{
		pattern: '\\.(zip|tar|gz|rar|7z)$',
		generatorClass: ArchiveFileGenerator,
		description: 'Archive file',
	},

	// API endpoints
	{
		pattern: 'api/(v1|v2|v3)/.*$',
		generatorClass: SwaggerJsonGenerator,
		description: 'API endpoint',
	},
	{
		pattern: 'graphql/?$',
		generatorClass: SwaggerJsonGenerator,
		description: 'GraphQL endpoint',
	},
	{
		pattern: 'swagger\\.json$',
		generatorClass: SwaggerJsonGenerator,
		description: 'Swagger API documentation',
	},
	{
		pattern: 'openapi\\.json$',
		generatorClass: SwaggerJsonGenerator,
		description: 'OpenAPI specification',
	},
	{
		pattern: 'api-docs/?$',
		generatorClass: SwaggerJsonGenerator,
		description: 'API documentation',
	},

	// Cloud configuration files
	{
		pattern: '\\.aws/(config|credentials)$',
		generatorClass: AwsConfigGenerator,
		description: 'AWS configuration file',
	},
	{
		pattern: 'aws-exports\\.js$',
		generatorClass: AwsConfigGenerator,
		description: 'AWS Amplify exports',
	},
	{
		pattern: 'serverless\\.yml$',
		generatorClass: AwsConfigGenerator,
		description: 'Serverless framework configuration',
	},
	{
		pattern: 'cloudformation\\.json$',
		generatorClass: AwsConfigGenerator,
		description: 'CloudFormation template',
	},

	// Container and DevOps files
	{
		pattern: 'Dockerfile$',
		generatorClass: DockerfileGenerator,
		description: 'Docker configuration',
	},
	{
		pattern: 'docker-compose\\.ya?ml$',
		generatorClass: DockerfileGenerator,
		description: 'Docker Compose configuration',
	},
	{
		pattern: '\\.dockerignore$',
		generatorClass: DockerIgnoreGenerator,
		description: 'Docker ignore file',
	},
	{
		pattern: 'kubernetes\\.ya?ml$',
		generatorClass: KubernetesConfigGenerator,
		description: 'Kubernetes configuration',
	},
	{
		pattern: 'k8s\\.ya?ml$',
		generatorClass: KubernetesConfigGenerator,
		description: 'Kubernetes configuration',
	},

	// CI/CD files
	{
		pattern: '\\.github/workflows/.*\\.ya?ml$',
		generatorClass: BackupFileGenerator,
		description: 'GitHub Actions workflow',
	},
	{
		pattern: '\\.gitlab-ci\\.ya?ml$',
		generatorClass: BackupFileGenerator,
		description: 'GitLab CI configuration',
	},
	{
		pattern: 'Jenkinsfile$',
		generatorClass: BackupFileGenerator,
		description: 'Jenkins pipeline configuration',
	},

	// Modern configuration files
	{
		pattern: '\\.(ya?ml|toml|properties|cfg)$',
		generatorClass: EnvironmentFileGenerator,
		description: 'Configuration file',
	},
	{
		pattern: 'next\\.config\\.js$',
		generatorClass: PackageJsonGenerator,
		description: 'Next.js configuration',
	},
	{
		pattern: 'nuxt\\.config\\.js$',
		generatorClass: PackageJsonGenerator,
		description: 'Nuxt.js configuration',
	},
	{
		pattern: 'vue\\.config\\.js$',
		generatorClass: PackageJsonGenerator,
		description: 'Vue.js configuration',
	},
	{
		pattern: 'webpack\\.config\\.js$',
		generatorClass: PackageJsonGenerator,
		description: 'Webpack configuration',
	},
	{
		pattern: 'vite\\.config\\.(js|ts)$',
		generatorClass: PackageJsonGenerator,
		description: 'Vite configuration',
	},

	// Security and SEO files
	{
		pattern: 'robots\\.txt$',
		generatorClass: RobotsTxtGenerator,
		description: 'Robots.txt file',
	},
	{
		pattern: '\\.well-known/security\\.txt$',
		generatorClass: SecurityTxtGenerator,
		description: 'Security.txt file',
	},
	{
		pattern: 'sitemap\\.xml$',
		generatorClass: BackupFileGenerator,
		description: 'XML sitemap',
	},

	// IDE and editor files
	{
		pattern: '\\.vscode/(settings|launch)\\.json$',
		generatorClass: PackageJsonGenerator,
		description: 'VS Code configuration',
	},
	{
		pattern: '\\.gitignore$',
		generatorClass: GitIgnoreGenerator,
		description: 'Git ignore file',
	},
	{
		pattern: '\\.idea/.*$',
		generatorClass: BackupFileGenerator,
		description: 'IntelliJ IDEA configuration',
	},

	// Database and cache files
	{
		pattern: 'redis\\.conf$',
		generatorClass: EnvironmentFileGenerator,
		description: 'Redis configuration',
	},
	{
		pattern: 'mongodb\\.conf$',
		generatorClass: EnvironmentFileGenerator,
		description: 'MongoDB configuration',
	},
	{
		pattern: 'nginx\\.conf$',
		generatorClass: HtaccessGenerator,
		description: 'Nginx configuration',
	},

	// Backup directories
	{
		pattern: '(backup|backups|old|archive)/?.*$',
		generatorClass: BackupFileGenerator,
		description: 'Backup directory',
	},
	{
		pattern: '(tmp|temp|cache)/?.*$',
		generatorClass: BackupFileGenerator,
		description: 'Temporary directory',
	},

	// Version control systems
	{
		pattern: '\\.svn/entries$',
		generatorClass: GitConfigGenerator,
		description: 'SVN entries file',
	},
	{
		pattern: '\\.hg/hgrc$',
		generatorClass: GitConfigGenerator,
		description: 'Mercurial configuration',
	},

	// Mobile app files
	{
		pattern: 'AndroidManifest\\.xml$',
		generatorClass: WebConfigGenerator,
		description: 'Android manifest',
	},
	{
		pattern: 'Info\\.plist$',
		generatorClass: WebConfigGenerator,
		description: 'iOS Info.plist',
	},

	// Cryptocurrency and blockchain
	{
		pattern: 'wallet\\.dat$',
		generatorClass: DatabaseFileGenerator,
		description: 'Cryptocurrency wallet',
	},
	{
		pattern: 'keystore\\.json$',
		generatorClass: EnvironmentFileGenerator,
		description: 'Ethereum keystore',
	},

	// Cloud storage configurations
	{
		pattern: 's3\\.config$',
		generatorClass: CloudStorageFileGenerator,
		description: 'S3 configuration file',
	},
	{
		pattern: 'gcp-credentials\\.json$',
		generatorClass: CloudStorageFileGenerator,
		description: 'Google Cloud credentials',
	},
	{
		pattern: 'azure-storage\\.conf$',
		generatorClass: CloudStorageFileGenerator,
		description: 'Azure storage configuration',
	},

	// Data leak patterns (high-value targets)
	{
		pattern: 'dump\\.sql$',
		generatorClass: DataLeakGenerator,
		description: 'Database dump file',
	},
	{
		pattern: 'users\\.csv$',
		generatorClass: DataLeakGenerator,
		description: 'User data export',
	},
	{
		pattern: 'credentials\\.txt$',
		generatorClass: DataLeakGenerator,
		description: 'Credential file',
	},
	{
		pattern: 'passwords\\.txt$',
		generatorClass: DataLeakGenerator,
		description: 'Password file',
	},
	{
		pattern: 'emails\\.mbox$',
		generatorClass: DataLeakGenerator,
		description: 'Email archive',
	},

	// User-Agent based scanner detection (lowest priority - catch-all)
	{
		pattern: '.*', // Matches any path
		generatorClass: EnhancedScannerResponseGenerator,
		description: 'Scanner detection based on User-Agent',
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
