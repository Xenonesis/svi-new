export interface OfferLetterTranslation {
  docClassification: string;
  refLabel: string;
  dateLabel: string;
  docTitle: string;
  candidateParticularsTitle: string;
  labels: {
    candidateName: string;
    mobileNo: string;
    altMobile: string;
    email: string;
    address: string;
    deptDesignation: string;
    appointmentDate: string;
  };
  subject: (designation: string, companyName: string) => string;
  dearCandidate: (name: string) => string;
  preamble: (designation: string) => string;
  clauses: {
    c1Title: string;
    c1Text: (designation: string, department: string, reportingTo: string) => string;
    c2Title: string;
    c2Text: (location: string) => string;
    c3Title: string;
    c3Text: (salaryCtc: string, annualCTC: string, salaryType: string) => string;
    c4Title: string;
    c4Notice: string;
    c5Title: string;
    c5Text: (probation: string) => string;
    c6Title: string;
    c6Text: (hoursStart: string, hoursEnd: string, days: string, weeklyOff: string) => string;
    c7Title: string;
    c7Text: string;
    c8Title: string;
    c8Text: string;
    c9Title: string;
    c9Text: string;
    c10Title: string;
    c10Text: string;
    c11Title: string;
    c11Text: string;
    c12Title: string;
    c12Text: string;
    c13Title: string;
    c13Text: string;
    c14Title: string;
    c14Text: string;
    c15Title: string;
    c15Text: string;
  };
  salesTerms: {
    policyTitle: string;
    quotaRule: (target: string, unit: string) => string;
    milestoneRule: (pct: string) => string;
    noSaleRule: (months: string, reducedPct: string) => string;
    customSalaryRule: (pct: string) => string;
    gracePeriodRule: (months: string, reducedPct: string) => string;
    partialTargetRule: (pct: string) => string;
    clientMeetingsRule: (meetings: string) => string;
    conveyanceRule: (amount: string) => string;
    siteVisitRule: (schedule: string) => string;
  };
  documentation: {
    title: string;
    photoTitle: string;
    photoDesc: string;
    panTitle: string;
    panDesc: string;
    aadhaarTitle: string;
    aadhaarDesc: string;
    eduTitle: string;
    eduDesc: string;
    expTitle: string;
    expDesc: string;
    bgvNotice: string;
  };
  signatures: {
    sectionTitle: string;
    employerTitle: string;
    employerDesignation: string;
    candidateTitle: string;
    candidateAttestation: string;
    candidateSignLabel: string;
  };
  footer: {
    confidentiality: string;
    candidateInitials: string;
    pageOf: (curr: number, total: number) => string;
  };
}

