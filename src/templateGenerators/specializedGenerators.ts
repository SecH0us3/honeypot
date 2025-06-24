// Specialized template generators for specific honeypot scenarios

import { BaseTemplateGenerator, RandomDataContext } from './types';

export class PhpInfoGenerator extends BaseTemplateGenerator {
	protected initializeVariables(): void {
		this.variables = {
			phpVersion: this.generateRandomVersion(),
			serverName: this.context.companyDomain || 'example.com',
			documentRoot: '/var/www/html',
			serverAdmin: this.context.adminEmail || 'admin@example.com',
			serverSoftware: this.getRandomItem(['Apache/2.4.41', 'nginx/1.18.0', 'Apache/2.4.52']),
			serverSignature: this.getRandomItem(['On', 'Off']),
			loadedModules: this.getRandomItem([
				'mod_rewrite, mod_ssl, mod_php',
				'mod_rewrite, mod_headers, mod_expires',
				'mod_ssl, mod_deflate, mod_security',
			]),
			maxExecutionTime: this.getRandomItem(['30', '60', '300']),
			memoryLimit: this.getRandomItem(['128M', '256M', '512M']),
			uploadMaxFilesize: this.getRandomItem(['2M', '8M', '32M']),
			postMaxSize: this.getRandomItem(['8M', '16M', '64M']),
			sessionSavePath: '/tmp',
			includePath: '.:/usr/share/php',
			userAgent: this.context.userAgent || 'Unknown',
			remoteAddr: this.context.clientIp || '127.0.0.1',
			timestamp: this.context.timestamp?.toISOString() || new Date().toISOString(),
		};
	}

	generate(): string {
		return this.replaceVariables(`<!DOCTYPE html>
<html>
<head>
    <title>PHP {{phpVersion}} - phpinfo()</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; }
        .info-table th, .info-table td { padding: 8px 12px; border: 1px solid #ccc; text-align: left; }
        .info-table th { background: #e0e0e0; font-weight: bold; }
        .section-header { background: #4a4a4a; color: white; font-size: 18px; padding: 10px; margin: 20px 0 0 0; }
        .highlight { background: #ffffcc; }
    </style>
</head>
<body>
    <div class="section-header">PHP Version {{phpVersion}}</div>

    <table class="info-table">
        <tr><th>System</th><td>Linux {{serverName}} 5.4.0-74-generic</td></tr>
        <tr><th>Build Date</th><td>{{timestamp}}</td></tr>
        <tr><th>Server API</th><td>Apache 2.0 Handler</td></tr>
        <tr><th>Virtual Directory Support</th><td>disabled</td></tr>
        <tr><th>Configuration File (php.ini) Path</th><td>/etc/php/8.0/apache2</td></tr>
    </table>

    <div class="section-header">Apache Environment</div>
    <table class="info-table">
        <tr><th>HTTP_USER_AGENT</th><td>{{userAgent}}</td></tr>
        <tr><th>REMOTE_ADDR</th><td>{{remoteAddr}}</td></tr>
        <tr><th>SERVER_NAME</th><td>{{serverName}}</td></tr>
        <tr><th>SERVER_ADMIN</th><td>{{serverAdmin}}</td></tr>
        <tr><th>DOCUMENT_ROOT</th><td>{{documentRoot}}</td></tr>
        <tr><th>SERVER_SOFTWARE</th><td>{{serverSoftware}}</td></tr>
    </table>

    <div class="section-header">PHP Core</div>
    <table class="info-table">
        <tr><th>max_execution_time</th><td>{{maxExecutionTime}}</td></tr>
        <tr><th>memory_limit</th><td>{{memoryLimit}}</td></tr>
        <tr><th>upload_max_filesize</th><td>{{uploadMaxFilesize}}</td></tr>
        <tr><th>post_max_size</th><td>{{postMaxSize}}</td></tr>
        <tr><th>session.save_path</th><td>{{sessionSavePath}}</td></tr>
        <tr><th>include_path</th><td>{{includePath}}</td></tr>
    </table>

    <div class="section-header">Loaded Modules</div>
    <table class="info-table">
        <tr><td>{{loadedModules}}</td></tr>
    </table>

    <div class="section-header">MySQL</div>
    <table class="info-table">
        <tr><th>Client API version</th><td>mysqlnd 8.0.30</td></tr>
        <tr><th>Active Persistent Links</th><td>0</td></tr>
        <tr><th>Active Links</th><td>0</td></tr>
    </table>
</body>
</html>`);
	}

	getContentType(): string {
		return 'text/html; charset=utf-8';
	}

	getDescription(): string {
		return 'PHP Information Page';
	}
}

export class ComposerJsonGenerator extends BaseTemplateGenerator {
	protected initializeVariables(): void {
		this.variables = {
			projectName: this.context.companyDomain?.replace(/\./g, '/') || 'company/project',
			description: 'Web application project',
			phpVersion: '^8.0',
			laravelVersion: '^9.0',
			authorName: this.context.adminEmail || 'developer@example.com',
			timestamp: this.context.timestamp?.toISOString() || new Date().toISOString(),
		};
	}

