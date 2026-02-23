import { describe, it, expect, vi, beforeEach } from 'vitest';
import { blockIpInWaf } from '../src/wafService';

// Mock fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('wafService', () => {
    const env = {
        CF_API_TOKEN: 'fake-token',
        CF_ZONE_ID: 'fake-zone-id',
    };

    beforeEach(() => {
        fetchMock.mockReset();
    });

    it('should create a new rule if it does not exist', async () => {
        // Mock finding rule (returns empty list)
        fetchMock.mockResolvedValueOnce({
            json: async () => ({ success: true, result: [] }),
        });

        // Mock creating filter
        fetchMock.mockResolvedValueOnce({
            json: async () => ({ success: true, result: [{ id: 'new-filter-id' }] }),
        });

        // Mock creating rule
        fetchMock.mockResolvedValueOnce({
            json: async () => ({ success: true, result: [{ id: 'new-rule-id' }] }),
        });

        await blockIpInWaf('1.2.3.4', env);

        expect(fetchMock).toHaveBeenCalledTimes(3);
        // Check create filter call
        expect(fetchMock.mock.calls[1][1].method).toBe('POST');
        expect(JSON.parse(fetchMock.mock.calls[1][1].body)[0].expression).toBe('ip.src in {1.2.3.4}');
    });

    it('should update existing rule if it exists', async () => {
        // Mock finding rule (returns existing rule)
        fetchMock.mockResolvedValueOnce({
            json: async () => ({
                success: true,
                result: [{
                    id: 'existing-rule-id',
                    filter: {
                        id: 'existing-filter-id',
                        expression: 'ip.src in {5.6.7.8}',
                    },
                }],
            }),
        });

        // Mock updating filter
        fetchMock.mockResolvedValueOnce({
            json: async () => ({ success: true, result: {} }),
        });

        await blockIpInWaf('1.2.3.4', env);

        expect(fetchMock).toHaveBeenCalledTimes(2);
        // Check update filter call
        expect(fetchMock.mock.calls[1][1].method).toBe('PUT');
        const body = JSON.parse(fetchMock.mock.calls[1][1].body);
        expect(body.id).toBe('existing-filter-id');
        expect(body.expression).toContain('1.2.3.4');
        expect(body.expression).toContain('5.6.7.8');
    });

    it('should not update if IP is already blocked', async () => {
        // Mock finding rule (returns existing rule with IP)
        fetchMock.mockResolvedValueOnce({
            json: async () => ({
                success: true,
                result: [{
                    id: 'existing-rule-id',
                    filter: {
                        id: 'existing-filter-id',
                        expression: 'ip.src in {1.2.3.4 5.6.7.8}',
                    },
                }],
            }),
        });

        await blockIpInWaf('1.2.3.4', env);

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});
