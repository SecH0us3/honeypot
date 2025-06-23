# Honeypot Enhanced Features Examples

This document demonstrates the new specialized generators and scanner detection capabilities added to the honeypot system.

## New Specialized Generators

### 1. PhpInfoGenerator
Creates realistic PHP information pages that mimic phpinfo() output.

**Triggers on:**
- `phpinfo.php`
- `info.php`

**Features:**
- Dynamic PHP version generation
- Server environment variables
- Module information
- Configuration settings
- Client IP and User-Agent logging

### 2. ComposerJsonGenerator
Generates realistic Composer configuration files for PHP projects.

**Triggers on:**
- `composer.json`

**Features:**
- Laravel/PHP framework dependencies
- Realistic project structure
- Development dependencies
- Scripts and configuration

### 3. PackageJsonGenerator
Creates authentic Node.js package.json files.

**Triggers on:**
- `package.json`

**Features:**
- React/Next.js dependencies
- Modern development stack
- TypeScript configuration
- Testing framework setup

### 4. HtaccessGenerator
Produces comprehensive Apache .htaccess files.

**Triggers on:**
- `.htaccess`

**Features:**
- Security headers
- URL rewriting rules
- File protection directives
- Performance optimizations
- Attack blocking rules

### 5. WebConfigGenerator
Generates IIS web.config files for .NET applications.

**Triggers on:**
- `web.config`

**Features:**
- Security configurations
- Request filtering
- URL rewriting
- Authentication settings
- Connection strings

## Scanner Detection System

### User-Agent Analysis
The system now analyzes User-Agent strings to detect scanning tools and automated requests.

**Detected Tools Include:**
- **Web Fuzzers:** ffuf, feroxbuster, gobuster, dirb, wfuzz
- **Security Scanners:** nikto, nuclei, sqlmap, nmap
- **Penetration Testing Tools:** metasploit, burpsuite, zap
- **Reconnaissance Tools:** subfinder, amass, httpx
- **Programming Libraries:** requests, urllib, axios, curl scripts

### Enhanced Response Generation

#### RandomScannerResponseGenerator
- Randomly selects any available generator
- Used for basic scanner detection

#### EnhancedScannerResponseGenerator
- Analyzes scanner sophistication based on User-Agent patterns
- Provides different responses based on scanner complexity:
  - **High sophistication (score ≥ 3):** Complex responses like phpinfo, database dumps
  - **Basic scanners (score ≥ 1):** Simple admin panels, login pages
  - **Unknown/legitimate:** Random generator selection

### Scanner Detection Examples

```typescript
// Example User-Agent strings that trigger scanner detection:
"ffuf/1.5.0"
"feroxbuster/2.7.1"
"Mozilla/5.0 (compatible; Nuclei - Open-source project)"
"sqlmap/1.6.12#stable"
"python-requests/2.28.1"
"gobuster/3.1.0"
```

### Response Customization

The scanner detection system adds metadata to HTML responses for logging:

```html
<!-- Scanner detected: ffuf/1.5.0 | Score: 2 | IP: 192.168.1.100 | Time: 2024-01-15T10:30:00.000Z -->
<!DOCTYPE html>
<html>
<!-- Actual honeypot content follows... -->
```

## Configuration Changes

### Rule Priority
1. **Scanner Detection** (highest priority) - Analyzes User-Agent for all requests
2. **Specific File Patterns** - Traditional pattern matching
3. **Fallback Rules** - General catch-all patterns

### New Rule Structure
```typescript
{
    pattern: '.*', // Universal pattern for scanner detection
    generatorClass: EnhancedScannerResponseGenerator,
    description: 'Scanner detection based on User-Agent',
}
```

## Usage Examples

### Basic Implementation
```typescript
import { matchRule, createGenerator } from './config';

function handleRequest(request: Request, env: any): Response {
    const url = new URL(request.url).pathname;
    const userAgent = request.headers.get('User-Agent') || '';
    
    const rule = matchRule(url, userAgent);
    if (rule) {
        const generator = createGenerator(rule.generatorClass, request, env);
        return new Response(generator.generate(), {
            headers: { 'Content-Type': generator.getContentType() }
        });
    }
    
    return new Response('Not Found', { status: 404 });
}
```

### Scanner Detection Logic
```typescript
import { ScannerDetector } from './templateGenerators/scannerDetector';

// Check if a User-Agent looks like a scanner
const isScanner = ScannerDetector.isScannerUserAgent("ffuf/1.5.0");
// Returns: true

// Get sophistication score
const score = ScannerDetector.getScannerScore("python-requests/2.28.1");
// Returns: 1 (basic automation)
```

## Benefits

1. **Realistic Content:** Specialized generators create more convincing honeypot responses
2. **Adaptive Behavior:** Different responses for different types of scanners
3. **Better Intelligence:** Enhanced logging and detection of automated tools
4. **Reduced False Positives:** More sophisticated detection reduces legitimate user impact
5. **Scalable Detection:** Easy to add new scanner patterns and generators

## Security Considerations

- Scanner detection metadata is only added to HTML responses to avoid breaking binary files
- All generated content uses realistic but fake data
- No actual sensitive information is exposed
- Client IP and timing data is logged for analysis
- Response selection is randomized to avoid fingerprinting

## Future Enhancements

- Machine learning-based scanner detection
- Behavioral analysis beyond User-Agent strings
- Dynamic content generation based on request patterns
- Integration with threat intelligence feeds
- Advanced obfuscation techniques