import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IvrAudioPlayerDock } from '@/src/components/admin/leads/IvrAudioPlayerDock';
import * as playerModule from '@/src/lib/leads/recordingPlayer';

describe('IvrAudioPlayerDock Component', () => {
  const SAMPLE_URL = 'http://49.50.77.194/recordings/answered/test.wav';

  beforeEach(() => {
    playerModule.stopAllRecordings();
    vi.restoreAllMocks();
  });

  it('renders nothing when no recording is active', () => {
    const { container } = render(<IvrAudioPlayerDock />);
    expect(container.firstChild).toBeNull();
  });

  it('renders floating dock with customer phone, telecaller and speed when recording starts', () => {
    // Stub HTMLAudioElement play
    window.HTMLMediaElement.prototype.play = vi.fn().mockImplementation(() => Promise.resolve());
    window.HTMLMediaElement.prototype.pause = vi.fn();

    playerModule.toggleCallRecording(SAMPLE_URL, {
      customerPhone: '8954636641',
      agentName: 'Rashmi Shakya',
    });

    render(<IvrAudioPlayerDock />);

    expect(screen.getByText('+91 8954636641')).toBeDefined();
    expect(screen.getByText('Rashmi Shakya')).toBeDefined();
    expect(screen.getByText('1x')).toBeDefined();
    expect(screen.getByRole('button', { name: /forward 10 seconds/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /rewind 10 seconds/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /close audio player/i })).toBeDefined();
  });

  it('allows cycling playback speed (1x -> 1.25x -> 1.5x -> 2x)', () => {
    window.HTMLMediaElement.prototype.play = vi.fn().mockImplementation(() => Promise.resolve());
    window.HTMLMediaElement.prototype.pause = vi.fn();

    playerModule.toggleCallRecording(SAMPLE_URL, {
      customerPhone: '8954636641',
      agentName: 'Rashmi Shakya',
    });

    render(<IvrAudioPlayerDock />);

    const speedBtn = screen.getByTitle('Change playback speed');
    expect(speedBtn.textContent).toBe('1x');

    fireEvent.click(speedBtn);
    expect(speedBtn.textContent).toBe('1.25x');

    fireEvent.click(speedBtn);
    expect(speedBtn.textContent).toBe('1.5x');

    fireEvent.click(speedBtn);
    expect(speedBtn.textContent).toBe('2x');
  });

  it('stops playback and dismisses dock when close button is clicked', () => {
    window.HTMLMediaElement.prototype.play = vi.fn().mockImplementation(() => Promise.resolve());
    window.HTMLMediaElement.prototype.pause = vi.fn();

    playerModule.toggleCallRecording(SAMPLE_URL, {
      customerPhone: '8954636641',
    });

    const { rerender, container } = render(<IvrAudioPlayerDock />);
    expect(screen.getByText('+91 8954636641')).toBeDefined();

    const closeBtn = screen.getByRole('button', { name: /close audio player/i });
    fireEvent.click(closeBtn);

    rerender(<IvrAudioPlayerDock />);
    expect(container.firstChild).toBeNull();
  });
});
