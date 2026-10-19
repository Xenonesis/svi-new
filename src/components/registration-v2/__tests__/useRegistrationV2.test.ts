import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRegistrationV2, UPPERCASE_FIELDS, DRAFT_STORAGE_KEY } from '../useRegistrationV2';
import { INITIAL_FORM_DATA, FormData } from '../types';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
}));

vi.mock('@/src/lib/image-compression', () => ({
  compressImage: vi.fn(async (file: File) => {
    return new File([file], file.name, { type: file.type });
  }),
}));

const mockT = (key: string) => key;

const VALID_STEP1_DATA: Partial<FormData> = {
  firstName: 'RAMESH',
  lastName: 'KUMAR',
  mobileNo: '9876543210',
  email: 'RAMESH@EXAMPLE.COM',
  soWoDo: 'S/O SURESH KUMAR',
  dob: '1990-05-15',
};

const VALID_STEP2_DATA: Partial<FormData> = {
  aadharNumber: '2345 6789 0123',
  panNumber: 'ABCDE1234F',
  pincode: '201301',
  state: 'UTTAR PRADESH',
  city: 'NOIDA',
  address: 'SECTOR 62, NOIDA',
};

const VALID_STEP3_DATA: Partial<FormData> = {
  project: 'shyam-aangan',
  propertySize: '100-200',
  propertyType: 'residential-plot',
  plotPreference: 'park',
  paymentPlan: 'one-time',
  paymentMode: 'online',
  schemeAmount: '21000',
};

