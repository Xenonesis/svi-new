import {
  Phone,
  Mail,
  MapPin,
  Globe,
  MessageSquare,
  Building,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface SV13ContactSectionProps {
  isHindi?: boolean;
}

export function SV13ContactSection({ isHindi = false }: SV13ContactSectionProps) {
  return (
    <section id="contact" className="scroll-mt-20 bg-slate-900 py-20 text-white">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-amber-300 uppercase">
            <Building className="h-3.5 w-3.5" />
            {isHindi ? 'आधिकारिक संपर्क विवरण' : 'Official Corporate Office & Contact'}
          </div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            SVI INFRA SOLUTIONS PVT. LTD.
          </h2>
          <p className="mt-4 text-base text-slate-300 sm:text-lg">
            {isHindi
              ? 'हमारे कॉर्पोरेट कार्यालय में आएं अथवा सीधे फोन और व्हाट्सएप पर वरिष्ठ सलाहकारों से संपर्क करें।'
              : 'Connect directly with our dedicated project directors and sales advisory team.'}
          </p>
        </div>

        {/* 4 Interactive Contact Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Phone & Call */}
          <a
            href="tel:+917300007643"
            className="group flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-800/80 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 hover:shadow-2xl"
          >
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-400 transition-colors group-hover:bg-amber-400 group-hover:text-slate-950">
                <Phone className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold tracking-wider text-amber-300 uppercase">
                {isHindi ? 'फोन कॉल' : 'Direct Helpline'}
              </span>
              <p className="mt-2 text-lg font-bold text-white group-hover:text-amber-400">
                +91 73000 07643
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {isHindi ? 'सोम-शनि सुबह 9 से शाम 7 बजे तक' : 'Mon-Sat 9:00 AM - 7:00 PM IST'}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-bold text-amber-400 uppercase">
              <span>{isHindi ? 'कॉल करें' : 'Call Now'}</span>
              <span>→</span>
            </div>
          </a>

          {/* Card 2: WhatsApp Chat */}
          <a
            href={`https://wa.me/917300007643?text=${encodeURIComponent(
              'Hello SVI Infra Solutions, I would like to inquire about Shivani Vatika 13th plots.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between rounded-3xl border border-emerald-500/20 bg-slate-800/80 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400 hover:shadow-2xl"
          >
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 transition-colors group-hover:bg-emerald-500 group-hover:text-slate-950">
                <MessageSquare className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
                WhatsApp Support
              </span>
              <p className="mt-2 text-lg font-bold text-white group-hover:text-emerald-400">
                +91 73000 07643
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {isHindi
                  ? 'त्वरित चैट एवं ब्रोशर प्राप्ति'
                  : 'Instant brochure & live chat response'}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-bold text-emerald-400 uppercase">
              <span>{isHindi ? 'व्हाट्सएप चैट शुरू करें' : 'Chat on WhatsApp'}</span>
              <span>→</span>
            </div>
          </a>

          {/* Card 3: Official Email */}
          <a
            href="mailto:info@sviinfrasolutions.com?subject=Shivani%20Vatika%2013th%20Inquiry"
            className="group flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-800/80 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-sky-400 hover:shadow-2xl"
          >
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-400 transition-colors group-hover:bg-sky-400 group-hover:text-slate-950">
                <Mail className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold tracking-wider text-sky-400 uppercase">
                Official Email
              </span>
              <p className="mt-2 text-base font-bold break-all text-white group-hover:text-sky-300">
                info@sviinfrasolutions.com
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {isHindi ? 'औपचारिक प्रस्ताव एवं साझेदारी' : 'Formal proposals & documentation'}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-bold text-sky-400 uppercase">
              <span>{isHindi ? 'ईमेल भेजें' : 'Send Email'}</span>
              <span>→</span>
            </div>
          </a>

          {/* Card 4: Corporate Website */}
          <a
            href="https://www.sviinfrasolutions.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-800/80 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-purple-400 hover:shadow-2xl"
          >
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-400 transition-colors group-hover:bg-purple-400 group-hover:text-slate-950">
                <Globe className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold tracking-wider text-purple-400 uppercase">
                Corporate Portal
              </span>
              <p className="mt-2 text-base font-bold text-white group-hover:text-purple-300">
                www.sviinfrasolutions.com
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {isHindi ? 'कंपनी की आधिकारिक वेबसाइट' : 'Explore all ongoing townships'}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-bold text-purple-400 uppercase">
              <span>{isHindi ? 'वेबसाइट देखें' : 'Visit Website'}</span>
              <span>→</span>
            </div>
          </a>
        </div>

        {/* Corporate Address Banner */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-slate-800/60 p-8 backdrop-blur-md">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-400">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-bold tracking-wider text-amber-300 uppercase">
                  {isHindi ? 'कॉर्पोरेट मुख्यालय पता' : 'Registered Corporate Headquarters'}
                </span>
                <p className="mt-1 text-base font-bold text-white sm:text-lg">
                  Block E-220, 2nd Floor, Sector 63, Noida, Uttar Pradesh 201309
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                    Office Hours: 09:30 AM - 06:30 PM
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    Government Registered Entity
                  </span>
                </div>
              </div>
            </div>

            <a
              href="https://maps.google.com/maps?q=Block+E-220+Sector+63+Noida"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-xs font-bold text-white transition-colors hover:bg-white/20"
            >
              <MapPin className="h-4 w-4 text-amber-400" />
              <span>Get Driving Directions</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
