import Image from 'next/image';
import { Phone, Mail, MapPin } from 'lucide-react';

export function BrochureClosing() {
  return (
    <section
      id="page-8-closing"
      className="relative flex min-h-[80vh] w-full items-end md:h-screen"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=2187&auto=format&fit=crop"
          alt="Golden Sunset"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1A2E] via-[#0F1A2E]/80 to-transparent"></div>
      </div>

      <div className="brochure-container relative z-10 w-full pt-24 pb-10 md:pt-40 md:pb-20">
        <div className="mb-12 text-center md:mb-20">
          <h2 className="font-heading mb-6 text-4xl text-white md:text-6xl lg:text-7xl">
            Reserve Your Place in Tomorrow&apos;s Community
          </h2>
          <p className="font-subheading text-sm tracking-widest text-[#C9A84C] uppercase md:text-xl">
            Every great legacy begins with the right address.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl md:grid-cols-2 md:gap-12 md:p-16 lg:grid-cols-4">
          <div>
            <p className="font-subheading mb-4 text-xs font-bold tracking-widest text-[#D4AF37] uppercase md:text-sm">
              Contact Us
            </p>
            <div className="font-body space-y-4 text-sm text-white/90 md:text-base">
              <p className="flex items-center gap-3">
                <Phone size={18} className="text-[#C9A84C]" /> +91 73000 07643
              </p>
              <p className="flex items-center gap-3">
                <Phone size={18} className="text-[#C9A84C]" /> +91 92160 14579
              </p>
              <p className="flex items-center gap-3 break-all">
                <Mail size={18} className="flex-shrink-0 text-[#C9A84C]" />{' '}
                info@sviinfrasolutions.com
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <p className="font-subheading mb-4 text-xs font-bold tracking-widest text-[#D4AF37] uppercase md:text-sm">
              Corporate Office
            </p>
            <div className="font-body flex items-start gap-3 space-y-2 text-sm leading-relaxed text-white/90 md:text-base">
              <MapPin size={18} className="mt-1 flex-shrink-0 text-[#C9A84C]" />
              <p>
                SVI Infra Solutions Pvt. Ltd.
                <br />
                Block E-220, 2nd Floor, Sector 63
                <br />
                Noida, Uttar Pradesh 201309
              </p>
            </div>
          </div>

          <div className="flex flex-row items-center justify-between md:flex-col md:items-start lg:items-end">
            <div>
              <p className="font-subheading mb-2 text-xs font-bold tracking-widest text-[#D4AF37] uppercase md:mb-4 md:text-sm">
                Visit Us
              </p>
              <p className="font-body flex cursor-pointer items-center gap-2 text-sm text-white transition-colors hover:text-[#C9A84C] md:text-base">
                www.sviinfrasolutions.com
              </p>
            </div>

            <div className="mt-4 rounded-xl bg-white p-2 md:mt-8">
              <div className="flex h-16 w-16 items-center justify-center border-2 border-dashed border-[#0F1A2E]/20 md:h-24 md:w-24">
                <span className="font-subheading text-center text-[10px] font-bold text-[#0F1A2E]/50 uppercase md:text-xs">
                  Scan
                  <br />
                  QR
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 mb-6 h-px w-full bg-white/10 md:mt-16 md:mb-8"></div>

        <div className="font-body flex flex-col items-center justify-between gap-4 text-center text-[10px] tracking-widest text-white/50 uppercase md:flex-row md:text-left md:text-xs">
          <p>© {new Date().getFullYear()} SVI Infra Solutions. All Rights Reserved.</p>
          <p>Designed for Generations.</p>
        </div>
      </div>
    </section>
  );
}
