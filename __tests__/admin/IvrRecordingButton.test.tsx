import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IvrRecordingButton } from '@/src/components/admin/leads/table/IvrRecordingButton';
import * as playerModule from '@/src/lib/leads/recordingPlayer';

describe('IvrRecordingButton Component', () => {
  const SAMPLE_URL = 'http://49.50.77.194/recordings/answered/test.wav';

  beforeEach(() => {
    playerModule.stopAllRecordings();
    vi.restoreAllMocks();
  });

  it('renders nothing when recordingUrl is missing or empty', () => {
    const { container } = render(<IvrRecordingButton recordingUrl={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders icon button with title="Listen to Call Recording (.wav)" when idle', () => {
    render(<IvrRecordingButton recordingUrl={SAMPLE_URL} variant="icon" />);
    const btn = screen.getByRole('button', { name: /listen to call recording/i });
    expect(btn).toBeDefined();
    expect(btn.getAttribute('title')).toBe('Listen to Call Recording (.wav)');
  });

  it('invokes toggle and activates player on click', () => {
    // Stub HTMLAudioElement play in jsdom environment
    window.HTMLMediaElement.prototype.play = vi.fn().mockImplementation(() => Promise.resolve());
    window.HTMLMediaElement.prototype.pause = vi.fn();

    render(<IvrRecordingButton recordingUrl={SAMPLE_URL} variant="icon" />);
    const btn = screen.getByRole('button', { name: /listen to call recording/i });
    fireEvent.click(btn);

    // Player should activate this URL
    expect(playerModule.toggleCallRecording).toBeDefined();
  });

  it('renders pill variant with label for mobile cards and drawer', () => {
    render(<IvrRecordingButton recordingUrl={SAMPLE_URL} variant="pill" />);
    expect(screen.getByText('Call Recording')).toBeDefined();
  });
});