	generate(): string {
		return this.replaceVariables(`{
    "name": "{{projectName}}",
    "description": "{{description}}",
    "type": "project",
    "require": {
        "php": "{{phpVersion}}",
        "laravel/framework": "{{laravelVersion}}",
        "doctrine/dbal": "^3.3",
        "guzzlehttp/guzzle": "^7.2",
        "laravel/sanctum": "^2.14.1",
        "laravel/tinker": "^2.7"
    },
    "require-dev": {
        "fakerphp/faker": "^1.9.1",
        "laravel/sail": "^1.0.1",
        "mockery/mockery": "^1.4.4",
        "nunomaduro/collision": "^6.1",
        "phpunit/phpunit": "^9.5.10",
        "spatie/laravel-ignition": "^1.0"
    },
    "autoload": {
        "psr-4": {
            "App\\\\": "app/",
            "Database\\\\Factories\\\\": "database/factories/",
            "Database\\\\Seeders\\\\": "database/seeders/"
        }
    },
    "autoload-dev": {
        "psr-4": {
            "Tests\\\\": "tests/"
        }
    },
    "scripts": {
        "post-autoload-dump": [
            "Illuminate\\\\Foundation\\\\ComposerScripts::postAutoloadDump",
            "@php artisan package:discover --ansi"
        ],
        "post-update-cmd": [
            "@php artisan vendor:publish --tag=laravel-assets --ansi --force"
        ],
        "post-root-package-install": [
            "@php -r \\"file_exists('.env') || copy('.env.example', '.env');\""
        ],
        "post-create-project-cmd": [
            "@php artisan key:generate --ansi"
        ]
    },
    "extra": {
        "laravel": {
            "dont-discover": []
        }
    },
    "config": {
        "optimize-autoloader": true,
        "preferred-install": "dist",
        "sort-packages": true
    },
    "minimum-stability": "dev",
    "prefer-stable": true,
    "authors": [
        {
            "name": "Developer",
            "email": "{{authorName}}"
        }
    ]
}`);
	}

	getContentType(): string {
		return 'application/json';
	}

	getDescription(): string {
		return 'Composer configuration file';
	}
}

export class PackageJsonGenerator extends BaseTemplateGenerator {
	protected initializeVariables(): void {
		this.variables = {
			projectName: this.context.companyDomain?.split('.')[0] || 'webapp',
			version: this.generateRandomVersion(),
			description: 'Modern web application',
			authorEmail: this.context.adminEmail || 'developer@example.com',
			nodeVersion: '>=16.0.0',
			reactVersion: '^18.2.0',
			nextVersion: '^13.4.0',
		};
	}

	generate(): string {
		return this.replaceVariables(`{
  "name": "{{projectName}}",
  "version": "{{version}}",
  "description": "{{description}}",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "{{reactVersion}}",
    "react-dom": "{{reactVersion}}",
    "next": "{{nextVersion}}",
    "@next/font": "{{nextVersion}}",
    "axios": "^1.4.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24",
    "framer-motion": "^10.12.16",
    "@headlessui/react": "^1.7.15",
    "@heroicons/react": "^2.0.18"
  },
  "devDependencies": {
    "@types/node": "^20.3.1",
    "@types/react": "^18.2.14",
    "@types/react-dom": "^18.2.6",
    "typescript": "^5.1.3",
    "eslint": "^8.42.0",
    "eslint-config-next": "{{nextVersion}}",
    "@typescript-eslint/eslint-plugin": "^5.60.0",
    "@typescript-eslint/parser": "^5.60.0",
    "jest": "^29.5.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5"
  },
  "engines": {
    "node": "{{nodeVersion}}"
  },
  "author": "{{authorEmail}}",
  "license": "MIT",
  "keywords": [
    "react",
    "nextjs",
    "typescript",
    "tailwindcss"
  ]
}`);
	}

	getContentType(): string {
		return 'application/json';
	}

	getDescription(): string {
		return 'NPM package configuration';
	}
}

export class HtaccessGenerator extends BaseTemplateGenerator {
	protected initializeVariables(): void {
		this.variables = {
			serverName: this.context.companyDomain || 'example.com',
			adminEmail: this.context.adminEmail || 'admin@example.com',
			documentRoot: '/var/www/html',
			rewriteBase: '/',
		};
	}

