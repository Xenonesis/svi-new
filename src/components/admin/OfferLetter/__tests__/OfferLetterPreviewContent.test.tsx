/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import OfferLetterPreviewContent from '@/src/components/admin/DocumentGenerator/OfferLetterPreviewContent';

describe('OfferLetterPreviewContent', () => {
  const mockCompanyInfo = {
    company_name: 'SVI Infra Solutions Pvt. Ltd.',
    company_address: 'Block E-220, 2nd Floor, Sector 63, Noida, Uttar Pradesh 201309',
    company_email: 'info@sviinfrasolutions.com',
    company_phone: '+91 9216014579',
    company_website: 'www.sviinfrasolutions.com',
  };

  const baseFormData = {
    date: '2026-08-18',
    name: 'Rajesh Kumar Sharma',
    address: 'Flat 402, Block B, Royal Heights, Noida, UP - 201301',
    mobileNo: '9876543210',
    alternativeNo: '9876543211',
    emailId: 'rajesh.sharma@example.com',
    designation: 'Senior Business Development Manager',
    department: 'Sales',
    reportingTo: 'Director of Business Development',
    appointmentDate: '2026-09-01',
    location: 'Noida Corporate Office',
    salaryCtc: '35000',
    target: '380',
    offerSlab: '3%',
    workingHoursStart: '10:30 AM',
    workingHoursEnd: '6:30 PM',
    workingDays: 'Wednesday to Monday',
    probationPeriod: '3',
  };

  it('renders corporate branding, header, and candidate particulars', () => {
    render(<OfferLetterPreviewContent formData={baseFormData} companyInfo={mockCompanyInfo} />);

    expect(screen.getAllByText(/SVI Infra Solutions Pvt\. Ltd\./i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Rajesh Kumar Sharma/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Flat 402, Block B, Royal Heights/i)).toBeInTheDocument();
    expect(screen.getByText(/\+91 9876543210/i)).toBeInTheDocument();
    expect(screen.getByText('rajesh.sharma@example.com')).toBeInTheDocument();
  });

  it('renders mandatory onboarding documentation clause with HR Onboarding Desk requirements', () => {
    render(<OfferLetterPreviewContent formData={baseFormData} companyInfo={mockCompanyInfo} />);

    // Mandatory HR Onboarding Desk reference
    expect(screen.getAllByText(/SVI HR Onboarding Desk/i).length).toBeGreaterThan(0);
    // Document requirements
    expect(screen.getByText(/1\. Academic Credentials:/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. Photographic Records:/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. Identity Verification \(Aadhaar\):/i)).toBeInTheDocument();
    expect(screen.getByText(/4\. Tax Registration \(PAN Card\):/i)).toBeInTheDocument();
    expect(
      screen.getByText(/5\. Prior Employment Experience & Relieving Credentials:/i)
    ).toBeInTheDocument();

    // Submission guidelines and BGV
    expect(
      screen.getByText(/PDF, JPEG, or PNG formats \(maximum file size 5MB per document\)/i)
    ).toBeInTheDocument();
    expect(screen.getAllByText(/three \(3\) business days/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Background Verification \(BGV\)/i)).toBeInTheDocument();
  });

  it('renders core legal covenants and terms across sections', () => {
    render(<OfferLetterPreviewContent formData={baseFormData} companyInfo={mockCompanyInfo} />);

    // Clause 1: Position & Reporting
    expect(screen.getByText(/1\. Designation, Department & Reporting Matrix/i)).toBeInTheDocument();
    expect(screen.getByText('Senior Business Development Manager')).toBeInTheDocument();

    // Clause 2: Location & Mobility
    expect(
      screen.getByText(/2\. Date of Commencement, Work Location & Mobility/i)
    ).toBeInTheDocument();

    // Clause 3: Compensation
    expect(
      screen.getByText(/3\. Remuneration Structure, Performance Slabs & Statutory Deductions/i)
    ).toBeInTheDocument();

    // Clause 5: Probation
    expect(
      screen.getByText(/5\. Probationary Period, Performance Assessment & Confirmation Protocols/i)
    ).toBeInTheDocument();

    // Clause 7: Confidentiality & Data Privacy
    expect(
      screen.getByText(
        /7\. Comprehensive Non-Disclosure, Trade Secrets & Data Protection \(DPDPA 2023\)/i
      )
    ).toBeInTheDocument();

    // Clause 8: Intellectual Property
    expect(
      screen.getByText(
        /8\. Intellectual Property \(IP\) Ownership, Inventions & Work-for-Hire Assignment/i
      )
    ).toBeInTheDocument();

    // Clause 9: Restrictive Covenants & Non-Solicitation
    expect(
      screen.getByText(
        /9\. Restrictive Covenants: Non-Solicitation, Exclusivity & Conflict of Interest/i
      )
    ).toBeInTheDocument();

    // Termination & Separation
    expect(
      screen.getByText(/Termination of Employment, Separation Protocols & Summary Dismissal/i)
    ).toBeInTheDocument();

    // Clause 14: Governing Law & Arbitration
    expect(screen.getByText(/14\. Governing Law & Dispute Resolution/i)).toBeInTheDocument();

    // Dual Execution Signatures
    expect(screen.getByText(/Issued For and on behalf of Organization:/i)).toBeInTheDocument();
    expect(screen.getByText('Iliyas Ali')).toBeInTheDocument();
    expect(screen.getByText(/Candidate Formal Acceptance & Attestation:/i)).toBeInTheDocument();
  });

  it('renders No Sale No Salary policy with subsistence allowance when configured', () => {
    const salesData = {
      ...baseFormData,
      salesCompensationType: 'no_sale_no_salary',
      subsistenceAllowance: '8000',
    };

    render(<OfferLetterPreviewContent formData={salesData} companyInfo={mockCompanyInfo} />);

    expect(screen.getByText(/No Sale No Salary/i)).toBeInTheDocument();
    expect(screen.getByText(/₹ 8,000\.00 per month/i)).toBeInTheDocument();
  });

  it('renders custom guaranteed percentage salary during quota incubation when configured', () => {
    const customPercentData = {
      ...baseFormData,
      salesCompensationType: 'custom_percent',
      customSalaryPercent: '60',
      salaryCtc: '30000',
    };

    render(
      <OfferLetterPreviewContent formData={customPercentData} companyInfo={mockCompanyInfo} />
    );

    expect(
      screen.getByText(/Guaranteed Staggered Remuneration During Quota Incubation/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/60%/i)).toBeInTheDocument();
    expect(screen.getByText(/₹ 18,000\.00 per month/i)).toBeInTheDocument();
  });

  it('renders Gestation Window with post-tenure adjusted retainer clause when configured', () => {
    const gracePeriodData = {
      ...baseFormData,
      salesCompensationType: 'grace_period_reduced_percent',
      gracePeriodMonths: '3',
      reducedSalaryPercent: '50',
      salaryCtc: '30000',
    };

    render(<OfferLetterPreviewContent formData={gracePeriodData} companyInfo={mockCompanyInfo} />);

    expect(
      screen.getByText(
        /Onboarding Incubation Window & Performance-Indexed Post-Tenure Remuneration/i
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/3 months/i)).toBeInTheDocument();
    expect(screen.getByText(/Effective from Month/i)).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText(/50%/i)).toBeInTheDocument();
    expect(screen.getByText(/₹ 15,000\.00 per month/i)).toBeInTheDocument();
  });

  it('renders Quota-Indexed Tiered Remuneration & Performance Contingency Matrix when enabled', () => {
    const targetTierData = {
      ...baseFormData,
      enablePartialTargetRule: true,
      salaryCtc: '30000',
      target: '300',
    };

    render(<OfferLetterPreviewContent formData={targetTierData} companyInfo={mockCompanyInfo} />);

    expect(
      screen.getByText(/Quota-Indexed Tiered Remuneration & Performance Contingency Matrix/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Tier 1 — Benchmark Realization/i)).toBeInTheDocument();
    expect(screen.getByText(/Tier 2 — Sub-Benchmark Production Yield/i)).toBeInTheDocument();
    expect(
      screen.getByText(/prorated fifty percent \(50%\) baseline emolument apportionment/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/₹ 15,000\.00 per month/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Tier 3 — Zero-Production Non-Disbursement Policy/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/applicable ab initio from Month 1/i)).toBeInTheDocument();
  });
  it('renders telecaller mandatory meetings requirement when configured', () => {
    const telecallerData = {
      ...baseFormData,
      designation: 'Telecaller',
      meetingsPerMonth: '20',
    };

    render(<OfferLetterPreviewContent formData={telecallerData} companyInfo={mockCompanyInfo} />);

    expect(screen.getByText(/Mandatory Client Meeting Thresholds:/i)).toBeInTheDocument();
    expect(
      screen.getByText(/20 validated in-person \/ prospective client meetings/i)
    ).toBeInTheDocument();
  });

  it('renders Net In-Hand salary phrasing when salaryType is in_hand', () => {
    const inHandData = {
      ...baseFormData,
      salaryType: 'in_hand',
      salaryCtc: '25000',
    };

    render(<OfferLetterPreviewContent formData={inHandData} companyInfo={mockCompanyInfo} />);

    expect(screen.getByText(/fixed Net In-Hand Salary of/i)).toBeInTheDocument();
    expect(screen.getByText(/₹ 25,000\.00 per month/i)).toBeInTheDocument();
    expect(screen.queryByText(/annualized Net In-Hand Remuneration/i)).not.toBeInTheDocument();
  });
});
