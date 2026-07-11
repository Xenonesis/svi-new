'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Send, Square, Mic, MicOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

interface ChatInputProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled: boolean;
  placeholder: string;
  footerText: string;
}

export default function ChatInput({
  input,
  setInput,
  onSubmit,
  onStop,
  isStreaming,
  disabled,
  placeholder,
  footerText,
}: ChatInputProps) {
  const t = useTranslations('chatbot');
  const inputRef = useRef<HTMLInputElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) setHasSpeechSupport(true);
    }
  }, []);

  const toggleVoice = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      toast.error(t('voiceNotSupported') || 'Speech recognition is not supported.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new (SpeechRecognitionAPI as any)();
    const isHindi = window.location.pathname.includes('/hi');
    recognition.lang = isHindi ? 'hi-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === 'not-allowed') {
        toast.error(t('voiceNotAllowed') || 'Microphone permission denied.');
      } else if (event.error === 'no-speech') {
        toast.error(t('voiceNoSpeech') || 'No speech detected.');
      } else if (event.error === 'audio-capture') {
        toast.error(t('voiceAudioCapture') || 'No microphone detected.');
      } else {
        toast.error(t('voiceError') || `Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  }, [isListening, t, setInput]);

  return (
    <form
      onSubmit={onSubmit}
      className="border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900"
    >
      <div className="flex items-center gap-2">
        {hasSpeechSupport && (
          <button
            type="button"
            onClick={toggleVoice}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${
              isListening
                ? 'animate-pulse bg-red-500 text-white hover:bg-red-600'
                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300'
            }`}
            aria-label={isListening ? 'Stop recording' : 'Voice input'}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
        )}

        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="focus:border-brand-gold focus:ring-brand-gold/20 dark:focus:border-brand-gold flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 transition-all placeholder:text-gray-400 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:placeholder:text-gray-500"
          aria-label="Type your message"
        />

        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white transition-all hover:bg-red-600"
            aria-label="Stop generating"
          >
            <Square className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim() || disabled}
            className="bg-brand-navy hover:bg-brand-navy-light dark:bg-brand-gold dark:text-brand-navy dark:hover:bg-brand-gold-light flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition-all disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        )}
      </div>
      <p className="mt-2 text-center text-[10px] text-gray-400 dark:text-gray-500">{footerText}</p>
    </form>
  );
}