	generate(): string {
		return this.replaceVariables(`# Apache Configuration File
# Generated for {{serverName}}
# Contact: {{adminEmail}}

# Enable rewrite engine
RewriteEngine On
RewriteBase {{rewriteBase}}

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"

# Hide server signature
ServerTokens Prod
ServerSignature Off

# Disable directory browsing
Options -Indexes

# Protect sensitive files
<Files ~ "\\.(env|log|ini|conf|bak|backup|old|orig|tmp)$">
    Order allow,deny
    Deny from all
</Files>

# Protect .git directory
<DirectoryMatch "^\\.git">
    Order allow,deny
    Deny from all
</DirectoryMatch>

# PHP security settings
php_flag display_errors Off
php_flag log_errors On
php_value error_log {{documentRoot}}/error.log

# Cache control
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# URL rewriting rules
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php?url=$1 [QSA,L]

# Block suspicious requests
RewriteCond %{QUERY_STRING} (<|%3C).*script.*(>|%3E) [NC,OR]
RewriteCond %{QUERY_STRING} GLOBALS(=|\\[|\\%[0-9A-Z]{0,2}) [OR]
RewriteCond %{QUERY_STRING} _REQUEST(=|\\[|\\%[0-9A-Z]{0,2}) [OR]
RewriteCond %{QUERY_STRING} ^.*\\.(bash|git|hg|log|svn|swp|cvs) [NC,OR]
RewriteCond %{QUERY_STRING} etc/passwd [NC,OR]
RewriteCond %{QUERY_STRING} boot\\.ini [NC,OR]
RewriteCond %{QUERY_STRING} ftp\\: [NC,OR]
RewriteCond %{QUERY_STRING} http\\: [NC,OR]
RewriteCond %{QUERY_STRING} https\\: [NC,OR]
RewriteCond %{QUERY_STRING} \\.\\./ [NC,OR]
RewriteCond %{QUERY_STRING} \\.\\.\\.\\./ [NC,OR]
RewriteCond %{QUERY_STRING} 127\\.0\\.0\\.1 [NC,OR]
RewriteCond %{QUERY_STRING} localhost [NC,OR]
RewriteCond %{QUERY_STRING} (\\<|\\%3C).*script.*(\\>|\\%3E) [NC]
RewriteRule .* - [F]

# End of configuration`);
	}

	getContentType(): string {
		return 'text/plain';
	}

	getDescription(): string {
		return 'Apache .htaccess configuration';
	}
}

export class WebConfigGenerator extends BaseTemplateGenerator {
	protected initializeVariables(): void {
		this.variables = {
			serverName: this.context.companyDomain || 'example.com',
			adminEmail: this.context.adminEmail || 'admin@example.com',
		};
	}

	generate(): string {
		return this.replaceVariables(`<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.web>
        <compilation debug="false" targetFramework="4.8" />
        <httpRuntime targetFramework="4.8" maxRequestLength="4096" executionTimeout="110" />
        <customErrors mode="RemoteOnly" defaultRedirect="~/Error/Default" />
        <authentication mode="Forms">
            <forms loginUrl="~/Account/Login" timeout="2880" />
        </authentication>
        <authorization>
            <deny users="?" />
        </authorization>
        <machineKey
            validationKey="{{serverName}}"
            decryptionKey="{{adminEmail}}"
            validation="HMACSHA256"
            decryption="AES" />
        <httpCookies httpOnlyCookies="true" requireSSL="true" />
        <sessionState mode="InProc" timeout="20" />
    </system.web>

    <system.webServer>
        <security>
            <requestFiltering>
                <denyUrlSequences>
                    <add sequence=".." />
                    <add sequence=":" />
                    <add sequence="\\" />
                    <add sequence="&" />
                </denyUrlSequences>
                <fileExtensions>
                    <add fileExtension=".config" allowed="false" />
                    <add fileExtension=".bak" allowed="false" />
                    <add fileExtension=".log" allowed="false" />
                    <add fileExtension=".old" allowed="false" />
                </fileExtensions>
            </requestFiltering>
        </security>

        <httpProtocol>
            <customHeaders>
                <add name="X-Frame-Options" value="SAMEORIGIN" />
                <add name="X-Content-Type-Options" value="nosniff" />
                <add name="X-XSS-Protection" value="1; mode=block" />
                <add name="Strict-Transport-Security" value="max-age=31536000; includeSubDomains" />
            </customHeaders>
        </httpProtocol>

        <rewrite>
            <rules>
                <rule name="Force HTTPS" stopProcessing="true">
                    <match url="(.*)" />
                    <conditions>
                        <add input="{HTTPS}" pattern="off" />
                    </conditions>
                    <action type="Redirect" url="https://{HTTP_HOST}/{R:1}"
                            redirectType="Permanent" />
                </rule>

                <rule name="Hide .aspx extension">
                    <match url="^([^/]+)/?$" />
                    <conditions>
                        <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
                        <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
                    </conditions>
                    <action type="Rewrite" url="{R:1}.aspx" />
                </rule>
            </rules>
        </rewrite>

        <defaultDocument>
            <files>
                <clear />
                <add value="Default.aspx" />
                <add value="default.htm" />
                <add value="index.html" />
            </files>
        </defaultDocument>
    </system.webServer>

    <appSettings>
        <add key="webpages:Version" value="3.0.0.0" />
        <add key="webpages:Enabled" value="false" />
        <add key="vs:EnableBrowserLink" value="false" />
        <add key="ServerName" value="{{serverName}}" />
        <add key="AdminContact" value="{{adminEmail}}" />
    </appSettings>

    <connectionStrings>
        <add name="DefaultConnection"
             connectionString="Server=localhost;Database=WebApp;Trusted_Connection=true;"
             providerName="System.Data.SqlClient" />
    </connectionStrings>
</configuration>`);
	}

	getContentType(): string {
		return 'application/xml';
	}

	getDescription(): string {
		return 'IIS web.config file';
	}
}

