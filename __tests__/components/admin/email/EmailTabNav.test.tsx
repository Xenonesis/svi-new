import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { EmailTabNav, EMAIL_TABS } from '@/src/components/admin/email/EmailTabNav';

describe('EmailTabNav', () => {
  it('renders all email tabs with correct accessibility attributes', () => {
    const handleTabChange = vi.fn();
    render(<EmailTabNav activeTab="compose" onTabChange={handleTabChange} />);

    const tablist = screen.getByRole('tablist', { name: /email center navigation/i });
    expect(tablist).toBeDefined();

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(EMAIL_TABS.length);

    // Verify labels
    const expectedLabels = [
      'Compose',
      'Drafts',
      'Inbox',
      'Sent',
      'Campaigns',
      'Templates',
      'Domains',
      'Settings',
      'Scheduled',
      'Trash',
    ];
    expectedLabels.forEach((label) => {
      expect(screen.getByRole('tab', { name: new RegExp(label, 'i') })).toBeDefined();
    });

    // Check active tab attributes
    const composeTab = screen.getByRole('tab', { name: /compose/i });
    expect(composeTab.getAttribute('aria-selected')).toBe('true');
    expect(composeTab.getAttribute('tabindex')).toBe('0');

    // Check inactive tab attributes
    const inboxTab = screen.getByRole('tab', { name: /inbox/i });
    expect(inboxTab.getAttribute('aria-selected')).toBe('false');
    expect(inboxTab.getAttribute('tabindex')).toBe('-1');
  });

  it('calls onTabChange when a tab is clicked', () => {
    const handleTabChange = vi.fn();
    render(<EmailTabNav activeTab="compose" onTabChange={handleTabChange} />);

    const sentTab = screen.getByRole('tab', { name: /sent/i });
    fireEvent.click(sentTab);

    expect(handleTabChange).toHaveBeenCalledWith('sent');
  });

  it('shows unread badge count when unreadCount > 0 on replies tab', () => {
    const handleTabChange = vi.fn();
    render(<EmailTabNav activeTab="compose" onTabChange={handleTabChange} unreadCount={5} />);

    const badge = screen.getByText('5');
    expect(badge).toBeDefined();
  });

  it('does not show unread badge when unreadCount is 0 or omitted', () => {
    const handleTabChange = vi.fn();
    const { rerender } = render(
      <EmailTabNav activeTab="compose" onTabChange={handleTabChange} unreadCount={0} />
    );

    expect(screen.queryByText('0')).toBeNull();

    rerender(<EmailTabNav activeTab="compose" onTabChange={handleTabChange} />);
    expect(screen.queryByText('0')).toBeNull();
  });

  it('handles keyboard navigation with arrow keys, Home, and End', () => {
    const handleTabChange = vi.fn();
    render(<EmailTabNav activeTab="compose" onTabChange={handleTabChange} />);

    const tablist = screen.getByRole('tablist', { name: /email center navigation/i });

    // ArrowRight moves from compose (index 0) to drafts (index 1)
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    expect(handleTabChange).toHaveBeenCalledWith('drafts');

    // ArrowLeft wraps from compose (index 0) to trash (last index)
    fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
    expect(handleTabChange).toHaveBeenCalledWith('trash');

    // End moves to last tab
    fireEvent.keyDown(tablist, { key: 'End' });
    expect(handleTabChange).toHaveBeenCalledWith('trash');

    // Home moves to first tab
    fireEvent.keyDown(tablist, { key: 'Home' });
    expect(handleTabChange).toHaveBeenCalledWith('compose');
  });
});
