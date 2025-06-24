# Honeypot Cloudflare Worker

A sophisticated honeypot application built for Cloudflare Workers that deceives attackers by serving realistic fake content for common attack vectors.

## 🧪 Quick Demo

Want to see the honeypot in action? Try these live examples (if deployed):

**Git Repository Files:**
- [/.git/config](/.git/config) - Git configuration with fake repository info
- [/.git/HEAD](/.git/HEAD) - Current branch reference
- [/.git/refs/heads/main](/.git/refs/heads/main) - Main branch commit hash

**Admin Panels:**
- [/admin/](/admin/) - Generic admin login page
- [/phpmyadmin/](/phpmyadmin/) - Database administration interface
- [/wp-admin/](/wp-admin/) - WordPress admin panel

**Configuration Files:**
- [/.env](/.env) - Environment variables with API keys
- [/config.php](/config.php) - PHP application configuration
- [/wp-config.php](/wp-config.php) - WordPress database configuration

**Backup & Database Files:**
- [/backup.sql](/backup.sql) - SQL database dump
- [/database.bak](/database.bak) - Database backup file
- [/users.csv](/users.csv) - User data export

> **Note:** All data shown is completely fake and generated dynamically. Click any link to see realistic content that would fool attackers, but contains no real secrets!

📄 **[View Interactive Demo Page](static/index.html)** - Complete overview with all features and live examples

🔧 **[See Demo Examples & Testing Commands](DEMO_EXAMPLES.md)** - cURL commands, scripts, and testing scenarios

## What is a Honeypot

A Honeypot is a security system that mimics vulnerable systems or files to attract and detect attackers. This project represents an intelligent trap that:

- **Simulates Vulnerabilities**: Creates realistic fake configuration files, admin panels, and other popular attack targets
- **Detects Attacks**: Automatically identifies scanning tools and malicious activity
- **Logs Activity**: Records all suspicious requests with detailed information about attackers
- **Threat Notifications**: Can send webhook notifications about attack attempts in real-time
- **Slows Down Attackers**: Returns realistic but useless data, forcing them to waste time

### How It Works

1. **Request Reception**: Worker receives HTTP request to a suspicious path
2. **Analysis**: System analyzes User-Agent, IP address, and requested path
3. **Response Generation**: Creates realistic fake content (Git files, admin panels, databases)
4. **Logging**: All attack information is saved in logs
5. **Notification**: Optionally sends notification about attack attempt

## Features

- **Git Files**: Fake `.git/config`, `.git/HEAD`, and other Git repository files
- **Admin Panels**: Realistic admin login pages with multiple variations
- **WordPress**: Authentic-looking WordPress login pages
- **Database Files**: Fake SQL dumps and database files
- **Backup Files**: Realistic backup files with metadata
- **Environment Files**: Fake configuration files (.env, .ini, .conf)
- **POST Request Honeypot**: Returns random HTTP errors (400-561) for all POST requests
- **Dynamic Content**: Responses vary slightly each time to avoid detection
- **Realistic Headers**: Proper Content-Type and server headers
- **Company Branding**: Uses COMPANY_NAME environment variable when available
- **Webhook Notifications**: Optional webhook alerts for honeypot triggers

## Architecture

The honeypot uses a modular template generator system:

```
src/
├── index.ts                 # Main worker logic
├── config.ts               # URL patterns and generator mappings
└── templateGenerators/
    ├── types.ts            # Base interfaces and classes
    ├── randomData.ts       # Data collections for generating realistic content
    ├── gitGenerator.ts     # Git repository files
    ├── adminGenerator.ts   # Admin panels and phpMyAdmin
    ├── wordpressGenerator.ts # WordPress login pages
    └── fileGenerators.ts   # Backup files, databases, configs
```

## Setup

> 💡 **Quick Start:** Visit the [interactive demo page](static/index.html) to see all honeypot features in action before setting up!

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables (optional):**
   ```bash
   # Set company name for branding
   wrangler secret put COMPANY_NAME
   ```

3. **Development:**
   ```bash
   npm run dev
   ```

4. **Deploy:**
   ```bash
   npm run deploy
   ```

## Configuration

### Adding New Patterns

Edit `src/config.ts` to add new URL patterns:

```typescript
{
    pattern: 'your-pattern-regex$',
    generatorClass: YourGeneratorClass,
    description: 'Description of what this detects',
}
```

### Creating New Generators

1. Create a new generator class extending `BaseTemplateGenerator`
2. Implement required methods: `initializeVariables()`, `generate()`, `getContentType()`, `getDescription()`
3. Add multiple template variations for realism

Example:

```typescript
export class MyGenerator extends BaseTemplateGenerator {
    protected initializeVariables(): void {
        this.variables = {
            customVar: 'custom value',
            randomValue: getRandomItem(['option1', 'option2', 'option3']),
        };
    }

    generate(): string {
        const templates = [
            'Template 1 with {{customVar}}',
            'Template 2 with {{randomValue}}',
        ];
        
        const selectedTemplate = getRandomItem(templates);
        return this.replaceVariables(selectedTemplate);
    }

    getContentType(): string {
        return 'text/plain; charset=utf-8';
    }

    getDescription(): string {
        return 'My custom generator';
    }
}
```

## Monitored Patterns

The honeypot currently detects and responds to:

