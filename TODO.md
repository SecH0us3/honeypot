# Honeypot Development TODO

## Proposed Improvements & Ideas

- [ ] **Session Consistency**: Bind the `Server` and `X-Powered-By` headers to the attacker's IP (via hashing) to ensure they see consistent infrastructure across multiple requests.
- [ ] **POST Request Logging**: Capture and store the body of POST requests (or high-value parts) in Cloudflare KV or send via Webhook to analyze attack vectors and exploit payloads.
- [ ] **Cleanup Pagination**: Implement a pagination loop in `cleanupOldIps` to ensure the entire Cloudflare IP List is scanned and cleaned, even if it exceeds the 1000-item API limit.
- [ ] **Interactive Traps**: Create "infinite" or interactive endpoints (e.g., `/admin/logs`) that stream endless random data to exhaust scanner resources.
- [ ] **Security Dashboard**: Build a protected dashboard for real-time statistics, including blocked IPs, origin countries, and most-triggered honeypot paths.
