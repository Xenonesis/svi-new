import { describe, it, expect } from 'vitest';
import { getSviEmail } from '@/src/components/admin/employees/EmployeeCard';

describe('Employee SVI Corporate Email Display', () => {
  it('should preserve already configured @sviinfra.com email addresses', () => {
    const emp = {
      email: 'Muskan@sviinfra.com',
      full_name: 'Muskan Varshney',
      real_email: 'mv03012000@gmail.com',
    };
    expect(getSviEmail(emp)).toBe('muskan@sviinfra.com');
  });

  it('should preserve @svi.com and @sviinfrasolutions.com domain addresses', () => {
    const emp = {
      email: 'khushi.sviinfrasoutions@svi.com',
      full_name: 'KHUSHI',
      real_email: 'khushi.sviinfrasoultions@gmail.com',
    };
    expect(getSviEmail(emp)).toBe('khushi.sviinfrasoutions@svi.com');
  });

  it('should derive corporate @sviinfra.com address from personal gmail with employee prefix', () => {
    const emp = {
      email: 'Shivam.sviinfrasolutions@gmail.com',
      full_name: 'Shivam yadav',
      real_email: 'shivam.sviinfrasolutions@gmail.com',
    };
    expect(getSviEmail(emp)).toBe('shivam@sviinfra.com');
  });

  it('should derive clean @sviinfra.com address from generic personal email using full name fallback', () => {
    const emp = {
      email: 'john.personal@gmail.com',
      full_name: 'John Doe',
    };
    expect(getSviEmail(emp)).toBe('john.personal@sviinfra.com');
  });
});
