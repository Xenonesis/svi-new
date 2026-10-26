'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  X,
  Copy,
  Check,
  RefreshCw,
  Phone,
  User,
  Clock,
  Flame,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Target,
  DollarSign,
  Compass,
  PhoneCall,
  MessageCircle,
  ExternalLink,
  Play,
  Award,
  Lightbulb,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import type { CallIntelligence } from '@/src/lib/leads/callIntelligence';
import { buildWhatsAppLink } from '@/src/lib/utils/whatsappTemplates';
import {
  seekRecording,
  useActiveRecordingState,
  toggleCallRecording,
} from '@/src/lib/leads/recordingPlayer';
export interface AiCallSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordingUrl: string | null;
  customerPhone?: string;
  agentName?: string;
  callRecordId?: string;
  initialIntelligence?: CallIntelligence;
}

function formatDuration(seconds?: number): string {
  if (!seconds || isNaN(seconds) || seconds <= 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function AiCallSummaryModal({
  isOpen,
  onClose,
  recordingUrl,
  customerPhone,
  agentName,
  callRecordId,
  initialIntelligence,
}: AiCallSummaryModalProps) {
  const [intelligence, setIntelligence] = useState<CallIntelligence | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFullTranscript, setShowFullTranscript] = useState(false);
  const [transcriptViewMode, setTranscriptViewMode] = useState<'dialogue' | 'raw'>('dialogue');
  const [isSeparatingDialogue, setIsSeparatingDialogue] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { currentTime, isPlaying, activeUrl } = useActiveRecordingState();
  useEffect(() => {
    setMounted(true);
  }, []);

  const cleanPhone = useMemo(() => {
    return (customerPhone || '').replace(/\D/g, '').slice(-10);
  }, [customerPhone]);

  const fetchIntelligence = useCallback(
    async (force = false) => {
      if (!recordingUrl && !callRecordId) return;

      setIsLoading(true);
      setError(null);

      try {
        // If not force refresh, attempt GET for cached data first
        if (!force && callRecordId) {
          const checkRes = await fetch(
            `/api/admin/leads/call-intelligence?callRecordId=${encodeURIComponent(callRecordId)}`
          );
          if (checkRes.ok) {
            const checkData = await checkRes.json();
            if (checkData.cached && checkData.intelligence) {
              setIntelligence(checkData.intelligence);
              setIsLoading(false);
              return;
            }
          }
        }

        // Run full AI pipeline via POST
        const res = await fetch('/api/admin/leads/call-intelligence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callRecordId,
            customerPhone,
            recordingUrl,
            forceRefresh: force,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Failed to analyze recording (HTTP ${res.status})`);
        }

        const data = await res.json();
        if (data.intelligence) {
          setIntelligence(data.intelligence);
          if (force) {
            toast.success('AI summary refreshed successfully!');
          }
        } else {
          throw new Error('No intelligence returned from AI engine');
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Analysis failed';
        setError(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [callRecordId, customerPhone, recordingUrl]
  );

  useEffect(() => {
    if (isOpen) {
      if (initialIntelligence) {
        setIntelligence(initialIntelligence);
        setIsLoading(false);
        return;
      }
      setIntelligence(null);
      setError(null);
      setShowFullTranscript(false);
      void fetchIntelligence(false);
    }
  }, [isOpen, fetchIntelligence, initialIntelligence]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopySummary = () => {
    if (!intelligence) return;
    const textToCopy =
      `📞 Call with +91 ${cleanPhone || 'Customer'}\n` +
      `👤 Telecaller: ${agentName || 'Advisor'}\n` +
      `🔥 Interest: ${intelligence.interest_level} | Sentiment: ${intelligence.sentiment}\n` +
      `📌 Summary: ${intelligence.summary}\n` +
      `💰 Budget: ${intelligence.budget || 'Not specified'}\n` +
      `🏡 Property: ${intelligence.property_interest || 'N/A'}\n` +
      `🎯 Action: ${intelligence.recommended_action}`;

    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    toast.success('Summary copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleWhatsAppFollowUp = () => {
    if (!cleanPhone) {
      toast.error('Customer phone number not available');
      return;
    }
    const link = buildWhatsAppLink(cleanPhone, 'brochure', {
      clientName: undefined,
      advisorName: agentName,
    });
    window.open(link, '_blank', 'noopener,noreferrer');
    toast.success(`WhatsApp follow-up opened for +91 ${cleanPhone}`);
  };

  const handleSendWhatsAppRecap = () => {
    if (!cleanPhone) {
      toast.error('Customer phone number not available');
      return;
    }
    const messageText =
      intelligence?.whatsapp_recap ||
      `Namaste Sir, aaj SVI Infra se hamari call par baat hui thi. Aapki requirement ke mutabiq Shivani Vatika (Khatu Shyam / Ring Road) ki details:\n\n• Plot: ${intelligence?.property_interest || '100 Gaj'}\n• Rate: As discussed\n• Approved Gated Township, Instant Registry\n\nOfficial Brochure: https://sviinfra.com/brochure\n\nKoi bhi sawaal ho toh reply karein.\n— ${agentName || 'Advisor'}, SVI Infra`;
    const fullPhone = `91${cleanPhone}`;
    const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    toast.success(`WhatsApp call recap opened for +91 ${cleanPhone}`);
  };

  // Helper to extract crisp key takeaways from the summary
  const keyTakeaways = useMemo(() => {
    if (!intelligence?.summary) return [];
    // Split sentences or key topics
    const sentences = intelligence.summary
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    return sentences;
  }, [intelligence]);
  // Reconstruct turn-by-turn dialogue from structured response or formatted transcript
  const parsedDialogue = useMemo(() => {
    if (intelligence?.dialogue && intelligence.dialogue.length > 0) {
      return intelligence.dialogue;
    }
    if (!intelligence?.transcript) return [];

    const lines = intelligence.transcript.split(/\n+/);
    const turns: Array<{ speaker: 'Telecaller' | 'Customer'; text: string; start_time?: number }> =
      [];
    const duration = intelligence.duration || 0;

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (!trimmed) continue;
      const estimatedStart = duration > 0 ? Math.round((i / lines.length) * duration) : undefined;

      if (/^(Telecaller|Advisor|Agent)\s*:/i.test(trimmed)) {
        turns.push({
          speaker: 'Telecaller',
          text: trimmed.replace(/^(Telecaller|Advisor|Agent)\s*:\s*/i, '').trim(),
          start_time: estimatedStart,
        });
      } else if (/^(Customer|Client|Lead)\s*:/i.test(trimmed)) {
        turns.push({
          speaker: 'Customer',
          text: trimmed.replace(/^(Customer|Client|Lead)\s*:\s*/i, '').trim(),
          start_time: estimatedStart,
        });
      } else if (turns.length > 0) {
        turns[turns.length - 1].text += ' ' + trimmed;
      }
    }

    return turns;
  }, [intelligence]);

  const handleCopyTranscript = () => {
    const text =
      parsedDialogue.length > 0
        ? parsedDialogue
            .map(
              (t) =>
                `${t.speaker === 'Telecaller' ? agentName || 'Telecaller' : 'Customer'}: ${t.text}`
            )
            .join('\n\n')
        : intelligence?.transcript || '';
    navigator.clipboard.writeText(text);
    toast.success('Transcript copied to clipboard!');
  };
  const handleJumpToTimestamp = (startTime?: number) => {
    if (startTime === undefined || startTime === null) return;
    if (activeUrl !== recordingUrl && recordingUrl) {
      toggleCallRecording(recordingUrl, {
        customerPhone,
        agentName,
        callRecordId,
      });
    }
    seekRecording(startTime);
    toast.success(`Jumped audio to ${formatDuration(startTime)}`);
  };

  const triggerAutoSeparation = useCallback(async () => {
    if (!intelligence?.transcript || isSeparatingDialogue) return;
    setIsSeparatingDialogue(true);
    try {
      const res = await fetch('/api/admin/leads/call-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'separate_dialogue',
          transcript: intelligence.raw_transcript || intelligence.transcript,
          agentName,
          customerPhone,
          callRecordId,
          duration: intelligence.duration,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.dialogue) && data.dialogue.length > 0) {
          setIntelligence((prev) => (prev ? { ...prev, dialogue: data.dialogue } : prev));
          toast.success('Advisor vs Customer dialogue separated successfully!');
        }
      }
    } catch (err) {
      console.warn('Auto-separation error:', err);
    } finally {
      setIsSeparatingDialogue(false);
    }
  }, [intelligence, isSeparatingDialogue, agentName, customerPhone, callRecordId]);

  // Automatically trigger separation when accordion is expanded if dialogue turns are missing
  useEffect(() => {
    if (
      showFullTranscript &&
      parsedDialogue.length === 0 &&
      intelligence?.transcript &&
      !isSeparatingDialogue
    ) {
      void triggerAutoSeparation();
    }
  }, [
    showFullTranscript,
    parsedDialogue.length,
    intelligence?.transcript,
    isSeparatingDialogue,
    triggerAutoSeparation,
  ]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="AI Call Intelligence & Summary"
        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6"
      >
        {/* Backdrop (Adapts to Light / Dark) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-md dark:bg-black/80"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative flex h-auto max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white !font-sans text-gray-900 shadow-2xl shadow-gray-900/20 transition-colors duration-200 sm:max-h-[82vh] dark:border-amber-500/30 dark:bg-[#0a0e17] dark:text-white dark:shadow-2xl dark:shadow-amber-950/20"
        >
          {/* Top Gold Foil Accent Border */}
          <div className="pointer-events-none absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />

          {/* Modal Header */}
          <div className="z-10 flex shrink-0 items-center justify-between border-b border-gray-100 bg-white/95 px-5 py-3.5 backdrop-blur-sm sm:px-6 dark:border-white/10 dark:bg-[#0a0e17]/95">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-600 shadow-inner dark:text-amber-400">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <h2 className="!font-sans text-base font-bold tracking-tight text-gray-900 dark:text-white">
                  AI Call Intelligence & Voice Insights
                </h2>
                <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1 font-mono font-medium text-gray-700 dark:text-gray-200">
                    <Phone className="h-3 w-3 text-amber-500" />
                    +91 {cleanPhone || 'Unknown'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-medium text-gray-600 dark:text-gray-300">
                    <User className="h-3 w-3 text-gray-400" />
                    {agentName || 'Telecaller'}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-white/10 dark:hover:text-white"
              title="Close modal"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="custom-scrollbar min-h-0 flex-1 space-y-3.5 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
            {isLoading && (
              <div className="flex flex-col items-center justify-center space-y-3 py-12 text-center">
                <div className="relative">
                  <div className="h-12 w-12 animate-spin rounded-full border-2 border-amber-500/20 border-t-amber-500" />
                  <Sparkles className="absolute inset-0 m-auto h-5 w-5 animate-pulse text-amber-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Transcribing & Analyzing Call...
                  </p>
                  <p className="max-w-sm text-xs text-gray-500 dark:text-gray-400">
                    Processing audio with Groq Whisper & analyzing sales intent via LLM
                  </p>
                </div>
              </div>
            )}

            {error && !isLoading && (
              <div className="space-y-2 rounded-xl border border-rose-500/30 bg-rose-50 p-4 text-center dark:bg-rose-500/10">
                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-rose-600 dark:text-rose-400">
                  <AlertCircle className="h-4 w-4" />
                  <span>Analysis Error</span>
                </div>
                <p className="text-xs text-rose-700 dark:text-gray-300">{error}</p>
                <button
                  type="button"
                  onClick={() => fetchIntelligence(true)}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-800 transition-colors hover:bg-rose-200 dark:bg-rose-500/20 dark:text-rose-200 dark:hover:bg-rose-500/30"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry Analysis
                </button>
              </div>
            )}

            {intelligence && !isLoading && (
              <>
                {/* 1. Badges & Call Metrics Row */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Lead Temperature Badge */}
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold tracking-wider uppercase ${
                      intelligence.interest_level === 'Hot'
                        ? 'border border-rose-500/40 bg-rose-50 text-rose-700 shadow-xs dark:bg-rose-500/10 dark:text-rose-400'
                        : intelligence.interest_level === 'Warm'
                          ? 'border border-amber-500/40 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                          : 'border border-gray-300 bg-gray-100 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    <Flame className="h-3.5 w-3.5" />
                    <span>{intelligence.interest_level} Lead</span>
                  </div>

                  {/* Sentiment Badge */}
                  <div className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
                    <TrendingUp className="h-3 w-3" />
                    <span>Sentiment: {intelligence.sentiment}</span>
                  </div>

                  {/* Intent Badge */}
                  <div className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
                    <Target className="h-3 w-3" />
                    <span>{intelligence.intent}</span>
                  </div>

                  {/* Audio Duration */}
                  {intelligence.duration && (
                    <div className="ml-auto inline-flex items-center gap-1 font-mono text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>{formatDuration(intelligence.duration)}</span>
                    </div>
                  )}
                </div>

                {/* 2. Executive Call Summary Box with Takeaways */}
                <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-50/70 to-amber-100/30 p-4 shadow-sm dark:border-amber-500/20 dark:bg-gradient-to-br dark:from-amber-950/30 dark:via-black/40 dark:to-black/60">
                  <div className="mb-2.5 flex items-center justify-between border-b border-amber-500/20 pb-2">
                    <h3 className="flex items-center gap-1.5 !font-sans text-xs font-bold tracking-wider text-amber-700 uppercase dark:text-amber-400">
                      <Sparkles className="h-3.5 w-3.5" />
                      Call Summary (Main Baatein)
                    </h3>
                    <span className="font-mono text-[10px] text-gray-500">
                      {intelligence.model_used}
                    </span>
                  </div>

                  {/* Scannable Takeaways / Highlights */}
                  {keyTakeaways.length > 1 ? (
                    <div className="space-y-1.5">
                      {keyTakeaways.map((point, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-xs text-gray-800 sm:text-sm dark:text-gray-200"
                        >
                          <span className="shrink-0 font-bold text-amber-500">•</span>
                          <p className="leading-relaxed font-medium">{point}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed font-medium text-gray-800 dark:text-gray-200">
                      {intelligence.summary}
                    </p>
                  )}
                  {/* 2.5. Advisor Quality Scorecard (AI QA & Coaching) */}
                  {intelligence.quality_scorecard && (
                    <div className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-50/50 p-4 dark:border-amber-500/20 dark:bg-amber-950/20">
                      <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-amber-500" />
                          <span className="text-xs font-bold tracking-wider text-amber-800 uppercase dark:text-amber-400">
                            Telecaller Call Audit (Quality Score)
                          </span>
                        </div>
                        <span
                          className={`rounded-lg border px-2 py-0.5 text-xs font-extrabold ${
                            intelligence.quality_scorecard.grade.startsWith('A')
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                              : intelligence.quality_scorecard.grade === 'B'
                                ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                : 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400'
                          }`}
                        >
                          Score: {intelligence.quality_scorecard.overall_score}/10 (
                          {intelligence.quality_scorecard.grade})
                        </span>
                      </div>

                      {/* 3 Metric Scores */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-lg border border-gray-200 bg-white p-2 dark:border-white/10 dark:bg-white/5">
                          <span className="block text-[10px] text-gray-500">Pitch Clarity</span>
                          <span className="text-sm font-black text-gray-900 dark:text-white">
                            {intelligence.quality_scorecard.pitch_clarity}/10
                          </span>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white p-2 dark:border-white/10 dark:bg-white/5">
                          <span className="block text-[10px] text-gray-500">Objections</span>
                          <span className="text-sm font-black text-gray-900 dark:text-white">
                            {intelligence.quality_scorecard.objection_handling}/10
                          </span>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white p-2 dark:border-white/10 dark:bg-white/5">
                          <span className="block text-[10px] text-gray-500">Closing Skill</span>
                          <span className="text-sm font-black text-gray-900 dark:text-white">
                            {intelligence.quality_scorecard.closing_skill}/10
                          </span>
                        </div>
                      </div>

                      {/* Coaching Tip */}
                      {intelligence.quality_scorecard.coaching_tip && (
                        <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 p-2.5 text-xs text-amber-900 dark:text-amber-200">
                          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                          <p className="leading-relaxed">
                            <strong className="text-amber-800 dark:text-amber-300">
                              Coaching Tip:
                            </strong>{' '}
                            {intelligence.quality_scorecard.coaching_tip}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. Key Requirements Grid (Budget & Property) */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {/* Budget Card */}
                  <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-3.5 dark:border-white/10 dark:bg-white/5">
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400/90">
                      <DollarSign className="h-3.5 w-3.5" />
                      <span>Customer Ka Budget</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {intelligence.budget || 'Not specified in call'}
                    </p>
                  </div>

                  {/* Property Interest Card */}
                  <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-3.5 dark:border-white/10 dark:bg-white/5">
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400/90">
                      <Compass className="h-3.5 w-3.5" />
                      <span>Plot Size &amp; Location</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {intelligence.property_interest || 'General Plot / Location Inquiry'}
                    </p>
                  </div>
                </div>

                {/* 4. Recommended Next Action */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/80 p-3.5 dark:border-emerald-500/30 dark:bg-emerald-950/20">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-bold tracking-wider text-emerald-700 uppercase dark:text-emerald-400">
                    <Target className="h-3.5 w-3.5" />
                    <span>Next Step (Kya Karna Hai)</span>
                  </div>
                  <p className="text-sm leading-relaxed font-medium text-emerald-900 dark:text-emerald-200">
                    {intelligence.recommended_action}
                  </p>
                </div>

                {/* 5. Voice-to-Action Bar (Direct Call & WhatsApp) */}
                {cleanPhone && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 dark:border-white/10 dark:bg-white/[0.02]">
                    <div className="mb-2.5 text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-400">
                      🚀 Quick Follow-up Actions
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Direct Re-dial Button */}
                      <a
                        href={`tel:+91${cleanPhone}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
                      >
                        <PhoneCall className="h-3.5 w-3.5" />
                        <span>Call +91 {cleanPhone}</span>
                      </a>

                      {/* 1-Click WhatsApp Smart Call Recap */}
                      <button
                        type="button"
                        onClick={handleSendWhatsAppRecap}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Send WhatsApp Call Recap</span>
                        <ExternalLink className="h-3 w-3 opacity-80" />
                      </button>

                      {/* Standard Brochure Share */}
                      <button
                        type="button"
                        onClick={handleWhatsAppFollowUp}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-500/20 active:scale-95 dark:text-emerald-300"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>Brochure Link</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 6. Verbatim Conversation Transcript Accordion */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50/60 dark:border-white/10 dark:bg-white/5">
                  <button
                    type="button"
                    onClick={() => setShowFullTranscript(!showFullTranscript)}
                    className="flex w-full items-center justify-between p-3.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100/60 dark:text-gray-300 dark:hover:bg-white/5"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-amber-500" />
                      Full Conversation (Telecaller vs Customer)
                    </span>
                    {showFullTranscript ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  {showFullTranscript && (
                    <div className="space-y-2.5 border-t border-gray-200 bg-white p-3.5 dark:border-white/10 dark:bg-black/40">
                      {/* Dialogue View / Raw Audio Text toggle */}
                      <div className="flex items-center justify-between border-b border-gray-100 pb-1.5 dark:border-white/5">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setTranscriptViewMode('dialogue')}
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                              transcriptViewMode === 'dialogue'
                                ? 'bg-amber-500/20 font-bold text-amber-800 dark:text-amber-300'
                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                            }`}
                          >
                            💬 Dialogue Turns
                          </button>
                          <button
                            type="button"
                            onClick={() => setTranscriptViewMode('raw')}
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                              transcriptViewMode === 'raw'
                                ? 'bg-amber-500/20 font-bold text-amber-800 dark:text-amber-300'
                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                            }`}
                          >
                            📝 Raw Audio
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={handleCopyTranscript}
                          className="flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-amber-600 dark:text-gray-400 dark:hover:text-amber-400"
                          title="Copy transcript"
                        >
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </button>
                      </div>

                      {transcriptViewMode === 'dialogue' ? (
                        parsedDialogue.length > 0 ? (
                          <div className="custom-scrollbar max-h-60 space-y-2.5 overflow-y-auto pr-1">
                            {parsedDialogue.map((turn, idx) => {
                              const nextTurn = parsedDialogue[idx + 1];
                              const turnStart = turn.start_time;
                              const nextStart =
                                nextTurn?.start_time ??
                                (intelligence.duration ||
                                  (turnStart !== undefined ? turnStart + 30 : 9999));
                              const isCurrentlyPlaying =
                                isPlaying &&
                                turnStart !== undefined &&
                                currentTime >= turnStart &&
                                currentTime < nextStart;

                              return (
                                <div
                                  key={idx}
                                  onClick={() => handleJumpToTimestamp(turnStart)}
                                  className={`group cursor-pointer rounded-xl border p-3 text-xs transition-all hover:scale-[1.008] active:scale-[0.995] ${
                                    isCurrentlyPlaying
                                      ? 'border-amber-500 bg-amber-100/90 shadow-md ring-2 ring-amber-500 dark:bg-amber-950/50'
                                      : turn.speaker === 'Telecaller'
                                        ? 'border-amber-500/40 bg-gradient-to-br from-amber-50/90 to-amber-100/40 text-gray-900 dark:border-amber-500/30 dark:bg-gradient-to-br dark:from-amber-950/30 dark:to-black/40 dark:text-amber-100'
                                        : 'border-emerald-500/40 bg-gradient-to-br from-emerald-50/90 to-emerald-100/40 text-gray-900 dark:border-emerald-500/30 dark:bg-gradient-to-br dark:from-emerald-950/30 dark:to-black/40 dark:text-emerald-100'
                                  }`}
                                >
                                  <div className="mb-1 flex items-center justify-between border-b border-black/5 pb-1 dark:border-white/5">
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase">
                                      {turn.speaker === 'Telecaller' ? (
                                        <>
                                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                                            <User className="h-3 w-3" />
                                          </div>
                                          <span className="font-extrabold text-amber-700 dark:text-amber-400">
                                            {agentName || 'Telecaller'} (Advisor)
                                          </span>
                                        </>
                                      ) : (
                                        <>
                                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                                            <Phone className="h-3 w-3" />
                                          </div>
                                          <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
                                            Customer (+91 {cleanPhone || 'Unknown'})
                                          </span>
                                        </>
                                      )}
                                    </div>

                                    {/* Click-to-Jump Audio Timestamp Badge */}
                                    {turnStart !== undefined && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleJumpToTimestamp(turnStart);
                                        }}
                                        title={`Jump audio to ${formatDuration(turnStart)}`}
                                        className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold transition-all ${
                                          isCurrentlyPlaying
                                            ? 'animate-pulse bg-amber-500 text-black shadow-sm'
                                            : 'border border-amber-500/40 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-300'
                                        }`}
                                      >
                                        <Play className="h-2.5 w-2.5 fill-current" />
                                        <span>{formatDuration(turnStart)}</span>
                                      </button>
                                    )}
                                  </div>
                                  <p className="pt-0.5 leading-relaxed font-medium select-text">
                                    {turn.text}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="space-y-2.5 rounded-xl border border-dashed border-amber-500/40 bg-amber-50/50 p-4 text-center dark:bg-amber-500/5">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              Dialogue turns are currently unseparated. Click below to separate
                              advisor vs customer:
                            </p>
                            <button
                              type="button"
                              disabled={isSeparatingDialogue}
                              onClick={triggerAutoSeparation}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/20 to-amber-500/10 px-4 py-2 text-xs font-bold text-amber-800 transition-all hover:bg-amber-500/30 active:scale-95 disabled:opacity-50 dark:text-amber-300"
                            >
                              <Sparkles
                                className={`h-3.5 w-3.5 ${isSeparatingDialogue ? 'animate-spin' : 'animate-pulse'}`}
                              />
                              <span>
                                {isSeparatingDialogue
                                  ? 'AI Separating Speakers...'
                                  : '✨ Separate Advisor vs Customer Dialogue'}
                              </span>
                            </button>
                          </div>
                        )
                      ) : (
                        <div className="custom-scrollbar max-h-56 overflow-y-auto pr-1 font-sans text-xs leading-relaxed whitespace-pre-wrap text-gray-700 select-text dark:text-gray-300">
                          {intelligence.raw_transcript ||
                            intelligence.transcript ||
                            'No transcript text available.'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Modal Footer */}
          <div className="z-10 flex shrink-0 items-center justify-between border-t border-gray-100 bg-gray-50/95 px-5 py-3 backdrop-blur-sm sm:px-6 dark:border-white/10 dark:bg-[#0c101c]/95">
            <button
              type="button"
              disabled={isLoading || !intelligence}
              onClick={() => fetchIntelligence(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Re-Analyze</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!intelligence}
                onClick={handleCopySummary}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-700 transition-all hover:bg-amber-500/20 active:scale-95 disabled:opacity-50 dark:text-amber-300"
              >
                {isCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Summary</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-800 transition-colors hover:bg-gray-300 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
