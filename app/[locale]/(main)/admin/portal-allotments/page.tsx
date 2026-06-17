'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase/client';
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function PortalAllotmentsAdmin() {
  const [allotments, setAllotments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Create / Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Payment schedule expand state
  const [expandedAllotment, setExpandedAllotment] = useState<string | null>(null);

  // Form Data
  const [profiles, setProfiles] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    profile_id: '',
    property_id: '',
    unit_number: '',
    area: '',
    total_cost: '',
    booking_date: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch allotments with relations
      const { data: allotmentsData, error: allotmentsError } = await supabase
        .from('allotments')
        .select(
          `
          *,
          profiles(id, full_name, email),
          properties(id, name),
          payment_schedules(*)
        `
        )
        .order('created_at', { ascending: false });

      if (allotmentsError) throw allotmentsError;
      setAllotments(allotmentsData || []);

      // Fetch profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name');
      setProfiles(profilesData || []);

      // Fetch properties
      const { data: propertiesData } = await supabase
        .from('properties')
        .select('id, name')
        .eq('active', true)
        .order('name');
      setProperties(propertiesData || []);
    } catch (error: any) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { error } = await supabase.from('allotments').update(formData).eq('id', editingId);
        if (error) throw error;
        toast.success('Allotment updated');
      } else {
        const { error } = await supabase.from('allotments').insert(formData);
        if (error) throw error;
        toast.success('Allotment created');
      }
      setShowModal(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this allotment?')) return;
    try {
      const { error } = await supabase.from('allotments').delete().eq('id', id);
      if (error) throw error;
      toast.success('Allotment deleted');
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const togglePaymentStatus = async (paymentId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    try {
      const { error } = await supabase
        .from('payment_schedules')
        .update({
          status: newStatus,
          paid_date: newStatus === 'paid' ? new Date().toISOString() : null,
        })
        .eq('id', paymentId);

      if (error) throw error;
      toast.success(`Payment marked as ${newStatus}`);
      fetchData();
    } catch (error: any) {
      toast.error('Failed to update status');
    }
  };

  const filteredAllotments = allotments.filter(
    (a) =>
      a.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.properties?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.unit_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto w-full max-w-7xl font-sans">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-brand-navy mb-2 font-serif text-3xl tracking-tight dark:text-white">
            Portal <span className="text-brand-gold italic">Allotments</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage customer portal allotments and their payment schedules.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              profile_id: '',
              property_id: '',
              unit_number: '',
              area: '',
              total_cost: '',
              booking_date: new Date().toISOString().split('T')[0],
            });
            setShowModal(true);
          }}
          className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-md transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Allotment
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by client, property, or unit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="focus:ring-brand-gold w-full rounded-xl border border-gray-200 bg-white py-3 pr-4 pl-10 text-gray-900 outline-none focus:ring-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : filteredAllotments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No allotments found.</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredAllotments.map((allotment) => (
              <div key={allotment.id} className="p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div className="flex items-start gap-4">
                    <div className="bg-brand-gold/10 hidden rounded-xl p-3 sm:block">
                      <Building2 className="text-brand-gold h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {allotment.profiles?.full_name}{' '}
                        <span className="font-normal text-gray-400">
                          ({allotment.profiles?.email})
                        </span>
                      </h3>
                      <div className="mt-1 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <p>
                          <strong className="text-gray-900 dark:text-gray-300">Property:</strong>{' '}
                          {allotment.properties?.name}
                        </p>
                        <p>
                          <strong className="text-gray-900 dark:text-gray-300">Unit:</strong>{' '}
                          {allotment.unit_number}
                        </p>
                        <p>
                          <strong className="text-gray-900 dark:text-gray-300">Total Cost:</strong>{' '}
                          ₹{allotment.total_cost?.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-auto">
                    <button
                      onClick={() =>
                        setExpandedAllotment(
                          expandedAllotment === allotment.id ? null : allotment.id
                        )
                      }
                      className="text-brand-navy dark:text-brand-gold bg-brand-gold/10 hover:bg-brand-gold/20 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                    >
                      {expandedAllotment === allotment.id ? 'Hide Payments' : 'View Payments'}
                      {expandedAllotment === allotment.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(allotment.id);
                        setFormData({
                          profile_id: allotment.profile_id,
                          property_id: allotment.property_id,
                          unit_number: allotment.unit_number || '',
                          area: allotment.area?.toString() || '',
                          total_cost: allotment.total_cost?.toString() || '',
                          booking_date: allotment.booking_date || '',
                        });
                        setShowModal(true);
                      }}
                      className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(allotment.id)}
                      className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedAllotment === allotment.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
                        <div className="mb-4 flex items-center justify-between">
                          <h4 className="font-bold text-gray-900 dark:text-white">
                            Payment Schedule
                          </h4>
                          <span className="text-xs text-gray-500">
                            {allotment.payment_schedules?.filter((p: any) => p.status === 'paid')
                              .length || 0}{' '}
                            of {allotment.payment_schedules?.length || 0} paid
                          </span>
                        </div>

                        {allotment.payment_schedules?.length > 0 ? (
                          <div className="space-y-3">
                            {allotment.payment_schedules
                              .sort(
                                (a: any, b: any) =>
                                  new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
                              )
                              .map((payment: any) => (
                                <div
                                  key={payment.id}
                                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
                                >
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                      {payment.milestone_name}
                                    </p>
                                    <p className="mt-1 flex gap-4 text-xs text-gray-500">
                                      <span>
                                        Due: {new Date(payment.due_date).toLocaleDateString()}
                                      </span>
                                      <span>₹{payment.amount?.toLocaleString('en-IN')}</span>
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => togglePaymentStatus(payment.id, payment.status)}
                                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                                      payment.status === 'paid'
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
                                    }`}
                                  >
                                    {payment.status === 'paid' ? (
                                      <>
                                        <CheckCircle className="h-3.5 w-3.5" /> Paid
                                      </>
                                    ) : (
                                      <>
                                        <Clock className="h-3.5 w-3.5" /> Pending
                                      </>
                                    )}
                                  </button>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="py-4 text-center text-sm text-gray-500">
                            No payment schedules generated for this allotment.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-700">
              <h2 className="text-xl font-bold dark:text-white">
                {editingId ? 'Edit Allotment' : 'New Allotment'}
              </h2>
            </div>

            <form onSubmit={handleSave} className="space-y-4 p-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Client Profile
                </label>
                <select
                  required
                  value={formData.profile_id}
                  onChange={(e) => setFormData({ ...formData, profile_id: e.target.value })}
                  className="focus:ring-brand-gold w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-gray-900 outline-none focus:ring-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="">Select a client...</option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Property
                </label>
                <select
                  required
                  value={formData.property_id}
                  onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
                  className="focus:ring-brand-gold w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-gray-900 outline-none focus:ring-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="">Select property...</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Unit Number
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.unit_number}
                    onChange={(e) => setFormData({ ...formData, unit_number: e.target.value })}
                    className="focus:ring-brand-gold w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-gray-900 outline-none focus:ring-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Area (sq yds)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="focus:ring-brand-gold w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-gray-900 outline-none focus:ring-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total Cost (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.total_cost}
                    onChange={(e) => setFormData({ ...formData, total_cost: e.target.value })}
                    className="focus:ring-brand-gold w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-gray-900 outline-none focus:ring-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Booking Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.booking_date}
                    onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                    className="focus:ring-brand-gold w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-gray-900 outline-none focus:ring-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#0256B4] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#02428A] dark:bg-[#E8D17A] dark:text-gray-900 dark:hover:bg-[#d4be66]"
                >
                  Save Allotment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
