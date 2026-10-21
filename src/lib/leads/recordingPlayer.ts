'use client';

import { useSyncExternalStore } from 'react';
import { toast } from 'sonner';
import { buildRecordingProxyUrl } from './recordingProxy';

export interface RecordingPlayerState {
  /** The currently active upstream recording URL, or null if idle */
  activeUrl: string | null;
  /** Whether playback is actively running or loading */
  isPlaying: boolean;
  isLoading: boolean;
}

let activeAudioElement: HTMLAudioElement | null = null;
let currentState: RecordingPlayerState = {
  activeUrl: null,
  isPlaying: false,
  isLoading: false,
};

const listeners = new Set<() => void>();

function emitChange(nextState: Partial<RecordingPlayerState>) {
  currentState = { ...currentState, ...nextState };
  listeners.forEach((listener) => listener());
}

/**
 * Global stop function for call recordings.
 * Can be called during page navigations or unmounts.
 */
export function stopAllRecordings() {
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.src = '';
    } catch {
      // Ignore cleanup error
    }
    activeAudioElement = null;
  }
  emitChange({ activeUrl: null, isPlaying: false, isLoading: false });
}

/**
 * Toggles inline audio playback for a given upstream recording URL.
 * Routes requests through the same-origin proxy to eliminate mixed-content and naked-IP issues.
 */
export function toggleCallRecording(rawUrl: string | null | undefined) {
  if (!rawUrl) return;

  // 1. If currently playing this exact URL, pause and stop
  if (currentState.activeUrl === rawUrl && activeAudioElement) {
    stopAllRecordings();
    return;
  }

  // 2. Stop any other audio that was playing
  stopAllRecordings();

  // 3. Resolve proxy URL
  const proxyUrl = buildRecordingProxyUrl(rawUrl);
  if (!proxyUrl) {
    toast.error('Unable to play recording: unauthorized or invalid audio URL');
    return;
  }

  emitChange({ activeUrl: rawUrl, isPlaying: false, isLoading: true });

  const audio = new Audio();
  activeAudioElement = audio;
  audio.preload = 'auto';

  audio.addEventListener('canplay', () => {
    if (activeAudioElement === audio) {
      emitChange({ isPlaying: true, isLoading: false });
    }
  });

  audio.addEventListener('playing', () => {
    if (activeAudioElement === audio) {
      emitChange({ isPlaying: true, isLoading: false });
    }
  });

  audio.addEventListener('ended', () => {
    if (activeAudioElement === audio) {
      stopAllRecordings();
    }
  });

  audio.addEventListener('error', () => {
    if (activeAudioElement === audio) {
      stopAllRecordings();
      toast.error('Failed to load call recording. Please check connection.');
    }
  });

  audio.src = proxyUrl;
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch((err: unknown) => {
      // Autoplay or user gesture abort
      if (activeAudioElement === audio) {
        stopAllRecordings();
        const msg = err instanceof Error ? err.message : '';
        if (!msg.includes('abort') && !msg.includes('pause')) {
          toast.error('Call recording playback was interrupted or blocked');
        }
      }
    });
  }
}

/**
 * React hook subscribing to global single-instance recording playback.
 * Ensures consistent play/pause state across desktop table rows, mobile cards, and drawer.
 */
export function useRecordingPlayer(targetUrl: string | null | undefined) {
  const state = useSyncExternalStore(
    (callback) => {
      listeners.add(callback);
      return () => {
        listeners.delete(callback);
      };
    },
    () => currentState,
    () => currentState // SSR snapshot
  );

  const isCurrentActive = Boolean(targetUrl && state.activeUrl === targetUrl);
  const isPlaying = isCurrentActive && state.isPlaying;
  const isLoading = isCurrentActive && state.isLoading;

  return {
    isPlaying,
    isLoading,
    toggle: () => toggleCallRecording(targetUrl),
    stop: stopAllRecordings,
  };
}
