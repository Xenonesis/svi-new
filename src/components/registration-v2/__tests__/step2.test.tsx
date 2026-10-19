import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { KycPreviewCard } from '../KycPreviewCard';
import { Step2KycDocuments } from '../steps/Step2KycDocuments';
import { INITIAL_FORM_DATA } from '../types';
import type { FormData } from '../types';
import * as postalLib from '@/src/lib/postal';

type PostalModule = typeof postalLib;

// Mock postal lookup
vi.mock('@/src/lib/postal', async (importOriginal) => {
  const actual = await importOriginal<PostalModule>();
  return {
    ...actual,
    lookupPincode: vi.fn().mockResolvedValue(null),
  };
});
const mockT = (key: string): string => {
  const translations: Record<string, string> = {
    'steps.step2.title': 'KYC & Address Verification',
    'steps.step2.subtitle': 'Government ID proof and permanent residential address',
    aadharNumber: 'Aadhaar Card Number',
    panNumber: 'PAN Card Number',
    pincode: 'PIN Code',
    state: 'State / Union Territory',
    district: 'District',
    city: 'City / Town',
    address: 'House / Flat & Street Address',
    prevStep: 'Back to Applicant',
    nextStep: 'Next: Property Preferences',
  };
  return translations[key] || key;
};

describe('KycPreviewCard', () => {
  const defaultProps = {
    fullName: 'RAMESH KUMAR',
    photoFile: null,
    panCardFile: null,
    aadharNumber: '1234 5678 9012',
    panNumber: 'ABCDE1234F',
    district: '',
    city: 'NOIDA',
    state: 'UTTAR PRADESH',
  };

  it('renders official header and branding pass title', () => {
    render(<KycPreviewCard {...defaultProps} />);

    expect(screen.getByText(/PRIORITY ALLOTMENT PASS/i)).toBeInTheDocument();
    expect(screen.getByText(/OFFICIAL VERIFIED APPLICANT/i)).toBeInTheDocument();
  });

  it('renders official digital security seal badge', () => {
    render(<KycPreviewCard {...defaultProps} />);

    expect(screen.getByText(/DIGITAL SEAL/i)).toBeInTheDocument();
  });

  it('displays applicant name in bold uppercase', () => {
    render(<KycPreviewCard {...defaultProps} />);

    expect(screen.getByText('RAMESH KUMAR')).toBeInTheDocument();
  });

  it('displays fallback name when fullName is empty', () => {
    render(<KycPreviewCard {...defaultProps} fullName="" />);

    expect(screen.getByText('APPLICANT NAME')).toBeInTheDocument();
  });

  it('displays masked Aadhaar number ending in last 4 digits', () => {
    render(<KycPreviewCard {...defaultProps} aadharNumber="1234 5678 9012" />);

    expect(screen.getByText(/•••• •••• 9012/)).toBeInTheDocument();
  });

  it('displays masked placeholder when Aadhaar number is empty', () => {
    render(<KycPreviewCard {...defaultProps} aadharNumber="" />);

    expect(screen.getByText(/•••• •••• ••••/)).toBeInTheDocument();
  });

  it('displays green verified badge when PAN is valid', () => {
    render(<KycPreviewCard {...defaultProps} panNumber="ABCDE1234F" />);

    expect(screen.getByText('ABCDE1234F')).toBeInTheDocument();
    const verifiedBadge = screen.getByTestId('pan-verified-badge');
    expect(verifiedBadge).toBeInTheDocument();
    expect(verifiedBadge).toHaveTextContent(/VERIFIED/i);
  });

  it('does not display verified badge when PAN is invalid', () => {
    render(<KycPreviewCard {...defaultProps} panNumber="INVALID12" />);

    expect(screen.queryByTestId('pan-verified-badge')).not.toBeInTheDocument();
  });

  it('displays city and state location badge', () => {
    render(<KycPreviewCard {...defaultProps} district="" city="NOIDA" state="UTTAR PRADESH" />);

    expect(screen.getByText(/NOIDA, UTTAR PRADESH/i)).toBeInTheDocument();
  });

  it('displays city, district, and state in location badge when district is present', () => {
    render(
      <KycPreviewCard
        {...defaultProps}
        city="NOIDA"
        district="GAUTAM BUDDHA NAGAR"
        state="UTTAR PRADESH"
      />
    );

    expect(screen.getByText(/NOIDA, GAUTAM BUDDHA NAGAR, UTTAR PRADESH/i)).toBeInTheDocument();
  });

  it('displays fallback location when city and state are empty', () => {
    render(<KycPreviewCard {...defaultProps} district="" city="" state="" />);

    expect(screen.getByText(/LOCATION NOT SET/i)).toBeInTheDocument();
  });

  it('renders fallback avatar icon when no photoFile is provided', () => {
    render(<KycPreviewCard {...defaultProps} photoFile={null} />);

    expect(screen.getByTestId('kyc-avatar-fallback')).toBeInTheDocument();
  });

  it('renders photo thumbnail when photoFile is provided', () => {
    const mockFile = new File(['dummy-bytes'], 'passport.jpg', { type: 'image/jpeg' });
    const createObjectURLSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:http://localhost/dummy');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    const { unmount } = render(<KycPreviewCard {...defaultProps} photoFile={mockFile} />);

    const img = screen.getByAltText(/RAMESH KUMAR/i);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'blob:http://localhost/dummy');

    unmount();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:http://localhost/dummy');

    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
  });

  it('displays PAN document attached status badge when panCardFile is provided', () => {
    const mockPanFile = new File(['pan-doc'], 'pan_card.pdf', { type: 'application/pdf' });
    render(<KycPreviewCard {...defaultProps} panCardFile={mockPanFile} />);

    expect(screen.getByText(/PAN DOC ATTACHED/i)).toBeInTheDocument();
  });
});

