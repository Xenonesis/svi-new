'use client';

import { useState } from 'react';
import { Bell, Radio } from 'lucide-react';
import { useAdminNotifications } from '@/src/components/admin/notifications/useAdminNotifications';
import { NotificationHeader } from '@/src/components/admin/notifications/NotificationHeader';
import { NotificationFilters } from '@/src/components/admin/notifications/NotificationFilters';
import { NotificationBulkActions } from '@/src/components/admin/notifications/NotificationBulkActions';
import { NotificationList } from '@/src/components/admin/notifications/NotificationList';
import { NotificationPagination } from '@/src/components/admin/notifications/NotificationPagination';
import { PushSubscribersTab } from '@/src/components/admin/notifications/PushSubscribersTab';

export default function AdminNotifications() {
  const [activeTab, setActiveTab] = useState<'alerts' | 'push'>('alerts');
  const hook = useAdminNotifications();

  return (
    <div className="min-h-[400px]">
      {/* Navigation Tabs */}
      <div className="mb-6 flex items-center gap-2 border-b border-gray-100 pb-3 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold tracking-wider uppercase transition-colors ${
            activeTab === 'alerts'
              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
          }`}
        >
          <Bell size={14} />
          Activity Alerts
          {hook.unreadCount > 0 && (
            <span className="py-0.2 ml-1 rounded-full bg-amber-500 px-1.5 text-[10px] text-white">
              {hook.unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('push')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold tracking-wider uppercase transition-colors ${
            activeTab === 'push'
              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
          }`}
        >
          <Radio size={14} />
          Web Push & Subscribers
        </button>
      </div>

      {activeTab === 'push' ? (
        <PushSubscribersTab />
      ) : (
        <>
          <NotificationHeader
            totalCount={hook.totalCount}
            unreadCount={hook.unreadCount}
            bulkActionLoading={hook.bulkActionLoading}
            loading={hook.loading}
            markAllAsRead={hook.markAllAsRead}
            fetchNotifications={hook.refetch}
          />

          <NotificationFilters
            typeFilter={hook.typeFilter}
            setTypeFilter={hook.setTypeFilter}
            searchQuery={hook.searchQuery}
            setSearchQuery={hook.setSearchQuery}
            readFilter={hook.readFilter}
            setReadFilter={hook.setReadFilter}
            sortBy={hook.sortBy}
            setSortBy={hook.setSortBy}
            setCurrentPage={hook.setCurrentPage}
            sortOptions={hook.sortOptions}
          />

          <NotificationBulkActions
            selectedIds={hook.selectedIds}
            setSelectedIds={hook.setSelectedIds}
            bulkActionLoading={hook.bulkActionLoading}
            bulkMarkAsRead={hook.bulkMarkAsRead}
            bulkMarkAsUnread={hook.bulkMarkAsUnread}
            bulkDelete={hook.bulkDelete}
          />

          <NotificationList
            notifications={hook.notifications}
            loading={hook.loading}
            error={hook.error}
            searchQuery={hook.searchQuery}
            typeFilter={hook.typeFilter}
            readFilter={hook.readFilter}
            selectedIds={hook.selectedIds}
            toggleSelection={hook.toggleSelection}
            toggleSelectAll={hook.toggleSelectAll}
            markAsRead={hook.markAsRead}
            markAsUnread={hook.markAsUnread}
            deleteNotification={hook.deleteNotification}
            fetchNotifications={hook.setCurrentPage}
            setTypeFilter={hook.setTypeFilter}
            setReadFilter={hook.setReadFilter}
            setSearchQuery={hook.setSearchQuery}
            setCurrentPage={hook.setCurrentPage}
          />

          <NotificationPagination
            currentPage={hook.currentPage}
            totalPages={hook.totalPages}
            fetchNotifications={hook.setCurrentPage}
            getPageNumbers={hook.getPageNumbers}
          />
        </>
      )}
    </div>
  );
}
