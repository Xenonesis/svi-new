'use client';

import { useAdminNotifications } from '@/src/components/admin/notifications/useAdminNotifications';
import { NotificationHeader } from '@/src/components/admin/notifications/NotificationHeader';
import { NotificationFilters } from '@/src/components/admin/notifications/NotificationFilters';
import { NotificationBulkActions } from '@/src/components/admin/notifications/NotificationBulkActions';
import { NotificationList } from '@/src/components/admin/notifications/NotificationList';
import { NotificationPagination } from '@/src/components/admin/notifications/NotificationPagination';

export default function AdminNotifications() {
  const hook = useAdminNotifications();

  return (
    <div className="min-h-[400px]">
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
    </div>
  );
}
