'use client';

import { useState, useEffect, useCallback } from 'react';
import { Mail, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getToken } from './helpers';
import { ConfirmDialog } from './ConfirmDialog';
import { CampaignStatsCards } from './campaigns/CampaignStatsCards';
import { CampaignSearchBar } from './campaigns/CampaignSearchBar';
import { CampaignCard } from './campaigns/CampaignCard';
import { CampaignFormModal } from './campaigns/CampaignFormModal';
import { DashboardCardSkeleton, EmailListSkeleton } from './Skeletons';
import type { Campaign } from './types';

export function CampaignsTab() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: 'danger' | 'default';
    confirmLabel: string;
    onConfirm: () => void;
  } | null>(null);

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch('/api/admin/campaigns', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.campaigns) setCampaigns(data.campaigns);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const doSendImmediately = async (id: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/campaigns/${id}/send`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error('Failed to send: ' + data.error);
      } else {
        toast.success(`Sent to ${data.sent} recipients`);
        fetchCampaigns();
      }
    } catch (err) {
      console.error(err);
      toast.error('Error sending campaign');
    }
  };

  const handleSendImmediately = (id: string) => {
    setConfirmState({
      open: true,
      title: 'Send campaign now?',
      message:
        'This will immediately send the email to all group members. This action cannot be undone.',
      variant: 'danger',
      confirmLabel: 'Send Now',
      onConfirm: () => {
        doSendImmediately(id);
        setConfirmState(null);
      },
    });
  };

  const doDelete = async (id: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/campaigns/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('Campaign deleted');
        fetchCampaigns();
      } else {
        const data = await res.json();
        toast.error('Failed to delete: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error deleting campaign');
    }
  };

  const handleDelete = (id: string) => {
    setConfirmState({
      open: true,
      title: 'Delete campaign?',
      message: 'This will permanently delete the campaign. This action cannot be undone.',
      variant: 'danger',
      confirmLabel: 'Delete',
      onConfirm: () => {
        doDelete(id);
        setConfirmState(null);
      },
    });
  };

  const handleDuplicate = (campaign: Campaign) => {
    setEditingCampaign(null);
    setDuplicateSource(campaign);
    setIsModalOpen(true);
    toast.info('Duplicating campaign...');
  };

  const [duplicateSource, setDuplicateSource] = useState<Campaign | null>(null);

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase());
    if (statusFilter === 'lottery') return matchesSearch && c.lottery_id !== null;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: campaigns.length,
    draft: campaigns.filter((c) => c.status === 'draft').length,
    scheduled: campaigns.filter((c) => c.status === 'scheduled').length,
    sent: campaigns.filter((c) => c.status === 'sent').length,
  };

  return (
    <div className="space-y-5">
      <CampaignStatsCards
        total={stats.total}
        draft={stats.draft}
        scheduled={stats.scheduled}
        sent={stats.sent}
      />

      <CampaignSearchBar
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onSearchChange={setSearchQuery}
        onStatusFilterChange={setStatusFilter}
        onCreateClick={() => {
          setEditingCampaign(null);
          setIsModalOpen(true);
        }}
      />

      {loading ? (
        <div className="space-y-4">
          {/* Stats cards skeleton */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <DashboardCardSkeleton key={i} />
            ))}
          </div>

          {/* Campaign list skeleton */}
          <div className="rounded-xl border border-gray-200/80 bg-white dark:border-gray-700/60 dark:bg-[#0e0e14]">
            <EmailListSkeleton count={5} />
          </div>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-16 text-center dark:border-gray-800">
          <Mail className="mx-auto mb-4 h-10 w-10 text-gray-300 dark:text-gray-700" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">No campaigns found</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
            Create your first campaign to start sending bulk emails.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredCampaigns.map((c, i) => (
            <CampaignCard
              key={c.id}
              campaign={c}
              index={i}
              onEdit={() => {
                setEditingCampaign(c);
                setIsModalOpen(true);
              }}
              onSendNow={() => handleSendImmediately(c.id)}
              onDuplicate={() => handleDuplicate(c)}
              onDelete={() => handleDelete(c.id)}
            />
          ))}
        </div>
      )}

      <CampaignFormModal
        open={isModalOpen}
        editingCampaign={editingCampaign}
        duplicateSource={duplicateSource}
        onClose={() => {
          setIsModalOpen(false);
          setDuplicateSource(null);
        }}
        onSaved={fetchCampaigns}
      />

      {confirmState && (
        <ConfirmDialog
          open={confirmState.open}
          title={confirmState.title}
          message={confirmState.message}
          variant={confirmState.variant}
          confirmLabel={confirmState.confirmLabel}
          onConfirm={confirmState.onConfirm}
          onCancel={() => setConfirmState(null)}
        />
      )}
    </div>
  );
}
