import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { RealEstateListingSchema } from '@/src/components/common/Schema';
import { CORRIDOR_COMMON_AMENITIES } from '@/src/data/corridorAmenities';

describe('RealEstateListingSchema with amenityFeature', () => {
  it('renders LocationFeatureSpecification inside Product itemOffered', () => {
    const { container } = render(
      <RealEstateListingSchema
        name="Test Corridor Society"
        description="Gated plotted society"
        image="/test-image.jpg"
        location="Renwal, Jaipur"
        price="1500000"
        amenities={CORRIDOR_COMMON_AMENITIES}
      />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const data = JSON.parse(script?.innerHTML || '{}');

    expect(data['@type']).toBe('RealEstateListing');
    expect(data.itemOffered['@type']).toBe('Product');
    expect(Array.isArray(data.itemOffered.amenityFeature)).toBe(true);
    expect(data.itemOffered.amenityFeature.length).toBe(CORRIDOR_COMMON_AMENITIES.length);

    const roadAmenity = data.itemOffered.amenityFeature.find(
      (a: { name: string }) => a.name === '30 ft Wide Blacktop Roads'
    );
    expect(roadAmenity).toBeDefined();
    expect(roadAmenity.value).toBe('30 ft');
  });
});
