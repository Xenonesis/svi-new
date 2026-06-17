'use client';

import React, { useCallback, useState, type ChangeEvent, useEffect, useRef } from 'react';
// import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { MapPin, PhoneIcon, Mail, Clock, AlertCircle, Layers } from 'lucide-react';
import { SITE_URL } from '@/src/lib/seo';
import dynamic from 'next/dynamic';
import maplibregl, { NavigationControl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { fetchNearbyPlaces, getCategoryInfo, type NearbyPlace } from '@/src/lib/nearby-places';

const ContactFAQ = dynamic(() => import('@/src/components/faq/ContactFAQ'), { ssr: false });

const DIGIT_REGEX = /\d/g;

const OFFICE_LOCATION = { lat: 28.6112, lng: 77.382 };

export default function Contact() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [showNearby, setShowNearby] = useState(false);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Initialize MapLibre map with OpenFreeMap style (shows POIs naturally)
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          },
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
          },
        ],
      },
      center: [OFFICE_LOCATION.lng, OFFICE_LOCATION.lat],
      zoom: 14,
    });

    map.addControl(new NavigationControl(), 'top-right');

    // Office marker
    new maplibregl.Marker({ color: '#d4af37', scale: 1.3 })
      .setLngLat([OFFICE_LOCATION.lng, OFFICE_LOCATION.lat])
      .addTo(map);

    map.on('load', () => setMapLoaded(true));
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Fetch nearby places when toggled
  useEffect(() => {
    if (!mapLoaded || !showNearby) {
      // Clear markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      return;
    }

    setLoadingPlaces(true);
    const controller = new AbortController();

    fetchNearbyPlaces(OFFICE_LOCATION.lat, OFFICE_LOCATION.lng, 1000, controller.signal)
      .then((places) => {
        setNearbyPlaces(places);
        // Create markers
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        if (!mapRef.current) return;

        places.forEach((place) => {
          const cat = getCategoryInfo(place.category);
          const el = document.createElement('div');
          el.style.cssText = `
            width: 10px; height: 10px;
            background: ${cat.color};
            border: 2px solid white;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          `;
          el.title = place.name;

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([place.lng, place.lat])
            .addTo(mapRef.current!);

          const popup = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 12,
            maxWidth: '220px',
          }).setDOMContent(
            (() => {
              const w = document.createElement('div');
              w.className = 'p-1.5 font-sans';
              w.innerHTML = `
                <div class="flex items-center gap-1 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                  <span style="display:inline-flex;color:${cat.color}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/></svg>
                  </span>
                  ${cat.label}
                </div>
                <div class="font-semibold text-sm text-gray-900 mt-0.5">${place.name}</div>
                ${
                  place.distance
                    ? `<div class="text-[11px] text-gray-500 flex items-center gap-1 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/></svg>
                  ${place.distance}m
                </div>`
                    : ''
                }
              `;
              return w;
            })()
          );

          el.addEventListener('mouseenter', () => {
            el.style.transform = 'scale(1.5)';
            marker.setPopup(popup);
            popup.addTo(mapRef.current!);
          });
          el.addEventListener('mouseleave', () => {
            el.style.transform = 'scale(1)';
            popup.remove();
          });

          markersRef.current.push(marker);
        });
      })
      .catch((err) => {
        if (err.name !== 'AbortError') console.error('Failed to fetch nearby places:', err);
      })
      .finally(() => setLoadingPlaces(false));

    return () => controller.abort();
  }, [mapLoaded, showNearby]);

  // LocalBusiness structured data
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
      {
        '@type': 'City',
        name: 'Jaipur',
      },
      {
        '@type': 'City',
        name: 'Noida',
      },
      {
        '@type': 'City',
        name: 'Phulera',
      },
    ],
    priceRange: '$$$',
  };

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';
    else if (!/^[a-zA-Z\s]+$/.test(formData.name))
      newErrors.name = 'Name can only contain letters and spaces';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!emailRegex.test(formData.email))
      newErrors.email = 'Please enter a valid email address';

    const phoneRegex = /^\+?[\d\s-]{10,15}$/;
    const digitCount = (formData.phone.match(DIGIT_REGEX) || []).length;
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    else if (!phoneRegex.test(formData.phone) || digitCount < 10 || digitCount > 15) {
      newErrors.phone = 'Please enter a valid phone number (10-15 digits)';
    }

    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    else if (formData.subject.length < 3)
      newErrors.subject = 'Subject must be at least 3 characters';

    if (!formData.message.trim()) newErrors.message = 'Message is required';
    else if (formData.message.length < 10)
      newErrors.message = 'Message must be at least 10 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const [submitError, setSubmitError] = useState('');
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!validateForm()) return;

      setIsSubmitting(true);
      setSubmitError('');
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Submission failed');
        router.push('/thank-you');
      } catch {
        setSubmitError('Failed to submit. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateForm, formData, router]
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: '' }));
      }
    },
    [errors]
  );

  return (
    <div className="bg-brand-bg relative pt-20 pb-16 dark:bg-gray-900">
      {/* LocalBusiness Structured Data */}
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
              <div className="border border-gray-200 bg-white p-6 shadow-sm md:p-10 dark:border-gray-700 dark:bg-gray-800">
                <h4 className="mb-4 text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase dark:text-gray-500">
                  Inquiries
                </h4>
                <h3 className="text-brand-navy mb-8 font-serif text-3xl dark:text-gray-100">
                  Send a Message
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-2 block text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase dark:text-gray-400"
                      >
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        aria-invalid={errors.name ? 'true' : 'false'}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                        className={`w-full border bg-gray-50/50 px-4 py-3 text-sm transition-colors outline-none focus:ring-0 dark:bg-gray-900 dark:text-white ${errors.name ? 'border-red-500 focus:border-red-500' : 'focus:border-brand-gold dark:focus:border-brand-gold border-gray-200 dark:border-gray-700'}`}
                      />
                      {errors.name && (
                        <p
                          id="name-error"
                          className="mt-1 flex items-center gap-1 text-xs text-red-500"
                          role="alert"
                        >
                          <AlertCircle size={12} /> {errors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase dark:text-gray-400"
                      >
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        aria-invalid={errors.email ? 'true' : 'false'}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        className={`w-full border bg-gray-50/50 px-4 py-3 text-sm transition-colors outline-none focus:ring-0 dark:bg-gray-900 dark:text-white ${errors.email ? 'border-red-500 focus:border-red-500' : 'focus:border-brand-gold dark:focus:border-brand-gold border-gray-200 dark:border-gray-700'}`}
                      />
                      {errors.email && (
                        <p
                          id="email-error"
                          className="mt-1 flex items-center gap-1 text-xs text-red-500"
                          role="alert"
                        >
                          <AlertCircle size={12} /> {errors.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-2 block text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase dark:text-gray-400"
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        aria-invalid={errors.phone ? 'true' : 'false'}
                        aria-describedby={errors.phone ? 'phone-error' : undefined}
                        className={`w-full border bg-gray-50/50 px-4 py-3 text-sm transition-colors outline-none focus:ring-0 dark:bg-gray-900 dark:text-white ${errors.phone ? 'border-red-500 focus:border-red-500' : 'focus:border-brand-gold dark:focus:border-brand-gold border-gray-200 dark:border-gray-700'}`}
                        placeholder="+91"
                      />
                      {errors.phone && (
                        <p
                          id="phone-error"
                          className="mt-1 flex items-center gap-1 text-xs text-red-500"
                          role="alert"
                        >
                          <AlertCircle size={12} /> {errors.phone}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="subject"
                        className="mb-2 block text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase dark:text-gray-400"
                      >
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        maxLength={100}
                        aria-invalid={errors.subject ? 'true' : 'false'}
                        aria-describedby={errors.subject ? 'subject-error' : 'subject-count'}
                        className={`w-full border bg-gray-50/50 px-4 py-3 text-sm transition-colors outline-none focus:ring-0 dark:bg-gray-900 dark:text-white ${errors.subject ? 'border-red-500 focus:border-red-500' : 'focus:border-brand-gold dark:focus:border-brand-gold border-gray-200 dark:border-gray-700'}`}
                      />
                      <div className="mt-1 flex items-center justify-between">
                        {errors.subject ? (
                          <p
                            id="subject-error"
                            className="flex items-center gap-1 text-xs text-red-500"
                            role="alert"
                          >
                            <AlertCircle size={12} /> {errors.subject}
                          </p>
                        ) : (
                          <span></span>
                        )}
                        <span id="subject-count" className="text-[10px] text-gray-400">
                          {formData.subject.length}/100
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="mb-2 block text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase dark:text-gray-400"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      maxLength={1000}
                      aria-invalid={errors.message ? 'true' : 'false'}
                      aria-describedby={errors.message ? 'message-error' : 'message-count'}
                      className={`w-full resize-none border bg-gray-50/50 px-4 py-3 text-sm transition-colors outline-none focus:ring-0 dark:bg-gray-900 dark:text-white ${errors.message ? 'border-red-500 focus:border-red-500' : 'focus:border-brand-gold dark:focus:border-brand-gold border-gray-200 dark:border-gray-700'}`}
                    ></textarea>
                    <div className="mt-1 flex items-center justify-between">
                      {errors.message ? (
                        <p
                          id="message-error"
                          className="flex items-center gap-1 text-xs text-red-500"
                          role="alert"
                        >
                          <AlertCircle size={12} /> {errors.message}
                        </p>
                      ) : (
                        <span></span>
                      )}
                      <span id="message-count" className="text-[10px] text-gray-400">
                        {formData.message.length}/1000
                      </span>
                    </div>
                  </div>
                  {submitError && (
                    <p className="flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle size={12} /> {submitError}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-brand-navy hover:bg-brand-gold text-brand-gold hover:text-brand-navy border-brand-navy flex w-full items-center justify-center gap-2 border py-4 text-xs font-bold tracking-widest uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <div className="h-4 w-4 animate-spin border-2 border-current border-t-transparent"></div>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </form>
              </div>

              <div className="relative h-[280px] overflow-hidden rounded border border-gray-200 bg-white shadow-sm md:h-[400px] dark:border-gray-700 dark:bg-gray-800">
                <div ref={mapContainerRef} className="h-full w-full" />

                {/* Nearby Places Toggle */}
                <button
                  onClick={() => setShowNearby((v) => !v)}
                  className={`absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow backdrop-blur transition-colors ${
                    showNearby
                      ? 'bg-brand-navy text-brand-gold'
                      : 'bg-white/90 text-gray-600 hover:bg-white dark:bg-gray-900/90 dark:text-gray-300'
                  }`}
                >
                  <Layers size={14} />
                  {showNearby ? 'Hide Nearby' : 'Nearby Places'}
                </button>

                {/* Loading indicator */}
                {loadingPlaces && (
                  <div className="absolute top-12 right-3 z-10 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[10px] text-gray-500 shadow backdrop-blur dark:bg-gray-900/90 dark:text-gray-400">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                    Loading...
                  </div>
                )}

                {/* Count badge */}
                {showNearby && !loadingPlaces && nearbyPlaces.length > 0 && (
                  <div className="absolute bottom-3 left-3 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[10px] text-gray-500 shadow backdrop-blur dark:bg-gray-900/90 dark:text-gray-400">
                    {nearbyPlaces.length} places nearby
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <ContactFAQ />
    </div>
  );
}
