const STORAGE_KEY = 'reg_draft';
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

interface DraftData {
  formData: Record<string, string>;
  savedAt: number;
}

export function saveFormDraft(formData: Record<string, string>): void {
  try {
    const data: DraftData = {
      formData,
      savedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export function loadFormDraft(): Record<string, string> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data: DraftData = JSON.parse(raw);

    // Expire after 24 hours
    if (Date.now() - data.savedAt > MAX_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return data.formData;
  } catch {
    return null;
  }
}

export function clearFormDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function getDraftAge(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data: DraftData = JSON.parse(raw);
    return Date.now() - data.savedAt;
  } catch {
    return null;
  }
}
