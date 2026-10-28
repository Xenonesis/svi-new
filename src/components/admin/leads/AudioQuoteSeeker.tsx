'use client';

import React, { useRef, useState } from 'react';
import { Play, Pause, Flame } from 'lucide-react';

interface AudioQuoteSeekerProps {
  audioUrl: string;
  startSec: number;
  endSec: number;
  quote: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const AudioQuoteSeeker: React.FC<AudioQuoteSeekerProps> = ({
  audioUrl,
  startSec,
  endSec,
  quote,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.currentTime = startSec;
      void audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && audioRef.current.currentTime >= endSec) {
      audioRef.current.pause();
      setIsPlaying(false);
      audioRef.current.currentTime = startSec;
    }
  };

  return (
    <div className="rounded-xl border border-[#d4af37]/30 bg-[#080b11] p-3 shadow-lg">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        preload="none"
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#d4af37] text-black transition-transform hover:scale-105 active:scale-95"
          aria-label={isPlaying ? 'Pause snippet' : 'Play key quote'}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#d4af37]">
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            <span>
              High-Intent Quote ({formatTime(startSec)} - {formatTime(endSec)})
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-slate-300 italic">"{quote}"</p>
        </div>
      </div>
    </div>
  );
};
