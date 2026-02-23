import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src/index';

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe('Hello World worker', () => {
	it('responds with Hello World! (unit style)', async () => {
		const request = new IncomingRequest('http://example.com');
		// Create an empty context to pass to `worker.fetch()`.
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		// Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
		await waitOnExecutionContext(ctx);
		expect(await response.text()).toMatchInlineSnapshot(`
			"<!doctype html>
			<html lang="en">

			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Honeypot - Edge Security System</title>
				<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
				<link rel="preconnect" href="https://fonts.googleapis.com">
				<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
				<link
					href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
					rel="stylesheet">
				<style>
					:root {
						--bg-base: #0f172a;
						/* Slate 900 */
						--bg-card: #1e293b;
						/* Slate 800 */
						--bg-code: #020617;
						/* Slate 950 */
						--border: #334155;
						/* Slate 700 */
						--text-main: #cbd5e1;
						/* Slate 300 */
						--text-muted: #94a3b8;
						/* Slate 400 */
						--text-heading: #f8fafc;
						/* Slate 50 */
						--accent: #38bdf8;
						/* Light Blue 400 */
						--accent-hover: #0ea5e9;
						/* Light Blue 500 */
						--border-radius: 8px;
					}

					* {
						box-sizing: border-box;
						margin: 0;
						padding: 0;
					}

					body {
						font-family: 'Inter', -apple-system, sans-serif;
						background-color: var(--bg-base);
						color: var(--text-main);
						line-height: 1.6;
						padding: 40px 20px;
					}

					.header {
						text-align: center;
						margin-bottom: 40px;
					}

					.header h1 {
						color: var(--text-heading);
						font-size: 2.5rem;
						font-weight: 700;
						letter-spacing: -0.025em;
						margin-bottom: 10px;
					}

					.header p {
						color: var(--text-muted);
						font-size: 1.1rem;
					}

					.layout-grid {
						display: grid;
						grid-template-columns: 1fr 1.6fr 350px;
						/* Left, Middle, Right */
						gap: 40px;
						max-width: 1550px;
						margin: 0 auto;
						align-items: start;
					}

					@media (max-width: 1100px) {
						.layout-grid {
							grid-template-columns: 1fr 1fr;
						}

						.col-demo {
							grid-column: 1 / -1;
						}
					}

					@media (max-width: 768px) {
						.layout-grid {
							grid-template-columns: 1fr;
						}
					}

					.card {
						background: var(--bg-card);
						border: 1px solid var(--border);
						border-radius: var(--border-radius);
						padding: 25px;
						box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
					}

					.card h2 {
						color: var(--text-heading);
						font-size: 1.25rem;
						font-weight: 600;
						border-bottom: 1px solid var(--border);
						padding-bottom: 12px;
						margin-bottom: 20px;
						display: flex;
						align-items: center;
						gap: 10px;
					}

					.card h3 {
						color: var(--text-heading);
						font-size: 1.1rem;
						font-weight: 600;
						margin: 24px 0 12px;
					}

					p {
						margin-bottom: 16px;
					}

					a {
						color: var(--accent);
						text-decoration: none;
						transition: color 0.15s ease;
					}

					a:hover {
						color: var(--accent-hover);
						text-decoration: underline;
					}

					code {
						font-family: 'JetBrains Mono', monospace;
						background: var(--bg-code);
						border: 1px solid var(--border);
						padding: 2px 6px;
						border-radius: 4px;
						font-size: 0.85em;
						color: #e2e8f0;
					}

					pre {
						background: var(--bg-code);
						border: 1px solid var(--border);
						padding: 16px;
						border-radius: var(--border-radius);
						overflow-x: auto;
						margin-bottom: 20px;
					}

					pre code {
						background: transparent;
						border: none;
						padding: 0;
						color: #e2e8f0;
						font-size: 0.85em;
					}

					/* Left Column Specifics */
					.step {
						margin-bottom: 24px;
						position: relative;
					}

					.step-title {
						display: flex;
						align-items: center;
						margin-bottom: 10px;
						color: var(--text-heading);
						font-weight: 500;
					}

					.step-number {
						background: var(--accent);
						color: var(--bg-base);
						width: 22px;
						height: 22px;
						display: inline-flex;
						align-items: center;
						justify-content: center;
						border-radius: 50%;
						font-size: 0.75rem;
						font-weight: 700;
						margin-right: 12px;
						flex-shrink: 0;
					}

					.step p {
						padding-left: 34px;
						margin-bottom: 10px;
						font-size: 0.95rem;
						color: var(--text-muted);
					}

					.step pre {
						margin-left: 34px;
					}

					/* Middle Column Specifics */
					.goal-highlight {
						background: rgba(56, 189, 248, 0.1);
						border-left: 4px solid var(--accent);
						padding: 16px 20px;
						border-radius: 0 var(--border-radius) var(--border-radius) 0;
						margin-bottom: 30px;
						font-size: 1.05rem;
					}

					ul {
						padding-left: 20px;
						margin-bottom: 20px;
					}

					ul li {
						margin-bottom: 8px;
					}

					.tech-stack {
						display: flex;
						flex-wrap: wrap;
						gap: 8px;
						margin-top: 15px;
					}

					.tech-tag {
						background: var(--bg-code);
						border: 1px solid var(--border);
						color: var(--text-muted);
						padding: 6px 12px;
						border-radius: 20px;
						font-size: 0.8rem;
						font-family: 'JetBrains Mono', monospace;
					}

					/* Right Column Specifics */
					.demo-group {
						margin-bottom: 25px;
					}

					.demo-group:last-child {
						margin-bottom: 0;
					}

					.demo-group h4 {
						color: var(--text-muted);
						font-size: 0.85rem;
						text-transform: uppercase;
						letter-spacing: 0.05em;
						margin-bottom: 10px;
					}

					.demo-list {
						list-style: none;
						padding: 0;
						margin: 0;
					}

					.demo-list li {
						margin-bottom: 6px;
					}

					.demo-link {
						display: flex;
						align-items: center;
						font-family: 'JetBrains Mono', monospace;
						font-size: 0.85rem;
						color: var(--text-main);
						background: var(--bg-code);
						border: 1px solid var(--border);
						padding: 8px 12px;
						border-radius: 6px;
						transition: all 0.2s ease;
					}

					.demo-link:hover {
						background: var(--border);
						color: var(--text-heading);
						border-color: var(--accent);
					}

					.demo-link::before {
						content: "GET";
						font-size: 0.65rem;
						background: #22c55e;
						/* Green */
						color: #000;
						padding: 2px 6px;
						border-radius: 10px;
						margin-right: 10px;
						font-weight: 700;
					}
				</style>
			</head>

			<body>
				<div class="header">
					<h1>Honeypot</h1>
					<p>Serverless Edge Security & Deception System</p>
				</div>

				<div class="layout-grid">

					<!-- Left Column: Setup Guide -->
					<div class="card col-setup">
						<h2>🔧 Configuration & Setup</h2>

						<div class="step">
							<div class="step-title"><span class="step-number">1</span> Clone & Install</div>
							<p>Download the repository and install dependencies.</p>
							<pre><code>git clone https://github.com/SecH0us3/honeypot.git
			cd honeypot
			npm i</code></pre>
						</div>

						<div class="step">
							<div class="step-title"><span class="step-number">2</span> Deploy to Cloudflare</div>
							<p>Deploy the worker to Cloudflare's edge network using Wrangler.</p>
							<pre><code>npx wrangler deploy</code></pre>
						</div>

						<div class="step">
							<div class="step-title"><span class="step-number">3</span> Mint API Tokens</div>
							<p><a href="https://dash.cloudflare.com/" target="_blank">Go to your Cloudflare Dashboard</a> and create
								an API Token. You will need the following permissions to
								manage IP Lists automatically:</p>
							<ul>
								<li><code>Account Filter Lists : Edit</code></li>
								<li><code>Zone : Read</code></li>
							</ul>
							<img src="/token-demo.png" alt="Cloudflare API Token Creation Demo"
								style="max-width: 100%; height: auto; border: 1px solid var(--border); border-radius: var(--border-radius); margin-top: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />
						</div>

						<div class="step">
							<div class="step-title"><span class="step-number">4</span> Initialize Config</div>
							<p>Navigate to your worker's live URL (e.g., <code>https://your-worker.workers.dev/install</code>).
								Paste your generated API token, your Zone ID, and select the behavior mode. The worker will
								automatically create an IP List named <code>honeypot_ips</code>.</p>
						</div>

						<div class="step">
							<div class="step-title"><span class="step-number">5</span> Configure WAF Rule</div>
							<p>Return to the Cloudflare Dashboard: <strong>Security -> WAF -> Custom rules</strong>. Create a new
								rule using the newly managed list:</p>
							<pre><code>Field: IP Source Address
			Operator: is in list
			Value: honeypot_ips

			Action: Managed Challenge (or Block)</code></pre>
						</div>
					</div>

					<!-- Middle Column: Project Description -->
					<div class="card col-desc">
						<h2>🎯 Purpose & Architecture</h2>

						<div class="goal-highlight">
							<strong>Objective:</strong> Deploy an intelligent edge-level trap that simulates vulnerable
							infrastructure, absorbs scanning attempts, and automatically banishes attackers from your entire network
							using Cloudflare IP Lists.
						</div>

						<h3>Detailed Overview</h3>
						<p>Modern web infrastructure is constantly probed by automated scanners, botnets, and script kiddies
							searching for exposed <code>.git</code> directories, \`.env\` files, or vulnerable admin panels. This
							Honeypot is designed to intercept these probes directly at the CDN Edge before they ever reach your
							origin servers.</p>

						<p>Instead of merely blocking the scanner, the Honeypot deceives it. It dynamically generates
							hyper-realistic fake responses—such as artificial Terraform state files, populated OpenAPI schemas, or
							convincing SQL dumps. This wastes the attacker's computational resources and provides rich telemetry on
							their attack patterns.</p>

						<h3>Key Mechanisms</h3>
						<ul>
							<li><strong>Active Defense Integration:</strong> When an attacker trips a wire, the Honeypot uses the
								Cloudflare API to add their IP directly into an Account-level Custom List
								(<code>honeypot_ips</code>).</li>
							<li><strong>TTL Cleanup:</strong> A lightweight Cron trigger runs directly on the Worker, automatically
								purging IPs older than 3 hours to prevent list exhaustion and avoid permanent lockouts for dynamic
								IP addresses.</li>
							<li><strong>Behavior Modes:</strong> Choose between "Ghost Mode" (returning empty 200/404 responses
								while secretly blocking the IP) or "Deception Mode" (serving dynamic fake payloads).</li>
							<li><strong>Realistic Latency:</strong> In deception mode, artificial latency is injected. Random
								response delays mimic the time it would take a real backend server to generate an SQL dump or
								compress an archive.</li>
						</ul>

						<h3>Tech Stack</h3>
						<div class="tech-stack">
							<span class="tech-tag">TypeScript</span>
							<span class="tech-tag">Cloudflare Workers</span>
							<span class="tech-tag">CF KV Storage</span>
							<span class="tech-tag">CF Custom Lists</span>
							<span class="tech-tag">WAF Rules</span>
						</div>
					</div>

					<!-- Right Column: Demo Links -->
					<div class="card col-demo">
						<h2>🧪 Demo Traps</h2>

						<p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 20px;">Test endpoints that trigger
							simulated payloads.</p>

						<div class="demo-group">
							<h4>Git / DevOps Hooks</h4>
							<ul class="demo-list">
								<li><a href="/.git/config" target="_blank" class="demo-link">/.git/config</a></li>
								<li><a href="/.git/HEAD" target="_blank" class="demo-link">/.git/HEAD</a></li>
								<li><a href="/.env" target="_blank" class="demo-link">/.env</a></li>
								<li><a href="/.env.production" target="_blank" class="demo-link">/.env.production</a></li>
								<li><a href="/docker-compose.yml" target="_blank" class="demo-link">/docker-compose.yml</a></li>
								<li><a href="/.aws/config" target="_blank" class="demo-link">/.aws/config</a></li>
								<li><a href="/.aws/credentials" target="_blank" class="demo-link">/.aws/credentials</a></li>
							</ul>
						</div>

						<div class="demo-group">
							<h4>Admin & Configs</h4>
							<ul class="demo-list">
								<li><a href="/wp-config.php" target="_blank" class="demo-link">/wp-config.php</a></li>
								<li><a href="/wp-admin/" target="_blank" class="demo-link">/wp-admin/</a></li>
								<li><a href="/admin/" target="_blank" class="demo-link">/admin/</a></li>
								<li><a href="/phpmyadmin/" target="_blank" class="demo-link">/phpmyadmin/</a></li>
								<li><a href="/config.php" target="_blank" class="demo-link">/config.php</a></li>
								<li><a href="/settings.php" target="_blank" class="demo-link">/settings.php</a></li>
							</ul>
						</div>

						<div class="demo-group">
							<h4>Backups & Archives</h4>
							<ul class="demo-list">
								<li><a href="/backup.sql" target="_blank" class="demo-link">/backup.sql</a></li>
								<li><a href="/backup.zip" target="_blank" class="demo-link">/backup.zip</a></li>
								<li><a href="/users.csv" target="_blank" class="demo-link">/users.csv</a></li>
								<li><a href="/database.bak" target="_blank" class="demo-link">/database.bak</a></li>
								<li><a href="/source.zip" target="_blank" class="demo-link">/source.zip</a></li>
								<li><a href="/export.tar" target="_blank" class="demo-link">/export.tar</a></li>
							</ul>
						</div>

						<div class="demo-group">
							<h4>API Interfaces</h4>
							<ul class="demo-list">
								<li><a href="/swagger.json" target="_blank" class="demo-link">/swagger.json</a></li>
								<li><a href="/openapi.json" target="_blank" class="demo-link">/openapi.json</a></li>
								<li><a href="/graphql" target="_blank" class="demo-link">/graphql</a></li>
								<li><a href="/api-docs/" target="_blank" class="demo-link">/api-docs/</a></li>
								<li><a href="/api/v1/users" target="_blank" class="demo-link">/api/v1/users</a></li>
							</ul>
						</div>
					</div>

				</div>
			</body>

			</html>"
		`);
	});

	it('responds with Hello World! (integration style)', async () => {
		const response = await SELF.fetch('https://example.com');
		expect(await response.text()).toMatchInlineSnapshot(`
			"<!doctype html>
			<html lang="en">

			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Honeypot - Edge Security System</title>
				<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
				<link rel="preconnect" href="https://fonts.googleapis.com">
				<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
				<link
					href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
					rel="stylesheet">
				<style>
					:root {
						--bg-base: #0f172a;
						/* Slate 900 */
						--bg-card: #1e293b;
						/* Slate 800 */
						--bg-code: #020617;
						/* Slate 950 */
						--border: #334155;
						/* Slate 700 */
						--text-main: #cbd5e1;
						/* Slate 300 */
						--text-muted: #94a3b8;
						/* Slate 400 */
						--text-heading: #f8fafc;
						/* Slate 50 */
						--accent: #38bdf8;
						/* Light Blue 400 */
						--accent-hover: #0ea5e9;
						/* Light Blue 500 */
						--border-radius: 8px;
					}

					* {
						box-sizing: border-box;
						margin: 0;
						padding: 0;
					}

					body {
						font-family: 'Inter', -apple-system, sans-serif;
						background-color: var(--bg-base);
						color: var(--text-main);
						line-height: 1.6;
						padding: 40px 20px;
					}

					.header {
						text-align: center;
						margin-bottom: 40px;
					}

					.header h1 {
						color: var(--text-heading);
						font-size: 2.5rem;
						font-weight: 700;
						letter-spacing: -0.025em;
						margin-bottom: 10px;
					}

					.header p {
						color: var(--text-muted);
						font-size: 1.1rem;
					}

					.layout-grid {
						display: grid;
						grid-template-columns: 1fr 1.6fr 350px;
						/* Left, Middle, Right */
						gap: 40px;
						max-width: 1550px;
						margin: 0 auto;
						align-items: start;
					}

					@media (max-width: 1100px) {
						.layout-grid {
							grid-template-columns: 1fr 1fr;
						}

						.col-demo {
							grid-column: 1 / -1;
						}
					}

					@media (max-width: 768px) {
						.layout-grid {
							grid-template-columns: 1fr;
						}
					}

					.card {
						background: var(--bg-card);
						border: 1px solid var(--border);
						border-radius: var(--border-radius);
						padding: 25px;
						box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
					}

					.card h2 {
						color: var(--text-heading);
						font-size: 1.25rem;
						font-weight: 600;
						border-bottom: 1px solid var(--border);
						padding-bottom: 12px;
						margin-bottom: 20px;
						display: flex;
						align-items: center;
						gap: 10px;
					}

					.card h3 {
						color: var(--text-heading);
						font-size: 1.1rem;
						font-weight: 600;
						margin: 24px 0 12px;
					}

					p {
						margin-bottom: 16px;
					}

					a {
						color: var(--accent);
						text-decoration: none;
						transition: color 0.15s ease;
					}

					a:hover {
						color: var(--accent-hover);
						text-decoration: underline;
					}

					code {
						font-family: 'JetBrains Mono', monospace;
						background: var(--bg-code);
						border: 1px solid var(--border);
						padding: 2px 6px;
						border-radius: 4px;
						font-size: 0.85em;
						color: #e2e8f0;
					}

					pre {
						background: var(--bg-code);
						border: 1px solid var(--border);
						padding: 16px;
						border-radius: var(--border-radius);
						overflow-x: auto;
						margin-bottom: 20px;
					}

					pre code {
						background: transparent;
						border: none;
						padding: 0;
						color: #e2e8f0;
						font-size: 0.85em;
					}

					/* Left Column Specifics */
					.step {
						margin-bottom: 24px;
						position: relative;
					}

					.step-title {
						display: flex;
						align-items: center;
						margin-bottom: 10px;
						color: var(--text-heading);
						font-weight: 500;
					}

					.step-number {
						background: var(--accent);
						color: var(--bg-base);
						width: 22px;
						height: 22px;
						display: inline-flex;
						align-items: center;
						justify-content: center;
						border-radius: 50%;
						font-size: 0.75rem;
						font-weight: 700;
						margin-right: 12px;
						flex-shrink: 0;
					}

					.step p {
						padding-left: 34px;
						margin-bottom: 10px;
						font-size: 0.95rem;
						color: var(--text-muted);
					}

					.step pre {
						margin-left: 34px;
					}

					/* Middle Column Specifics */
					.goal-highlight {
						background: rgba(56, 189, 248, 0.1);
						border-left: 4px solid var(--accent);
						padding: 16px 20px;
						border-radius: 0 var(--border-radius) var(--border-radius) 0;
						margin-bottom: 30px;
						font-size: 1.05rem;
					}

					ul {
						padding-left: 20px;
						margin-bottom: 20px;
					}

					ul li {
						margin-bottom: 8px;
					}

					.tech-stack {
						display: flex;
						flex-wrap: wrap;
						gap: 8px;
						margin-top: 15px;
					}

					.tech-tag {
						background: var(--bg-code);
						border: 1px solid var(--border);
						color: var(--text-muted);
						padding: 6px 12px;
						border-radius: 20px;
						font-size: 0.8rem;
						font-family: 'JetBrains Mono', monospace;
					}

					/* Right Column Specifics */
					.demo-group {
						margin-bottom: 25px;
					}

					.demo-group:last-child {
						margin-bottom: 0;
					}

					.demo-group h4 {
						color: var(--text-muted);
						font-size: 0.85rem;
						text-transform: uppercase;
						letter-spacing: 0.05em;
						margin-bottom: 10px;
					}

					.demo-list {
						list-style: none;
						padding: 0;
						margin: 0;
					}

					.demo-list li {
						margin-bottom: 6px;
					}

					.demo-link {
						display: flex;
						align-items: center;
						font-family: 'JetBrains Mono', monospace;
						font-size: 0.85rem;
						color: var(--text-main);
						background: var(--bg-code);
						border: 1px solid var(--border);
						padding: 8px 12px;
						border-radius: 6px;
						transition: all 0.2s ease;
					}

					.demo-link:hover {
						background: var(--border);
						color: var(--text-heading);
						border-color: var(--accent);
					}

					.demo-link::before {
						content: "GET";
						font-size: 0.65rem;
						background: #22c55e;
						/* Green */
						color: #000;
						padding: 2px 6px;
						border-radius: 10px;
						margin-right: 10px;
						font-weight: 700;
					}
				</style>
			</head>

			<body>
				<div class="header">
					<h1>Honeypot</h1>
					<p>Serverless Edge Security & Deception System</p>
				</div>

				<div class="layout-grid">

					<!-- Left Column: Setup Guide -->
					<div class="card col-setup">
						<h2>🔧 Configuration & Setup</h2>

						<div class="step">
							<div class="step-title"><span class="step-number">1</span> Clone & Install</div>
							<p>Download the repository and install dependencies.</p>
							<pre><code>git clone https://github.com/SecH0us3/honeypot.git
			cd honeypot
			npm i</code></pre>
						</div>

						<div class="step">
							<div class="step-title"><span class="step-number">2</span> Deploy to Cloudflare</div>
							<p>Deploy the worker to Cloudflare's edge network using Wrangler.</p>
							<pre><code>npx wrangler deploy</code></pre>
						</div>

						<div class="step">
							<div class="step-title"><span class="step-number">3</span> Mint API Tokens</div>
							<p><a href="https://dash.cloudflare.com/" target="_blank">Go to your Cloudflare Dashboard</a> and create
								an API Token. You will need the following permissions to
								manage IP Lists automatically:</p>
							<ul>
								<li><code>Account Filter Lists : Edit</code></li>
								<li><code>Zone : Read</code></li>
							</ul>
							<img src="/token-demo.png" alt="Cloudflare API Token Creation Demo"
								style="max-width: 100%; height: auto; border: 1px solid var(--border); border-radius: var(--border-radius); margin-top: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />
						</div>

						<div class="step">
							<div class="step-title"><span class="step-number">4</span> Initialize Config</div>
							<p>Navigate to your worker's live URL (e.g., <code>https://your-worker.workers.dev/install</code>).
								Paste your generated API token, your Zone ID, and select the behavior mode. The worker will
								automatically create an IP List named <code>honeypot_ips</code>.</p>
						</div>

						<div class="step">
							<div class="step-title"><span class="step-number">5</span> Configure WAF Rule</div>
							<p>Return to the Cloudflare Dashboard: <strong>Security -> WAF -> Custom rules</strong>. Create a new
								rule using the newly managed list:</p>
							<pre><code>Field: IP Source Address
			Operator: is in list
			Value: honeypot_ips

			Action: Managed Challenge (or Block)</code></pre>
						</div>
					</div>

					<!-- Middle Column: Project Description -->
					<div class="card col-desc">
						<h2>🎯 Purpose & Architecture</h2>

						<div class="goal-highlight">
							<strong>Objective:</strong> Deploy an intelligent edge-level trap that simulates vulnerable
							infrastructure, absorbs scanning attempts, and automatically banishes attackers from your entire network
							using Cloudflare IP Lists.
						</div>

						<h3>Detailed Overview</h3>
						<p>Modern web infrastructure is constantly probed by automated scanners, botnets, and script kiddies
							searching for exposed <code>.git</code> directories, \`.env\` files, or vulnerable admin panels. This
							Honeypot is designed to intercept these probes directly at the CDN Edge before they ever reach your
							origin servers.</p>

						<p>Instead of merely blocking the scanner, the Honeypot deceives it. It dynamically generates
							hyper-realistic fake responses—such as artificial Terraform state files, populated OpenAPI schemas, or
							convincing SQL dumps. This wastes the attacker's computational resources and provides rich telemetry on
							their attack patterns.</p>

						<h3>Key Mechanisms</h3>
						<ul>
							<li><strong>Active Defense Integration:</strong> When an attacker trips a wire, the Honeypot uses the
								Cloudflare API to add their IP directly into an Account-level Custom List
								(<code>honeypot_ips</code>).</li>
							<li><strong>TTL Cleanup:</strong> A lightweight Cron trigger runs directly on the Worker, automatically
								purging IPs older than 3 hours to prevent list exhaustion and avoid permanent lockouts for dynamic
								IP addresses.</li>
							<li><strong>Behavior Modes:</strong> Choose between "Ghost Mode" (returning empty 200/404 responses
								while secretly blocking the IP) or "Deception Mode" (serving dynamic fake payloads).</li>
							<li><strong>Realistic Latency:</strong> In deception mode, artificial latency is injected. Random
								response delays mimic the time it would take a real backend server to generate an SQL dump or
								compress an archive.</li>
						</ul>

						<h3>Tech Stack</h3>
						<div class="tech-stack">
							<span class="tech-tag">TypeScript</span>
							<span class="tech-tag">Cloudflare Workers</span>
							<span class="tech-tag">CF KV Storage</span>
							<span class="tech-tag">CF Custom Lists</span>
							<span class="tech-tag">WAF Rules</span>
						</div>
					</div>

					<!-- Right Column: Demo Links -->
					<div class="card col-demo">
						<h2>🧪 Demo Traps</h2>

						<p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 20px;">Test endpoints that trigger
							simulated payloads.</p>

						<div class="demo-group">
							<h4>Git / DevOps Hooks</h4>
							<ul class="demo-list">
								<li><a href="/.git/config" target="_blank" class="demo-link">/.git/config</a></li>
								<li><a href="/.git/HEAD" target="_blank" class="demo-link">/.git/HEAD</a></li>
								<li><a href="/.env" target="_blank" class="demo-link">/.env</a></li>
								<li><a href="/.env.production" target="_blank" class="demo-link">/.env.production</a></li>
								<li><a href="/docker-compose.yml" target="_blank" class="demo-link">/docker-compose.yml</a></li>
								<li><a href="/.aws/config" target="_blank" class="demo-link">/.aws/config</a></li>
								<li><a href="/.aws/credentials" target="_blank" class="demo-link">/.aws/credentials</a></li>
							</ul>
						</div>

						<div class="demo-group">
							<h4>Admin & Configs</h4>
							<ul class="demo-list">
								<li><a href="/wp-config.php" target="_blank" class="demo-link">/wp-config.php</a></li>
								<li><a href="/wp-admin/" target="_blank" class="demo-link">/wp-admin/</a></li>
								<li><a href="/admin/" target="_blank" class="demo-link">/admin/</a></li>
								<li><a href="/phpmyadmin/" target="_blank" class="demo-link">/phpmyadmin/</a></li>
								<li><a href="/config.php" target="_blank" class="demo-link">/config.php</a></li>
								<li><a href="/settings.php" target="_blank" class="demo-link">/settings.php</a></li>
							</ul>
						</div>

						<div class="demo-group">
							<h4>Backups & Archives</h4>
							<ul class="demo-list">
								<li><a href="/backup.sql" target="_blank" class="demo-link">/backup.sql</a></li>
								<li><a href="/backup.zip" target="_blank" class="demo-link">/backup.zip</a></li>
								<li><a href="/users.csv" target="_blank" class="demo-link">/users.csv</a></li>
								<li><a href="/database.bak" target="_blank" class="demo-link">/database.bak</a></li>
								<li><a href="/source.zip" target="_blank" class="demo-link">/source.zip</a></li>
								<li><a href="/export.tar" target="_blank" class="demo-link">/export.tar</a></li>
							</ul>
						</div>

						<div class="demo-group">
							<h4>API Interfaces</h4>
							<ul class="demo-list">
								<li><a href="/swagger.json" target="_blank" class="demo-link">/swagger.json</a></li>
								<li><a href="/openapi.json" target="_blank" class="demo-link">/openapi.json</a></li>
								<li><a href="/graphql" target="_blank" class="demo-link">/graphql</a></li>
								<li><a href="/api-docs/" target="_blank" class="demo-link">/api-docs/</a></li>
								<li><a href="/api/v1/users" target="_blank" class="demo-link">/api/v1/users</a></li>
							</ul>
						</div>
					</div>

				</div>
			</body>

			</html>"
		`);
	});
});
