'use client';

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { getToken } from '../helpers';

interface GenerateOptions {
  prompt: string;
  tone?: string;
  context?: { recipientName?: string; subject?: string; templateId?: string };
  onChunk?: (chunk: string) => void;
}

interface ImproveOptions {
  html: string;
  instruction?: string;
  onChunk?: (chunk: string) => void;
}

interface SummarizeOptions {
  emails: Array<{
    from?: string;
    subject?: string;
    html?: string;
    text?: string;
    created_at?: string;
  }>;
}

interface PopulateTemplateOptions {
  templateId?: string;
  variables: string[];
  recipientEmail?: string;
}

interface SentimentOptions {
  emailHtml?: string;
  emailText?: string;
}

export function useAIEmail() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
  }, []);

  const apiCall = useCallback(async (body: Record<string, any>, signal?: AbortSignal) => {
    const token = await getToken();
    const res = await fetch('/api/admin/email/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      signal,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Request failed (${res.status})`);
    }

    return res;
  }, []);

  // Feature 1: Generate email content (streaming)
  const generateContent = useCallback(
    async ({ prompt, tone, context, onChunk }: GenerateOptions): Promise<string> => {
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(null);

      try {
        const res = await apiCall({ action: 'generate', prompt, tone, context }, controller.signal);
        const reader = res.body?.getReader();
        if (!reader) throw new Error('No response stream');

        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          const clean = fullText
            .replace(/^```(?:html)?\s*/i, '')
            .replace(/```\s*$/i, '')
            .trim();
          onChunk?.(clean);
        }

        const finalOutput = fullText
          .replace(/^```(?:html)?\s*/i, '')
          .replace(/```\s*$/i, '')
          .trim();

        return finalOutput;
      } catch (err: any) {
        if (err.name === 'AbortError') return '';
        const msg = err.message || 'Failed to generate content';
        setError(msg);
        toast.error(msg);
        return '';
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    [apiCall]
  );

  // Feature 2: Improve email content (streaming)
  const improveContent = useCallback(
    async ({ html, instruction, onChunk }: ImproveOptions): Promise<string> => {
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(null);

      try {
        const res = await apiCall({ action: 'improve', html, instruction }, controller.signal);
        const reader = res.body?.getReader();
        if (!reader) throw new Error('No response stream');

        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          const clean = fullText
            .replace(/^```(?:html)?\s*/i, '')
            .replace(/```\s*$/i, '')
            .trim();
          onChunk?.(clean);
        }

        const finalOutput = fullText
          .replace(/^```(?:html)?\s*/i, '')
          .replace(/```\s*$/i, '')
          .trim();

        return finalOutput;
      } catch (err: any) {
        if (err.name === 'AbortError') return '';
        const msg = err.message || 'Failed to improve content';
        setError(msg);
        toast.error(msg);
        return '';
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    [apiCall]
  );

  interface AutoComposeOptions {
    subject?: string;
    prompt?: string;
    tone?: string;
    to?: string;
    cc?: string;
    onChunk?: (html: string) => void;
  }

  interface AutoComposeResult {
    action: 'template_match' | 'ai_template';
    templateId: string;
    templateName: string;
    subject?: string;
    variables: Record<string, string>;
    html: string;
  }

  // Auto Compose: subject / prompt → template match or AI-generated corporate template
  const autoCompose = useCallback(
    async ({
      subject,
      prompt,
      tone,
      to,
      cc,
      onChunk,
    }: AutoComposeOptions): Promise<AutoComposeResult | null> => {
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(null);

      try {
        const res = await apiCall(
          { action: 'auto_compose', subject, prompt, tone, to, cc },
          controller.signal
        );
        const data = await res.json();
        if (!data.success && !data.html) {
          throw new Error(data.error || 'Failed to generate email template');
        }

        const result: AutoComposeResult = {
          action: data.action || 'ai_template',
          templateId: data.templateId || '_ai_generated',
          templateName: data.templateName || 'AI Corporate Template',
          subject: data.subject || '',
          variables: data.variables || {},
          html: data.html || '',
        };

        if (result.html) {
          onChunk?.(result.html);
        }

        return result;
      } catch (err: any) {
        if (err.name === 'AbortError') return null;
        const msg = err.message || 'Failed to generate email template';
        setError(msg);
        toast.error(msg);
        return null;
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    [apiCall]
  );

  // Feature 3: Summarize thread (non-streaming)
  const summarizeThread = useCallback(
    async ({ emails }: SummarizeOptions) => {
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(null);

      try {
        const res = await apiCall({ action: 'summarize', emails }, controller.signal);
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to summarize');
        return data.summary;
      } catch (err: any) {
        if (err.name === 'AbortError') return null;
        const msg = err.message || 'Failed to summarize thread';
        setError(msg);
        toast.error(msg);
        return null;
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    [apiCall]
  );

  // Feature 4: Populate template variables (non-streaming)
  const populateTemplate = useCallback(
    async ({ templateId, variables, recipientEmail }: PopulateTemplateOptions) => {
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(null);

      try {
        const res = await apiCall(
          { action: 'populate_template', templateId, variables, recipientEmail },
          controller.signal
        );
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to populate template');
        return { suggestions: data.suggestions, confidence: data.confidence };
      } catch (err: any) {
        if (err.name === 'AbortError') return null;
        const msg = err.message || 'Failed to populate template';
        setError(msg);
        toast.error(msg);
        return null;
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    [apiCall]
  );

  // Feature 5: Analyze sentiment (non-streaming)
  const analyzeSentiment = useCallback(
    async ({ emailHtml, emailText }: SentimentOptions) => {
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(null);

      try {
        const res = await apiCall(
          { action: 'analyze_sentiment', emailHtml, emailText },
          controller.signal
        );
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to analyze sentiment');
        return {
          sentiment: data.sentiment,
          score: data.score,
          summary: data.summary,
          suggestedResponses: data.suggestedResponses,
        };
      } catch (err: any) {
        if (err.name === 'AbortError') return null;
        const msg = err.message || 'Failed to analyze sentiment';
        setError(msg);
        toast.error(msg);
        return null;
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    [apiCall]
  );

  // Feature 6: Suggest subject lines
  const suggestSubject = useCallback(
    async (html: string): Promise<string[] | null> => {
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(null);
      try {
        const res = await apiCall({ action: 'suggest_subject', html }, controller.signal);
        const data = await res.json();
        return data.success ? data.suggestions : null;
      } catch (err: any) {
        if (err.name === 'AbortError') return null;
        return null;
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    [apiCall]
  );

  // Feature 7: Classify email (priority + category)
  const classifyEmail = useCallback(
    async (content: {
      emailHtml?: string;
      emailText?: string;
    }): Promise<{ priority: string; category: string; summary: string } | null> => {
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(null);
      try {
        const res = await apiCall({ action: 'classify_email', ...content }, controller.signal);
        const data = await res.json();
        return data.success
          ? { priority: data.priority, category: data.category, summary: data.summary }
          : null;
      } catch (err: any) {
        if (err.name === 'AbortError') return null;
        return null;
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    [apiCall]
  );

  // Feature 8: Suggest follow-up
  const suggestFollowup = useCallback(
    async (
      html: string,
      recipientName?: string
    ): Promise<{ suggestedDays: number; reason: string; message: string } | null> => {
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(null);
      try {
        const res = await apiCall(
          { action: 'suggest_followup', html, recipientName },
          controller.signal
        );
        const data = await res.json();
        return data.success
          ? { suggestedDays: data.suggestedDays, reason: data.reason, message: data.message }
          : null;
      } catch (err: any) {
        if (err.name === 'AbortError') return null;
        return null;
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    [apiCall]
  );

  return {
    loading,
    error,
    cancel,
    generateContent,
    improveContent,
    autoCompose,
    summarizeThread,
    populateTemplate,
    analyzeSentiment,
    suggestSubject,
    classifyEmail,
    suggestFollowup,
  };
}
