'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  X,
  Volume2,
  Phone,
  User,
  Loader2,
  Download,
} from 'lucide-react';
import {
  useActiveRecordingState,
  togglePlayPause,
  seekRecording,
  skipRecording,
  setRecordingPlaybackRate,
  stopAllRecordings,
} from '@/src/lib/leads/recordingPlayer';
import { buildRecordingProxyUrl } from '@/src/lib/leads/recordingProxy';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

const SPEED_OPTIONS = [1, 1.25, 1.5, 2];

/**
 * Enterprise Floating Luxury Audio Player Dock
 * Slides up from the bottom of the viewport whenever a call recording is active.
 *
 * Allows telecallers and sales managers to:
 * - Scrub/seek through the recording timeline seamlessly
 * - Speed up playback (1x, 1.25x, 1.5x, 2x) for rapid call audits
 * - Jump -10s / +10s to re-listen to critical client statements
 * - Download the recording locally (.wav)
 * - Continue listening in the background while taking notes in LeadDrawer or browsing leads!
 */
export function IvrAudioPlayerDock() {
  const { activeUrl, isPlaying, isLoading, currentTime, duration, playbackRate, meta } =
    useActiveRecordingState();
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);

  if (!activeUrl) return null;

  const currentDisplayTime = isScrubbing ? scrubValue : currentTime;
  const progressPercent = duration > 0 ? (currentDisplayTime / duration) * 100 : 0;
  const proxyDownloadUrl = buildRecordingProxyUrl(activeUrl);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setScrubValue(val);
  };

  const handleSliderCommit = () => {
    seekRecording(scrubValue);
    setIsScrubbing(false);
  };

  const handleCycleSpeed = () => {
    const nextIdx = (SPEED_OPTIONS.indexOf(playbackRate) + 1) % SPEED_OPTIONS.length;
    setRecordingPlaybackRate(SPEED_OPTIONS[nextIdx]);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        className="fixed bottom-4 left-1/2 z-50 w-[95vw] max-w-3xl -translate-x-1/2"
        role="region"
        aria-label="Call Recording Audio Player Dock"
      >
        <div className="relative flex flex-col gap-2 rounded-2xl border border-amber-500/30 bg-[#0d111a]/95 p-3.5 shadow-2xl backdrop-blur-xl dark:bg-[#090d15]/95">
          {/* Subtle gold ambient top border glow */}
          <div className="pointer-events-none absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

          {/* Top Row: Lead Info + Controls + Speed + Close */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Lead & Telecaller Identity */}
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-500">
                <Volume2 className={`h-4 w-4 ${isPlaying ? 'animate-pulse text-amber-400' : ''}`} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-amber-400" />
                  <span className="truncate font-mono text-xs font-bold text-white">
                    {meta?.customerPhone ? `+91 ${meta.customerPhone}` : 'Call Recording'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                  <User className="h-2.5 w-2.5" />
                  <span className="truncate">{meta?.agentName || 'IVR Inbound / Telecalling'}</span>
                </div>
              </div>
            </div>

            {/* Core Playback Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Skip -10s */}
              <button
                type="button"
                onClick={() => skipRecording(-10)}
                title="Rewind 10 seconds"
                aria-label="Rewind 10 seconds"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              {/* Main Play / Pause Button */}
              <button
                type="button"
                onClick={togglePlayPause}
                title={isPlaying ? 'Pause' : 'Play'}
                aria-label={isPlaying ? 'Pause recording' : 'Play recording'}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-400 to-amber-600 text-[#0a0a0f] shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#0a0a0f]" />
                ) : isPlaying ? (
                  <Pause className="h-4 w-4 fill-current" />
                ) : (
                  <Play className="ml-0.5 h-4 w-4 fill-current" />
                )}
              </button>

              {/* Skip +10s */}
              <button
                type="button"
                onClick={() => skipRecording(10)}
                title="Forward 10 seconds"
                aria-label="Forward 10 seconds"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <RotateCw className="h-4 w-4" />
              </button>

              {/* Speed Pill (1x, 1.25x, 1.5x, 2x) */}
              <button
                type="button"
                onClick={handleCycleSpeed}
                title="Change playback speed"
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 font-mono text-[11px] font-bold text-amber-400 transition-colors hover:border-amber-500/40 hover:bg-white/10"
              >
                {playbackRate}x
              </button>

              {/* Download .WAV Button */}
              {proxyDownloadUrl && (
                <a
                  href={proxyDownloadUrl}
                  download={
                    meta?.customerPhone
                      ? `call_recording_${meta.customerPhone}.wav`
                      : 'call_recording.wav'
                  }
                  title="Download .wav audio"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-white/10 hover:text-amber-400"
                >
                  <Download className="h-3.5 w-3.5" />
                </a>
              )}

              {/* Close Dock (✕) */}
              <button
                type="button"
                onClick={stopAllRecordings}
                title="Close player"
                aria-label="Close audio player"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-rose-500/20 hover:text-rose-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Bottom Row: Scrubber Timeline Bar */}
          <div className="flex items-center gap-3 pt-0.5">
            <span className="w-10 text-right font-mono text-[10px] text-gray-400">
              {formatTime(currentDisplayTime)}
            </span>

            <div className="relative flex-1">
              {/* Visual Track */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-100"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Interactive Range Input */}
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.5}
                value={currentDisplayTime}
                onMouseDown={() => setIsScrubbing(true)}
                onTouchStart={() => setIsScrubbing(true)}
                onChange={handleSliderChange}
                onMouseUp={handleSliderCommit}
                onTouchEnd={handleSliderCommit}
                aria-label="Audio scrubber"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </div>

            <span className="w-10 font-mono text-[10px] text-gray-400">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