export const translations: Record<'en' | 'hi', OfferLetterTranslation> = {
  en: {
    docClassification: 'OFFICIAL CORPORATE APPOINTMENT RECORD • STRICTLY CONFIDENTIAL',
    refLabel: 'Document Ref',
    dateLabel: 'Issuance Date',
    docTitle: 'OFFER CUM APPOINTMENT LETTER',
    candidateParticularsTitle: 'Candidate Recipient Particulars:',
    labels: {
      candidateName: 'Candidate Name:',
      mobileNo: 'Primary Contact:',
      altMobile: 'Alternate Contact No.',
      email: 'Email Address:',
      address: 'Residential Address:',
      deptDesignation: 'Assigned Department / Designation',
      appointmentDate: 'Effective Date of Joining',
    },
    subject: (designation, companyName) =>
      `Subject: Formal Offer of Employment & Preliminary Contract of Appointment`,
    dearCandidate: (name) => `Dear ${name},`,
    preamble: (designation) =>
      `On behalf of SVI INFRA SOLUTIONS PRIVATE LIMITED (hereinafter referred to as the "Company", "Employer", or "Management"), we are pleased to extend this formal offer of employment to you for the position of "${designation}". This offer is predicated on the representations, academic credentials, and professional competencies demonstrated by you during the evaluation and interview process. Your engagement with the Company shall be strictly governed by the statutory provisions, terms, obligations, and corporate governance covenants enumerated herein below:`,
    clauses: {
      c1Title: '1. Designation, Department & Reporting Matrix',
      c1Text: (designation, department, reportingTo) =>
        `You are appointed to the corporate position of "${designation}" within the ${department} Department. In this capacity, you shall report directly to ${reportingTo}, or such other corporate officer as the Company may designate from time to time. You shall faithfully and diligently perform all duties incidental to your office and comply with all lawful corporate directives.`,
      c2Title: '2. Date of Commencement, Work Location & Mobility',
      c2Text: (location) =>
        `Your principal place of employment shall be situated at ${location}. However, the Company operates across multi-regional jurisdictions; you may be transferred, second-assigned, or deputed to any branch office, project site, subsidiary, or affiliate of the Company within India or abroad at the sole discretion of the Management based on operational imperatives.`,
      c3Title: '3. Remuneration Structure, Performance Slabs & Statutory Deductions',
      c3Text: (salaryCtc, annualCTC, salaryType) =>
        `The Company shall compensate you with a Gross Total Cost to Company (CTC) of INR ${salaryCtc}/- per month (equivalent to an annualized CTC of INR ${annualCTC}/-), payable monthly in arrears subject to applicable statutory deductions, including Tax Deducted at Source (TDS), EPF, Professional Tax, and ESIC where statutorily mandated.`,
      c4Title: '4. Pre-Employment Verification & Statutory Documentation Protocol',
      c4Notice:
        'This offer of employment is strictly conditional upon the submission and successful validation of the mandatory identity, statutory, and background documentation outlined below prior to or upon your formal date of joining:',
      c5Title: '5. Probationary Period, Performance Assessment & Confirmation Protocols',
      c5Text: (probation) =>
        `You shall serve a mandatory probationary period of ${probation} months commencing from your effective Date of Joining. Management shall conduct rigorous periodic evaluations of your professional competence, behavioral conduct, target adherence, and alignment with corporate culture during this term. Management reserves the unfettered right to extend the probationary period by an additional duration if your aggregate performance falls below benchmark thresholds. Your employment shall transition to confirmed status solely upon the issuance of an explicit written Confirmation Letter executed by the Director/HR Department.`,
      c6Title: '6. Working Hours, Weekly Schedule & Mandatory Site Visit Protocols',
      c6Text: (hoursStart, hoursEnd, days, weeklyOff) =>
        `Your official working hours shall span from ${hoursStart} to ${hoursEnd}, operational across ${days}, with designated weekly off on ${weeklyOff}. Given that the Company's core commercial operations center upon real estate infrastructure and client property facilitation, field site visits on weekends (Saturdays and Sundays) and scheduled public holidays constitute an essential, non-negotiable operational function of your designation.`,
      c7Title: '7. Comprehensive Non-Disclosure, Trade Secrets & Data Protection (DPDPA 2023)',
      c7Text:
        'During the tenure of your engagement and in perpetuity following separation, you shall maintain inviolable confidentiality regarding all Proprietary Information, technical blueprints, architectural layouts, corporate investor registries, land banking records, pricing methodologies, customer lists, and financial datasets belonging to the Company. Unauthorized replication, external transmission, or commercial exploitation of such materials shall constitute a material criminal breach of trust, exposing you to injunctive relief and civil/criminal damages under the Information Technology Act, 2000.',
      c8Title: '8. Intellectual Property (IP) Ownership, Inventions & Work-for-Hire Assignment',
      c8Text:
        'All intellectual property, innovations, marketing collateral, software modifications, client pitches, land acquisition models, brand assets, and creative deliverables authored, conceptualized, or developed by you during your employment—whether solely or jointly—shall constitute "work-for-hire" and remain the sole, absolute, and unencumbered property of SVI Infra Solutions Pvt Ltd in perpetuity across all jurisdictions.',
      c9Title: '9. Restrictive Covenants: Non-Solicitation, Lead Protection & Anti-Kickback',
      c9Text:
        'You explicitly covenant that during your employment and for an unbroken duration of twelve (12) calendar months following separation, you shall not, directly or indirectly: (a) solicit, divert, or conduct competitive real estate operations with any active or prospective client of the Company; (b) induce or solicit any employee, consultant, or channel partner to terminate their relationship with the Company; or (c) accept employment, directorship, or advisory roles with direct commercial competitors operating within a 50 km geographic radius of your posting location without prior written consent.',
      c10Title: '10. Performance Benchmarks, Deficiencies & Structured PIP Governance',
      c10Text:
        'The Company operates under stringent performance-driven governance. In the event your quantitative outputs, sales milestones, or operational deliverables deviate negatively from approved Key Performance Indicators (KPIs) for two consecutive billing cycles, Management reserves the right to place you on a formal 30-day Performance Improvement Plan (PIP). Failure to remediate deficiencies and attain designated benchmarks at the conclusion of the PIP shall result in summary termination of employment for cause.',
      c11Title: '11. Transferability, Business Exigencies & Remote Deputation',
      c11Text:
        'In consideration of prevailing commercial dynamics, project expansions, or group restructuring, Management reserves the absolute right to transfer, assign, or second your professional services to any current or future branch office, regional headquarters, subsidiary township project, or corporate affiliate within the territory of India, upon identical contractual terms.',
      c12Title: '12. Termination of Employment, Cash Handling Rules & Summary Dismissal',
      c12Text:
        'Either party may terminate this employment contract by providing written notice of thirty (30) days or base remuneration in lieu thereof. Management reserves the absolute right to terminate your employment forthwith without notice or severance pay in cases of gross misconduct, embezzlement, insubordination, or unexcused absence exceeding three (3) consecutive days. You are strictly and categorically prohibited from accepting, handling, collecting, or soliciting physical cash payments from clients or associates under any circumstances; any breach constitutes immediate summary dismissal and police reporting.',
      c13Title: '13. Indemnification, Statutory Liability & Breach of Duty',
      c13Text:
        'You hereby undertake to indemnify, hold harmless, and defend the Company, its Board of Directors, and officers against all liabilities, claims, fines, regulatory sanctions, and legal costs arising directly or indirectly from your gross negligence, willful misconduct, unauthorized commercial commitments, misrepresentation to clients, or violation of applicable state or federal enactments.',
      c14Title: '14. Governing Law & Dispute Resolution',
      c14Text:
        'This agreement and all rights arising hereunder shall be construed and interpreted in strict accordance with the substantive and procedural laws of the Republic of India. The courts of competent civil and criminal jurisdiction situated at the Company Headquarters location shall exercise exclusive territorial jurisdiction over any disputes, actions, or arbitral proceedings arising out of this contract.',
      c15Title: '15. Entire Agreement, Severability & Execution Mechanics',
      c15Text:
        'This document supersedes all prior oral negotiations, memoranda of understanding, or email representations exchanged between the parties. Should any specific covenant or sub-clause herein be adjudged invalid, void, or unenforceable by an arbitral tribunal or judicial court, such adjudication shall not impair the operational validity of the remaining covenants.',
    },
    salesTerms: {
      policyTitle: 'CRITICAL SALES POLICY & RETENTION PROVISIONS',
      quotaRule: (target, unit) =>
        `Sales Quota Requirement: Monthly target is ${target} ${unit}. Full fixed monthly salary requires 100% quota attainment.`,
      milestoneRule: (pct) =>
        `30% Booking Milestone: Salary disbursements are processed upon verification of client site booking and receipt of minimum ${pct}% payment.`,
      noSaleRule: (months, reducedPct) =>
        `No Sale Provision: Zero plot sales across ${months} consecutive months activates retainership rationalization to ${reducedPct}% base pay or PIP transition.`,
      customSalaryRule: (pct) =>
        `Incubation Staggered Salary: Baseline salary entitlement is set at ${pct}% of standard fixed CTC during the introductory phase.`,
      gracePeriodRule: (months, reducedPct) =>
        `Grace Period Protection: Candidate receives ${months} months ramp-up grace period at ${reducedPct}% retainership before strict quota enforcement.`,
      partialTargetRule: (pct) =>
        `Partial Quota Pro-Rata: Achieving 50%-99% of monthly target unlocks ${pct}% pro-rata retainership release.`,
      clientMeetingsRule: (meetings) =>
        `Mandatory Client Engagements: Minimum of ${meetings} verified physical site visits / client meetings required per month.`,
      conveyanceRule: (amount) =>
        `Conveyance Allowance: Field conveyance allowance of INR ${amount}/- per month provided upon submission of verified visit logs.`,
      siteVisitRule: (schedule) =>
        `Site Visit Schedule: ${schedule}. Mandatory attendance required.`,
    },
    documentation: {
      title: 'Mandatory Pre-Employment Verification Checklist',
      photoTitle: 'Photograph',
      photoDesc: '3 Passport Size Color Photos',
      panTitle: 'Identity & Tax',
      panDesc: 'Copy of PAN Card',
      aadhaarTitle: 'Proof of Address',
      aadhaarDesc: 'Aadhaar Card (Front & Back)',
      eduTitle: 'Academic Credentials',
      eduDesc: '10th, 12th & Degree Certificates',
      expTitle: 'Prior Employment',
      expDesc: 'Relieving / Experience Letter & Pay Slips',
      bgvNotice:
        'Background Verification (BGV) Protocol: Any willful suppression of material facts, falsification of academic credentials, or fraudulent prior experience certificates discovered at any stage of employment shall warrant immediate summary termination without notice, withholding of relieving documents, and initiation of civil recovery proceedings.',
    },
    signatures: {
      sectionTitle: 'EXECUTION, ATTESTATION & ACCEPTANCE',
      employerTitle: 'Issued For and on behalf of Organization:',
      employerDesignation: 'Director & Authorized Signatory',
      candidateTitle: 'Candidate Formal Acceptance & Attestation:',
      candidateAttestation:
        '“I hereby unconditionally accept this offer of employment and agree to abide by all terms, covenants, onboarding documentation requirements via the designated SVI HR Onboarding Desk, and policies outlined herein. I affirm all credentials provided are authentic and truthful.”',
      candidateSignLabel: 'Candidate Signature & Date',
    },
    footer: {
      confidentiality: 'CONFIDENTIAL & PROPRIETARY',
      candidateInitials: 'Candidate Initials:',
      pageOf: (curr, total) => `Page ${curr} of ${total}`,
    },
  },
  hi: {
    docClassification: 'आधिकारिक कॉर्पोरेट नियुक्ति अभिलेख • पूर्णतः निजी एवं गोपनीय',
    refLabel: 'दस्तावेज संदर्भ',
    dateLabel: 'जारी करने की तिथि',
    docTitle: 'प्रस्ताव सह नियुक्ति पत्र',
    candidateParticularsTitle: 'अभ्यर्थी का विवरण एवं पहचान:',
    labels: {
      candidateName: 'अभ्यर्थी का नाम:',
      mobileNo: 'प्राथमिक संपर्क:',
      altMobile: 'वैकल्पिक संपर्क नंबर',
      email: 'ईमेल पता:',
      address: 'स्थायी निवास पता:',
      deptDesignation: 'आवंटित विभाग एवं पदनाम',
      appointmentDate: 'कार्यभार ग्रहण करने की तिथि',
    },
    subject: (designation, companyName) =>
      `"${designation}" के पद हेतु औपचारिक नियुक्ति प्रस्ताव पत्र — ${companyName}`,
    dearCandidate: (name) => `प्रिय ${name},`,
    preamble: (designation) =>
      `एसवीआई इन्फ्रा सॉल्यूशंस प्राइवेट लिमिटेड (जिसे आगे "कंपनी", "नियोक्ता" या "प्रबंधन" कहा गया है) की ओर से, हमें आपको "${designation}" के पद पर नियुक्ति का औपचारिक प्रस्ताव प्रस्तुत करते हुए अत्यंत हर्ष हो रहा है। यह प्रस्ताव मूल्यांकन एवं साक्षात्कार प्रक्रिया के दौरान आपके द्वारा प्रस्तुत विवरणों, शैक्षणिक प्रमाणपत्रों एवं व्यावसायिक दक्षताओं के आधार पर दिया जा रहा है। कंपनी में आपकी नियुक्ति एवं सेवाएं नीचे उल्लिखित वैधानिक प्रावधानों, शर्तों, दायित्वों एवं कॉर्पोरेट आचार संहिता के पूर्णतः अधीन होंगी:`,
    clauses: {
      c1Title: '1. पद, पदनाम एवं संगठनात्मक पदानुक्रम (Designation, Department & Reporting Matrix)',
      c1Text: (designation, department, reportingTo) =>
        `आपकी नियुक्ति ${department} विभाग के अंतर्गत "${designation}" के पद पर की जा रही है। आप संगठनात्मक एवं कार्यात्मक रूप से ${reportingTo} अथवा प्रबंधन द्वारा नामित अन्य वरिष्ठ अधिकारी को रिपोर्ट करेंगे। कंपनी के पास व्यावसायिक आवश्यकताओं एवं परिचालन प्राथमिकताओं के अनुसार आपके कर्तव्यों, रिपोर्टिंग संरचना एवं प्रमुख उत्तरदायित्वों (KRAs) में आवश्यक परिवर्तन करने का पूर्ण अधिकार सुरक्षित है।`,
      c2Title: '2. कार्यभार ग्रहण तिथि, पदस्थापन स्थान एवं गतिशीलता (Work Location & Mobility)',
      c2Text: (location) =>
        `आपका प्राथमिक पदस्थापन स्थान कंपनी के ${location} स्थित कार्यालय में होगा। आप इस बात से सहमत हैं कि आपके कार्यक्षेत्र की आवश्यकताओं के अनुसार आपको प्रोजेक्ट साइट्स, टाउनशिप्स, प्रशासनिक कार्यालयों अथवा सहयोगी संस्थानों में स्थानीय या अंतर-शहरी व्यावसायिक यात्राएं करनी होंगी।`,
      c3Title: '3. पारिश्रमिक संरचना, वेतन स्लैब एवं वैधानिक कटौतियां (Remuneration Structure)',
      c3Text: (salaryCtc, annualCTC, salaryType) => {
        const isInHand = salaryType === 'in_hand' || salaryType === 'In-Hand';
        if (isInHand) {
          return `संतोषजनक कार्य प्रदर्शन एवं कंपनी नीतियों के पालन के अधीन, आप प्रतिमाह कुल ₹${salaryCtc}/- नियत इन-हैंड (Net In-Hand) वेतन के पात्र होंगे। वेतन का भुगतान प्रत्येक आगामी अंग्रेजी कैलेंडर माह की 7वीं तारीख तक सीधे बैंक खाते में किया जाएगा, जिसमें लागू वैधानिक कटौतियां शामिल होंगी।`;
        }
        return `अपने कर्तव्यों के संतोषजनक निर्वहन एवं कंपनी की नीतियों के अनुपालन के अधीन, आप प्रतिमाह कुल ₹${salaryCtc}/- सकल पारिश्रमिक (Gross CTC) के हकदार होंगे, जो कि वार्षिक ₹${annualCTC}/- की समग्र सीटीसी (CTC) के समतुल्य है। वेतन का भुगतान प्रत्येक आगामी अंग्रेजी कैलेंडर माह की 7वीं तारीख तक सीधे बैंक खाते में किया जाएगा। लागू सरकारी नियमों के अनुसार टीडीएस (TDS), प्रोफेशनल टैक्स आदि वैधानिक कटौतियां की जाएंगी।`;
      },
      c4Title:
        '4. पूर्व-रोजगार सत्यापन एवं अनिवार्य दस्तावेज प्रक्रिया (Statutory Documentation Protocol)',
      c4Notice:
        'यह नियुक्ति प्रस्ताव कार्यभार ग्रहण करने की तिथि तक अथवा उससे पूर्व निम्नलिखित अनिवार्य पहचान, शैक्षणिक एवं अनुभव दस्तावेजों के संतोषजनक सत्यापन एवं जमा करने के पूर्णतः अधीन है:',
      c5Title: '5. परिवीक्षा अवधि, मूल्यांकन एवं सेवा पुष्टिकरण (Probation & Confirmation)',
      c5Text: (probation) =>
        `कार्यभार ग्रहण करने की तिथि से आपकी परिवीक्षा अवधि ${probation} माह की होगी। इस दौरान आपके कार्य प्रदर्शन, अनुशासन, लक्ष्य प्राप्ति एवं व्यावसायिक आचरण का नियमित मूल्यांकन किया जाएगा। यदि आपका प्रदर्शन निर्धारित मानकों के अनुरूप नहीं पाया जाता है, तो प्रबंधन को परिवीक्षा अवधि आगे बढ़ाने का अधिकार होगा। आपकी सेवाएं केवल निदेशक/मानव संसाधन विभाग द्वारा लिखित पुष्टिकरण पत्र (Confirmation Letter) जारी होने पर ही नियमित मानी जाएंगी।`,
      c6Title: '6. कार्य समय, साप्ताहिक अनुसूची एवं स्थल भ्रमण नियम (Working Hours & Site Visits)',
      c6Text: (hoursStart, hoursEnd, days, weeklyOff) =>
        `आपके आधिकारिक कार्य के घंटे ${hoursStart} से ${hoursEnd} तक होंगे, जो ${days} के दौरान प्रभावी रहेंगे, तथा आपका साप्ताहिक अवकाश ${weeklyOff} को होगा। रियल एस्टेट और टाउनशिप प्रोजेक्ट्स के संचालन को देखते हुए, सप्ताहांत (शनिवार व रविवार) एवं निर्धारित दिनों में ग्राहकों के साथ साइट विजिट्स (स्थल भ्रमण) करना आपके पद का एक अनिवार्य एवं अभिन्न अंग है।`,
      c7Title: '7. गोपनीयता, व्यापारिक रहस्य एवं डेटा सुरक्षा (DPDPA 2023)',
      c7Text:
        'सेवाकाल के दौरान एवं सेवामुक्ति के पश्चात भी, आप कंपनी की सभी गोपनीय जानकारियों, ग्राहकों की सूची, प्रोजेक्ट ब्लू-प्रिंट, वित्तीय डेटा, भूमि बैंक रिकॉर्ड एवं मूल्य निर्धारण रणनीतियों को पूर्णतः गोपनीय रखेंगे। किसी भी अनधिकृत प्रसार या व्यावसायिक दुरुपयोग की स्थिति में सूचना प्रौद्योगिकी अधिनियम (IT Act, 2000) एवं अन्य लागू कानूनों के तहत कानूनी एवं दंडात्मक कार्रवाई की जाएगी।',
      c8Title: '8. बौद्धिक संपदा (IP) स्वामित्व एवं अधिकार (Work-for-Hire)',
      c8Text:
        'सेवाकाल के दौरान आपके द्वारा तैयार की गई सभी विपणन सामग्री, रणनीतियां, सॉफ्टवेयर कोड, प्रोजेक्ट प्रेजेंटेशन एवं ब्रांड संपत्तियां कंपनी की अनन्य एवं स्थायी बौद्धिक संपदा ("Work-for-Hire") रहेंगी, जिस पर पूर्ण एवं अनंतिम स्वामित्व केवल एसवीआई इन्फ्रा सॉल्यूशंस प्रा. लि. का होगा।',
      c9Title: '9. गैर-प्रतिस्पर्धा, गैर-याचना एवं हितों का टकराव (Restrictive Covenants)',
      c9Text:
        'सेवाकाल के दौरान एवं सेवा समाप्ति के उपरांत आगामी बारह (12) माह तक, आप प्रत्यक्ष या अप्रत्यक्ष रूप से: (क) कंपनी के किसी ग्राहक या निवेशक को प्रतिस्पर्धी व्यावसायिक गतिविधियों हेतु आकर्षित नहीं करेंगे; (ख) कंपनी के कर्मचारियों या सहयोगियों को कार्य छोड़ने हेतु प्रेरित नहीं करेंगे; और (ग) कार्यस्थल के 50 किमी के दायरे में किसी प्रत्यक्ष प्रतिस्पर्धी संस्थान में प्रबंधन की पूर्व लिखित अनुमति के बिना कार्य नहीं करेंगे।',
      c10Title: '10. कार्य निष्पादन मानक एवं संरचित सुधार योजना (PIP)',
      c10Text:
        'कंपनी परिणामोन्मुख कार्यप्रणाली का पालन करती है। यदि लगातार दो बिलिंग चक्रों में आपका प्रदर्शन निर्धारित बिक्री या कार्य लक्ष्यों (KPIs) से कम रहता है, तो प्रबंधन आपको 30-दिवसीय परफॉर्मेंस इम्प्रूवमेंट प्लान (PIP) में शामिल कर सकता है। इस अवधि में संतोषजनक सुधार न होने पर सेवाएं समाप्त की जा सकेंगी।',
      c11Title: '11. स्थानांतरण, व्यावसायिक अनिवार्यता एवं प्रतिनियुक्ति',
      c11Text:
        'व्यावसायिक विस्तार एवं प्रशासनिक आवश्यकताओं के तहत, प्रबंधन को आपके पद एवं वेतन की समान शर्तों पर भारत स्थित कंपनी की किसी भी अन्य शाखा, क्षेत्रीय कार्यालय, टाउनशिप प्रोजेक्ट अथवा सहयोगी कंपनी में आपका स्थानांतरण या प्रतिनियुक्ति करने का पूर्ण अधिकार है।',
      c12Title: '12. सेवा समाप्ति, नकद लेनदेन निषेध एवं अनुशासनात्मक निष्कासन',
      c12Text:
        'दोनों पक्षों में से कोई भी पक्ष तीस (30) दिन का लिखित नोटिस देकर अथवा उसके एवज में वेतन देकर यह अनुबंध समाप्त कर सकता है। गंभीर कदाचार, गबन, अनुशासनहीनता अथवा बिना सूचना तीन दिन से अधिक अनुपस्थित रहने पर बिना किसी नोटिस या क्षतिपूर्ति के तत्काल प्रभाव से सेवा समाप्त की जा सकेगी। किसी भी परिस्थिति में ग्राहकों से नकद धनराशि लेना पूर्णतः प्रतिबंधित है; उल्लंघन पर आपराधिक मामला दर्ज कराया जाएगा।',
      c13Title: '13. क्षतिपूर्ति, वैधानिक दायित्व एवं कर्तव्य उल्लंघन',
      c13Text:
        'आप अपने द्वारा की गई किसी भी गंभीर लापरवाही, अनधिकृत वादे, गलत बयानी या नियमों के उल्लंघन से कंपनी, उसके निदेशकों एवं अधिकारियों को होने वाले वित्तीय या विधिक नुकसान की संपूर्ण भरपाई एवं क्षतिपूर्ति करने के लिए व्यक्तिगत रूप से उत्तरदायी होंगे।',
      c14Title: '14. लागू कानून एवं विवाद निवारण (Governing Law & Dispute Resolution)',
      c14Text:
        'यह अनुबंध भारत गणराज्य के विधायी नियमों के अनुसार शासित एवं व्याख्यायित होगा। इस अनुबंध से उत्पन्न किसी भी विधिक विवाद की स्थिति में कंपनी के प्रधान कार्यालय के अधिकार क्षेत्र वाले न्यायालयों को ही अनन्य न्यायिक क्षेत्राधिकार प्राप्त होगा।',
      c15Title: '15. संपूर्ण समझौता, पृथक्करणीयता एवं निष्पादन',
      c15Text:
        'यह दस्तावेज पूर्व के सभी मौखिक विचार-विमर्शों, ईमेल पत्राचार अथवा ज्ञापनों को निष्प्रभावी करते हुए पक्षों के मध्य अंतिम एवं संपूर्ण समझौते का गठन करता है। यदि किसी धारा को सक्षम न्यायालय द्वारा अवैध घोषित किया जाता है, तो शेष सभी धाराएं पूर्णतः प्रभावी रहेंगी।',
    },
    salesTerms: {
      policyTitle: 'महत्वपूर्ण बिक्री नीति एवं पारिश्रमिक शर्तें',
      quotaRule: (target, unit) =>
        `बिक्री लक्ष्य: न्यूनतम मासिक लक्ष्य ${target} ${unit} है। पूर्ण मासिक वेतन प्राप्ति हेतु 100% लक्ष्य पूर्ति अनिवार्य है।`,
      milestoneRule: (pct) =>
        `30% बुकिंग माइलस्टोन: क्लाइंट बुकिंग सत्यापन एवं न्यूनतम ${pct}% राशि जमा होने के पश्चात ही पारिश्रमिक प्रोसेस किया जाएगा।`,
      noSaleRule: (months, reducedPct) =>
        `बिक्री न होने पर प्रावधान: लगातार ${months} माह तक कोई बिक्री न होने पर पारिश्रमिक को घटाकर ${reducedPct}% आधार वेतन कर दिया जाएगा अथवा PIP लागू होगा।`,
      customSalaryRule: (pct) =>
        `प्रारंभिक चरण वेतन: परिचयात्मक/प्रशिक्षण अवधि के दौरान निर्धारित सीटीसी का ${pct}% वेतन देय होगा।`,
      gracePeriodRule: (months, reducedPct) =>
        `रियायती अवधि सुरक्षा: उम्मीदवार को सख्त लक्ष्य लागू होने से पूर्व ${months} माह की रियायत अवधि ${reducedPct}% वेतन के साथ प्रदान की जाएगी।`,
      partialTargetRule: (pct) =>
        `आंशिक लक्ष्य अनुपात: मासिक लक्ष्य का 50%-99% प्राप्त करने पर ${pct}% आनुपातिक वेतन देय होगा।`,
      clientMeetingsRule: (meetings) =>
        `अनिवार्य ग्राहक बैठकें: प्रतिमाह कम से कम ${meetings} सत्यापित स्थल भ्रमण (साइट विजिट) या ग्राहक बैठकें अनिवार्य हैं।`,
      conveyanceRule: (amount) =>
        `यात्रा भत्ता: सत्यापित विज़िट लॉग प्रस्तुत करने पर प्रतिमाह ₹${amount}/- क्षेत्र भ्रमण भत्ता देय होगा।`,
      siteVisitRule: (schedule) => `साइट विजिट अनुसूची: ${schedule}। उपस्थिति अनिवार्य है।`,
    },
    documentation: {
      title: 'अनिवार्य पूर्व-रोजगार दस्तावेज सूची',
      photoTitle: 'पासपोर्ट फोटो',
      photoDesc: '3 पासपोर्ट आकार के रंगीन फोटो',
      panTitle: 'पहचान एवं कर',
      panDesc: 'पैन कार्ड (PAN Card) की प्रति',
      aadhaarTitle: 'निवास प्रमाण',
      aadhaarDesc: 'आधार कार्ड (दोनों तरफ)',
      eduTitle: 'शैक्षणिक योग्यता',
      eduDesc: '10वीं, 12वीं एवं स्नातक/डिप्लोमा अंकतालिकाएं',
      expTitle: 'पूर्व कार्यानुभव',
      expDesc: 'रिलीविंग/अनुभव पत्र एवं वेतन पर्चियां',
      bgvNotice:
        'पृष्ठभूमि सत्यापन (BGV) नीति: किसी भी स्तर पर दस्तावेजों में हेरफेर, शैक्षणिक योग्यता की गलत जानकारी अथवा असत्य अनुभव पत्र पाए जाने पर बिना किसी पूर्व सूचना के तत्काल सेवा समाप्ति की जाएगी एवं कानूनी कार्रवाई की जाएगी।',
    },
    signatures: {
      sectionTitle: 'निष्पादन, सत्यापन एवं स्वीकृति',
      employerTitle: 'संस्थान की ओर से एवं उनके निमित्त:',
      employerDesignation: 'निदेशक एवं अधिकृत हस्ताक्षरकर्ता',
      candidateTitle: 'अभ्यर्थी द्वारा औपचारिक स्वीकृति एवं शपथ:',
      candidateAttestation:
        '“मैं एतद्द्वारा इस नियुक्ति प्रस्ताव को स्वीकार करता/करती हूं तथा इसमें उल्लिखित सभी नियमों, शर्तों, नीतियों एवं एसवीआई एचआर डेस्क पर आवश्यक दस्तावेज जमा करने की प्रक्रिया का पूर्ण पालन करने की वचनबद्धता देता/देती हूं। मेरे द्वारा दी गई सभी जानकारियां सत्य व प्रमाणिक हैं।”',
      candidateSignLabel: 'अभ्यर्थी के हस्ताक्षर एवं दिनांक',
    },
    footer: {
      confidentiality: 'गोपनीय एवं सर्वाधिकार सुरक्षित',
      candidateInitials: 'अभ्यर्थी के आद्यक्षर:',
      pageOf: (curr, total) => `पृष्ठ ${curr} / ${total}`,
    },
  },
};
