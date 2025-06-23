#!/usr/bin/env node

/**
 * Example webhook handler for honeypot notifications
 * This is a simple Express.js server that receives honeypot alerts
 */

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store recent notifications (in memory - use database for production)
const notifications = [];
const MAX_NOTIFICATIONS = 1000;

// Webhook endpoint for honeypot notifications
app.post('/webhook/honeypot', (req, res) => {
    try {
        const notification = req.body;

        // Validate webhook payload
        if (!notification || !notification.type || !notification.data) {
            return res.status(400).json({ error: 'Invalid webhook payload' });
        }

        // Add timestamp and ID
        notification.id = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        notification.receivedAt = new Date().toISOString();

        // Store notification
        notifications.unshift(notification);
        if (notifications.length > MAX_NOTIFICATIONS) {
            notifications.splice(MAX_NOTIFICATIONS);
        }

        // Log to console
        console.log('\n🚨 HONEYPOT ALERT 🚨');
        console.log('='.repeat(50));
        console.log(`Type: ${notification.type}`);
        console.log(`Time: ${notification.timestamp}`);

        if (notification.data) {
            const data = notification.data;
            console.log(`Path: ${data.path || 'unknown'}`);
            console.log(`Method: ${data.method || 'GET'}`);
            console.log(`Client IP: ${data.clientIp || 'unknown'}`);
            console.log(`Country: ${data.country || 'unknown'}`);
            console.log(`User Agent: ${data.userAgent || 'unknown'}`);
            console.log(`Description: ${data.description || 'unknown'}`);

            if (data.errorStatus) {
                console.log(`Error Status: ${data.errorStatus}`);
                console.log(`Error Message: ${data.errorMessage || 'unknown'}`);
            }
        }
        console.log('='.repeat(50));

        // Send notifications based on severity
        handleNotification(notification);

        res.status(200).json({
            message: 'Webhook received successfully',
            id: notification.id
        });

    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Handle different types of notifications
function handleNotification(notification) {
    const data = notification.data;

    if (!data) return;

    // Check for high-priority alerts
    const highPriorityPatterns = [
        'wp-login.php',
        'wp-config.php',
        'admin',
        '.git',
        '.env',
        'phpmyadmin'
    ];

    const isHighPriority = highPriorityPatterns.some(pattern =>
        data.path && data.path.toLowerCase().includes(pattern)
    );

    if (isHighPriority) {
        console.log('🔥 HIGH PRIORITY ALERT 🔥');
        // Here you could send email, Slack notification, etc.
    }

    // Track POST request patterns
    if (data.method === 'POST') {
        console.log('📮 POST Request Attack Detected');
        // Track POST attack patterns
    }

    // Geolocation alerts
    const suspiciousCountries = ['CN', 'RU', 'KP', 'IR'];
    if (suspiciousCountries.includes(data.country)) {
        console.log('🌍 Suspicious Geographic Origin');
    }
}

// Dashboard endpoint to view recent notifications
app.get('/dashboard', (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    const recentNotifications = notifications.slice(0, limit);

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Honeypot Dashboard</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; }
            .header { background: #333; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .stats { display: flex; gap: 20px; margin-bottom: 20px; }
            .stat-card { background: white; padding: 20px; border-radius: 8px; flex: 1; text-align: center; }
            .stat-number { font-size: 2em; font-weight: bold; color: #e74c3c; }
            .notification { background: white; margin-bottom: 10px; padding: 15px; border-radius: 8px; border-left: 4px solid #e74c3c; }
            .notification.high-priority { border-left-color: #c0392b; background: #fdf2f2; }
            .notification.post-request { border-left-color: #f39c12; }
            .meta { color: #666; font-size: 0.9em; margin-bottom: 10px; }
            .path { font-family: monospace; background: #f8f8f8; padding: 2px 6px; border-radius: 3px; }
            .refresh-btn { background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
            .refresh-btn:hover { background: #2980b9; }
        </style>
        <script>
            function autoRefresh() {
                setTimeout(() => {
                    window.location.reload();
                }, 30000); // Refresh every 30 seconds
            }
            window.onload = autoRefresh;
        </script>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🍯 Honeypot Dashboard</h1>
                <p>Real-time monitoring of honeypot activities</p>
            </div>

            <div class="stats">
                <div class="stat-card">
                    <div class="stat-number">${notifications.length}</div>
                    <div>Total Alerts</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${notifications.filter(n => n.data?.method === 'POST').length}</div>
                    <div>POST Requests</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${new Set(notifications.map(n => n.data?.clientIp)).size}</div>
                    <div>Unique IPs</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${notifications.filter(n => isHighPriority(n)).length}</div>
                    <div>High Priority</div>
                </div>
            </div>

            <div>
                <button class="refresh-btn" onclick="window.location.reload()">🔄 Refresh</button>
                <p>Showing latest ${Math.min(limit, notifications.length)} of ${notifications.length} notifications</p>
            </div>

            <div class="notifications">
                ${recentNotifications.map(notification => {
                    const data = notification.data || {};
                    const isHighPrio = isHighPriority(notification);
                    const isPost = data.method === 'POST';

                    let className = 'notification';
                    if (isHighPrio) className += ' high-priority';
                    else if (isPost) className += ' post-request';

                    return `
                    <div class="${className}">
                        <div class="meta">
                            ${notification.timestamp} |
                            IP: ${data.clientIp || 'unknown'} |
                            Country: ${data.country || 'unknown'} |
                            Method: ${data.method || 'GET'}
                            ${data.errorStatus ? ` | Status: ${data.errorStatus}` : ''}
                        </div>
                        <div>
                            <strong>Path:</strong> <span class="path">${data.path || 'unknown'}</span>
                            ${isHighPrio ? ' 🔥' : ''}
                            ${isPost ? ' 📮' : ''}
                        </div>
                        <div><strong>Description:</strong> ${data.description || 'unknown'}</div>
                        ${data.errorMessage ? `<div><strong>Error Message:</strong> ${data.errorMessage}</div>` : ''}
                        <div><strong>User Agent:</strong> ${(data.userAgent || 'unknown').substring(0, 100)}${(data.userAgent || '').length > 100 ? '...' : ''}</div>
                    </div>
                    `;
                }).join('')}
            </div>
        </div>
    </body>
    </html>
    `;

    res.send(html);
});

// API endpoint for JSON data
app.get('/api/notifications', (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const result = notifications.slice(offset, offset + limit);

    res.json({
        notifications: result,
        total: notifications.length,
        limit,
        offset
    });
});

// Statistics endpoint
app.get('/api/stats', (req, res) => {
    const stats = {
        total: notifications.length,
        postRequests: notifications.filter(n => n.data?.method === 'POST').length,
        uniqueIPs: new Set(notifications.map(n => n.data?.clientIp)).size,
        highPriority: notifications.filter(n => isHighPriority(n)).length,
        countries: {},
        topPaths: {},
        userAgents: {},
        recentHour: notifications.filter(n => {
            const notificationTime = new Date(n.timestamp);
            const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
            return notificationTime > hourAgo;
        }).length
    };

    // Count by country
    notifications.forEach(n => {
        const country = n.data?.country || 'unknown';
        stats.countries[country] = (stats.countries[country] || 0) + 1;
    });

    // Count by path
    notifications.forEach(n => {
        const path = n.data?.path || 'unknown';
        stats.topPaths[path] = (stats.topPaths[path] || 0) + 1;
    });

    // Count user agents
    notifications.forEach(n => {
        const ua = (n.data?.userAgent || 'unknown').split(' ')[0];
        stats.userAgents[ua] = (stats.userAgents[ua] || 0) + 1;
    });

    res.json(stats);
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        notifications: notifications.length,
        timestamp: new Date().toISOString()
    });
});

// Helper function to determine high priority
function isHighPriority(notification) {
    const data = notification.data;
    if (!data || !data.path) return false;

    const highPriorityPatterns = [
        'wp-login.php',
        'wp-config.php',
        'admin',
        '.git',
        '.env',
        'phpmyadmin'
    ];

    return highPriorityPatterns.some(pattern =>
        data.path.toLowerCase().includes(pattern)
    );
}

// Start server
app.listen(port, () => {
    console.log(`🍯 Honeypot Webhook Server running on port ${port}`);
    console.log(`Dashboard: http://localhost:${port}/dashboard`);
    console.log(`Webhook URL: http://localhost:${port}/webhook/honeypot`);
    console.log(`API: http://localhost:${port}/api/notifications`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down webhook server...');
    process.exit(0);
});

// Export for testing
module.exports = app;
