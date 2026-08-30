'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Plus, Trash2, MapIcon, Search, AlertCircle } from 'lucide-react';
import { getDeviceCoordinates } from '@/src/lib/location/geolocationService';
import type { GeofenceLocation } from '@/src/lib/supabase/types';

interface LocationManagerProps {
  token: string;
  showToast: (type: 'success' | 'error', msg: string) => void;
}

export default function LocationManager({ token, showToast }: LocationManagerProps) {
  const [locations, setLocations] = useState<GeofenceLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // New location form state
  const [newName, setNewName] = useState('');
  const [newLat, setNewLat] = useState('');
  const [newLon, setNewLon] = useState('');
  const [newRadius, setNewRadius] = useState('200');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, [token]);

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/admin/attendance/locations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setLocations(data.locations || []);
      }
    } catch (err) {
      console.error('Failed to fetch locations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newLat || !newLon) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/attendance/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newName,
          latitude: parseFloat(newLat),
          longitude: parseFloat(newLon),
          radius_meters: parseInt(newRadius, 10),
          is_active: true,
        }),
      });

      if (!res.ok) throw new Error('Failed to add location');

      showToast('success', 'Location added successfully');
      setAdding(false);
      setNewName('');
      setNewLat('');
      setNewLon('');
      setNewRadius('200');
      fetchLocations();
    } catch (err: any) {
      showToast('error', err.message || 'Error adding location');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this location?')) return;

    try {
      const res = await fetch(`/api/admin/attendance/locations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete location');
      showToast('success', 'Location deleted');
      setLocations(locations.filter((loc) => loc.id !== id));
    } catch (err: any) {
      showToast('error', err.message || 'Error deleting location');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/attendance/locations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');

      setLocations(
        locations.map((loc) => (loc.id === id ? { ...loc, is_active: !currentStatus } : loc))
      );
    } catch (err: any) {
      showToast('error', err.message || 'Error updating status');
    }
  };

  const handleGetCurrentLocation = async () => {
    try {
      const loc = await getDeviceCoordinates({ enableHighAccuracy: true, timeout: 10000 });
      setNewLat(loc.latitude.toString());
      setNewLon(loc.longitude.toString());
      showToast('success', 'Location captured');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'GPS Signal Timeout';
      showToast('error', `Could not get location: ${errorMsg}`);
    }
  };

  if (loading)
    return <div className="h-64 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5"></div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-brand-navy font-serif text-xl font-semibold dark:text-white">
            Geofence Locations
          </h2>
          <p className="text-xs text-gray-500">
            Employees can only punch in/out when physically present within the radius of these
            locations.
          </p>
        </div>

        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="bg-brand-navy text-brand-gold hover:bg-brand-navy-light dark:text-brand-navy flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold tracking-widest uppercase transition-colors dark:bg-white"
          >
            <Plus size={16} /> Add Location
          </button>
        )}
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form
              onSubmit={handleAddLocation}
              className="border-brand-gold/30 bg-brand-gold/5 dark:bg-brand-gold/10 rounded-xl border p-6"
            >
              <h3 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">
                Add New Office / Site Location
              </h3>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="col-span-2 lg:col-span-1">
                  <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Location Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jaipur HQ"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="focus:border-brand-gold w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="26.9124"
                    value={newLat}
                    onChange={(e) => setNewLat(e.target.value)}
                    className="focus:border-brand-gold w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="75.7873"
                    value={newLon}
                    onChange={(e) => setNewLon(e.target.value)}
                    className="focus:border-brand-gold w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Radius (meters)
                  </label>
                  <input
                    type="number"
                    required
                    min="10"
                    placeholder="200"
                    value={newRadius}
                    onChange={(e) => setNewRadius(e.target.value)}
                    className="focus:border-brand-gold w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  className="text-brand-gold flex items-center gap-2 text-xs font-semibold hover:underline"
                >
                  <MapPin size={14} /> Use My Current Location
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAdding(false)}
                    className="rounded-lg px-4 py-2 text-xs font-bold tracking-widest text-gray-500 uppercase hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-brand-navy hover:bg-brand-navy-light rounded-lg px-4 py-2 text-xs font-bold tracking-widest text-white uppercase disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save Location'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((loc) => (
          <div
            key={loc.id}
            className="group hover:border-brand-gold/50 relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                  <MapIcon size={20} />
                </div>
                <h3 className="max-w-[150px] truncate font-bold text-gray-900 dark:text-white">
                  {loc.name}
                </h3>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={loc.is_active}
                  onChange={() => handleToggleActive(loc.id, loc.is_active)}
                />
                <div className="peer h-5 w-9 rounded-full bg-gray-200 peer-checked:bg-emerald-500 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-gray-700 dark:peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="space-y-1 font-mono text-xs text-gray-500">
              <p>
                Lat: <span className="text-gray-900 dark:text-gray-300">{loc.latitude}</span>
              </p>
              <p>
                Lon: <span className="text-gray-900 dark:text-gray-300">{loc.longitude}</span>
              </p>
              <p>
                Radius:{' '}
                <span className="font-bold text-gray-900 dark:text-gray-300">
                  {loc.radius_meters}m
                </span>
              </p>
            </div>

            <button
              onClick={() => handleDelete(loc.id)}
              className="absolute right-4 bottom-4 text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:text-red-500"
              title="Delete Location"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {locations.length === 0 && !loading && (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
          <MapPin className="mx-auto mb-3 h-8 w-8 text-gray-400" />
          <p className="font-medium text-gray-900 dark:text-white">No locations added</p>
          <p className="mt-1 text-sm text-gray-500">
            Add a geofence location to restrict where employees can punch in.
          </p>
        </div>
      )}
    </div>
  );
}
