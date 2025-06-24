# Honeypot Demo Examples

This file contains practical examples of how to test and interact with the honeypot system using various tools.

## 🔧 Quick Testing with cURL

### Git Repository Files
```bash
# Test Git configuration file
curl -H "User-Agent: sqlmap/1.6.12" http://localhost:8787/.git/config

# Test Git HEAD reference
curl -H "User-Agent: ffuf/1.5.0" http://localhost:8787/.git/HEAD

# Test Git branch reference
curl -H "User-Agent: gobuster/3.1.0" http://localhost:8787/.git/refs/heads/main
```

### Admin Panels
```bash
# Generic admin panel
curl -H "User-Agent: feroxbuster/2.7.1" http://localhost:8787/admin/

# phpMyAdmin interface
curl -H "User-Agent: nuclei-scanner" http://localhost:8787/phpmyadmin/

# WordPress admin
curl -H "User-Agent: wpscan/3.8.22" http://localhost:8787/wp-admin/
```

### Configuration Files
```bash
# Environment variables
curl -H "User-Agent: dirb/2.22" http://localhost:8787/.env

# PHP configuration
curl -H "User-Agent: dirbuster" http://localhost:8787/config.php

# WordPress config
curl -H "User-Agent: python-requests/2.28.1" http://localhost:8787/wp-config.php
```

### Database & Backup Files
```bash
# SQL dump
curl -H "User-Agent: wget/1.21.1" http://localhost:8787/backup.sql

# Database backup
curl -H "User-Agent: curl/7.68.0" http://localhost:8787/database.bak

# User data export
curl -H "User-Agent: masscan/1.3.2" http://localhost:8787/users.csv
```

## 🎯 Testing POST Requests (Random Errors)

The honeypot returns random HTTP error codes (400-561) for all POST requests:

```bash
# JSON POST request
curl -X POST \
  -H "Content-Type: application/json" \
  -H "User-Agent: burpsuite/2023.10.3.7" \
  -d '{"username":"admin","password":"password123"}' \
  http://localhost:8787/api/login

# Form data POST
curl -X POST \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "User-Agent: sqlmap/1.6.12" \
  -d "user=root&pass=toor" \
  http://localhost:8787/admin/login

# XML POST request
curl -X POST \
  -H "Content-Type: application/xml" \
  -H "User-Agent: metasploit/6.3.25" \
  -d '<?xml version="1.0"?><root><test>data</test></root>' \
  http://localhost:8787/api/upload
```

## 🔍 Advanced Testing Scenarios

### Legitimate Browser vs Scanner Detection
```bash
# Legitimate browser request (should work normally)
curl -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36" \
  http://localhost:8787/.git/config

# Scanner request (will be logged as attack)
curl -H "User-Agent: ffuf/1.5.0" \
  http://localhost:8787/.git/config
```

### Multiple Tool Simulation
```bash
# Simulate Nuclei scanner
curl -H "User-Agent: Mozilla/5.0 (compatible; Nuclei - Open-source project)" \
  http://localhost:8787/phpinfo.php

# Simulate Gobuster
curl -H "User-Agent: gobuster/3.1.0" \
  http://localhost:8787/wp-login.php

# Simulate combination attack
curl -H "User-Agent: Mozilla/5.0 nuclei burpsuite sqlmap metasploit" \
  http://localhost:8787/admin.php
```

### IP Spoofing Tests
```bash
# Test with different IP headers
curl -H "X-Forwarded-For: 192.168.1.100" \
  -H "X-Real-IP: 203.0.113.195" \
  -H "User-Agent: masscan/1.3.2" \
  http://localhost:8787/.env

# Test with Tor-like headers
curl -H "X-Forwarded-For: 127.0.0.1" \
  -H "User-Agent: Tor Browser" \
  http://localhost:8787/database.sql
```

## 📊 Response Analysis

### Check Response Headers
```bash
# View full response headers
curl -I -H "User-Agent: sqlmap/1.6.12" http://localhost:8787/.git/config

# View response with timing
curl -w "Total time: %{time_total}s\nStatus: %{http_code}\n" \
  -H "User-Agent: ffuf/1.5.0" \
  http://localhost:8787/backup.sql
```

