import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleInstallRequest } from '../src/install';

// Mock fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('Install Page', () => {
    let env: any;
    let kvStore: Record<string, string>;

    beforeEach(() => {
        fetchMock.mockReset();
        kvStore = {};
        env = {
            HONEYPOT_CONFIG: {
                get: vi.fn((key: string) => Promise.resolve(kvStore[key] || null)),
                put: vi.fn((key: string, value: string) => {
                    kvStore[key] = value;
                    return Promise.resolve();
                }),
            },
        };
    });

    it('GET should render form if not configured', async () => {
        const request = new Request('http://localhost/install', { method: 'GET' });
        const response = await handleInstallRequest(request, env);

        expect(response.status).toBe(200);
        const text = await response.text();
        expect(text).toContain('Honeypot Setup');
        expect(text).toContain('<form method="POST">');
    });

    it('GET should render success message if configured', async () => {
        kvStore['CF_API_TOKEN'] = 'existing-token';
        kvStore['CF_ZONE_ID'] = 'existing-zone';

        const request = new Request('http://localhost/install', { method: 'GET' });
        const response = await handleInstallRequest(request, env);

        expect(response.status).toBe(200);
        const text = await response.text();
        expect(text).toContain('System Configured');
        expect(text).not.toContain('<form');
    });

    it('POST should validate token and save config', async () => {
        // Mock successful validation
        fetchMock.mockResolvedValueOnce({
            json: async () => ({ success: true }),
        });

        const formData = new FormData();
        formData.append('token', 'valid-token');
        formData.append('zoneId', 'valid-zone');

        const request = new Request('http://localhost/install', {
            method: 'POST',
            body: formData,
        });

        const response = await handleInstallRequest(request, env);

        expect(response.status).toBe(200);
        expect(env.HONEYPOT_CONFIG.put).toHaveBeenCalledWith('CF_API_TOKEN', 'valid-token');
        expect(env.HONEYPOT_CONFIG.put).toHaveBeenCalledWith('CF_ZONE_ID', 'valid-zone');
    });

    it('POST should reject invalid token', async () => {
        // Mock failed validation
        fetchMock.mockResolvedValueOnce({
            json: async () => ({ success: false }),
        });

        const formData = new FormData();
        formData.append('token', 'invalid-token');
        formData.append('zoneId', 'valid-zone');

        const request = new Request('http://localhost/install', {
            method: 'POST',
            body: formData,
        });

        const response = await handleInstallRequest(request, env);

        expect(response.status).toBe(400);
        expect(await response.text()).toContain('Validation Failed');
        expect(env.HONEYPOT_CONFIG.put).not.toHaveBeenCalled();
    });
});
