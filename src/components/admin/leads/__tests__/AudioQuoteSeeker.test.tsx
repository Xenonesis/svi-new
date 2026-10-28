import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AudioQuoteSeeker } from '../AudioQuoteSeeker';

describe('AudioQuoteSeeker', () => {
  it('renders quote text and time offsets', () => {
    render(
      <AudioQuoteSeeker
        audioUrl="https://example.com/test.mp3"
        startSec={42}
        endSec={68}
        quote="A-Block plot final hai, token ready hai"
      />
    );
    expect(screen.getByText(/A-Block plot final hai/i)).toBeDefined();
    expect(screen.getByText(/00:42 - 01:08/i)).toBeDefined();
  });

  it('toggles play and pause on button click', () => {
    const playStub = vi
      .spyOn(window.HTMLMediaElement.prototype, 'play')
      .mockImplementation(() => Promise.resolve());
    const pauseStub = vi
      .spyOn(window.HTMLMediaElement.prototype, 'pause')
      .mockImplementation(() => {});

    render(
      <AudioQuoteSeeker
        audioUrl="https://example.com/test.mp3"
        startSec={10}
        endSec={25}
        quote="Checking plot size"
      />
    );

    const button = screen.getByRole('button', { name: /Play key quote/i });
    fireEvent.click(button);

    expect(playStub).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /Pause snippet/i })).toBeDefined();

    fireEvent.click(button);
    expect(pauseStub).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /Play key quote/i })).toBeDefined();

    playStub.mockRestore();
    pauseStub.mockRestore();
  });

  it('stops playback and resets time when currentTime exceeds endSec', () => {
    const playStub = vi
      .spyOn(window.HTMLMediaElement.prototype, 'play')
      .mockImplementation(() => Promise.resolve());
    const pauseStub = vi
      .spyOn(window.HTMLMediaElement.prototype, 'pause')
      .mockImplementation(() => {});

    const { container } = render(
      <AudioQuoteSeeker
        audioUrl="https://example.com/test.mp3"
        startSec={10}
        endSec={25}
        quote="Checking plot size"
      />
    );

    const button = screen.getByRole('button', { name: /Play key quote/i });
    fireEvent.click(button);

    const audioElement = container.querySelector('audio');
    expect(audioElement).not.toBeNull();

    if (audioElement) {
      audioElement.currentTime = 25;
      fireEvent.timeUpdate(audioElement);
    }

    expect(pauseStub).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /Play key quote/i })).toBeDefined();

    playStub.mockRestore();
    pauseStub.mockRestore();
  });

  it('resets playing state when audio ends', () => {
    vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());

    const { container } = render(
      <AudioQuoteSeeker
        audioUrl="https://example.com/test.mp3"
        startSec={10}
        endSec={25}
        quote="Checking plot size"
      />
    );

    const button = screen.getByRole('button', { name: /Play key quote/i });
    fireEvent.click(button);
    expect(screen.getByRole('button', { name: /Pause snippet/i })).toBeDefined();

    const audioElement = container.querySelector('audio');
    if (audioElement) {
      fireEvent.ended(audioElement);
    }

    expect(screen.getByRole('button', { name: /Play key quote/i })).toBeDefined();
  });
});
