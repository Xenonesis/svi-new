import type { BBALegalContext } from './types';
import { BbaPageFooterHindi } from './BbaPageFooterHindi';

const getProjectLocation = (projectName: string) => {
  if (projectName?.toLowerCase().includes('shivani vatika')) {
    return 'Village Harsoli, Tehsil Renwal, District Jaipur, State – Rajasthan';
  }
  return 'Village Basadi Tehsil Kishan Garh Renwal, Dist. Jaipur, State – Rajasthan';
};

const getProjectCity = (projectName: string) => {
  return 'JAIPUR, RAJASTHAN';
};

/**
 * Second page block of the BBA legal preview: title + party identification
 * (Builder / 1st Allottee / 2nd Allottee / 3rd Allottee / Firm / Company)
 * and the Firm's representation recitals.
 */
export function PartiesAndRecitalsPageHindi({ formData, companyInfo }: BBALegalContext) {
  return (
    <>
      <div
        style={{
          pageBreakBefore: 'always',
          paddingTop: '2rem',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '257mm',
        }}
      >
        <p className="mb-2 text-left text-[13px] font-bold underline">
          Note: Please fill the BBA form completely in capital letters.
        </p>
        <p className="mb-2 text-justify text-[13px] leading-relaxed">
          The Allottee(s) hereby agrees and confirms to have read, understood and accepted all the
          terms and conditions of this Agreement including the Annexures appended hereto and the
          Allottee(s) hereby agrees and confirms that the Allottee(s) has entered into this
          Agreement with the firm with full knowledge and consent.
        </p>
        <p className="mb-2 text-justify text-[13px] leading-relaxed">
          The Allottee(s) acknowledges that this Agreement has been explained to the Allottee(s) in
          the language understood by the Allottee(s) and the Allottee(s) has fully understood the
          contents of this Agreement.
        </p>
        <p className="mb-2 text-justify text-[13px] leading-relaxed">
          The Allottee(s) hereby agrees and confirms that the Allottee(s) has verified the title of
          the firm in respect of the Said Land and the Said Complex and is satisfied with the same.
        </p>
        <p className="mb-2 text-center text-lg font-bold uppercase">
          "{formData?.projectName?.toUpperCase() || 'SHYAM AANGAN'}"
        </p>
        <p className="mb-2 text-center text-sm font-bold uppercase">
          {getProjectCity(formData?.projectName)}
        </p>
        <p className="mb-2 text-center text-xl font-bold underline">BUILDER-BUYER AGREEMENT</p>
        <p className="mb-2 text-justify text-[13px] leading-relaxed">
          This Builder Buyer Agreement (hereinafter referred to as the &apos;
          <strong>Agreement</strong>
          &apos;) is executed on this{' '}
          <strong>
            {new Date(formData.bookingDate || Date.now()).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </strong>
          .
        </p>
        <p className="my-2 text-center text-lg font-bold">BY AND BETWEEN</p>
        <p className="mb-2 text-justify text-[13px] leading-relaxed">
          <strong>M/s. SVI INFRA SOLUTIONS PVT LTD,</strong> firm presently having its Registered
          office at <strong>{companyInfo.company_address}</strong> and Corporate Office at{' '}
          <strong>{companyInfo.company_address}</strong> represented by its Authorized Signatory Mr.
          Vineet Narnawat, Director, aged about 43 years, S/o Sh. Ramesh Chand Narnawat, R/o H. No.
          162, VPO-Badhal, Th.-Chomu, Dist. Jaipur, Rajasthan (hereinafter referred to as the &apos;
          <strong>Firm / Builder / First Party</strong>&apos; which expression shall unless
          repugnant to the context, include its successors, executors, administrators,
          representatives, nominees, assigns, heirs, legal representatives, etc.) of the{' '}
          <strong>FIRST PART</strong>;
        </p>
        <p className="my-3 text-center text-[13px] font-bold">AND</p>
        <p className="mb-0 text-[13px]">(FOR INDIVIDUALS)</p>
        <p className="mb-2 text-[13px]">1st ALLOTTEE</p>
        <p className="mb-1 text-[13px]">
          <strong>Name:</strong> {formData.salutation ? `${formData.salutation}. ` : ''}
          {formData.clientName}
        </p>
        <p className="mb-1 text-[13px]">
          <strong>S/o, D/o, W/o:</strong> {formData.fatherName || '______________________'}
        </p>
        <p className="mb-1 text-[13px]">
          <strong>Age:</strong> {formData.age ? `${formData.age} years` : '_______ years'}
        </p>
        <p className="mb-1 text-[13px] font-bold">Permanent Address:</p>
        <p className="mb-1 text-[13px]">
          {formData.addressLine1 || formData.address}
          {formData.addressLine2 ? `, ${formData.addressLine2}` : ''}
        </p>
        <p className="mb-1 text-[13px] font-bold">
          {[formData.city, formData.state, formData.pincode].filter(Boolean).join(', ')}
        </p>
        <p className="my-3 text-center text-[13px] font-bold">AND</p>

        <p className="mb-1 text-[13px] font-bold">2nd ALLOTTEE</p>
        <p className="mb-1 text-[13px]">
          <strong>Name:</strong> ______________________
        </p>
        <p className="mb-1 text-[13px]">
          <strong>S/o, D/o, W/o:</strong> ______________________
        </p>
        <p className="mb-1 text-[13px]">
          <strong>Age:</strong> _______ years
        </p>
        <p className="mb-2 text-[13px]">
          <strong>Address:</strong> ______________________
        </p>
        <p className="my-3 text-center text-[13px] font-bold">AND</p>
        <p className="mb-1 text-[13px] font-bold">3rd ALLOTTEE</p>
        <p className="mb-1 text-[13px]">
          <strong>Name:</strong> ______________________
        </p>
        <p className="mb-1 text-[13px]">
          <strong>S/o, D/o, W/o:</strong> ______________________
        </p>
        <p className="mb-1 text-[13px]">
          <strong>Age:</strong> _______ years
        </p>
        <p className="mb-2 text-[13px] font-bold">OR</p>
        <p className="mb-1 text-[13px] font-bold">(FOR FIRMS)</p>
        <p className="mb-1 text-[13px]">
          <strong>M/s.</strong> ______________________
        </p>
        <p className="mb-1 text-[13px]">
          <strong>Through its Proprietor / Partner:</strong> ______________________
        </p>
        <p className="mb-1 text-[13px]">
          <strong>Address:</strong> ______________________
        </p>
        <p className="mb-2 text-[13px] font-bold">OR</p>
        <p className="mb-1 text-[13px] font-bold">(FOR COMPANIES)</p>
        <p className="mb-1 text-[13px]">
          <strong>M/s.</strong> ______________________
        </p>
        <p className="mb-1 text-[13px]">
          <strong>Through its Director / Authorised Signatory:</strong> ______________________
        </p>
        <p className="mb-1 text-[13px]">
          <strong>Address:</strong> ______________________
        </p>
        <p className="mb-2 text-[13px]">(hereinafter referred to as the &apos;Allottee(s)&apos;)</p>
        <p className="mb-2 text-justify text-[13px] leading-relaxed">
          The party of the FIRST PART and the party of the SECOND PART shall be individually
          referred to as the &apos;<strong>Party</strong>&apos; and collectively referred to as the
          &apos;<strong>Parties</strong>&apos;.
        </p>
        <p className="mb-2 text-[13px] font-bold">Firms Representation</p>
        <p className="mb-2 text-justify text-[13px] leading-relaxed">
          <strong>WHEREAS</strong> the firm is bona fide purchaser of the land bearing &quot;
          {formData?.projectName?.toUpperCase() || 'SHYAM AANGAN'}&quot;,{' '}
          {getProjectLocation(formData?.projectName)}
          (hereinafter referred to as the &apos;<strong>Said Land</strong>&apos;).
        </p>
        <p className="mb-2 text-justify text-[13px] leading-relaxed">
          <strong>AND WHEREAS</strong> it is clarified that the firm has not intended to convey
          right or interest in any of the land falling outside the Said Building / Said Complex /
          Said Land and no impression of any kind has been given with regard to the constructions
          that may take place on the land outside the Said Land.
        </p>
        <BbaPageFooterHindi companyInfo={companyInfo} />
      </div>
    </>
  );
}
