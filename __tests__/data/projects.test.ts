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
  });
});
