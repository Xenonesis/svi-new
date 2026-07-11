'use client';

import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface ChatFeedbackProps {
  messageId: string;
  value: 'up' | 'down' | null;
  onChange: (messageId: string, type: 'up' | 'down') => void;
}

export default function ChatFeedback({ messageId, value, onChange }: ChatFeedbackProps) {
  return (
    <div className="mt-1 flex items-center gap-1.5 pl-1">
      <button
        onClick={() => onChange(messageId, 'up')}
        className={`rounded-md p-1 transition-colors ${
          value === 'up'
            ? 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400'
            : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300'
        }`}
        aria-label="Thumbs up"
      >
        <ThumbsUp className="h-3 w-3" />
      </button>
      <button
        onClick={() => onChange(messageId, 'down')}
        className={`rounded-md p-1 transition-colors ${
          value === 'down'
            ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
            : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300'
        }`}
        aria-label="Thumbs down"
      >
        <ThumbsDown className="h-3 w-3" />
      </button>
    </div>
  );
}