export class SwaggerJsonGenerator extends BaseTemplateGenerator {
	protected initializeVariables(): void {
		this.variables = {
			title: this.context.companyName || this.getRandomItem(['CoreAPI', 'DataHub', 'AuthService', 'AdminAPI', 'UserPortal']),
			version: this.generateRandomVersion(),
			serverUrl: `https://${this.context.companyDomain || this.getRandomItem(['api.techcorp.com', 'services.dataflow.io', 'backend.cloudapp.net'])}`,
			contactEmail: this.context.adminEmail || this.getRandomItem(['api@company.com', 'dev@service.io', 'support@platform.net']),
			description: this.getRandomItem([
				'Enterprise REST API for business operations',
				'Microservices API gateway documentation',
				'Internal system integration endpoints',
				'Customer data management API',
				'Administrative control interface',
			]),
		};
	}

	private generateRandomPaths(): any {
		const pathTemplates = [
			{
				path: '/auth/login',
				method: 'post',
				tag: 'Authentication',
				summary: 'User authentication',
				hasAuth: false,
			},
			{
				path: '/auth/refresh',
				method: 'post',
				tag: 'Authentication',
				summary: 'Refresh access token',
				hasAuth: true,
			},
			{
				path: '/users',
				method: 'get',
				tag: 'Users',
				summary: 'List all users',
				hasAuth: true,
			},
			{
				path: '/users/{id}',
				method: 'get',
				tag: 'Users',
				summary: 'Get user by ID',
				hasAuth: true,
			},
			{
				path: '/admin/config',
				method: 'get',
				tag: 'Admin',
				summary: 'System configuration',
				hasAuth: true,
			},
			{
				path: '/admin/logs',
				method: 'get',
				tag: 'Admin',
				summary: 'Application logs',
				hasAuth: true,
			},
			{
				path: '/data/export',
				method: 'post',
				tag: 'Data',
				summary: 'Export data dump',
				hasAuth: true,
			},
			{
				path: '/backup/create',
				method: 'post',
				tag: 'Backup',
				summary: 'Create system backup',
				hasAuth: true,
			},
			{
				path: '/health',
				method: 'get',
				tag: 'System',
				summary: 'Health check',
				hasAuth: false,
			},
			{
				path: '/metrics',
				method: 'get',
				tag: 'System',
				summary: 'System metrics',
				hasAuth: true,
			},
		];

		const selectedPaths = pathTemplates.slice(0, Math.floor(Math.random() * 6) + 4);
		const paths: any = {};

		selectedPaths.forEach((pathInfo) => {
			const pathObj: any = {};
			pathObj[pathInfo.method] = {
				tags: [pathInfo.tag],
				summary: pathInfo.summary,
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										success: { type: 'boolean' },
										data: { type: 'object' },
										timestamp: { type: 'string' },
									},
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
					},
					'403': {
						description: 'Forbidden',
					},
					'500': {
						description: 'Internal server error',
					},
				},
			};

			if (pathInfo.hasAuth) {
				pathObj[pathInfo.method].security = [{ bearerAuth: [] }];
			}

			if (pathInfo.method === 'post') {
				pathObj[pathInfo.method].requestBody = {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: this.generateRandomProperties(),
							},
						},
					},
				};
			}

			paths[pathInfo.path] = pathObj;
		});

		return paths;
	}

	private generateRandomProperties(): any {
		const propertyTypes = ['string', 'integer', 'boolean', 'array'];
		const propertyNames = ['username', 'password', 'email', 'id', 'name', 'status', 'type', 'data', 'config', 'token'];

		const properties: any = {};
		const numProps = Math.floor(Math.random() * 4) + 2;

		for (let i = 0; i < numProps; i++) {
			const propName = this.getRandomItem(propertyNames);
			const propType = this.getRandomItem(propertyTypes);
			properties[propName] = { type: propType };

			if (propType === 'array') {
				properties[propName].items = { type: 'string' };
			}
		}

		return properties;
	}

	private generateRandomSchemas(): any {
		const schemas: any = {
			User: {
				type: 'object',
				properties: {
					id: { type: 'integer' },
					username: { type: 'string' },
					email: { type: 'string' },
					role: { type: 'string', enum: ['admin', 'user', 'moderator'] },
					created_at: { type: 'string', format: 'date-time' },
					last_login: { type: 'string', format: 'date-time' },
				},
			},
			Config: {
				type: 'object',
				properties: {
					database_url: { type: 'string' },
					redis_host: { type: 'string' },
					api_key: { type: 'string' },
					debug_mode: { type: 'boolean' },
					max_connections: { type: 'integer' },
				},
			},
		};

		// Add random additional schemas
		const additionalSchemas = ['Product', 'Order', 'Customer', 'Report', 'Backup'];
		const randomSchema = this.getRandomItem(additionalSchemas);

		schemas[randomSchema] = {
			type: 'object',
			properties: this.generateRandomProperties(),
		};

		return schemas;
	}

	generate(): string {
		const apiSpec = {
			openapi: '3.0.3',
			info: {
				title: `${this.variables.title} API`,
				description: this.variables.description,
				version: this.variables.version,
				contact: {
					email: this.variables.contactEmail,
				},
				license: {
					name: this.getRandomItem(['MIT', 'Apache 2.0', 'GPL v3', 'Proprietary']),
					url: 'https://opensource.org/licenses/MIT',
				},
			},
			servers: [
				{
					url: `${this.variables.serverUrl}/api/v1`,
					description: 'Production server',
				},
				{
					url: `${this.variables.serverUrl}/api/v2`,
					description: 'Version 2 API',
				},
				{
					url: `${this.variables.serverUrl}/staging/api`,
					description: 'Staging environment',
				},
			],
			paths: this.generateRandomPaths(),
			components: {
				schemas: this.generateRandomSchemas(),
				securitySchemes: {
					bearerAuth: {
						type: 'http',
						scheme: 'bearer',
						bearerFormat: 'JWT',
					},
					apiKey: {
						type: 'apiKey',
						in: 'header',
						name: 'X-API-Key',
					},
					oauth2: {
						type: 'oauth2',
						flows: {
							authorizationCode: {
								authorizationUrl: `${this.variables.serverUrl}/oauth/authorize`,
								tokenUrl: `${this.variables.serverUrl}/oauth/token`,
								scopes: {
									read: 'Read access',
									write: 'Write access',
									admin: 'Administrative access',
								},
							},
						},
					},
				},
			},
			tags: [
				{ name: 'Authentication', description: 'User authentication endpoints' },
				{ name: 'Users', description: 'User management' },
				{ name: 'Admin', description: 'Administrative functions' },
				{ name: 'Data', description: 'Data operations' },
				{ name: 'System', description: 'System utilities' },
			],
		};

		return JSON.stringify(apiSpec, null, 2);
	}

	getContentType(): string {
		return 'application/json';
	}

	getDescription(): string {
		return 'API documentation (OpenAPI/Swagger)';
	}
}

