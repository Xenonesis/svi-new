import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { offlinePunchQueue, QueuedPunch } from '@/src/lib/attendance/offlinePunchQueue';

describe('OfflinePunchQueue', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
    offlinePunchQueue.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('enqueue and getQueue', () => {
    it('enqueues punch-in with unique ID, timestamp, coords, and pending status', () => {
      const punch = offlinePunchQueue.enqueue({
        type: 'in',
        timestamp: '2026-08-27T09:00:00.000Z',
        coords: { lat: 12.9716, lon: 77.5946 },
      });

      expect(punch).toBeDefined();
      expect(punch.id).toBeTruthy();
      expect(punch.type).toBe('in');
      expect(punch.timestamp).toBe('2026-08-27T09:00:00.000Z');
      expect(punch.coords).toEqual({ lat: 12.9716, lon: 77.5946 });
      expect(punch.status).toBe('pending');

      const queue = offlinePunchQueue.getQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0]).toEqual(punch);
    });

    it('enqueues punch-out with work logs and retrieves from local storage', () => {
      const punchOut = offlinePunchQueue.enqueue({
        type: 'out',
        timestamp: '2026-08-27T17:00:00.000Z',
        coords: { lat: 12.9716, lon: 77.5946 },
        workSummary: 'Inspected 3 field sites and met clients.',
        clientCount: 4,
        visitCount: 3,
      });

      expect(punchOut.type).toBe('out');
      expect(punchOut.workSummary).toBe('Inspected 3 field sites and met clients.');
      expect(punchOut.clientCount).toBe(4);
      expect(punchOut.visitCount).toBe(3);

      const queue = offlinePunchQueue.getQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].workSummary).toBe('Inspected 3 field sites and met clients.');
    });

    it('generates unique IDs for successive punches', () => {
      const p1 = offlinePunchQueue.enqueue({
        type: 'in',
        timestamp: '2026-08-27T09:00:00.000Z',
        coords: { lat: 12.9716, lon: 77.5946 },
      });
      const p2 = offlinePunchQueue.enqueue({
        type: 'out',
        timestamp: '2026-08-27T17:00:00.000Z',
        coords: { lat: 12.9716, lon: 77.5946 },
      });

      expect(p1.id).not.toBe(p2.id);
      expect(offlinePunchQueue.getQueue()).toHaveLength(2);
    });

    it('handles corrupted localStorage gracefully by returning empty queue', () => {
      localStorage.setItem('svi_offline_punch_queue', 'invalid-json{{{');
      expect(offlinePunchQueue.getQueue()).toEqual([]);
    });
  });

  describe('remove and clear', () => {
    it('removes punch by id', () => {
      const p1 = offlinePunchQueue.enqueue({
        type: 'in',
        timestamp: '2026-08-27T09:00:00.000Z',
        coords: { lat: 12.9716, lon: 77.5946 },
      });
      const p2 = offlinePunchQueue.enqueue({
        type: 'out',
        timestamp: '2026-08-27T17:00:00.000Z',
        coords: { lat: 12.9716, lon: 77.5946 },
      });

      expect(offlinePunchQueue.getQueue()).toHaveLength(2);

      offlinePunchQueue.remove(p1.id);
      const queue = offlinePunchQueue.getQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].id).toBe(p2.id);
    });

    it('clears all punches from queue', () => {
      offlinePunchQueue.enqueue({
        type: 'in',
        timestamp: '2026-08-27T09:00:00.000Z',
        coords: { lat: 12.9716, lon: 77.5946 },
      });
      offlinePunchQueue.enqueue({
        type: 'out',
        timestamp: '2026-08-27T17:00:00.000Z',
        coords: { lat: 12.9716, lon: 77.5946 },
      });

      expect(offlinePunchQueue.getQueue()).toHaveLength(2);
      offlinePunchQueue.clear();
      expect(offlinePunchQueue.getQueue()).toHaveLength(0);
    });
  });

  describe('subscribe', () => {
    it('notifies subscribers on enqueue, remove, and clear', () => {
      const subscriber = vi.fn();
      const unsubscribe = offlinePunchQueue.subscribe(subscriber);

      const p1 = offlinePunchQueue.enqueue({
        type: 'in',
        timestamp: '2026-08-27T09:00:00.000Z',
        coords: { lat: 12.9716, lon: 77.5946 },
      });
      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(subscriber).toHaveBeenLastCalledWith(
        expect.arrayContaining([expect.objectContaining({ id: p1.id })])
      );

      offlinePunchQueue.remove(p1.id);
      expect(subscriber).toHaveBeenCalledTimes(2);
      expect(subscriber).toHaveBeenLastCalledWith([]);

      offlinePunchQueue.enqueue({
        type: 'out',
        timestamp: '2026-08-27T17:00:00.000Z',
        coords: { lat: 12.9716, lon: 77.5946 },
      });
      expect(subscriber).toHaveBeenCalledTimes(3);

      offlinePunchQueue.clear();
      expect(subscriber).toHaveBeenCalledTimes(4);
      expect(subscriber).toHaveBeenLastCalledWith([]);

      unsubscribe();
      offlinePunchQueue.enqueue({
        type: 'in',
        timestamp: '2026-08-27T09:00:00.000Z',
        coords: { lat: 12.9716, lon: 77.5946 },
      });
      expect(subscriber).toHaveBeenCalledTimes(4); // No extra calls after unsubscribe
    });
  });

  describe('syncPendingPunches', () => {
    it('successfully syncs punch-in and punch-out, removing items from queue', async () => {
      offlinePunchQueue.enqueue({
        type: 'in',
        timestamp: '2026-08-27T09:00:00.000Z',
        coords: { lat: 12.9716, lon: 77.5946 },
      });
      offlinePunchQueue.enqueue({
        type: 'out',
        timestamp: '2026-08-27T17:00:00.000Z',
        coords: { lat: 12.9716, lon: 77.5946 },
        workSummary: 'Meeting with customers',
        clientCount: 2,
        visitCount: 1,
      });

      const fetchMock = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true, message: 'Punch recorded' }),
        };
      });
      global.fetch = fetchMock;

      const result = await offlinePunchQueue.syncPendingPunches();

      expect(result).toEqual({ synced: 2, failed: 0 });
      expect(fetchMock).toHaveBeenCalledTimes(2);

      // Verify endpoint and payload for punch-in
      expect(fetchMock).toHaveBeenNthCalledWith(
        1,
        '/api/employee/attendance/punch-in',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
          body: expect.stringContaining('"lat":12.9716'),
        })
      );

      // Verify endpoint and payload for punch-out
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        '/api/employee/attendance/punch-out',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
          body: expect.stringContaining('Meeting with customers'),
        })
      );

      // Queue should now be empty because both synced
      expect(offlinePunchQueue.getQueue()).toHaveLength(0);
    });

    it('marks failed punch with error status when API returns error, and allows retry', async () => {
      const punch = offlinePunchQueue.enqueue({
        type: 'in',
        timestamp: '2026-08-27T09:00:00.000Z',
        coords: { lat: 12.9716, lon: 77.5946 },
      });

      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: { message: 'Outside geofence location' } }),
      });
      global.fetch = fetchMock;

      const result = await offlinePunchQueue.syncPendingPunches();

      expect(result).toEqual({ synced: 0, failed: 1 });
      const queue = offlinePunchQueue.getQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].id).toBe(punch.id);
      expect(queue[0].status).toBe('failed');
      expect(queue[0].errorMessage).toContain('Outside geofence location');

      // Now simulate server recovery / retry
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, message: 'Synced successfully' }),
      });

      const retryResult = await offlinePunchQueue.syncPendingPunches();
      expect(retryResult).toEqual({ synced: 1, failed: 0 });
      expect(offlinePunchQueue.getQueue()).toHaveLength(0);
    });

    it('handles network throw / fetch error and keeps punch for next retry', async () => {
      offlinePunchQueue.enqueue({
        type: 'in',
        timestamp: '2026-08-27T09:00:00.000Z',
        coords: { lat: 12.9716, lon: 77.5946 },
      });

      global.fetch = vi.fn().mockRejectedValue(new Error('Network request failed: offline'));

      const result = await offlinePunchQueue.syncPendingPunches();
      expect(result).toEqual({ synced: 0, failed: 1 });

      const queue = offlinePunchQueue.getQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].status).toBe('failed');
      expect(queue[0].errorMessage).toContain('Network request failed: offline');
    });

    it('returns synced: 0, failed: 0 when queue is empty', async () => {
      const result = await offlinePunchQueue.syncPendingPunches();
      expect(result).toEqual({ synced: 0, failed: 0 });
    });

    it('prevents concurrent syncs and returns 0, 0 for second caller', async () => {
      offlinePunchQueue.enqueue({
        type: 'in',
        timestamp: '2026-08-27T09:00:00.000Z',
        coords: { lat: 12.9716, lon: 77.5946 },
      });

      let resolveFetch!: (val: unknown) => void;
      global.fetch = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          resolveFetch = resolve;
        });
      });

      const syncPromise1 = offlinePunchQueue.syncPendingPunches();
      const syncPromise2 = offlinePunchQueue.syncPendingPunches();

      // Second one immediately returns because first is in progress
      const result2 = await syncPromise2;
      expect(result2).toEqual({ synced: 0, failed: 0 });

      resolveFetch({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      const result1 = await syncPromise1;
      expect(result1).toEqual({ synced: 1, failed: 0 });
    });

    it('handles string error in API response payload', async () => {
      offlinePunchQueue.enqueue({
        type: 'in',
        timestamp: '2026-08-27T09:00:00.000Z',
        coords: { lat: 12.9716, lon: 77.5946 },
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Punch window closed' }),
      });

      const result = await offlinePunchQueue.syncPendingPunches();
      expect(result).toEqual({ synced: 0, failed: 1 });
      expect(offlinePunchQueue.getQueue()[0].errorMessage).toBe('Punch window closed');
    });

    it('triggers sync on window online event', async () => {
      offlinePunchQueue.enqueue({
        type: 'in',
        timestamp: '2026-08-27T09:00:00.000Z',
        coords: { lat: 12.9716, lon: 77.5946 },
      });

      const syncSpy = vi.spyOn(offlinePunchQueue, 'syncPendingPunches');
      window.dispatchEvent(new Event('online'));

      expect(syncSpy).toHaveBeenCalled();
    });
  });
});
