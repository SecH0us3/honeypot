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
        expect(text).toContain('Honeypot Behavior');
    });

    it('POST should validate, create list, and save config', async () => {
        // Mock 1: Zone check (returns account ID)
        fetchMock.mockResolvedValueOnce({
            json: async () => ({
                success: true,
                result: { account: { id: 'mock-account-id' } }
            }),
        });

        // Mock 2: List search (empty)
        fetchMock.mockResolvedValueOnce({
            json: async () => ({ success: true, result: [] }),
        });

        // Mock 3: List creation
        fetchMock.mockResolvedValueOnce({
            json: async () => ({
                success: true,
                result: { id: 'mock-list-id' }
            }),
        });

        const formData = new FormData();
        formData.append('token', 'valid-token');
        formData.append('zoneId', 'valid-zone');
        formData.append('behavior', 'empty_page');

        const request = new Request('http://localhost/install', {
            method: 'POST',
            body: formData,
        });

        const response = await handleInstallRequest(request, env);

        expect(response.status).toBe(200);
        expect(kvStore['CF_API_TOKEN']).toBe('valid-token');
        expect(kvStore['CF_ACCOUNT_ID']).toBe('mock-account-id');
        expect(kvStore['CF_LIST_ID']).toBe('mock-list-id');
        expect(kvStore['BEHAVIOR_MODE']).toBe('empty_page');
    });

    it('POST should handle existing list', async () => {
        fetchMock.mockResolvedValueOnce({
            json: async () => ({
                success: true,
                result: { account: { id: 'mock-account-id' } }
            }),
        });

        // List search (returns existing list)
        fetchMock.mockResolvedValueOnce({
            json: async () => ({
                success: true,
                result: [{ name: 'honeypot_ips', id: 'existing-list-id' }]
            }),
        });

        const formData = new FormData();
        formData.append('token', 'valid-token');
        formData.append('zoneId', 'valid-zone');

        const request = new Request('http://localhost/install', {
            method: 'POST',
            body: formData,
        });

        await handleInstallRequest(request, env);

        expect(kvStore['CF_LIST_ID']).toBe('existing-list-id');
        expect(fetchMock).toHaveBeenCalledTimes(2); // No creation call
    });
});
