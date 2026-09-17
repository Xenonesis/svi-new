import { describe, it, expect } from 'vitest';
import { PROJECTS_DB } from '@/src/data/projects';

describe('PROJECTS_DB Data Integrity', () => {
  describe('Shivani Vatika 11th', () => {
    const project = PROJECTS_DB['shivani-vatika-11th'];

    it('should have required amenities: Society Boundary, Main Gate, CCTV Camera, 24/7 Security', () => {
      expect(project.amenities).toContain('Society Boundary');
      expect(project.amenities).toContain('Main Gate');
      expect(project.amenities).toContain('CCTV Camera');
      expect(project.amenities).toContain('24/7 Security');
    });

    it('should have localized Hindi amenities for all security and infrastructure items', () => {
      expect(project.amenitiesHi).toContain('सोसाइटी बाउंड्री');
      expect(project.amenitiesHi).toContain('मेन गेट');
      expect(project.amenitiesHi).toContain('सीसीटीवी कैमरा');
      expect(project.amenitiesHi).toContain('24/7 सुरक्षा');
    });

    it('should maintain 80-250 Sqyrds starting size', () => {
      expect(project.startingSize).toBe('80-250 Sqyrds');
      expect(project.startingSizeHi).toBe('80-250 वर्ग गज');
    });

    it('should feature key security highlights in project descriptions', () => {
      expect(project.description).toContain('society boundary');
      expect(project.description).toContain('main gate');
      expect(project.description).toContain('CCTV cameras');
      expect(project.description).toContain('24/7 security');

      expect(project.descriptionHi).toContain('सोसाइटी बाउंड्री');
      expect(project.descriptionHi).toContain('मेन गेट');
      expect(project.descriptionHi).toContain('सीसीटीवी कैमरा');
      expect(project.descriptionHi).toContain('24/7 सुरक्षा');
    });

    it('should have location and headerSubtitle pointing to Jaipur to Khatu Shyam Ji Highway - Harsholi', () => {
      expect(project.location).toBe('Jaipur to Khatu Shyam Ji Highway - Harsholi');
      expect(project.locationHi).toBe('जयपुर से खाटू श्याम जी हाईवे - हरसोली');
      expect(project.headerSubtitle).toBe('Jaipur to Khatu Shyam Ji Highway - Harsholi');
      expect(project.headerSubtitleHi).toBe('जयपुर से खाटू श्याम जी हाईवे - हरसोली');
    });

    it('should include verified nearbyPlaces with accurate distances and times', () => {
      expect(project.nearbyPlaces).toBeDefined();
      expect(project.nearbyPlaces?.length).toBeGreaterThanOrEqual(4);

      const riico = project.nearbyPlaces?.find((p) => p.name === 'RIICO Industrial Area');
      expect(riico).toBeDefined();
      expect(riico?.distance).toBe('1 km away');

      const renwalStation = project.nearbyPlaces?.find(
        (p) => p.name === 'Renwal Railway Station (RNW)'
      );
      expect(renwalStation).toBeDefined();
      expect(renwalStation?.distance).toBe('7 km');
      expect(renwalStation?.time).toBe('5 mins drive');

      const warehouses = project.nearbyPlaces?.find((p) => p.name === 'Ambani & Adani Warehouses');
      expect(warehouses).toBeDefined();
      expect(warehouses?.distance).toBe('Next to 7 kms');

      const khatu = project.nearbyPlaces?.find((p) => p.name === 'Shree Khatu Shyam Ji Mandir');
      expect(khatu).toBeDefined();
      expect(khatu?.distance).toBeUndefined(); // no km displayed per user requirement
      expect(khatu?.time).toBe('20–25 mins');
    });
  });

  describe('Shivani Vatika', () => {
    const project = PROJECTS_DB['shivani-vatika'];

    it('should use authentic imagery from /Shivani Vatika/ directory', () => {
      expect(project.heroImage).toBe('/Shivani Vatika/shivani vatika6 frontgate.webp');
      expect(project.gallery).toContain('/Shivani Vatika/shivani vatika6 frontgate.webp');
      expect(project.gallery).toContain('/Shivani Vatika/shivani vatika.webp');
      expect(project.gallery).toContain('/Shivani Vatika/shivani vatik both.webp');
    });

    it('should have exact Google Maps pin and valid embed URL', () => {
      expect(project.mapUrl).toBe(
        "https://www.google.com/maps/place/26%C2%B055'17.8%22N+76%C2%B000'28.0%22E/@26.9215965,76.0052071,845m/data=!3m2!1e3!4b1!4m4!3m3!8m2!3d26.9215965!4d76.007782?hl=en&entry=ttu&g_ep=EgoyMDI2MDkxNC4wIKXMDSoASAFQAw%3D%3D"
      );
      expect(project.mapEmbedUrl).toContain('26.9215965');
      expect(project.mapEmbedUrl).toContain('76.0052071');
    });

    it('should have Nayla, Jaipur location and verified community description', () => {
      expect(project.location).toBe('Nayla, Jaipur');
      expect(project.locationHi).toBe('नायला, जयपुर');
      expect(project.description).toContain('Located in the serene landscapes of Nayla');
      expect(project.description).toContain('redefining modern community living');
      expect(project.descriptionHi).toContain('नायला के शांत और मनोरम परिवेश में स्थित');
    });
  });
  describe('Shyam Aangan', () => {
    const project = PROJECTS_DB['shyam-aangan'];

    it('should have exact Google Maps pin and valid embed URL', () => {
      expect(project.mapUrl).toBe(
        'https://www.google.com/maps?q=26.92159652709961,76.00778198242188&z=17&hl=en'
      );
      expect(project.mapEmbedUrl).toContain('26.9215965');
      expect(project.mapEmbedUrl).toContain('76.0052071');
    });

    it('should have 178 total plots, 50-750 Sq. Yds. size range and 40 bigha in description', () => {
      expect(project.totalPlots).toBe('178');
      expect(project.startingSize).toBe('50-750 Sq. Yds.');
      expect(project.startingSizeHi).toBe('50-750 वर्ग गज');
      expect(project.description).toContain('overall 40 bigha');
      expect(project.description).toContain('178');
      expect(project.description).toContain('50 sq. yds. to 750 sq. yds.');
      expect(project.descriptionHi).toContain('40 बीघा');
    });
    it('should include 40 ft road, drainage system, school, cctv camera, water supply, street light amenities', () => {
      const required = [
        '40 Ft. Road',
        'Drainage System',
        'School',
        'CCTV Camera',
        'Water Supply',
        'Street Light',
      ];
      for (const item of required) {
        expect(project.amenities).toContain(item);
      }
      const requiredHi = [
        '40 फीट रोड',
        'ड्रेनेज सिस्टम',
        'स्कूल',
        'सीसीटीवी कैमरा',
        'पानी की आपूर्ति',
        'स्ट्रीट लाइट',
      ];
      for (const item of requiredHi) {
        expect(project.amenitiesHi).toContain(item);
      }
    });
  });
});