export class DockerfileGenerator extends BaseTemplateGenerator {
	protected initializeVariables(): void {
		this.variables = {
			baseImage: this.getRandomItem(['node:18-alpine', 'python:3.11-slim', 'nginx:alpine', 'php:8.2-fpm']),
			workDir: '/app',
			port: this.getRandomItem(['3000', '8000', '8080', '80']),
			user: this.getRandomItem(['node', 'www-data', 'app']),
			packageManager: this.getRandomItem(['npm', 'yarn', 'pnpm']),
		};
	}

	generate(): string {
		return this.replaceVariables(`# Production Dockerfile
FROM {{baseImage}}

# Set working directory
WORKDIR {{workDir}}

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN {{packageManager}} install --production

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs {{workDir}}
USER nextjs

# Expose port
EXPOSE {{port}}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:{{port}}/health || exit 1

# Environment variables
ENV NODE_ENV=production
ENV PORT={{port}}

# Start application
CMD ["{{packageManager}}", "start"]

# Docker image metadata
LABEL maintainer="DevOps Team"
LABEL version="1.0"
LABEL description="Production web application"`);
	}

	getContentType(): string {
		return 'text/plain';
	}

	getDescription(): string {
		return 'Docker configuration file';
	}
}

export class KubernetesConfigGenerator extends BaseTemplateGenerator {
	protected initializeVariables(): void {
		this.variables = {
			appName: this.context.companyName?.toLowerCase() || 'webapp',
			namespace: 'production',
			replicas: this.getRandomItem(['2', '3', '5']),
			image: `${this.context.companyDomain || 'registry.example.com'}/webapp:latest`,
			port: this.getRandomItem(['3000', '8000', '8080']),
			cpu: this.getRandomItem(['100m', '200m', '500m']),
			memory: this.getRandomItem(['128Mi', '256Mi', '512Mi']),
		};
	}

	generate(): string {
		return this.replaceVariables(`apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{appName}}-deployment
  namespace: {{namespace}}
  labels:
    app: {{appName}}
spec:
  replicas: {{replicas}}
  selector:
    matchLabels:
      app: {{appName}}
  template:
    metadata:
      labels:
        app: {{appName}}
    spec:
      containers:
      - name: {{appName}}
        image: {{image}}
        ports:
        - containerPort: {{port}}
        resources:
          requests:
            memory: "{{memory}}"
            cpu: "{{cpu}}"
          limits:
            memory: "{{memory}}"
            cpu: "{{cpu}}"
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "{{port}}"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: {{appName}}-secrets
              key: database-url
        livenessProbe:
          httpGet:
            path: /health
            port: {{port}}
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: {{port}}
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: {{appName}}-service
  namespace: {{namespace}}
spec:
  selector:
    app: {{appName}}
  ports:
    - protocol: TCP
      port: 80
      targetPort: {{port}}
  type: LoadBalancer
---
apiVersion: v1
kind: Secret
metadata:
  name: {{appName}}-secrets
  namespace: {{namespace}}
type: Opaque
data:
  database-url: cG9zdGdyZXNxbDovL3VzZXI6cGFzc3dvcmRAaG9zdDpwb3J0L2RhdGFiYXNl`);
	}

	getContentType(): string {
		return 'application/x-yaml';
	}

	getDescription(): string {
		return 'Kubernetes deployment configuration';
	}
}