### Content Variation Testing
```bash
# Run same request multiple times to see content variation
for i in {1..5}; do
  echo "=== Request $i ==="
  curl -s -H "User-Agent: gobuster/3.1.0" http://localhost:8787/.git/config | head -3
  echo
done
```

## 🐍 Python Testing Script

Create a simple Python script to test multiple endpoints:

```python
import requests
import time

endpoints = [
    '/.git/config',
    '/admin/',
    '/.env',
    '/backup.sql',
    '/wp-config.php'
]

headers = {
    'User-Agent': 'python-requests/2.28.1 (scanner)'
}

for endpoint in endpoints:
    try:
        response = requests.get(f'http://localhost:8787{endpoint}', headers=headers)
        print(f"{endpoint}: {response.status_code} ({len(response.text)} bytes)")
        time.sleep(0.5)  # Be nice to the server
    except Exception as e:
        print(f"{endpoint}: Error - {e}")
```

## 🔄 Automated Testing with Bash

```bash
#!/bin/bash
# honeypot_test.sh - Quick honeypot functionality test

BASE_URL="http://localhost:8787"
USER_AGENTS=(
    "sqlmap/1.6.12"
    "ffuf/1.5.0"
    "gobuster/3.1.0"
    "nuclei-scanner"
    "feroxbuster/2.7.1"
)

ENDPOINTS=(
    "/.git/config"
    "/admin/"
    "/.env"
    "/backup.sql"
    "/wp-login.php"
)

echo "🍯 Testing Honeypot Functionality"
echo "================================="

for endpoint in "${ENDPOINTS[@]}"; do
    for ua in "${USER_AGENTS[@]}"; do
        echo -n "Testing $endpoint with $ua: "
        status=$(curl -s -o /dev/null -w "%{http_code}" -H "User-Agent: $ua" "$BASE_URL$endpoint")
        echo "HTTP $status"
        sleep 0.2
    done
    echo
done

echo "✅ Test completed! Check your honeypot logs for recorded attempts."
```

## 📈 Performance Testing

Test honeypot performance under load:

```bash
# Simple load test with Apache Bench (if installed)
ab -n 100 -c 10 -H "User-Agent: sqlmap/1.6.12" http://localhost:8787/.git/config

# Or with curl in parallel
seq 1 50 | xargs -n1 -P10 -I{} curl -s -H "User-Agent: scanner-{}" http://localhost:8787/admin/ > /dev/null
```

## 🎨 Custom Scanner Simulation

Create your own scanner signature:

```bash
# Custom scanner with specific signature
curl -H "User-Agent: MyCustomScanner/1.0 (vulnerability-assessment)" \
  -H "X-Scanner-ID: demo-test-123" \
  -H "Accept: application/json" \
  http://localhost:8787/.git/config

# Multi-step attack simulation
curl -H "User-Agent: recon-scanner/1.0" http://localhost:8787/robots.txt
sleep 1
curl -H "User-Agent: recon-scanner/1.0" http://localhost:8787/.git/config
sleep 1
curl -H "User-Agent: recon-scanner/1.0" http://localhost:8787/admin/
```

## 📝 Expected Results

When testing the honeypot, you should see:

1. **GET Requests to honeypot paths**: HTTP 200 with realistic fake content
2. **POST Requests to any path**: Random HTTP error codes (400-561)
3. **GET Requests to non-honeypot paths**: HTTP 404 Not Found
4. **Response variations**: Same endpoint returns slightly different content each time
5. **Proper headers**: Realistic Content-Type, Server, and timing headers
6. **Logging**: All requests logged with client information and matched rules

## 🔍 Monitoring Results

To see the honeypot logs in real-time:

```bash
# If using Wrangler for development
wrangler tail

# Check specific log entries
wrangler tail | grep "Honeypot triggered"
```

## ⚠️ Important Notes

- **Local Testing**: These examples assume the honeypot is running on `localhost:8787`
- **Production Testing**: Replace with your actual deployment URL
- **Rate Limiting**: Be respectful and don't overwhelm the service with too many requests
- **Legal Compliance**: Only test against your own honeypot deployment
- **User-Agent Importance**: Different User-Agents trigger different detection behaviors

---

💡 **Pro Tip**: Try the same request with different User-Agents to see how the honeypot adapts its responses based on the detected threat level!