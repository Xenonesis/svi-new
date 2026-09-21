'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  X,
  ZoomIn,
  Sparkles,
  Compass,
  Lock,
  Send,
  CheckCircle2,
  Phone,
  User,
  Mail,
  FileSpreadsheet,
} from 'lucide-react';

export interface ShowcaseItem {
  id: string;
  title: string;
  titleHi?: string;
  subtitle: string;
  subtitleHi?: string;
  tag: string;
  image: string;
  colSpan?: 'single' | 'wide';
  pdfUrl?: string;
}

interface ProjectShowcaseGalleryProps {
  items: ShowcaseItem[];
  isHindi?: boolean;
}

export default function ProjectShowcaseGallery({
  items,
  isHindi = false,
}: ProjectShowcaseGalleryProps) {
  const [activeItem, setActiveItem] = useState<ShowcaseItem | null>(null);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [inquiryTargetItem, setInquiryTargetItem] = useState<ShowcaseItem | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!items || items.length === 0) return null;

  const handleCardClick = (item: ShowcaseItem) => {
    // If it's a PDF blueprint/masterplan, gate it with inquiry lead modal
    if (item.pdfUrl) {
      setInquiryTargetItem(item);
      setIsInquiryModalOpen(true);
      setSubmitSuccess(false);
      setErrorMessage('');
    } else {
      setActiveItem(item);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage(isHindi ? 'कृपया अपना नाम दर्ज करें।' : 'Please enter your name.');
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setErrorMessage(
        isHindi
          ? 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।'
          : 'Please enter a valid 10-digit mobile number.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Post lead to /api/chat/leads (records in chat_leads CRM)
      const leadPayload = {
        name: name.trim(),
        phone: cleanPhone,
        email: email.trim() || undefined,
        source: 'master_plan_inquiry',
      };

      const res = await fetch('/api/chat/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadPayload),
      });

      // 2. Also register as a formal contact inquiry with subject
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: cleanPhone,
          email: email.trim() || 'inquiry@sviinfrasolutions.com',
          subject: `Master Plan Request: ${inquiryTargetItem?.title || 'Shivani Vatika 11th'}`,
          message: `Customer requested official Master Plan PDF for ${inquiryTargetItem?.title || 'Shivani Vatika 11th'}. Please verify and send the blueprint to WhatsApp/Email.`,
        }),
      }).catch(() => {});

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to submit inquiry');
      }

      setSubmitSuccess(true);
      setName('');
      setPhone('');
      setEmail('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      {/* Background glow accents */}
      <div className="bg-brand-gold/5 pointer-events-none absolute top-1/2 left-1/2 h-96 w-full max-w-6xl -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" />

      <div className="relative z-10 container mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mb-12 text-center md:mb-16">
          <div className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold mb-3 inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-semibold tracking-widest uppercase backdrop-blur-sm">
            <Sparkles size={14} className="text-brand-gold" />
            <span>{isHindi ? 'टाउनशिप विज़ुअल्स' : 'GALLERY'}</span>
          </div>
          <h2 className="text-brand-navy font-serif text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl dark:text-gray-100">
            {isHindi ? 'टाउनशिप का संपूर्ण स्वरूप' : 'The Township As It Stands Today'}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-gray-600 sm:text-base dark:text-gray-400">
            {isHindi
              ? 'आधुनिक बुनियादी ढांचे, सुनियोजित सड़कों और प्राकृतिक हरियाली के साथ तैयार किया गया मास्टरप्लान।'
              : 'A master planned community featuring wide paved boulevards, lush green reserves, illuminated avenues, and secure gated entry.'}
          </p>
        </div>

        {/* Editorial Visual Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6">
          {items.map((item, idx) => {
            const isWide = item.colSpan === 'wide';
            const colSpanClass = isWide ? 'lg:col-span-3' : 'lg:col-span-2';
            const isGatedPdf = Boolean(item.pdfUrl);

            return (
              <div
                key={item.id || idx}
                onClick={() => handleCardClick(item)}
                className={`group hover:border-brand-gold/60 relative cursor-pointer overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900/90 ${colSpanClass}`}
              >
                {/* Image Container with Aspect Ratio */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
                      isGatedPdf ? 'scale-105 opacity-60 blur-[3px] filter' : ''
                    }`}
                  />
                  {/* Subtle Gradient Overlay */}
                  <div
                    className={`absolute inset-0 transition-opacity duration-300 ${
                      isGatedPdf
                        ? 'bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40 opacity-95'
                        : 'bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90'
                    }`}
                  />

                  {/* Centered Luxury Lock Watermark / Shield for Gated Items */}
                  {isGatedPdf && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 text-center">
                      <div className="border-brand-gold/40 text-brand-gold group-hover:border-brand-gold group-hover:shadow-brand-gold/20 flex h-14 w-14 items-center justify-center rounded-2xl border bg-slate-950/80 shadow-2xl backdrop-blur-md transition-all duration-300 group-hover:scale-110">
                        <Lock size={26} className="animate-pulse" />
                      </div>
                      <div className="border-brand-gold/30 bg-brand-gold/15 mt-2.5 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold tracking-widest text-amber-300 uppercase backdrop-blur-md">
                        <Lock size={11} />
                        <span>Confidential Layout</span>
                      </div>
                    </div>
                  )}

                  {/* Top Category Badge */}
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                    <span className="text-brand-gold rounded-md border border-white/20 bg-black/60 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase backdrop-blur-md">
                      {item.tag}
                    </span>
                    {isGatedPdf && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/40 bg-amber-500/20 px-2.5 py-1 text-[10px] font-bold text-amber-300 uppercase backdrop-blur-md">
                        <span>Locked Document</span>
                      </span>
                    )}
                  </div>

                  {/* Top Right Action Floating Icon */}
                  <div className="absolute top-3 right-3 z-10">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full shadow-lg transition-all duration-300 ${
                        isGatedPdf
                          ? 'border-brand-gold/40 text-brand-gold group-hover:bg-brand-gold group-hover:text-brand-navy border bg-slate-900/90 backdrop-blur-md'
                          : 'bg-brand-gold text-brand-navy opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {isGatedPdf ? <Lock size={14} /> : <ZoomIn size={16} />}
                    </div>
                  </div>

                  {/* Bottom Text Over Image */}
                  <div className="absolute inset-x-0 bottom-0 z-10 p-4 text-white">
                    <h3 className="group-hover:text-brand-gold font-serif text-lg leading-snug font-bold drop-shadow-sm transition-colors">
                      {isHindi && item.titleHi ? item.titleHi : item.title}
                    </h3>
                    <p className="mt-1 line-clamp-1 text-xs text-gray-300">
                      {isHindi && item.subtitleHi ? item.subtitleHi : item.subtitle}
                    </p>
                  </div>
                </div>

                {/* Bottom Clean Meta Bar */}
                <div className="group-hover:bg-brand-gold/5 group-hover:text-brand-gold flex items-center justify-between border-t border-gray-100 bg-gray-50/80 px-4 py-2.5 text-[11px] font-semibold text-gray-600 transition-colors dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-400">
                  <span className="inline-flex items-center gap-1.5 tracking-wider uppercase">
                    {isGatedPdf ? (
                      <>
                        <FileSpreadsheet size={13} className="text-brand-gold" />
                        <span>Request Official Master Plan</span>
                      </>
                    ) : (
                      <>
                        <Compass size={13} className="text-brand-gold" />
                        <span>View Blueprint Details</span>
                      </>
                    )}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500">SVI Infra Solutions</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 1. LEAD INQUIRY MODAL (FOR MASTER PLAN PDF) ──────────────────── */}
      {isInquiryModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md duration-200"
          onClick={() => setIsInquiryModalOpen(false)}
        >
          <div
            className="border-brand-gold/30 relative w-full max-w-lg overflow-hidden rounded-3xl border bg-slate-900 p-6 text-white shadow-2xl md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsInquiryModalOpen(false)}
              className="hover:bg-brand-gold hover:text-brand-navy absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-gray-300 transition-all"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {submitSuccess ? (
              /* Success State */
              <div className="py-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="font-serif text-2xl font-bold text-white">
                  {isHindi ? 'अनुरोध सफलतापूर्वक प्राप्त हुआ!' : 'Request Received Successfully!'}
                </h3>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-gray-300">
                  {isHindi
                    ? 'आपकी जानकारी हमारी प्रशासनिक टीम तक पहुंच गई है। सत्यापन के बाद हमारी टीम आपके WhatsApp/Email पर मास्टर प्लान पीडीएफ साझा करेगी।'
                    : 'Your inquiry has been submitted to our sales administration. Upon verification, our team will share the complete official Master Plan PDF on your WhatsApp and Email.'}
                </p>
                <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300">
                  <span>Contact: +91-73000-07643 · info@sviinfrasolutions.com</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsInquiryModalOpen(false)}
                  className="bg-brand-gold text-brand-navy mt-6 w-full rounded-xl py-3 text-xs font-bold shadow-md transition-all hover:bg-white"
                >
                  {isHindi ? 'ठीक है (Close)' : 'Done'}
                </button>
              </div>
            ) : (
              /* Inquiry Form */
              <div>
                <div className="mb-6">
                  <div className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold mb-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
                    <Lock size={12} />
                    <span>Official Blueprint Request</span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-white">
                    {isHindi ? 'मास्टर प्लान प्राप्त करें' : 'Request Official Master Plan'}
                  </h3>
                  <p className="mt-2 text-xs text-gray-300">
                    {isHindi
                      ? 'शिवानी वाटिका 11th का आधिकारिक लेआउट प्लान और डिमेंशन्स प्राप्त करने के लिए कृपया अपना विवरण दर्ज करें।'
                      : 'Please provide your details below. Our team will verify your request and send the official high-resolution Master Plan PDF directly to your WhatsApp or Email.'}
                  </p>
                </div>

                {errorMessage && (
                  <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold tracking-wider text-gray-300 uppercase">
                      {isHindi ? 'आपका पूरा नाम *' : 'Full Name *'}
                    </label>
                    <div className="relative">
                      <User
                        size={16}
                        className="absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="focus:border-brand-gold w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pr-4 pl-10 text-sm text-white transition-all placeholder:text-gray-500 focus:bg-white/10 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold tracking-wider text-gray-300 uppercase">
                      {isHindi ? 'मोबाइल नंबर (WhatsApp) *' : 'Mobile Number (WhatsApp) *'}
                    </label>
                    <div className="relative">
                      <Phone
                        size={16}
                        className="absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="10-digit mobile number"
                        className="focus:border-brand-gold w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pr-4 pl-10 text-sm text-white transition-all placeholder:text-gray-500 focus:bg-white/10 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold tracking-wider text-gray-300 uppercase">
                      {isHindi ? 'ईमेल आईडी (वैकल्पिक)' : 'Email Address (Optional)'}
                    </label>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="rahul@example.com"
                        className="focus:border-brand-gold w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pr-4 pl-10 text-sm text-white transition-all placeholder:text-gray-500 focus:bg-white/10 focus:outline-none"
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-400">
                    By submitting, you agree to receive property updates & verified documents from
                    SVI Infra Solutions.
                  </p>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-brand-gold text-brand-navy hover:shadow-brand-gold/20 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold shadow-lg transition-all hover:bg-white disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Submitting Inquiry...</span>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>
                          {isHindi
                            ? 'मास्टर प्लान का अनुरोध भेजें'
                            : 'Submit Inquiry & Request Plan'}
                        </span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── 2. ORDINARY IMAGE LIGHTBOX MODAL (FOR OTHER SHOWCASE ITEMS) ─── */}
      {activeItem && !activeItem.pdfUrl && (
        <div
          role="dialog"
          aria-modal="true"
          className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md duration-200"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="border-brand-gold/30 relative w-full max-w-5xl overflow-hidden rounded-3xl border bg-gray-950 p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveItem(null)}
              className="hover:bg-brand-gold hover:text-brand-navy absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white transition-all"
              aria-label="Close Preview"
            >
              <X size={20} />
            </button>

            {/* Modal Image */}
            <div className="relative aspect-[16/10] max-h-[75vh] w-full overflow-hidden rounded-2xl bg-black">
              <Image
                src={activeItem.image}
                alt={activeItem.title}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Modal Caption */}
            <div className="flex flex-col gap-4 p-4 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <div className="text-brand-gold inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                  <span>{activeItem.tag}</span>
                  <span>•</span>
                  <span>Shivani Vatika 11th</span>
                </div>
                <h3 className="mt-1 font-serif text-2xl font-bold">
                  {isHindi && activeItem.titleHi ? activeItem.titleHi : activeItem.title}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-400">
                  {isHindi && activeItem.subtitleHi ? activeItem.subtitleHi : activeItem.subtitle}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="bg-brand-gold text-brand-navy self-start rounded-xl px-5 py-2.5 text-xs font-bold shadow-md transition-all hover:bg-white sm:self-auto"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