### POST Requests
- **All POST requests** to any endpoint return random HTTP error codes (400-561)
- Includes realistic error messages and proper content-type handling
- Supports JSON, XML, and HTML error responses based on request headers
- Logs all POST attempts with client information

### Git Repository Files
- `.git/config`
- `.git/HEAD`
- `.git/refs/heads/*`
- `.git/index`

### Admin Interfaces
- `/admin/`, `/administrator/`
- `/wp-admin/`  
- `/phpmyadmin/`
- `/manage/`, `/control/`, `/panel/`
- `admin.php`, `login.php`

### WordPress
- `wp-login.php`
- `wp-config.php`

### Configuration Files
- `.env`, `.config`, `.ini`, `.conf`
- `config.php`, `settings.php`, `database.php`
- `.htaccess`, `web.config`

### Backup & Database Files
- `.bak`, `.backup`, `.old`, `.orig`, `.tmp`
- `.sql`, `.db`, `.sqlite`, `.mdb`
- `.zip`, `.tar.gz`, `.rar`

### Development Files
- `composer.json`, `package.json`
- `composer.lock`, `yarn.lock`

### Server Info
- `phpinfo.php`, `info.php`, `test.php`

### Log Files
- `.log`, `.debug`, `.trace`
- `error_log`, `access_log`

## Logging

The honeypot logs all triggered requests with:
- Requested path
- HTTP method (GET/POST)
- Client IP address
- User agent
- Matched rule description
- For POST requests: error status code and message

Access logs through Cloudflare Workers dashboard or CLI:

```bash
wrangler tail
```

## Security Considerations

- All responses are fake and contain no real sensitive data
- Random delays (100-600ms) make responses more realistic
- Proper security headers are included in responses
- Company name from environment variable is safely used
- No real system information is exposed

## Customization

### Company Branding

Set the `COMPANY_NAME` environment variable to customize company references in fake content:

```bash
wrangler secret put COMPANY_NAME
# Enter your company name when prompted
```

### Response Variations

Each generator includes multiple template variations. The system automatically:
- Randomly selects templates
- Generates random data (names, emails, hashes, dates)
- Varies response sizes and content
- Uses realistic server headers

### Adding More Data

Extend `randomData.ts` to add more realistic data:

```typescript
export const RANDOM_DATA = {
    // Add your custom data arrays
    customField: ['value1', 'value2', 'value3'],
    // ... existing data
};
```

## Performance

- Lightweight: No external dependencies
- Fast: Template generation is optimized
- Scalable: Runs on Cloudflare's edge network
- Efficient: Minimal memory usage

## Testing

### Full Test Suite

A comprehensive test script is included to verify honeypot functionality:

```bash
# Make sure your worker is running locally
npm run dev

# In another terminal, run the full test script
node test_honeypot.js
```

The test script (`test_honeypot.js`) will:
- Test all configured GET honeypot patterns
- Test POST requests to various endpoints
- Verify random error generation for POST requests
- Verify response formats and headers
- Check that legitimate paths return 404
- Measure response times
- Provide detailed success/failure reports

### POST-Only Testing

For quick POST request testing:

```bash
# Test only POST endpoints
node test_post.js
```

The POST test script will:
- Send POST requests with various content types (JSON, form data, XML)
- Verify random error status codes (400-561)
- Test different payload types including potential attack vectors
- Display response time statistics
- Show status code distribution

### Test Results Interpretation

**GET Requests:**
- **Green ✓**: Honeypot triggered correctly (200 status)
- **Yellow -**: Legitimate 404 response
- **Red ✗**: Error or unexpected response

**POST Requests:**
- **Red ✓**: Random error generated correctly (400-561 status)
- **Yellow ⚠**: Unexpected response (not in 400-561 range)
- **Red ✗**: Request failed completely

### Testing Against Production

Set the `WORKER_URL` environment variable to test deployed workers:

```bash
WORKER_URL=https://your-worker.your-subdomain.workers.dev node test_honeypot.js
```

### Custom Tests

Add your own test URLs to the `testUrls` array in `test_honeypot.js`:

```javascript
const testUrls = [
    // Your custom attack vectors
    '/your-custom-path',
    '/another-test-path.php',
    // ... existing paths
];
```

Add custom POST test cases to `test_post.js`:

```javascript
const postTests = [
    {
        url: '/your-api-endpoint',
        data: { custom: 'payload' },
        contentType: 'application/json'
    },
    // ... existing tests
];
```

## Monitoring

### Real-time Logs

Monitor honeypot triggers in real-time:

```bash
wrangler tail
```

### Log Analysis

Look for entries like:

**GET Requests:**
```
Honeypot triggered: /.git/config from 192.168.1.100 - Git configuration file
User Agent: Mozilla/5.0 (compatible; Baiduspider/2.0)
```

**POST Requests:**
```
POST request honeypot triggered: https://yoursite.com/api/login from 203.0.113.100
User Agent: curl/7.68.0
Returning error 429: Rate limit exceeded
```

### Metrics

Track honeypot effectiveness:
- Number of GET honeypot triggers per day
- Number of POST requests with random errors
- Most common attack vectors and endpoints
- Error status code distribution for POST requests
- Geographic distribution of attackers
- User agent patterns
- Response time patterns

## License

MIT License - Feel free to use and modify as needed.