const STORAGE_KEY = 'svi-recent-contacts';
const MAX_RECENT = 12;

export interface RecentContactEntry {
  email: string;
  name: string;
  role: string;
  addedAt: number;
}

export function getRecentContacts(): RecentContactEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentContactEntry[];
  } catch {
    return [];
  }
}

export function addRecentContact(email: string, name?: string, role?: string): void {
  try {
    const recent = getRecentContacts().filter((c) => c.email !== email);
    recent.unshift({ email, name: name || email, role: role || '', addedAt: Date.now() });
    if (recent.length > MAX_RECENT) recent.length = MAX_RECENT;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
  } catch {
    // ignore
  }
}

export function clearRecentContacts(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
