import { describe, it, expect } from 'vitest';
import { getSviEmail } from '@/src/components/admin/employees/EmployeeCard';
import { buildEmployeeHandoverMessage } from '@/src/components/admin/employees/ResetPasswordModal';

describe('Employee Portal Handover Message Template', () => {
  it('generates the correct employee portal URL and SVI corporate email for Shivam Yadav', () => {
    const emp = {
      email: 'Shivam.sviinfrasolutions@gmail.com',
      full_name: 'Shivam yadav',
      real_email: 'shivam.sviinfrasolutions@gmail.com',
    };
    const sviEmail = getSviEmail(emp);
    expect(sviEmail).toBe('shivam@sviinfra.com');

    const msg = buildEmployeeHandoverMessage({
      fullName: emp.full_name,
      email: sviEmail,
      password: '!r4LD6i*Rr',
      origin: 'https://www.sviinfrasolutions.com',
    });

    expect(msg).toContain('🔐 *SVI Portal Login Credentials*');
    expect(msg).toContain('Hello Shivam yadav,');
    expect(msg).toContain('🌐 *Portal URL:* https://www.sviinfrasolutions.com/employee/login');
    expect(msg).toContain('📧 *Email ID:* shivam@sviinfra.com');
    expect(msg).toContain('🔑 *Temporary Password:* !r4LD6i*Rr');
    expect(msg).toContain(
      '⚠️ *Note:* Please log in and change your password immediately from your profile settings.'
    );
  });

  it('defaults to production domain with /employee/login if origin is missing or localhost', () => {
    const msgWithoutOrigin = buildEmployeeHandoverMessage({
      fullName: 'Muskan Varshney',
      email: 'muskan@sviinfra.com',
      password: 'SecurePassword123!',
    });
    expect(msgWithoutOrigin).toContain(
      '🌐 *Portal URL:* https://www.sviinfrasolutions.com/employee/login'
    );
    expect(msgWithoutOrigin).toContain('📧 *Email ID:* muskan@sviinfra.com');

    const msgWithLocalhost = buildEmployeeHandoverMessage({
      fullName: 'Muskan Varshney',
      email: 'muskan@sviinfra.com',
      password: 'SecurePassword123!',
      origin: 'http://localhost:3000',
    });
    expect(msgWithLocalhost).toContain(
      '🌐 *Portal URL:* https://www.sviinfrasolutions.com/employee/login'
    );
  });

  it('preserves custom production origin domains with /employee/login', () => {
    const msg = buildEmployeeHandoverMessage({
      fullName: 'Khushi',
      email: 'khushi.sviinfrasoutions@svi.com',
      password: 'StrongPassword99$',
      origin: 'https://sviinfrasolutions.com',
    });
    expect(msg).toContain('🌐 *Portal URL:* https://sviinfrasolutions.com/employee/login');
    expect(msg).toContain('📧 *Email ID:* khushi.sviinfrasoutions@svi.com');
  });
});
