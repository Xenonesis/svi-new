'use client';

import { FormField, FormSelect } from '@/src/components/admin/DocumentGenerator/Shared';
import { Calculator, RefreshCw, ChevronDown, Plus, Trash2, Layers } from 'lucide-react';
import { useState, useEffect } from 'react';
import type {
  QuotationFormData,
  PricingTier,
  PricingTierCalculation,
} from '@/src/lib/quotation/types';

interface QuotationFormProps {
  formData: QuotationFormData;
  projects?: { value: string; label: string }[];
  loadingProjects?: boolean;
  tierCalculations?: PricingTierCalculation[];
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  onTiersChange?: (tiers: PricingTier[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  validationErrors: Partial<Record<keyof QuotationFormData, string>>;
  onRefreshQuotationNo?: () => void;
  loadingQuotationNo?: boolean;
}
export default function QuotationForm({
  formData,
  projects = [],
  loadingProjects = false,
  tierCalculations = [],
  onChange,
  onTiersChange,
  onSubmit,
  isSubmitting,
  validationErrors,
  onRefreshQuotationNo,
  loadingQuotationNo = false,
}: QuotationFormProps) {
  const projectsList =
    projects && projects.length > 0
      ? projects
      : [
          { value: 'Shyam Aangan', label: 'Shyam Aangan' },
          { value: 'Shivani Vatika', label: 'Shivani Vatika' },
          { value: 'Phulera SmartCity', label: 'Phulera SmartCity' },
          { value: 'Shivani Vatika 11th', label: 'Shivani Vatika 11th' },
          { value: 'Shyam Aangan Farm House', label: 'Shyam Aangan Farm House' },
          { value: 'Shyam Aangan Phase 1', label: 'Shyam Aangan Phase 1' },
        ];

  const [isCustomProject, setIsCustomProject] = useState(false);

  // Auto-detect custom project when template/record loads with an unlisted project name
  useEffect(() => {
    if (
      formData.projectName &&
      !projectsList.some((p) => p.value.toLowerCase() === formData.projectName.toLowerCase())
    ) {
      setIsCustomProject(true);
    }
  }, [formData.projectName, projectsList]);

  // Multiple Pricing Tiers state
  const hasMultipleTiers = Boolean(formData.pricingTiers && formData.pricingTiers.length >= 2);
  const tiers = formData.pricingTiers || [];

  const handleEnableMultipleTiers = () => {
    const defaultTiers: PricingTier[] = [
      {
        id: 'tier-1',
        label: 'Option 1 (Standard Rate)',
        basicRate: formData.basicRate || '7500',
        edcRate: formData.edcRate || '150',
        plcPercent: formData.plcPercent || '5',
      },
      {
        id: 'tier-2',
        label: 'Option 2 (Corner / Prime)',
        basicRate: String(Number(formData.basicRate || '7500') + 500),
        edcRate: formData.edcRate || '150',
        plcPercent: formData.plcPercent || '5',
      },
    ];
    if (onTiersChange) {
      onTiersChange(defaultTiers);
    }
  };

  const handleResetToSingleTier = () => {
    if (onTiersChange) {
      onTiersChange([]);
    }
  };

  const handleAddTier = () => {
    if (tiers.length >= 4) return;
    const lastTier = tiers[tiers.length - 1];
    const nextNum = tiers.length + 1;
    const newTier: PricingTier = {
      id: `tier-${Date.now()}`,
      label: `Option ${nextNum}`,
      basicRate: String(Number(lastTier?.basicRate || '7500') + 500),
      edcRate: lastTier?.edcRate || '150',
      plcPercent: lastTier?.plcPercent || '5',
    };
    if (onTiersChange) {
      onTiersChange([...tiers, newTier]);
    }
  };

  const handleRemoveTier = (index: number) => {
    const updated = tiers.filter((_, i) => i !== index);
    if (onTiersChange) {
      onTiersChange(updated);
    }
  };

  const handleTierChange = (index: number, field: keyof PricingTier, value: string) => {
    const updated = tiers.map((tier, i) => (i === index ? { ...tier, [field]: value } : tier));
    if (onTiersChange) {
      onTiersChange(updated);
    }

    // Sync primary tier (index 0) with main formData fields for single-rate fallback
    if (index === 0 && (field === 'basicRate' || field === 'edcRate' || field === 'plcPercent')) {
      onChange({
        target: { name: field, value },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div className="dark:bg-brand-dark-surface/65 relative h-fit overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/8">
      <div className="via-brand-gold/40 absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent to-transparent" />

      {/* Section header */}
      <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-white/10">
        <div className="bg-brand-gold/10 border-brand-gold/20 flex h-8 w-8 items-center justify-center rounded border">
          <Calculator className="text-brand-gold h-4 w-4" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Quotation Details</h2>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-6">
        {/* ── Quotation Info ─────────────────────────────────────────────── */}
        <div>
          <p className="mb-3 text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
            Quotation Info
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
                  Quotation Number <span className="text-red-500">*</span>
                </label>
                {onRefreshQuotationNo && (
                  <button
                    type="button"
                    onClick={onRefreshQuotationNo}
                    disabled={loadingQuotationNo || isSubmitting}
                    className="text-brand-gold hover:text-brand-gold/80 inline-flex items-center gap-1 text-[10px] font-semibold transition-colors disabled:opacity-50"
                    title="Fetch new unique quotation number from DB"
                  >
                    <RefreshCw className={`h-3 w-3 ${loadingQuotationNo ? 'animate-spin' : ''}`} />
                    <span>{loadingQuotationNo ? 'Generating...' : 'Auto DB'}</span>
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="quotationNo"
                  value={formData.quotationNo}
                  onChange={onChange}
                  required
                  placeholder={loadingQuotationNo ? 'Generating from DB...' : 'SVI-QTN-...'}
                  disabled={loadingQuotationNo}
                  className="border-brand-navy/20 focus:border-brand-gold focus:ring-brand-gold/20 dark:border-brand-gold/20 dark:bg-brand-gold/5 dark:focus:border-brand-gold w-full rounded-xl border bg-white/50 px-4 py-2 font-mono text-sm text-gray-900 shadow-sm backdrop-blur-sm transition-all outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:text-white"
                />
              </div>
              {validationErrors.quotationNo && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.quotationNo}</p>
              )}
            </div>
            <div>
              <FormField
                label="Quotation Date"
                name="quotationDate"
                type="date"
                value={formData.quotationDate}
                onChange={onChange}
                required
              />
              {validationErrors.quotationDate && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.quotationDate}</p>
              )}
            </div>
            <div>
              <FormField
                label="Valid Until"
                name="validUntil"
                type="date"
                value={formData.validUntil}
                onChange={onChange}
                required
              />
              {validationErrors.validUntil && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.validUntil}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Customer Info ──────────────────────────────────────────────── */}
        <div>
          <p className="mb-3 text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
            Customer Information
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <FormField
                label="Customer Name"
                name="customerName"
                value={formData.customerName}
                onChange={onChange}
                required
                placeholder="Full Name"
              />
              {validationErrors.customerName && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.customerName}</p>
              )}
            </div>
            <div>
              <FormField
                label="Mobile Number"
                name="customerPhone"
                type="tel"
                value={formData.customerPhone}
                onChange={onChange}
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <FormField
                label="Email Address"
                name="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={onChange}
                placeholder="customer@email.com"
              />
              {validationErrors.customerEmail && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.customerEmail}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
                Customer Address
              </label>
              <textarea
                name="customerAddress"
                value={formData.customerAddress}
                onChange={onChange}
                rows={2}
                placeholder="Full postal address"
                className="focus:border-brand-gold focus:ring-brand-gold/50 w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-sans text-sm text-gray-900 placeholder-gray-400 transition-all focus:ring-1 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white dark:placeholder-gray-600"
              />
            </div>
          </div>
        </div>

        {/* ── Property Info ──────────────────────────────────────────────── */}
        <div>
          <p className="mb-3 text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
            Property Details
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <div className="flex items-center justify-between">
                <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-gray-500 uppercase transition-colors duration-300 dark:text-gray-400">
                  Project Name *
                </label>
                {isCustomProject && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomProject(false);
                      const fallback = projectsList[0]?.value || 'Shyam Aangan';
                      onChange({
                        target: { name: 'projectName', value: fallback },
                      } as unknown as React.ChangeEvent<HTMLInputElement>);
                    }}
                    className="text-brand-gold hover:text-brand-gold-light mb-1 text-[10px] font-semibold transition-colors"
                  >
                    Select from properties
                  </button>
                )}
              </div>

              {!isCustomProject ? (
                <div className="relative">
                  <select
                    name="projectName"
                    value={formData.projectName}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setIsCustomProject(true);
                        onChange({
                          target: { name: 'projectName', value: '' },
                        } as unknown as React.ChangeEvent<HTMLInputElement>);
                      } else {
                        onChange(e);
                      }
                    }}
                    className="focus:border-brand-gold focus:ring-brand-gold/50 w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-sans text-sm text-gray-900 transition-all focus:ring-1 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white"
                  >
                    {!formData.projectName && (
                      <option value="" disabled>
                        {loadingProjects ? 'Loading properties...' : 'Select a project...'}
                      </option>
                    )}
                    {projectsList.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                    <option value="__custom__">+ Other (Custom Project)...</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ) : (
                <FormField
                  label=""
                  name="projectName"
                  value={formData.projectName}
                  onChange={onChange}
                  placeholder="Enter custom project name"
                  required
                />
              )}
            </div>
            <div>
              <FormField
                label="Plot / Unit Number"
                name="plotNo"
                value={formData.plotNo}
                onChange={onChange}
                placeholder="e.g. A-101"
              />
            </div>
            <div className="md:col-span-2">
              <FormSelect
                label="Property Type"
                name="propertyType"
                value={formData.propertyType}
                onChange={onChange}
                options={[
                  { value: 'Residential Plot', label: 'Residential Plot' },
                  { value: 'Commercial Plot', label: 'Commercial Plot' },
                  { value: 'Farm House', label: 'Farm House' },
                  { value: 'Residential Farm House', label: 'Residential Farm House' },
                  { value: 'Other', label: 'Other' },
                ]}
              />
            </div>
            <div className="md:col-span-2">
              <FormField
                label="Plot Area (Sq. Yds.)"
                name="area"
                type="number"
                step="any"
                min="0.01"
                value={formData.area}
                onChange={onChange}
                required
                placeholder="e.g. 586.64"
              />
              {validationErrors.area && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.area}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Pricing ────────────────────────────────────────────────────── */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
                Pricing Information
              </p>
              {hasMultipleTiers && (
                <span className="bg-brand-gold/15 text-brand-gold inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold">
                  <Layers className="h-2.5 w-2.5" />
                  {tiers.length} Rate Options
                </span>
              )}
            </div>

            {!hasMultipleTiers ? (
              <button
                type="button"
                onClick={handleEnableMultipleTiers}
                className="text-brand-gold hover:text-brand-gold-light inline-flex items-center gap-1 text-[11px] font-semibold transition-colors"
                title="Add multiple pricing scenarios for client comparison"
              >
                <Plus className="h-3.5 w-3.5" /> + Add Multiple Pricing Options
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResetToSingleTier}
                className="text-[10px] font-semibold text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
              >
                Switch to Single Rate
              </button>
            )}
          </div>

          {!hasMultipleTiers ? (
            /* Single Pricing Row */
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <FormField
                  label="Basic Rate / Sq. Yd. (₹)"
                  name="basicRate"
                  type="number"
                  step="any"
                  min="0"
                  value={formData.basicRate}
                  onChange={onChange}
                  required
                  placeholder="e.g. 8000"
                />
                {validationErrors.basicRate && (
                  <p className="mt-1 text-xs text-red-500">{validationErrors.basicRate}</p>
                )}
              </div>
              <div>
                <FormField
                  label="EDC / Sq. Yd. (₹)"
                  name="edcRate"
                  type="number"
                  step="any"
                  min="0"
                  value={formData.edcRate}
                  onChange={onChange}
                  required
                  placeholder="e.g. 150"
                />
                {validationErrors.edcRate && (
                  <p className="mt-1 text-xs text-red-500">{validationErrors.edcRate}</p>
                )}
              </div>
              <div>
                <FormField
                  label="PLC (%)"
                  name="plcPercent"
                  type="number"
                  step="any"
                  min="0"
                  value={formData.plcPercent}
                  onChange={onChange}
                  required
                  placeholder="e.g. 5"
                />
                {validationErrors.plcPercent && (
                  <p className="mt-1 text-xs text-red-500">{validationErrors.plcPercent}</p>
                )}
                <p className="mt-1 text-[10px] text-gray-400">PLC is calculated on Basic Price.</p>
              </div>
            </div>
          ) : (
            /* Multiple Pricing Options Cards */
            <div className="space-y-3">
              {tiers.map((tier, idx) => {
                const tierCalc =
                  tierCalculations.find((c) => c.id === tier.id) || tierCalculations[idx];

                return (
                  <div
                    key={tier.id || idx}
                    className="rounded-xl border border-gray-200 bg-gray-50/80 p-3.5 shadow-sm transition-all dark:border-white/10 dark:bg-[#111118]/80"
                  >
                    <div className="mb-2.5 flex items-center justify-between border-b border-gray-200/60 pb-2 dark:border-white/5">
                      <div className="flex flex-1 items-center gap-2">
                        <span className="bg-brand-gold/20 text-brand-gold flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={tier.label}
                          onChange={(e) => handleTierChange(idx, 'label', e.target.value)}
                          placeholder={`Option ${idx + 1} Name (e.g. Standard Rate)`}
                          className="w-full max-w-[220px] bg-transparent text-xs font-bold text-gray-900 placeholder-gray-400 focus:underline focus:outline-none dark:text-white dark:placeholder-gray-600"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        {tierCalc && (
                          <div className="text-right">
                            <span className="text-brand-gold text-xs font-bold">
                              ₹{tierCalc.grandTotal.toLocaleString('en-IN')}
                            </span>
                            <span className="ml-1 text-[10px] text-gray-400">
                              (₹{tierCalc.effectiveRate.toLocaleString('en-IN')}/yd)
                            </span>
                          </div>
                        )}
                        {tiers.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTier(idx)}
                            className="cursor-pointer text-gray-400 transition-colors hover:text-red-500"
                            title="Remove this pricing option"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                          Basic Rate / Sq. Yd. (₹) *
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={tier.basicRate}
                          onChange={(e) => handleTierChange(idx, 'basicRate', e.target.value)}
                          placeholder="e.g. 7500"
                          className="focus:border-brand-gold focus:ring-brand-gold/20 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-sans text-xs text-gray-900 transition-all focus:ring-1 focus:outline-none dark:border-white/10 dark:bg-[#14151a] dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                          EDC / Sq. Yd. (₹) *
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={tier.edcRate}
                          onChange={(e) => handleTierChange(idx, 'edcRate', e.target.value)}
                          placeholder="e.g. 150"
                          className="focus:border-brand-gold focus:ring-brand-gold/20 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-sans text-xs text-gray-900 transition-all focus:ring-1 focus:outline-none dark:border-white/10 dark:bg-[#14151a] dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                          PLC (%) *
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          max="100"
                          value={tier.plcPercent}
                          onChange={(e) => handleTierChange(idx, 'plcPercent', e.target.value)}
                          placeholder="e.g. 5"
                          className="focus:border-brand-gold focus:ring-brand-gold/20 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-sans text-xs text-gray-900 transition-all focus:ring-1 focus:outline-none dark:border-white/10 dark:bg-[#14151a] dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {tiers.length < 4 && (
                <button
                  type="button"
                  onClick={handleAddTier}
                  className="border-brand-gold/30 hover:border-brand-gold text-brand-gold hover:bg-brand-gold/5 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border-2 border-dashed py-2 text-xs font-semibold transition-all"
                >
                  <Plus className="h-3.5 w-3.5" /> + Add Option {tiers.length + 1}
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Notes ──────────────────────────────────────────────────────── */}
        <div>
          <label className="mb-1.5 block text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
            Notes / Special Terms
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={onChange}
            rows={3}
            placeholder="Optional custom notes or special terms..."
            className="focus:border-brand-gold focus:ring-brand-gold/50 w-full resize-y rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-sans text-sm text-gray-900 placeholder-gray-400 transition-all focus:ring-1 focus:outline-none dark:border-white/10 dark:bg-[#111118] dark:text-white dark:placeholder-gray-600"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          id="quotation-submit-btn"
          className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy glow-gold mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-3.5 text-xs font-bold tracking-widest uppercase shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Calculator className="h-4 w-4" />
          {isSubmitting ? 'Saving…' : 'Calculate & Generate Quotation'}
        </button>
      </form>
    </div>
  );
}
