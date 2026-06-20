import { MapPin, PhoneIcon, Mail, Clock } from 'lucide-react';
import { SITE_URL } from '@/src/lib/seo';
import ContactForm from '@/src/components/contact/ContactForm';
import ContactMapWrapper from '@/src/components/contact/ContactMapWrapper';
import ContactFAQ from '@/src/components/faq/ContactFAQ';

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: 'SVI Infra Solutions Pvt. Ltd.',
  image: `${SITE_URL}/logo.png`,
  url: `${SITE_URL}/contact`,
  telephone: '+91-73000-07643',
  email: 'info@sviinfrasolutions.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'A-61 Sector 65',
    addressLocality: 'Noida',
    addressRegion: 'Uttar Pradesh',
    postalCode: '201309',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 28.6112,
    longitude: 77.382,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '19:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '09:00',
      closes: '17:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Sunday',
      opens: '10:00',
      closes: '16:00',
    },
  ],
  areaServed: [
    { '@type': 'City', name: 'Jaipur' },
    { '@type': 'City', name: 'Noida' },
    { '@type': 'City', name: 'Phulera' },
  ],
  priceRange: '$$$',
};

export default function Contact() {
  return (
    <div className="bg-brand-bg relative pt-20 pb-16 dark:bg-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <section className="bg-brand-bg border-b border-gray-200 py-14 text-center md:py-20 dark:border-gray-700 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h1 className="text-brand-navy animate-hero-h1 mb-6 font-serif text-3xl sm:text-4xl md:text-6xl dark:text-gray-100">
            Contact Us
          </h1>
          <div className="bg-brand-gold animate-hero-divider mx-auto h-px w-16"></div>
        </div>
      </section>

      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row">
            <div className="lg:w-1/3">
              <div className="xs:p-6 h-full border border-gray-200 bg-white p-5 shadow-sm transition-shadow duration-500 hover:shadow-xl md:p-10 dark:border-gray-700 dark:bg-gray-800">
                <h4 className="mb-4 text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase dark:text-gray-500">
                  Reach Out
                </h4>
                <h3 className="text-brand-navy mb-10 font-serif text-3xl dark:text-gray-100">
                  Get In Touch
                </h3>

                <div className="space-y-10">
                  <div className="flex items-start gap-5">
                    <div className="border-brand-gold text-brand-gold flex h-10 w-10 flex-shrink-0 items-center justify-center border pt-1 shadow-sm">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 className="mb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
                        Our Office
                      </h4>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        A-61 Sector 65,
                        <br />
                        Noida, Uttar Pradesh 201309
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="border-brand-gold text-brand-gold flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm border">
                      <PhoneIcon size={20} />
                    </div>
                    <div>
                      <h4 className="mb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
                        Phone
                      </h4>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        +91 73000 07643
                      </p>
                      <p className="text-brand-gold mt-2 text-xs font-bold tracking-widest uppercase">
                        Main Office / Sales
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="border-brand-gold text-brand-gold flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm border">
                      <Mail size={20} />
                    </div>
                    <div>
                      <h4 className="mb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
                        Emails
                      </h4>
                      <a
                        href="mailto:info@sviinfrasolutions.com"
                        className="text-brand-navy hover:text-brand-gold dark:hover:text-brand-gold block text-sm font-medium transition-colors dark:text-gray-300"
                      >
                        info@sviinfrasolutions.com
                      </a>
                      <a
                        href="mailto:sales@sviinfrasolutions.com"
                        className="text-brand-navy hover:text-brand-gold dark:hover:text-brand-gold mt-2 block text-sm font-medium transition-colors dark:text-gray-300"
                      >
                        sales@sviinfrasolutions.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="border-brand-gold text-brand-gold flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm border">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h4 className="mb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
                        Business Hours
                      </h4>
                      <p className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">
                        Mon-Fri: 9AM - 7PM
                      </p>
                      <p className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">
                        Sat: 9AM - 5PM
                      </p>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Sun: 10AM - 4PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6 md:gap-8 lg:w-2/3">
              <ContactForm />
              <ContactMapWrapper />
            </div>
          </div>
        </div>
      </section>
      <ContactFAQ />
    </div>
  );
}
