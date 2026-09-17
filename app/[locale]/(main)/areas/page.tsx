import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Compass,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { SITE_NAME, buildAlternates, localizedUrl } from '@/src/lib/seo';
import { AREAS_DATA, type AreaInfo } from '@/src/data/areas';
import { BreadcrumbSchema } from '@/src/components/common/Schema';

type Props = {
  params: Promise<{ locale: string }>;
};

const AREA_VISUALS: Record<
  string,
  {
    image: string;
    badge: { en: string; hi: string };
    projectsPreview: Array<{ name: string; slug?: string }>;
  }
> = {
  'khatu-shyam-highway': {
    image: '/Shivani Vatika 11/gate.webp',
    badge: { en: 'Sacred Growth Corridor', hi: 'पवित्र तीर्थ कॉरिडोर' },
    projectsPreview: [{ name: 'Shivani Vatika 11th', slug: 'shivani-vatika-11th' }],
  },
  'nayla-jaipur': {
    image: '/Shivani Vatika/shivani vatika6 frontgate.webp',
    badge: { en: 'Premier Residential', hi: 'प्रीमियर आवासीय' },
    projectsPreview: [{ name: 'Shivani Vatika', slug: 'shivani-vatika' }],
  },
  'tonk-road-jaipur': {
    image: '/Shivani Vatika/shivani vatika6 frontgate.webp',
    badge: { en: 'Premier Residential', hi: 'प्रीमियर आवासीय' },
    projectsPreview: [{ name: 'Shivani Vatika', slug: 'shivani-vatika' }],
  },
  'phulera-smart-city': {
    image: '/images/landmarks/phulera-dmic.webp',
    badge: { en: 'DMIC Mega Hub', hi: 'DMIC मेगा हब' },
    projectsPreview: [{ name: 'Shivani Residency' }],
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isHindi = locale === 'hi';

  const title = isHindi
    ? 'प्रमुख निवेश कॉरिडोर एवं विकास क्षेत्र | SVI Infra Solutions'
    : 'Prime Real Estate Corridors & Growth Areas in Jaipur | SVI Infra Solutions';
  const description = isHindi
    ? 'जयपुर एवं दिल्ली-मुंबई इंडस्ट्रियल कॉरिडोर (DMIC) के प्रमुख निवेश क्षेत्रों का अन्वेषण करें। जयपुर से खाटू श्याम जी हाईवे, नायला एवं फुलेरा स्मार्ट सिटी में रणनीतिक आवासीय प्लॉट्स।'
    : 'Explore strategic real estate growth corridors across Jaipur and the Delhi-Mumbai Industrial Corridor (DMIC). Discover high-ROI plotted townships in Jaipur to Khatu Shyam Ji Highway, Nayla, and Phulera Smart City.';

  const path = '/areas';

  return {
    title,
    description,
    alternates: buildAlternates(path, locale),
    openGraph: {
      title,
      description,
      url: localizedUrl(path, locale),
      type: 'website',
      siteName: SITE_NAME,
      locale: isHindi ? 'hi_IN' : 'en_IN',
      images: [
        {
          url: '/images/project1.png',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/images/project1.png'],
    },
  };
}

export default async function AreasIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isHindi = locale === 'hi';

  const areasList = Object.values(AREAS_DATA).filter((a) => a.slug !== 'tonk-road-jaipur');

  return (
    <main className="flex min-h-screen w-full flex-col bg-[#fbf9f4] pb-24 dark:bg-[#080d1a]">
      <BreadcrumbSchema
        items={[
          { name: isHindi ? 'होम' : 'Home', item: '/' },
          { name: isHindi ? 'विकास क्षेत्र' : 'Areas', item: '/areas' },
        ]}
      />

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-amber-500/20 bg-linear-to-b from-[#0e1626] via-[#101b30] to-[#0a1120] pt-32 pb-20 text-white">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:4rem_4rem]"
          aria-hidden="true"
        />

        <div className="relative container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-bold tracking-widest text-amber-300 uppercase shadow-inner">
            <Compass className="h-3.5 w-3.5 text-amber-400" />
            <span>{isHindi ? 'रणनीतिक विकास क्षेत्र' : 'Strategic Growth Corridors'}</span>
          </div>

          <h1 className="mt-6 font-serif text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            {isHindi ? (
              <>
                जहाँ जयपुर का विकास है, <br />
                <span className="bg-linear-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                  वहाँ हमारी टाउनशिप हैं
                </span>
              </>
            ) : (
              <>
                Where Jaipur Grows, <br />
                <span className="bg-linear-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                  We Build Legacy Corridors
                </span>
              </>
            )}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            {isHindi
              ? 'जयपुर से खाटू श्याम जी हाईवे, नायला एवं फुलेरा स्मार्ट सिटी (DMIC कॉरिडोर) के सबसे तेजी से विकसित हो रहे रणनीतिक क्षेत्रों में सुरक्षित, 100% कानूनी और उच्च रिटर्न वाले आवासीय भूखंड।'
              : 'Curated high-potential corridors backed by multi-lane national highways, the Jaipur to Khatu Shyam Ji Highway, Nayla, and the Delhi-Mumbai Industrial Corridor with complete legal clarity.'}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-300 sm:text-sm">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              {isHindi ? '100% वैध दस्तावेज़' : '100% Legal Clear Titles'}
            </span>
            <span className="text-slate-500">•</span>
            <span className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-amber-400" />
              {isHindi ? 'उच्च पूंजी वृद्धि' : 'High Capital Appreciation'}
            </span>
            <span className="text-slate-500">•</span>
            <span className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-blue-400" />
              {isHindi ? 'मास्टर प्लान टाउनशिप' : 'Master-Planned Townships'}
            </span>
          </div>
        </div>
      </section>

      {/* Corridors Grid */}
      <section className="container mx-auto mt-12 px-4 sm:mt-16">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-end dark:border-slate-800">
          <div>
            <span className="text-xs font-bold tracking-wider text-amber-600 uppercase dark:text-amber-400">
              {isHindi ? 'क्षेत्रवार अवलोकन' : 'Regional Overview'}
            </span>
            <h2 className="mt-1 font-serif text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
              {isHindi ? 'प्रमुख विकास कॉरिडोर' : 'Featured Growth Hubs'}
            </h2>
          </div>
          <p className="max-w-md text-xs text-slate-600 sm:text-sm dark:text-slate-400">
            {isHindi
              ? 'प्रत्येक कॉरिडोर का गहन विश्लेषण, कनेक्टिविटी और हमारे संबंधित प्रोजेक्ट्स देखें।'
              : 'Select a growth corridor below to explore its connectivity, neighborhood advantages, and active SVI developments.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {areasList.map((area: AreaInfo) => {
            const visual = AREA_VISUALS[area.slug] || {
              image: '/images/project1.png',
              badge: { en: 'Prime Corridor', hi: 'प्रमुख कॉरिडोर' },
              projectsPreview: [],
            };

            const title = isHindi && area.metaTitleHi ? area.metaTitleHi : area.name;
            const subtitle =
              isHindi && area.metaDescriptionHi ? area.metaDescriptionHi : area.title;

            return (
              <article
                key={area.slug}
                className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl shadow-slate-950/5 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/50 hover:shadow-2xl hover:shadow-amber-500/10 dark:border-slate-800/80 dark:bg-[#0f172a]/90"
              >
                {/* Visual Image Header */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-900 sm:h-64">
                  <Image
                    src={visual.image}
                    alt={area.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[11px] font-bold text-amber-300 backdrop-blur-md">
                      <MapPin className="h-3 w-3 text-amber-400" />
                      {isHindi ? visual.badge.hi : visual.badge.en}
                    </span>
                  </div>

                  {/* Name overlaid on image bottom */}
                  <div className="absolute right-4 bottom-4 left-4 text-white">
                    <h3 className="font-serif text-xl font-bold tracking-tight sm:text-2xl">
                      {title}
                    </h3>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <p className="line-clamp-2 text-xs font-semibold text-amber-600 sm:text-sm dark:text-amber-400">
                    {subtitle}
                  </p>

                  <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-300">
                    {area.description}
                  </p>

                  {/* Highlights Checklist */}
                  <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
                    <h4 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                      {isHindi ? 'मुख्य विशेषताएं' : 'Key Advantages'}
                    </h4>
                    <ul className="mt-3 space-y-2.5">
                      {area.highlights.slice(0, 3).map((highlight: string, idx: number) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200"
                        >
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                          <span className="line-clamp-1">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Associated Projects Preview */}
                  {visual.projectsPreview.length > 0 && (
                    <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800/80 dark:bg-slate-900/50">
                      <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                        {isHindi ? 'टाउनशिप प्रोजेक्ट्स' : 'Associated Projects'}
                      </span>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {visual.projectsPreview.map((proj, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center rounded-lg border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300"
                          >
                            {proj.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Spacer to push CTA to bottom */}
                  <div className="mt-auto pt-6">
                    <Link
                      href={`/areas/${area.slug}`}
                      className="group/btn inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-400/30 bg-amber-400/15 py-3 text-xs font-bold text-slate-900 transition-all duration-200 hover:border-amber-400 hover:bg-amber-400 hover:text-slate-950 sm:text-sm dark:text-amber-300 dark:hover:text-slate-950"
                    >
                      <span>{isHindi ? 'पूरा क्षेत्र गाइड देखें' : 'Explore Area Guide'}</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Why Invest in SVI Corridors Section */}
      <section className="container mx-auto mt-20 px-4">
        <div className="rounded-3xl border border-amber-500/20 bg-linear-to-r from-[#0c1322] via-[#101b30] to-[#0c1322] p-8 text-white sm:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
              {isHindi ? 'रणनीतिक चयन' : 'Investment Philosophy'}
            </span>
            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-4xl">
              {isHindi
                ? 'हम केवल उच्च विकास वाले कॉरिडोर क्यों चुनते हैं?'
                : 'Why SVI Develops Exclusively Along Major Corridors'}
            </h2>
            <p className="mt-4 text-xs leading-relaxed text-slate-300 sm:text-base">
              {isHindi
                ? 'रियल एस्टेट में लाभ स्थान से नहीं, बल्कि भविष्य की कनेक्टिविटी से तय होता है। हमारे सभी प्रोजेक्ट्स आगामी रिंग रोड, डीएमआईसी और राष्ट्रीय राजमार्गों से जुड़े हुए हैं।'
                : 'Real estate wealth is created at the intersection of government infrastructure and private capital. Every SVI township is strategically positioned ahead of civic growth curves.'}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/20 text-amber-400">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">
                {isHindi ? 'हाईवे एवं एक्सप्रेसवे कनेक्टिविटी' : 'Infrastructure Centric'}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                {isHindi
                  ? 'जयपुर रिंग रोड, डीएमआईसी फ्रेट कॉरिडोर और खाटू श्याम जी हाईवे जैसे प्रमुख मार्गों पर स्थित प्रोजेक्ट्स।'
                  : 'Zero isolated locations. Direct access to 4/6-lane arterial corridors and upcoming rapid transit.'}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/20 text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">
                {isHindi ? '100% स्पष्ट दस्तावेज़ीकरण' : 'Bank-Grade Due Diligence'}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                {isHindi
                  ? 'तत्काल रजिस्ट्री, दाखिल खारिज और जेडीए/143 नियमों के अनुरूप पारदर्शी विकास कार्य।'
                  : 'Pre-vetted land ownership, clear demarcation, and 100% registry-ready parcels for peace of mind.'}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/20 text-blue-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">
                {isHindi ? 'उच्च पूंजी प्रशंसा (ROI)' : 'First-Mover Value Gain'}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                {isHindi
                  ? 'प्रारंभिक चरण में निवेश करने वाले ग्राहकों के लिए अधिकतम रिटर्न और सुरक्षित परिसंपत्ति निर्माण।'
                  : 'Early entry in notified smart city and logistics clusters ensures maximum compound appreciation.'}
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 text-center sm:flex-row">
            <Link
              href="/registration"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-300 active:scale-98 sm:text-sm"
            >
              <span>{isHindi ? 'प्रोजेक्ट विज़िट बुक करें' : 'Book a Corridor Site Visit'}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-xs font-bold text-white transition-all hover:bg-white/20 active:scale-98 sm:text-sm"
            >
              <span>{isHindi ? 'सलाहकार से संपर्क करें' : 'Talk to a Land Specialist'}</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
