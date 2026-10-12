import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src/index';

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe('Honeypot worker', () => {
	it('serves the homepage (unit style)', async () => {
		const request = new IncomingRequest('http://example.com');
		// Create an empty context to pass to `worker.fetch()`.
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env as Env, ctx);
		// Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(200);
		expect(await response.text()).toContain('<title>Cloudflare Honeypot');
	});

	it('serves the homepage (integration style)', async () => {
		const response = await SELF.fetch('https://example.com');
		expect(response.status).toBe(200);
		expect(await response.text()).toContain('<title>Cloudflare Honeypot');
	});

	it('serves fake content for a honeypot path', async () => {
		const request = new IncomingRequest('http://example.com/.env');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env as Env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(200);
		expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
		expect((await response.text()).length).toBeGreaterThan(0);
	});

	it('routes /install to the install page', async () => {
		const request = new IncomingRequest('http://example.com/install');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env as Env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(200);
		expect(await response.text()).toContain('Honeypot Setup');
	});
});
