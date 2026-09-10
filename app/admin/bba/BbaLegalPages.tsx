import {
  InstructionsPage,
  PartiesAndRecitalsPage,
  AllotteeRecitalsAndDefinitionsPage,
  OperativeClausesAndSignaturesPage,
  type BBALegalFormData,
  type BBALegalCompanyInfo,
} from '@/src/components/admin/bba/legal';

interface BbaLegalPagesProps {
  formData: BBALegalFormData;
  companyInfo: BBALegalCompanyInfo;
  totalCost: number;
}

/**
 * Builder-Buyer Agreement (BBA) legal preview orchestrator.
 *
 * Renders 4 logical sections, each a self-contained page block:
 * 1. InstructionsPage                  — Important instructions + Allottee acknowledgement
 * 2. PartiesAndRecitalsPage            — Title + parties + Firm's representation
 * 3. AllotteeRecitalsAndDefinitionsPage — Allottee recitals + definitions + interpretation
 * 4. OperativeClausesAndSignaturesPage — Numbered clauses 1-32 + payment + signature blocks
 *
 * Each section is lazy-friendly: it can be code-split at the route level.
 */
export default function BbaLegalPages({ formData, companyInfo, totalCost }: BbaLegalPagesProps) {
  const ctx = { formData, companyInfo, totalCost };

  return (
    <div className="legal-pages text-[14.5px] leading-relaxed">
      <InstructionsPage {...ctx} />
      <PartiesAndRecitalsPage {...ctx} />
      <AllotteeRecitalsAndDefinitionsPage {...ctx} />
      <OperativeClausesAndSignaturesPage {...ctx} />
    </div>
  );
}
