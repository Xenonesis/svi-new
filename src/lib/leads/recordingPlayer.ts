'use client';

import { useSyncExternalStore } from 'react';
import { toast } from 'sonner';
import { buildRecordingProxyUrl } from './recordingProxy';

export interface RecordingMeta {
  customerPhone?: string;
  agentName?: string;
  callRecordId?: string;
}

export interface RecordingPlayerState {
  /** The currently active upstream recording URL, or null if idle */
  activeUrl: string | null;
  /** Whether playback is actively running or loading */
  isPlaying: boolean;
  isLoading: boolean;
  /** Current playback time in seconds */
  currentTime: number;
  /** Audio duration in seconds */
  duration: number;
  /** Playback rate (1, 1.5, or 2) */
  playbackRate: number;
  /** Metadata of the lead being played */
  meta: RecordingMeta | null;
}

let activeAudioElement: HTMLAudioElement | null = null;
let currentState: RecordingPlayerState = {
  activeUrl: null,
  isPlaying: false,
  isLoading: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1,
  meta: null,
};

const listeners = new Set<() => void>();

function emitChange(nextState: Partial<RecordingPlayerState>) {
  currentState = { ...currentState, ...nextState };
  listeners.forEach((listener) => listener());
}

/**
 * Global stop function for call recordings.
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
  emitChange({
    activeUrl: null,
    isPlaying: false,
    isLoading: false,
    currentTime: 0,
    duration: 0,
    meta: null,
  });
}

/**
 * Seek to a specific timestamp in seconds.
 */
export function seekRecording(seconds: number) {
  if (!activeAudioElement || isNaN(seconds)) return;
  const targetTime = Math.max(0, Math.min(seconds, activeAudioElement.duration || seconds));
  try {
    activeAudioElement.currentTime = targetTime;
    emitChange({ currentTime: targetTime });
  } catch {
    // Ignore seek error
  }
}

/**
 * Skip relative seconds forward or backward (e.g. +10 or -10).
 */
export function skipRecording(deltaSeconds: number) {
  if (!activeAudioElement) return;
  seekRecording((activeAudioElement.currentTime || 0) + deltaSeconds);
}

/**
 * Change playback speed (e.g. 1, 1.25, 1.5, 2).
 */
export function setRecordingPlaybackRate(rate: number) {
  if (!activeAudioElement) return;
  try {
    activeAudioElement.playbackRate = rate;
    emitChange({ playbackRate: rate });
  } catch {
    // Ignore rate error
  }
}

/**
 * Pause or resume the currently loaded recording.
 */
export function togglePlayPause() {
  if (!activeAudioElement || !currentState.activeUrl) return;

  if (activeAudioElement.paused) {
    activeAudioElement.play().catch(() => {
      toast.error('Unable to resume playback');
    });
  } else {
    activeAudioElement.pause();
    emitChange({ isPlaying: false });
  }
}

/**
 * Toggles inline audio playback for a given upstream recording URL.
 * Routes requests through the same-origin proxy to eliminate mixed-content and naked-IP issues.
 */
export function toggleCallRecording(rawUrl: string | null | undefined, meta?: RecordingMeta) {
  if (!rawUrl) return;

  // 1. If currently playing this exact URL, pause and stop
  if (currentState.activeUrl === rawUrl && activeAudioElement) {
    stopAllRecordings();
    return;
  }

  // 2. Stop any other audio that was playing
  stopAllRecordings();

  // 3. Resolve proxy URL
  const proxyUrl = buildRecordingProxyUrl(rawUrl, meta?.customerPhone);
  if (!proxyUrl) {
    toast.error('Unable to play recording: unauthorized or invalid audio URL');
    return;
  }

  emitChange({
    activeUrl: rawUrl,
    isPlaying: false,
    isLoading: true,
    currentTime: 0,
    duration: 0,
    playbackRate: 1,
    meta: meta || null,
  });

  const audio = new Audio();
  activeAudioElement = audio;
  audio.preload = 'metadata';

  audio.addEventListener('loadedmetadata', () => {
    if (activeAudioElement === audio) {
      emitChange({ duration: audio.duration || 0 });
    }
  });

  audio.addEventListener('timeupdate', () => {
    if (activeAudioElement === audio) {
      emitChange({
        currentTime: audio.currentTime || 0,
        duration: audio.duration || currentState.duration || 0,
      });
    }
  });

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

  audio.addEventListener('pause', () => {
    if (activeAudioElement === audio && currentState.activeUrl === rawUrl) {
      emitChange({ isPlaying: false });
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
      toast.error('Failed to load call recording. Please check telephony connection.');
    }
  });

  audio.src = proxyUrl;
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch((err: unknown) => {
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
 * Used by individual row buttons to know their own play/pause state.
 */
export function useRecordingPlayer(targetUrl?: string | null) {
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
    state,
    isPlaying,
    isLoading,
    toggle: (meta?: RecordingMeta) => toggleCallRecording(targetUrl, meta),
    stop: stopAllRecordings,
  };
}

/**
 * Hook to access full player state for global docks/drawers.
 */
export function useActiveRecordingState() {
  return useSyncExternalStore(
    (callback) => {
      listeners.add(callback);
      return () => {
        listeners.delete(callback);
      };
    },
    () => currentState,
    () => currentState
  );
}
