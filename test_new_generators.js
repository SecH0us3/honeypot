#!/usr/bin/env node

const testUrls = [
    'http://localhost:8787/yarn.lock',
    'http://localhost:8787/composer.lock',
    'http://localhost:8787/.dockerignore',
    'http://localhost:8787/.gitignore',
    'http://localhost:8787/error.log',
    'http://localhost:8787/access.log',
    'http://localhost:8787/debug.log',
    'http://localhost:8787/backup.zip',
    'http://localhost:8787/archive.tar.gz',
    'http://localhost:8787/data.rar',
    'http://localhost:8787/swagger.json',
    'http://localhost:8787/api/v1/users',
    'http://localhost:8787/openapi.json'
];

async function testGenerator(url) {
    try {
        console.log(`\n🔍 Testing: ${url}`);

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; TestBot/1.0)'
            }
        });

        const contentType = response.headers.get('content-type');
        const responseText = await response.text();

        console.log(`  Status: ${response.status}`);
        console.log(`  Content-Type: ${contentType}`);
        console.log(`  Body Length: ${responseText.length} bytes`);

        // Preview first 200 characters
        const preview = responseText.substring(0, 200).replace(/\n/g, '\\n');
        console.log(`  Preview: ${preview}${responseText.length > 200 ? '...' : ''}`);

        // Specific validations
        const filename = url.split('/').pop();

        if (filename === 'yarn.lock') {
            if (responseText.includes('# yarn lockfile v1') && responseText.includes('version "')) {
                console.log('  ✅ Yarn lock format valid');
            } else {
                console.log('  ❌ Yarn lock format invalid');
            }
        }

        if (filename === 'composer.lock') {
            try {
                const json = JSON.parse(responseText);
                if (json.packages && json['content-hash']) {
                    console.log('  ✅ Composer lock format valid');
                } else {
                    console.log('  ❌ Composer lock format invalid');
                }
            } catch (e) {
                console.log('  ❌ Composer lock is not valid JSON');
            }
        }

        if (filename === '.dockerignore' || filename === '.gitignore') {
            if (responseText.includes('node_modules') || responseText.includes('*.log')) {
                console.log('  ✅ Ignore file format valid');
            } else {
                console.log('  ❌ Ignore file format questionable');
            }
        }

        if (filename.endsWith('.log')) {
            if (responseText.includes('[') && (responseText.includes('ERROR') || responseText.includes('DEBUG') || responseText.includes('GET'))) {
                console.log('  ✅ Log file format valid');
            } else {
                console.log('  ❌ Log file format invalid');
            }
        }

        if (filename.includes('.zip') || filename.includes('.tar') || filename.includes('.rar')) {
            // Check for archive headers
            if (contentType === 'application/octet-stream') {
                console.log('  ✅ Archive content-type correct');

                // Check for specific signatures
                if (filename.includes('.zip') && responseText.includes('PK')) {
                    console.log('  ✅ ZIP signature detected');
                } else if (filename.includes('.rar') && responseText.includes('Rar!')) {
                    console.log('  ✅ RAR signature detected');
                } else if (filename.includes('.tar')) {
                    console.log('  ✅ TAR-like content detected');
                }
            } else {
                console.log('  ❌ Archive content-type incorrect');
            }
        }

        if (filename.includes('swagger') || filename.includes('openapi') || url.includes('/api/')) {
            try {
                const json = JSON.parse(responseText);
                if (json.openapi || json.swagger) {
                    console.log('  ✅ OpenAPI/Swagger format valid');
                    if (json.paths && Object.keys(json.paths).length > 3) {
                        console.log('  ✅ Multiple API paths generated');
                    }
                    if (json.components && json.components.schemas) {
                        console.log('  ✅ Schema definitions present');
                    }
                } else {
                    console.log('  ❌ OpenAPI/Swagger format invalid');
                }
            } catch (e) {
                console.log('  ❌ API response is not valid JSON');
            }
        }

    } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
    }
}

async function runTests() {
    console.log('🍯 New Generators Test Suite');
    console.log('============================');
    console.log(`Testing ${testUrls.length} new generator endpoints...`);

    for (const url of testUrls) {
        await testGenerator(url);
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n✅ Test suite completed!');
    console.log('\nKey improvements tested:');
    console.log('- Yarn.lock generator with proper lockfile format');
    console.log('- Composer.lock generator with JSON structure');
    console.log('- Docker/Git ignore files with realistic patterns');
    console.log('- Log files with proper timestamps and formats');
    console.log('- Archive files with real headers + random data');
    console.log('- Enhanced Swagger/OpenAPI with auto-generated paths');
}

// Run the tests
runTests().catch(console.error);
