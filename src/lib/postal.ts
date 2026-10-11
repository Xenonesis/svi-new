/**
 * Indian Postal PIN Code Lookup Utility
 * Uses Postal Pincode API (https://api.postalpincode.in) with caching & timeout
 */

export interface PincodeDetails {
  pincode: string;
  state: string;
  district: string;
  postOffices: string[];
}

const pinCache = new Map<string, PincodeDetails | null>();

/**
 * Normalizes state name returned by Indian Post to match INDIAN_STATES_AND_UTS keys
 */
export function normalizeStateName(state: string): string {
  const s = state.trim().toLowerCase();
  if (s.includes('delhi')) return 'Delhi';
  if (s.includes('jammu') || s.includes('kashmir')) return 'Jammu and Kashmir';
  if (s.includes('ladakh')) return 'Ladakh';
  if (s.includes('andaman')) return 'Andaman and Nicobar Islands';
  if (s.includes('chandigarh')) return 'Chandigarh';
  if (s.includes('daman') || s.includes('diu') || s.includes('dadra')) {
    return 'Dadra and Nagar Haveli and Daman and Diu';
  }
  if (s.includes('lakshadweep')) return 'Lakshadweep';
  if (s.includes('puducherry') || s.includes('pondicherry')) return 'Puducherry';
  if (s.includes('odisha') || s.includes('orissa')) return 'Odisha';
  if (s.includes('uttarakhand') || s.includes('uttaranchal')) return 'Uttarakhand';

  // Title case fallback
  return state
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
}

/**
 * Look up official state, district and post offices by 6-digit Indian PIN code.
 */
export async function lookupPincode(pincode: string): Promise<PincodeDetails | null> {
  const cleaned = pincode.replace(/\D/g, '');
  if (!/^[1-9]\d{5}$/.test(cleaned)) {
    return null;
  }

  if (pinCache.has(cleaned)) {
    return pinCache.get(cleaned) ?? null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(`https://api.postalpincode.in/pincode/${cleaned}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    const data: unknown = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    const first = data[0];
    if (
      !first ||
      typeof first !== 'object' ||
      !('Status' in first) ||
      first.Status !== 'Success' ||
      !('PostOffice' in first) ||
      !Array.isArray(first.PostOffice) ||
      first.PostOffice.length === 0
    ) {
      pinCache.set(cleaned, null);
      return null;
    }

    const firstOffice = first.PostOffice[0] as {
      State?: string;
      District?: string;
      Name?: string;
    };

    const rawState = typeof firstOffice.State === 'string' ? firstOffice.State : '';
    const district = typeof firstOffice.District === 'string' ? firstOffice.District : '';
    const state = normalizeStateName(rawState);

    const postOffices = first.PostOffice.map((po: unknown) =>
      po && typeof po === 'object' && 'Name' in po && typeof po.Name === 'string' ? po.Name : ''
    ).filter(Boolean);

    const result: PincodeDetails = {
      pincode: cleaned,
      state,
      district,
      postOffices,
    };

    pinCache.set(cleaned, result);
    return result;
  } catch {
    return null;
  }
}
