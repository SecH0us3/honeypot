import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addIpToList, cleanupOldIps } from '../src/wafService';

// Mock fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('wafService', () => {
    const env = {
        CF_API_TOKEN: 'fake-token',
        CF_ACCOUNT_ID: 'fake-account-id',
        CF_LIST_ID: 'fake-list-id',
    };

    beforeEach(() => {
        fetchMock.mockReset();
    });

    describe('addIpToList', () => {
        it('should add an IP to the list', async () => {
            fetchMock.mockResolvedValueOnce({
                json: async () => ({ success: true, result: {} }),
            });

            await addIpToList('1.2.3.4', 'Test Reason', env);

            expect(fetchMock).toHaveBeenCalledTimes(1);
            const call = fetchMock.mock.calls[0];
            expect(call[0]).toContain('/accounts/fake-account-id/rules/lists/fake-list-id/items');
            expect(call[1].method).toBe('POST');
            const body = JSON.parse(call[1].body);
            expect(body[0].ip).toBe('1.2.3.4');
            expect(body[0].comment).toContain('Test Reason');
        });

        it('should handle failure when IP is already in list', async () => {
            fetchMock.mockResolvedValueOnce({
                json: async () => ({ success: false, errors: [{ message: 'Duplicate IP' }] }),
            });

            // Should not throw
            await addIpToList('1.2.3.4', 'Reason', env);
            expect(fetchMock).toHaveBeenCalledTimes(1);
        });
    });

    describe('cleanupOldIps', () => {
        it('should delete IPs older than 3 hours', async () => {
            const now = new Date();
            const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString();
            const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString();

            // Mock fetch list items
            fetchMock.mockResolvedValueOnce({
                json: async () => ({
                    success: true,
                    result: [
                        { id: 'id-old', ip: '1.1.1.1', created_on: fourHoursAgo },
                        { id: 'id-new', ip: '2.2.2.2', created_on: oneHourAgo },
                    ],
                }),
            });

            // Mock delete call
            fetchMock.mockResolvedValueOnce({
                json: async () => ({ success: true, result: {} }),
            });

            await cleanupOldIps(env);

            expect(fetchMock).toHaveBeenCalledTimes(2);
            // Verify delete call
            const deleteCall = fetchMock.mock.calls[1];
            expect(deleteCall[1].method).toBe('DELETE');
            const body = JSON.parse(deleteCall[1].body);
            expect(body.items).toHaveLength(1);
            expect(body.items[0].id).toBe('id-old');
        });

        it('should do nothing if no old IPs are found', async () => {
            const now = new Date();
            const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString();

            fetchMock.mockResolvedValueOnce({
                json: async () => ({
                    success: true,
                    result: [
                        { id: 'id-new', ip: '2.2.2.2', created_on: oneHourAgo },
                    ],
                }),
            });

            await cleanupOldIps(env);

            expect(fetchMock).toHaveBeenCalledTimes(1);
        });
    });
});