export class AwsConfigGenerator extends BaseTemplateGenerator {
	protected initializeVariables(): void {
		this.variables = {
			region: this.getRandomItem(['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1']),
			accessKey: this.generateRandomKey(20),
			secretKey: this.generateRandomKey(40),
			bucketName: `${this.context.companyDomain?.replace(/\./g, '-') || 'company'}-assets`,
			functionName: `${this.context.companyName?.toLowerCase() || 'app'}-lambda`,
			runtime: this.getRandomItem(['nodejs18.x', 'python3.11', 'java17']),
		};
	}

	generate(): string {
		return this.replaceVariables(`# AWS Configuration File
[default]
region = {{region}}
aws_access_key_id = AKIA{{accessKey}}
aws_secret_access_key = {{secretKey}}
output = json

[profile production]
region = {{region}}
aws_access_key_id = AKIA{{accessKey}}
aws_secret_access_key = {{secretKey}}
role_arn = arn:aws:iam::123456789012:role/ProductionRole
source_profile = default

# Serverless Framework Configuration
service: {{functionName}}

provider:
  name: aws
  runtime: {{runtime}}
  region: {{region}}
  stage: prod
  environment:
    BUCKET_NAME: {{bucketName}}
    REGION: {{region}}

functions:
  api:
    handler: handler.main
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true

resources:
  Resources:
    S3Bucket:
      Type: AWS::S3::Bucket
      Properties:
        BucketName: {{bucketName}}
        PublicAccessBlockConfiguration:
          BlockPublicAcls: true
          BlockPublicPolicy: true
          IgnorePublicAcls: true
          RestrictPublicBuckets: true`);
	}

	getContentType(): string {
		return 'text/plain';
	}

	getDescription(): string {
		return 'AWS configuration file';
	}
}

export class RobotsTxtGenerator extends BaseTemplateGenerator {
	protected initializeVariables(): void {
		this.variables = {
			domain: this.context.companyDomain || 'example.com',
			adminPath: this.getRandomItem(['/admin', '/administrator', '/wp-admin', '/panel']),
			backupPath: this.getRandomItem(['/backup', '/backups', '/old', '/archive']),
			apiPath: this.getRandomItem(['/api', '/api/v1', '/graphql']),
		};
	}

	generate(): string {
		return this.replaceVariables(`User-agent: *
Disallow: {{adminPath}}/
Disallow: {{backupPath}}/
Disallow: {{apiPath}}/
Disallow: /private/
Disallow: /temp/
Disallow: /tmp/
Disallow: /.git/
Disallow: /.env
Disallow: /config/
Disallow: /database/
Disallow: /logs/

# Allow specific bots
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# Sitemap location
Sitemap: https://{{domain}}/sitemap.xml

# Crawl delay
Crawl-delay: 10

# Blocked paths (common vulnerabilities)
Disallow: /phpmyadmin/
Disallow: /wp-config.php
Disallow: /.htaccess
Disallow: /composer.json
Disallow: /package.json`);
	}

	getContentType(): string {
		return 'text/plain';
	}

	getDescription(): string {
		return 'Robots.txt file';
	}
}

export class SecurityTxtGenerator extends BaseTemplateGenerator {
	protected initializeVariables(): void {
		this.variables = {
			domain: this.context.companyDomain || 'example.com',
			securityEmail: this.context.adminEmail || 'security@example.com',
			expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
			companyName: this.context.companyName || 'Example Corp',
		};
	}

	generate(): string {
		return this.replaceVariables(`Contact: mailto:{{securityEmail}}
Contact: https://{{domain}}/security
Expires: {{expires}}
Acknowledgments: https://{{domain}}/security/acknowledgments
Preferred-Languages: en
Canonical: https://{{domain}}/.well-known/security.txt
Policy: https://{{domain}}/security/policy
Hiring: https://{{domain}}/careers

# Security Policy for {{companyName}}
#
# We take security seriously. If you discover any security-related
# issues, please report them responsibly.
#
# Scope: *.{{domain}}
# Out of scope: Third-party services, social engineering
#
# Reward: We offer recognition and rewards for valid reports`);
	}

	getContentType(): string {
		return 'text/plain';
	}

	getDescription(): string {
		return 'Security.txt file';
	}
}

export class YarnLockGenerator extends BaseTemplateGenerator {
	protected initializeVariables(): void {
		this.variables = {
			yarnVersion: this.getRandomItem(['1.22.19', '3.6.4', '4.0.2']),
			packageCount: Math.floor(Math.random() * 500) + 50,
			timestamp: this.context.timestamp?.toISOString() || new Date().toISOString(),
		};
	}

	generate(): string {
		const packages = [
			'react',
			'vue',
			'angular',
			'express',
			'lodash',
			'axios',
			'moment',
			'webpack',
			'babel-core',
			'typescript',
			'eslint',
			'prettier',
			'jest',
			'mocha',
			'chai',
			'bootstrap',
			'jquery',
			'redux',
			'rxjs',
			'socket.io',
			'cors',
			'bcrypt',
		];

		let lockContent = `# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
# yarn lockfile v1

`;

		for (let i = 0; i < 15; i++) {
			const pkg = this.getRandomItem(packages);
			const version = this.generateRandomVersion();
			const resolved = `https://registry.yarnpkg.com/${pkg}/-/${pkg}-${version}.tgz`;
			const integrity = `sha512-${this.generateRandomHash(64)}`;

			lockContent += `"${pkg}@^${version}":
  version "${version}"
  resolved "${resolved}"
  integrity ${integrity}
  dependencies:
    ${this.getRandomItem(packages)} "^${this.generateRandomVersion()}"

`;
		}

		return lockContent;
	}

