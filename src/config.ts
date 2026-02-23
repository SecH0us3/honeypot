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
import {
	TerraformGenerator,
	CicdConfigGenerator,
	AiMlGenerator,
	RemoteAccessGenerator,
} from './templateGenerators/modernGenerators';
import { RandomScannerResponseGenerator, EnhancedScannerResponseGenerator, ScannerDetector } from './templateGenerators/scannerDetector';
import { TemplateGenerator, RandomDataContext } from './templateGenerators/types';

export interface HoneypotRule {
	pattern: string;
	generatorClass: new (context?: RandomDataContext) => TemplateGenerator;
	description: string;
}

export const HONEYPOT_RULES: HoneypotRule[] = [
	// 1. High-Value Credentials & Cloud (Highest Priority)
	{
		pattern: '^/\\.aws/(config|credentials)$',
		generatorClass: AwsConfigGenerator,
		description: 'AWS configuration and credentials',
	},
	{
		pattern: '^/\\.(s3cfg|boto|gsutil)$',
		generatorClass: CloudStorageFileGenerator,
		description: 'Cloud storage configuration',
	},
	{
		pattern: '^/\\.ssh/(id_rsa|id_ed25519|id_dsa|id_ecdsa|config|authorized_keys)$',
		generatorClass: RemoteAccessGenerator,
		description: 'SSH private keys and configuration',
	},
	{
		pattern: '^/\\.kube/config$',
		generatorClass: KubernetesConfigGenerator,
		description: 'Kubernetes configuration',
	},
	{
		pattern: '^/\\.(env|env\\..*|passwd|shadow|credentials)$',
		generatorClass: EnvironmentFileGenerator,
		description: 'Environment and sensitive credentials',
	},

	// 2. Version Control Systems
	{
		pattern: '/\\.git/config$',
		generatorClass: GitConfigGenerator,
		description: 'Git configuration file',
	},
	{
		pattern: '/\\.git/HEAD$',
		generatorClass: GitHeadGenerator,
		description: 'Git HEAD reference',
	},
	{
		pattern: '/\\.git/index$',
		generatorClass: GitIndexGenerator,
		description: 'Git index file',
	},
	{
		pattern: '/\\.git/refs/heads/.*$',
		generatorClass: GitRefGenerator,
		description: 'Git branch reference',
	},
	{
		pattern: '^/\\.gitignore$',
		generatorClass: GitIgnoreGenerator,
		description: 'Git ignore file',
	},
	{
		pattern: '^/\\.svn/entries$',
		generatorClass: GitConfigGenerator,
		description: 'SVN entries file',
	},
	{
		pattern: '^/\\.hg/hgrc$',
		generatorClass: GitConfigGenerator,
		description: 'Mercurial configuration',
	},

	// 3. Infrastructure as Code & DevOps
	{
		pattern: '\\.(tfstate|tfvars|tfstate\\.backup)$',
		generatorClass: TerraformGenerator,
		description: 'Terraform state and variables',
	},
	{
		pattern: '(main|variables|outputs|provider)\\.tf$',
		generatorClass: TerraformGenerator,
		description: 'Terraform configuration',
	},
	{
		pattern: '^/Dockerfile$',
		generatorClass: DockerfileGenerator,
		description: 'Docker configuration',
	},
	{
		pattern: '^/docker-compose\\.ya?ml$',
		generatorClass: DockerfileGenerator,
		description: 'Docker Compose configuration',
	},
	{
		pattern: '^/\\.dockerignore$',
		generatorClass: DockerIgnoreGenerator,
		description: 'Docker ignore file',
	},
	{
		pattern: '\\.(circleci|github|gitlab-ci|travis|azure-pipelines)\\.ya?ml$',
		generatorClass: CicdConfigGenerator,
		description: 'CI/CD pipeline configuration',
	},
	{
		pattern: '(Jenkinsfile|serverless\\.yml)$',
		generatorClass: CicdConfigGenerator,
		description: 'DevOps configuration',
	},

	// 4. Database & Sensitive Exports
	{
		pattern: '\\.(sql|db|sqlite|mdb)$',
		generatorClass: DatabaseFileGenerator,
		description: 'Database dump file',
	},
	{
		pattern: '(dump|backup|users|customers|db|database)\\.(sql|csv|json|xml)$',
		generatorClass: DataLeakGenerator,
		description: 'Sensitive data export',
	},
	{
		pattern: '\\.(bak|backup|old|orig|tmp|swp)$',
		generatorClass: BackupFileGenerator,
		description: 'Backup and temporary files',
	},
	{
		pattern: '\\.(zip|tar|gz|rar|7z|bz2|xz)$',
		generatorClass: ArchiveFileGenerator,
		description: 'Archive and backup file',
	},

	// 5. Application Configuration
	{
		pattern: '^/\\.htaccess$',
		generatorClass: HtaccessGenerator,
		description: 'Apache configuration file',
	},
	{
		pattern: '^/web\\.config$',
		generatorClass: WebConfigGenerator,
		description: 'IIS configuration file',
	},
	{
		pattern: '(wp-config\\.php|config\\.php|settings\\.php|database\\.php)$',
		generatorClass: EnvironmentFileGenerator,
		description: 'Web application configuration',
	},
	{
		pattern: '\\.(ini|conf|cfg|properties|toml|yaml|yml)$',
		generatorClass: EnvironmentFileGenerator,
		description: 'Generic configuration file',
	},

	// 6. Admin Panels & CMS
	{
		pattern: '(admin|administrator|wp-admin|manage|control|panel|dashboard)/?$',
		generatorClass: AdminPanelGenerator,
		description: 'Admin panel login page',
	},
	{
		pattern: 'phpmyadmin/?$',
		generatorClass: PhpMyAdminGenerator,
		description: 'phpMyAdmin login page',
	},
	{
		pattern: '(wp-login\\.php|login\\.php|auth\\.php|signin\\.php)$',
		generatorClass: WordPressLoginGenerator,
		description: 'Login page',
	},

	// 7. Development & Package Managers
	{
		pattern: '^/package\\.json$',
		generatorClass: PackageJsonGenerator,
		description: 'NPM package configuration',
	},
	{
		pattern: '^/composer\\.json$',
		generatorClass: ComposerJsonGenerator,
		description: 'Composer configuration',
	},
	{
		pattern: '^/yarn\\.lock$',
		generatorClass: YarnLockGenerator,
		description: 'Yarn lock file',
	},
	{
		pattern: '^/composer\\.lock$',
		generatorClass: ComposerLockGenerator,
		description: 'Composer lock file',
	},
	{
		pattern: '(webpack|vite|next|nuxt|vue|astro|remix)\\.config\\..*$',
		generatorClass: PackageJsonGenerator,
		description: 'Framework configuration',
	},
	{
		pattern: '^/\\.(npmrc|yarnrc|pypirc|gemrc|dockercfg)$',
		generatorClass: EnvironmentFileGenerator,
		description: 'Package manager credentials',
	},

	// 8. API & Documentation
	{
		pattern: '(swagger|openapi)\\.json$',
		generatorClass: SwaggerJsonGenerator,
		description: 'API documentation',
	},
	{
		pattern: '(graphql|api-docs|api/v[0-9]/.*)$',
		generatorClass: SwaggerJsonGenerator,
		description: 'API endpoint',
	},

	// 9. System & Logs
	{
		pattern: '\\.(log|debug|trace|err|error_log|access_log)$',
		generatorClass: LogFileGenerator,
		description: 'System log file',
	},
	{
		pattern: '(phpinfo|info|test)\\.php$',
		generatorClass: PhpInfoGenerator,
		description: 'PHP info page',
	},
	{
		pattern: '^/\\.well-known/(security\\.txt|brave-rewards-verification\\.txt)$',
		generatorClass: SecurityTxtGenerator,
		description: 'Security and verification files',
	},
	{
		pattern: '^/robots\\.txt$',
		generatorClass: RobotsTxtGenerator,
		description: 'Robots.txt file',
	},
	{
		pattern: '^/sitemap\\.xml$',
		generatorClass: BackupFileGenerator,
		description: 'Sitemap XML',
	},

	// 10. Modern Tech (AI, Remote Access, etc.)
	{
		pattern: '\\.(ipynb|pt|h5|onnx|model)$',
		generatorClass: AiMlGenerator,
		description: 'AI/ML model and notebook',
	},
	{
		pattern: '\\.(ovpn|rdp|pcf|kdbx)$',
		generatorClass: RemoteAccessGenerator,
		description: 'Remote access and password vault',
	},

	// 11. Catch-all / Scanner Detection (Lowest Priority)
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
