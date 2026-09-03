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

    // Clause 9: Restrictive Covenants & Non-Solicitation & Lead Protection
    expect(
      screen.getByText(
        /9\. Restrictive Covenants: Non-Solicitation, Lead Protection & Anti-Kickback/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/9\.3 Company Lead Protection, Non-Diversion & Anti-Kickback:/i)
    ).toBeInTheDocument();

    // Termination & Separation & Cash handling
    expect(
      screen.getByText(/12\. Termination of Employment, Cash Handling Rules & Summary Dismissal/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/12\.2 Zero-Tolerance Direct Cash Handling & Unauthorized Collections:/i)
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
        /Structured Onboarding Gestation Window & Performance-Indexed Post-Tenure Remuneration/i
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

  it('completely hides Sales Policy Box when includeSalesPolicyBox is false', () => {
    const hiddenSalesBoxData = {
      ...baseFormData,
      target: '380',
      salesCompensationType: 'no_sale_no_salary',
      includeSalesPolicyBox: false,
    };

    render(
      <OfferLetterPreviewContent formData={hiddenSalesBoxData} companyInfo={mockCompanyInfo} />
    );

    expect(
      screen.queryByText(/Sales Performance Quota & Commission Matrix:/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Clause 3.1 — Performance-Linked Compensation Condition/i)
    ).not.toBeInTheDocument();
  });

  it('completely hides Onboarding Documentation Box when includeDocumentationBox is false', () => {
    const hiddenDocsData = {
      ...baseFormData,
      includeDocumentationBox: false,
    };

    render(<OfferLetterPreviewContent formData={hiddenDocsData} companyInfo={mockCompanyInfo} />);

    expect(
      screen.queryByText(/4. Mandatory Pre-Employment Onboarding Documentation/i)
    ).not.toBeInTheDocument();
  });

  it('completely hides Candidate Particulars Card when includeCandidateParticularsBox is false', () => {
    const hiddenCandidateCardData = {
      ...baseFormData,
      includeCandidateParticularsBox: false,
    };

    render(
      <OfferLetterPreviewContent formData={hiddenCandidateCardData} companyInfo={mockCompanyInfo} />
    );

    expect(screen.queryByText(/Candidate Recipient Particulars:/i)).not.toBeInTheDocument();
  });

  it('renders complete Hindi legal text, clauses, and metadata across all 3 pages when language is hi', () => {
    const hindiFormData = {
      ...baseFormData,
      language: 'hi' as const,
    };

    render(<OfferLetterPreviewContent formData={hindiFormData} companyInfo={mockCompanyInfo} />);

    // Page 1: Header, Metadata, Particulars
    expect(
      screen.getByText(/आधिकारिक कॉर्पोरेट नियुक्ति अभिलेख • पूर्णतः निजी एवं गोपनीय/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/अभ्यर्थी का विवरण एवं पहचान:/i)).toBeInTheDocument();
    expect(screen.getByText(/अभ्यर्थी का नाम:/i)).toBeInTheDocument();
    expect(screen.getAllByText('Rajesh Kumar Sharma').length).toBeGreaterThan(0);
    expect(screen.getByText(/प्राथमिक संपर्क:/i)).toBeInTheDocument();
    expect(screen.getByText(/स्थायी निवास पता:/i)).toBeInTheDocument();
    expect(screen.getByText(/ईमेल पता:/i)).toBeInTheDocument();

    // Page 1: Subject, Preamble, Clauses 1 to 4
    expect(screen.getByText(/औपचारिक नियुक्ति प्रस्ताव पत्र/i)).toBeInTheDocument();
    expect(screen.getByText(/प्रिय/i)).toBeInTheDocument();
    expect(screen.getByText(/1\. पद, पदनाम एवं संगठनात्मक पदानुक्रम/i)).toBeInTheDocument();
    expect(
      screen.getByText(/2\. कार्यभार ग्रहण तिथि, पदस्थापन स्थान एवं गतिशीलता/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/3\. पारिश्रमिक संरचना, वेतन स्लैब एवं वैधानिक कटौतियां/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/4\. अनिवार्य पूर्व-रोजगार दस्तावेज एवं सत्यापन प्रक्रिया/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/खंड २: परिचालन नियम, प्रतिबंधात्मक शर्तें एवं कॉर्पोरेट आचार संहिता/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/5\. परिवीक्षा अवधि, कार्य-मूल्यांकन एवं सेवा पुष्टिकरण प्रक्रिया/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/6\. कार्य समय, ग्राहक स्थल भ्रमण एवं उपस्थिति अनुसूची/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/7\. व्यापक गैर-प्रकटीकरण, व्यापारिक रहस्य एवं डेटा संरक्षण \(DPDPA 2023\)/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/8\. बौद्धिक संपदा \(IP\) स्वामित्व, आविष्कार एवं कार्य-अधिकार सौंपना/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/9\. प्रतिबंधात्मक शर्तें: गैर-याचना, लीड सुरक्षा एवं रिश्वत-रोधी नियम/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/10\. कार्य निष्पादन प्रबंधन एवं प्रदर्शन सुधार योजना \(PIP Framework\)/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/11\. स्थानांतरण, व्यावसायिक अनिवार्यता एवं परिचालन अधिकार/i)
    ).toBeInTheDocument();

    // Page 3: Section III Banner, Clauses 12 to 15, Dual Signatures
    expect(
      screen.getByText(/खंड ३: सेवा समाप्ति, विधिक नियम एवं औपचारिक स्वीकृति/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /12\. सेवा समाप्ति, नकद लेन-देन नियम एवं त्वरित बर्खास्तगी \(Termination Rules\)/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/13\. क्षतिपूर्ति एवं दायित्व \(Indemnification\)/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/14\. शासी कानून एवं विवाद समाधान \(Governing Law & Dispute Resolution\)/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/15\. संपूर्ण समझौता, पृथक्करणीयता एवं प्रस्ताव की वैधता अवधि/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/संस्थान की ओर से एवं उनके निमित्त:/i)).toBeInTheDocument();
    expect(screen.getByText(/निदेशक एवं अधिकृत हस्ताक्षरकर्ता/i)).toBeInTheDocument();
    expect(screen.getByText(/अभ्यर्थी द्वारा औपचारिक स्वीकृति एवं शपथ:/i)).toBeInTheDocument();
    expect(screen.getByText(/अभ्यर्थी के हस्ताक्षर:/i)).toBeInTheDocument();
  });

  it('renders sales compensation terms accurately in Hindi when configured', () => {
    // Test No Sale No Salary in Hindi
    const noSaleHindiData = {
      ...baseFormData,
      language: 'hi' as const,
      salesCompensationType: 'no_sale_no_salary',
      subsistenceAllowance: '8000',
    };

    const { unmount } = render(
      <OfferLetterPreviewContent formData={noSaleHindiData} companyInfo={mockCompanyInfo} />
    );

    expect(
      screen.getByText(/खंड ३\.१ — कार्य-प्रदर्शन आधारित पारिश्रमिक शर्त \(“No Sale No Salary”\):/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/₹ 8,000\.00 प्रति माह/i)).toBeInTheDocument();
    unmount();

    // Test Gestation Window in Hindi
    const gestationHindiData = {
      ...baseFormData,
      language: 'hi' as const,
      salesCompensationType: 'grace_period_reduced_percent',
      gracePeriodMonths: '3',
      reducedSalaryPercent: '0',
    };

    render(
      <OfferLetterPreviewContent formData={gestationHindiData} companyInfo={mockCompanyInfo} />
    );

    expect(
      screen.getByText(
        /खंड ३\.१ — संरचित ऑनबोर्डिंग जेस्टेशन विंडो एवं कार्य-प्रदर्शन आधारित पारिश्रमिक:/i
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/Gestation Window/i)).toBeInTheDocument();
  });

  it('correctly formats in-hand salary in Hindi without raw in_hand or invalid annual CTC', () => {
    const inHandHindiData = {
      ...baseFormData,
      language: 'hi' as const,
      salaryCtc: '36000',
      salaryType: 'in_hand',
    };

    render(<OfferLetterPreviewContent formData={inHandHindiData} companyInfo={mockCompanyInfo} />);

    expect(screen.getByText(/नियत इन-हैंड \(Net In-Hand\) वेतन/i)).toBeInTheDocument();
    expect(screen.queryByText(/\(in_hand\)/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/वार्षिक सीटीसी/i)).not.toBeInTheDocument();
  });
});