	getContentType(): string {
		return 'text/plain';
	}

	getDescription(): string {
		return 'Yarn lock file';
	}
}

export class ComposerLockGenerator extends BaseTemplateGenerator {
	protected initializeVariables(): void {
		this.variables = {
			phpVersion: this.getRandomItem(['7.4.0', '8.0.0', '8.1.0', '8.2.0']),
			timestamp: this.context.timestamp?.toISOString() || new Date().toISOString(),
		};
	}

	generate(): string {
		const packages = [
			'symfony/console',
			'guzzlehttp/guzzle',
			'monolog/monolog',
			'doctrine/orm',
			'twig/twig',
			'phpunit/phpunit',
			'laravel/framework',
			'psr/log',
			'illuminate/support',
			'carbon/carbon',
			'swiftmailer/swiftmailer',
		];

		const lockData = {
			_readme: [
				'This file locks the dependencies of your project to a known state',
				'Read more about it at https://getcomposer.org/doc/01-basic-usage.md#installing-dependencies',
			],
			'content-hash': this.generateRandomHash(32),
			packages: packages.slice(0, 8).map((pkg) => ({
				name: pkg,
				version: `v${this.generateRandomVersion()}`,
				source: {
					type: 'git',
					url: `https://github.com/${pkg.replace('/', '-')}.git`,
					reference: this.generateRandomHash(40),
				},
				dist: {
					type: 'zip',
					url: `https://api.github.com/repos/${pkg.replace('/', '-')}/zipball/${this.generateRandomHash(40)}`,
					reference: this.generateRandomHash(40),
					shasum: this.generateRandomHash(40),
				},
				require: {
					php: `>=${this.variables.phpVersion}`,
				},
				type: 'library',
				autoload: {
					'psr-4': {
						[pkg.split('/')[1].charAt(0).toUpperCase() + pkg.split('/')[1].slice(1) + '\\']: 'src/',
					},
				},
				time: this.variables.timestamp,
			})),
			'packages-dev': [],
			aliases: [],
			'minimum-stability': 'stable',
			'stability-flags': {},
			'prefer-stable': false,
			'prefer-lowest': false,
			platform: {
				php: this.variables.phpVersion as string,
			},
			'platform-dev': {},
			'plugin-api-version': '2.3.0',
		};

		return JSON.stringify(lockData, null, 2);
	}

	getContentType(): string {
		return 'application/json';
	}

	getDescription(): string {
		return 'Composer lock file';
	}
}

export class DockerIgnoreGenerator extends BaseTemplateGenerator {
	protected initializeVariables(): void {
		this.variables = {};
	}

	generate(): string {
		const ignorePatterns = [
			'# Logs',
			'logs',
			'*.log',
			'npm-debug.log*',
			'yarn-debug.log*',
			'yarn-error.log*',
			'',
			'# Runtime data',
			'pids',
			'*.pid',
			'*.seed',
			'*.pid.lock',
			'',
			'# Directory for instrumented libs generated by jscoverage/JSCover',
			'lib-cov',
			'',
			'# Coverage directory used by tools like istanbul',
			'coverage',
			'',
			'# nyc test coverage',
			'.nyc_output',
			'',
			'# Grunt intermediate storage',
			'.grunt',
			'',
			'# node_modules',
			'node_modules/',
			'',
			'# Optional npm cache directory',
			'.npm',
			'',
			'# Optional REPL history',
			'.node_repl_history',
			'',
			"# Output of 'npm pack'",
			'*.tgz',
			'',
			'# Yarn Integrity file',
			'.yarn-integrity',
			'',
			'# dotenv environment variables file',
			'.env',
			'.env.local',
			'.env.development.local',
			'.env.test.local',
			'.env.production.local',
			'',
			'# IDE files',
			'.vscode/',
			'.idea/',
			'*.swp',
			'*.swo',
			'*~',
			'',
			'# OS generated files',
			'.DS_Store',
			'.DS_Store?',
			'._*',
			'.Spotlight-V100',
			'.Trashes',
			'ehthumbs.db',
			'Thumbs.db',
			'',
			'# Docker',
			'Dockerfile*',
			'docker-compose*',
			'.dockerignore',
		];

		return ignorePatterns.join('\n');
	}

	getContentType(): string {
		return 'text/plain';
	}

	getDescription(): string {
		return 'Docker ignore file';
	}
}

export class GitIgnoreGenerator extends BaseTemplateGenerator {
	protected initializeVariables(): void {
		this.variables = {};
	}

