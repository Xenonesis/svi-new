import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotificationDropdown from '@/src/components/admin/NotificationDropdown';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

const mockPlayTestTone = vi.fn();
const mockSetNotificationSoundTone = vi.fn();
vi.mock('@/src/lib/notifications/notificationSound', () => ({
  isNotificationSoundEnabled: vi.fn(() => true),
  setNotificationSoundEnabled: vi.fn(),
  getNotificationSoundTone: vi.fn(() => 'chime'),
  setNotificationSoundTone: (tone: string) => mockSetNotificationSoundTone(tone),
  SOUND_OPTIONS: [
    {
      id: 'chime',
      name: 'Classic Gold Chime',
      description: 'Subtle luxury two-tone chime',
      badge: 'Default',
    },
    { id: 'bell', name: 'Crystal Bell', description: 'Crisp executive bell', badge: 'Crisp' },
    { id: 'marimba', name: 'Warm Marimba', description: 'Soft harmonic triad', badge: 'Mellow' },
    {
      id: 'ping',
      name: 'Minimal Tech Ping',
      description: 'Clean modern pulse note',
      badge: 'Discreet',
    },
    {
      id: 'pop',
      name: 'Modern Bubble Pop',
      description: 'Upbeat micro-interaction pop',
      badge: 'Snappy',
    },
    {
      id: 'ascend',
      name: 'Ascend Sparkle',
      description: 'Three-step upbeat alert',
      badge: 'Upbeat',
    },
  ],
  playNotificationChime: vi.fn(),
  playTestTone: (tone?: string) => mockPlayTestTone(tone),
}));

const mockNotifications = [
  {
    id: 'notif-lead-1',
    user_id: 'admin-1',
    title: 'New Chat Lead',
    message: 'Ramkesh (+918058764307) shared their contact info via the AI chatbot.',
    type: 'info',
    is_read: false,
    created_at: '2026-03-09T10:00:00Z',
    metadata: { event: 'chat_lead_created' },
  },
  {
    id: 'notif-settings-2',
    user_id: 'admin-1',
    title: 'Settings Updated',
    message: 'System Administrator updated active advisors settings.',
    type: 'info',
    is_read: true,
    created_at: '2026-03-09T08:00:00Z',
    metadata: { event: 'settings_updated' },
  },
  {
    id: 'notif-task-3',
    user_id: 'admin-1',
    title: 'New User Registered',
    message: 'Kajal Vishu has registered as a new user.',
    type: 'info',
    is_read: false,
    created_at: '2026-03-09T07:00:00Z',
    metadata: { event: 'user_registered', userId: 'usr_kajal' },
  },
];

const mockUpdate = vi.fn().mockReturnValue({
  eq: vi.fn().mockResolvedValue({ error: null }),
});
const mockDelete = vi.fn().mockReturnValue({
  eq: vi.fn().mockResolvedValue({ error: null }),
});

const mockSelect = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({
    order: vi.fn().mockReturnValue({
      limit: vi.fn().mockResolvedValue({
        data: mockNotifications,
        error: null,
      }),
    }),
  }),
});

vi.mock('@/src/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockImplementation(() => ({
      select: mockSelect,
      update: mockUpdate,
      delete: mockDelete,
    })),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    }),
    removeChannel: vi.fn(),
  },
}));

