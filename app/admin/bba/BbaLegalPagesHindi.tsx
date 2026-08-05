import {
  InstructionsPageHindi,
  PartiesAndRecitalsPageHindi,
  AllotteeRecitalsAndDefinitionsPageHindi,
  OperativeClausesAndSignaturesPageHindi,
  type BBALegalFormData,
  type BBALegalCompanyInfo,
} from '@/src/components/admin/bba/legal-hindi';

interface BbaLegalPagesHindiProps {
  formData: BBALegalFormData;
  companyInfo: BBALegalCompanyInfo;
  totalCost: number;
}

/**
 * Builder-Buyer Agreement (BBA) legal-hindi preview orchestrator.
 *
 * Renders 4 logical sections, each a self-contained page block:
 * 1. InstructionsPageHindi                  — Important instructions + Allottee acknowledgement
 * 2. PartiesAndRecitalsPageHindi            — Title + parties + Firm's representation
 * 3. AllotteeRecitalsAndDefinitionsPageHindi — Allottee recitals + definitions + interpretation
 * 4. OperativeClausesAndSignaturesPageHindi — Numbered clauses 1-32 + payment + signature blocks
 *
 * Each section is lazy-friendly: it can be code-split at the route level.
 */
export default function BbaLegalPagesHindi({
  formData,
  companyInfo,
  totalCost,
}: BbaLegalPagesHindiProps) {
  const ctx = { formData, companyInfo, totalCost };

  return (
    <div className="legal-hindi-pages text-[11px] leading-relaxed">
      <InstructionsPageHindi {...ctx} />
      <PartiesAndRecitalsPageHindi {...ctx} />
      <AllotteeRecitalsAndDefinitionsPageHindi {...ctx} />
      <OperativeClausesAndSignaturesPageHindi {...ctx} />
    </div>
  );
}
