'use client';

import React, { useState, useCallback } from 'react';
import {
  ChevronDown,
  MessageSquare,
  PhoneCall,
  Send,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  FileDown,
} from 'lucide-react';
import { toast } from 'sonner';
import WhatsAppBrochureModal from '@/src/components/common/WhatsAppBrochureModal';
import { normalizeIndianPhone } from '@/src/lib/utils/phone';

export interface PhuleraFaqItem {
  question: string;
  answer: string;
}

interface PhuleraFaqAccordionProps {
  items: PhuleraFaqItem[];
  isHindi?: boolean;
}

export function PhuleraFaqAccordion({ items, isHindi = false }: PhuleraFaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = useCallback((index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  }, []);

  return (
    <div className="space-y-3.5">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
              isOpen
                ? 'border-amber-500/50 bg-slate-900/90 shadow-lg shadow-amber-500/5'
                : 'border-white/10 bg-slate-900/40 hover:border-white/20 hover:bg-slate-900/60'
            }`}
          >
            <button
              type="button"
              onClick={() => toggleAccordion(index)}
              aria-expanded={isOpen}
              aria-controls={`phulera-faq-${index}`}
              className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors sm:p-6"
            >
              <span className="font-serif text-base font-bold text-white sm:text-lg">
                {item.question}
              </span>
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-transform duration-200 ${
                  isOpen
                    ? 'rotate-180 border-amber-500/40 bg-amber-500/20 text-amber-300'
                    : 'border-white/10 bg-white/5 text-slate-400'
                }`}
              >
                <ChevronDown size={18} />
              </span>
            </button>
            {isOpen && (
              <div
                id={`phulera-faq-${index}`}
                className="border-t border-white/5 px-5 pt-2 pb-5 text-sm leading-relaxed text-slate-300 sm:px-6 sm:pb-6 sm:text-base"
              >
                <p>{item.answer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface PhuleraBrochureButtonProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'outline' | 'whatsapp';
}

export function PhuleraBrochureButton({
  children,
  className = '',
  variant = 'primary',
}: PhuleraBrochureButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  let defaultStyles =
    'inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-xs font-bold tracking-wider uppercase transition-all shadow-md active:scale-95';

  if (variant === 'primary') {
    defaultStyles +=
      ' bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/30';
  } else if (variant === 'whatsapp') {
    defaultStyles +=
      ' bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-500 hover:shadow-emerald-600/30';
  } else {
    defaultStyles +=
      ' border border-white/20 bg-white/5 text-white backdrop-blur-md hover:border-amber-400/50 hover:bg-white/10';
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={`${defaultStyles} ${className}`}
      >
        {children || (
          <>
            <FileDown size={16} />
            <span>Download Phulera Brochure</span>
          </>
        )}
      </button>

      <WhatsAppBrochureModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        projectName="Phulera Smart City Corridor"
        defaultBrochureUrl="/Shivani Vatika 11/ShivaniVatika 11.pdf"
      />
    </>
  );
}

export function PhuleraLeadCaptureForm({ isHindi = false }: { isHindi?: boolean }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [plotType, setPlotType] = useState('Residential (80-250 Sq. Yds.)');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(isHindi ? 'कृपया अपना नाम दर्ज करें' : 'Please enter your name');
      return;
    }
    if (!phone.trim() || !normalizeIndianPhone(phone)) {
      toast.error(
        isHindi
          ? 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें'
          : 'Please enter a valid 10-digit mobile number'
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/site-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          project_interest: `Phulera Corridor Plot Inquiry (${plotType})`,
          preferred_date: new Date().toISOString().split('T')[0],
        }),
      });

      if (!res.ok) throw new Error('Failed to submit');

      setSubmitted(true);
      toast.success(
        isHindi
          ? 'पूछताछ सफलतापूर्वक दर्ज की गई! हमारे प्रतिनिधि शीघ्र ही संपर्क करेंगे।'
          : 'Inquiry registered! Our Senior Investment Advisor will call you shortly.'
      );
    } catch {
      toast.error(
        isHindi
          ? 'अनुरोध दर्ज नहीं हो सका। कृपया सीधे +91-73000-07643 पर संपर्क करें।'
          : 'Could not submit inquiry. Please call +91-73000-07643 directly.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
          <CheckCircle2 size={28} />
        </div>
        <h4 className="font-serif text-lg font-bold text-white">
          {isHindi ? 'धन्यवाद! आपकी पूछताछ दर्ज हो गई है।' : 'Thank You! Inquiry Received.'}
        </h4>
        <p className="mt-1.5 text-xs text-slate-300">
          {isHindi
            ? 'हमारे रियल एस्टेट विशेषज्ञ आपको फुलेरा कॉरिडोर की सम्पूर्ण दर सूची और लेआउट मैप साझा करेंगे।'
            : 'Our corridor advisor will share the latest Phulera Smart City master plan and pricing sheet.'}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://wa.me/917300007643?text=Namaste%20SVI%20Infra,%20I%20just%20inquired%20about%20plots%20in%20Phulera%20Smart%20City%20Corridor."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-500"
          >
            <MessageSquare size={14} />
            <span>{isHindi ? 'तुरंत व्हाट्सएप चैट करें' : 'Chat on WhatsApp Now'}</span>
          </a>
          <a
            href="tel:+917300007643"
            className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10"
          >
            <PhoneCall size={14} className="text-amber-400" />
            <span>+91-73000-07643</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
          {isHindi ? 'आपका पूरा नाम' : 'Full Name'} *
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={isHindi ? 'उदा. राजेश शर्मा' : 'e.g. Rajesh Sharma'}
          className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors focus:border-amber-400/60 focus:bg-slate-900 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
          {isHindi ? 'मोबाइल नंबर (व्हाट्सएप)' : 'Mobile Number (WhatsApp)'} *
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-3.5 text-xs font-bold text-amber-400">+91</span>
          <input
            type="tel"
            required
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            placeholder="98765 43210"
            className="w-full rounded-xl border border-white/10 bg-slate-900/80 py-3 pr-4 pl-12 text-sm text-white placeholder-slate-500 transition-colors focus:border-amber-400/60 focus:bg-slate-900 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
          {isHindi ? 'प्लॉट प्रकार / आवश्यकता' : 'Plot Preference'}
        </label>
        <select
          value={plotType}
          onChange={(e) => setPlotType(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white transition-colors focus:border-amber-400/60 focus:bg-slate-900 focus:outline-none"
        >
          <option value="Residential (80-150 Sq. Yds.)" className="bg-slate-900 text-white">
            {isHindi
              ? 'आवासीय (80-150 वर्ग गज - कॉम्पैक्ट विला)'
              : 'Residential (80–150 Sq. Yds. - Villa Plot)'}
          </option>
          <option value="Residential (150-250 Sq. Yds.)" className="bg-slate-900 text-white">
            {isHindi
              ? 'आवासीय (150-250 वर्ग गज - कॉर्नर/प्रीमियम)'
              : 'Residential (150–250 Sq. Yds. - Premium Plot)'}
          </option>
          <option value="Commercial / Highway Frontage" className="bg-slate-900 text-white">
            {isHindi ? 'कमर्शियल / हाईवे फ्रंट प्लॉट' : 'Commercial / Highway Frontage Plot'}
          </option>
          <option value="Industrial / Warehousing Land" className="bg-slate-900 text-white">
            {isHindi ? 'लॉजिस्टिक्स एवं वेयरहाउसिंग भूमि' : 'Logistics & Warehousing Land'}
          </option>
        </select>
      </div>

      <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
        <ShieldCheck size={14} className="shrink-0 text-emerald-400" />
        <span>
          {isHindi
            ? '100% स्पष्ट रजिस्ट्री एवं जीरो ब्रोकरेज गारंटी'
            : '100% clear titles, zero brokerage & direct developer pricing'}
        </span>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-xs font-bold tracking-wider text-slate-950 uppercase shadow-lg shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-amber-500 disabled:opacity-60"
      >
        {submitting ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
        ) : (
          <>
            <Send size={14} />
            <span>
              {isHindi ? 'कॉल बैक व रेट लिस्ट प्राप्त करें' : 'Request Call Back & Rates'}
            </span>
          </>
        )}
      </button>
    </form>
  );
}
