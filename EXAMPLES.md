# Honeypot Examples and Usage Guide

This document provides practical examples of how to configure and use the honeypot for different scenarios.

## Basic Setup Examples

### 1. Company-Branded Honeypot

Set your company name for realistic branding:

```bash
# Set company name
wrangler secret put COMPANY_NAME
# Enter: "TechCorp Inc" when prompted

# Deploy
npm run deploy
```

This makes all fake content reference "TechCorp Inc" instead of random company names.

### 2. Development Environment

For local testing and development:

```bash
# Start development server
npm run dev

# Test specific endpoints
curl http://localhost:8787/.git/config
curl http://localhost:8787/admin/
curl http://localhost:8787/wp-login.php
```

## Response Examples

### Git Configuration File (/.git/config)

```ini
[core]
	repositoryformatversion = 0
	filemode = true
	bare = false
	logallrefupdates = true
	ignorecase = true
[remote "origin"]
	url = https://github.com/techcorp/dashboard.git
	fetch = +refs/heads/*:refs/remotes/origin/*
[branch "main"]
	remote = origin
	merge = refs/heads/main
[user]
	name = John Smith
	email = john.smith@example.com
```

### Admin Panel Login (/admin/)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Admin Login - TechCorp Inc</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f0f0f0; }
        .login-form { max-width: 400px; margin: 50px auto; background: white; padding: 30px; }
        input { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; }
        button { width: 100%; padding: 12px; background: #007cba; color: white; border: none; }
    </style>
</head>
<body>
    <div class="login-form">
        <h2>Administrator Login</h2>
        <form method="post">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
    </div>
</body>
</html>
```

### Environment File (/.env)

```ini
APP_NAME=DataManager
APP_ENV=production
APP_KEY=base64:kJHGfds789Hkjhgfd56Kjhgfds45Hjkgf
APP_DEBUG=false
APP_URL=https://company.org

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=techcorp_prod
DB_USERNAME=admin
DB_PASSWORD=Kj7fg9dK2mN8xC4vB1qW

MAIL_HOST=smtp.company.org
MAIL_USERNAME=admin@company.org
MAIL_PASSWORD=MailPass123456

REDIS_HOST=redis
REDIS_PASSWORD=RedisSecretKey789
```

## Custom Generator Example

Here's how to create a custom generator for Apache .htaccess files:

```typescript
// src/templateGenerators/apacheGenerator.ts
import { BaseTemplateGenerator, RandomDataContext } from './types';
import { RANDOM_DATA, getRandomItem, getCompanyName } from './randomData';

export class HtaccessGenerator extends BaseTemplateGenerator {
    protected initializeVariables(): void {
        this.variables = {
            companyName: getCompanyName(this.context.companyName),
            adminEmail: getRandomItem(RANDOM_DATA.emails),
            serverAdmin: getRandomItem(RANDOM_DATA.users),
            rewriteBase: `/${getRandomItem(RANDOM_DATA.projects)}/`,
            cacheTime: Math.floor(Math.random() * 2592000) + 86400, // 1 day to 30 days
        };
    }

    generate(): string {
        const templates = [
            // Basic WordPress-style .htaccess
            `# BEGIN WordPress
RewriteEngine On
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
RewriteBase {{rewriteBase}}
RewriteRule ^index\\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . {{rewriteBase}}index.php [L]
# END WordPress

# Security headers
<IfModule mod_headers.c>
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    Header always set Referrer-Policy strict-origin-when-cross-origin
</IfModule>

# Cache control
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus {{cacheTime}} seconds"
    ExpiresByType application/javascript "access plus {{cacheTime}} seconds"
    ExpiresByType image/png "access plus {{cacheTime}} seconds"
</IfModule>

# Admin contact
# ServerAdmin {{adminEmail}}
# Managed by {{serverAdmin}}`,

            // Security-focused .htaccess
            `# Security Configuration
# Company: {{companyName}}
# Admin: {{adminEmail}}

# Deny access to sensitive files
<Files ~ "\\.(env|log|ini|conf|bak|old)$">
    Require all denied
</Files>

# Prevent directory browsing
Options -Indexes

# Protect against DDoS
<IfModule mod_evasive24.c>
    DOSHashTableSize    2048
    DOSPageCount        2
    DOSSiteCount        50
    DOSPageInterval     1
    DOSSiteInterval     1
    DOSBlockingPeriod   {{cacheTime}}
</IfModule>

# Rate limiting
<IfModule mod_security2.c>
    SecRuleEngine On
    SecRequestBodyLimit 10485760
    SecRequestBodyNoFilesLimit 131072
</IfModule>

RewriteEngine On
RewriteBase {{rewriteBase}}

# Block suspicious requests
RewriteCond %{QUERY_STRING} [a-zA-Z0-9_]=http:// [OR]
RewriteCond %{QUERY_STRING} [a-zA-Z0-9_]=(\.\.//?)+ [OR]
RewriteCond %{QUERY_STRING} [a-zA-Z0-9_]=/([a-z0-9_.]//?)+ [NC]
RewriteRule .* - [F]`
        ];

        const selectedTemplate = getRandomItem(templates);
        return this.replaceVariables(selectedTemplate);
    }

    getContentType(): string {
        return 'text/plain; charset=utf-8';
    }

    getDescription(): string {
        return 'Apache .htaccess configuration file';
    }
}
```

Then add it to your config:

```typescript
// src/config.ts
import { HtaccessGenerator } from './templateGenerators/apacheGenerator';

export const HONEYPOT_RULES: HoneypotRule[] = [
    // ... existing rules
    {
        pattern: '\\.htaccess$',
        generatorClass: HtaccessGenerator,
        description: 'Apache .htaccess file',
    },
    // ... more rules
];
```

## Advanced Configuration Examples

### 1. High-Value Target Setup

For organizations that expect sophisticated attacks:

```typescript
// Additional high-value patterns
{
    pattern: 'backup/.*\\.(sql|db|zip)$',
    generatorClass: DatabaseFileGenerator,
    description: 'Database backup in backup directory',
},
{
    pattern: 'private/.*\\.(key|pem|crt)$',
    generatorClass: BackupFileGenerator, 
    description: 'SSL certificates and private keys',
},
{
    pattern: 'api/v[0-9]+/admin/?',
    generatorClass: AdminPanelGenerator,
    description: 'API admin endpoint',
},
```

### 2. E-commerce Specific

For online stores and e-commerce platforms:

```typescript
{
    pattern: 'magento/.*admin.*',
    generatorClass: AdminPanelGenerator,
    description: 'Magento admin panel',
},
{
    pattern: 'shop/admin/?',
    generatorClass: AdminPanelGenerator,
    description: 'Shop admin interface',
},
{
    pattern: 'orders\\.csv$',
    generatorClass: BackupFileGenerator,
    description: 'Orders export file',
},
{
    pattern: 'customers\\.sql$',
    generatorClass: DatabaseFileGenerator,
    description: 'Customer database dump',
},
```

### 3. Development Environment Targeting

For catching developers probing for development artifacts:

```typescript
{
    pattern: '\\.git/(config|HEAD|logs/HEAD)$',
    generatorClass: GitConfigGenerator,
    description: 'Git repository files',
},
{
    pattern: 'node_modules/.*package\\.json$',
    generatorClass: EnvironmentFileGenerator,
    description: 'Node.js dependencies',
},
{
    pattern: 'vendor/.*composer\\.(json|lock)$',
    generatorClass: EnvironmentFileGenerator,
    description: 'PHP Composer files',
},
{
    pattern: '\\.env\\.(local|prod|dev|staging)$',
    generatorClass: EnvironmentFileGenerator,
    description: 'Environment-specific config files',
},
```

## Response Variation Examples

### Same Endpoint, Different Responses

The honeypot generates different content each time to avoid fingerprinting:

**First request to `/admin/`:**
```html
<title>Admin Login - TechCorp</title>
<!-- Build: 2.1.4 | 2024-01-15 -->
```

**Second request to `/admin/`:**
```html
<title>Administrator Access - DataSoft</title>
<!-- Build: 1.8.12 | 2024-01-08 -->
```

**Third request to `/admin/`:**
```html
<title>Control Panel - WebSolutions</title>
<!-- Build: 3.2.1 | 2024-01-22 -->
```

### Headers Variation

Headers also vary between requests:

**Request 1:**
```
Server: nginx/1.18.0
X-Powered-By: PHP/8.1.2
X-Response-Time: 234ms
```

**Request 2:**
```
Server: Apache/2.4.41 (Ubuntu)
X-Powered-By: Laravel/9.45.1
X-Response-Time: 445ms
```

## Monitoring and Analytics

### Log Analysis Script

Create a simple log analyzer:

```bash
#!/bin/bash
# analyze_honeypot_logs.sh

echo "🍯 Honeypot Log Analysis"
echo "========================"

# Get logs for the last 24 hours
wrangler tail --format pretty | grep "Honeypot triggered" | tail -100 > recent_triggers.log

# Count triggers by path
echo "Top Attack Vectors:"
cat recent_triggers.log | grep -o '/[^[:space:]]*' | sort | uniq -c | sort -nr | head -10

# Count by IP
echo -e "\nTop Attacking IPs:"
cat recent_triggers.log | grep -o 'from [0-9.]*' | cut -d' ' -f2 | sort | uniq -c | sort -nr | head -10

# Count by User Agent patterns
echo -e "\nCommon User Agents:"
cat recent_triggers.log | grep "User Agent:" | cut -d':' -f2 | sort | uniq -c | sort -nr | head -5
```

### Webhook Integration

Forward honeypot triggers to external systems:

```typescript
// In your worker's fetch handler, after logging
if (matchedRule) {
    // ... existing honeypot logic

    // Send webhook notification for high-value targets
    const highValuePaths = ['.git/config', 'wp-config.php', '.env', 'backup.sql'];
    if (highValuePaths.some(p => path.includes(p))) {
        await sendWebhook({
            path,
            clientIp,
            userAgent,
            timestamp: new Date().toISOString(),
            description: matchedRule.description
        });
    }
}

async function sendWebhook(data) {
    try {
        await fetch('https://your-webhook-url.com/honeypot-alert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    } catch (error) {
        console.error('Webhook failed:', error);
    }
}
```

## Best Practices

### 1. Response Realism
- Always use realistic data that matches your organization
- Vary response times (100-600ms) to simulate real server load
- Include proper HTTP headers for the content type
- Use consistent branding across all fake content

### 2. Security Considerations
- Never include real sensitive data in honeypot responses
- Regularly rotate fake credentials and hashes
- Monitor for honeypot fingerprinting attempts
- Use rate limiting to prevent abuse

### 3. Detection Evasion
- Randomize response sizes and formats
- Include realistic timestamps and version numbers
- Use varied server headers and technologies
- Implement realistic error responses

### 4. Operational
- Monitor honeypot logs regularly
- Set up alerts for unusual activity patterns
- Keep honeypot patterns updated with new attack vectors
- Test periodically to ensure functionality

## Troubleshooting

### Common Issues

**No honeypot triggers detected:**
- Check pattern matching with regex testers
- Verify generator classes are imported correctly
- Test locally with curl or the test script

**TypeScript compilation errors:**
- Avoid using reserved words in template variables
- Escape special characters in template literals
- Check all imports and exports

**Workers deployment fails:**
- Verify wrangler.toml configuration
- Check for syntax errors with `npx tsc --noEmit`
- Ensure all dependencies are available

**Responses not varying:**
- Check that random data generators are working
- Verify template variable replacement
- Test multiple requests to same endpoint