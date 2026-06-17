'use client';

import {
  Building2,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Check,
  X,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { getSettingsDensity, getSettingsInputClass, SETTINGS_LABEL_CLASS } from './helpers';

interface Property {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  created_at: string;
}

interface PropertiesTabProps {
  token: string | null;
  isCompact: boolean;
  showToast: (type: 'success' | 'error', msg: string) => void;
}

export function PropertiesTab({ token, isCompact, showToast }: PropertiesTabProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Form states for new/editing property
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Search/Filter state
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch properties
  const fetchProperties = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/properties', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch properties');
      setProperties(data.properties || []);
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'Failed to load properties.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [token]);

  // Handle auto-slug generation from name
  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingId) {
      // Auto generate slug
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // remove special characters
        .trim()
        .replace(/\s+/g, '-'); // replace spaces with hyphens
      setSlug(generated);
    }
  };

  // Create or Update property
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      showToast('error', 'Both name and slug are required.');
      return;
    }

    setSaveLoading(true);
    try {
      const res = await fetch('/api/admin/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: editingId || undefined,
          name: name.trim(),
          slug: slug.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save property.');

      showToast(
        'success',
        editingId ? 'Property updated successfully!' : 'New property added successfully!'
      );

      // Reset form
      setName('');
      setSlug('');
      setEditingId(null);
      setShowAddForm(false);

      // Refresh list
      fetchProperties();
    } catch (err: any) {
      showToast('error', err.message || 'An error occurred.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Toggle active status
  const handleToggleActive = async (property: Property) => {
    if (!token) return;
    setActionLoading(property.id);
    try {
      const res = await fetch('/api/admin/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: property.id,
          name: property.name,
          slug: property.slug,
          active: !property.active,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status.');

      showToast(
        'success',
        `Property "${property.name}" is now ${!property.active ? 'Active' : 'Inactive'}`
      );

      // Update local state
      setProperties((prev) =>
        prev.map((p) => (p.id === property.id ? { ...p, active: !p.active } : p))
      );
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update status.');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete property
  const handleDelete = async (property: Property) => {
    if (!confirm(`Are you sure you want to permanently delete "${property.name}"?`)) {
      return;
    }

    setActionLoading(property.id);
    try {
      const res = await fetch(`/api/admin/properties?id=${property.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete property.');

      showToast('success', `Property "${property.name}" deleted successfully!`);

      // Update local state
      setProperties((prev) => prev.filter((p) => p.id !== property.id));
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete property.');
    } finally {
      setActionLoading(null);
    }
  };

  // Set property for editing
  const startEdit = (property: Property) => {
    setEditingId(property.id);
    setName(property.name);
    setSlug(property.slug);
    setShowAddForm(true);
    // Scroll to form smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setShowAddForm(false);
  };

  // Filter properties
  const filteredProperties = properties.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { densityPadding, densitySecSpacing } = getSettingsDensity(isCompact);
  const inputClass = getSettingsInputClass(densityPadding);
  const labelClass = SETTINGS_LABEL_CLASS;

  return (
    <div className={densitySecSpacing}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-brand-navy mb-1 font-sans font-serif text-xl font-bold dark:text-white">
            Property & Project Management
          </h2>
          <p className="font-sans text-xs text-gray-500 dark:text-gray-400">
            Dynamically add, edit, and toggle real estate project options displayed across the
            platform.
          </p>
        </div>
        <button
          onClick={() => {
            if (showAddForm) {
              cancelEdit();
            } else {
              setShowAddForm(true);
            }
          }}
          className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 font-sans text-xs font-bold tracking-wider uppercase shadow-md transition-all hover:scale-[1.02]"
        >
          {showAddForm ? (
            <>
              <X size={14} /> Cancel
            </>
          ) : (
            <>
              <Plus size={14} /> Add Property
            </>
          )}
        </button>
      </motion.div>

      {/* Add / Edit Form Panel */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-brand-gold/20 bg-brand-gold/5 dark:border-brand-gold/10 overflow-hidden rounded-xl border p-5"
        >
          <h3 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">
            {editingId ? 'Edit Property Details' : 'Add New Real Estate Property'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Property / Project Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Shyam Aangan Phase 2"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Slug (VPA slug / Form value identifier)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. shyam-aangan-phase-2"
                  className={inputClass}
                  required
                />
                <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500">
                  Unique, lowercase string identifier. Replaces spaces with hyphens.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 font-sans text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={saveLoading}
                className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-5 py-2.5 font-sans text-xs font-bold tracking-widest uppercase transition-all disabled:opacity-60"
              >
                {saveLoading ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <Check size={14} /> {editingId ? 'Update Property' : 'Save Property'}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Property Search & Listing */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search properties by name or slug..."
              className="focus:border-brand-gold w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2.5 pr-4 pl-4 text-sm text-gray-900 transition-colors focus:outline-none dark:border-gray-800 dark:bg-[#111118] dark:text-white"
            />
          </div>
          <button
            onClick={fetchProperties}
            className="hover:text-brand-gold flex items-center justify-center gap-1 text-xs font-semibold text-gray-500 transition-colors dark:text-gray-400"
            title="Refresh List"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Reload list</span>
          </button>
        </div>

        {loading ? (
          <div className="border-gray-150 overflow-hidden rounded-xl border bg-white/40 dark:border-white/5 dark:bg-black/20">
            <table className="w-full border-collapse animate-pulse text-left text-sm">
              <thead>
                <tr className="border-gray-150 border-b bg-gray-50/70 font-sans text-xs font-bold tracking-wider text-gray-500 uppercase dark:border-white/5 dark:bg-[#14141d]/50 dark:text-gray-400">
                  <th className="p-4">
                    <div className="bg-gray-250 h-3 w-20 rounded dark:bg-white/5" />
                  </th>
                  <th className="p-4">
                    <div className="bg-gray-250 h-3 w-28 rounded dark:bg-white/5" />
                  </th>
                  <th className="p-4">
                    <div className="bg-gray-250 h-3 w-24 rounded dark:bg-white/5" />
                  </th>
                  <th className="p-4 text-center">
                    <div className="bg-gray-250 mx-auto h-3 w-16 rounded dark:bg-white/5" />
                  </th>
                  <th className="p-4 text-right">
                    <div className="bg-gray-250 ml-auto h-3 w-16 rounded dark:bg-white/5" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans dark:divide-white/5">
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {/* Name */}
                    <td className="p-4">
                      <div className="h-4.5 w-36 rounded bg-gray-200 dark:bg-white/5" />
                    </td>
                    {/* Slug */}
                    <td className="p-4">
                      <div className="h-4 w-40 rounded bg-gray-200 dark:bg-white/5" />
                    </td>
                    {/* Created Date */}
                    <td className="p-4">
                      <div className="h-4 w-28 rounded bg-gray-200 dark:bg-white/5" />
                    </td>
                    {/* Status */}
                    <td className="p-4 text-center">
                      <div className="mx-auto h-5 w-16 rounded-full bg-gray-200 dark:bg-white/5" />
                    </td>
                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="ml-auto h-8 w-24 rounded bg-gray-200 dark:bg-white/5" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center dark:border-white/10">
            <Building2 className="mb-3 h-8 w-8 text-gray-300 dark:text-gray-600" />
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              No properties found
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              {searchQuery
                ? 'Try clearing your search query.'
                : 'Click "Add Property" to create your first listing.'}
            </p>
          </div>
        ) : (
          <div className="border-gray-150 overflow-x-auto rounded-xl border bg-white/40 dark:border-white/5 dark:bg-black/20">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-gray-150 border-b bg-gray-50/70 font-sans text-xs font-bold tracking-wider text-gray-500 uppercase dark:border-white/5 dark:bg-[#14141d]/50 dark:text-gray-400">
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Slug Identifier</th>
                  <th className="p-4 font-semibold">Created Date</th>
                  <th className="p-4 text-center font-semibold">Status</th>
                  <th className="p-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans dark:divide-white/5">
                {filteredProperties.map((property) => (
                  <motion.tr
                    key={property.id}
                    layoutId={`prop-row-${property.id}`}
                    className="group hover:bg-gray-50/50 dark:hover:bg-white/2"
                  >
                    <td className="p-4">
                      <span className="font-bold text-gray-900 dark:text-white">
                        {property.name}
                      </span>
                    </td>
                    <td className="p-4">
                      <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-white/5 dark:text-gray-400">
                        {property.slug}
                      </code>
                    </td>
                    <td className="p-4 text-xs text-gray-500 dark:text-gray-400">
                      {new Date(property.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleToggleActive(property)}
                          disabled={actionLoading !== null}
                          className="hover:text-brand-gold text-gray-400 transition-colors disabled:opacity-50"
                          title={property.active ? 'Set as Inactive' : 'Set as Active'}
                        >
                          {property.active ? (
                            <ToggleRight className="text-brand-gold h-7 w-7" />
                          ) : (
                            <ToggleLeft className="h-7 w-7 opacity-50" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-3.5">
                        <button
                          onClick={() => startEdit(property)}
                          className="hover:text-brand-gold text-gray-400 transition-colors"
                          title="Edit Details"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(property)}
                          disabled={actionLoading !== null}
                          className="text-gray-400 transition-colors hover:text-red-500 disabled:opacity-50"
                          title="Delete Property"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
