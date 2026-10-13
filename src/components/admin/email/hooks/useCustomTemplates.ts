'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { getToken } from '../helpers';
import type { CustomEmailTemplate } from '../types';

const SYNC_EVENT = 'svi_custom_templates_changed';
const CACHE_KEY = 'svi_custom_email_templates_cache';

export function useCustomTemplates() {
  const [customTemplates, setCustomTemplates] = useState<CustomEmailTemplate[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const res = await fetch('/api/admin/email/templates', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to load templates (${res.status})`);
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.templates)) {
        setCustomTemplates(data.templates);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(data.templates));
        } catch {
          // Ignore localStorage errors
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch custom templates';
      setError(msg);
      // Fallback to cache if available
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          setCustomTemplates(JSON.parse(cached));
        }
      } catch {
        // ignore
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();

    const handleSync = () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          setCustomTemplates(JSON.parse(cached));
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener(SYNC_EVENT, handleSync);
    return () => window.removeEventListener(SYNC_EVENT, handleSync);
  }, [fetchTemplates]);

  const notifyChange = (updated: CustomEmailTemplate[]) => {
    setCustomTemplates(updated);
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event(SYNC_EVENT));
  };

  const saveTemplate = useCallback(
    async (payload: {
      id?: string;
      name: string;
      subject: string;
      category?: string;
      description?: string;
      html: string;
      icon?: string;
    }): Promise<CustomEmailTemplate | null> => {
      try {
        const token = await getToken();
        const res = await fetch('/api/admin/email/templates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to save template');
        }

        if (Array.isArray(data.templates)) {
          notifyChange(data.templates);
        } else if (data.template) {
          setCustomTemplates((prev) => {
            const idx = prev.findIndex((t) => t.id === data.template.id);
            const next =
              idx >= 0
                ? prev.map((t, i) => (i === idx ? data.template : t))
                : [data.template, ...prev];
            try {
              localStorage.setItem(CACHE_KEY, JSON.stringify(next));
            } catch {
              // ignore
            }
            window.dispatchEvent(new Event(SYNC_EVENT));
            return next;
          });
        }

        toast.success(
          payload.id ? 'Template updated successfully' : 'Custom template saved successfully'
        );
        return data.template as CustomEmailTemplate;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error saving template';
        toast.error(msg);
        return null;
      }
    },
    []
  );

  const deleteTemplate = useCallback(async (id: string): Promise<boolean> => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/email/templates?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete template');
      }

      if (Array.isArray(data.templates)) {
        notifyChange(data.templates);
      } else {
        setCustomTemplates((prev) => {
          const next = prev.filter((t) => t.id !== id);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(next));
          } catch {
            // ignore
          }
          window.dispatchEvent(new Event(SYNC_EVENT));
          return next;
        });
      }

      toast.success('Custom template deleted');
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error deleting template';
      toast.error(msg);
      return false;
    }
  }, []);

  return {
    customTemplates,
    loading,
    error,
    refresh: fetchTemplates,
    saveTemplate,
    deleteTemplate,
  };
}