	generate(): string {
		const frameworks = ['node', 'python', 'java', 'php', 'go'];
		const selectedFramework = this.getRandomItem(frameworks);

		let ignoreContent = `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

`;

		// Add framework-specific ignores
		switch (selectedFramework) {
			case 'python':
				ignoreContent += `# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST

# Virtual environments
venv/
env/
ENV/
env.bak/
venv.bak/

`;
				break;
			case 'java':
				ignoreContent += `# Java
*.class
*.jar
*.war
*.ear
*.zip
*.tar.gz
*.rar

# Maven
target/
pom.xml.tag
pom.xml.releaseBackup
pom.xml.versionsBackup
pom.xml.next

# Gradle
.gradle
build/

`;
				break;
			case 'php':
				ignoreContent += `# PHP
vendor/
composer.phar
composer.lock
.env.local

# Laravel
/bootstrap/compiled.php
/bootstrap/cache
/public/storage
/storage/*.key
/vendor
.env.backup

`;
				break;
		}

		return ignoreContent;
	}

	getContentType(): string {
		return 'text/plain';
	}

	getDescription(): string {
		return 'Git ignore file';
	}
}

export class LogFileGenerator extends BaseTemplateGenerator {
	private timestamp: Date = new Date();

	protected initializeVariables(): void {
		this.timestamp = this.context.timestamp || new Date();
		this.variables = {
			serverName: this.context.companyDomain || 'example.com',
			clientIp: this.context.clientIp || '192.168.1.100',
			userAgent: this.context.userAgent || 'Mozilla/5.0 (compatible; scanner)',
		};
	}

	generate(): string {
		const logTypes = ['access', 'error', 'debug'];
		const logType = this.getRandomItem(logTypes);

		let logContent = '';
		const now = this.timestamp;

		// Generate 20-50 log entries
		const numEntries = Math.floor(Math.random() * 30) + 20;

		for (let i = 0; i < numEntries; i++) {
			const entryTime = new Date(now.getTime() - i * 60000); // 1 minute intervals
			const timeString = entryTime.toISOString().replace('T', ' ').substring(0, 19);

			switch (logType) {
				case 'access':
					const methods = ['GET', 'POST', 'PUT', 'DELETE'];
					const paths = ['/admin', '/login', '/api/users', '/wp-admin', '/.env', '/config.php'];
					const statuses = ['200', '404', '401', '403', '500'];
					const sizes = [Math.floor(Math.random() * 10000) + 100];

					logContent += `${this.variables.clientIp} - - [${timeString}] "${this.getRandomItem(methods)} ${this.getRandomItem(paths)} HTTP/1.1" ${this.getRandomItem(statuses)} ${sizes[0]} "-" "${this.variables.userAgent}"\n`;
					break;

				case 'error':
					const errorLevels = ['ERROR', 'WARNING', 'CRITICAL', 'NOTICE'];
					const errorMessages = [
						'File not found',
						'Access denied',
						'Database connection failed',
						'Memory limit exceeded',
						'Invalid request',
						'Authentication failed',
					];

					logContent += `[${timeString}] [${this.getRandomItem(errorLevels)}] ${this.getRandomItem(errorMessages)} from ${this.variables.clientIp}\n`;
					break;

				case 'debug':
					const debugMessages = [
						'User authentication attempt',
						'Database query executed',
						'Cache miss for key',
						'API request processed',
						'Session created',
						'File uploaded',
					];

					logContent += `[${timeString}] DEBUG: ${this.getRandomItem(debugMessages)} - IP: ${this.variables.clientIp}\n`;
					break;
			}
		}

		return logContent;
	}

	getContentType(): string {
		return 'text/plain';
	}

	getDescription(): string {
		return 'Log file';
	}
}

export class ArchiveFileGenerator extends BaseTemplateGenerator {
	protected initializeVariables(): void {
		this.variables = {};
	}

	generate(): string {
		// Generate partial archive with real headers but corrupted content
		const archiveTypes = ['zip', 'tar', 'gz', 'rar', '7z'];
		const archiveType = this.getRandomItem(archiveTypes);

		let header = '';
		let randomBytes = '';

		// Generate random bytes (1KB to 10KB)
		const byteCount = Math.floor(Math.random() * 9216) + 1024; // 1KB to 10KB
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

		for (let i = 0; i < byteCount; i++) {
			randomBytes += chars[Math.floor(Math.random() * chars.length)];
		}

		switch (archiveType) {
			case 'zip':
				// ZIP file signature: PK\x03\x04
				header = 'PK\x03\x04\x14\x00\x00\x00\x08\x00';
				break;
			case 'tar':
				// TAR file (no specific signature, but has structure)
				header = 'backup.txt\x00\x00\x00\x00\x00\x00\x00\x00\x00\x000000644\x000001750\x000001750\x00';
				break;
			case 'gz':
				// GZIP signature: \x1f\x8b
				header = '\x1f\x8b\x08\x00\x00\x00\x00\x00\x00\x03';
				break;
			case 'rar':
				// RAR signature: Rar!
				header = 'Rar!\x1a\x07\x00\xcf\x90\x73\x00\x00\x0d\x00\x00\x00\x00\x00\x00\x00';
				break;
			case '7z':
				// 7Z signature: 7z\xBC\xAF\x27\x1C
				header = '7z\xBC\xAF\x27\x1C\x00\x03\x0b\x3f\xd6\xf5\xa8\x6d';
				break;
		}

		return header + randomBytes;
	}

	getContentType(): string {
		return 'application/octet-stream';
	}

	getDescription(): string {
		return 'Corrupted archive file';
	}
}
