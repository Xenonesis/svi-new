'use client';

import { Phone, MapPin } from 'lucide-react';

interface OffersCtaCardProps {
  footerTitle: string;
  contactUsForDeals: string;
  callWhatsapp: string;
  locationsTitle: string;
  locationsList: string;
}

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export function OffersCtaCard({
  footerTitle,
  contactUsForDeals,
  callWhatsapp,
  locationsTitle,
  locationsList,
}: OffersCtaCardProps) {
  return (
    <section className="bg-brand-navy border-t border-white/5 py-24">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="border-brand-gold/30 relative overflow-hidden rounded-3xl border bg-slate-900 shadow-2xl">
            <div className="relative z-10 p-8 sm:p-12 md:p-16">
              <div className="text-center">
                <h2 className="font-serif text-3xl font-extrabold tracking-tight text-white uppercase sm:text-5xl">
                  {footerTitle}
                </h2>
                <p className="text-brand-gold mt-4 font-sans text-sm font-bold tracking-widest uppercase">
                  {contactUsForDeals}
                </p>
              </div>

              {/* Call / WhatsApp & QR Grid */}
              <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-12">
                {/* Left Column: Direct Action Contacts */}
                <div className="flex flex-col justify-between gap-6 md:col-span-8">
                  {/* Call Card */}
                  <a
                    href="tel:7300007643"
                    className="hover:border-brand-gold/50 flex items-center gap-5 rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:scale-[1.02]"
                  >
                    <div className="bg-brand-gold text-brand-navy flex h-14 w-14 shrink-0 items-center justify-center rounded-xl">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold tracking-wider text-gray-400 uppercase">
                        {callWhatsapp}
                      </span>
                      <span className="text-xl font-bold tracking-wide text-white sm:text-2xl">
                        +91 73000 07643
                      </span>
                    </div>
                  </a>

                  {/* WhatsApp Card */}
                  <a
                    href="https://wa.me/917300007643"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-5 rounded-2xl border border-white/10 bg-[#075e54]/10 p-5 transition-all hover:scale-[1.02] hover:border-[#25d366]/50"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#25d366] text-white">
                      <svg
                        className="h-6 w-6 fill-current"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold tracking-wider text-gray-400 uppercase">
                        Instant Connect
                      </span>
                      <span className="text-xl font-bold tracking-wide text-white sm:text-2xl">
                        WhatsApp SVI Team
                      </span>
                    </div>
                  </a>
                </div>

                {/* Right Column: QR Code scanning card */}
                <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6 text-center md:col-span-4">
                  <div className="border-brand-gold/20 relative mb-3 flex h-24 w-24 items-center justify-center rounded-lg border bg-[#0f172a] p-1.5">
                    {}
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://www.sviinfrasolutions.com&color=d4af37&bgcolor=0f172a"
                      alt="SVI Infra Website QR Code"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <span className="text-brand-gold mb-1 block text-xs font-semibold tracking-widest uppercase">
                    SCAN QR CODE
                  </span>
                  <span className="text-[10px] text-gray-400">
                    Scan to visit our official website and explore more maps
                  </span>
                </div>
              </div>

              {/* Strategic Locations & Socials footer inside card */}
              <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 sm:flex-row">
                {/* Locations */}
                <div className="flex items-start gap-3">
                  <MapPin className="text-brand-gold mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <span className="block text-xs tracking-wider text-gray-400 uppercase">
                      {locationsTitle}
                    </span>
                    <span className="text-sm font-semibold text-white">{locationsList}</span>
                  </div>
                </div>

                {/* Social Handles */}
                <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                  <a
                    href="https://facebook.com/sviinfrasolutions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:border-brand-gold/40 hover:text-brand-gold flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition-colors"
                    title="SVI Infra Solutions on Facebook"
                  >
                    <FacebookIcon className="h-4.5 w-4.5 shrink-0" />
                    <span className="font-sans text-xs font-semibold whitespace-nowrap">
                      SVI Infra Solutions
                    </span>
                  </a>
                  <a
                    href="https://instagram.com/sviinfrasolutions_official"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:border-brand-gold/40 hover:text-brand-gold flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition-colors"
                    title="sviinfrasolutions_official on Instagram"
                  >
                    <InstagramIcon className="h-4.5 w-4.5 shrink-0" />
                    <span className="font-sans text-xs font-semibold whitespace-nowrap">
                      sviinfrasolutions_official
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
