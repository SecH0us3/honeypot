# Honeypot Cloudflare Worker

A sophisticated honeypot application built for Cloudflare Workers that deceives attackers by serving realistic fake content for common attack vectors.

## Features

- **Git Files**: Fake `.git/config`, `.git/HEAD`, and other Git repository files
- **Admin Panels**: Realistic admin login pages with multiple variations
- **WordPress**: Authentic-looking WordPress login pages
- **Database Files**: Fake SQL dumps and database files
- **Backup Files**: Realistic backup files with metadata
- **Environment Files**: Fake configuration files (.env, .ini, .conf)
- **Dynamic Content**: Responses vary slightly each time to avoid detection
- **Realistic Headers**: Proper Content-Type and server headers
- **Company Branding**: Uses COMPANY_NAME environment variable when available

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
- Client IP address
- User agent
- Matched rule description

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

A comprehensive test script is included to verify honeypot functionality:

```bash
# Make sure your worker is running locally
npm run dev

# In another terminal, run the test script
node test_honeypot.js
```

The test script will:
- Test all configured honeypot patterns
- Verify response formats and headers
- Check that legitimate paths return 404
- Measure response times
- Provide detailed success/failure reports

### Test Results Interpretation

- **Green ✓**: Honeypot triggered correctly (200 status)
- **Yellow -**: Legitimate 404 response
- **Red ✗**: Error or unexpected response

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

## Monitoring

### Real-time Logs

Monitor honeypot triggers in real-time:

```bash
wrangler tail
```

### Log Analysis

Look for entries like:
```
Honeypot triggered: /.git/config from 192.168.1.100 - Git configuration file
User Agent: Mozilla/5.0 (compatible; Baiduspider/2.0)
```

### Metrics

Track honeypot effectiveness:
- Number of triggers per day
- Most common attack vectors
- Geographic distribution of attackers
- User agent patterns

## License

MIT License - Feel free to use and modify as needed.