describe('useRegistrationV2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/registration/advisors') || url === '/api/registration') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ advisors: ['Advisor A', 'Advisor B'] }),
        });
      }
      if (url.includes('/api/registration/projects') || url === '/api/properties') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              projects: [{ value: 'proj-1', label: 'Project 1' }],
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('initializes with default wizard and form values', () => {
      const { result } = renderHook(() => useRegistrationV2(mockT));

      expect(result.current.currentStep).toBe(1);
      expect(result.current.formData).toEqual(INITIAL_FORM_DATA);
      expect(result.current.errors).toEqual({});
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.submitError).toBe('');
      expect(result.current.photoFile).toBeNull();
      expect(result.current.panCardFile).toBeNull();
      expect(result.current.captchaAnswer).toBe('');
      expect(result.current.captchaError).toBe('');
      expect(result.current.compressing).toBeNull();
      expect(result.current.isPaymentModalOpen).toBe(false);
      expect(result.current.draftRestored).toBe(false);
      expect(result.current.attemptedSteps).toEqual({
        1: false,
        2: false,
        3: false,
        4: false,
      });
    });

    it('loads advisors and projects from API with fallback', async () => {
      const { result } = renderHook(() => useRegistrationV2(mockT));

      await waitFor(() => {
        expect(result.current.advisors).toEqual(['Advisor A', 'Advisor B']);
        expect(result.current.projects).toEqual([{ value: 'proj-1', label: 'Project 1' }]);
      });
    });
  });

  describe('Step 1 Validation (Applicant Details)', () => {
    it('fails when required fields are empty', () => {
      const { result } = renderHook(() => useRegistrationV2(mockT));

      let isValid = false;
      act(() => {
        isValid = result.current.validateStep1();
      });

      expect(isValid).toBe(false);
      expect(result.current.errors.firstName).toBe('validation.firstNameRequired');
      expect(result.current.errors.mobileNo).toBe('validation.mobileRequired');
      expect(result.current.errors.email).toBe('validation.emailRequired');
      expect(result.current.errors.soWoDo).toBe('validation.soWoDoRequired');
      expect(result.current.errors.dob).toBe('validation.dobRequired');
    });

    it('validates firstName format and min length', () => {
      const { result } = renderHook(() => useRegistrationV2(mockT));

      act(() => {
        result.current.setFormData((prev) => ({ ...prev, firstName: 'A' }));
      });
      act(() => {
        result.current.validateStep1();
      });
      expect(result.current.errors.firstName).toBe('validation.firstNameMin');

      act(() => {
        result.current.setFormData((prev) => ({ ...prev, firstName: 'John123' }));
      });
      act(() => {
        result.current.validateStep1();
      });
      expect(result.current.errors.firstName).toBe('validation.firstNameFormat');
    });

    it('validates 10-digit Indian mobile number', () => {
      const { result } = renderHook(() => useRegistrationV2(mockT));

      act(() => {
        result.current.setFormData((prev) => ({ ...prev, mobileNo: '1234567890' }));
      });
      act(() => {
        result.current.validateStep1();
      });
      expect(result.current.errors.mobileNo).toBe('validation.mobileFormat');

      act(() => {
        result.current.setFormData((prev) => ({ ...prev, mobileNo: '98765' }));
      });
      act(() => {
        result.current.validateStep1();
      });
      expect(result.current.errors.mobileNo).toBe('validation.mobileFormat');
    });

    it('validates email format', () => {
      const { result } = renderHook(() => useRegistrationV2(mockT));

      act(() => {
        result.current.setFormData((prev) => ({ ...prev, email: 'invalid-email' }));
      });
      act(() => {
        result.current.validateStep1();
      });
      expect(result.current.errors.email).toBe('validation.emailFormat');
    });

    it('validates age >= 18 for date of birth', () => {
      const { result } = renderHook(() => useRegistrationV2(mockT));

      const now = new Date();
      const under18Year = now.getFullYear() - 10;
      act(() => {
        result.current.setFormData((prev) => ({ ...prev, dob: `${under18Year}-01-01` }));
      });
      act(() => {
        result.current.validateStep1();
      });
      expect(result.current.errors.dob).toBe('validation.dobAge');

      const futureYear = now.getFullYear() + 2;
      act(() => {
        result.current.setFormData((prev) => ({ ...prev, dob: `${futureYear}-01-01` }));
      });
      act(() => {
        result.current.validateStep1();
      });
      expect(result.current.errors.dob).toBe('validation.dobFuture');
    });

    it('passes Step 1 with valid applicant details', () => {
      const { result } = renderHook(() => useRegistrationV2(mockT));

      act(() => {
        result.current.setFormData((prev) => ({ ...prev, ...VALID_STEP1_DATA }));
      });

      let isValid = false;
      act(() => {
        isValid = result.current.validateStep1();
      });

      expect(isValid).toBe(true);
      expect(result.current.errors.firstName).toBeUndefined();
      expect(result.current.errors.mobileNo).toBeUndefined();
      expect(result.current.errors.email).toBeUndefined();
      expect(result.current.errors.soWoDo).toBeUndefined();
      expect(result.current.errors.dob).toBeUndefined();
    });
  });

  describe('Step 2 Validation (KYC & Address)', () => {
    it('fails when Aadhaar, PIN code, or address fields are missing/invalid', () => {
      const { result } = renderHook(() => useRegistrationV2(mockT));

      let isValid = false;
      act(() => {
        isValid = result.current.validateStep2();
      });

      expect(isValid).toBe(false);
      expect(result.current.errors.aadharNumber).toBe('validation.aadharRequired');
      expect(result.current.errors.pincode).toBe('validation.pincodeFormat');
      expect(result.current.errors.state).toBe('validation.stateRequired');
      expect(result.current.errors.city).toBe('validation.cityRequired');
      expect(result.current.errors.address).toBe('validation.addressRequired');
    });

    it('validates Aadhaar has exactly 12 digits', () => {
      const { result } = renderHook(() => useRegistrationV2(mockT));

      act(() => {
        result.current.setFormData((prev) => ({ ...prev, aadharNumber: '1234 5678' }));
      });
      act(() => {
        result.current.validateStep2();
      });
      expect(result.current.errors.aadharNumber).toBe('validation.aadharFormat');
    });

    it('validates PAN format when provided', () => {
      const { result } = renderHook(() => useRegistrationV2(mockT));

      act(() => {
        result.current.setFormData((prev) => ({ ...prev, panNumber: 'INVALID_PAN' }));
      });
      act(() => {
        result.current.validateStep2();
      });
      expect(result.current.errors.panNumber).toBe('validation.panFormat');
    });

    it('validates 6-digit PIN code', () => {
      const { result } = renderHook(() => useRegistrationV2(mockT));

      act(() => {
        result.current.setFormData((prev) => ({ ...prev, pincode: '123' }));
      });
      act(() => {
        result.current.validateStep2();
      });
      expect(result.current.errors.pincode).toBe('validation.pincodeFormat');
    });

    it('passes Step 2 with valid KYC data', () => {
      const { result } = renderHook(() => useRegistrationV2(mockT));

      act(() => {
        result.current.setFormData((prev) => ({ ...prev, ...VALID_STEP2_DATA }));
      });

      let isValid = false;
      act(() => {
        isValid = result.current.validateStep2();
      });

      expect(isValid).toBe(true);
      expect(result.current.errors.aadharNumber).toBeUndefined();
      expect(result.current.errors.panNumber).toBeUndefined();
      expect(result.current.errors.pincode).toBeUndefined();
      expect(result.current.errors.state).toBeUndefined();
      expect(result.current.errors.city).toBeUndefined();
      expect(result.current.errors.address).toBeUndefined();
    });
  });

  describe('Step 3 Validation (Property & Scheme)', () => {
    it('fails when property choices or scheme amount are missing', () => {
      const { result } = renderHook(() => useRegistrationV2(mockT));

      let isValid = false;
      act(() => {
        isValid = result.current.validateStep3();
      });

      expect(isValid).toBe(false);
      expect(result.current.errors.project).toBe('validation.projectRequired');
      expect(result.current.errors.propertySize).toBe('validation.sizeRequired');
      expect(result.current.errors.propertyType).toBe('validation.typeRequired');
      expect(result.current.errors.paymentPlan).toBe('validation.planRequired');
      expect(result.current.errors.paymentMode).toBe('validation.modeRequired');
      expect(result.current.errors.schemeAmount).toBe('validation.amountRequired');
    });

    it('requires positive numeric schemeAmount', () => {
      const { result } = renderHook(() => useRegistrationV2(mockT));

      act(() => {
        result.current.setFormData((prev) => ({ ...prev, schemeAmount: '-500' }));
      });
      act(() => {
        result.current.validateStep3();
      });
      expect(result.current.errors.schemeAmount).toBe('validation.amountPositive');

      act(() => {
        result.current.setFormData((prev) => ({ ...prev, schemeAmount: 'abc' }));
      });
      act(() => {
        result.current.validateStep3();
      });
      expect(result.current.errors.schemeAmount).toBe('validation.amountPositive');
    });

    it('passes Step 3 with valid property preferences', () => {
      const { result } = renderHook(() => useRegistrationV2(mockT));

      act(() => {
        result.current.setFormData((prev) => ({ ...prev, ...VALID_STEP3_DATA }));
      });

      let isValid = false;
      act(() => {
        isValid = result.current.validateStep3();
      });

      expect(isValid).toBe(true);
      expect(result.current.errors.project).toBeUndefined();
      expect(result.current.errors.propertySize).toBeUndefined();
      expect(result.current.errors.propertyType).toBeUndefined();
      expect(result.current.errors.paymentPlan).toBeUndefined();
      expect(result.current.errors.paymentMode).toBeUndefined();
      expect(result.current.errors.schemeAmount).toBeUndefined();
    });
  });

  describe('Step 4 Validation (Review & Captcha)', () => {
    it('fails when captchaAnswer is empty', () => {
      const { result } = renderHook(() => useRegistrationV2(mockT));

      let isValid = false;
      act(() => {
        isValid = result.current.validateStep4();
      });

      expect(isValid).toBe(false);
      expect(result.current.captchaError).toBe('validation.captchaRequired');
    });

    it('passes when captchaAnswer is provided', () => {
      const { result } = renderHook(() => useRegistrationV2(mockT));

      act(() => {
        result.current.setCaptchaAnswer('14');
      });

      let isValid = false;
      act(() => {
        isValid = result.current.validateStep4();
      });

      expect(isValid).toBe(true);
      expect(result.current.captchaError).toBe('');
    });
  });

  describe('Navigation & Step Stepper', () => {
    it('does not advance with nextStep() if current step is invalid', () => {
      const { result } = renderHook(() => useRegistrationV2(mockT));

      let advanced = false;
      act(() => {
        advanced = result.current.nextStep();
      });

      expect(advanced).toBe(false);
      expect(result.current.currentStep).toBe(1);
      expect(result.current.attemptedSteps[1]).toBe(true);
    });

    it('advances to step 2 with nextStep() when step 1 is valid', () => {
      const { result } = renderHook(() => useRegistrationV2(mockT));

      act(() => {
        result.current.setFormData((prev) => ({ ...prev, ...VALID_STEP1_DATA }));
      });

      let advanced = false;
      act(() => {
        advanced = result.current.nextStep();
      });

      expect(advanced).toBe(true);
      expect(result.current.currentStep).toBe(2);
    });

    it('moves backward with prevStep()', () => {
      const { result } = renderHook(() => useRegistrationV2(mockT));

      act(() => {
        result.current.setFormData((prev) => ({ ...prev, ...VALID_STEP1_DATA }));
      });
      act(() => {
        result.current.nextStep();
      });
      expect(result.current.currentStep).toBe(2);

      act(() => {
        result.current.prevStep();
      });
      expect(result.current.currentStep).toBe(1);

      // Does not decrease below 1
      act(() => {
        result.current.prevStep();
      });
      expect(result.current.currentStep).toBe(1);
    });

    it('goToStep allows moving backwards anytime', () => {
      const { result } = renderHook(() => useRegistrationV2(mockT));

      act(() => {
        result.current.setCurrentStep(3);
      });

      act(() => {
        result.current.goToStep(1);
      });
      expect(result.current.currentStep).toBe(1);
    });

    it('goToStep prevents jumping forward past invalid steps', () => {
      const { result } = renderHook(() => useRegistrationV2(mockT));

      let success = false;
      act(() => {
        success = result.current.goToStep(3);
      });

      expect(success).toBe(false);
      expect(result.current.currentStep).toBe(1);
      expect(result.current.attemptedSteps[1]).toBe(true);
    });

    it('goToStep allows jumping forward when intervening steps are valid', () => {
      const { result } = renderHook(() => useRegistrationV2(mockT));

      act(() => {
        result.current.setFormData((prev) => ({
          ...prev,
          ...VALID_STEP1_DATA,
          ...VALID_STEP2_DATA,
        }));
      });

      let success = false;
      act(() => {
        success = result.current.goToStep(3);
      });

      expect(success).toBe(true);
      expect(result.current.currentStep).toBe(3);
    });
  });

  describe('Form Handling & UPPERCASE_FIELDS Transformation', () => {
    it('uppercases designated text input fields', () => {
      const { result } = renderHook(() => useRegistrationV2(mockT));

      act(() => {
        result.current.handleChange({
          target: { name: 'firstName', value: 'john' },
        } as React.ChangeEvent<HTMLInputElement>);
      });
      expect(result.current.formData.firstName).toBe('JOHN');

      act(() => {
        result.current.handleChange({
          target: { name: 'panNumber', value: 'abcde1234f' },
        } as React.ChangeEvent<HTMLInputElement>);
      });
      expect(result.current.formData.panNumber).toBe('ABCDE1234F');

      act(() => {
        result.current.handleChange({
          target: { name: 'email', value: 'user@example.com' },
        } as React.ChangeEvent<HTMLInputElement>);
      });
      expect(result.current.formData.email).toBe('USER@EXAMPLE.COM');
    });

    it('does not uppercase fields not in UPPERCASE_FIELDS', () => {
      const { result } = renderHook(() => useRegistrationV2(mockT));

      act(() => {
        result.current.handleChange({
          target: { name: 'propertySize', value: '100-200' },
        } as React.ChangeEvent<HTMLInputElement>);
      });
      expect(result.current.formData.propertySize).toBe('100-200');
    });

    it('clears field error when field changes', () => {
      const { result } = renderHook(() => useRegistrationV2(mockT));

      act(() => {
        result.current.setErrors({ firstName: 'Error' });
      });
      expect(result.current.errors.firstName).toBe('Error');

      act(() => {
        result.current.handleChange({
          target: { name: 'firstName', value: 'Ram' },
        } as React.ChangeEvent<HTMLInputElement>);
      });
      expect(result.current.errors.firstName).toBeUndefined();
    });

    it('verifies UPPERCASE_FIELDS contains all expected keys', () => {
      expect(UPPERCASE_FIELDS).toEqual({
        firstName: true,
        lastName: true,
        soWoDo: true,
        email: true,
        address: true,
        city: true,
        panNumber: true,
        advisorName: true,
      });
    });
  });

  describe('File Handling', () => {
    it('handles image compression and file removal', async () => {
      const { result } = renderHook(() => useRegistrationV2(mockT));

      const file = new File(['dummy content'], 'photo.jpg', { type: 'image/jpeg' });
      const changeEvent = {
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      await act(async () => {
        await result.current.handleFileChange(changeEvent, 'photo');
      });

      expect(result.current.photoFile).not.toBeNull();
      expect(result.current.photoFile?.name).toBe('photo.jpg');

      act(() => {
        result.current.removeFile('photo');
      });
      expect(result.current.photoFile).toBeNull();
    });
  });

  describe('LocalStorage Draft Persistence', () => {
    it('restores draft data from localStorage on mount', () => {
      const draft = {
        formData: {
          ...INITIAL_FORM_DATA,
          firstName: 'PREFILLED',
          mobileNo: '9999999999',
        },
        savedAt: Date.now(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));

      const { result } = renderHook(() => useRegistrationV2(mockT));

      expect(result.current.formData.firstName).toBe('PREFILLED');
      expect(result.current.formData.mobileNo).toBe('9999999999');
      expect(result.current.draftRestored).toBe(true);
    });

    it('auto-saves form data to localStorage with debounce', async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useRegistrationV2(mockT));

      act(() => {
        result.current.handleChange({
          target: { name: 'firstName', value: 'saved' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        vi.advanceTimersByTime(600);
      });

      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed.formData.firstName).toBe('SAVED');
      vi.useRealTimers();
    });

    it('clears draft from localStorage when clearDraft is called', () => {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ formData: {} }));
      const { result } = renderHook(() => useRegistrationV2(mockT));

      act(() => {
        result.current.clearDraft();
      });

      expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull();
    });
  });

  describe('API Submission & Confirm Payment', () => {
    it('dispatches submission with lowercase email, clears draft, and redirects', async () => {
      let sentFormData: globalThis.FormData | null = null;
      global.fetch = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
        if (init?.body instanceof globalThis.FormData) {
          sentFormData = init.body;
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      });

      localStorage.setItem(DRAFT_STORAGE_KEY, 'some-draft');

      const { result } = renderHook(() => useRegistrationV2(mockT));

      act(() => {
        result.current.setFormData((prev) => ({
          ...prev,
          ...VALID_STEP1_DATA,
          ...VALID_STEP2_DATA,
          ...VALID_STEP3_DATA,
          email: 'TEST.USER@SVI.COM',
        }));
        result.current.setCaptchaAnswer('42');
      });

      await act(async () => {
        await result.current.handleConfirmPayment();
      });

      expect(mockPush).toHaveBeenCalledWith('/thank-you?registered=1');
      expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull();
      const payload = sentFormData as globalThis.FormData | null;
      expect(payload).not.toBeNull();
      expect(payload?.get('email')).toBe('test.user@svi.com');
      expect(payload?.get('captchaAnswer')).toBe('42');
    });

    it('sets submitError on failure', async () => {
      global.fetch = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
        if (init?.body instanceof globalThis.FormData) {
          return Promise.resolve({
            ok: false,
            status: 400,
            json: () => Promise.resolve({ error: 'Database constraint violation' }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      });

      const { result } = renderHook(() => useRegistrationV2(mockT));

      await act(async () => {
        await result.current.handleConfirmPayment();
      });

      expect(result.current.submitError).toBe('Database constraint violation');
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
