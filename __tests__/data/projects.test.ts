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
  });
});
