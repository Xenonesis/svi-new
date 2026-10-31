import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SHIVANI_VATIKA_13_PLOTS } from '@/src/data/shivaniVatika13Plots';
import { PROJECTS_DB } from '@/src/data/projects';
import { SV13HeroSection } from '@/src/components/projects/shivani-vatika-13th/SV13HeroSection';
import { SV13MasterPlanSection } from '@/src/components/projects/shivani-vatika-13th/SV13MasterPlanSection';
import { SV13AmenitiesSection } from '@/src/components/projects/shivani-vatika-13th/SV13AmenitiesSection';
import { SV13PaymentPlanSection } from '@/src/components/projects/shivani-vatika-13th/SV13PaymentPlanSection';
import { SV13WhyChooseSection } from '@/src/components/projects/shivani-vatika-13th/SV13WhyChooseSection';
import { SV13ContactSection } from '@/src/components/projects/shivani-vatika-13th/SV13ContactSection';

describe('Shivani Vatika 13th Data & Components', () => {
  it('has exactly 60 demarcated plots with valid data in SHIVANI_VATIKA_13_PLOTS', () => {
    expect(SHIVANI_VATIKA_13_PLOTS).toHaveLength(60);
    expect(SHIVANI_VATIKA_13_PLOTS[0].plotNo).toBe('1');
    expect(SHIVANI_VATIKA_13_PLOTS[59].plotNo).toBe('60');

    SHIVANI_VATIKA_13_PLOTS.forEach((plot) => {
      expect(plot.roadWidth).toBe('30 Ft Internal Road');
      expect(plot.pricePerMonth).toBe(9999);
      expect(plot.sizeSqYd).toBeGreaterThanOrEqual(80);
      expect(['AVAILABLE', 'BOOKED', 'RESERVED']).toContain(plot.status);
    });
  });

  it('registers shivani-vatika-13th in PROJECTS_DB with full metadata', () => {
    const project = PROJECTS_DB['shivani-vatika-13th'];
    expect(project).toBeDefined();
    expect(project.title).toBe('Shivani Vatika 13th');
    expect(project.totalPlots).toBe('60');
    expect(project.amenities).toHaveLength(8);
    expect(project.nearbyPlaces).toBeDefined();
    expect(project.nearbyPlaces!.length).toBeGreaterThanOrEqual(4);
  });

  it('renders SV13HeroSection with title, tagline, and badges', () => {
    render(<SV13HeroSection onBookSiteVisit={vi.fn()} onDownloadBrochure={vi.fn()} />);

    expect(screen.getByText(/SHIVANI VATIKA/i)).toBeDefined();
    expect(screen.getByText(/Your Next Chapter Starts Here/i)).toBeDefined();
    expect(screen.getByText(/60 Residential Plots/i)).toBeDefined();
    expect(screen.getByText(/Sambhar–Phulera, Rajasthan/i)).toBeDefined();
  });

  it('renders SV13MasterPlanSection with 60 plots layout and legend', () => {
    render(<SV13MasterPlanSection />);

    expect(screen.getByText(/Interactive Township Master Plan/i)).toBeDefined();
    expect(screen.getByText(/30 FT MAIN ENTRANCE/i)).toBeDefined();
    expect(screen.getByText(/LANDSCAPED COMMUNITY GREEN PARK/i)).toBeDefined();
    expect(screen.getByText(/COMMUNITY TEMPLE COMPLEX/i)).toBeDefined();
  });

  it('renders SV13AmenitiesSection with 8 amenities', () => {
    render(<SV13AmenitiesSection />);

    expect(screen.getByText(/Landscaped Park/i)).toBeDefined();
    expect(screen.getByText(/Beautiful Temple/i)).toBeDefined();
    expect(screen.getByText(/30 Ft Internal Roads/i)).toBeDefined();
    expect(screen.getByText(/Planned Residential Plots/i)).toBeDefined();
    expect(screen.getByText(/Peaceful Environment/i)).toBeDefined();
    expect(screen.getByText(/Family-Friendly Planning/i)).toBeDefined();
    expect(screen.getByText(/Regional Connectivity/i)).toBeDefined();
    expect(screen.getByText(/Future Growth Potential/i)).toBeDefined();
  });

  it('renders SV13PaymentPlanSection with ₹9,999 pricing and 40 months timeline', () => {
    render(<SV13PaymentPlanSection onEnquirePlan={vi.fn()} />);

    expect(screen.getAllByText(/₹9,999/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/FOR 40 MONTHS/i)).toBeDefined();
    expect(screen.getAllByText(/Months 1–10/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Months 11–20/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Months 21–30/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Months 31–40/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders SV13WhyChooseSection with 5 benefits', () => {
    render(<SV13WhyChooseSection />);

    expect(screen.getByText(/Thoughtful Planning/i)).toBeDefined();
    expect(screen.getByText(/Peaceful Environment/i)).toBeDefined();
    expect(screen.getByText(/Growing Location/i)).toBeDefined();
    expect(screen.getByText(/Family-Friendly Development/i)).toBeDefined();
    expect(screen.getByText(/Long-Term Value Potential/i)).toBeDefined();
  });

  it('renders SV13ContactSection with official corporate details', () => {
    render(<SV13ContactSection />);

    expect(screen.getByText(/SVI INFRA SOLUTIONS PVT. LTD./i)).toBeDefined();
    expect(screen.getAllByText(/\+91 73000 07643/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/info@sviinfrasolutions.com/i)).toBeDefined();
    expect(screen.getByText(/Sector 63, Noida, Uttar Pradesh 201309/i)).toBeDefined();
  });
});
