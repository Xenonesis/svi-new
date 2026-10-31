'use client';

import { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Percent,
} from 'lucide-react';

interface SV13PaymentPlanSectionProps {
  isHindi?: boolean;
  onEnquirePlan: () => void;
}

export function SV13PaymentPlanSection({
  isHindi = false,
  onEnquirePlan,
}: SV13PaymentPlanSectionProps) {
  const [activeStage, setActiveStage] = useState(0);

  const stages = [
    {
      stageNum: 1,
      title: isHindi ? 'स्टेज 1: माह 1 से 10' : 'Stage 1: Months 1–10',
      months: 'Months 1–10',
      monthlyPayment: '₹9,999',
      stageTargetAmount: '₹79,999',
      milestone: isHindi
        ? 'आरंभिक बुकिंग पुष्टि एवं साइट आवक पंजीकरण'
        : 'Initial Booking Confirmation & Plot Allocation Intimation',
      coverage: '25% Plan Progress',
      progressPercent: 25,
      features: [
        isHindi ? 'मात्र ₹9,999 से शुरुआत' : 'Accessible entry at ₹9,999/month',
        isHindi ? 'प्लॉट प्राथमिकता चयन' : 'Priority plot demarcation selection',
        isHindi ? 'आधिकारिक रसीद और एग्रीमेंट' : 'Official legal receipt & registration slip',
      ],
    },
    {
      stageNum: 2,
      title: isHindi ? 'स्टेज 2: माह 11 से 20' : 'Stage 2: Months 11–20',
      months: 'Months 11–20',
      monthlyPayment: '₹9,999',
      stageTargetAmount: '₹79,999',
      milestone: isHindi
        ? 'आंतरिक 30 फीट सड़क एवं बाउंड्री विकास'
        : 'Internal 30 Ft Road & Perimeter Boundary Development Milestone',
      coverage: '50% Plan Progress',
      progressPercent: 50,
      features: [
        isHindi ? 'साइट लेवलिंग व रोड कार्य प्रगति' : 'Physical road laying & leveling review',
        isHindi ? 'पारदर्शी खाता विवरण' : 'Real-time online portal ledger access',
        isHindi ? 'बिना किसी छिपे शुल्क के' : 'Zero hidden infrastructure charges',
      ],
    },
    {
      stageNum: 3,
      title: isHindi ? 'स्टेज 3: माह 21 से 30' : 'Stage 3: Months 21–30',
      months: 'Months 21–30',
      monthlyPayment: '₹9,999',
      stageTargetAmount: '₹79,999',
      milestone: isHindi
        ? 'पार्क, मंदिर एवं बुनियादी ढांचा पूर्णता'
        : 'Community Park Landscaping & Temple Construction Milestone',
      coverage: '75% Plan Progress',
      progressPercent: 75,
      features: [
        isHindi ? 'पार्क व मंदिर परिसर निर्माण' : 'Active green park & temple execution',
        isHindi ? 'विद्युत व जल बिंदु व्यवस्था' : 'Utility connection demarcation',
        isHindi ? 'दस्तावेज सत्यापन अग्रिम' : 'Pre-registry document verification',
      ],
    },
    {
      stageNum: 4,
      title: isHindi ? 'स्टेज 4: माह 31 से 40' : 'Stage 4: Months 31–40',
      months: 'Months 31–40',
      monthlyPayment: '₹9,999',
      stageTargetAmount: '₹79,999',
      milestone: isHindi
        ? 'अंतिम रजिस्ट्री, दाखिल-खारिज व पजेशन'
        : 'Final Registry, Legal Mutation & Physical Possession Handover',
      coverage: '100% Fully Paid',
      progressPercent: 100,
      features: [
        isHindi ? 'पक्की रजिस्ट्री आपके नाम पर' : 'Clear sub-registrar deed execution',
        isHindi ? 'दाखिल-खारिज (म्यूटेशन) समर्थन' : 'Official government mutation support',
        isHindi ? 'भौतिक पजेशन व कब्जा' : 'Physical handover & building readiness',
      ],
    },
  ];

  return (
    <section id="payment-plan" className="scroll-mt-20 bg-slate-900 py-20 text-white">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-amber-300 uppercase">
            <CreditCard className="h-3.5 w-3.5" />
            {isHindi ? 'सुगम भुगतान योजना' : 'Flexible Payment Plan'}
          </div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {isHindi
              ? 'सपनों का प्लॉट, आसान किस्तों में'
              : 'Structured Four-Stage Payment Timeline'}
          </h2>
          <p className="mt-4 text-base text-slate-300 sm:text-lg">
            {isHindi
              ? 'बजट पर बिना किसी दबाव के अपनी जमीन के मालिक बनें। 40 महीनों की आसान किस्तों का सरल व पारदर्शी प्लान।'
              : 'Own your residential plot without financial strain through an effortless, zero-burden 40-month phased timeline.'}
          </p>
        </div>

        {/* Visually Prominent Hero Pricing Banner */}
        <div className="relative mb-16 overflow-hidden rounded-3xl border-2 border-amber-400 bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-700/20 p-8 shadow-2xl sm:p-12">
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />

          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="text-center md:text-left">
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 px-3.5 py-1 text-xs font-bold tracking-widest text-amber-300 uppercase">
                <Percent className="h-3 w-3" />
                {isHindi ? 'विशेष परिचयात्मक ऑफर' : 'Limited Introductory Term'}
              </span>
              <div className="mt-4 flex flex-wrap items-baseline gap-3">
                <span className="font-serif text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
                  ₹9,999
                </span>
                <span className="text-xl font-bold tracking-wider text-amber-300 uppercase sm:text-2xl">
                  PER MONTH
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-200 sm:text-3xl">
                FOR <span className="text-amber-400">40 MONTHS</span>
              </p>
              <p className="mt-2 text-sm text-slate-400">
                {isHindi
                  ? 'प्रत्येक स्टेज के लिए ₹79,999 का सुव्यवस्थित चरणबद्ध विभाजन।'
                  : 'Structured 4-stage installment schedule featuring ₹79,999 target stage benchmarks.'}
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 sm:flex-row md:flex-col">
              <button
                onClick={onEnquirePlan}
                className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-amber-400 px-8 py-5 text-base font-extrabold text-slate-950 shadow-xl shadow-amber-400/25 transition-all hover:scale-105 hover:bg-amber-300"
              >
                <span>
                  {isHindi ? 'भुगतान योजना की जानकारी लें' : 'Enquire About Payment Plan'}
                </span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <span className="text-xs text-slate-400">
                {isHindi ? 'मुफ्त सलाहकार परामर्श उपलब्ध' : 'Complimentary Advisor Consultation'}
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Four-Stage Payment Timeline */}
        <div className="mb-12">
          {/* Stage Selection Tabs */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stages.map((stage, idx) => {
              const isActive = activeStage === idx;
              return (
                <button
                  key={stage.stageNum}
                  onClick={() => setActiveStage(idx)}
                  className={`flex flex-col items-start rounded-2xl p-5 text-left transition-all ${
                    isActive
                      ? 'border-2 border-amber-400 bg-slate-800 shadow-lg ring-1 ring-amber-400/50'
                      : 'border border-white/10 bg-slate-800/50 hover:border-white/20 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span
                      className={`text-xs font-bold tracking-wider uppercase ${
                        isActive ? 'text-amber-400' : 'text-slate-400'
                      }`}
                    >
                      Stage {stage.stageNum}
                    </span>
                    <span className="text-xs text-slate-400">{stage.coverage}</span>
                  </div>
                  <p className="mt-2 text-lg font-bold text-white">{stage.months}</p>
                  <p className="mt-1 text-xs text-amber-300/90">₹79,999 / Stage Bench</p>
                </button>
              );
            })}
          </div>

          {/* Active Stage Detailed Card */}
          <div className="mt-6 rounded-3xl border border-white/10 bg-slate-800/80 p-6 backdrop-blur-md sm:p-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Left Column: Stage Summary */}
              <div className="border-b border-white/10 pb-6 md:border-r md:border-b-0 md:pr-8">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300 uppercase">
                  <Calendar className="h-3.5 w-3.5" />
                  {stages[activeStage].months}
                </span>

                <h3 className="mt-4 font-serif text-2xl font-bold text-white">
                  {stages[activeStage].title}
                </h3>

                <div className="mt-6 space-y-4">
                  <div>
                    <span className="text-xs text-slate-400 uppercase">
                      {isHindi ? 'मासिक किस्त' : 'Monthly Installment'}
                    </span>
                    <p className="text-2xl font-bold text-amber-400">
                      {stages[activeStage].monthlyPayment}{' '}
                      <span className="text-xs font-normal text-slate-400">/ Month</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase">
                      {isHindi ? 'स्टेज बेंचमार्क राशि' : 'Stage Benchmark Target'}
                    </span>
                    <p className="text-xl font-bold text-white">
                      {stages[activeStage].stageTargetAmount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Middle Column: Milestone Assurance */}
              <div className="md:col-span-2">
                <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                  {isHindi ? 'स्टेज माइलस्टोन एवं कार्य प्रगति' : 'Stage Milestone & Deliverables'}
                </h4>
                <p className="mt-2 text-lg font-semibold text-slate-100">
                  {stages[activeStage].milestone}
                </p>

                {/* Features List */}
                <div className="mt-6 space-y-3">
                  {stages[activeStage].features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Timeline Progress Bar */}
                <div className="mt-8">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Overall Plan Completion</span>
                    <span className="font-bold text-amber-400">
                      {stages[activeStage].progressPercent}%
                    </span>
                  </div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
                      style={{ width: `${stages[activeStage].progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Charges & Terms Disclaimer (As Specified in Brochure) */}
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-400" />
            <div className="text-xs leading-relaxed text-slate-300 sm:text-sm">
              <p className="font-bold text-amber-300">
                {isHindi
                  ? 'बुकिंग शुल्क एवं महत्वपूर्ण शर्तें (Brochure Disclaimer):'
                  : 'Booking Charges & Terms Disclaimer:'}
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-slate-300">
                <li>
                  {isHindi
                    ? 'प्लॉट का वास्तविक आवंटन कंपनी के आधिकारिक आवेदन पत्र एवं अग्रिम बुकिंग राशि जमा कराने के पश्चात ही मान्य होगा।'
                    : 'Plot allotment is strictly subject to submission of the official company application form and clearance of initial booking advance.'}
                </li>
                <li>
                  {isHindi
                    ? 'मासिक किस्त ₹9,999 की दर से 40 महीनों के लिए देय होगी। प्रत्येक स्टेज के लिए ₹79,999 प्रति स्टेज का विभाजन विवरण अनुबंध के अनुसार रहेगा।'
                    : 'The standard installment is scheduled at ₹9,999 per month for 40 months. Stage benchmarks of ₹79,999 per stage correspond to developmental schedule milestones.'}
                </li>
                <li>
                  {isHindi
                    ? 'रजिस्ट्री शुल्क, स्टाम्प ड्यूटी एवं सरकारी कर तत्कालीन सरकारी नियमानुसार अतिरिक्त देय होंगे।'
                    : 'Government registration charges, stamp duty, and statutory taxes are applicable at actual rates at the time of deed execution.'}
                </li>
                <li>
                  {isHindi
                    ? 'कॉर्नर एवं पार्क फेसिंग प्लॉट्स पर पीएलसी (Preferred Location Charges) लागू हो सकते हैं।'
                    : 'Corner and park-facing plots may attract Preferred Location Charges (PLC) as per company policy.'}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Trust Assurance */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>100% Verified Title & Registry</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Digital Ledger Receipts on Portal</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>No Hidden Surcharges</span>
          </div>
        </div>
      </div>
    </section>
  );
}
