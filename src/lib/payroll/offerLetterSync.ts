import { supabaseAdmin } from '@/src/lib/supabase/admin';

export interface OfferLetterDetails {
  documentId: string;
  name: string;
  emailId: string;
  mobileNo: string;
  designation: string;
  salaryCtc: number;
  salaryType: 'in_hand' | 'ctc';
  target: number;
  targetUnit: string;
  offerSlab: string;
  commissionReleasePercent: number;
  conveyanceAllowanceAmount: number;
  subsistenceAllowance: string;
  createdAt: string;
  appointmentDate?: string;
  location?: string;
  candidateAddress?: string;
  reportingTo?: string;
  workingDays?: string;
  weeklyOffDays?: string;
  workingHours?: string;
  probationPeriod?: string;
}

/**
 * Normalizes phone numbers to last 10 digits for accurate matching
 */
function cleanPhone(phone?: string | null): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '').slice(-10);
}

/**
 * Normalizes strings for case-insensitive and whitespace-insensitive comparison
 */
function cleanStr(str?: string | null): string {
  if (!str) return '';
  return str.trim().toLowerCase();
}

/**
 * Strips all non-alphanumeric characters for fuzzy name comparison
 */
function normalizeName(str?: string | null): string {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Resolves the best-matching offer letter for a given employee profile using a multi-factor score.
 * Match criteria:
 * 1. Exact email match (highest priority, 100 pts)
 * 2. Exact normalized name match (80 pts)
 * 3. Substring / name containment (45 pts)
 * 4. Phone match with name compatibility check (65 pts)
 * 5. Email username prefix match (50 pts)
 */
export async function getEmployeeOfferLetterMap(): Promise<Map<string, OfferLetterDetails>> {
  const [profilesRes, offersRes] = await Promise.all([
    supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, phone, role, department')
      .neq('role', 'client')
      .not('email', 'like', 'client.%'),
    supabaseAdmin
      .from('documents')
      .select('id, form_data, created_at')
      .eq('document_type', 'offer_letter')
      .order('created_at', { ascending: false }),
  ]);

  const profiles = profilesRes.data || [];
  const offers = offersRes.data || [];

  const offerByUserId = new Map<string, OfferLetterDetails>();

  for (const prof of profiles) {
    const pEmail = cleanStr(prof.email);
    const pPhone = cleanPhone(prof.phone);
    const pNameNorm = normalizeName(prof.full_name);

    let bestOffer: { o: (typeof offers)[0]; fd: Record<string, any>; score: number } | null = null;
    let bestScore = 0;

    for (const o of offers) {
      const fd = (o.form_data || {}) as Record<string, any>;
      const oEmail = cleanStr(fd.emailId);
      const oPhone = cleanPhone(fd.mobileNo);
      const oNameNorm = normalizeName(fd.name);

      let score = 0;

      // 1. Exact Email
      if (oEmail && pEmail && oEmail === pEmail) {
        score += 100;
      }

      // 2. Exact Normalized Name
      if (pNameNorm && oNameNorm && pNameNorm === oNameNorm) {
        score += 80;
      }

      // 3. Name Containment (e.g., "Rashmi" vs "Rashmi Kumari", "mukesh" vs "MUKESH KUMAR")
      if (
        pNameNorm &&
        oNameNorm &&
        pNameNorm !== oNameNorm &&
        (pNameNorm.includes(oNameNorm) || oNameNorm.includes(pNameNorm)) &&
        Math.min(pNameNorm.length, oNameNorm.length) >= 4
      ) {
        score += 45;
      }

      // 4. Phone Match (Guarded against different names sharing a phone number)
      if (oPhone && pPhone && oPhone === pPhone && oPhone.length === 10) {
        const pFirst = pNameNorm.slice(0, 4);
        const oFirst = oNameNorm.slice(0, 4);
        if (pFirst && oFirst && pFirst !== oFirst) {
          score += 5; // penalty: different person's name with same phone
        } else {
          score += 65;
        }
      }

      // 5. Email user prefix match (e.g. kajal.vishu vs kajalvishu244)
      const pUser = pEmail.split('@')[0]?.replace(/[^a-z0-9]/g, '') || '';
      const oUser = oEmail.split('@')[0]?.replace(/[^a-z0-9]/g, '') || '';
      if (
        pUser &&
        oUser &&
        (pUser.includes(oUser) || oUser.includes(pUser)) &&
        Math.min(pUser.length, oUser.length) >= 6
      ) {
        score += 50;
      }

      if (score > bestScore) {
        bestScore = score;
        bestOffer = { o, fd, score };
      }
    }

    if (bestOffer && bestScore >= 40) {
      const fd = bestOffer.fd;
      offerByUserId.set(prof.id, {
        documentId: bestOffer.o.id,
        name: fd.name || prof.full_name,
        emailId: fd.emailId || prof.email,
        mobileNo: fd.mobileNo || prof.phone,
        designation: fd.designation || prof.department || '',
        salaryCtc: parseFloat(fd.salaryCtc) || 0,
        salaryType: String(fd.salaryType || '').toLowerCase() === 'in_hand' ? 'in_hand' : 'ctc',
        target: parseFloat(fd.target) || 0,
        targetUnit: fd.targetUnit || 'Sq. Yd.',
        offerSlab: fd.offerSlab || '',
        commissionReleasePercent: parseFloat(fd.commissionReleasePercent) || 0,
        conveyanceAllowanceAmount: parseFloat(fd.conveyanceAllowanceAmount) || 0,
        subsistenceAllowance: fd.subsistenceAllowance || '',
        createdAt: bestOffer.o.created_at,
        appointmentDate: fd.appointmentDate || fd.date || '',
        location: fd.location || '',
        candidateAddress: fd.address || '',
        reportingTo: fd.reportingTo || '',
        workingDays: fd.workingDays || '',
        weeklyOffDays: fd.weeklyOffDays || '',
        workingHours:
          fd.workingHoursStart && fd.workingHoursEnd
            ? `${fd.workingHoursStart} - ${fd.workingHoursEnd}`
            : fd.workingHoursStart || fd.workingHoursEnd || '',
        probationPeriod: fd.probationPeriod ? `${fd.probationPeriod} Months` : '',
      });
    }
  }

  return offerByUserId;
}

/**
 * Automatically creates salary structures in `employee_salary_structures`
 * for any employee who has an Offer Letter but doesn't have an active salary structure yet.
 */
export async function autoSyncOfferLettersToStructures(
  offerMap: Map<string, OfferLetterDetails>,
  existingUserIds: Set<string>
): Promise<number> {
  const toUpsert = [];

  for (const [userId, offer] of offerMap.entries()) {
    const isInHand = offer.salaryType === 'in_hand';
    if (!existingUserIds.has(userId) && offer.salaryCtc > 0) {
      const base = offer.salaryCtc;
      const basic = Math.round(base * 0.5);
      const hra = Math.round(base * 0.3);
      const special = Math.max(0, base - (basic + hra));

      toUpsert.push({
        user_id: userId,
        base_salary: base,
        salary_type: isInHand ? 'in_hand' : 'ctc',
        basic_pay: basic,
        hra: hra,
        special_allowance: special,
        conveyance_allowance: offer.conveyanceAllowanceAmount || 0,
        medical_allowance: 0,
        pf_deduction: 0,
        esi_deduction: 0,
        professional_tax: isInHand ? 0 : 200,
        tds: 0,
        is_active: true,
      });
    }
  }

  if (toUpsert.length === 0) return 0;

  try {
    const { error } = await supabaseAdmin
      .from('employee_salary_structures')
      .upsert(toUpsert, { onConflict: 'user_id' });

    if (error) {
      console.error(
        '[offerLetterSync] Error auto-syncing offer letters to salary structures:',
        error.message
      );
      return 0;
    }

    return toUpsert.length;
  } catch (err) {
    console.error('[offerLetterSync] Failed to auto-sync offer letters:', err);
    return 0;
  }
}