describe('NotificationDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders bell and opens dropdown with segmented tabs and header', async () => {
    render(<NotificationDropdown userId="admin-1" />);

    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('Notifications & Alerts')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /alerts/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /tasks/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sounds/i })).toBeInTheDocument();
      expect(screen.getByText('New Chat Lead')).toBeInTheDocument();
      expect(screen.getByText('Settings Updated')).toBeInTheDocument();
      expect(screen.getByText('New User Registered')).toBeInTheDocument();
    });
  });

  it('switches between Alerts, Tasks, and Sounds tabs', async () => {
    render(<NotificationDropdown userId="admin-1" />);

    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('New Chat Lead')).toBeInTheDocument();
    });

    // Switch to Tasks tab
    const tasksTab = screen.getByRole('button', { name: /tasks/i });
    fireEvent.click(tasksTab);

    // Only task notification should remain visible
    expect(screen.getByText('New User Registered')).toBeInTheDocument();
    expect(screen.queryByText('Settings Updated')).not.toBeInTheDocument();

    // Switch to Sounds tab
    const soundsTab = screen.getByRole('button', { name: /sounds/i });
    fireEvent.click(soundsTab);

    expect(screen.getByText('Alert Audio Chime')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /play sample tone/i })).toBeInTheDocument();
  });

  it('plays test tone when clicking "Test Tone" in footer or sounds view', async () => {
    render(<NotificationDropdown userId="admin-1" />);

    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('SVI Sound & Notification Center')).toBeInTheDocument();
    });

    const testToneButton = screen.getByRole('button', { name: /test tone/i });
    fireEvent.click(testToneButton);

    expect(mockPlayTestTone).toHaveBeenCalled();
  });

  it('renders all 6 sound tone options and selects a new tone', async () => {
    render(<NotificationDropdown userId="admin-1" />);

    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);

    // Switch to Sounds tab
    const soundsTab = screen.getByRole('button', { name: /sounds/i });
    fireEvent.click(soundsTab);

    expect(screen.getByText('Select Notification Tone')).toBeInTheDocument();
    expect(screen.getByText('Classic Gold Chime')).toBeInTheDocument();
    expect(screen.getByText('Crystal Bell')).toBeInTheDocument();
    expect(screen.getByText('Warm Marimba')).toBeInTheDocument();
    expect(screen.getByText('Minimal Tech Ping')).toBeInTheDocument();
    expect(screen.getByText('Modern Bubble Pop')).toBeInTheDocument();
    expect(screen.getByText('Ascend Sparkle')).toBeInTheDocument();

    // Click on Crystal Bell
    const bellOption = screen.getByText('Crystal Bell');
    fireEvent.click(bellOption);

    expect(mockSetNotificationSoundTone).toHaveBeenCalledWith('bell');
    expect(mockPlayTestTone).toHaveBeenCalledWith('bell');
  });

  it('clicks on "New Chat Lead" notification, marks as read and redirects to /admin/chat-logs', async () => {
    render(<NotificationDropdown userId="admin-1" />);

    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('New Chat Lead')).toBeInTheDocument();
    });

    const chatLeadNotif = screen.getByText('New Chat Lead').closest('[role="button"]')!;
    fireEvent.click(chatLeadNotif);

    expect(mockUpdate).toHaveBeenCalledWith({ is_read: true });
    expect(mockPush).toHaveBeenCalledWith('/admin/chat-logs');
  });

  it('clicks delete button and does NOT trigger navigation (stopPropagation)', async () => {
    render(<NotificationDropdown userId="admin-1" />);

    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('New Chat Lead')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete notification/i });
    fireEvent.click(deleteButtons[0]);

    expect(mockDelete).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('clicks refresh button and re-fetches notifications', async () => {
    render(<NotificationDropdown userId="admin-1" />);

    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /refresh notifications/i })).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /refresh notifications/i });
    fireEvent.click(refreshButton);

    expect(mockSelect).toHaveBeenCalled();
  });

  it('renders Leads tab and quick action links (Call & WhatsApp) for chat leads', async () => {
    render(<NotificationDropdown userId="admin-1" />);

    const bellButton = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /leads/i })).toBeInTheDocument();
    });

    // Verify Call and WhatsApp quick action links exist for the chat lead
    expect(screen.getByRole('link', { name: /call/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /whatsapp/i })).toBeInTheDocument();

    // Switch to Leads tab
    const leadsTab = screen.getByRole('button', { name: /leads/i });
    fireEvent.click(leadsTab);

    expect(screen.getByText('New Chat Lead')).toBeInTheDocument();
    expect(screen.queryByText('Settings Updated')).not.toBeInTheDocument();
  });
});
