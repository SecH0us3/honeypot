import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleInstallRequest } from '../src/install';

// Mock fetch
const fetchMock = vi.fn();
globalThis.fetch = fetchMock;

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
        // No list creation call
        const listCreation = fetchMock.mock.calls.find(
            ([url, init]) => String(url).endsWith('/rules/lists') && init?.method === 'POST'
        );
        expect(listCreation).toBeUndefined();
    });

    describe('when already configured', () => {
        const postInstall = (url: string) => {
            const formData = new FormData();
            formData.append('token', 'attacker-token');
            formData.append('zoneId', 'attacker-zone');
            return handleInstallRequest(new Request(url, { method: 'POST', body: formData }), env);
        };

        beforeEach(() => {
            kvStore['CF_API_TOKEN'] = 'stored-token';
            kvStore['CF_ZONE_ID'] = 'stored-zone';
        });

        it('GET should not render the form', async () => {
            const response = await handleInstallRequest(new Request('http://localhost/install'), env);

            const text = await response.text();
            expect(text).toContain('System Configured');
            expect(text).not.toContain('Honeypot Behavior');
        });

        it('POST should be rejected and leave the config untouched', async () => {
            const response = await postInstall('http://localhost/install');

            expect(response.status).toBe(403);
            expect(fetchMock).not.toHaveBeenCalled();
            expect(env.HONEYPOT_CONFIG.put).not.toHaveBeenCalled();
            expect(kvStore['CF_API_TOKEN']).toBe('stored-token');
        });

        it('POST should be rejected when REINSTALL_KEY is not set', async () => {
            const response = await postInstall('http://localhost/install?reinstall=');

            expect(response.status).toBe(403);
            expect(kvStore['CF_API_TOKEN']).toBe('stored-token');
        });

        it('POST should be rejected with a wrong reinstall key', async () => {
            env.REINSTALL_KEY = 'correct-key';

            const response = await postInstall('http://localhost/install?reinstall=wrong-key');

            expect(response.status).toBe(403);
            expect(kvStore['CF_API_TOKEN']).toBe('stored-token');
        });

        it('POST should be accepted with the correct reinstall key', async () => {
            env.REINSTALL_KEY = 'correct-key';
            fetchMock.mockResolvedValueOnce({
                json: async () => ({ success: true, result: { account: { id: 'mock-account-id' } } }),
            });
            fetchMock.mockResolvedValueOnce({
                json: async () => ({ success: true, result: [{ name: 'honeypot_ips', id: 'existing-list-id' }] }),
            });

            const response = await postInstall('http://localhost/install?reinstall=correct-key');

            expect(response.status).toBe(200);
            expect(kvStore['CF_API_TOKEN']).toBe('attacker-token');
        });
    });
});
