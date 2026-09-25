# SVI Infra Solutions: Geo-Targeted Dynamic Personalization Plan

## 1. Executive Summary & Objective

The objective of Geo-Targeted Dynamic Personalization is to eliminate bounce rates and maximize high-intent buyer inquiries by dynamically tailoring the website experience based on the visitor's geographic location.

Instead of showing generic headlines to every visitor, the platform adapts messaging to match buyer intent across three key zones:

1. **Jaipur Local Buyers**: Prioritize convenience, local trust, and doorstep free cab site visits.
2. **Delhi-NCR / Haryana / UP Investors**: Prioritize expressway connectivity, pilgrimage demand on Khatu Shyam Highway, and 2-year ROI potential.
3. **Rest of India & NRI Investors (Mumbai, UAE, USA)**: Prioritize legal security, 100% verified registry, digital drone walkthroughs, and remote RBI-compliant allotment.

---

## 2. High-Level Architecture Flow

```
                              [Visitor Lands on Website]
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
       [Server Headers (Vercel)]                     [Client-Side Lightweight Fallback]
  x-vercel-ip-city / x-vercel-ip-country         localStorage Geo Cache (TTL: 30 minutes)
                  │                              Fallback: /api/geo or IP Lookup
                  └───────────────────────┬───────────────────────┘
                                          ▼
                             [useGeoPersonalization Hook]
                                          │
          ┌───────────────────────────────┼───────────────────────────────┐
          ▼                               ▼                               ▼
 [ZONE 1: JAIPUR LOCAL]          [ZONE 2: DELHI-NCR]             [ZONE 3: OUTSTATION / NRI]
 - Free Cab Site Visit           - Delhi-Jaipur Expressway       - NRI Investment Desk
 - Doorstep Pickup               - Weekend Home & Khatu Highway  - Remote Registry & Video Tours
 - Local Landmark Reference      - 45% 2-Year Appreciation       - RBI / FEMA Compliance
```

---

## 3. Dynamic Personalization Matrix

| Feature / Touchpoint        | Zone 1: Jaipur & Nearby (Sikar, Ajmer, Chomu)                                           | Zone 2: Delhi-NCR (Delhi, Noida, Gurgaon, Faridabad)                                             | Zone 3: Outstation & NRI (Mumbai, Bangalore, UAE, US)                                                     |
| :-------------------------- | :-------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------- |
| **Hero Top Badge**          | 🚖 _Doorstep Free AC Cab Visit in Jaipur_                                               | 🛣️ _3.5 Hrs via Delhi-Jaipur Expressway_                                                         | 🛡️ _100% Verified Digital Registry & NRI Desk_                                                            |
| **Hero Headline**           | **जयपुर में अपने सपनों का प्लॉट — घर से फ्री कैब साइट विजिट पाएं**                      | **High-Appreciation Plots on Khatu Shyam Ji Highway**                                            | **Institutional Grade Plotted Land Investments in Jaipur**                                                |
| **Hero Subtitle**           | Vaishali Nagar, Mansarovar, Jagatpura या Airport से सीधे साइट तक फ्री पिकअप और ड्रॉप।   | Direct expressway access, booming pilgrimage footfall, and high rental yield in Harsholi-Renwal. | Remote allotment, transparent legal deeds, and live virtual site walkthroughs for non-resident investors. |
| **Primary Action (CTA)**    | `[ Book Free Cab Site Visit ]`                                                          | `[ Download Highway ROI & Map ]`                                                                 | `[ Schedule Virtual Video Tour ]`                                                                         |
| **Secondary Action**        | `[ Instant WhatsApp Callback ]`                                                         | `[ View Masterplan & Pricing ]`                                                                  | `[ WhatsApp NRI Investment Advisor ]`                                                                     |
| **Contextual Banner**       | _"👋 Visiting from Jaipur? Same-day free cab site visits are available today!"_         | _"👋 Visiting from Delhi-NCR? Shivani Vatika is just 3.5 hrs away via Expressway."_              | _"👋 Investing from outside Rajasthan? Access verified legal documents online."_                          |
| **Prefilled WhatsApp Lead** | _"Hi SVI Team, I am in Jaipur and would like to book a free cab site visit for plots."_ | _"Hi SVI Team, I am from Delhi-NCR interested in plots on Khatu Shyam Highway."_                 | _"Hi SVI Team, I am an NRI/outstation investor looking for verified plots in Jaipur."_                    |

---

## 4. Technical Implementation Specifications

### 4.1. Core Utilities & Hooks

- **File**: `src/lib/geo/geoDetector.ts`
  - Defines geo-zones: `'JAIPUR_LOCAL' | 'DELHI_NCR' | 'OUTSTATION_NRI' | 'DEFAULT'`.
  - Maps incoming city/country codes into canonical zones.
  - Implements 30-minute client cache in `localStorage` to eliminate redundant network overhead.
- **File**: `src/hooks/useGeoPersonalization.ts`
  - React hook exposing `{ zone, city, country, isPersonalized, content }`.
  - Zero Cumulative Layout Shift (CLS): Emits default luxury branding instantly, then seamlessly transitions dynamic content once resolved.

### 4.2. UI Enhancements

- **File**: `src/components/home/hero/HeroContent.tsx`
  - Consumes `useGeoPersonalization` to adapt headline, badge, and CTA buttons dynamically.
- **File**: `src/components/common/GeoPersonalizedBanner.tsx`
  - Subtle floating glassmorphic banner showing city-specific assistance.
- **File**: `src/components/common/SiteVisitPill.tsx`
  - Automatically prefills pickup suggestions based on detected zone (e.g. _"Doorstep in Vaishali Nagar / Mansarovar"_ for Jaipur visitors).

---

## 5. Non-Negotiable Engineering Constraints

1. **Zero CLS (Cumulative Layout Shift)**: Personalization must never cause elements to jump or flicker. Initial SSR markup must always be fully formed and visually stable.
2. **Strict Privacy**: No intrusive browser GPS popups (`navigator.geolocation.getCurrentPosition`). Only non-intrusive IP-based lookup.
3. **Bilingual Compatibility**: Dynamic content must seamlessly support both English (`/`) and Hindi (`/hi`) locales.
4. **TypeScript Compliance**: Strict typings; zero use of `any`.