describe('Step2KycDocuments', () => {
  const baseFormData: FormData = {
    ...INITIAL_FORM_DATA,
    firstName: 'RAMESH',
    lastName: 'KUMAR',
    aadharNumber: '1234 5678 9012',
    panNumber: 'ABCDE1234F',
    pincode: '201301',
    state: 'Uttar Pradesh',
    district: 'GAUTAM BUDDHA NAGAR',
    city: 'NOIDA',
    address: 'SECTOR 62, PLOT 4',
  };

  const defaultProps = {
    formData: baseFormData,
    errors: {},
    attempted: false,
    t: mockT,
    photoFile: null,
    panCardFile: null,
    compressing: null as 'photo' | 'panCard' | null,
    onChange: vi.fn(),
    onFileChange: vi.fn(),
    onRemoveFile: vi.fn(),
    onNext: vi.fn(),
    onPrev: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all KYC and Address fields with initial values', () => {
    render(<Step2KycDocuments {...defaultProps} />);

    const aadharInput = screen.getByLabelText(/Aadhaar Card Number/i) as HTMLInputElement;
    expect(aadharInput.value).toBe('1234 5678 9012');

    const panInput = screen.getByLabelText(/PAN Card Number/i) as HTMLInputElement;
    expect(panInput.value).toBe('ABCDE1234F');

    const pinInput = screen.getByLabelText(/PIN Code/i) as HTMLInputElement;
    expect(pinInput.value).toBe('201301');

    const stateSelect = screen.getByLabelText(/State \/ Union Territory/i) as HTMLSelectElement;
    expect(stateSelect.value).toBe('Uttar Pradesh');
    const districtSelect = screen.getByLabelText(/^District/i) as HTMLSelectElement;
    expect(districtSelect.value).toBe('Gautam Buddha Nagar (Noida)');

    const cityInput = screen.getByLabelText(/City \/ Town/i) as HTMLInputElement;
    expect(cityInput.value).toBe('NOIDA');
    const addressInput = screen.getByLabelText(
      /House \/ Flat & Street Address/i
    ) as HTMLInputElement;
    expect(addressInput.value).toBe('SECTOR 62, PLOT 4');
  });

  it('formats Aadhaar on typing with 4-digit spacing and caps at 14 formatted chars', () => {
    const handleChange = vi.fn();
    render(
      <Step2KycDocuments
        {...defaultProps}
        formData={{ ...baseFormData, aadharNumber: '' }}
        onChange={handleChange}
      />
    );

    const aadharInput = screen.getByLabelText(/Aadhaar Card Number/i);
    fireEvent.change(aadharInput, { target: { value: '987654321098' } });

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          name: 'aadharNumber',
          value: '9876 5432 1098',
        }),
      })
    );
  });

  it('auto-uppercases PAN and shows live green validation badge when format is valid', () => {
    const handleChange = vi.fn();
    const { rerender } = render(
      <Step2KycDocuments
        {...defaultProps}
        formData={{ ...baseFormData, panNumber: '' }}
        onChange={handleChange}
      />
    );

    const panInput = screen.getByLabelText(/PAN Card Number/i);
    fireEvent.change(panInput, { target: { value: 'abcde1234f' } });

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          name: 'panNumber',
          value: 'ABCDE1234F',
        }),
      })
    );

    // Rerender with valid PAN to check live badge
    rerender(
      <Step2KycDocuments
        {...defaultProps}
        formData={{ ...baseFormData, panNumber: 'ABCDE1234F' }}
      />
    );

    expect(screen.getByText(/Format Verified/i)).toBeInTheDocument();
  });

  it('displays photo upload card and triggers onFileChange when photo selected', () => {
    const handleFileChange = vi.fn();
    render(<Step2KycDocuments {...defaultProps} onFileChange={handleFileChange} />);

    const photoInput = screen.getByTestId('photo-upload-input');
    const file = new File(['photo-content'], 'avatar.jpg', { type: 'image/jpeg' });
    fireEvent.change(photoInput, { target: { files: [file] } });

    expect(handleFileChange).toHaveBeenCalledWith(expect.anything(), 'photo');
  });

  it('displays PAN card upload card and triggers onFileChange when PAN document selected', () => {
    const handleFileChange = vi.fn();
    render(<Step2KycDocuments {...defaultProps} onFileChange={handleFileChange} />);

    const panDocInput = screen.getByTestId('pancard-upload-input');
    const file = new File(['pan-content'], 'pan.pdf', { type: 'application/pdf' });
    fireEvent.change(panDocInput, { target: { files: [file] } });

    expect(handleFileChange).toHaveBeenCalledWith(expect.anything(), 'panCard');
  });

  it('displays compressing indicator when compressing photo', () => {
    render(<Step2KycDocuments {...defaultProps} compressing="photo" />);

    expect(screen.getByText(/Compressing passport photo/i)).toBeInTheDocument();
  });

  it('displays compressing indicator when compressing PAN document', () => {
    render(<Step2KycDocuments {...defaultProps} compressing="panCard" />);

    expect(screen.getByText(/Compressing PAN document/i)).toBeInTheDocument();
  });

  it('displays file preview and calls onRemoveFile when remove photo button is clicked', () => {
    const handleRemove = vi.fn();
    const photoFile = new File(['test-bytes'], 'applicant-photo.jpg', { type: 'image/jpeg' });

    render(
      <Step2KycDocuments {...defaultProps} photoFile={photoFile} onRemoveFile={handleRemove} />
    );

    expect(screen.getByText('applicant-photo.jpg')).toBeInTheDocument();

    const removeBtn = screen.getByRole('button', { name: /Remove passport photo/i });
    fireEvent.click(removeBtn);

    expect(handleRemove).toHaveBeenCalledWith('photo');
  });

  it('displays file preview and calls onRemoveFile when remove PAN button is clicked', () => {
    const handleRemove = vi.fn();
    const panCardFile = new File(['test-bytes'], 'pan-copy.png', { type: 'image/png' });

    render(
      <Step2KycDocuments {...defaultProps} panCardFile={panCardFile} onRemoveFile={handleRemove} />
    );

    expect(screen.getByText('pan-copy.png')).toBeInTheDocument();

    const removeBtn = screen.getByRole('button', { name: /Remove PAN document/i });
    fireEvent.click(removeBtn);

    expect(handleRemove).toHaveBeenCalledWith('panCard');
  });

  it('triggers postal auto-lookup on 6-digit pincode and auto-fills state and city', async () => {
    const handleChange = vi.fn();
    const lookupMock = vi.mocked(postalLib.lookupPincode).mockResolvedValueOnce({
      pincode: '201301',
      state: 'Uttar Pradesh',
      district: 'Gautam Buddha Nagar',
      postOffices: ['Noida Sector 62'],
    });

    render(
      <Step2KycDocuments
        {...defaultProps}
        formData={{ ...baseFormData, pincode: '201301', state: '', district: '', city: '' }}
        onChange={handleChange}
      />
    );

    await waitFor(() => {
      expect(lookupMock).toHaveBeenCalledWith('201301');
    });

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            name: 'state',
            value: 'Uttar Pradesh',
          }),
        })
      );
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            name: 'district',
            value: 'GAUTAM BUDDHA NAGAR (NOIDA)',
          }),
        })
      );
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            name: 'city',
            value: 'NOIDA SECTOR 62',
          }),
        })
      );
    });
  });

  it('navigates with onPrev and onNext buttons with min 44px touch targets', () => {
    const handlePrev = vi.fn();
    const handleNext = vi.fn();

    render(<Step2KycDocuments {...defaultProps} onPrev={handlePrev} onNext={handleNext} />);

    const prevBtn = screen.getByRole('button', { name: /Back to Applicant/i });
    expect(prevBtn.className).toContain('min-h-[44px]');
    fireEvent.click(prevBtn);
    expect(handlePrev).toHaveBeenCalledTimes(1);

    const nextBtn = screen.getByRole('button', { name: /Next: Property Preferences/i });
    expect(nextBtn.className).toContain('min-h-[44px]');
    fireEvent.click(nextBtn);
    expect(handleNext).toHaveBeenCalledTimes(1);
  });

  it('renders KycPreviewCard in desktop column and mobile preview toggle', () => {
    render(<Step2KycDocuments {...defaultProps} />);

    // Live preview title
    expect(screen.getAllByText(/PRIORITY ALLOTMENT PASS/i).length).toBeGreaterThan(0);

    // Mobile preview toggle button
    const mobileToggle = screen.getByRole('button', { name: /Live ID Pass Preview/i });
    expect(mobileToggle).toBeInTheDocument();
  });

  it('renders live full address auto-combination preview under address input', () => {
    render(
      <Step2KycDocuments
        {...defaultProps}
        formData={{
          ...baseFormData,
          address: 'FLAT 302, TOWER B',
          city: 'GURGAON',
          district: 'GURUGRAM (GURGAON)',
          state: 'Haryana',
          pincode: '122002',
        }}
      />
    );

    expect(screen.getByTestId('live-full-address-preview')).toBeInTheDocument();
    expect(screen.getByText(/FLAT 302, TOWER B, GURGAON, Haryana - 122002/i)).toBeInTheDocument();
  });
});
