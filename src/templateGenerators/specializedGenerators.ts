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
				'mod_ssl, mod_deflate, mod_security'
			]),
			maxExecutionTime: this.getRandomItem(['30', '60', '300']),
			memoryLimit: this.getRandomItem(['128M', '256M', '512M']),
			uploadMaxFilesize: this.getRandomItem(['2M', '8M', '32M']),
			postMaxSize: this.getRandomItem(['8M', '16M', '64M']),
			sessionSavePath: '/tmp',
			includePath: '.:/usr/share/php',
			userAgent: this.context.userAgent || 'Unknown',
			remoteAddr: this.context.clientIp || '127.0.0.1',
			timestamp: this.context.timestamp?.toISOString() || new Date().toISOString()
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
			timestamp: this.context.timestamp?.toISOString() || new Date().toISOString()
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
			nextVersion: '^13.4.0'
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
			rewriteBase: '/'
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
			adminEmail: this.context.adminEmail || 'admin@example.com'
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
